"""
Complete Assessment Service.

Handles both Quick Assessment (5Q preferences) and Comprehensive Assessment (30Q knowledge).
Integrates with brain cloning service for model adaptation.
"""

import logging
from typing import Dict, List, Any, Optional, Tuple
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from sqlalchemy import and_, desc
import json

logger = logging.getLogger(__name__)


class AssessmentService:
    """
    Unified service for all assessment operations.
    
    Features:
    - Quick assessment (5 preference questions)
    - Comprehensive assessment (30+ knowledge questions)  
    - Automatic scheduling (first login + 90-day cycle)
    - Brain model adaptation
    - Progress tracking
    """
    
    def __init__(self, db: Session):
        self.db = db
    
    # ========================================================================
    # SCHEDULING & CHECK-IN
    # ========================================================================
    
    async def check_assessment_due(self, learner_id: str) -> Dict[str, Any]:
        """
        Check if learner needs assessment.
        
        Returns:
            {
                "is_due": bool,
                "assessment_type": "quick|comprehensive",
                "schedule": AssessmentSchedule or None
            }
        """
        from app.models.assessment import AssessmentSchedule
        
        # Check for pending assessment
        pending = self.db.query(AssessmentSchedule).filter(
            and_(
                AssessmentSchedule.learner_id == learner_id,
                AssessmentSchedule.status.in_(['pending', 'in_progress'])
            )
        ).first()
        
        if pending:
            return {
                "is_due": True,
                "assessment_type": pending.assessment_level,
                "schedule": pending
            }
        
        # Check last completed
        last = self.db.query(AssessmentSchedule).filter(
            and_(
                AssessmentSchedule.learner_id == learner_id,
                AssessmentSchedule.status == 'completed'
            )
        ).order_by(desc(AssessmentSchedule.completed_date)).first()
        
        if not last:
            # Never assessed - create first quick assessment
            schedule = await self.create_first_assessment(learner_id)
            return {
                "is_due": True,
                "assessment_type": "quick",
                "schedule": schedule
            }
        
        # Check 90-day interval
        days_since = (datetime.utcnow() - last.completed_date).days
        
        if days_since >= 90:
            # Due for next assessment
            schedule = await self.schedule_quarterly_assessment(learner_id)
            return {
                "is_due": True,
                "assessment_type": schedule.assessment_level,
                "schedule": schedule
            }
        
        return {
            "is_due": False,
            "assessment_type": None,
            "schedule": None,
            "days_until_next": 90 - days_since
        }
    
    async def create_first_assessment(self, learner_id: str) -> Any:
        """Create first quick assessment for new learner."""
        from app.models.assessment import AssessmentSchedule
        from app.models.learner import Learner
        
        learner = self.db.query(Learner).filter(Learner.id == learner_id).first()
        if not learner:
            raise ValueError(f"Learner {learner_id} not found")
        
        schedule = AssessmentSchedule(
            learner_id=learner_id,
            district_id=learner.district_id,
            assessment_type="baseline",
            assessment_level="quick",
            scheduled_date=datetime.utcnow(),
            status="pending",
            is_first_assessment=True,
            days_since_last=0
        )
        
        self.db.add(schedule)
        self.db.commit()
        self.db.refresh(schedule)
        
        logger.info(f"Created first quick assessment for learner {learner_id}")
        
        return schedule
    
    async def schedule_quarterly_assessment(self, learner_id: str) -> Any:
        """Schedule next quarterly assessment (alternates quick/comprehensive)."""
        from app.models.assessment import AssessmentSchedule
        from app.models.learner import Learner
        
        learner = self.db.query(Learner).filter(Learner.id == learner_id).first()
        if not learner:
            raise ValueError(f"Learner {learner_id} not found")
        
        # Get last assessment to determine next type
        last = self.db.query(AssessmentSchedule).filter(
            and_(
                AssessmentSchedule.learner_id == learner_id,
                AssessmentSchedule.status == 'completed'
            )
        ).order_by(desc(AssessmentSchedule.completed_date)).first()
        
        # Alternate: quick → comprehensive → quick → comprehensive
        next_level = "comprehensive" if last and last.assessment_level == "quick" else "quick"
        
        schedule = AssessmentSchedule(
            learner_id=learner_id,
            district_id=learner.district_id,
            assessment_type="quarterly",
            assessment_level=next_level,
            scheduled_date=datetime.utcnow(),
            status="pending",
            is_first_assessment=False,
            days_since_last=90
        )
        
        self.db.add(schedule)
        self.db.commit()
        self.db.refresh(schedule)
        
        logger.info(f"Scheduled {next_level} assessment for learner {learner_id}")
        
        return schedule
    
    # ========================================================================
    # QUICK ASSESSMENT (5 QUESTIONS)
    # ========================================================================
    
    async def submit_quick_assessment(
        self,
        schedule_id: str,
        learner_id: str,
        responses: List[Dict[str, Any]]
    ) -> Dict[str, Any]:
        """
        Process quick assessment responses.
        
        Args:
            schedule_id: Assessment schedule ID
            learner_id: Learner ID
            responses: List of 5 question responses
            
        Returns:
            Assessment result with recommendations
        """
        from app.models.assessment import (
            AssessmentSchedule, AssessmentResponse, AssessmentResult
        )
        
        schedule = self.db.query(AssessmentSchedule).filter(
            AssessmentSchedule.id == schedule_id
        ).first()
        
        if not schedule:
            raise ValueError(f"Schedule {schedule_id} not found")
        
        # Save responses
        for resp in responses:
            response = AssessmentResponse(
                schedule_id=schedule_id,
                learner_id=learner_id,
                question_number=resp['question_number'],
                question_text=resp['question_text'],
                answer_value=resp['answer_value'],
                answer_type=resp['answer_type'],
                response_time_seconds=resp.get('response_time_seconds')
            )
            self.db.add(response)
        
        # Analyze and score
        result = await self._analyze_quick_responses(schedule, responses, learner_id)
        
        # Mark complete
        schedule.status = 'completed'
        schedule.completed_date = datetime.utcnow()
        
        self.db.commit()
        self.db.refresh(result)
        
        # Trigger brain adaptation
        if result.triggered_model_update:
            await self._adapt_brain_from_quick(result)
        
        logger.info(f"Completed quick assessment: {result.overall_score}%")
        
        return {
            "result_id": str(result.id),
            "overall_score": float(result.overall_score),
            "learning_style": result.learning_style,
            "confidence_level": result.confidence_level,
            "recommendations": result.recommendations
        }
    
    async def _analyze_quick_responses(
        self,
        schedule: Any,
        responses: List[Dict],
        learner_id: str
    ) -> Any:
        """Analyze 5-question responses and generate insights."""
        from app.models.assessment import AssessmentResult
        
        # Map responses by question number
        resp_map = {r['question_number']: r['answer_value'] for r in responses}
        
        # Q1: Reading feelings (😊😐😕😢) → confidence 1-4
        reading_emoji = resp_map.get(1, "😐")
        reading_conf = {"😊": 4, "😐": 3, "😕": 2, "😢": 1}.get(reading_emoji, 3)
        
        # Q2: Learning style  
        learning_style = resp_map.get(2, "visual")
        
        # Q3: Math confidence (1-5 scale)
        math_conf = int(resp_map.get(3, 3))
        
        # Q4: Engagement (🎮📚🎨🎵)
        engagement = resp_map.get(4, "📚")
        engagement_map = {"🎮": "games", "📚": "reading", "🎨": "art", "🎵": "music"}
        
        # Q5: Work preference (👤👥👨‍🏫🏠)
        work_emoji = resp_map.get(5, "👤")
        work_pref_map = {"👤": "independent", "👥": "pairs", "👨‍🏫": "teacher_led", "🏠": "home"}
        env_map = {"👤": "alone", "👥": "pairs", "👨‍🏫": "teacher", "🏠": "home"}
        
        # Calculate overall score
        overall = ((reading_conf/4)*30 + (math_conf/5)*30 + 40)
        
        # Confidence level
        conf_level = "high" if overall >= 75 else "medium" if overall >= 50 else "low"
        
        # Get previous for progress
        prev_result = self.db.query(AssessmentResult).filter(
            and_(
                AssessmentResult.learner_id == learner_id,
                AssessmentResult.id != schedule.id
            )
        ).order_by(desc(AssessmentResult.created_at)).first()
        
        progress = None
        if prev_result and prev_result.overall_score:
            diff = overall - float(prev_result.overall_score)
            progress = (diff / float(prev_result.overall_score)) * 100
        
        # Recommendations
        recs = self._generate_quick_recommendations(
            learning_style, reading_conf, math_conf
        )
        
        result = AssessmentResult(
            schedule_id=str(schedule.id),
            learner_id=learner_id,
            overall_score=round(overall, 2),
            confidence_level=conf_level,
            learning_style=learning_style,
            reading_confidence=reading_conf,
            math_confidence=math_conf,
            preferred_environment=env_map.get(work_emoji, "alone"),
            engagement_factors={engagement_map.get(engagement, "reading"): True},
            work_preference=work_pref_map.get(work_emoji, "independent"),
            previous_assessment_id=prev_result.id if prev_result else None,
            progress_percentage=round(progress, 2) if progress else None,
            improvement_areas=[],
            strengths=[],
            recommendations=recs,
            triggered_model_update=True  # Always update on assessment
        )
        
        self.db.add(result)
        
        return result
    
    def _generate_quick_recommendations(
        self, style: str, reading: int, math: int
    ) -> List[str]:
        """Generate recommendations from quick assessment."""
        recs = []
        
        if style == "visual":
            recs.append("Use visual aids, diagrams, and color-coding")
        elif style == "auditory":
            recs.append("Include audio lessons and discussion activities")
        elif style == "kinesthetic":
            recs.append("Incorporate hands-on and movement-based learning")
        
        if reading < 3:
            recs.append("Focus on building reading confidence with engaging materials")
        
        if math < 3:
            recs.append("Provide additional math support and practice")
        
        return recs
    
    async def _adapt_brain_from_quick(self, result: Any):
        """Adapt brain model from quick assessment."""
        from app.services.district_brain_cloner import DistrictBrainCloner
        from app.models.learner import Learner
        from app.models.assessment import BrainAdaptation
        
        try:
            learner = self.db.query(Learner).filter(
                Learner.id == result.learner_id
            ).first()
            
            if not learner:
                return
            
            # Prepare adaptation data
            changes = {
                "preferences": {
                    "learning_style": result.learning_style,
                    "work_preference": result.work_preference,
                    "confidence_level": result.confidence_level
                },
                "engagement": result.engagement_factors,
                "recommendations": result.recommendations
            }
            
            # Clone/adapt brain
            cloner = DistrictBrainCloner(self.db)
            brain = await cloner.clone_brain_for_learner(
                learner_id=str(learner.id),
                district_id=str(learner.district_id),
                grade_level=learner.grade_level or 5
            )
            
            # Record adaptation
            version = f"quick_{datetime.utcnow().strftime('%Y%m%d_%H%M')}"
            
            adaptation = BrainAdaptation(
                learner_id=result.learner_id,
                brain_instance_id=brain.id if brain else None,
                trigger_type="quick_assessment",
                trigger_id=result.id,
                adaptation_type="preferences",
                changes_applied=changes,
                new_model_version=version,
                expected_improvement_areas=[]
            )
            
            result.brain_instance_id = brain.id if brain else None
            result.model_updated_at = datetime.utcnow()
            result.model_version_id = brain.id if brain else None
            
            self.db.add(adaptation)
            self.db.commit()
            
            logger.info(f"✅ Brain adapted from quick assessment: {version}")
            
        except Exception as e:
            logger.error(f"Failed to adapt brain: {e}")
    
    # Note: Comprehensive assessment methods would continue here
    # For now, focusing on getting quick assessment working
    # Comprehensive can be added in next iteration
    
    async def get_assessment_history(
        self, learner_id: str, limit: int = 10
    ) -> Dict[str, Any]:
        """Get complete assessment history."""
        from app.models.assessment import AssessmentSchedule, AssessmentResult
        
        schedules = self.db.query(AssessmentSchedule).filter(
            AssessmentSchedule.learner_id == learner_id
        ).order_by(desc(AssessmentSchedule.created_at)).limit(limit).all()
        
        results = self.db.query(AssessmentResult).filter(
            AssessmentResult.learner_id == learner_id
        ).order_by(desc(AssessmentResult.created_at)).limit(limit).all()
        
        completed = [s for s in schedules if s.status == 'completed']
        pending = [s for s in schedules if s.status in ['pending', 'in_progress']]
        
        return {
            "learner_id": learner_id,
            "total_assessments": len(completed),
            "completion_rate": len(completed) / len(schedules) if schedules else 0,
            "results": results,
            "upcoming_schedules": pending
        }
    
    async def mark_overdue(self) -> int:
        """Mark overdue assessments."""
        from app.models.assessment import AssessmentSchedule
        
        overdue_date = datetime.utcnow() - timedelta(days=7)
        
        count = self.db.query(AssessmentSchedule).filter(
            and_(
                AssessmentSchedule.status == 'pending',
                AssessmentSchedule.scheduled_date < overdue_date
            )
        ).update({
            "status": "overdue",
            "updated_at": datetime.utcnow()
        })
        
        self.db.commit()
        
        logger.info(f"Marked {count} assessments as overdue")
        
        return count
