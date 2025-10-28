"""Progress tracking schemas."""
from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime


class ProgressRecordBase(BaseModel):
    """Base progress record schema."""
    activity_type: str = Field(..., min_length=1, max_length=100)
    activity_id: str = Field(..., min_length=1, max_length=255)
    activity_name: str = Field(..., min_length=1, max_length=500)


class ProgressRecordCreate(ProgressRecordBase):
    """Schema for creating a progress record."""
    subject: Optional[str] = Field(None, max_length=100)
    grade_level: Optional[str] = Field(None, max_length=50)
    score: Optional[float] = Field(None, ge=0, le=100)
    time_spent_seconds: Optional[int] = Field(None, ge=0)
    completed: bool = False
    details: Optional[Dict[str, Any]] = None
    accommodations_used: Optional[List[str]] = None


class ProgressRecordUpdate(BaseModel):
    """Schema for updating a progress record."""
    score: Optional[float] = Field(None, ge=0, le=100)
    time_spent_seconds: Optional[int] = Field(None, ge=0)
    completed: Optional[bool] = None
    details: Optional[Dict[str, Any]] = None
    accommodations_used: Optional[List[str]] = None


class ProgressRecordResponse(ProgressRecordBase):
    """Schema for progress record response."""
    id: str
    learner_id: str
    subject: Optional[str] = None
    grade_level: Optional[str] = None
    score: Optional[float] = None
    time_spent_seconds: Optional[int] = None
    completed: bool
    details: Optional[Dict[str, Any]] = None
    accommodations_used: Optional[List[str]] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        orm_mode = True
