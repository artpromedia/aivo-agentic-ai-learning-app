"""
Learner management endpoints
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional, List, Dict
from datetime import date, datetime
import uuid
import logging

from app.core.database import get_db
from app.models.learner import Learner
from app.services.email_service import send_enrollment_confirmation

router = APIRouter()
logger = logging.getLogger(__name__)


class LearnerCreate(BaseModel):
    first_name: str
    last_name: str
    preferred_name: Optional[str] = None
    date_of_birth: str  # ISO format date string
    grade_level: str
    gender: Optional[str] = None
    diagnoses: Optional[List[str]] = []
    accommodations: Optional[List[str]] = []
    learning_strengths: Optional[List[str]] = []
    learning_challenges: Optional[List[str]] = []
    accessibility_preferences: Optional[Dict] = {}
    has_iep: Optional[bool] = False
    iep_details: Optional[Dict] = None
    parent_email: Optional[str] = None  # For enrollment notification
    parent_name: Optional[str] = None  # For enrollment notification


@router.get("/")
async def get_learners():
    """Get all learners"""
    return {"message": "Learners endpoint - Coming soon"}


@router.post("/")
async def create_learner(
    learner_data: LearnerCreate,
    db: Session = Depends(get_db)
):
    """Create new learner with comprehensive profile"""
    try:
        # Generate unique learner ID
        learner_id = str(uuid.uuid4())
        
        # Convert date string to date object
        dob = date.fromisoformat(learner_data.date_of_birth)
        
        # Calculate age
        today = datetime.now().date()
        age = today.year - dob.year - ((today.month, today.day) < (dob.month, dob.day))
        
        # Extract grade number from grade_level string (e.g., "4th Grade" -> 4)
        grade_num = 0
        if learner_data.grade_level:
            import re
            match = re.search(r'\d+', learner_data.grade_level)
            if match:
                grade_num = int(match.group())
        
        # Create learner record
        new_learner = Learner(
            id=learner_id,
            user_id=learner_id,  # Using same ID for now (would link to parent user in production)
            first_name=learner_data.first_name,
            last_name=learner_data.last_name,
            date_of_birth=dob,
            grade_level=grade_num,
            has_iep=learner_data.has_iep,
            diagnoses=learner_data.diagnoses,
            accommodations=learner_data.accommodations,
        )
        
        db.add(new_learner)
        db.commit()
        db.refresh(new_learner)
        
        # Send enrollment confirmation email
        if learner_data.parent_email and learner_data.parent_name:
            try:
                # Get enabled accessibility features
                enabled_features = []
                if learner_data.accessibility_preferences:
                    enabled_features = [
                        k for k, v in learner_data.accessibility_preferences.items()
                        if v is True
                    ]
                
                logger.info(f"Sending enrollment confirmation for learner {learner_id}")
                send_enrollment_confirmation(
                    parent_email=learner_data.parent_email,
                    parent_name=learner_data.parent_name,
                    learner_name=f"{new_learner.first_name} {new_learner.last_name}",
                    learner_id=new_learner.id,
                    grade_level=new_learner.grade_level,
                    age=age,
                    has_iep=new_learner.has_iep,
                    accessibility_features=enabled_features,
                )
                logger.info(f"✅ Enrollment email sent to {learner_data.parent_email}")
            except Exception as email_error:
                # Don't fail the enrollment if email fails
                logger.error(f"Failed to send enrollment email: {email_error}")
        
        return {
            "id": new_learner.id,
            "learner_id": new_learner.id,
            "first_name": new_learner.first_name,
            "last_name": new_learner.last_name,
            "grade_level": new_learner.grade_level,
            "message": "Learner created successfully",
            "email_sent": bool(learner_data.parent_email)
        }
        
    except ValueError as e:
        raise HTTPException(status_code=400, detail=f"Invalid date format: {str(e)}")
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to create learner: {str(e)}")


@router.get("/{learner_id}")
async def get_learner(
    learner_id: str,
    db: Session = Depends(get_db)
):
    """Get learner by ID with profile information"""
    learner = db.query(Learner).filter(Learner.id == learner_id).first()
    
    if not learner:
        raise HTTPException(status_code=404, detail="Learner not found")
    
    return {
        "learner_id": learner.id,
        "first_name": learner.first_name,
        "last_name": learner.last_name,
        "date_of_birth": learner.date_of_birth.isoformat() if learner.date_of_birth else None,
        "grade_level": learner.grade_level,
        "has_iep": learner.has_iep,
        "diagnoses": learner.diagnoses or [],
        "accommodations": learner.accommodations or [],
        "settings": learner.settings or {},
        "created_at": learner.created_at.isoformat() if learner.created_at else None
    }
