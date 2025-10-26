"""Learner schemas for request/response validation."""
from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import date, datetime


class LearnerBase(BaseModel):
    """Base learner schema."""
    first_name: str = Field(..., min_length=1, max_length=255)
    last_name: str = Field(..., min_length=1, max_length=255)
    date_of_birth: date
    grade_level: int = Field(..., ge=0, le=12)


class LearnerCreate(LearnerBase):
    """Schema for creating a learner."""
    current_reading_level: Optional[str] = None
    current_math_level: Optional[str] = None
    learning_themes: Optional[List[str]] = None
    diagnoses: Optional[List[str]] = None
    accommodations: Optional[Dict[str, Any]] = None
    has_iep: bool = False


class LearnerUpdate(BaseModel):
    """Schema for updating a learner."""
    first_name: Optional[str] = Field(None, min_length=1, max_length=255)
    last_name: Optional[str] = Field(None, min_length=1, max_length=255)
    grade_level: Optional[int] = Field(None, ge=0, le=12)
    current_reading_level: Optional[str] = None
    current_math_level: Optional[str] = None
    learning_themes: Optional[List[str]] = None
    diagnoses: Optional[List[str]] = None
    accommodations: Optional[Dict[str, Any]] = None
    settings: Optional[Dict[str, Any]] = None
    sensory_profile_id: Optional[str] = None


class LearnerResponse(LearnerBase):
    """Schema for learner response."""
    id: str
    user_id: str
    sensory_profile_id: Optional[str] = None
    current_reading_level: Optional[str] = None
    current_math_level: Optional[str] = None
    learning_themes: Optional[List[str]] = None
    diagnoses: Optional[List[str]] = None
    accommodations: Optional[Dict[str, Any]] = None
    has_iep: bool
    iep_document_url: Optional[str] = None
    settings: Optional[Dict[str, Any]] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
