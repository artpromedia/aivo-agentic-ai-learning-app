"""
Enhanced User model with authentication, onboarding, and license management.

Updated: 2025-10-26 (PROMPT 65 - Teacher Licensing)
By: aivo-ai
"""
import enum
from datetime import datetime

from sqlalchemy import (
    Boolean,
    Column,
    DateTime,
    Enum as SQLEnum,
    ForeignKey,
    Integer,
    JSON,
    String,
)
from sqlalchemy.orm import relationship

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


class OnboardingStatus(str, enum.Enum):
    """User onboarding status for progressive onboarding flow."""
    PENDING = "pending"  # Registered but not completed
    PROFILE_COMPLETE = "profile_complete"  # Profile filled
    CHILD_ADDED = "child_added"  # At least one learner added
    # Learner added, assessment not done:
    ASSESSMENT_PENDING = "assessment_pending"
    # Baseline assessment completed:
    ASSESSMENT_COMPLETE = "assessment_complete"
    COMPLETE = "complete"  # Full onboarding complete


class User(BaseModel):
    """User account model with enhanced onboarding and license support."""
    __tablename__ = "users"

    # Authentication
    email = Column(String(255), unique=True, nullable=False, index=True)
    hashed_password = Column(String(255), nullable=False)
    
    # Profile
    full_name = Column(String(255), nullable=False)
    phone = Column(String(20), nullable=True)
    
    # Role & Status
    role = Column(
        SQLEnum(UserRole),
        nullable=False,
        default=UserRole.LEARNER
    )
    is_active = Column(Boolean, default=True, nullable=False)
    is_verified = Column(Boolean, default=False, nullable=False)
    
    # Onboarding - Progressive onboarding flow tracking
    onboarding_status = Column(
        SQLEnum(OnboardingStatus),
        default=OnboardingStatus.PENDING,
        nullable=False
    )
    onboarding_completed_at = Column(DateTime, nullable=True)
    
    # Teacher-specific fields
    school_name = Column(String(500), nullable=True)
    district_name = Column(String(500), nullable=True)
    license_id = Column(String(6), nullable=True, index=True)  # 6-digit
    
    # Security
    last_login = Column(DateTime, nullable=True)
    email_verified_at = Column(DateTime, nullable=True)
    password_reset_token = Column(String(255), nullable=True)
    password_reset_expires = Column(DateTime, nullable=True)
    
    # MFA
    mfa_enabled = Column(Boolean, default=False, nullable=False)
    mfa_secret = Column(String(255), nullable=True)
    
    # Preferences
    preferences = Column(JSON, nullable=True)
    
    # Relationships
    learners = relationship(
        "Learner",
        back_populates="user",
        cascade="all, delete-orphan"
    )
    sensory_profiles = relationship(
        "SensoryProfile",
        back_populates="user",
        cascade="all, delete-orphan"
    )
    refresh_tokens = relationship(
        "RefreshToken",
        back_populates="user",
        cascade="all, delete-orphan"
    )
    settings = relationship(
        "UserSettings",
        back_populates="user",
        uselist=False,
        cascade="all, delete-orphan"
    )
    sessions = relationship(
        "UserSession",
        back_populates="user",
        cascade="all, delete-orphan"
    )
    integrations = relationship(
        "Integration",
        back_populates="user",
        cascade="all, delete-orphan"
    )
    
    def __repr__(self):
        return f"<User {self.email} ({self.role})>"


class License(BaseModel):
    """Teacher/District License Management."""
    __tablename__ = "licenses"

    # License Info
    license_key = Column(String(50), unique=True, nullable=False, index=True)  # Changed from license_id
    license_type = Column(String(50), nullable=False, default="individual")  # individual/district_bulk/school_bulk/classroom
    
    # Assignment
    district_id = Column(String(100), nullable=True)
    district_name = Column(String(255), nullable=True)
    school_name = Column(String(500), nullable=True)
    
    # Allocation
    used_seats = Column(Integer, default=0, nullable=False)
    
    # Validity
    expires_at = Column(DateTime, nullable=True)  # Changed from valid_from/valid_until
    status = Column(String(20), default="active", nullable=False)  # active/inactive/expired
    
    # License metadata (JSON field for flexible data)
    license_metadata = Column("metadata", JSON, nullable=True)  # Contains total_seats, grade_levels, subjects, features
    
    # Created by
    created_by_role = Column(String(20), default="parent", nullable=True)
    
    # Relationships
    assignments = relationship(
        "LicenseAssignment",
        back_populates="license",
        cascade="all, delete-orphan"
    )
    
    def __repr__(self):
        total_seats = 1
        if self.license_metadata and isinstance(self.license_metadata, dict):
            total_seats = self.license_metadata.get("total_seats", 1)
        return (
            f"<License {self.license_key} "
            f"({self.used_seats}/{total_seats} used)>"
        )


class LicenseAssignment(BaseModel):
    """Track which students are assigned to which licenses."""
    __tablename__ = "license_assignments"

    # Foreign Keys (using String IDs to match License model)
    license_id = Column(
        String(36),
        ForeignKey("licenses.id"),
        nullable=False,
        index=True
    )
    learner_id = Column(
        String(36),
        ForeignKey("learners.id"),
        nullable=False,
        index=True
    )
    teacher_id = Column(
        String(36),
        ForeignKey("users.id"),
        nullable=True,  # Can be null for parent enrollments
        index=True
    )
    
    # Assignment Info  
    assigned_at = Column(DateTime, nullable=False, default=lambda: datetime.utcnow())
    assigned_by_role = Column(String(20), default="teacher", nullable=True)  # teacher/parent/admin
    
    # Assignment metadata (JSON field for flexible data)
    assignment_metadata = Column("metadata", JSON, nullable=True)
    
    # Relationships
    license = relationship("License", back_populates="assignments")
    learner = relationship("Learner")
    teacher = relationship("User", foreign_keys=[teacher_id])
    
    def __repr__(self):
        return (
            f"<LicenseAssignment {self.license_id} "
            f"→ Learner {self.learner_id}>"
        )


class RefreshToken(BaseModel):
    """JWT Refresh Token tracking for secure session management."""
    __tablename__ = "refresh_tokens"

    user_id = Column(
        String(36),
        ForeignKey("users.id"),
        nullable=False,
        index=True
    )
    token = Column(String(500), unique=True, nullable=False, index=True)
    expires_at = Column(DateTime, nullable=False)
    is_revoked = Column(Boolean, default=False, nullable=False)
    
    # Relationships
    user = relationship("User", back_populates="refresh_tokens")
    
    def __repr__(self):
        return f"<RefreshToken for User {self.user_id}>"
