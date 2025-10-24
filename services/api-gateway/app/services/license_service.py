"""
License Management Service

Handles:
- License code generation (6-digit unique codes)
- Bulk license creation
- District provisioning
- Usage tracking

Updated: 2025-10-23 06:14:48 UTC
By: aivo-ai
"""

import logging
import secrets
import string
from typing import List, Dict, Any, Optional
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from sqlalchemy import and_, or_

from app.models.license import (
    LicenseVault,
    LicensePool,
    LicenseV2,
    DistrictAccount,
    SchoolAccount,
    LicenseUsageLog,
    LicenseType,
    LicenseStatus,
    DistrictStatus
)
from app.models.user import User

logger = logging.getLogger(__name__)


class LicenseService:
    """
    License Management Service
    
    Central service for all licensing operations.
    """
    
    def __init__(self, db: Session):
        self.db = db
    
    # ==========================================
    # LICENSE CODE GENERATION
    # ==========================================
    
    def generate_license_code(self) -> str:
        """
        Generate unique 6-digit alphanumeric license code.
        
        Format: ABC123 (3 letters + 3 digits for readability)
        
        Returns:
            str: Unique 6-character license code
        """
        max_attempts = 100
        
        for _ in range(max_attempts):
            # Generate: 3 uppercase letters + 3 digits
            letters = ''.join(secrets.choice(string.ascii_uppercase) for _ in range(3))
            digits = ''.join(secrets.choice(string.digits) for _ in range(3))
            code = letters + digits
            
            # Check uniqueness in both old and new license tables
            exists_v1 = self.db.query(User).join(
                User.__table__.alias()
            ).filter(
                User.__table__.c.license_id == code
            ).first() if hasattr(User, '__table__') else None
            
            exists_v2 = self.db.query(LicenseV2).filter(
                LicenseV2.license_id == code
            ).first()
            
            if not exists_v1 and not exists_v2:
                return code
        
        raise Exception("Failed to generate unique license code after 100 attempts")
    
    def generate_bulk_license_codes(self, quantity: int) -> List[str]:
        """
        Generate multiple unique license codes at once.
        
        Args:
            quantity: Number of codes to generate
            
        Returns:
            List of unique license codes
        """
        codes = set()
        
        while len(codes) < quantity:
            code = self.generate_license_code()
            codes.add(code)
        
        return list(codes)
    
    # ==========================================
    # VAULT MANAGEMENT
    # ==========================================
    
    def create_vault_entry(
        self,
        license_type: LicenseType,
        quantity: int,
        valid_from: datetime,
        valid_until: datetime,
        created_by: str,
        created_reason: Optional[str] = None,
        cost_per_license: Optional[float] = None,
        notes: Optional[str] = None
    ) -> LicenseVault:
        """
        Create entry in license vault (available license pool).
        
        Used by Operations Admin to add licenses to the system.
        
        Args:
            license_type: Type of license
            quantity: Number of licenses
            valid_from: Start date
            valid_until: End date
            created_by: Admin user ID
            created_reason: Reason for creation
            cost_per_license: Cost per license (optional)
            notes: Additional notes
            
        Returns:
            LicenseVault entry
        """
        vault_entry = LicenseVault(
            license_type=license_type,
            status=LicenseStatus.AVAILABLE,
            quantity=quantity,
            quantity_remaining=quantity,
            valid_from=valid_from,
            valid_until=valid_until,
            created_by=created_by,
            created_reason=created_reason,
            cost_per_license=cost_per_license,
            notes=notes
        )
        
        self.db.add(vault_entry)
        self.db.commit()
        self.db.refresh(vault_entry)
        
        # Log
        self._log_event(
            event_type="vault_entry_created",
            event_description=f"Created vault entry: {quantity} {license_type} licenses",
            performed_by=created_by,
            metadata={
                "vault_entry_id": vault_entry.id,
                "quantity": quantity,
                "license_type": license_type
            }
        )
        
        logger.info(f"Created vault entry: {quantity} {license_type} licenses")
        
        return vault_entry
    
    # ==========================================
    # DISTRICT MANAGEMENT
    # ==========================================
    
    def create_district_account(
        self,
        district_name: str,
        district_code: str,
        state: str,
        primary_contact_name: str,
        primary_contact_email: str,
        contract_start_date: datetime,
        contract_end_date: datetime,
        total_seats_purchased: int,
        created_by: str,
        city: Optional[str] = None,
        postal_codes: Optional[List[str]] = None,
        primary_contact_phone: Optional[str] = None,
        billing_contact_name: Optional[str] = None,
        billing_contact_email: Optional[str] = None,
        billing_contact_phone: Optional[str] = None,
        price_per_seat: Optional[float] = None,
        total_contract_value: Optional[float] = None,
        auto_renewal: bool = True,
        allow_teacher_self_registration: bool = True,
        notes: Optional[str] = None
    ) -> DistrictAccount:
        """
        Create new district account.
        
        Args:
            district_name: Full district name
            district_code: Short code (e.g., "LAUSD")
            state: State code
            primary_contact_name: Contact person
            primary_contact_email: Contact email
            contract_start_date: Contract start
            contract_end_date: Contract end
            total_seats_purchased: Total seats
            created_by: Admin user ID
            ... additional optional fields
            
        Returns:
            DistrictAccount
        """
        # Check if district code exists
        existing = self.db.query(DistrictAccount).filter(
            DistrictAccount.district_code == district_code
        ).first()
        
        if existing:
            raise ValueError(f"District code '{district_code}' already exists")
        
        district = DistrictAccount(
            district_name=district_name,
            district_code=district_code,
            state=state,
            city=city,
            postal_codes=postal_codes,
            primary_contact_name=primary_contact_name,
            primary_contact_email=primary_contact_email,
            primary_contact_phone=primary_contact_phone,
            billing_contact_name=billing_contact_name,
            billing_contact_email=billing_contact_email,
            billing_contact_phone=billing_contact_phone,
            contract_start_date=contract_start_date,
            contract_end_date=contract_end_date,
            total_seats_purchased=total_seats_purchased,
            seats_available=total_seats_purchased,
            price_per_seat=price_per_seat,
            total_contract_value=total_contract_value,
            auto_renewal=auto_renewal,
            allow_teacher_self_registration=allow_teacher_self_registration,
            status=DistrictStatus.ACTIVE,
            notes=notes
        )
        
        self.db.add(district)
        self.db.commit()
        self.db.refresh(district)
        
        # Log
        self._log_event(
            event_type="district_created",
            event_description=f"Created district: {district_name} ({district_code})",
            performed_by=created_by,
            district_id=district.id,
            metadata={
                "district_name": district_name,
                "total_seats": total_seats_purchased
            }
        )
        
        logger.info(f"Created district account: {district_name} ({district_code})")
        
        return district
    
    def provision_licenses_to_district(
        self,
        district_id: str,
        quantity: int,
        seats_per_license: int,
        vault_entry_id: Optional[str] = None,
        pool_name: Optional[str] = None,
        performed_by: str = None
    ) -> Dict[str, Any]:
        """
        Provision licenses from vault to district.
        
        Creates:
        1. License pool for the district
        2. Individual license codes
        
        Args:
            district_id: District to provision to
            quantity: Number of licenses to create
            seats_per_license: Seats per license (e.g., 30 students per teacher)
            vault_entry_id: Source vault entry (optional)
            pool_name: Name for the pool (optional)
            performed_by: Admin user ID
            
        Returns:
            Dict with pool info and license codes
        """
        district = self.db.query(DistrictAccount).filter(
            DistrictAccount.id == district_id
        ).first()
        
        if not district:
            raise ValueError(f"District {district_id} not found")
        
        # Check available seats
        total_seats_needed = quantity * seats_per_license
        if district.seats_available < total_seats_needed:
            raise ValueError(
                f"Insufficient seats. Need {total_seats_needed}, "
                f"available: {district.seats_available}"
            )
        
        # Check vault if specified
        if vault_entry_id:
            vault_entry = self.db.query(LicenseVault).filter(
                LicenseVault.id == vault_entry_id
            ).first()
            
            if not vault_entry or vault_entry.quantity_remaining < quantity:
                raise ValueError("Insufficient licenses in vault")
            
            # Deduct from vault
            vault_entry.quantity_remaining -= quantity
        
        # Create license pool
        pool_code = self._generate_pool_code(district.district_code)
        pool_name = pool_name or f"{district.district_name} - {datetime.utcnow().strftime('%Y-%m-%d')}"
        
        pool = LicensePool(
            district_id=district_id,
            vault_entry_id=vault_entry_id,
            pool_name=pool_name,
            pool_code=pool_code,
            total_licenses=quantity,
            licenses_remaining=quantity,
            valid_from=district.contract_start_date,
            valid_until=district.contract_end_date,
            created_by=performed_by
        )
        
        self.db.add(pool)
        self.db.flush()  # Get pool ID
        
        # Generate license codes
        license_codes = self.generate_bulk_license_codes(quantity)
        licenses = []
        
        for code in license_codes:
            license = LicenseV2(
                pool_id=pool.id,
                license_id=code,
                license_type=LicenseType.DISTRICT,
                status=LicenseStatus.AVAILABLE,
                total_seats=seats_per_license,
                available_seats=seats_per_license,
                valid_from=district.contract_start_date,
                valid_until=district.contract_end_date
            )
            
            self.db.add(license)
            licenses.append(license)
        
        # Update pool
        pool.licenses_generated = quantity
        
        # Update district allocation
        district.seats_allocated += total_seats_needed
        district.seats_available = district.total_seats_purchased - district.seats_allocated
        
        self.db.commit()
        
        # Log
        self._log_event(
            event_type="licenses_provisioned",
            event_description=f"Provisioned {quantity} licenses to {district.district_name}",
            performed_by=performed_by,
            district_id=district_id,
            metadata={
                "pool_id": pool.id,
                "quantity": quantity,
                "total_seats": total_seats_needed,
                "license_codes": license_codes
            }
        )
        
        logger.info(
            f"Provisioned {quantity} licenses to {district.district_name} "
            f"(Pool: {pool_code})"
        )
        
        return {
            "pool_id": pool.id,
            "pool_code": pool_code,
            "pool_name": pool_name,
            "licenses_created": quantity,
            "total_seats": total_seats_needed,
            "license_codes": license_codes,
            "valid_from": district.contract_start_date.isoformat(),
            "valid_until": district.contract_end_date.isoformat()
        }
    
    # ==========================================
    # SCHOOL MANAGEMENT
    # ==========================================
    
    def create_school_account(
        self,
        district_id: str,
        school_name: str,
        created_by: str,
        school_code: Optional[str] = None,
        address: Optional[str] = None,
        city: Optional[str] = None,
        state: Optional[str] = None,
        postal_code: Optional[str] = None,
        principal_name: Optional[str] = None,
        principal_email: Optional[str] = None,
        admin_email: Optional[str] = None
    ) -> SchoolAccount:
        """
        Create school account under a district.
        
        Args:
            district_id: Parent district ID
            school_name: School name
            created_by: Admin user ID
            ... additional optional fields
            
        Returns:
            SchoolAccount
        """
        district = self.db.query(DistrictAccount).filter(
            DistrictAccount.id == district_id
        ).first()
        
        if not district:
            raise ValueError(f"District {district_id} not found")
        
        school = SchoolAccount(
            district_id=district_id,
            school_name=school_name,
            school_code=school_code,
            address=address,
            city=city,
            state=state,
            postal_code=postal_code,
            principal_name=principal_name,
            principal_email=principal_email,
            admin_email=admin_email
        )
        
        self.db.add(school)
        self.db.commit()
        self.db.refresh(school)
        
        # Log
        self._log_event(
            event_type="school_created",
            event_description=f"Created school: {school_name} under {district.district_name}",
            performed_by=created_by,
            district_id=district_id,
            metadata={
                "school_id": school.id,
                "school_name": school_name
            }
        )
        
        logger.info(f"Created school: {school_name} under {district.district_name}")
        
        return school
    
    # ==========================================
    # ANALYTICS & REPORTING
    # ==========================================
    
    def get_district_usage_stats(self, district_id: str) -> Dict[str, Any]:
        """
        Get usage statistics for a district.
        
        Args:
            district_id: District ID
            
        Returns:
            Dict with usage stats
        """
        district = self.db.query(DistrictAccount).filter(
            DistrictAccount.id == district_id
        ).first()
        
        if not district:
            raise ValueError(f"District {district_id} not found")
        
        # Count pools
        pools = self.db.query(LicensePool).filter(
            LicensePool.district_id == district_id
        ).all()
        
        # Count licenses
        total_licenses = sum(pool.total_licenses for pool in pools)
        
        # Count active licenses
        active_licenses = self.db.query(LicenseV2).join(LicensePool).filter(
            LicensePool.district_id == district_id,
            LicenseV2.status == LicenseStatus.ACTIVE
        ).count()
        
        # Calculate utilization
        utilization_rate = (district.seats_activated / district.total_seats_purchased * 100) if district.total_seats_purchased > 0 else 0
        
        return {
            "district_id": district_id,
            "district_name": district.district_name,
            "district_code": district.district_code,
            "total_seats_purchased": district.total_seats_purchased,
            "seats_allocated": district.seats_allocated,
            "seats_activated": district.seats_activated,
            "seats_available": district.seats_available,
            "utilization_rate": round(utilization_rate, 2),
            "total_pools": len(pools),
            "total_licenses_generated": total_licenses,
            "active_licenses": active_licenses,
            "contract_start": district.contract_start_date.isoformat(),
            "contract_end": district.contract_end_date.isoformat(),
            "status": district.status.value
        }
    
    def get_vault_summary(self) -> Dict[str, Any]:
        """
        Get summary of license vault.
        
        Returns:
            Dict with vault statistics
        """
        vault_entries = self.db.query(LicenseVault).all()
        
        total_quantity = sum(entry.quantity for entry in vault_entries)
        total_remaining = sum(entry.quantity_remaining for entry in vault_entries)
        total_allocated = total_quantity - total_remaining
        
        by_type = {}
        for entry in vault_entries:
            license_type = entry.license_type.value
            if license_type not in by_type:
                by_type[license_type] = {
                    "total": 0,
                    "remaining": 0,
                    "allocated": 0
                }
            
            by_type[license_type]["total"] += entry.quantity
            by_type[license_type]["remaining"] += entry.quantity_remaining
            by_type[license_type]["allocated"] += (entry.quantity - entry.quantity_remaining)
        
        return {
            "total_entries": len(vault_entries),
            "total_licenses": total_quantity,
            "licenses_remaining": total_remaining,
            "licenses_allocated": total_allocated,
            "allocation_rate": round((total_allocated / total_quantity * 100) if total_quantity > 0 else 0, 2),
            "by_license_type": by_type
        }
    
    # ==========================================
    # HELPER METHODS
    # ==========================================
    
    def _generate_pool_code(self, district_code: str) -> str:
        """Generate unique pool code."""
        timestamp = datetime.utcnow().strftime('%Y%m')
        base_code = f"{district_code}_{timestamp}"
        
        # Ensure uniqueness
        counter = 1
        pool_code = f"{base_code}_{counter}"
        
        while self.db.query(LicensePool).filter(
            LicensePool.pool_code == pool_code
        ).first():
            counter += 1
            pool_code = f"{base_code}_{counter}"
        
        return pool_code
    
    def _log_event(
        self,
        event_type: str,
        performed_by: str,
        event_description: Optional[str] = None,
        license_v2_id: Optional[str] = None,
        district_id: Optional[str] = None,
        user_id: Optional[str] = None,
        metadata: Optional[Dict] = None
    ):
        """Log license-related event."""
        log = LicenseUsageLog(
            license_v2_id=license_v2_id,
            district_id=district_id,
            user_id=user_id,
            event_type=event_type,
            event_description=event_description,
            performed_by=performed_by,
            metadata=metadata
        )
        
        self.db.add(log)
        # Don't commit here - let parent transaction handle it
