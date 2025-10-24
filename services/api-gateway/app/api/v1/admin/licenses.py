"""
Admin Licensing Vault & District Management API

Operations Admin endpoints for:
- Creating vault entries
- Managing district accounts
- Provisioning licenses
- Bulk operations

Updated: 2025-10-23 21:52:51 UTC
By: aivo-ai
"""

from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import or_, func
from typing import List, Optional
from datetime import datetime

from app.core.database import get_db
from app.models.user import User
from app.models.license import (
    LicenseVault,
    LicensePool,
    LicenseV2,
    DistrictAccount,
    SchoolAccount,
    LicenseType,
    LicenseStatus,
    DistrictStatus
)
from app.schemas.license import (
    VaultEntryCreate,
    DistrictAccountCreate,
    ProvisionLicensesRequest,
    SchoolAccountCreate
)
from app.schemas.response import success_response, paginated_response
from app.api.deps import require_admin
from app.services.license_service import LicenseService

router = APIRouter()


# ==========================================
# LICENSE VAULT ENDPOINTS
# ==========================================

@router.post("/vault", response_model=dict, status_code=status.HTTP_201_CREATED)
async def create_vault_entry(
    entry_data: VaultEntryCreate,
    current_user: User = Depends(require_admin()),
    db: Session = Depends(get_db)
):
    """Create License Vault Entry - Admin Only"""
    license_service = LicenseService(db)
    
    vault_entry = license_service.create_vault_entry(
        license_type=entry_data.license_type,
        quantity=entry_data.quantity,
        valid_from=entry_data.valid_from,
        valid_until=entry_data.valid_until,
        created_by=current_user.id,
        created_reason=entry_data.created_reason,
        cost_per_license=entry_data.cost_per_license,
        notes=entry_data.notes
    )
    
    return success_response(
        data={
            "vault_entry_id": vault_entry.id,
            "license_type": vault_entry.license_type,
            "quantity": vault_entry.quantity,
            "quantity_remaining": vault_entry.quantity_remaining,
            "valid_from": vault_entry.valid_from.isoformat(),
            "valid_until": vault_entry.valid_until.isoformat(),
            "status": vault_entry.status,
            "created_at": vault_entry.created_at.isoformat()
        },
        meta={"message": f"Added {vault_entry.quantity} licenses to vault"}
    )


@router.get("/vault", response_model=dict)
async def list_vault_entries(
    license_type: Optional[LicenseType] = None,
    status_filter: Optional[LicenseStatus] = Query(None, alias="status"),
    page: int = Query(1, ge=1),
    page_size: int = Query(50, ge=1, le=100),
    current_user: User = Depends(require_admin()),
    db: Session = Depends(get_db)
):
    """List License Vault Entries - Admin Only"""
    query = db.query(LicenseVault)
    
    if license_type:
        query = query.filter(LicenseVault.license_type == license_type)
    if status_filter:
        query = query.filter(LicenseVault.status == status_filter)
    
    total = query.count()
    offset = (page - 1) * page_size
    
    entries = query.order_by(
        LicenseVault.created_at.desc()
    ).offset(offset).limit(page_size).all()
    
    return paginated_response(
        items=[
            {
                "vault_entry_id": entry.id,
                "license_type": entry.license_type,
                "quantity": entry.quantity,
                "quantity_remaining": entry.quantity_remaining,
                "quantity_allocated": entry.quantity - entry.quantity_remaining,
                "valid_from": entry.valid_from.isoformat(),
                "valid_until": entry.valid_until.isoformat(),
                "status": entry.status,
                "created_reason": entry.created_reason,
                "cost_per_license": float(entry.cost_per_license) if entry.cost_per_license else None,
                "created_at": entry.created_at.isoformat()
            }
            for entry in entries
        ],
        page=page,
        page_size=page_size,
        total=total
    )


@router.get("/vault/summary", response_model=dict)
async def get_vault_summary(
    current_user: User = Depends(require_admin()),
    db: Session = Depends(get_db)
):
    """Get Vault Summary - Admin Only"""
    license_service = LicenseService(db)
    summary = license_service.get_vault_summary()
    return success_response(data=summary)


# ==========================================
# DISTRICT ACCOUNT MANAGEMENT
# ==========================================

