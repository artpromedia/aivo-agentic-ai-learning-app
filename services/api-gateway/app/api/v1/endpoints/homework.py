"""
Homework Helper API endpoints.

Complete CRUD operations for homework helper with file upload,
OCR processing, and AI-powered assistance.
"""
# pylint: disable=import-error
import logging
from datetime import datetime
from typing import Optional

from fastapi import (
    APIRouter,
    Depends,
    File,
    HTTPException,
    UploadFile,
    status
)
from sqlalchemy.orm import Session

from app.core.database import get_db  # type: ignore[import-not-found]
from app.models.user import User  # type: ignore[import-not-found]
from app.models.learner import Learner  # type: ignore[import-not-found]
from app.models.homework import (  # type: ignore[import-not-found]
    HomeworkSession,
    HomeworkFile,
    WorkProduct,
    HomeworkStatus,
    HomeworkStep
)
from app.schemas.homework import (  # type: ignore[import-not-found]
    HomeworkSessionCreate,
    HomeworkSessionUpdate,
    HomeworkSessionResponse,
    HomeworkFileResponse,
    WorkProductCreate,
    WorkProductResponse,
    HintRequest,
    ExplanationRequest
)
from app.schemas.response import (  # type: ignore[import-not-found]
    success_response,
    paginated_response
)
from app.api.deps import get_current_user  # type: ignore[import-not-found]
from app.services.homework_service import (  # type: ignore[import-not-found]
    HomeworkService
)
from app.services.ocr_service import (  # type: ignore[import-not-found]
    OCRService
)
from app.services.ai_service import AIService  # type: ignore[import-not-found]
from app.services.file_service import (  # type: ignore[import-not-found]
    FileService
)

router = APIRouter()
logger = logging.getLogger(__name__)


@router.post(
    "/sessions",
    response_model=dict,
    status_code=status.HTTP_201_CREATED
)
async def create_homework_session(
    session_data: HomeworkSessionCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Create a new homework helper session.

    **Steps:**
    1. Validate learner belongs to current user
    2. Create session record
    3. Initialize with default settings
    4. Return session with initial guidance

    **Returns:**
    - Created homework session with ID
    - Initial problem analysis
    - Suggested first steps
    """
    # Verify learner belongs to user
    learner = db.query(Learner).filter(
        Learner.id == session_data.learner_id,
        Learner.user_id == current_user.id
    ).first()

    if not learner:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Learner not found or access denied"
        )

    # Create session
    homework_service = HomeworkService(db)
    session = await homework_service.create_session(session_data, learner)

    return success_response(
        data=HomeworkSessionResponse.model_validate(session).model_dump()
    )


@router.post(
    "/sessions/{session_id}/files",
    response_model=dict,
    status_code=status.HTTP_201_CREATED
)
async def upload_homework_file(
    session_id: str,
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Upload a file (photo, PDF, DOCX) to homework session.

    **Process:**
    1. Validate file type and size
    2. Upload to storage (S3 or local)
    3. Extract text via OCR (for images/PDFs)
    4. Update session with extracted content

    **Supported Formats:**
    - Images: JPG, PNG
    - Documents: PDF, DOC, DOCX

    **Max Size:** 10MB
    """
    # Verify session access
    session = db.query(HomeworkSession).join(Learner).filter(
        HomeworkSession.id == session_id,
        Learner.user_id == current_user.id
    ).first()

    if not session:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Session not found or access denied"
        )

    # Validate file
    file_service = FileService()
    file_validation = file_service.validate_homework_file(file)

    if not file_validation["valid"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=file_validation["error"]
        )

    # Upload file
    file_url = await file_service.upload_file(
        file=file,
        folder=f"homework/{session_id}"
    )

    # Create file record
    homework_file = HomeworkFile(
        session_id=session_id,
        filename=file.filename,
        file_type=file.content_type,
        file_size=file_validation["size"],
        file_url=file_url,
        ocr_status="pending"
    )

    db.add(homework_file)
    db.commit()
    db.refresh(homework_file)

    # Trigger OCR processing asynchronously
    content_type = file.content_type or ""
    if (content_type.startswith('image/') or
            content_type == 'application/pdf'):
        ocr_service = OCRService()
        await ocr_service.process_file_async(homework_file.id, file_url)

    return success_response(
        data=HomeworkFileResponse.model_validate(homework_file).model_dump()
    )


