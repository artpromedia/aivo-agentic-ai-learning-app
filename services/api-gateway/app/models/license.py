"""
Complete Licensing & District Management Models

Handles:
- License vault (unassigned licenses pool)
- District accounts
- License pools per district
- License assignments
- Usage tracking

This extends the existing License and LicenseAssignment models from user.py
with enterprise-grade licensing management.

Updated: 2025-10-23 06:14:48 UTC
By: aivo-ai
"""

from sqlalchemy import (
    Column, String, Integer, Boolean, DateTime, ForeignKey, 
    Enum as SQLEnum, Text, DECIMAL, JSON
)
from sqlalchemy.orm import relationship
from datetime import datetime, timedelta
import enum

from app.models.base import BaseModel


class LicenseType(str, enum.Enum):
    """License type enumeration."""
    DISTRICT = "district"  # District-wide bulk license
    SCHOOL = "school"  # Single school license
    INDIVIDUAL = "individual"  # Individual teacher license
    TRIAL = "trial"  # Trial license (free)
    ENTERPRISE = "enterprise"  # Custom enterprise license


class LicenseStatus(str, enum.Enum):
    """License status."""
    AVAILABLE = "available"  # In vault, not assigned
    ASSIGNED = "assigned"  # Assigned to district/school
    ACTIVE = "active"  # In use by teachers
    SUSPENDED = "suspended"  # Temporarily suspended
    EXPIRED = "expired"  # Expired
    REVOKED = "revoked"  # Manually revoked


class DistrictStatus(str, enum.Enum):
    """District account status."""
    ACTIVE = "active"
    SUSPENDED = "suspended"
    TRIAL = "trial"
    EXPIRED = "expired"


# ==========================================
# DISTRICT ACCOUNTS
# ==========================================

class DistrictAccount(BaseModel):
    """
    District Account
    
    Represents a school district with bulk licensing.
    Created by Operations Admin.
    """
    __tablename__ = "district_accounts"

    # Basic Info
    district_name = Column(String(500), nullable=False)
    district_code = Column(String(100), unique=True, nullable=False, index=True)  # e.g., "LAUSD"
    
    # Location
    state = Column(String(100), nullable=False)
    city = Column(String(255), nullable=True)
    postal_codes = Column(JSON, nullable=True)  # Array of zip codes
    
    # Contact
    primary_contact_name = Column(String(255), nullable=False)
    primary_contact_email = Column(String(255), nullable=False)
    primary_contact_phone = Column(String(20), nullable=True)
    
    # Billing Contact (if different)
    billing_contact_name = Column(String(255), nullable=True)
    billing_contact_email = Column(String(255), nullable=True)
    billing_contact_phone = Column(String(20), nullable=True)
    
    # Status
    status = Column(SQLEnum(DistrictStatus), default=DistrictStatus.ACTIVE, nullable=False)
    
    # Contract Info
    contract_start_date = Column(DateTime, nullable=False)
    contract_end_date = Column(DateTime, nullable=False)
    total_seats_purchased = Column(Integer, nullable=False)
    
    # Usage
    seats_allocated = Column(Integer, default=0, nullable=False)  # Licenses created
    seats_activated = Column(Integer, default=0, nullable=False)  # Teachers using
    seats_available = Column(Integer, nullable=False)  # Computed: purchased - allocated
    
    # Pricing
    price_per_seat = Column(DECIMAL(10, 2), nullable=True)
    total_contract_value = Column(DECIMAL(12, 2), nullable=True)
    
    # Settings
    auto_renewal = Column(Boolean, default=True, nullable=False)
    allow_teacher_self_registration = Column(Boolean, default=True, nullable=False)
    
    # Notes
    notes = Column(Text, nullable=True)
    
    # Relationships
    license_pools = relationship("LicensePool", back_populates="district", cascade="all, delete-orphan")
    schools = relationship("SchoolAccount", back_populates="district", cascade="all, delete-orphan")
    
    def __repr__(self):
        return f"<DistrictAccount {self.district_name} ({self.district_code})>"


