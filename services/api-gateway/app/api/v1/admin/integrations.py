"""
Integrations API endpoints for external system connections
"""

from datetime import datetime, timedelta
from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.api.deps import require_admin
from app.models.user import User
from app.models.integration import Integration, IntegrationSyncLog


router = APIRouter()


# ============================================================================
# Pydantic Schemas
# ============================================================================

class IntegrationCreate(BaseModel):
    """Create integration request"""
    name: str = Field(..., min_length=1, max_length=255)
    provider: str = Field(..., min_length=1, max_length=100)
    integration_type: str
    base_url: Optional[str] = None
    api_key: Optional[str] = None
    api_secret: Optional[str] = None
    sync_frequency: str = "Every 6 hours"
    data_mapping: Optional[dict] = None
    webhook_enabled: str = "false"


class IntegrationUpdate(BaseModel):
    """Update integration request"""
    name: Optional[str] = Field(None, min_length=1, max_length=255)
    status: Optional[str] = Field(None, pattern="^(active|inactive|error|syncing)$")
    base_url: Optional[str] = None
    api_key: Optional[str] = None
    api_secret: Optional[str] = None
    sync_frequency: Optional[str] = None
    data_mapping: Optional[dict] = None
    webhook_enabled: Optional[str] = Field(None, pattern="^(true|false)$")


class IntegrationResponse(BaseModel):
    """Integration response"""
    id: int
    name: str
    provider: str
    integration_type: str
    status: str
    sync_frequency: str
    last_sync: Optional[datetime]
    next_scheduled_sync: Optional[datetime]
    records_synced: int
    data_mapping: Optional[dict]
    error_message: Optional[str]
    error_count: int
    webhook_enabled: str
    created_at: datetime
    updated_at: datetime
    connected_at: Optional[datetime]

    class Config:
        from_attributes = True


class IntegrationStats(BaseModel):
    """Integration statistics"""
    total: int
    active: int
    inactive: int
    error: int
    syncing: int
    total_records_synced: int


class SyncLogResponse(BaseModel):
    """Sync log response"""
    id: int
    integration_id: int
    sync_type: str
    status: str
    records_processed: int
    records_created: int
    records_updated: int
    records_failed: int
    started_at: datetime
    completed_at: Optional[datetime]
    duration_seconds: Optional[int]
    error_message: Optional[str]

    class Config:
        from_attributes = True


class SyncNowRequest(BaseModel):
    """Manual sync request"""
    sync_type: str = "manual"


class TestConnectionRequest(BaseModel):
    """Test connection request"""
    provider: str
    base_url: Optional[str] = None
    api_key: Optional[str] = None
    api_secret: Optional[str] = None


class TestConnectionResponse(BaseModel):
    """Test connection response"""
    success: bool
    message: str
    details: Optional[dict] = None


# ============================================================================
# Helper Functions
# ============================================================================

def calculate_next_sync(frequency: str, last_sync: Optional[datetime] = None) -> datetime:
    """Calculate next scheduled sync based on frequency"""
    base_time = last_sync or datetime.utcnow()
    
    if "hour" in frequency.lower():
        # Extract hours from "Every X hours"
        try:
            hours = int(''.join(filter(str.isdigit, frequency)))
            return base_time + timedelta(hours=hours)
        except (ValueError, AttributeError):
            return base_time + timedelta(hours=6)  # Default 6 hours
    elif "daily" in frequency.lower():
        return base_time + timedelta(days=1)
    elif "weekly" in frequency.lower():
        return base_time + timedelta(weeks=1)
    else:
        return base_time + timedelta(hours=6)  # Default


def test_integration_connection(
    provider: str,
    base_url: Optional[str],
    api_key: Optional[str],
    api_secret: Optional[str]
) -> TestConnectionResponse:
    """
    Test connection to external integration provider
    This is a placeholder - in production, implement actual API calls
    """
    # Placeholder implementation
    # In production, add real API validation for each provider
    
    if not api_key:
        return TestConnectionResponse(
            success=False,
            message="API key is required",
            details={"error": "missing_credentials"}
        )
    
    # Simulate connection test
    # In production: Make actual API call to provider
    return TestConnectionResponse(
        success=True,
        message=f"Successfully connected to {provider}",
        details={
            "provider": provider,
            "connection_time_ms": 150,
            "api_version": "v1.0"
        }
    )


# ============================================================================
# Integration CRUD Endpoints
# ============================================================================

