"""
Database connections for AI Inference Service.
"""

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session
from typing import Generator
import os

# Curriculum database (separate from main app database)
CURRICULUM_DATABASE_URL = os.getenv(
    "CURRICULUM_DATABASE_URL",
    "postgresql://aivo_user:password@curriculum-db:5432/aivo_curriculum"
)

curriculum_engine = create_engine(
    CURRICULUM_DATABASE_URL,
    pool_size=10,
    max_overflow=20,
    pool_pre_ping=True
)

CurriculumSessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=curriculum_engine
)


def get_curriculum_db() -> Generator[Session, None, None]:
    """Get curriculum database session."""
    db = CurriculumSessionLocal()
    try:
        yield db
    finally:
        db.close()
