"""
Settings API endpoints for user preferences and session management
"""

from datetime import datetime
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.api.deps import require_admin
from app.models.user import User
from app.models.settings import UserSettings, UserSession


router = APIRouter()


# ============================================================================
# Pydantic Schemas
# ============================================================================

class GeneralSettingsResponse(BaseModel):
    """General settings response"""

    language: str
    timezone: str
    date_format: str
    time_format: str

    class Config:
        from_attributes = True


class GeneralSettingsUpdate(BaseModel):
    """General settings update request"""

    language: Optional[str] = Field(None, pattern="^(en|es|fr|de)$")
    timezone: Optional[str] = None
    date_format: Optional[str] = Field(None, pattern="^(MM/DD/YYYY|DD/MM/YYYY|YYYY-MM-DD)$")
    time_format: Optional[str] = Field(None, pattern="^(12h|24h)$")


class NotificationSettingsResponse(BaseModel):
    """Notification settings response"""

    email_notifications: str
    push_notifications: str
    new_messages: str
    progress_reports: str
    iep_reminders: str
    milestone_alerts: str
    weekly_digest: str
    marketing_emails: str

    class Config:
        from_attributes = True


class NotificationSettingsUpdate(BaseModel):
    """Notification settings update request"""

    email_notifications: Optional[str] = Field(None, pattern="^(true|false)$")
    push_notifications: Optional[str] = Field(None, pattern="^(true|false)$")
    new_messages: Optional[str] = Field(None, pattern="^(true|false)$")
    progress_reports: Optional[str] = Field(None, pattern="^(true|false)$")
    iep_reminders: Optional[str] = Field(None, pattern="^(true|false)$")
    milestone_alerts: Optional[str] = Field(None, pattern="^(true|false)$")
    weekly_digest: Optional[str] = Field(None, pattern="^(true|false)$")
    marketing_emails: Optional[str] = Field(None, pattern="^(true|false)$")


class PreferenceSettingsResponse(BaseModel):
    """Preference settings response"""

    theme: str
    dashboard_layout: str
    default_view: str

    class Config:
        from_attributes = True


class PreferenceSettingsUpdate(BaseModel):
    """Preference settings update request"""

    theme: Optional[str] = Field(None, pattern="^(light|dark|auto)$")
    dashboard_layout: Optional[str] = Field(None, pattern="^(compact|detailed|visual)$")
    default_view: Optional[str] = Field(None, pattern="^(dashboard|students|messages)$")


class SessionResponse(BaseModel):
    """User session response"""

    id: int
    device_name: Optional[str]
    browser: Optional[str]
    ip_address: Optional[str]
    location: Optional[str]
    is_current: str
    last_activity: datetime
    created_at: datetime

    class Config:
        from_attributes = True


# ============================================================================
# Helper Functions
# ============================================================================

def get_or_create_settings(db: Session, user_id: int) -> UserSettings:
    """Get user settings or create default if not exists"""
    settings = db.query(UserSettings).filter(UserSettings.user_id == user_id).first()
    if not settings:
        settings = UserSettings(user_id=user_id)
        db.add(settings)
        db.commit()
        db.refresh(settings)
    return settings


# ============================================================================
# General Settings Endpoints
# ============================================================================

@router.get("/general", response_model=GeneralSettingsResponse)
async def get_general_settings(
    admin: User = Depends(require_admin()),
    db: Session = Depends(get_db),
):
    """Get general settings for the current user"""
    settings = get_or_create_settings(db, admin.id)
    return GeneralSettingsResponse(
        language=settings.language,
        timezone=settings.timezone,
        date_format=settings.date_format,
        time_format=settings.time_format,
    )


@router.patch("/general", response_model=GeneralSettingsResponse)
async def update_general_settings(
    request: GeneralSettingsUpdate,
    admin: User = Depends(require_admin()),
    db: Session = Depends(get_db),
):
    """Update general settings for the current user"""
    settings = get_or_create_settings(db, admin.id)

    if request.language is not None:
        settings.language = request.language
    if request.timezone is not None:
        settings.timezone = request.timezone
    if request.date_format is not None:
        settings.date_format = request.date_format
    if request.time_format is not None:
        settings.time_format = request.time_format

    settings.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(settings)

    return GeneralSettingsResponse(
        language=settings.language,
        timezone=settings.timezone,
        date_format=settings.date_format,
        time_format=settings.time_format,
    )


# ============================================================================
# Notification Settings Endpoints
# ============================================================================