@router.get("/list", response_model=List[IntegrationResponse])
async def list_integrations(
    status: Optional[str] = None,
    provider: Optional[str] = None,
    admin: User = Depends(require_admin()),
    db: Session = Depends(get_db),
):
    """List all integrations for the current user"""
    query = db.query(Integration).filter(Integration.user_id == admin.id)
    
    if status:
        query = query.filter(Integration.status == status)
    if provider:
        query = query.filter(Integration.provider == provider)
    
    integrations = query.order_by(Integration.created_at.desc()).all()
    return integrations


@router.post("/create", response_model=IntegrationResponse, status_code=201)
async def create_integration(
    request: IntegrationCreate,
    admin: User = Depends(require_admin()),
    db: Session = Depends(get_db),
):
    """Create a new integration"""
    # Calculate next sync time
    next_sync = calculate_next_sync(request.sync_frequency)
    
    integration = Integration(
        user_id=admin.id,
        name=request.name,
        provider=request.provider,
        integration_type=request.integration_type,
        status="inactive",  # Start as inactive until connected
        base_url=request.base_url,
        api_key=request.api_key,  # In production: encrypt these
        api_secret=request.api_secret,
        sync_frequency=request.sync_frequency,
        next_scheduled_sync=next_sync,
        data_mapping=request.data_mapping or {},
        webhook_enabled=request.webhook_enabled,
    )
    
    db.add(integration)
    db.commit()
    db.refresh(integration)
    
    return integration


@router.get("/{integration_id}", response_model=IntegrationResponse)
async def get_integration(
    integration_id: int,
    admin: User = Depends(require_admin()),
    db: Session = Depends(get_db),
):
    """Get integration by ID"""
    integration = (
        db.query(Integration)
        .filter(Integration.id == integration_id, Integration.user_id == admin.id)
        .first()
    )
    
    if not integration:
        raise HTTPException(status_code=404, detail="Integration not found")
    
    return integration


@router.patch("/{integration_id}", response_model=IntegrationResponse)
async def update_integration(
    integration_id: int,
    request: IntegrationUpdate,
    admin: User = Depends(require_admin()),
    db: Session = Depends(get_db),
):
    """Update an integration"""
    integration = (
        db.query(Integration)
        .filter(Integration.id == integration_id, Integration.user_id == admin.id)
        .first()
    )
    
    if not integration:
        raise HTTPException(status_code=404, detail="Integration not found")
    
    # Update fields
    if request.name is not None:
        integration.name = request.name
    if request.status is not None:
        integration.status = request.status
    if request.base_url is not None:
        integration.base_url = request.base_url
    if request.api_key is not None:
        integration.api_key = request.api_key
    if request.api_secret is not None:
        integration.api_secret = request.api_secret
    if request.sync_frequency is not None:
        integration.sync_frequency = request.sync_frequency
        integration.next_scheduled_sync = calculate_next_sync(
            request.sync_frequency,
            integration.last_sync
        )
    if request.data_mapping is not None:
        integration.data_mapping = request.data_mapping
    if request.webhook_enabled is not None:
        integration.webhook_enabled = request.webhook_enabled
    
    integration.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(integration)
    
    return integration


@router.delete("/{integration_id}", status_code=204)
async def delete_integration(
    integration_id: int,
    admin: User = Depends(require_admin()),
    db: Session = Depends(get_db),
):
    """Delete an integration"""
    integration = (
        db.query(Integration)
        .filter(Integration.id == integration_id, Integration.user_id == admin.id)
        .first()
    )
    
    if not integration:
        raise HTTPException(status_code=404, detail="Integration not found")
    
    integration.disconnected_at = datetime.utcnow()
    db.delete(integration)
    db.commit()
    
    return None


# ============================================================================
# Integration Actions
# ============================================================================

@router.post("/{integration_id}/connect", response_model=IntegrationResponse)
async def connect_integration(
    integration_id: int,
    admin: User = Depends(require_admin()),
    db: Session = Depends(get_db),
):
    """Establish connection to integration"""
    integration = (
        db.query(Integration)
        .filter(Integration.id == integration_id, Integration.user_id == admin.id)
        .first()
    )
    
    if not integration:
        raise HTTPException(status_code=404, detail="Integration not found")
    
    # Test connection
    test_result = test_integration_connection(
        integration.provider,
        integration.base_url,
        integration.api_key,
        integration.api_secret
    )
    
    if not test_result.success:
        integration.status = "error"
        integration.error_message = test_result.message
        integration.error_count += 1
        integration.last_error_at = datetime.utcnow()
        db.commit()
        raise HTTPException(status_code=400, detail=test_result.message)
    
    # Update integration status
    integration.status = "active"
    integration.connected_at = datetime.utcnow()
    integration.error_message = None
    integration.error_count = 0
    db.commit()
    db.refresh(integration)
    
    return integration


