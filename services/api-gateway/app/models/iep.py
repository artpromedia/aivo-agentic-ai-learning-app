"""IEP (Individualized Education Program) models."""
from sqlalchemy import Column, String, Integer, Date, ForeignKey, Text, Boolean, JSON, Enum as SQLEnum
from sqlalchemy.orm import relationship
import enum

from app.models.base import BaseModel


class IEPGoalStatus(str, enum.Enum):
    """IEP goal status."""
    ON_TRACK = "on-track"
    NEEDS_ATTENTION = "needs-attention"
    EXCEEDING = "exceeding"
    NOT_STARTED = "not-started"


class IEPGoal(BaseModel):
    """IEP (Individualized Education Program) goal."""
    __tablename__ = "iep_goals"

    # Foreign Keys
    learner_id = Column(String(36), ForeignKey("learners.id"), nullable=False, index=True)
    
    # Goal Info
    goal_name = Column(String(500), nullable=False)
    goal_description = Column(Text, nullable=True)
    category = Column(String(100), nullable=False)  # reading | math | social | motor | communication
    
    # Levels
    current_level = Column(String(255), nullable=False)
    target_level = Column(String(255), nullable=False)
    
    # Timeline
    start_date = Column(Date, nullable=False)
    target_date = Column(Date, nullable=False)
    
    # Progress
    progress_percentage = Column(Integer, default=0, nullable=False)  # 0-100
    status = Column(SQLEnum(IEPGoalStatus), default=IEPGoalStatus.NOT_STARTED, nullable=False)
    
    # Accommodations
    accommodations = Column(JSON, nullable=True)
    # Example: ["extra_time", "read_aloud", "visual_supports"]
    
    # Relationships
    learner = relationship("Learner", back_populates="iep_goals")
    data_points = relationship("IEPDataPoint", back_populates="goal", cascade="all, delete-orphan")
    
    def __repr__(self):
        return f"<IEPGoal {self.goal_name} - {self.progress_percentage}%>"


class IEPDataPoint(BaseModel):
    """Data point for IEP goal progress tracking."""
    __tablename__ = "iep_data_points"

    # Foreign Keys
    goal_id = Column(String(36), ForeignKey("iep_goals.id"), nullable=False, index=True)
    
    # Data
    value = Column(Integer, nullable=False)  # Numeric value (0-100 or specific metric)
    notes = Column(Text, nullable=True)
    recorded_by = Column(String(255), nullable=False)  # user_id or "system"
    
    # Relationships
    goal = relationship("IEPGoal", back_populates="data_points")
    
    def __repr__(self):
        return f"<IEPDataPoint value={self.value}>"
