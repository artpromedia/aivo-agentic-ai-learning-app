"""
Feature Flag Models
For managing feature rollouts and A/B testing
"""
from sqlalchemy import Column, Integer, String, Boolean, Float, DateTime, Text, JSON
from sqlalchemy.sql import func
from app.core.database import Base


class FeatureFlag(Base):
    """Feature flag for gradual rollouts and A/B testing"""
    __tablename__ = "feature_flags"

    id = Column(Integer, primary_key=True, index=True)
    key = Column(String(100), unique=True, nullable=False, index=True)
    name = Column(String(200), nullable=False)
    description = Column(Text, nullable=True)
    
    # Flag state
    enabled = Column(Boolean, default=False, nullable=False)
    rollout_percentage = Column(Float, default=0.0, nullable=False)  # 0-100
    
    # Targeting
    target_roles = Column(JSON, nullable=True)  # ["parent", "teacher", "admin"]
    target_districts = Column(JSON, nullable=True)  # ["district-uuid-1", ...]
    target_users = Column(JSON, nullable=True)  # ["user-uuid-1", ...]
    
    # Metadata
    environment = Column(String(50), default="production")  # development, staging, production
    tags = Column(JSON, nullable=True)  # ["beta", "experimental"]
    
    # Audit
    created_by = Column(String(200), nullable=True)
    created_at = Column(DateTime, server_default=func.now(), nullable=False)
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now(), nullable=False)
    
    def __repr__(self):
        return f"<FeatureFlag(key={self.key}, enabled={self.enabled}, rollout={self.rollout_percentage}%)>"
