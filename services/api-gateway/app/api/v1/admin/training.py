"""
Professional Development / Training API

Endpoints for managing training modules, enrollments, and certifications.
Created: 2025-10-26
"""
import uuid
from datetime import datetime
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.api.deps import get_db, require_admin
from app.models.training import (
    Certification,
    DifficultyLevel,
    EnrollmentStatus,
    TrainingEnrollment,
    TrainingModule,
    TrainingType,
)
from app.models import User

router = APIRouter()


# Pydantic Schemas
class TrainingModuleResponse(BaseModel):
    """Training module response schema."""
    id: str
    title: str
    description: str
    category: str
    type: TrainingType
    difficulty: DifficultyLevel
    duration: int
    rating: float
    thumbnail_url: Optional[str]
    content_url: Optional[str]
    is_published: bool
    completion_count: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class EnrollmentRequest(BaseModel):
    """Enrollment creation request."""
    user_id: str
    module_id: str


class EnrollmentResponse(BaseModel):
    """Enrollment response schema."""
    id: str
    user_id: str
    module_id: str
    status: EnrollmentStatus
    progress: int
    started_at: Optional[datetime]
    completed_at: Optional[datetime]
    rating: Optional[float]
    created_at: datetime
    updated_at: datetime
    
    # Nested data
    module_title: str
    user_name: str

    class Config:
        from_attributes = True


class ProgressUpdateRequest(BaseModel):
    """Progress update request."""
    progress: int  # 0-100
    rating: Optional[float] = None


class CertificationResponse(BaseModel):
    """Certification response schema."""
    id: str
    user_id: str
    module_id: str
    certificate_number: str
    issued_at: datetime
    expires_at: Optional[datetime]
    is_valid: bool
    module_title: str
    user_name: str

    class Config:
        from_attributes = True


class CertificationStatsResponse(BaseModel):
    """Certification statistics."""
    total_teachers: int
    certified: int
    in_progress: int
    not_started: int
    certification_rate: float


# Helper Functions
def enrich_module_response(
    module: TrainingModule,
    db: Session
) -> dict:
    """Add computed fields to module response."""
    completion_count = db.query(TrainingEnrollment).filter(
        TrainingEnrollment.module_id == module.id,
        TrainingEnrollment.status == EnrollmentStatus.COMPLETED
    ).count()
    
    module_dict = {
        "id": module.id,
        "title": module.title,
        "description": module.description,
        "category": module.category,
        "type": module.type,
        "difficulty": module.difficulty,
        "duration": module.duration,
        "rating": module.rating,
        "thumbnail_url": module.thumbnail_url,
        "content_url": module.content_url,
        "is_published": module.is_published,
        "completion_count": completion_count,
        "created_at": module.created_at,
        "updated_at": module.updated_at,
    }
    
    return module_dict


# API Endpoints
@router.get("/modules", response_model=List[TrainingModuleResponse])
async def list_training_modules(
    db: Session = Depends(get_db),
    category: Optional[str] = Query(None),
    type: Optional[TrainingType] = Query(None),
    difficulty: Optional[DifficultyLevel] = Query(None),
    limit: int = Query(50, ge=1, le=100),
    offset: int = Query(0, ge=0),
    _: dict = Depends(require_admin),
):
    """
    List all training modules with optional filtering.
    
    Filters:
    - category: Filter by category
    - type: Filter by training type
    - difficulty: Filter by difficulty level
    """
    query = db.query(TrainingModule).filter(
        TrainingModule.is_published == True
    )
    
    if category:
        query = query.filter(TrainingModule.category == category)
    if type:
        query = query.filter(TrainingModule.type == type)
    if difficulty:
        query = query.filter(TrainingModule.difficulty == difficulty)
    
    modules = query.order_by(
        TrainingModule.order,
        TrainingModule.created_at.desc()
    ).offset(offset).limit(limit).all()
    
    # Enrich with completion count
    enriched_modules = [
        enrich_module_response(module, db) for module in modules
    ]
    
    return enriched_modules


