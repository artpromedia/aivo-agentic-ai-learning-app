#!/usr/bin/env python3
"""Fix the test license to use proper 6-digit code"""

from app.core.database import SessionLocal
from app.models.license import LicenseV2

db = SessionLocal()

try:
    # Find the TEST123 license
    license = db.query(LicenseV2).filter(LicenseV2.license_id == "TEST123").first()
    
    if license:
        # Update to 6-digit code
        license.license_id = "ABC123"
        db.commit()
        print(f"\n✓ Updated license code from TEST123 to ABC123")
        print(f"  Status: {license.status}")
        print(f"  Seats: {license.total_seats}")
        print(f"\nUse license code: ABC123")
    else:
        print("License TEST123 not found")
        
except Exception as e:
    print(f"\n❌ Error: {e}")
    import traceback
    traceback.print_exc()
finally:
    db.close()
