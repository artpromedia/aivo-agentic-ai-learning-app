"""
Training Module Models

Database models for professional development and training management.
"""
import enum
from datetime import datetime

from sqlalchemy import (
    Boolean,
    Column,
    DateTime,
    Enum as SQLEnum,
    Float,
    ForeignKey,
    Integer,
    String,
    Text,
)
from sqlalchemy.orm import relationship

from app.core.database import Base


class TrainingType(str, enum.Enum):
    """Training resource types."""
    VIDEO = "video"
    GUIDE = "guide"
    TEMPLATE = "template"
    WORKSHOP = "workshop"
    CERTIFICATION = "certification"


class DifficultyLevel(str, enum.Enum):
    """Training difficulty levels."""
    BEGINNER = "beginner"
    INTERMEDIATE = "intermediate"
    ADVANCED = "advanced"


class EnrollmentStatus(str, enum.Enum):
    """User enrollment status in training."""
    NOT_STARTED = "not_started"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"


class TrainingModule(Base):
    """Training module/resource."""
    __tablename__ = "training_modules"

    id = Column(String(36), primary_key=True)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=False)
    category = Column(String(100), nullable=False)
    type = Column(SQLEnum(TrainingType), nullable=False)
    difficulty = Column(SQLEnum(DifficultyLevel), nullable=False)
    duration = Column(Integer, nullable=False)  # Minutes
    rating = Column(Float, default=0.0)
    thumbnail_url = Column(String(512), nullable=True)
    content_url = Column(String(512), nullable=True)
    is_published = Column(Boolean, default=True)
    order = Column(Integer, default=0)
    
    # Metadata
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
    
    # Relationships
    enrollments = relationship("TrainingEnrollment", back_populates="module", cascade="all, delete-orphan")


class TrainingEnrollment(Base):
    """User enrollment in training module."""
    __tablename__ = "training_enrollments"

    id = Column(String(36), primary_key=True)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    module_id = Column(String(36), ForeignKey("training_modules.id", ondelete="CASCADE"), nullable=False)
    status = Column(SQLEnum(EnrollmentStatus), default=EnrollmentStatus.NOT_STARTED, nullable=False)
    progress = Column(Integer, default=0)  # Percentage 0-100
    started_at = Column(DateTime, nullable=True)
    completed_at = Column(DateTime, nullable=True)
    rating = Column(Float, nullable=True)  # User's rating after completion
    
    # Metadata
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
    
    # Relationships
    module = relationship("TrainingModule", back_populates="enrollments")
    user = relationship("User")


class Certification(Base):
    """User certification records."""
    __tablename__ = "certifications"

    id = Column(String(36), primary_key=True)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    module_id = Column(String(36), ForeignKey("training_modules.id", ondelete="CASCADE"), nullable=False)
    certificate_number = Column(String(100), unique=True, nullable=False)
    issued_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    expires_at = Column(DateTime, nullable=True)
    is_valid = Column(Boolean, default=True)
    
    # Metadata
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    
    # Relationships
    user = relationship("User")
    module = relationship("TrainingModule")
