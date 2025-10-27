"""
Create Integration and IntegrationSyncLog tables
"""

from app.core.database import engine, Base
from app.models.integration import Integration, IntegrationSyncLog

def main():
    print("Creating integration tables...")
    
    # Create only the integration tables
    Base.metadata.create_all(
        bind=engine,
        tables=[Integration.__table__, IntegrationSyncLog.__table__]
    )
    
    print("✅ Integration tables created successfully!")
    print("- integrations")
    print("- integration_sync_logs")

if __name__ == "__main__":
    main()
