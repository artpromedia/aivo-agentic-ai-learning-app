"""
Create a district admin user for testing

Usage:
    cd services/api-gateway
    python scripts/create_admin_user.py
"""
import sys
from pathlib import Path

# Add parent directory to path
sys.path.insert(0, str(Path(__file__).parent.parent))

# Import all models first to avoid relationship errors
from app.models import user, settings, integration  # noqa: F401
from app.core.database import SessionLocal
from app.core.security import get_password_hash
from app.models.user import User, UserRole, OnboardingStatus
from datetime import datetime
import uuid

def create_admin_user():
    """Create a district admin user for testing"""
    db = SessionLocal()
    
    try:
        # Check if user already exists
        email = "district@demo.com"
        existing_user = db.query(User).filter(User.email == email).first()
        
        if existing_user:
            print(f"✅ User {email} already exists!")
            print(f"   ID: {existing_user.id}")
            print(f"   Name: {existing_user.full_name}")
            print(f"   Role: {existing_user.role.value}")
            print(f"   Active: {existing_user.is_active}")
            return
        
        # Create new admin user
        user = User(
            id=str(uuid.uuid4()),
            email=email,
            hashed_password=get_password_hash("demo123"),
            full_name="Dr. Sarah Johnson",
            role=UserRole.DISTRICT_ADMIN,
            is_active=True,
            is_verified=True,
            onboarding_status=OnboardingStatus.COMPLETE,
            district_name="Demo District",
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow(),
        )
        
        db.add(user)
        db.commit()
        db.refresh(user)
        
        print("✅ District admin user created successfully!")
        print(f"   Email: {user.email}")
        print(f"   Password: demo123")
        print(f"   Name: {user.full_name}")
        print(f"   Role: {user.role.value}")
        print(f"   ID: {user.id}")
        
    except Exception as e:
        print(f"❌ Error creating user: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    create_admin_user()