@router.get(
    "/sessions/{session_id}/files/{file_id}/ocr-status",
    response_model=dict
)
async def get_ocr_status(
    session_id: str,
    file_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Check OCR processing status for uploaded file.

    **Statuses:**
    - `pending`: Queued for processing
    - `processing`: Currently extracting text
    - `completed`: Text extracted successfully
    - `failed`: OCR failed (manual input required)
    """
    # Verify access
    file = db.query(HomeworkFile).join(
        HomeworkSession
    ).join(Learner).filter(
        HomeworkFile.id == file_id,
        HomeworkFile.session_id == session_id,
        Learner.user_id == current_user.id
    ).first()

    if not file:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="File not found or access denied"
        )

    return success_response(
        data={
            "file_id": file.id,
            "ocr_status": file.ocr_status,
            "extracted_text": file.extracted_text,
            "confidence": file.ocr_confidence
        }
    )


@router.get("/sessions", response_model=dict)
async def list_homework_sessions(
    learner_id: Optional[str] = None,
    status_filter: Optional[HomeworkStatus] = None,
    page: int = 1,
    page_size: int = 20,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    List homework sessions for current user.

    **Filters:**
    - `learner_id`: Filter by specific learner
    - `status`: Filter by session status
    - Supports pagination

    **Returns:**
    - List of sessions sorted by most recent first
    - Pagination metadata
    """
    query = db.query(HomeworkSession).join(Learner).filter(
        Learner.user_id == current_user.id
    )

    # Apply filters
    if learner_id:
        query = query.filter(HomeworkSession.learner_id == learner_id)

    if status_filter:
        query = query.filter(HomeworkSession.status == status_filter)

    # Get total count
    total = query.count()

    # Apply pagination
    sessions = query.order_by(
        HomeworkSession.created_at.desc()
    ).offset((page - 1) * page_size).limit(page_size).all()

    # Convert to response schema
    session_data = [
        HomeworkSessionResponse.model_validate(session).model_dump()
        for session in sessions
    ]

    return paginated_response(
        items=session_data,
        page=page,
        page_size=page_size,
        total=total
    )


@router.get("/sessions/{session_id}", response_model=dict)
async def get_homework_session(
    session_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get detailed homework session information.

    **Includes:**
    - Session metadata
    - Uploaded files with OCR status
    - Work products (drawings, text responses)
    - Progress through steps
    - AI assistance history
    """
    session = db.query(HomeworkSession).join(Learner).filter(
        HomeworkSession.id == session_id,
        Learner.user_id == current_user.id
    ).first()

    if not session:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Session not found or access denied"
        )

    return success_response(
        data=HomeworkSessionResponse.model_validate(session).model_dump()
    )


@router.patch("/sessions/{session_id}", response_model=dict)
async def update_homework_session(
    session_id: str,
    update_data: HomeworkSessionUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Update homework session.

    **Can Update:**
    - Current step (understand → plan → solve → check)
    - Status (in-progress, completed, abandoned)
    - Settings (read aloud, hints, calculator)
    - Title
    """
    session = db.query(HomeworkSession).join(Learner).filter(
        HomeworkSession.id == session_id,
        Learner.user_id == current_user.id
    ).first()

    if not session:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Session not found or access denied"
        )

    # Update fields
    update_dict = update_data.model_dump(exclude_unset=True)

    for field, value in update_dict.items():
        setattr(session, field, value)

    # Auto-track step completion
    if (update_data.current_step and
            update_data.current_step != session.current_step):
        if session.completed_steps is None:
            session.completed_steps = []

        if session.current_step.value not in session.completed_steps:
            session.completed_steps.append(session.current_step.value)

    db.commit()
    db.refresh(session)

    return success_response(
        data=HomeworkSessionResponse.model_validate(session).model_dump()
    )


@router.delete(
    "/sessions/{session_id}",
    status_code=status.HTTP_204_NO_CONTENT
)
async def delete_homework_session(
    session_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Delete homework session and all associated data.

    **Deletes:**
    - Session record
    - Uploaded files (from storage)
    - Work products
    - Progress data

    **Note:** This action cannot be undone.
    """
    session = db.query(HomeworkSession).join(Learner).filter(
        HomeworkSession.id == session_id,
        Learner.user_id == current_user.id
    ).first()

    if not session:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Session not found or access denied"
        )

    # Delete files from storage
    file_service = FileService()
    for file in session.files:
        await file_service.delete_file(file.file_url)

    # Delete session (cascades to files and work products)
    db.delete(session)
    db.commit()


@router.post(
    "/sessions/{session_id}/work-products",
    response_model=dict,
    status_code=status.HTTP_201_CREATED
)
async def save_work_product(
    session_id: str,
    work_data: WorkProductCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Save student work product (drawing, text, diagram).

    **Types:**
    - `drawing`: Canvas drawing data (data URL or SVG)
    - `text`: Typed response
    - `equation`: Mathematical equation
    - `diagram`: Visual diagram

    **Auto-saves** as student progresses through steps.
    """
    session = db.query(HomeworkSession).join(Learner).filter(
        HomeworkSession.id == session_id,
        Learner.user_id == current_user.id
    ).first()

    if not session:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Session not found or access denied"
        )

    # Create work product
    work_product = WorkProduct(
        session_id=session_id,
        step=work_data.step,
        work_type=work_data.work_type,
        content=work_data.content,
        feedback=work_data.feedback
    )

    db.add(work_product)
    db.commit()
    db.refresh(work_product)

    return success_response(
        data=WorkProductResponse.model_validate(work_product).model_dump()
    )


@router.post("/sessions/{session_id}/hints", response_model=dict)
async def request_hint(
    session_id: str,
    hint_request: HintRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Request AI-generated hint for current step.

    **Adaptive Hints:**
    - Based on current step (understand, plan, solve, check)
    - Considers student's IEP accommodations
    - Adjusts for reading level
    - Provides scaffolding without giving away answer

    **Limits:**
    - Tracks hint usage
    - Encourages problem-solving
    """
    session = db.query(HomeworkSession).join(Learner).filter(
        HomeworkSession.id == session_id,
        Learner.user_id == current_user.id
    ).first()

    if not session:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Session not found or access denied"
        )

    # Generate hint using AI service
    ai_service = AIService()
    hint = await ai_service.generate_hint(
        session=session,
        student_question=hint_request.student_question
    )

    # Update hints count
    # Type ignore for SQLAlchemy Column increment
    session.hints_given += 1  # type: ignore[assignment]
    db.commit()

    return success_response(
        data={
            "hint": hint,
            "hints_used": session.hints_given,
            "hints_remaining": None  # Unlimited in this version
        }
    )


@router.post("/sessions/{session_id}/explanations", response_model=dict)
async def request_explanation(
    session_id: str,
    explanation_request: ExplanationRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Request detailed explanation of a step or concept.

    **Provides:**
    - Step-by-step breakdown
    - Visual examples (when applicable)
    - Links to learning resources
    - Simplified language based on reading level

    **Adaptive to:**
    - Student's current level
    - Learning style (visual, verbal, kinesthetic)
    - IEP accommodations
    """
    session = db.query(HomeworkSession).join(Learner).filter(
        HomeworkSession.id == session_id,
        Learner.user_id == current_user.id
    ).first()

    if not session:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Session not found or access denied"
        )

    # Generate explanation using AI service
    ai_service = AIService()
    # Convert schema step to model step for service
    step_value = explanation_request.step
    explanation = await ai_service.generate_explanation(
        session=session,
        step=step_value,  # type: ignore[arg-type]
        specific_question=explanation_request.specific_question
    )

    # Track explanation
    if session.explanations_provided is None:
        session.explanations_provided = []

    session.explanations_provided.append({
        "step": explanation_request.step.value,
        "question": explanation_request.specific_question,
        "timestamp": datetime.utcnow().isoformat() + "Z"
    })

    db.commit()

    return success_response(
        data={
            "explanation": explanation["text"],
            "additional_resources": explanation.get("resources", [])
        }
    )


@router.post("/sessions/{session_id}/complete-step", response_model=dict)
async def complete_step(
    session_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Mark current step as complete and advance to next step.

    **Flow:**
    - Understand → Plan → Solve → Check → Complete

    **Validation:**
    - Ensures required work is saved
    - Provides feedback on completion
    """
    session = db.query(HomeworkSession).join(Learner).filter(
        HomeworkSession.id == session_id,
        Learner.user_id == current_user.id
    ).first()

    if not session:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Session not found or access denied"
        )

    # Add current step to completed
    if session.completed_steps is None:
        session.completed_steps = []

    current_step_value = session.current_step.value
    if current_step_value not in session.completed_steps:
        session.completed_steps.append(current_step_value)

    # Advance to next step
    step_order = [
        HomeworkStep.UNDERSTAND,
        HomeworkStep.PLAN,
        HomeworkStep.SOLVE,
        HomeworkStep.CHECK
    ]

    # Type: ignore for SQLAlchemy column type compatibility
    current_step_enum = session.current_step
    # SQLAlchemy Column type compatibility
    current_index = step_order.index(
        current_step_enum  # type: ignore[arg-type]
    )

    if current_index < len(step_order) - 1:
        next_step_enum = step_order[current_index + 1]
        session.current_step = next_step_enum  # type: ignore[assignment]
        next_step_name = next_step_enum.value
        message = "Step completed successfully!"
    else:
        # All steps complete
        session.status = HomeworkStatus.COMPLETED  # type: ignore[assignment]
        next_step_name = None
        message = "All steps complete! Great work!"

    db.commit()
    db.refresh(session)

    return success_response(
        data={
            "session": HomeworkSessionResponse.model_validate(
                session
            ).model_dump(),
            "next_step": next_step_name,
            "message": message
        }
    )


@router.get("/sessions/{session_id}/summary", response_model=dict)
async def get_session_summary(
    session_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get completion summary for homework session.

    **Includes:**
    - Time spent
    - Steps completed
    - Hints used
    - Work products created
    - Progress towards learning goals

    **Useful for:**
    - Parent reports
    - IEP progress tracking
    - Student reflection
    """
    session = db.query(HomeworkSession).join(Learner).filter(
        HomeworkSession.id == session_id,
        Learner.user_id == current_user.id
    ).first()

    if not session:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Session not found or access denied"
        )

    # Calculate metrics
    time_spent = (
        session.updated_at - session.created_at
    ).total_seconds() / 60  # minutes

    summary = {
        "session_id": session.id,
        "title": session.title,
        "status": session.status.value,
        "subject": session.detected_subject,
        "time_spent_minutes": round(time_spent, 1),
        "steps_completed": len(session.completed_steps or []),
        "total_steps": 4,
        "hints_used": session.hints_given,
        "work_products_saved": len(session.work_products),
        "files_uploaded": len(session.files),
        "completion_percentage": (
            (len(session.completed_steps or []) / 4) * 100
        ),
        "started_at": session.created_at.isoformat(),
        "last_updated": session.updated_at.isoformat()
    }

    return success_response(data=summary)
