"""
Integration models for external system connections
"""

from datetime import datetime
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Text, JSON
from sqlalchemy.orm import relationship

from app.core.database import Base


class Integration(Base):
    """External system integration connections"""

    __tablename__ = "integrations"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)

    # Integration Details
    name = Column(String(255), nullable=False)  # e.g., "PowerSchool SIS"
    provider = Column(String(100), nullable=False)  # clever, schoology, zoom, etc.
    integration_type = Column(String(50), nullable=False)  # SIS, LMS, Communication, Assessment
    status = Column(String(20), default="inactive")  # active, inactive, error, syncing

    # Connection Details
    api_key = Column(String(500), nullable=True)  # Encrypted API key
    api_secret = Column(String(500), nullable=True)  # Encrypted API secret
    base_url = Column(String(500), nullable=True)  # API base URL
    oauth_token = Column(Text, nullable=True)  # OAuth access token
    oauth_refresh_token = Column(Text, nullable=True)  # OAuth refresh token
    oauth_expires_at = Column(DateTime, nullable=True)  # Token expiry

    # Sync Configuration
    sync_frequency = Column(String(50), default="Every 6 hours")  # Every X hours, Daily, etc.
    last_sync = Column(DateTime, nullable=True)
    next_scheduled_sync = Column(DateTime, nullable=True)
    records_synced = Column(Integer, default=0)

    # Data Mapping (JSON field)
    data_mapping = Column(JSON, nullable=True)
    # Example: {"students": true, "staff": true, "grades": true, "attendance": false}

    # Error Tracking
    error_message = Column(Text, nullable=True)
    error_count = Column(Integer, default=0)
    last_error_at = Column(DateTime, nullable=True)

    # Webhook Configuration
    webhook_url = Column(String(500), nullable=True)
    webhook_secret = Column(String(255), nullable=True)
    webhook_enabled = Column(String(5), default="false")  # "true"/"false"

    # Metadata
    config_metadata = Column(JSON, nullable=True)  # Additional provider-specific config

    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    connected_at = Column(DateTime, nullable=True)  # When connection was established
    disconnected_at = Column(DateTime, nullable=True)  # When connection was terminated

    # Relationships
    user = relationship("User", back_populates="integrations")
    sync_logs = relationship("IntegrationSyncLog", back_populates="integration", cascade="all, delete-orphan")


class IntegrationSyncLog(Base):
    """Log entries for integration sync operations"""

    __tablename__ = "integration_sync_logs"

    id = Column(Integer, primary_key=True, index=True)
    integration_id = Column(Integer, ForeignKey("integrations.id"), nullable=False, index=True)

    # Sync Details
    sync_type = Column(String(50), default="manual")  # manual, scheduled, webhook
    status = Column(String(20), nullable=False)  # success, error, partial
    records_processed = Column(Integer, default=0)
    records_created = Column(Integer, default=0)
    records_updated = Column(Integer, default=0)
    records_failed = Column(Integer, default=0)

    # Timing
    started_at = Column(DateTime, default=datetime.utcnow)
    completed_at = Column(DateTime, nullable=True)
    duration_seconds = Column(Integer, nullable=True)

    # Error Details
    error_message = Column(Text, nullable=True)
    error_details = Column(JSON, nullable=True)  # Detailed error info

    # Sync Metadata
    sync_metadata = Column(JSON, nullable=True)  # Provider-specific sync details

    # Relationships
    integration = relationship("Integration", back_populates="sync_logs")