@router.post("/districts", response_model=dict, status_code=status.HTTP_201_CREATED)
async def create_district_account(
    district_data: DistrictAccountCreate,
    current_user: User = Depends(require_admin()),
    db: Session = Depends(get_db)
):
    """Create District Account - Admin Only"""
    license_service = LicenseService(db)
    
    try:
        total_contract_value = None
        if district_data.price_per_seat:
            total_contract_value = (
                district_data.price_per_seat * 
                district_data.total_seats_purchased
            )
        
        district = license_service.create_district_account(
            district_name=district_data.district_name,
            district_code=district_data.district_code,
            state=district_data.state,
            city=district_data.city,
            postal_codes=district_data.postal_codes,
            primary_contact_name=district_data.primary_contact_name,
            primary_contact_email=district_data.primary_contact_email,
            primary_contact_phone=district_data.primary_contact_phone,
            billing_contact_name=district_data.billing_contact_name,
            billing_contact_email=district_data.billing_contact_email,
            billing_contact_phone=district_data.billing_contact_phone,
            contract_start_date=district_data.contract_start_date,
            contract_end_date=district_data.contract_end_date,
            total_seats_purchased=district_data.total_seats_purchased,
            price_per_seat=district_data.price_per_seat,
            total_contract_value=total_contract_value,
            auto_renewal=district_data.auto_renewal,
            allow_teacher_self_registration=district_data.allow_teacher_self_registration,
            notes=district_data.notes,
            created_by=current_user.id
        )
        
        return success_response(
            data={
                "district_id": district.id,
                "district_name": district.district_name,
                "district_code": district.district_code,
                "state": district.state,
                "status": district.status,
                "contract_start_date": district.contract_start_date.isoformat(),
                "contract_end_date": district.contract_end_date.isoformat(),
                "total_seats_purchased": district.total_seats_purchased,
                "seats_available": district.seats_available,
                "total_contract_value": float(district.total_contract_value) if district.total_contract_value else None,
                "created_at": district.created_at.isoformat()
            },
            meta={"message": f"District created: {district.district_name}"}
        )
        
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )


@router.get("/districts", response_model=dict)
async def list_district_accounts(
    status_filter: Optional[DistrictStatus] = Query(None, alias="status"),
    state: Optional[str] = None,
    search: Optional[str] = None,
    page: int = Query(1, ge=1),
    page_size: int = Query(50, ge=1, le=100),
    current_user: User = Depends(require_admin()),
    db: Session = Depends(get_db)
):
    """List District Accounts - Admin Only"""
    query = db.query(DistrictAccount)
    
    if status_filter:
        query = query.filter(DistrictAccount.status == status_filter)
    if state:
        query = query.filter(DistrictAccount.state == state)
    if search:
        query = query.filter(
            or_(
                DistrictAccount.district_name.ilike(f"%{search}%"),
                DistrictAccount.district_code.ilike(f"%{search}%")
            )
        )
    
    total = query.count()
    offset = (page - 1) * page_size
    
    districts = query.order_by(
        DistrictAccount.created_at.desc()
    ).offset(offset).limit(page_size).all()
    
    return paginated_response(
        items=[
            {
                "district_id": district.id,
                "district_name": district.district_name,
                "district_code": district.district_code,
                "state": district.state,
                "city": district.city,
                "status": district.status,
                "contract_start_date": district.contract_start_date.isoformat(),
                "contract_end_date": district.contract_end_date.isoformat(),
                "total_seats_purchased": district.total_seats_purchased,
                "seats_allocated": district.seats_allocated,
                "seats_activated": district.seats_activated,
                "seats_available": district.seats_available,
                "utilization_percentage": round(
                    (district.seats_activated / district.total_seats_purchased * 100), 
                    1
                ) if district.total_seats_purchased > 0 else 0,
                "total_contract_value": float(district.total_contract_value) if district.total_contract_value else None,
                "auto_renewal": district.auto_renewal,
                "primary_contact_name": district.primary_contact_name,
                "primary_contact_email": district.primary_contact_email,
                "created_at": district.created_at.isoformat()
            }
            for district in districts
        ],
        page=page,
        page_size=page_size,
        total=total
    )


