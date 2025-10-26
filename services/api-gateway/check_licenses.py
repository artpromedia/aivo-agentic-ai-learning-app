#!/usr/bin/env python3
"""Check if licenses exist in the database"""

from app.core.database import SessionLocal
from app.models.license import LicenseV2

db = SessionLocal()

try:
    licenses = db.query(LicenseV2).all()
    print(f"\nFound {len(licenses)} licenses in database\n")
    
    if licenses:
        print("Existing Licenses:")
        for l in licenses[:10]:
            print(f"  - {l.license_id}: {l.available_seats}/{l.total_seats} seats available, Status: {l.status}")
    else:
        print("No licenses found. Need to create test licenses.")
        
finally:
    db.close()
