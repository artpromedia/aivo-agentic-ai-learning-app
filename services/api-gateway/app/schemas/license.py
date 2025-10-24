"""
Pydantic Schemas for Licensing API

Request and response models for:
- License vault operations
- District management
- License provisioning
- Analytics

Updated: 2025-10-23 21:52:51 UTC
By: aivo-ai
"""

from pydantic import BaseModel, EmailStr, Field, validator
from typing import Optional, List
from datetime import datetime
from decimal import Decimal

from app.models.license import LicenseType, LicenseStatus, DistrictStatus


# ==========================================
# VAULT SCHEMAS
# ==========================================

class VaultEntryCreate(BaseModel):
    """Create vault entry request."""
    license_type: LicenseType
    quantity: int = Field(..., gt=0, description="Number of licenses")
    valid_from: datetime
    valid_until: datetime
    created_reason: Optional[str] = Field(
        None,
        max_length=500,
        description="Reason for creation"
    )
    cost_per_license: Optional[Decimal] = Field(
        None,
        ge=0,
        description="Cost per license in USD"
    )
    notes: Optional[str] = None

    @validator('valid_until')
    def validate_dates(cls, v, values):
        if 'valid_from' in values and v <= values['valid_from']:
            raise ValueError('valid_until must be after valid_from')
        return v

    class Config:
        json_schema_extra = {
            "example": {
                "license_type": "district",
                "quantity": 10000,
                "valid_from": "2025-09-01T00:00:00Z",
                "valid_until": "2026-06-30T23:59:59Z",
                "created_reason": "Q1 2025 Bulk Purchase",
                "cost_per_license": 50.00,
                "notes": "Annual district renewal batch"
            }
        }


class VaultEntryResponse(BaseModel):
    """Vault entry response."""
    vault_entry_id: str
    license_type: LicenseType
    status: LicenseStatus
    quantity: int
    quantity_remaining: int
    quantity_allocated: int
    valid_from: datetime
    valid_until: datetime
    created_reason: Optional[str]
    cost_per_license: Optional[Decimal]
    total_cost: Optional[Decimal]
    created_at: datetime

    class Config:
        from_attributes = True


# ==========================================
# DISTRICT SCHEMAS
# ==========================================

class DistrictAccountCreate(BaseModel):
    """Create district account request."""
    district_name: str = Field(..., min_length=1, max_length=500)
    district_code: str = Field(
        ...,
        min_length=2,
        max_length=100,
        description="Unique district code (e.g., LAUSD)"
    )
    state: str = Field(..., min_length=2, max_length=100)
    city: Optional[str] = Field(None, max_length=255)
    postal_codes: Optional[List[str]] = None
    
    # Primary Contact
    primary_contact_name: str = Field(..., min_length=1, max_length=255)
    primary_contact_email: EmailStr
    primary_contact_phone: Optional[str] = Field(None, max_length=20)
    
    # Billing Contact (optional)
    billing_contact_name: Optional[str] = Field(None, max_length=255)
    billing_contact_email: Optional[EmailStr] = None
    billing_contact_phone: Optional[str] = Field(None, max_length=20)
    
    # Contract
    contract_start_date: datetime
    contract_end_date: datetime
    total_seats_purchased: int = Field(..., gt=0)
    
    # Pricing
    price_per_seat: Optional[Decimal] = Field(None, ge=0)
    
    # Settings
    auto_renewal: bool = True
    allow_teacher_self_registration: bool = True
    
    # Notes
    notes: Optional[str] = None

    @validator('contract_end_date')
    def validate_contract_dates(cls, v, values):
        if 'contract_start_date' in values and v <= values['contract_start_date']:
            raise ValueError('contract_end_date must be after contract_start_date')
        return v

    @validator('district_code')
    def validate_district_code(cls, v):
        # Only alphanumeric and underscores/hyphens
        import re
        if not re.match(r'^[A-Z0-9_-]+$', v):
            raise ValueError(
                'district_code must contain only uppercase letters, '
                'numbers, underscores, and hyphens'
            )
        return v

    class Config:
        json_schema_extra = {
            "example": {
                "district_name": "Los Angeles Unified School District",
                "district_code": "LAUSD",
                "state": "CA",
                "city": "Los Angeles",
                "postal_codes": ["90001", "90002", "90003"],
                "primary_contact_name": "Dr. Jane Smith",
                "primary_contact_email": "jsmith@lausd.net",
                "primary_contact_phone": "+1-213-555-0100",
                "contract_start_date": "2025-09-01T00:00:00Z",
                "contract_end_date": "2026-06-30T23:59:59Z",
                "total_seats_purchased": 10000,
                "price_per_seat": 45.00,
                "auto_renewal": True,
                "allow_teacher_self_registration": True,
                "notes": "10-year partnership since 2015"
            }
        }