class SchoolAccount(BaseModel):
    """
    School Account under a District
    
    Individual schools within a district.
    """
    __tablename__ = "school_accounts"

    # Foreign Keys
    district_id = Column(String(36), ForeignKey("district_accounts.id"), nullable=False, index=True)
    
    # Basic Info
    school_name = Column(String(500), nullable=False)
    school_code = Column(String(100), nullable=True)  # Optional school code
    
    # Location
    address = Column(String(500), nullable=True)
    city = Column(String(255), nullable=True)
    state = Column(String(100), nullable=True)
    postal_code = Column(String(20), nullable=True)
    
    # Contact
    principal_name = Column(String(255), nullable=True)
    principal_email = Column(String(255), nullable=True)
    admin_email = Column(String(255), nullable=True)
    
    # Allocation
    seats_allocated = Column(Integer, default=0, nullable=False)
    seats_used = Column(Integer, default=0, nullable=False)
    
    # Status
    is_active = Column(Boolean, default=True, nullable=False)
    
    # Relationships
    district = relationship("DistrictAccount", back_populates="schools")
    
    def __repr__(self):
        return f"<SchoolAccount {self.school_name}>"


# ==========================================
# LICENSING VAULT
# ==========================================

class LicenseVault(BaseModel):
    """
    License Vault Entry
    
    Pool of unassigned licenses available for provisioning.
    Created by Operations Admin.
    """
    __tablename__ = "license_vault"

    # License Info
    license_type = Column(SQLEnum(LicenseType), nullable=False, index=True)
    status = Column(SQLEnum(LicenseStatus), default=LicenseStatus.AVAILABLE, nullable=False, index=True)
    
    # Quantity (for bulk entries)
    quantity = Column(Integer, default=1, nullable=False)
    quantity_remaining = Column(Integer, default=1, nullable=False)
    
    # Validity
    valid_from = Column(DateTime, nullable=False)
    valid_until = Column(DateTime, nullable=False)
    
    # Source
    created_by = Column(String(36), nullable=False)  # Admin user ID
    created_reason = Column(String(500), nullable=True)  # e.g., "Q1 2025 Bulk Purchase"
    
    # Pricing (if tracked)
    cost_per_license = Column(DECIMAL(10, 2), nullable=True)
    
    # Notes
    notes = Column(Text, nullable=True)
    
    def __repr__(self):
        return f"<LicenseVault {self.license_type} ({self.quantity_remaining}/{self.quantity} remaining)>"


class LicensePool(BaseModel):
    """
    License Pool
    
    Collection of licenses assigned to a specific district.
    Generated from License Vault.
    """
    __tablename__ = "license_pools"

    # Foreign Keys
    district_id = Column(String(36), ForeignKey("district_accounts.id"), nullable=False, index=True)
    vault_entry_id = Column(String(36), ForeignKey("license_vault.id"), nullable=True, index=True)
    
    # Pool Info
    pool_name = Column(String(255), nullable=False)  # e.g., "LAUSD Q1 2025"
    pool_code = Column(String(50), unique=True, nullable=False, index=True)
    
    # Allocation
    total_licenses = Column(Integer, nullable=False)
    licenses_generated = Column(Integer, default=0, nullable=False)
    licenses_remaining = Column(Integer, nullable=False)
    
    # Validity
    valid_from = Column(DateTime, nullable=False)
    valid_until = Column(DateTime, nullable=False)
    
    # Status
    is_active = Column(Boolean, default=True, nullable=False)
    
    # Created
    created_by = Column(String(36), nullable=False)
    
    # Relationships
    district = relationship("DistrictAccount", back_populates="license_pools")
    vault_entry = relationship("LicenseVault")
    licenses_v2 = relationship("LicenseV2", back_populates="pool", cascade="all, delete-orphan")
    
    def __repr__(self):
        return f"<LicensePool {self.pool_name} ({self.licenses_remaining}/{self.total_licenses} remaining)>"


