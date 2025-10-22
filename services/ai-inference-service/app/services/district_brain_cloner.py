"""
District-Aware Brain Cloning Service.

When a learner is created, clones the base brain with district-specific curriculum context.
"""

import logging
from typing import Dict, Any, Optional, List
import json
from datetime import datetime
from sqlalchemy.orm import Session

from app.models.brain_instance import BrainInstance, LearningProfile, BrainStatus
from app.core.brain_manager import brain_manager

logger = logging.getLogger(__name__)


class DistrictBrainCloner:
    """
    Clone base brain with district-specific curriculum knowledge.
    
    Process:
    1. Identify learner's school district
    2. Load district's curriculum standards
    3. Clone base brain
    4. Inject district-specific context
    5. Initialize with local terminology and pacing
    """
    
    def __init__(self, curriculum_db: Session):
        self.curriculum_db = curriculum_db
    
    async def clone_brain_for_learner(
        self,
        learner_id: str,
        learning_profile: LearningProfile,
        location_data: Dict[str, Any]
    ) -> BrainInstance:
        """
        Clone district-aware brain for learner.
        
        Args:
            learner_id: Unique learner identifier
            learning_profile: Learner's educational profile
            location_data: {
                "postal_code": "90001",
                "school_name": "MLK Middle School",
                "district_id": "uuid-of-district" (optional)
            }
            
        Returns:
            BrainInstance with district curriculum context
        """
        logger.info(f"Cloning brain for learner {learner_id}")
        
        # Step 1: Identify school district
        district = await self._identify_district(location_data)
        
        if not district:
            logger.warning(
                f"Could not identify district for learner {learner_id}, using general brain"
            )
            # Fall back to general brain without district context
            return await brain_manager.get_or_create_brain(learner_id, learning_profile)
        
        logger.info(f"Identified district: {district['name']} ({district['id']})")
        
        # Step 2: Load district curriculum
        curriculum_context = await self._load_district_curriculum(
            district_id=district['id'],
            grade_level=learning_profile.grade_level
        )
        
        # Step 3: Get or create district brain template
        district_brain_template = await self._get_district_brain_template(district['id'])
        
        # Step 4: Clone base brain with district context
        brain = await self._clone_with_district_context(
            learner_id=learner_id,
            learning_profile=learning_profile,
            district=district,
            curriculum_context=curriculum_context,
            district_template=district_brain_template
        )
        
        logger.info(
            f"✅ Created district-aware brain {brain.brain_id} for {district['name']}"
        )
        
        return brain
    
    async def _identify_district(
        self,
        location_data: Dict[str, Any]
    ) -> Optional[Dict[str, Any]]:
        """
        Identify school district from location data.
        
        Priority:
        1. district_id (if provided directly)
        2. school_name lookup
        3. postal_code lookup
        4. coordinates (lat/lng)
        """
        from app.models.curriculum import SchoolDistrict
        
        # Method 1: Direct district ID
        if location_data.get("district_id"):
            district = self.curriculum_db.query(SchoolDistrict).filter(
                SchoolDistrict.id == location_data["district_id"]
            ).first()
            
            if district:
                return self._district_to_dict(district)
        
        # Method 2: Postal code lookup
        if location_data.get("postal_code"):
            district = self.curriculum_db.query(SchoolDistrict).filter(
                SchoolDistrict.postal_codes.contains([location_data["postal_code"]])
            ).first()
            
            if district:
                logger.info(
                    f"Found district via postal code: {location_data['postal_code']}"
                )
                return self._district_to_dict(district)
        
        # Method 3: School name lookup
        if location_data.get("school_name"):
            # In production: Query schools table
            # For now: Search district names
            district = self.curriculum_db.query(SchoolDistrict).filter(
                SchoolDistrict.name.ilike(f"%{location_data['school_name']}%")
            ).first()
            
            if district:
                logger.info(
                    f"Found district via school name: {location_data['school_name']}"
                )
                return self._district_to_dict(district)
        
        # Method 4: Geocoding (if coordinates provided)
        if location_data.get("latitude") and location_data.get("longitude"):
            # In production: Use PostGIS to find nearest district
            pass
        
        logger.warning(f"Could not identify district from: {location_data}")
        return None
    
    def _district_to_dict(self, district) -> Dict[str, Any]:
        """Convert district model to dict."""
        return {
            "id": str(district.id),
            "name": district.name,
            "country_code": district.country_code,
            "state_province": district.state_province,
            "standards_followed": district.standards_followed,
            "curriculum_version": district.curriculum_version
        }
    
    async def _load_district_curriculum(
        self,
        district_id: str,
        grade_level: int
    ) -> Dict[str, Any]:
        """
        Load district's curriculum for specific grade.
        
        Returns:
            {
                "standards": [...],  # List of standard codes
                "pacing": {...},     # When standards are taught
                "terminology": {...}, # District-specific terms
                "resources": [...]   # Approved resources
            }
        """
        from app.models.curriculum import DistrictStandards, EducationalStandard
        
        # Get district standards
        district_standards = self.curriculum_db.query(DistrictStandards).filter(
            DistrictStandards.district_id == district_id,
            DistrictStandards.active == True  # noqa: E712
        ).all()
        
        # Load full standard details
        standards = []
        for ds in district_standards:
            standard = self.curriculum_db.query(EducationalStandard).filter(
                EducationalStandard.id == ds.standard_id,
                EducationalStandard.grade_level == grade_level
            ).first()
            
            if standard:
                standards.append({
                    "code": standard.code,
                    "description": standard.description,
                    "subject": standard.subject,
                    "domain": standard.domain,
                    "emphasis": ds.emphasis_level,
                    "pacing": ds.pacing_guide
                })
        
        logger.info(f"Loaded {len(standards)} standards for grade {grade_level}")
        
        return {
            "standards": standards,
            "pacing": self._build_pacing_calendar(district_standards),
            "terminology": self._load_district_terminology(district_id),
            "resources": []  # TODO: Load district-approved resources
        }
    
    def _build_pacing_calendar(
        self,
        district_standards: List
    ) -> Dict[str, List[str]]:
        """
        Build pacing calendar showing when standards are taught.
        
        Returns:
            {
                "quarter_1": ["CCSS.MATH.6.RP.A.1", ...],
                "quarter_2": [...],
                ...
            }
        """
        pacing = {
            "quarter_1": [],
            "quarter_2": [],
            "quarter_3": [],
            "quarter_4": []
        }
        
        for ds in district_standards:
            if ds.pacing_guide:
                quarter = ds.pacing_guide.get("quarter", "quarter_1")
                # Get the standard code
                # In production: join with standard table
                pacing[quarter].append(str(ds.standard_id))
        
        return pacing
    
    def _load_district_terminology(
        self,
        district_id: str
    ) -> Dict[str, str]:
        """
        Load district-specific terminology.
        
        Example:
        - "Math" vs "Mathematics"
        - "ELA" vs "Language Arts" vs "English"
        - Local program names
        """
        # In production: Load from database
        # For now: Return empty dict
        return {}
    
    async def _get_district_brain_template(
        self,
        district_id: str
    ) -> Optional[Dict[str, Any]]:
        """
        Get or create district brain template.
        
        District brain template is a pre-configured brain instance
        that already has the district's curriculum loaded.
        
        Individual learner brains clone from this template.
        """
        from app.models.curriculum import DistrictBrainInstance
        
        # Check if template exists
        template = self.curriculum_db.query(DistrictBrainInstance).filter(
            DistrictBrainInstance.district_id == district_id,
            DistrictBrainInstance.status == 'active'
        ).first()
        
        if template:
            logger.info(f"Found existing district brain template: {template.brain_id}")
            return {
                "brain_id": template.brain_id,
                "curriculum_standards": template.curriculum_standards,
                "pacing_calendar": template.pacing_calendar,
                "local_terminology": template.local_terminology
            }
        
        # Template doesn't exist, create it
        logger.info(f"Creating new district brain template for district {district_id}")
        
        # In production: Actually create and train district-specific brain
        # For now: Return placeholder
        return None
    
    async def _clone_with_district_context(
        self,
        learner_id: str,
        learning_profile: LearningProfile,
        district: Dict[str, Any],
        curriculum_context: Dict[str, Any],
        district_template: Optional[Dict[str, Any]]
    ) -> BrainInstance:
        """
        Clone brain with full district context.
        
        The cloned brain will:
        - Know the district's curriculum standards
        - Use district-specific terminology
        - Follow district pacing
        - Align responses to local assessments
        """
        # Create base brain
        brain = await brain_manager.get_or_create_brain(
            learner_id=learner_id,
            learning_profile=learning_profile
        )
        
        # Inject district context into adaptation state
        brain.adaptation_state["district_context"] = {
            "district_id": district["id"],
            "district_name": district["name"],
            "standards": [s["code"] for s in curriculum_context["standards"]],
            "pacing_calendar": curriculum_context["pacing"],
            "terminology": curriculum_context["terminology"],
            "current_quarter": self._get_current_quarter(),
            "current_standards": self._get_current_standards(
                curriculum_context["pacing"],
                self._get_current_quarter()
            )
        }
        
        # Update brain status
        brain.status = BrainStatus.ACTIVE
        
        # Save to cache
        brain_manager._save_to_cache(brain)
        
        logger.info(
            f"Injected district context for {district['name']} into brain {brain.brain_id}"
        )
        
        return brain
    
    def _get_current_quarter(self) -> str:
        """
        Determine current academic quarter.
        
        Based on current date (UTC).
        """
        now = datetime.utcnow()
        month = now.month
        
        # US academic calendar (approximate)
        # Q1: Aug-Oct, Q2: Nov-Jan, Q3: Feb-Mar, Q4: Apr-Jun
        if 8 <= month <= 10:
            return "quarter_1"
        elif 11 <= month or month == 1:
            return "quarter_2"
        elif 2 <= month <= 3:
            return "quarter_3"
        else:
            return "quarter_4"
    
    def _get_current_standards(
        self,
        pacing: Dict[str, List[str]],
        quarter: str
    ) -> List[str]:
        """Get standards being taught in current quarter."""
        return pacing.get(quarter, [])