class DistrictAccountResponse(BaseModel):
    """District account response."""
    district_id: str
    district_name: str
    district_code: str
    state: str
    city: Optional[str]
    status: DistrictStatus
    contract_start_date: datetime
    contract_end_date: datetime
    total_seats_purchased: int
    seats_allocated: int
    seats_activated: int
    seats_available: int
    utilization_percentage: float
    total_contract_value: Optional[Decimal]
    primary_contact_name: str
    primary_contact_email: str
    auto_renewal: bool
    created_at: datetime

    class Config:
        from_attributes = True


# ==========================================
# LICENSE PROVISIONING SCHEMAS
# ==========================================

class ProvisionLicensesRequest(BaseModel):
    """Provision licenses to district request."""
    quantity: int = Field(..., gt=0, description="Number of licenses to create")
    seats_per_license: int = Field(
        ...,
        gt=0,
        le=100,
        description="Student seats per license (typically 30)"
    )
    vault_entry_id: Optional[str] = Field(
        None,
        description="Source vault entry ID (optional)"
    )
    pool_name: Optional[str] = Field(
        None,
        max_length=255,
        description="Custom pool name (optional)"
    )

    class Config:
        json_schema_extra = {
            "example": {
                "quantity": 100,
                "seats_per_license": 30,
                "vault_entry_id": "vault_abc123",
                "pool_name": "LAUSD Q1 2025 Batch 1"
            }
        }


class ProvisionLicensesResponse(BaseModel):
    """Provision licenses response."""
    pool_id: str
    pool_code: str
    pool_name: str
    licenses_created: int
    total_seats: int
    license_codes: List[str]
    valid_from: str
    valid_until: str

    class Config:
        json_schema_extra = {
            "example": {
                "pool_id": "pool_xyz789",
                "pool_code": "LAUSD_202510_1",
                "pool_name": "LAUSD Q1 2025 Batch 1",
                "licenses_created": 100,
                "total_seats": 3000,
                "license_codes": ["ABC123", "DEF456", "GHI789"],
                "valid_from": "2025-09-01T00:00:00",
                "valid_until": "2026-06-30T23:59:59"
            }
        }


# ==========================================
# LICENSE SCHEMAS
# ==========================================

class LicenseResponse(BaseModel):
    """Individual license response."""
    license_id: str
    pool_code: str
    license_type: LicenseType
    status: LicenseStatus
    total_seats: int
    used_seats: int
    available_seats: int
    assigned_teacher_id: Optional[str]
    assigned_to_school: Optional[str]
    valid_from: datetime
    valid_until: datetime
    created_at: datetime

    class Config:
        from_attributes = True


class BulkLicenseExport(BaseModel):
    """Bulk license export data."""
    license_code: str
    pool: str
    status: str
    total_seats: int
    used_seats: int
    available_seats: int
    valid_from: str
    valid_until: str
    assigned_school: Optional[str]
    created: str


# ==========================================
# SCHOOL SCHEMAS
# ==========================================

