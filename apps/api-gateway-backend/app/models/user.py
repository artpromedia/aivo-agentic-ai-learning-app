"""User model for authentication and authorization."""
from sqlalchemy import Column, String, Boolean, Enum as SQLEnum, JSON
from sqlalchemy.orm import relationship
import enum

from app.models.base import BaseModel


class UserRole(str, enum.Enum):
    """User role enumeration."""
    GLOBAL_ADMIN = "global_admin"
    FINANCE_ADMIN = "finance_admin"
    TECH_SUPPORT = "tech_support"
    LEGAL_COMPLIANCE = "legal_compliance"
    DISTRICT_ADMIN = "district_admin"
    SCHOOL_ADMIN = "school_admin"
    TEACHER = "teacher"
    PARENT = "parent"
    LEARNER = "learner"


class User(BaseModel):
    """User account model."""
    __tablename__ = "users"

    # Basic Info
    email = Column(String(255), unique=True, nullable=False, index=True)
    hashed_password = Column(String(255), nullable=False)
    full_name = Column(String(255), nullable=False)
    
    # Role & Status
    role = Column(SQLEnum(UserRole), nullable=False, default=UserRole.LEARNER)
    is_active = Column(Boolean, default=True, nullable=False)
    is_verified = Column(Boolean, default=False, nullable=False)
    
    # MFA
    mfa_enabled = Column(Boolean, default=False, nullable=False)
    mfa_secret = Column(String(255), nullable=True)
    
    # Preferences
    preferences = Column(JSON, nullable=True)
    # Example structure:
    # {
    #   "sensory_profile_id": "uuid",
    #   "emotion_check_ins": true,
    #   "enabled_features": {
    #     "sensory_profile": true,
    #     "emotion_check_ins": true,
    #     "visual_timers": true
    #   }
    # }
    
    # Relationships
    learners = relationship("Learner", back_populates="user", cascade="all, delete-orphan")
    sensory_profiles = relationship("SensoryProfile", back_populates="user", cascade="all, delete-orphan")
    
    def __repr__(self):
        return f"<User {self.email}>"
