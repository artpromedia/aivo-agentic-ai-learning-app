"""Homework service for business logic."""
import logging
from typing import Optional

from sqlalchemy.orm import Session

from app.models.homework import (
    HomeworkFile, HomeworkSession, HomeworkStep, HomeworkStatus
)
from app.models.learner import Learner
from app.schemas.homework import HomeworkSessionCreate
from app.services.ai_service import AIService
from app.services.file_service import FileService
from app.services.ocr_service import OCRService

logger = logging.getLogger(__name__)


class HomeworkService:
    """Service for homework helper operations."""

    def __init__(
        self,
        db: Session,
        ai_service: Optional[AIService] = None,
        file_service: Optional[FileService] = None,
        ocr_service: Optional[OCRService] = None
    ):
        self.db = db
        self.ai_service = ai_service or AIService()
        self.file_service = file_service or FileService()
        self.ocr_service = ocr_service or OCRService()

    async def create_session(
        self,
        session_data: HomeworkSessionCreate,
        learner: Learner
    ) -> HomeworkSession:
        """Create a new homework session with initial analysis."""

        # Use AI to analyze the content if available
        analysis = {}
        if session_data.original_text:
            try:
                analysis = await self.ai_service.analyze_homework_content(
                    session_data.original_text
                )
            except Exception as e:  # pylint: disable=broad-except
                logger.warning(
                    "Failed to analyze homework content: %s", str(e)
                )

        # Determine settings based on learner's IEP accommodations
        session_settings = self._get_session_settings(learner)

        # Determine scaffolding level
        scaffolding = self._determine_scaffolding_level(learner)

        # Create session
        session = HomeworkSession(
            learner_id=learner.id,
            title=session_data.title,
            input_method=session_data.input_method,
            original_text=session_data.original_text,
            problem_statement=session_data.original_text or "",
            current_step=HomeworkStep.UNDERSTAND,
            status=HomeworkStatus.IN_PROGRESS,
            settings=session_settings,
            scaffolding_level=scaffolding,
            hints_given=0,
            detected_subject=analysis.get("subject"),
            detected_grade=analysis.get("grade_level")
        )

        self.db.add(session)
        self.db.commit()
        self.db.refresh(session)

        logger.info(
            "Created homework session %s for learner %s (subject: %s)",
            session.id, learner.id, session.detected_subject
        )

        return session

    async def update_session_step(
        self,
        session: HomeworkSession,
        step: HomeworkStep
    ) -> HomeworkSession:
        """Update the current step of a homework session."""

        session.current_step = step  # type: ignore[assignment]
        self.db.commit()
        self.db.refresh(session)

        logger.info(
            "Updated session %s to step %s",
            session.id, step
        )

        return session

    async def add_completed_step(
        self,
        session: HomeworkSession,
        step_name: str,
        description: str
    ) -> HomeworkSession:
        """Add a completed step to the session's completed_steps."""

        if session.completed_steps is None:
            session.completed_steps = []

        step_data = {
            "name": step_name,
            "description": description
        }

        session.completed_steps.append(step_data)
        self.db.commit()
        self.db.refresh(session)

        logger.info(
            "Added completed step '%s' to session %s",
            step_name, session.id
        )

        return session

    async def increment_hints(
        self,
        session: HomeworkSession
    ) -> HomeworkSession:
        """Increment the hints_given counter."""

        session.hints_given += 1  # type: ignore[assignment]
        self.db.commit()
        self.db.refresh(session)

        return session

    async def record_accommodation_usage(
        self,
        session: HomeworkSession,
        accommodation: str
    ) -> HomeworkSession:
        """Record that an accommodation was used."""

        if session.accommodations_used is None:
            session.accommodations_used = []

        if accommodation not in session.accommodations_used:
            session.accommodations_used.append(accommodation)
            self.db.commit()
            self.db.refresh(session)

            logger.info(
                "Recorded accommodation '%s' for session %s",
                accommodation, session.id
            )

        return session

    async def complete_session(
        self,
        session: HomeworkSession
    ) -> HomeworkSession:
        """Mark a homework session as completed."""

        session.status = HomeworkStatus.COMPLETED  # type: ignore[assignment]
        self.db.commit()
        self.db.refresh(session)

        logger.info("Completed homework session %s", session.id)

        return session

    async def upload_homework_file(
        self,
        session: HomeworkSession,
        file_url: str,
        file_type: str,
        original_filename: str
    ) -> HomeworkFile:
        """
        Create a database record for an uploaded file.

        Note: File validation and upload should be handled by the
        endpoint using FileService directly. This method just creates
        the database record and triggers OCR.
        """

        # Create database record
        homework_file = HomeworkFile(
            session_id=session.id,
            file_url=file_url,
            file_type=file_type,
            ocr_status="pending",
            original_filename=original_filename
        )

        self.db.add(homework_file)
        self.db.commit()
        self.db.refresh(homework_file)

        logger.info(
            "Created file record for session %s: %s",
            session.id, file_url
        )

        # Trigger OCR processing asynchronously
        if file_type.startswith("image/") or \
           file_type == "application/pdf":
            await self.ocr_service.process_file_async(
                str(homework_file.id),
                file_url
            )

        return homework_file

    async def get_session_with_files(
        self,
        session_id: int
    ) -> Optional[HomeworkSession]:
        """Get a homework session with its associated files."""

        session = self.db.query(HomeworkSession).filter(
            HomeworkSession.id == session_id
        ).first()

        if session:
            # Trigger loading of files relationship
            _ = session.files

        return session

    def _get_session_settings(self, learner: Learner) -> dict:
        """
        Determine session settings based on learner's IEP.

        Returns default settings with accommodations applied.
        """

        settings_dict = {
            "read_aloud": False,
            "parent_assist_mode": False,
            "show_hints": True,
            "allow_calculator": True
        }

        # Check IEP accommodations if available
        if learner.iep_accommodations:
            accommodations = learner.iep_accommodations

            if "read_aloud" in accommodations or \
               "text_to_speech" in accommodations:
                settings_dict["read_aloud"] = True

            if "extended_time" in accommodations:
                settings_dict["extended_time"] = True

            if "reduced_distractions" in accommodations:
                settings_dict["reduced_distractions"] = True

            if "calculator_allowed" in accommodations:
                settings_dict["allow_calculator"] = True

        return settings_dict

    def _determine_scaffolding_level(self, learner: Learner) -> str:
        """
        Determine the appropriate scaffolding level.

        Based on learner's support needs.
        """

        # Default to moderate scaffolding
        scaffolding = "moderate"

        # Check IEP accommodations for support level indicators
        if learner.iep_accommodations:
            accommodations = learner.iep_accommodations

            # High support indicators
            high_support_keywords = [
                "significant_support",
                "step_by_step",
                "visual_supports",
                "frequent_breaks"
            ]

            # Low support indicators
            low_support_keywords = [
                "minimal_support",
                "independent",
                "self_directed"
            ]

            # Check for high support needs
            if any(
                keyword in accommodations
                for keyword in high_support_keywords
            ):
                scaffolding = "high"

            # Check for low support needs
            elif any(
                keyword in accommodations
                for keyword in low_support_keywords
            ):
                scaffolding = "low"

        return scaffolding
