"""
Assessment Scheduler Service.

Handles:
- Automatic 90-day assessment scheduling
- Email/notification reminders
- Expiration handling
"""

import logging

from sqlalchemy.orm import Session

from app.models.learner import Learner

logger = logging.getLogger(__name__)


class AssessmentScheduler:
    """
    Manages automatic assessment scheduling.
    
    Run via cron job daily.
    """
    
    def __init__(self, db: Session):
        self.db = db
    
    async def check_and_schedule_assessments(self):
        """
        Check all learners and schedule assessments if needed.
        
        Run daily via cron job.
        """
        logger.info("🔍 Checking learners for assessment scheduling...")
        
        # Get all active learners
        learners = self.db.query(Learner).filter(
            Learner.user.has(is_active=True)
        ).all()
        
        scheduled_count = 0
        
        for learner in learners:
            # Check if assessment needed via AI Inference Service
            try:
                from app.services.ai_service import AIService
                
                ai_service = AIService()
                result = await ai_service.check_assessment_due(learner.id)
                
                if result.get("is_due"):
                    logger.info(
                        f"📅 Assessment due for learner {learner.id}: "
                        f"{learner.first_name} {learner.last_name}"
                    )
                    scheduled_count += 1
                    
                    # Send notification
                    await self._send_assessment_notification(
                        learner,
                        result.get("schedule_id"),
                        result.get("assessment_type")
                    )
                
            except Exception as e:
                logger.error(
                    f"Failed to check assessment for learner {learner.id}: {e}"
                )
        
        logger.info(f"✅ Found {scheduled_count} learners needing assessments")
        
        # Send reminders for pending assessments
        await self._send_assessment_reminders()
    
    async def _send_assessment_notification(
        self,
        learner: Learner,
        schedule_id: str,
        assessment_type: str
    ):
        """
        Send notification that assessment is ready.
        
        TODO: Integrate with email/SMS service
        """
        logger.info(
            f"📧 Would send assessment notification to {learner.user.email} "
            f"for {assessment_type} assessment {schedule_id}"
        )
        
        # Example email content:
        """
        Subject: Time for Your Progress Check! 📊

        Hi {learner.first_name}!

        It's been 90 days since your last assessment, and we'd love to see
        how much you've learned!

        Your progress check is ready and will take about 20 minutes.
        
        [Start Assessment]
        
        Remember: This helps us personalize your learning experience!
        
        - Your AIVO Team
        """
    
    async def _send_assessment_reminders(self):
        """
        Send reminders for pending assessments.
        
        TODO: Query AI Inference Service for pending assessments
        """
        logger.info("📧 Checking for assessments needing reminders...")
        
        # In production: Query AI Inference Service for assessments
        # expiring soon and send reminders


# Cron job function
async def run_assessment_scheduler():
    """
    Run assessment scheduler.
    
    Should be called by cron job daily.
    """
    from app.core.database import SessionLocal
    
    db = SessionLocal()
    
    try:
        scheduler = AssessmentScheduler(db)
        await scheduler.check_and_schedule_assessments()
    finally:
        db.close()
