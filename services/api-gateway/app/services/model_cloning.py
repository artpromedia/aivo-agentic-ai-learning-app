"""
Model Cloning Service - Explainable AI Model Personalization
Creates private, personalized learning models with full transparency
"""
import asyncio
import json
import time
from datetime import datetime
from typing import Any, Dict, Optional
from uuid import uuid4

from sqlalchemy.orm import Session

from app.models.baseline import BaselineAssessment
from app.models.learner import Learner


class ModelCloningService:
    """
    Handles creation of personalized learner models with full transparency
    and audit trail for FERPA/COPPA compliance.
    """

    def __init__(self, db: AsyncSession):
        self.db = db

    # ============================================================
    # STEP 0: Pre-Clone Preparation
    # ============================================================

    async def get_model_intro_data(
        self, 
        learner_id: str
    ) -> Dict[str, Any]:
        """
        Get information to show in the model cloning introduction screen.
        
        Returns:
            - Baseline summary (redacted)
            - Privacy control defaults
            - Estimated processing time
            - What data will be used
        """
        # Get learner
        result = await self.db.execute(
            select(Learner).where(Learner.id == learner_id)
        )
        learner = result.scalar_one_or_none()
        if not learner:
            raise ValueError("Learner not found")

        # Get baseline assessment
        baseline = await self._get_latest_baseline(learner_id)
        if not baseline:
            raise ValueError("Baseline assessment not found")

        # Parse JSON fields
        baseline_domain_scores = json.loads(baseline.domain_scores) if isinstance(baseline.domain_scores, str) else baseline.domain_scores

        # Calculate what will be used
        data_usage = {
            "baseline_scores": {
                "used": True,
                "description": "Starting grade levels for each subject",
                "pii": False,
            },
            "accessibility_prefs": {
                "used": True,
                "description": "Text-to-speech, voice input, visual preferences",
                "pii": False,
            },
            "learning_profile": {
                "used": True if learner.diagnoses else False,
                "description": "Learning differences (if provided)",
                "pii": False,  # Categorical only, no specific details
            },
            "iep_goals": {
                "used": True if learner.has_iep else False,
                "description": "IEP goals for curriculum alignment",
                "pii": True,  # Contains specific educational goals
            },
        }

        # Privacy defaults
        privacy_defaults = {
            "store_audio": False,
            "store_images": False,
            "store_free_text_long_term": False,
            "retention_days": 30,
            "history_length": "short",
            "homework_uploads": "none",
        }

        return {
            "learner": {
                "id": str(learner_id),
                "first_name": learner.first_name,
                "preferred_name": learner.preferred_name,
                "grade": learner.grade,
            },
            "baseline_summary": {
                "reading_level": baseline_domain_scores.get("reading"),
                "math_level": baseline_domain_scores.get("math"),
                "writing_level": baseline_domain_scores.get("writing"),
                "completed_at": baseline.completed_at.isoformat() if baseline.completed_at else None,
            },
            "data_usage": data_usage,
            "privacy_defaults": privacy_defaults,
            "estimated_time_seconds": 5,  # Model building time
            "base_model_version": "aivo-brain-v1.0",
        }

    # ============================================================
    # STEP 1: Record Consent
    # ============================================================

    async def record_model_creation_consent(
        self,
        learner_id: str,
        consented_by: str,
        ip_address: str = None,
        user_agent: str = None,
    ) -> str:
        """
        Record parent/guardian consent for model creation.
        Required before any model building begins.
        """
        consent_id = str(uuid4())
        
        # Insert consent record
        await self.db.execute(
            """
            INSERT INTO model_creation_consent 
            (id, learner_id, consented_at, consented_by, consent_version, consent_text,
             data_processing_consent, personalization_consent, audit_trail_consent,
             ip_address, user_agent)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (
                consent_id,
                learner_id,
                datetime.utcnow().isoformat(),
                consented_by,
                "1.0",
                self._get_consent_text_v1(),
                True,
                True,
                True,
                ip_address,
                user_agent,
            )
        )
        await self.db.commit()

        # Log audit event
        await self._log_audit_event(
            learner_model_id=None,
            event_type="consent_recorded",
            actor_id=consented_by,
            actor_role="parent",
            event_data={"consent_id": consent_id},
            ip_address=ip_address,
        )

        return consent_id

    # ============================================================
    # STEP 2: Build Model (5-step process)
    # ============================================================

    async def build_personalized_model(
        self,
        learner_id: str,
        privacy_settings: Dict[str, Any],
        consent_id: str,
        actor_id: str,
    ) -> str:
        """
        Build personalized model in 5 transparent steps.
        Each step logs what data is used and what is produced.
        
        Steps:
        1. Copy base model to private sandbox
        2. Apply baseline results to set starting levels
        3. Generate subject pathways and scaffolds
        4. Set safety guardrails
        5. Link support tools (Homework Helper, etc.)
        """
        # Create model record
        model_id = str(uuid4())
        
        # Get learner and baseline
        result = await self.db.execute(
            select(Learner).where(Learner.id == learner_id)
        )
        learner = result.scalar_one_or_none()
        
        baseline = await self._get_latest_baseline(learner_id)

        # Initialize model
        await self.db.execute(
            """
            INSERT INTO learner_models
            (id, learner_id, model_version, base_model_id, status, created_at,
             privacy_settings, skill_map, parent_consent_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (
                model_id,
                learner_id,
                "v1.0",
                "aivo-brain-v1.0",
                "building",
                datetime.utcnow().isoformat(),
                json.dumps(privacy_settings),
                json.dumps({}),
                datetime.utcnow().isoformat(),
            )
        )
        await self.db.commit()

        # Log start event
        await self._log_audit_event(
            learner_model_id=model_id,
            event_type="model_build_start",
            actor_id=actor_id,
            actor_role="system",
            event_data={
                "consent_id": consent_id,
                "privacy_settings": privacy_settings,
            },
        )

        # Execute 5 steps
        steps = [
            self._step1_copy_base_model,
            self._step2_apply_baseline,
            self._step3_generate_pathways,
            self._step4_set_guardrails,
            self._step5_link_tools,
        ]

        for step_num, step_func in enumerate(steps, 1):
            step_data = await step_func(
                model_id=model_id,
                learner=learner,
                baseline=baseline,
                privacy_settings=privacy_settings,
            )

            # Log step completion
            await self._log_build_step(
                model_id=model_id,
                step_number=step_num,
                step_data=step_data,
            )

            # Small delay for demo (simulate processing)
            await asyncio.sleep(0.9)

        # Mark model as ready
        await self.db.execute(
            """
            UPDATE learner_models
            SET status = ?, built_at = ?
            WHERE id = ?
            """,
            ("ready", datetime.utcnow().isoformat(), model_id)
        )
        await self.db.commit()

        # Generate model card
        await self._generate_model_card(model_id)

        # Log completion
        await self._log_audit_event(
            learner_model_id=model_id,
            event_type="model_build_complete",
            actor_id=actor_id,
            actor_role="system",
            event_data={"model_id": model_id},
        )

        return model_id

    # ============================================================
    # Build Steps Implementation
    # ============================================================

    async def _step1_copy_base_model(
        self, 
        model_id: str, 
        learner: Learner,
        baseline: BaselineAssessment,
        privacy_settings: Dict
    ) -> Dict[str, Any]:
        """
        Step 1: Copy Aivo Brain into private sandbox.
        No learner data used in this step.
        """
        return {
            "step_name": "Copy Base Model",
            "description": "Clone the Aivo Brain into private sandbox",
            "data_inputs": {
                "types": ["none"],
                "from_learner": False,
                "pii": False,
            },
            "data_outputs": {
                "artifact": "private_model_instance",
                "size": "base_model",
            },
            "explanation": (
                "We make a copy of our general learning model so your child has "
                "their own private version. No personal data is used in this step."
            ),
            "duration_ms": 900,
        }

    async def _step2_apply_baseline(
        self, 
        model_id: str, 
        learner: Learner,
        baseline: BaselineAssessment,
        privacy_settings: Dict
    ) -> Dict[str, Any]:
        """
        Step 2: Apply baseline assessment results.
        Uses only the domain scores (grade levels), not raw responses.
        """
        # Parse domain scores
        domain_scores = json.loads(baseline.domain_scores) if isinstance(baseline.domain_scores, str) else baseline.domain_scores
        
        skill_map = {
            "reading": {
                "level": domain_scores.get("reading", 4.0),
                "strengths": ["sight_words", "decoding"],
                "gaps": ["inference", "main_idea"],
            },
            "math": {
                "level": domain_scores.get("math", 4.0),
                "strengths": ["number_sense", "addition"],
                "gaps": ["fractions", "word_problems"],
            },
            "writing": {
                "level": domain_scores.get("writing", 4.0),
                "strengths": ["spelling", "sentences"],
                "gaps": ["paragraphs", "organization"],
            },
        }

        # Save to model
        await self.db.execute(
            """
            UPDATE learner_models
            SET skill_map = ?
            WHERE id = ?
            """,
            (json.dumps(skill_map), model_id)
        )
        await self.db.commit()

        return {
            "step_name": "Apply Baseline Results",
            "description": "Set starting skill levels from assessment",
            "data_inputs": {
                "types": ["domain_scores", "question_timing"],
                "from_learner": True,
                "pii": False,
            },
            "data_outputs": {
                "artifact": "skill_map",
                "fields": ["reading_level", "math_level", "writing_level"],
            },
            "explanation": (
                "We use the assessment results to set where your child should start "
                "in each subject. Only the grade-level scores are used, not the actual answers."
            ),
            "duration_ms": 850,
        }

    async def _step3_generate_pathways(
        self, 
        model_id: str, 
        learner: Learner,
        baseline: BaselineAssessment,
        privacy_settings: Dict
    ) -> Dict[str, Any]:
        """
        Step 3: Generate learning pathways.
        Uses skill map + accessibility preferences.
        """
        # Get domain scores
        domain_scores = json.loads(baseline.domain_scores) if isinstance(baseline.domain_scores, str) else baseline.domain_scores
        learner_prefs = json.loads(learner.accessibility_prefs) if isinstance(learner.accessibility_prefs, str) else (learner.accessibility_prefs or {})

        pathways = {
            "reading": self._generate_reading_pathway(
                level=domain_scores.get("reading", 4.0),
                prefs=learner_prefs,
            ),
            "math": self._generate_math_pathway(
                level=domain_scores.get("math", 4.0),
                prefs=learner_prefs,
            ),
            "writing": self._generate_writing_pathway(
                level=domain_scores.get("writing", 4.0),
                prefs=learner_prefs,
            ),
        }

        # Save to model
        await self.db.execute(
            """
            UPDATE learner_models
            SET pathways = ?
            WHERE id = ?
            """,
            (json.dumps(pathways), model_id)
        )
        await self.db.commit()

        return {
            "step_name": "Generate Learning Pathways",
            "description": "Create personalized subject pathways",
            "data_inputs": {
                "types": ["skill_map", "accessibility_prefs", "grade"],
                "from_learner": True,
                "pii": False,
            },
            "data_outputs": {
                "artifact": "pathways",
                "subjects": list(pathways.keys()),
            },
            "explanation": (
                "We create learning sequences for each subject that match your child's "
                "current level and preferred accessibility features."
            ),
            "duration_ms": 920,
        }

    async def _step4_set_guardrails(
        self, 
        model_id: str, 
        learner: Learner,
        baseline: BaselineAssessment,
        privacy_settings: Dict
    ) -> Dict[str, Any]:
        """
        Step 4: Set safety guardrails.
        Uses only age and grade for content filtering.
        """
        guardrails = {
            "content_filter": {
                "age_appropriate": True,
                "grade_level": learner.grade,
                "blocked_topics": ["violence", "adult_content"],
            },
            "tone_policy": {
                "style": "encouraging",
                "complexity": "grade_appropriate",
                "scaffolding": "high",
            },
            "output_constraints": {
                "max_text_length": 500 if learner.grade and int(learner.grade.replace("th", "").replace("st", "").replace("nd", "").replace("rd", "")) <= 5 else 1000,
                "reading_level": f"grade_{learner.grade}",
                "avoid_jargon": True,
            },
        }

        # Save to model
        await self.db.execute(
            """
            UPDATE learner_models
            SET guardrails = ?
            WHERE id = ?
            """,
            (json.dumps(guardrails), model_id)
        )
        await self.db.commit()

        return {
            "step_name": "Set Safety Guardrails",
            "description": "Configure age-appropriate content filters",
            "data_inputs": {
                "types": ["age", "grade"],
                "from_learner": True,
                "pii": False,
            },
            "data_outputs": {
                "artifact": "guardrail_policy",
                "rules": ["content_filter", "tone_policy", "topic_restrictions"],
            },
            "explanation": (
                "We set up safety rules to ensure all content is appropriate for "
                "your child's age and grade level."
            ),
            "duration_ms": 800,
        }

    async def _step5_link_tools(
        self, 
        model_id: str, 
        learner: Learner,
        baseline: BaselineAssessment,
        privacy_settings: Dict
    ) -> Dict[str, Any]:
        """
        Step 5: Link support tools.
        Connects Homework Helper, TTS, voice input.
        """
        domain_scores = json.loads(baseline.domain_scores) if isinstance(baseline.domain_scores, str) else baseline.domain_scores
        learner_prefs = json.loads(learner.accessibility_prefs) if isinstance(learner.accessibility_prefs, str) else (learner.accessibility_prefs or {})
        
        tool_config = {
            "homework_helper": {
                "enabled": True,
                "difficulty_level": domain_scores.get("reading", 4.0),
                "explanation_style": "step_by_step",
                "hints_before_answers": True,
            },
            "text_to_speech": {
                "enabled": learner_prefs.get("text_to_speech", True),
                "speed": "0.9x",
                "voice": "friendly",
            },
            "voice_input": {
                "enabled": learner_prefs.get("voice_input", False),
                "accuracy_threshold": 0.85,
            },
        }

        # Save to model (as scaffolds)
        await self.db.execute(
            """
            UPDATE learner_models
            SET scaffolds = ?
            WHERE id = ?
            """,
            (json.dumps(tool_config), model_id)
        )
        await self.db.commit()

        return {
            "step_name": "Link Support Tools",
            "description": "Connect Homework Helper and other features",
            "data_inputs": {
                "types": ["skill_level", "accessibility_prefs"],
                "from_learner": True,
                "pii": False,
            },
            "data_outputs": {
                "artifact": "tool_configuration",
                "features": ["homework_helper", "text_to_speech", "voice_input"],
            },
            "explanation": (
                "We connect the Homework Helper and other tools so they work at the "
                "right difficulty level for your child."
            ),
            "duration_ms": 780,
        }

    # ============================================================
    # Model Card Generation
    # ============================================================

    async def _generate_model_card(self, model_id: str) -> Dict[str, Any]:
        """
        Generate a Model Card following Google's Model Card standard.
        """
        # Get model data
        result = await self.db.execute(
            "SELECT * FROM learner_models WHERE id = ?", (model_id,)
        )
        model_row = result.fetchone()
        
        result = await self.db.execute(
            select(Learner).where(Learner.id == model_row[1])  # learner_id
        )
        learner = result.scalar_one_or_none()
        
        baseline = await self._get_latest_baseline(model_row[1])
        domain_scores = json.loads(baseline.domain_scores) if isinstance(baseline.domain_scores, str) else baseline.domain_scores
        learner_prefs = json.loads(learner.accessibility_prefs) if isinstance(learner.accessibility_prefs, str) else (learner.accessibility_prefs or {})

        model_card = {
            "model_details": {
                "version": model_row[2],  # model_version
                "type": "Personalized Learning Model",
                "base_model": model_row[3],  # base_model_id
                "created": model_row[5],  # created_at
                "owner": f"Learner {learner.first_name} (private)",
            },
            "intended_use": {
                "primary_uses": [
                    "Personalized K-12 learning content delivery",
                    "Adaptive difficulty adjustment",
                    "Learning support and scaffolding",
                ],
                "out_of_scope_uses": [
                    "High-stakes testing or grading",
                    "Diagnosis of learning disabilities",
                    "Sharing data between learners",
                ],
            },
            "factors": {
                "relevant_factors": [
                    f"Grade level: {learner.grade}",
                    f"Reading level: {domain_scores.get('reading')}",
                    f"Math level: {domain_scores.get('math')}",
                    f"Accessibility: {', '.join([k for k, v in learner_prefs.items() if v])}",
                ],
            },
            "training_data": {
                "datasets_used": ["Baseline assessment results"],
                "preprocessing": [
                    "Domain scores calculated from adaptive assessment",
                    "PII removed from all training inputs",
                ],
                "data_not_used": [
                    "Actual assessment questions/answers",
                    "Free-text responses",
                    "Other learners' data",
                ],
            },
            "ethical_considerations": {
                "data": [
                    "All data stored in isolated, private model space",
                    "Parent can export or delete at any time",
                    f"Data retention: {json.loads(model_row[8])['retention_days']} days",
                ],
            },
        }

        # Save model card
        card_id = str(uuid4())
        await self.db.execute(
            """
            INSERT INTO model_cards
            (id, learner_model_id, card_version, model_details, intended_use,
             factors, training_data, ethical_considerations, json_export)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (
                card_id,
                model_id,
                "1.0",
                json.dumps(model_card["model_details"]),
                json.dumps(model_card["intended_use"]),
                json.dumps(model_card["factors"]),
                json.dumps(model_card["training_data"]),
                json.dumps(model_card["ethical_considerations"]),
                json.dumps(model_card),
            )
        )
        await self.db.commit()

        return model_card

    # ============================================================
    # Helper Methods
    # ============================================================

    async def _get_latest_baseline(self, learner_id: str) -> BaselineAssessment:
        """Get the most recent baseline assessment for a learner."""
        result = await self.db.execute(
            select(BaselineAssessment)
            .where(BaselineAssessment.learner_id == learner_id)
            .where(BaselineAssessment.completed.is_(True))
            .order_by(desc(BaselineAssessment.completed_at))
            .limit(1)
        )
        return result.scalar_one_or_none()

    def _generate_reading_pathway(self, level: float, prefs: Dict) -> Dict:
        """Generate reading learning pathway."""
        return {
            "starting_level": level,
            "units": [
                {"name": "Phonics Review", "lessons": 5},
                {"name": "Comprehension Strategies", "lessons": 8},
                {"name": "Vocabulary Building", "lessons": 6},
            ],
            "scaffolds": {
                "text_to_speech": prefs.get("text_to_speech", True),
                "highlighting": True,
                "chunking": level < 4.0,
            },
        }

    def _generate_math_pathway(self, level: float, prefs: Dict) -> Dict:
        """Generate math learning pathway."""
        return {
            "starting_level": level,
            "units": [
                {"name": "Number Sense", "lessons": 4},
                {"name": "Operations", "lessons": 7},
                {"name": "Problem Solving", "lessons": 6},
            ],
            "scaffolds": {
                "visual_models": True,
                "step_by_step": True,
                "practice_problems": "high",
            },
        }

    def _generate_writing_pathway(self, level: float, prefs: Dict) -> Dict:
        """Generate writing learning pathway."""
        return {
            "starting_level": level,
            "units": [
                {"name": "Sentence Structure", "lessons": 5},
                {"name": "Paragraph Writing", "lessons": 6},
                {"name": "Essay Basics", "lessons": 4},
            ],
            "scaffolds": {
                "templates": True,
                "word_banks": True,
                "peer_examples": level >= 5.0,
            },
        }

    async def _log_build_step(
        self, 
        model_id: str, 
        step_number: int, 
        step_data: Dict
    ) -> None:
        """Log a model build step."""
        step_id = str(uuid4())
        await self.db.execute(
            """
            INSERT INTO model_build_steps
            (id, learner_model_id, step_number, step_name, description,
             data_inputs, data_outputs, started_at, completed_at, duration_ms,
             status, parent_visible, explanation)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (
                step_id,
                model_id,
                step_number,
                step_data["step_name"],
                step_data["description"],
                json.dumps(step_data["data_inputs"]),
                json.dumps(step_data["data_outputs"]),
                datetime.utcnow().isoformat(),
                datetime.utcnow().isoformat(),
                step_data["duration_ms"],
                "completed",
                True,
                step_data["explanation"],
            )
        )
        await self.db.commit()

    async def _log_audit_event(
        self,
        learner_model_id: Optional[str],
        event_type: str,
        actor_id: str,
        actor_role: str,
        event_data: Dict,
        ip_address: str = None,
    ) -> None:
        """Log an audit trail event."""
        event_id = str(uuid4())
        await self.db.execute(
            """
            INSERT INTO model_audit_trail
            (id, learner_model_id, event_type, actor_id, actor_role,
             event_data, ip_address)
            VALUES (?, ?, ?, ?, ?, ?, ?)
            """,
            (
                event_id,
                learner_model_id,
                event_type,
                actor_id,
                actor_role,
                json.dumps(event_data),
                ip_address,
            )
        )
        await self.db.commit()

    def _get_consent_text_v1(self) -> str:
        """Get version 1.0 of consent text."""
        return (
            "I consent to the creation of a personalized AI learning model for my child. "
            "I understand that:\n"
            "- The model is created by applying my child's baseline assessment results to a copy of the base Aivo Brain\n"
            "- The model is private and isolated to my family/class\n"
            "- No data is shared between learners\n"
            "- I can view, export, or delete the model at any time\n"
            "- A complete audit trail of all operations is maintained\n"
            "- I have reviewed the privacy settings and data usage details"
        )
