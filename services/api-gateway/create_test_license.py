#!/usr/bin/env python3
"""Create test license for teacher enrollment testing"""

from datetime import datetime, timedelta
from app.core.database import SessionLocal
from app.services.license_service import LicenseService
from app.models.license import LicenseType

db = SessionLocal()
license_service = LicenseService(db)

try:
    print("\n=== Creating Test District & License ===\n")
    
    # Step 1: Create vault entry
    print("1. Creating vault entry with 1000 licenses...")
    vault_entry = license_service.create_vault_entry(
        license_type=LicenseType.DISTRICT,
        quantity=1000,
        valid_from=datetime.now(),
        valid_until=datetime.now() + timedelta(days=365),
        created_by="system",
        created_reason="Test licenses for development",
        notes="Development/testing purposes only"
    )
    print(f"   ✓ Vault entry created: {vault_entry.id}")
    print(f"   Available: {vault_entry.quantity_remaining} licenses\n")
    
    # Step 2: Create test district
    print("2. Creating test district account...")
    district = license_service.create_district_account(
        district_name="Test School District",
        district_code="TEST001",
        state="CA",
        city="Los Angeles",
        primary_contact_name="John Doe",
        primary_contact_email="john.doe@testdistrict.edu",
        primary_contact_phone="555-0100",
        contract_start_date=datetime.now(),
        contract_end_date=datetime.now() + timedelta(days=365),
        total_seats_purchased=10000,
        price_per_seat=50.00,
        total_contract_value=500000.00,
        created_by="system",
        notes="Test district for development"
    )
    print(f"   ✓ District created: {district.district_name}")
    print(f"   District code: {district.district_code}")
    print(f"   Total seats: {district.total_seats_purchased}\n")
    
    # Step 3: Provision licenses to district
    print("3. Provisioning 10 licenses to district...")
    result = license_service.provision_licenses_to_district(
        district_id=district.id,
        quantity=10,
        seats_per_license=30,
        vault_entry_id=vault_entry.id,
        pool_name="Test District Initial Pool",
        performed_by="system"
    )
    
    print(f"   ✓ Licenses provisioned!")
    print(f"   Pool code: {result['pool_code']}")
    print(f"   Licenses created: {result['licenses_created']}")
    print(f"   Total seats: {result['total_seats']}")
    print(f"\n   First 5 license codes:")
    for code in result['license_codes'][:5]:
        print(f"     - {code}")
    
    print(f"\n=== SUCCESS ===")
    print(f"\nYou can now use any of these license codes to test teacher enrollment:")
    print(f"Test License Code: {result['license_codes'][0]}")
    print(f"District: {district.district_name}")
    print(f"Each license has 30 student seats\n")
    
except Exception as e:
    print(f"\n❌ Error: {e}")
    import traceback
    traceback.print_exc()
finally:
    db.close()