class DistrictContextInjector:
    """
    Injects district context into AI prompts.
    
    When generating hints/explanations, adds district-specific context
    so responses align with what's being taught locally.
    """
    
    @staticmethod
    def inject_district_context(
        prompt: str,
        brain: BrainInstance
    ) -> str:
        """
        Add district context to prompt.
        
        Example injection:
        "The student is in {district_name} and is currently learning
        standards {current_standards} this quarter. Use terminology
        and examples appropriate for this district."
        """
        district_context = brain.adaptation_state.get("district_context")
        
        if not district_context:
            return prompt
        
        current_standards = district_context.get('current_standards', [])[:5]
        context_addition = f"""

DISTRICT CONTEXT:
- District: {district_context['district_name']}
- Current Quarter: {district_context['current_quarter']}
- Active Standards: {', '.join(current_standards)}
- Use district-appropriate terminology and examples
"""
        
        return prompt + context_addition
    
    @staticmethod
    def get_district_standards_for_grade(
        brain: BrainInstance,
        subject: str
    ) -> List[str]:
        """Get relevant standards for current grade/subject/quarter."""
        district_context = brain.adaptation_state.get("district_context", {})
        current_standards = district_context.get("current_standards", [])
        
        # Filter by subject
        # In production: Actually filter standard codes by subject
        return current_standards


# Integration with existing hint generator
from app.services.hint_generator import HintGenerator as BaseHintGenerator


class DistrictAwareHintGenerator(BaseHintGenerator):
    """Enhanced hint generator with district awareness."""
    
    async def generate_hint(
        self,
        brain: BrainInstance,
        problem_context: Dict[str, Any],
        student_question: Optional[str] = None,
        hints_given: int = 0
    ) -> str:
        """Generate hint with district context."""
        
        # Build base prompt
        prompt = self._build_hint_prompt(
            brain=brain,
            problem_context=problem_context,
            student_question=student_question,
            hints_given=hints_given
        )
        
        # Inject district context
        district_prompt = DistrictContextInjector.inject_district_context(
            prompt=prompt,
            brain=brain
        )
        
        # Generate with district-aware prompt
        generation_params = self._get_generation_params(brain)
        hint = await self.inference_engine.generate(
            prompt=district_prompt,
            **generation_params
        )
        
        return hint
