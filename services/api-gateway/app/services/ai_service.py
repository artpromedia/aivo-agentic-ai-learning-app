"""AI service for homework assistance."""
import logging
from typing import Dict

from app.models.homework import HomeworkSession, HomeworkStep

logger = logging.getLogger(__name__)


class AIService:
    """Service for AI-powered homework assistance."""

    async def generate_hint(
        self,
        session: HomeworkSession,
        student_question: str | None = None  # pylint: disable=unused-argument
    ) -> str:
        """Generate adaptive hint for current step."""

        step = session.current_step

        # SQLAlchemy Column compatibility
        hints_map: dict = {
            HomeworkStep.UNDERSTAND: (
                "Let's read the problem carefully. "
                "What information do we have? "
                "What are we trying to find?"
            ),
            HomeworkStep.PLAN: (
                "Think about what strategy might work here. "
                "Can you draw a picture or make a list?"
            ),
            HomeworkStep.SOLVE: (
                "Take it step by step. "
                "Show your work as you go."
            ),
            HomeworkStep.CHECK: (
                "Does your answer make sense? "
                "Can you check it a different way?"
            )
        }
        hint_text: str = hints_map.get(
            step,
            "Keep working through the problem step by step!"
        )

        logger.info(
            "Generated hint for session %s at step %s",
            session.id, step
        )

        return hint_text

    async def generate_explanation(
        self,
        session: HomeworkSession,
        step: HomeworkStep,
        specific_question: str | None = None  # pylint: disable=unused-argument
    ) -> Dict:
        """Generate detailed explanation for a step or concept."""

        explanation = {
            "text": (
                f"Let me explain the '{step.value}' step. "
                "This is where we break down the problem and understand "
                "what we need to do."
            ),
            "resources": [
                {
                    "title": "Video Tutorial",
                    "url": "https://example.com/tutorial",
                    "type": "video"
                }
            ]
        }

        logger.info(
            "Generated explanation for session %s at step %s",
            session.id, step
        )

        return explanation
