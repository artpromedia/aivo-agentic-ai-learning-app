"""IEP (Individualized Education Program) models."""

import enum

from sqlalchemy import JSON, Boolean, Column, Date, ForeignKey, Integer, String, Text
from sqlalchemy import Enum as SQLEnum
from sqlalchemy.orm import relationship

from app.models.base import BaseModel


class IEPStatus(str, enum.Enum):
    """IEP document status."""

    ACTIVE = "active"
    DRAFT = "draft"
    REVIEW_DUE = "review-due"
    ARCHIVED = "archived"


class IEPGoalStatus(str, enum.Enum):
    """IEP goal status."""

    ON_TRACK = "on-track"
    NEEDS_ATTENTION = "needs-attention"
    EXCEEDING = "exceeding"
    NOT_STARTED = "not-started"


class IEP(BaseModel):
    """IEP (Individualized Education Program) document."""

    __tablename__ = "ieps"

    # Foreign Keys
    learner_id = Column(
        String(36), ForeignKey("learners.id"), nullable=False, index=True, unique=True
    )
    teacher_id = Column(String(36), ForeignKey("users.id"), nullable=False, index=True)

    # IEP Metadata
    status = Column(SQLEnum(IEPStatus), default=IEPStatus.DRAFT, nullable=False)
    case_manager = Column(String(255), nullable=False)

    # Dates
    date_created = Column(Date, nullable=False)
    last_modified = Column(Date, nullable=False)
    next_review = Column(Date, nullable=False)
    effective_date = Column(Date, nullable=True)

    # Contact Info
    parent_contact = Column(String(255), nullable=True)
    parent_phone = Column(String(50), nullable=True)
    parent_email = Column(String(255), nullable=True)

    # Services
    services = Column(JSON, nullable=True)
    # Example: [{"service": "Speech Therapy", "frequency": "2x/week", "provider": "Ms. Smith"}]

    # Notes
    notes = Column(Text, nullable=True)

    # Relationships
    learner = relationship("Learner", back_populates="iep")
    teacher = relationship("User", foreign_keys=[teacher_id])
    goals = relationship("IEPGoal", back_populates="iep", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<IEP {self.learner_id} - {self.status}>"


class IEPGoal(BaseModel):
    """IEP (Individualized Education Program) goal."""

    __tablename__ = "iep_goals"

    # Foreign Keys
    iep_id = Column(String(36), ForeignKey("ieps.id"), nullable=True, index=True)
    learner_id = Column(String(36), ForeignKey("learners.id"), nullable=False, index=True)

    # Goal Info
    goal_name = Column(String(500), nullable=False)
    goal_description = Column(Text, nullable=True)
    category = Column(String(100), nullable=False)
    # Category: reading | math | social | motor | communication

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
    iep = relationship("IEP", back_populates="goals")
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