@router.post("/enroll", response_model=EnrollmentResponse, status_code=201)
async def enroll_in_training(
    enrollment_data: EnrollmentRequest,
    db: Session = Depends(get_db),
    _: dict = Depends(require_admin),
):
    """
    Enroll a user in a training module.
    """
    # Check if module exists
    module = db.query(TrainingModule).filter(
        TrainingModule.id == enrollment_data.module_id
    ).first()
    if not module:
        raise HTTPException(status_code=404, detail="Training module not found")
    
    # Check if user exists
    user = db.query(User).filter(User.id == enrollment_data.user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Check if already enrolled
    existing = db.query(TrainingEnrollment).filter(
        TrainingEnrollment.user_id == enrollment_data.user_id,
        TrainingEnrollment.module_id == enrollment_data.module_id
    ).first()
    
    if existing:
        raise HTTPException(
            status_code=400,
            detail="User already enrolled in this module"
        )
    
    # Create enrollment
    enrollment = TrainingEnrollment(
        id=str(uuid.uuid4()),
        user_id=enrollment_data.user_id,
        module_id=enrollment_data.module_id,
        status=EnrollmentStatus.NOT_STARTED,
        progress=0,
    )
    
    db.add(enrollment)
    db.commit()
    db.refresh(enrollment)
    
    # Return enriched response
    return {
        "id": enrollment.id,
        "user_id": enrollment.user_id,
        "module_id": enrollment.module_id,
        "status": enrollment.status,
        "progress": enrollment.progress,
        "started_at": enrollment.started_at,
        "completed_at": enrollment.completed_at,
        "rating": enrollment.rating,
        "created_at": enrollment.created_at,
        "updated_at": enrollment.updated_at,
        "module_title": module.title,
        "user_name": user.full_name,
    }


@router.get("/progress", response_model=List[EnrollmentResponse])
async def get_user_progress(
    user_id: Optional[str] = Query(None),
    status: Optional[EnrollmentStatus] = Query(None),
    limit: int = Query(50, ge=1, le=100),
    offset: int = Query(0, ge=0),
    db: Session = Depends(get_db),
    _: dict = Depends(require_admin),
):
    """
    Get training progress for users.
    
    If user_id is provided, returns progress for that user.
    Otherwise returns progress for all users.
    """
    query = db.query(TrainingEnrollment).join(
        TrainingModule
    ).join(User)
    
    if user_id:
        query = query.filter(TrainingEnrollment.user_id == user_id)
    if status:
        query = query.filter(TrainingEnrollment.status == status)
    
    enrollments = query.order_by(
        TrainingEnrollment.created_at.desc()
    ).offset(offset).limit(limit).all()
    
    # Enrich with module and user info
    enriched = []
    for enrollment in enrollments:
        enriched.append({
            "id": enrollment.id,
            "user_id": enrollment.user_id,
            "module_id": enrollment.module_id,
            "status": enrollment.status,
            "progress": enrollment.progress,
            "started_at": enrollment.started_at,
            "completed_at": enrollment.completed_at,
            "rating": enrollment.rating,
            "created_at": enrollment.created_at,
            "updated_at": enrollment.updated_at,
            "module_title": enrollment.module.title,
            "user_name": enrollment.user.full_name,
        })
    
    return enriched


@router.patch("/progress/{enrollment_id}", response_model=EnrollmentResponse)
async def update_progress(
    enrollment_id: str,
    progress_data: ProgressUpdateRequest,
    db: Session = Depends(get_db),
    _: dict = Depends(require_admin),
):
    """
    Update training progress for an enrollment.
    
    Automatically marks as completed if progress reaches 100%.
    """
    enrollment = db.query(TrainingEnrollment).filter(
        TrainingEnrollment.id == enrollment_id
    ).first()
    
    if not enrollment:
        raise HTTPException(status_code=404, detail="Enrollment not found")
    
    # Update progress
    enrollment.progress = min(100, max(0, progress_data.progress))
    
    # Update status based on progress
    if enrollment.progress == 0:
        enrollment.status = EnrollmentStatus.NOT_STARTED
        enrollment.started_at = None
    elif enrollment.progress == 100:
        enrollment.status = EnrollmentStatus.COMPLETED
        if not enrollment.completed_at:
            enrollment.completed_at = datetime.utcnow()
    else:
        enrollment.status = EnrollmentStatus.IN_PROGRESS
        if not enrollment.started_at:
            enrollment.started_at = datetime.utcnow()
    
    # Update rating if provided
    if progress_data.rating is not None:
        enrollment.rating = progress_data.rating
        
        # Update module average rating
        avg_rating = db.query(func.avg(TrainingEnrollment.rating)).filter(
            TrainingEnrollment.module_id == enrollment.module_id,
            TrainingEnrollment.rating.isnot(None)
        ).scalar()
        
        if avg_rating:
            enrollment.module.rating = float(avg_rating)
    
    db.commit()
    db.refresh(enrollment)
    
    # Return enriched response
    return {
        "id": enrollment.id,
        "user_id": enrollment.user_id,
        "module_id": enrollment.module_id,
        "status": enrollment.status,
        "progress": enrollment.progress,
        "started_at": enrollment.started_at,
        "completed_at": enrollment.completed_at,
        "rating": enrollment.rating,
        "created_at": enrollment.created_at,
        "updated_at": enrollment.updated_at,
        "module_title": enrollment.module.title,
        "user_name": enrollment.user.full_name,
    }


@router.get("/certifications", response_model=List[CertificationResponse])
async def list_certifications(
    user_id: Optional[str] = Query(None),
    is_valid: Optional[bool] = Query(None),
    limit: int = Query(50, ge=1, le=100),
    offset: int = Query(0, ge=0),
    db: Session = Depends(get_db),
    _: dict = Depends(require_admin),
):
    """
    List certifications.
    
    If user_id is provided, returns certifications for that user.
    Otherwise returns all certifications.
    """
    query = db.query(Certification).join(
        TrainingModule
    ).join(User)
    
    if user_id:
        query = query.filter(Certification.user_id == user_id)
    if is_valid is not None:
        query = query.filter(Certification.is_valid == is_valid)
    
    certifications = query.order_by(
        Certification.issued_at.desc()
    ).offset(offset).limit(limit).all()
    
    # Enrich with module and user info
    enriched = []
    for cert in certifications:
        enriched.append({
            "id": cert.id,
            "user_id": cert.user_id,
            "module_id": cert.module_id,
            "certificate_number": cert.certificate_number,
            "issued_at": cert.issued_at,
            "expires_at": cert.expires_at,
            "is_valid": cert.is_valid,
            "module_title": cert.module.title,
            "user_name": cert.user.full_name,
        })
    
    return enriched


@router.get("/certifications/stats", response_model=CertificationStatsResponse)
async def get_certification_stats(
    db: Session = Depends(get_db),
    _: dict = Depends(require_admin),
):
    """
    Get certification statistics across all teachers.
    """
    # Count total teachers
    total_teachers = db.query(User).filter(
        User.role == "teacher"
    ).count()
    
    # Count certified teachers (have at least one valid certification)
    certified = db.query(func.count(func.distinct(Certification.user_id))).filter(
        Certification.is_valid == True
    ).scalar() or 0
    
    # Count teachers with in-progress training
    in_progress = db.query(
        func.count(func.distinct(TrainingEnrollment.user_id))
    ).join(User).filter(
        User.role == "teacher",
        TrainingEnrollment.status == EnrollmentStatus.IN_PROGRESS
    ).scalar() or 0
    
    # Calculate not started
    not_started = max(0, total_teachers - certified - in_progress)
    
    # Calculate certification rate
    certification_rate = (certified / total_teachers * 100) if total_teachers > 0 else 0
    
    return {
        "total_teachers": total_teachers,
        "certified": certified,
        "in_progress": in_progress,
        "not_started": not_started,
        "certification_rate": round(certification_rate, 2),
    }