@router.get("/notifications", response_model=NotificationSettingsResponse)
async def get_notification_settings(
    admin: User = Depends(require_admin()),
    db: Session = Depends(get_db),
):
    """Get notification settings for the current user"""
    settings = get_or_create_settings(db, admin.id)
    return NotificationSettingsResponse(
        email_notifications=settings.email_notifications,
        push_notifications=settings.push_notifications,
        new_messages=settings.new_messages,
        progress_reports=settings.progress_reports,
        iep_reminders=settings.iep_reminders,
        milestone_alerts=settings.milestone_alerts,
        weekly_digest=settings.weekly_digest,
        marketing_emails=settings.marketing_emails,
    )


@router.patch("/notifications", response_model=NotificationSettingsResponse)
async def update_notification_settings(
    request: NotificationSettingsUpdate,
    admin: User = Depends(require_admin()),
    db: Session = Depends(get_db),
):
    """Update notification settings for the current user"""
    settings = get_or_create_settings(db, admin.id)

    if request.email_notifications is not None:
        settings.email_notifications = request.email_notifications
    if request.push_notifications is not None:
        settings.push_notifications = request.push_notifications
    if request.new_messages is not None:
        settings.new_messages = request.new_messages
    if request.progress_reports is not None:
        settings.progress_reports = request.progress_reports
    if request.iep_reminders is not None:
        settings.iep_reminders = request.iep_reminders
    if request.milestone_alerts is not None:
        settings.milestone_alerts = request.milestone_alerts
    if request.weekly_digest is not None:
        settings.weekly_digest = request.weekly_digest
    if request.marketing_emails is not None:
        settings.marketing_emails = request.marketing_emails

    settings.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(settings)

    return NotificationSettingsResponse(
        email_notifications=settings.email_notifications,
        push_notifications=settings.push_notifications,
        new_messages=settings.new_messages,
        progress_reports=settings.progress_reports,
        iep_reminders=settings.iep_reminders,
        milestone_alerts=settings.milestone_alerts,
        weekly_digest=settings.weekly_digest,
        marketing_emails=settings.marketing_emails,
    )


# ============================================================================
# Preference Settings Endpoints
# ============================================================================

@router.get("/preferences", response_model=PreferenceSettingsResponse)
async def get_preference_settings(
    admin: User = Depends(require_admin()),
    db: Session = Depends(get_db),
):
    """Get preference settings for the current user"""
    settings = get_or_create_settings(db, admin.id)
    return PreferenceSettingsResponse(
        theme=settings.theme,
        dashboard_layout=settings.dashboard_layout,
        default_view=settings.default_view,
    )


@router.patch("/preferences", response_model=PreferenceSettingsResponse)
async def update_preference_settings(
    request: PreferenceSettingsUpdate,
    admin: User = Depends(require_admin()),
    db: Session = Depends(get_db),
):
    """Update preference settings for the current user"""
    settings = get_or_create_settings(db, admin.id)

    if request.theme is not None:
        settings.theme = request.theme
    if request.dashboard_layout is not None:
        settings.dashboard_layout = request.dashboard_layout
    if request.default_view is not None:
        settings.default_view = request.default_view

    settings.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(settings)

    return PreferenceSettingsResponse(
        theme=settings.theme,
        dashboard_layout=settings.dashboard_layout,
        default_view=settings.default_view,
    )


# ============================================================================
# Session Management Endpoints
# ============================================================================

@router.get("/sessions", response_model=list[SessionResponse])
async def get_active_sessions(
    admin: User = Depends(require_admin()),
    db: Session = Depends(get_db),
):
    """Get all active sessions for the current user"""
    sessions = (
        db.query(UserSession)
        .filter(UserSession.user_id == admin.id)
        .order_by(UserSession.last_activity.desc())
        .all()
    )
    return [
        SessionResponse(
            id=session.id,
            device_name=session.device_name,
            browser=session.browser,
            ip_address=session.ip_address,
            location=session.location,
            is_current=session.is_current,
            last_activity=session.last_activity,
            created_at=session.created_at,
        )
        for session in sessions
    ]


@router.delete("/sessions/{session_id}", status_code=204)
async def delete_session(
    session_id: int,
    admin: User = Depends(require_admin()),
    db: Session = Depends(get_db),
):
    """Delete a specific session (logout from that device)"""
    session = (
        db.query(UserSession)
        .filter(UserSession.id == session_id, UserSession.user_id == admin.id)
        .first()
    )

    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    db.delete(session)
    db.commit()

    return None