class SchoolAccountCreate(BaseModel):
    """Create school account request."""
    school_name: str = Field(..., min_length=1, max_length=500)
    school_code: Optional[str] = Field(None, max_length=100)
    address: Optional[str] = Field(None, max_length=500)
    city: Optional[str] = Field(None, max_length=255)
    state: Optional[str] = Field(None, max_length=100)
    postal_code: Optional[str] = Field(None, max_length=20)
    principal_name: Optional[str] = Field(None, max_length=255)
    principal_email: Optional[EmailStr] = None
    admin_email: Optional[EmailStr] = None

    class Config:
        json_schema_extra = {
            "example": {
                "school_name": "Lincoln High School",
                "school_code": "LHS",
                "address": "123 Main Street",
                "city": "Los Angeles",
                "state": "CA",
                "postal_code": "90001",
                "principal_name": "Dr. Jane Doe",
                "principal_email": "jdoe@lincolnhs.lausd.net",
                "admin_email": "admin@lincolnhs.lausd.net"
            }
        }


class SchoolAccountResponse(BaseModel):
    """School account response."""
    school_id: str
    district_id: str
    school_name: str
    school_code: Optional[str]
    city: Optional[str]
    state: Optional[str]
    principal_name: Optional[str]
    principal_email: Optional[str]
    seats_allocated: int
    seats_used: int
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True


# ==========================================
# ANALYTICS SCHEMAS
# ==========================================

class VaultAnalytics(BaseModel):
    """Vault analytics data."""
    total_licenses: int
    licenses_remaining: int
    licenses_allocated: int
    allocation_percentage: float


class DistrictAnalytics(BaseModel):
    """District analytics data."""
    total_districts: int
    active_districts: int
    trial_districts: int
    expired_districts: int


class SeatAnalytics(BaseModel):
    """Seat analytics data."""
    total_seats_purchased: int
    seats_activated: int
    seats_available: int
    utilization_percentage: float


class LicenseAnalytics(BaseModel):
    """License analytics data."""
    total_licenses: int
    active_licenses: int
    available_licenses: int
    assigned_licenses: int


class LicensingOverviewAnalytics(BaseModel):
    """Complete licensing analytics overview."""
    vault: VaultAnalytics
    districts: DistrictAnalytics
    seats: SeatAnalytics
    licenses: LicenseAnalytics
    generated_at: datetime


# ==========================================
# LICENSE SEARCH SCHEMAS
# ==========================================

class LicenseSearchRequest(BaseModel):
    """License search request."""
    license_code: Optional[str] = Field(None, description="Exact license code")
    district_id: Optional[str] = None
    pool_id: Optional[str] = None
    status: Optional[LicenseStatus] = None
    assigned_teacher_id: Optional[str] = None
    school_name: Optional[str] = None

    class Config:
        json_schema_extra = {
            "example": {
                "license_code": "ABC123",
                "status": "active",
                "school_name": "Lincoln High"
            }
        }


# ==========================================
# LICENSE ACTION SCHEMAS
# ==========================================

class LicenseSuspendRequest(BaseModel):
    """Suspend license request."""
    reason: str = Field(..., min_length=1, max_length=500)
    notes: Optional[str] = None

    class Config:
        json_schema_extra = {
            "example": {
                "reason": "Payment dispute - temporary suspension",
                "notes": "Pending resolution with district finance"
            }
        }


class LicenseRevokeRequest(BaseModel):
    """Revoke license request."""
    reason: str = Field(..., min_length=1, max_length=500)
    permanent: bool = Field(
        True,
        description="If True, license cannot be reactivated"
    )
    notes: Optional[str] = None

    class Config:
        json_schema_extra = {
            "example": {
                "reason": "Contract termination",
                "permanent": True,
                "notes": "District requested full cancellation"
            }
        }


class LicenseReactivateRequest(BaseModel):
    """Reactivate suspended license request."""
    notes: Optional[str] = None

    class Config:
        json_schema_extra = {
            "example": {
                "notes": "Payment resolved, reactivating license"
            }
        }


# ==========================================
# USAGE LOG SCHEMAS
# ==========================================

class LicenseUsageLogResponse(BaseModel):
    """Usage log entry response."""
    log_id: str
    event_type: str
    event_description: Optional[str]
    license_v2_id: Optional[str]
    district_id: Optional[str]
    user_id: Optional[str]
    performed_by: str
    metadata: Optional[dict]
    created_at: datetime

    class Config:
        from_attributes = True
