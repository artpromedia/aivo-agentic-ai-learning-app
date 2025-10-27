"""
Create support-related database tables

Run this script from the services/api-gateway directory to initialize the support ticket system tables.
Usage: python ../../app/scripts/create_support_tables.py
"""

import sys
from pathlib import Path

# Add api-gateway app directory to path
api_gateway_dir = Path(__file__).parent.parent.parent / "services" / "api-gateway"
sys.path.insert(0, str(api_gateway_dir))

# pylint: disable=wrong-import-position
from app.core.database import engine, Base
from app.models.support import SupportTicket, TicketReply, KnowledgeBaseArticle


def create_support_tables():
    """Create all support-related tables"""
    print("Creating support tables...")
    
    # Create tables
    Base.metadata.create_all(bind=engine, tables=[
        SupportTicket.__table__,
        TicketReply.__table__,
        KnowledgeBaseArticle.__table__,
    ])
    
    print("✅ Support tables created successfully!")
    print("\nTables created:")
    print("  - support_tickets")
    print("  - ticket_replies")
    print("  - knowledge_base_articles")


if __name__ == "__main__":
    create_support_tables()