class LicenseV2(BaseModel):
    """
    Individual License (Enhanced Version)
    
    6-digit license code that teachers use to register.
    Generated from License Pool.
    
    Note: This extends the existing License model from user.py
    with enhanced tracking and district management.
    """
    __tablename__ = "licenses_v2"

    # Foreign Keys
    pool_id = Column(String(36), ForeignKey("license_pools.id"), nullable=False, index=True)
    assigned_teacher_id = Column(String(36), ForeignKey("users.id"), nullable=True, index=True)
    
    # License Code
    license_id = Column(String(6), unique=True, nullable=False, index=True)
    
    # Type & Status
    license_type = Column(SQLEnum(LicenseType), nullable=False)
    status = Column(SQLEnum(LicenseStatus), default=LicenseStatus.AVAILABLE, nullable=False)
    
    # Allocation
    total_seats = Column(Integer, nullable=False)
    used_seats = Column(Integer, default=0, nullable=False)
    available_seats = Column(Integer, nullable=False)
    
    # Validity
    valid_from = Column(DateTime, nullable=False)
    valid_until = Column(DateTime, nullable=False)
    
    # Assignment
    assigned_at = Column(DateTime, nullable=True)
    assigned_to_school = Column(String(500), nullable=True)
    
    # Status changes
    activated_at = Column(DateTime, nullable=True)
    suspended_at = Column(DateTime, nullable=True)
    revoked_at = Column(DateTime, nullable=True)
    
    # Relationships
    pool = relationship("LicensePool", back_populates="licenses_v2")
    teacher = relationship("User", foreign_keys=[assigned_teacher_id])
    assignments_v2 = relationship("LicenseAssignmentV2", back_populates="license", cascade="all, delete-orphan")
    
    def __repr__(self):
        return f"<LicenseV2 {self.license_id} ({self.used_seats}/{self.total_seats} used)>"


class LicenseAssignmentV2(BaseModel):
    """
    License Assignment to Student (Enhanced Version)
    
    Tracks which students are assigned to which licenses.
    Links to the enhanced LicenseV2 model.
    """
    __tablename__ = "license_assignments_v2"

    # Foreign Keys
    license_v2_id = Column(String(36), ForeignKey("licenses_v2.id"), nullable=False, index=True)
    learner_id = Column(String(36), ForeignKey("learners.id"), nullable=False, index=True)
    teacher_id = Column(String(36), ForeignKey("users.id"), nullable=False, index=True)
    
    # Assignment Info
    assigned_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    assigned_by = Column(String(36), nullable=False)
    
    # Status
    is_active = Column(Boolean, default=True, nullable=False)
    deactivated_at = Column(DateTime, nullable=True)
    deactivated_reason = Column(String(500), nullable=True)
    
    # Relationships
    license = relationship("LicenseV2", back_populates="assignments_v2")
    learner = relationship("Learner")
    teacher = relationship("User", foreign_keys=[teacher_id])
    
    def __repr__(self):
        return f"<LicenseAssignmentV2 License {self.license_v2_id} → Learner {self.learner_id}>"


# ==========================================
# USAGE TRACKING
# ==========================================

class LicenseUsageLog(BaseModel):
    """
    License Usage Audit Log
    
    Tracks all license-related activities.
    """
    __tablename__ = "license_usage_logs"

    # Foreign Keys
    license_v2_id = Column(String(36), ForeignKey("licenses_v2.id"), nullable=True, index=True)
    district_id = Column(String(36), ForeignKey("district_accounts.id"), nullable=True, index=True)
    user_id = Column(String(36), ForeignKey("users.id"), nullable=True, index=True)
    
    # Event
    event_type = Column(String(100), nullable=False, index=True)  # created, assigned, activated, suspended, etc.
    event_description = Column(Text, nullable=True)
    
    # Event Metadata (renamed from 'metadata' to avoid SQLAlchemy conflict)
    event_metadata = Column(JSON, nullable=True)
    
    # Actor
    performed_by = Column(String(36), nullable=False)
    
    def __repr__(self):
        return f"<LicenseUsageLog {self.event_type} at {self.created_at}>"
