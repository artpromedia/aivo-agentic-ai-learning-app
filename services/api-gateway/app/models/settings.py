"""
Settings models for user preferences and configurations
"""

from datetime import datetime
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship

from app.core.database import Base


class UserSettings(Base):
    """User settings and preferences"""

    __tablename__ = "user_settings"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True, nullable=False, index=True)

    # General Settings
    language = Column(String(10), default="en")  # en, es, fr, de
    timezone = Column(String(50), default="America/New_York")
    date_format = Column(String(20), default="MM/DD/YYYY")  # MM/DD/YYYY, DD/MM/YYYY, YYYY-MM-DD
    time_format = Column(String(5), default="12h")  # 12h, 24h

    # Notification Settings (stored as "true"/"false" strings for SQLite)
    email_notifications = Column(String(5), default="true")
    push_notifications = Column(String(5), default="false")
    new_messages = Column(String(5), default="true")
    progress_reports = Column(String(5), default="true")
    iep_reminders = Column(String(5), default="true")
    milestone_alerts = Column(String(5), default="true")
    weekly_digest = Column(String(5), default="false")
    marketing_emails = Column(String(5), default="false")

    # Preference Settings
    theme = Column(String(10), default="light")  # light, dark, auto
    dashboard_layout = Column(String(20), default="detailed")  # compact, detailed, visual
    default_view = Column(String(20), default="dashboard")  # dashboard, students, messages

    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    user = relationship("User", back_populates="settings")


class UserSession(Base):
    """Active user sessions for security tracking"""

    __tablename__ = "user_sessions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)

    # Session Information
    session_token = Column(String(255), unique=True, nullable=False, index=True)
    device_name = Column(String(100), nullable=True)  # e.g., "Windows", "macOS"
    browser = Column(String(100), nullable=True)  # e.g., "Chrome", "Firefox"
    ip_address = Column(String(45), nullable=True)  # IPv4 or IPv6
    location = Column(String(100), nullable=True)  # e.g., "New York, NY"
    user_agent = Column(Text, nullable=True)

    # Status
    is_current = Column(String(5), default="false")  # "true" for current session
    last_activity = Column(DateTime, default=datetime.utcnow)

    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)
    expires_at = Column(DateTime, nullable=True)

    # Relationships
    user = relationship("User", back_populates="sessions")
