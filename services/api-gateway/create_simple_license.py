#!/usr/bin/env python3
"""Check districts and create simple license"""

from datetime import datetime, timedelta
from app.core.database import SessionLocal
from app.models.license import DistrictAccount, LicenseV2, LicenseType, LicenseStatus, LicensePool
import uuid

db = SessionLocal()

try:
    # Check districts
    districts = db.query(DistrictAccount).all()
    print(f"\nFound {len(districts)} districts:")
    for d in districts:
        print(f"  - {d.district_name} ({d.district_code})")
        print(f"    ID: {d.id}")
        
    if districts:
        district = districts[0]
        
        # Create a simple license pool first
        pool = LicensePool(
            id=str(uuid.uuid4()),
            district_id=district.id,
            pool_name="Test Pool",
            pool_code="TEST_001",
            total_licenses=10,
            licenses_remaining=10,
            licenses_generated=0,
            valid_from=datetime.now(),
            valid_until=datetime.now() + timedelta(days=365),
            created_by="system"
        )
        db.add(pool)
        db.flush()
        
        # Create a simple test license
        test_license = LicenseV2(
            id=str(uuid.uuid4()),
            pool_id=pool.id,
            license_id="TEST123",  # Simple test license code
            license_type=LicenseType.DISTRICT,
            status=LicenseStatus.AVAILABLE,
            total_seats=30,
            available_seats=30,
            valid_from=datetime.now(),
            valid_until=datetime.now() + timedelta(days=365)
        )
        
        db.add(test_license)
        pool.licenses_generated = 1
        db.commit()
        
        print(f"\n✓ Created test license: TEST123")
        print(f"  District: {district.district_name}")
        print(f"  Seats: 30")
        print(f"\nYou can use license code: TEST123")
        
except Exception as e:
    print(f"\n❌ Error: {e}")
    import traceback
    traceback.print_exc()
finally:
    db.close()
