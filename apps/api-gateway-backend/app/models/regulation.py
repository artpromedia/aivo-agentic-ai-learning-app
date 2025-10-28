"""Self-regulation and emotion tracking models."""
from sqlalchemy import Column, String, Integer, ForeignKey, Boolean, Enum as SQLEnum, Text
from sqlalchemy.orm import relationship
import enum

from app.models.base import BaseModel


class EmotionType(str, enum.Enum):
    """Emotion types."""
    CALM = "calm"
    HAPPY = "happy"
    SAD = "sad"
    ANGRY = "angry"
    FRUSTRATED = "frustrated"
    ANXIOUS = "anxious"
    TIRED = "tired"
    EXCITED = "excited"


class RegulationSession(BaseModel):
    """Self-regulation activity session."""
    __tablename__ = "regulation_sessions"

    # Foreign Keys
    learner_id = Column(String(36), ForeignKey("learners.id"), nullable=False, index=True)
    
    # Activity
    activity_id = Column(String(100), nullable=False)  # e.g., "box-breathing"
    activity_type = Column(String(50), nullable=False)  # breathing | movement | sensory | grounding | visualization
    
    # Emotions
    emotion_before = Column(SQLEnum(EmotionType), nullable=False)
    emotion_before_level = Column(Integer, nullable=False)  # 1-5
    emotion_before_trigger = Column(Text, nullable=True)
    
    emotion_after = Column(SQLEnum(EmotionType), nullable=True)
    emotion_after_level = Column(Integer, nullable=True)  # 1-5
    
    # Session Info
    completed = Column(Boolean, default=False, nullable=False)
    duration_seconds = Column(Integer, nullable=True)
    notes = Column(Text, nullable=True)
    
    # Relationships
    learner = relationship("Learner", back_populates="regulation_sessions")
    
    def __repr__(self):
        return f"<RegulationSession {self.activity_id} - {self.completed}>"


class EmotionHistory(BaseModel):
    """Emotion check-in history."""
    __tablename__ = "emotion_history"

    # Foreign Keys
    learner_id = Column(String(36), ForeignKey("learners.id"), nullable=False, index=True)
    
    # Emotion Data
    emotion = Column(SQLEnum(EmotionType), nullable=False)
    level = Column(Integer, nullable=False)  # 1-5
    trigger = Column(Text, nullable=True)
    strategy = Column(Text, nullable=True)  # What helped
    
    # Context
    context = Column(String(100), nullable=True)  # activity_start | activity_end | check_in
    
    # Relationships
    learner = relationship("Learner", back_populates="emotion_history")
    
    def __repr__(self):
        return f"<EmotionHistory {self.emotion} level {self.level}>"