@router.get("/districts/{district_id}", response_model=dict)
async def get_district_details(
    district_id: str,
    current_user: User = Depends(require_admin()),
    db: Session = Depends(get_db)
):
    """Get District Account Details - Admin Only"""
    district = db.query(DistrictAccount).filter(
        DistrictAccount.id == district_id
    ).first()
    
    if not district:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"District {district_id} not found"
        )
    
    pools = db.query(LicensePool).filter(
        LicensePool.district_id == district_id
    ).all()
    
    schools = db.query(SchoolAccount).filter(
        SchoolAccount.district_id == district_id
    ).all()
    
    return success_response(
        data={
            "district_id": district.id,
            "district_name": district.district_name,
            "district_code": district.district_code,
            "state": district.state,
            "city": district.city,
            "postal_codes": district.postal_codes,
            "status": district.status,
            "contract_start_date": district.contract_start_date.isoformat(),
            "contract_end_date": district.contract_end_date.isoformat(),
            "days_until_expiry": (district.contract_end_date - datetime.utcnow()).days,
            "total_seats_purchased": district.total_seats_purchased,
            "seats_allocated": district.seats_allocated,
            "seats_activated": district.seats_activated,
            "seats_available": district.seats_available,
            "utilization_percentage": round(
                (district.seats_activated / district.total_seats_purchased * 100), 
                1
            ) if district.total_seats_purchased > 0 else 0,
            "price_per_seat": float(district.price_per_seat) if district.price_per_seat else None,
            "total_contract_value": float(district.total_contract_value) if district.total_contract_value else None,
            "primary_contact_name": district.primary_contact_name,
            "primary_contact_email": district.primary_contact_email,
            "primary_contact_phone": district.primary_contact_phone,
            "billing_contact_name": district.billing_contact_name,
            "billing_contact_email": district.billing_contact_email,
            "auto_renewal": district.auto_renewal,
            "allow_teacher_self_registration": district.allow_teacher_self_registration,
            "license_pools": [
                {
                    "pool_id": pool.id,
                    "pool_name": pool.pool_name,
                    "pool_code": pool.pool_code,
                    "total_licenses": pool.total_licenses,
                    "licenses_generated": pool.licenses_generated,
                    "licenses_remaining": pool.licenses_remaining,
                    "created_at": pool.created_at.isoformat()
                }
                for pool in pools
            ],
            "schools": [
                {
                    "school_id": school.id,
                    "school_name": school.school_name,
                    "city": school.city,
                    "seats_allocated": school.seats_allocated,
                    "seats_used": school.seats_used
                }
                for school in schools
            ],
            "notes": district.notes,
            "created_at": district.created_at.isoformat(),
            "updated_at": district.updated_at.isoformat()
        }
    )


# ==========================================
# LICENSE PROVISIONING
# ==========================================

@router.post("/districts/{district_id}/provision", response_model=dict)
async def provision_licenses_to_district(
    district_id: str,
    provision_data: ProvisionLicensesRequest,
    current_user: User = Depends(require_admin()),
    db: Session = Depends(get_db)
):
    """Provision Licenses to District - Admin Only"""
    license_service = LicenseService(db)
    
    try:
        result = license_service.provision_licenses_to_district(
            district_id=district_id,
            quantity=provision_data.quantity,
            seats_per_license=provision_data.seats_per_license,
            vault_entry_id=provision_data.vault_entry_id,
            pool_name=provision_data.pool_name,
            performed_by=current_user.id
        )
        
        return success_response(
            data=result,
            meta={"message": f"Provisioned {provision_data.quantity} licenses"}
        )
        
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )


@router.get("/districts/{district_id}/licenses", response_model=dict)
async def get_district_licenses(
    district_id: str,
    pool_id: Optional[str] = None,
    status_filter: Optional[LicenseStatus] = Query(None, alias="status"),
    page: int = Query(1, ge=1),
    page_size: int = Query(100, ge=1, le=500),
    current_user: User = Depends(require_admin()),
    db: Session = Depends(get_db)
):
    """Get District Licenses - Admin Only"""
    district = db.query(DistrictAccount).filter(
        DistrictAccount.id == district_id
    ).first()
    
    if not district:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"District {district_id} not found"
        )
    
    query = db.query(LicenseV2).join(LicensePool).filter(
        LicensePool.district_id == district_id
    )
    
    if pool_id:
        query = query.filter(LicenseV2.pool_id == pool_id)
    if status_filter:
        query = query.filter(LicenseV2.status == status_filter)
    
    total = query.count()
    offset = (page - 1) * page_size
    
    licenses = query.order_by(
        LicenseV2.created_at.desc()
    ).offset(offset).limit(page_size).all()
    
    return paginated_response(
        items=[
            {
                "license_id": lic.license_id,
                "pool_code": lic.pool.pool_code,
                "status": lic.status,
                "total_seats": lic.total_seats,
                "used_seats": lic.used_seats,
                "available_seats": lic.available_seats,
                "assigned_teacher_id": lic.assigned_teacher_id,
                "assigned_to_school": lic.assigned_to_school,
                "valid_from": lic.valid_from.isoformat(),
                "valid_until": lic.valid_until.isoformat(),
                "created_at": lic.created_at.isoformat()
            }
            for lic in licenses
        ],
        page=page,
        page_size=page_size,
        total=total
    )


