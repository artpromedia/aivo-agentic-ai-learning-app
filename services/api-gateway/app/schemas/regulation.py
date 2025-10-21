"""Regulation and emotion tracking schemas."""
from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime

from app.models.regulation import EmotionType


class RegulationSessionBase(BaseModel):
    """Base regulation session schema."""
    activity_id: str = Field(..., min_length=1, max_length=100)
    activity_type: str = Field(..., min_length=1, max_length=50)
    emotion_before: EmotionType
    emotion_before_level: int = Field(..., ge=1, le=5)


class RegulationSessionCreate(RegulationSessionBase):
    """Schema for creating a regulation session."""
    emotion_before_trigger: Optional[str] = None


class RegulationSessionUpdate(BaseModel):
    """Schema for updating a regulation session."""
    emotion_after: Optional[EmotionType] = None
    emotion_after_level: Optional[int] = Field(None, ge=1, le=5)
    completed: Optional[bool] = None
    duration_seconds: Optional[int] = Field(None, ge=0)
    notes: Optional[str] = None


class RegulationSessionResponse(RegulationSessionBase):
    """Schema for regulation session response."""
    id: str
    learner_id: str
    emotion_before_trigger: Optional[str] = None
    emotion_after: Optional[EmotionType] = None
    emotion_after_level: Optional[int] = None
    completed: bool
    duration_seconds: Optional[int] = None
    notes: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        orm_mode = True


class EmotionHistoryCreate(BaseModel):
    """Schema for creating an emotion history entry."""
    emotion: EmotionType
    level: int = Field(..., ge=1, le=5)
    trigger: Optional[str] = None
    strategy: Optional[str] = None
    context: Optional[str] = Field(None, max_length=100)


class EmotionHistoryResponse(BaseModel):
    """Schema for emotion history response."""
    id: str
    learner_id: str
    emotion: EmotionType
    level: int
    trigger: Optional[str] = None
    strategy: Optional[str] = None
    context: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        orm_mode = True
