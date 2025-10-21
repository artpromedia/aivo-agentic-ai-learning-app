"""Learner model for student profiles."""
from sqlalchemy import Column, String, Integer, Date, ForeignKey, JSON, Boolean
from sqlalchemy.orm import relationship

from app.models.base import BaseModel


class Learner(BaseModel):
    """Learner (student) profile model."""
    __tablename__ = "learners"

    # Foreign Keys
    user_id = Column(String(36), ForeignKey("users.id"), nullable=False, index=True)
    sensory_profile_id = Column(String(36), ForeignKey("sensory_profiles.id"), nullable=True)
    
    # Basic Info
    first_name = Column(String(255), nullable=False)
    last_name = Column(String(255), nullable=False)
    date_of_birth = Column(Date, nullable=False)
    grade_level = Column(Integer, nullable=False)  # Actual grade (e.g., 7)
    
    # Learning Profile
    current_reading_level = Column(String(50), nullable=True)  # e.g., "3rd grade"
    current_math_level = Column(String(50), nullable=True)
    learning_themes = Column(JSON, nullable=True)  # ["K5", "MS", "HS"]
    
    # Diagnoses & Accommodations
    diagnoses = Column(JSON, nullable=True)
    # Example: ["ASD", "ADHD", "Dyslexia"]
    
    accommodations = Column(JSON, nullable=True)
    # Example: {
    #   "extended_time": true,
    #   "time_multiplier": 1.5,
    #   "read_aloud": true,
    #   "reduced_distractions": true
    # }
    
    # IEP
    has_iep = Column(Boolean, default=False, nullable=False)
    iep_document_url = Column(String(500), nullable=True)
    
    # Settings
    settings = Column(JSON, nullable=True)
    # Example: {
    #   "max_game_breaks": 3,
    #   "break_minutes": 5,
    #   "allow_manual_breaks": true
    # }
    
    # Relationships
    user = relationship("User", back_populates="learners")
    sensory_profile = relationship("SensoryProfile", foreign_keys=[sensory_profile_id])
    homework_sessions = relationship("HomeworkSession", back_populates="learner", cascade="all, delete-orphan")
    iep_goals = relationship("IEPGoal", back_populates="learner", cascade="all, delete-orphan")
    regulation_sessions = relationship("RegulationSession", back_populates="learner", cascade="all, delete-orphan")
    emotion_history = relationship("EmotionHistory", back_populates="learner", cascade="all, delete-orphan")
    progress_records = relationship("ProgressRecord", back_populates="learner", cascade="all, delete-orphan")
    
    def __repr__(self):
        return f"<Learner {self.first_name} {self.last_name}>"
