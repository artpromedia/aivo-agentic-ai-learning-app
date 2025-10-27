"""
Database migration script to create reports tables.
Run this script to add Report, ScheduledReport, and ReportTemplate tables.

Usage:
    cd services/api-gateway
    python -m scripts.create_reports_tables
"""
import sys
from pathlib import Path

# Add parent directory to path for imports
sys.path.append(str(Path(__file__).parent.parent))

from sqlalchemy import create_engine
from app.core.database import SQLALCHEMY_DATABASE_URL
from app.models.base import Base
from app.models.report import Report, ScheduledReport, ReportTemplate
from app.models.user import User

def create_reports_tables():
    """Create reports-related database tables."""
    print("Creating reports tables...")
    
    # Create engine
    engine = create_engine(SQLALCHEMY_DATABASE_URL)
    
    # Create only the report tables
    Report.__table__.create(engine, checkfirst=True)
    ScheduledReport.__table__.create(engine, checkfirst=True)
    ReportTemplate.__table__.create(engine, checkfirst=True)
    
    print("✅ Successfully created reports tables:")
    print("   - reports")
    print("   - scheduled_reports")
    print("   - report_templates")
    print("\nReports API is ready to use!")

if __name__ == "__main__":
    create_reports_tables()
