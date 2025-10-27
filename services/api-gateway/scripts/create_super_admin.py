"""
Create a super admin user

Usage:
    cd services/api-gateway
    python scripts/create_super_admin.py
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

def create_super_admin():
    """Create a super admin user"""
    db = SessionLocal()
    
    try:
        # Create super admin user
        email = "superadmin@aivolearning.com"
        
        # Check if user already exists
        existing_user = db.query(User).filter(User.email == email).first()
        
        if existing_user:
            print(f"✅ User {email} already exists!")
            print(f"   ID: {existing_user.id}")
            print(f"   Name: {existing_user.full_name}")
            print(f"   Role: {existing_user.role.value}")
            print(f"   Active: {existing_user.is_active}")
            print(f"\n   Try logging in with:")
            print(f"   Email: {email}")
            print(f"   Password: SuperAdmin123!")
            return
        
        user = User(
            id=str(uuid.uuid4()),
            email=email,
            hashed_password=get_password_hash("SuperAdmin123!"),
            full_name="Super Administrator",
            role=UserRole.GLOBAL_ADMIN,  # Global admin role (super admin)
            is_active=True,
            is_verified=True,
            onboarding_status=OnboardingStatus.COMPLETE,
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow(),
        )
        
        db.add(user)
        db.commit()
        db.refresh(user)
        
        print("✅ Super admin user created successfully!")
        print(f"   Email: {user.email}")
        print(f"   Password: SuperAdmin123!")
        print(f"   Name: {user.full_name}")
        print(f"   Role: {user.role.value}")
        print(f"   ID: {user.id}")
        
    except Exception as e:
        print(f"❌ Error creating user: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    create_super_admin()
