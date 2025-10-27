"""
Create settings-related database tables

Run this script to initialize the user settings and session tracking tables.
"""

import sys
from pathlib import Path

# Add api-gateway app directory to path
api_gateway_dir = Path(__file__).parent.parent.parent / "services" / "api-gateway"
sys.path.insert(0, str(api_gateway_dir))

# pylint: disable=wrong-import-position
from app.core.database import engine, Base
from app.models.settings import UserSettings, UserSession


def create_settings_tables():
    """Create all settings-related tables"""
    print("Creating settings tables...")
    
    # Create tables
    Base.metadata.create_all(bind=engine, tables=[
        UserSettings.__table__,
        UserSession.__table__,
    ])
    
    print("✅ Settings tables created successfully!")
    print("\nTables created:")
    print("  - user_settings")
    print("  - user_sessions")


if __name__ == "__main__":
    create_settings_tables()
