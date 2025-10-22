"""
Database connection for training service.

Connects to curriculum database to access standards and training data.
Part of PROMPT 57 Part B.
"""

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session

from app.core.config import settings

# Create SQLAlchemy engine (connects to curriculum database)
engine = create_engine(
    settings.CURRICULUM_DATABASE_URL,
    pool_size=10,
    max_overflow=20,
    echo=False
)

# Create SessionLocal class
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def get_curriculum_db() -> Session:
    """
    Get curriculum database session.
    
    Used to access educational standards for training data generation.
    """
    db = SessionLocal()
    try:
        return db
    finally:
        db.close()


def get_db() -> Session:
    """FastAPI dependency for database session."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
