"""Self-regulation schemas for request/response validation."""
from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
from enum import Enum


class EmotionType(str, Enum):
    """Emotion types."""
    CALM = "calm"
    HAPPY = "happy"
    SAD = "sad"
    ANGRY = "angry"
    FRUSTRATED = "frustrated"
    ANXIOUS = "anxious"
    TIRED = "tired"
    EXCITED = "excited"


class ActivityType(str, Enum):
    """Regulation activity types."""
    BREATHING = "breathing"
    MOVEMENT = "movement"
    SENSORY = "sensory"
    GROUNDING = "grounding"
    VISUALIZATION = "visualization"


class EmotionState(BaseModel):
    """Schema for emotion state."""
    emotion: EmotionType
    level: int = Field(..., ge=1, le=5)
    trigger: Optional[str] = None


class RegulationActivity(BaseModel):
    """Schema for regulation activity metadata."""
    id: str
    type: ActivityType
    name: str
    description: str
    duration: int  # seconds
    instructions: List[str]
    icon: str
    difficulty: str = Field(..., pattern=r'^(easy|medium|advanced)$')
    best_for: List[str]


class RegulationSessionCreate(BaseModel):
    """Schema for creating regulation session."""
    learner_id: str = Field(..., min_length=36, max_length=36)
    activity_id: str
    emotion_before: EmotionState


class RegulationSessionComplete(BaseModel):
    """Schema for completing regulation session."""
    emotion_after: EmotionState
    notes: Optional[str] = None


class RegulationSessionResponse(BaseModel):
    """Schema for regulation session response."""
    id: str
    learner_id: str
    activity_id: str
    activity_type: str
    emotion_before: str
    emotion_before_level: int
    emotion_before_trigger: Optional[str] = None
    emotion_after: Optional[str] = None
    emotion_after_level: Optional[int] = None
    completed: bool
    duration_seconds: Optional[int] = None
    notes: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True


class EmotionCheckIn(BaseModel):
    """Schema for emotion check-in."""
    learner_id: str
    emotion: EmotionType
    level: int = Field(..., ge=1, le=5)
    trigger: Optional[str] = None
    context: Optional[str] = None  # activity_start | activity_end | check_in


class EmotionHistoryResponse(BaseModel):
    """Schema for emotion history response."""
    id: str
    learner_id: str
    emotion: str
    level: int
    trigger: Optional[str] = None
    strategy: Optional[str] = None
    context: Optional[str] = None
    created_at: datetime
    
    class Config:
        from_attributes = True


class ActivityRecommendation(BaseModel):
    """Schema for activity recommendation."""
    activities: List[RegulationActivity]
    reason: str
    emotion_detected: EmotionType