@router.post("/{integration_id}/disconnect", response_model=IntegrationResponse)
async def disconnect_integration(
    integration_id: int,
    admin: User = Depends(require_admin()),
    db: Session = Depends(get_db),
):
    """Disconnect integration"""
    integration = (
        db.query(Integration)
        .filter(Integration.id == integration_id, Integration.user_id == admin.id)
        .first()
    )
    
    if not integration:
        raise HTTPException(status_code=404, detail="Integration not found")
    
    integration.status = "inactive"
    integration.disconnected_at = datetime.utcnow()
    db.commit()
    db.refresh(integration)
    
    return integration


@router.post("/{integration_id}/sync", response_model=SyncLogResponse)
async def sync_integration(
    integration_id: int,
    request: SyncNowRequest,
    admin: User = Depends(require_admin()),
    db: Session = Depends(get_db),
):
    """Manually trigger integration sync"""
    integration = (
        db.query(Integration)
        .filter(Integration.id == integration_id, Integration.user_id == admin.id)
        .first()
    )
    
    if not integration:
        raise HTTPException(status_code=404, detail="Integration not found")
    
    if integration.status != "active":
        raise HTTPException(
            status_code=400,
            detail="Integration must be active to sync"
        )
    
    # Create sync log
    sync_log = IntegrationSyncLog(
        integration_id=integration.id,
        sync_type=request.sync_type,
        status="success",  # Placeholder
        started_at=datetime.utcnow()
    )
    
    # Simulate sync (in production: actual API sync logic)
    try:
        # Placeholder sync logic
        records_processed = 100
        records_created = 20
        records_updated = 75
        records_failed = 5
        
        sync_log.records_processed = records_processed
        sync_log.records_created = records_created
        sync_log.records_updated = records_updated
        sync_log.records_failed = records_failed
        sync_log.completed_at = datetime.utcnow()
        sync_log.duration_seconds = 5
        
        # Update integration
        integration.last_sync = datetime.utcnow()
        integration.next_scheduled_sync = calculate_next_sync(
            integration.sync_frequency,
            integration.last_sync
        )
        integration.records_synced += records_processed
        integration.status = "active"
        
    except Exception as e:
        sync_log.status = "error"
        sync_log.error_message = str(e)
        sync_log.completed_at = datetime.utcnow()
        
        integration.status = "error"
        integration.error_message = str(e)
        integration.error_count += 1
        integration.last_error_at = datetime.utcnow()
    
    db.add(sync_log)
    db.commit()
    db.refresh(sync_log)
    
    return sync_log


@router.post("/test-connection", response_model=TestConnectionResponse)
async def test_connection(
    request: TestConnectionRequest,
    admin: User = Depends(require_admin()),
    db: Session = Depends(get_db),
):
    """Test connection to integration provider"""
    result = test_integration_connection(
        request.provider,
        request.base_url,
        request.api_key,
        request.api_secret
    )
    return result


# ============================================================================
# Statistics & Logs
# ============================================================================

@router.get("/stats", response_model=IntegrationStats)
async def get_integration_stats(
    admin: User = Depends(require_admin()),
    db: Session = Depends(get_db),
):
    """Get integration statistics"""
    integrations = (
        db.query(Integration)
        .filter(Integration.user_id == admin.id)
        .all()
    )
    
    return IntegrationStats(
        total=len(integrations),
        active=len([i for i in integrations if i.status == "active"]),
        inactive=len([i for i in integrations if i.status == "inactive"]),
        error=len([i for i in integrations if i.status == "error"]),
        syncing=len([i for i in integrations if i.status == "syncing"]),
        total_records_synced=sum(i.records_synced for i in integrations)
    )


@router.get("/{integration_id}/logs", response_model=List[SyncLogResponse])
async def get_sync_logs(
    integration_id: int,
    limit: int = 50,
    admin: User = Depends(require_admin()),
    db: Session = Depends(get_db),
):
    """Get sync logs for an integration"""
    # Verify integration ownership
    integration = (
        db.query(Integration)
        .filter(Integration.id == integration_id, Integration.user_id == admin.id)
        .first()
    )
    
    if not integration:
        raise HTTPException(status_code=404, detail="Integration not found")
    
    logs = (
        db.query(IntegrationSyncLog)
        .filter(IntegrationSyncLog.integration_id == integration_id)
        .order_by(IntegrationSyncLog.started_at.desc())
        .limit(limit)
        .all()
    )
    
    return logs
