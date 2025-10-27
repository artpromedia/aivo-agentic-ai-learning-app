#!/usr/bin/env python3
"""Check if password verification works for admin user."""

import sys
from pathlib import Path

# Add parent directory to path
sys.path.insert(0, str(Path(__file__).parent.parent))

from app.core.database import SessionLocal
from app.models.user import User
from app.models.settings import UserSettings  # Import to avoid relationship error
from app.core.security import verify_password
from sqlalchemy import select


def check_password():
    """Check password verification for admin user."""
    db = SessionLocal()
    
    try:
        # Get the admin user
        user = db.execute(
            select(User).where(User.email == "admin@aivolearning.com")
        ).scalar_one_or_none()
        
        if not user:
            print("❌ User admin@aivolearning.com not found!")
            return
        
        print(f"✅ User found: {user.email}")
        print(f"   Name: {user.full_name}")
        print(f"   Role: {user.role}")
        print(f"   Active: {user.is_active}")
        print(f"   Verified: {user.is_verified}")
        print(f"   Has hashed password: {bool(user.hashed_password)}")
        
        if user.hashed_password:
            print(f"   Password hash starts with: {user.hashed_password[:30]}...")
        
        # Try to verify the password
        test_password = "Admin123!"
        print(f"\n🔐 Testing password verification for: '{test_password}'")
        
        is_valid = verify_password(test_password, user.hashed_password)
        
        if is_valid:
            print("✅ Password verification SUCCESSFUL!")
        else:
            print("❌ Password verification FAILED!")
            print("\nTrying to rehash the password to compare:")
            from app.core.security import get_password_hash
            new_hash = get_password_hash(test_password)
            print(f"New hash: {new_hash[:50]}...")
            print(f"Stored hash: {user.hashed_password[:50]}...")
        
    finally:
        db.close()


if __name__ == "__main__":
    check_password()