# ==========================================
# SCHOOL MANAGEMENT
# ==========================================

@router.post("/districts/{district_id}/schools", response_model=dict, status_code=status.HTTP_201_CREATED)
async def create_school_account(
    district_id: str,
    school_data: SchoolAccountCreate,
    current_user: User = Depends(require_admin()),
    db: Session = Depends(get_db)
):
    """Create School Account - Admin Only"""
    license_service = LicenseService(db)
    
    try:
        school = license_service.create_school_account(
            district_id=district_id,
            school_name=school_data.school_name,
            school_code=school_data.school_code,
            address=school_data.address,
            city=school_data.city,
            state=school_data.state,
            postal_code=school_data.postal_code,
            principal_name=school_data.principal_name,
            principal_email=school_data.principal_email,
            admin_email=school_data.admin_email,
            created_by=current_user.id
        )
        
        return success_response(
            data={
                "school_id": school.id,
                "district_id": school.district_id,
                "school_name": school.school_name,
                "school_code": school.school_code,
                "city": school.city,
                "principal_name": school.principal_name,
                "principal_email": school.principal_email,
                "created_at": school.created_at.isoformat()
            },
            meta={"message": f"School created: {school.school_name}"}
        )
        
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )


# ==========================================
# USAGE ANALYTICS
# ==========================================

@router.get("/analytics/overview", response_model=dict)
async def get_licensing_analytics_overview(
    current_user: User = Depends(require_admin()),
    db: Session = Depends(get_db)
):
    """Licensing Analytics Overview - Admin Only"""
    # Vault stats
    vault_total = db.query(func.sum(LicenseVault.quantity)).scalar() or 0
    vault_remaining = db.query(func.sum(LicenseVault.quantity_remaining)).scalar() or 0
    
    # District stats
    total_districts = db.query(DistrictAccount).count()
    active_districts = db.query(DistrictAccount).filter(
        DistrictAccount.status == DistrictStatus.ACTIVE
    ).count()
    
    # Seat stats
    total_seats_purchased = db.query(func.sum(DistrictAccount.total_seats_purchased)).scalar() or 0
    seats_activated = db.query(func.sum(DistrictAccount.seats_activated)).scalar() or 0
    
    # License stats
    total_licenses = db.query(LicenseV2).count()
    active_licenses = db.query(LicenseV2).filter(
        LicenseV2.status == LicenseStatus.ACTIVE
    ).count()
    
    return success_response(
        data={
            "vault": {
                "total_licenses": vault_total,
                "licenses_remaining": vault_remaining,
                "licenses_allocated": vault_total - vault_remaining,
                "allocation_percentage": round(
                    (vault_total - vault_remaining) / vault_total * 100, 1
                ) if vault_total > 0 else 0
            },
            "districts": {
                "total_districts": total_districts,
                "active_districts": active_districts,
                "trial_districts": db.query(DistrictAccount).filter(
                    DistrictAccount.status == DistrictStatus.TRIAL
                ).count(),
                "expired_districts": db.query(DistrictAccount).filter(
                    DistrictAccount.status == DistrictStatus.EXPIRED
                ).count()
            },
            "seats": {
                "total_seats_purchased": total_seats_purchased,
                "seats_activated": seats_activated,
                "seats_available": total_seats_purchased - seats_activated,
                "utilization_percentage": round(
                    seats_activated / total_seats_purchased * 100, 1
                ) if total_seats_purchased > 0 else 0
            },
            "licenses": {
                "total_licenses": total_licenses,
                "active_licenses": active_licenses,
                "available_licenses": db.query(LicenseV2).filter(
                    LicenseV2.status == LicenseStatus.AVAILABLE
                ).count(),
                "assigned_licenses": db.query(LicenseV2).filter(
                    LicenseV2.status == LicenseStatus.ASSIGNED
                ).count()
            },
            "generated_at": datetime.utcnow().isoformat()
        }
    )


@router.get("/analytics/districts/{district_id}/stats", response_model=dict)
async def get_district_usage_stats(
    district_id: str,
    current_user: User = Depends(require_admin()),
    db: Session = Depends(get_db)
):
    """Get District Usage Stats - Admin Only"""
    license_service = LicenseService(db)
    
    try:
        stats = license_service.get_district_usage_stats(district_id)
        return success_response(data=stats)
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e)
        )
