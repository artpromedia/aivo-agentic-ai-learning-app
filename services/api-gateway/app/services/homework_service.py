"""Homework service for business logic."""
from sqlalchemy.orm import Session
from typing import Optional
import logging

from app.models.homework import HomeworkSession, HomeworkStep, HomeworkStatus
from app.models.learner import Learner
from app.schemas.homework import HomeworkSessionCreate

logger = logging.getLogger(__name__)


class HomeworkService:
    """Service for homework helper operations."""
    
    def __init__(self, db: Session):
        self.db = db
    
    async def create_session(
        self,
        session_data: HomeworkSessionCreate,
        learner: Learner
    ) -> HomeworkSession:
        """Create a new homework session with initial analysis."""
        
        # Create session
        session = HomeworkSession(
            learner_id=learner.id,
            title=session_data.title,
            input_method=session_data.input_method,
            original_text=session_data.original_text,
            problem_statement=session_data.original_text or "",
            current_step=HomeworkStep.UNDERSTAND,
            status=HomeworkStatus.IN_PROGRESS,
            settings={
                "read_aloud": True,
                "parent_assist_mode": False,
                "show_hints": True,
                "allow_calculator": True
            },
            scaffolding_level="moderate",
            hints_given=0
        )
        
        self.db.add(session)
        self.db.commit()
        self.db.refresh(session)
        
        logger.info(f"Created homework session {session.id} for learner {learner.id}")
        
        return session
    
    async def analyze_problem(self, session: HomeworkSession) -> dict:
        """Analyze the homework problem and provide initial guidance."""
        # This would integrate with AI service for problem analysis
        return {
            "detected_subject": "Math",
            "detected_grade": "4th Grade",
            "difficulty": "Moderate",
            "key_concepts": ["Addition", "Word Problems"]
        }
