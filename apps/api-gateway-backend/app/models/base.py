"""Base model and mixins for SQLAlchemy models."""
from sqlalchemy import Column, DateTime, String
from sqlalchemy.sql import func
from sqlalchemy.ext.declarative import declared_attr
import uuid

from app.core.database import Base


class TimestampMixin:
    """Mixin to add created_at and updated_at timestamps."""
    
    created_at = Column(DateTime, default=func.now(), nullable=False)
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now(), nullable=False)


class UUIDMixin:
    """Mixin to add UUID primary key."""
    
    @declared_attr
    def id(cls):
        return Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))


class BaseModel(Base, UUIDMixin, TimestampMixin):
    """Base model with common fields."""
    __abstract__ = True
