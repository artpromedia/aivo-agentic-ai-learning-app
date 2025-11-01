"""
District Admin - System Integrations
Endpoints for district administrators to manage system integrations
"""

from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel

from app.middleware.auth import get_current_user
from app.types.auth import SessionData

router = APIRouter()


# Pydantic Models
class IntegrationStats(BaseModel):
    """Integration statistics"""

    total: int
    active: int
    inactive: int
    error: int
    syncing: int
    total_records_synced: int


class Integration(BaseModel):
    """Integration details"""

    id: str
    provider: str
    type: str
    status: str
    last_sync: Optional[str] = None
    sync_frequency: str
    records_synced: int
    last_error: Optional[str] = None
    config: dict
    created_at: str


class IntegrationSyncLog(BaseModel):
    """Integration sync log entry"""

    id: str
    integration_id: str
    started_at: str
    completed_at: Optional[str] = None
    status: str
    records_processed: int
    records_created: int
    records_updated: int
    records_failed: int
    error_message: Optional[str] = None


@router.get("/stats", response_model=IntegrationStats)
async def get_integration_stats(
    current_user: SessionData = Depends(get_current_user),
):
    """
    Get integration statistics for the district
    Requires: district-admin role
    """
    from app.lib.db import db

    try:
        # Get district_id from user profile
        district_query = """
            SELECT district_id
            FROM district_admin_profiles
            WHERE user_id = $1
        """
        district_result = await db.fetchrow(district_query, current_user.user_id)

        if not district_result:
            raise HTTPException(status_code=404, detail="District not found")

        district_id = district_result["district_id"]

        # Get integration stats
        stats_query = """
            SELECT
                COUNT(*) as total,
                COUNT(*) FILTER (WHERE status = 'active') as active,
                COUNT(*) FILTER (WHERE status = 'inactive') as inactive,
                COUNT(*) FILTER (WHERE status = 'error') as error,
                COUNT(*) FILTER (WHERE status = 'syncing') as syncing,
                COALESCE(SUM(records_synced), 0) as total_records_synced
            FROM integrations
            WHERE district_id = $1
        """
        stats = await db.fetchrow(stats_query, district_id)

        return IntegrationStats(
            total=stats["total"],
            active=stats["active"],
            inactive=stats["inactive"],
            error=stats["error"],
            syncing=stats["syncing"],
            total_records_synced=stats["total_records_synced"],
        )

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e)) from e


@router.get("", response_model=List[Integration])
async def list_integrations(
    status: Optional[str] = Query(None),
    type: Optional[str] = Query(None),
    limit: int = Query(100, ge=1, le=500),
    offset: int = Query(0, ge=0),
    current_user: SessionData = Depends(get_current_user),
):
    """
    List all integrations in the district
    Requires: district-admin role
    """
    from app.lib.db import db

    try:
        # Get district_id from user profile
        district_query = """
            SELECT district_id
            FROM district_admin_profiles
            WHERE user_id = $1
        """
        district_result = await db.fetchrow(district_query, current_user.user_id)

        if not district_result:
            raise HTTPException(status_code=404, detail="District not found")

        district_id = district_result["district_id"]

        # Build query with filters
        query_parts = [
            """
            SELECT
                id, provider, type, status, last_sync,
                sync_frequency, records_synced, last_error,
                config, created_at
            FROM integrations
            WHERE district_id = $1
            """
        ]

        params = [district_id]
        param_num = 2

        if status:
            query_parts.append(f"AND status = ${param_num}")
            params.append(status)
            param_num += 1

        if type:
            query_parts.append(f"AND type = ${param_num}")
            params.append(type)
            param_num += 1

        query_parts.append("ORDER BY created_at DESC")
        query_parts.append(f"LIMIT ${param_num} OFFSET ${param_num + 1}")
        params.extend([limit, offset])

        query = " ".join(query_parts)
        rows = await db.fetch(query, *params)

        return [
            Integration(
                id=str(row["id"]),
                provider=row["provider"],
                type=row["type"],
                status=row["status"],
                last_sync=row["last_sync"].isoformat() if row["last_sync"] else None,
                sync_frequency=row["sync_frequency"],
                records_synced=row["records_synced"],
                last_error=row["last_error"],
                config=row["config"] or {},
                created_at=row["created_at"].isoformat(),
            )
            for row in rows
        ]

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e)) from e


@router.get("/{integration_id}/logs", response_model=List[IntegrationSyncLog])
async def get_integration_logs(
    integration_id: str,
    limit: int = Query(50, ge=1, le=200),
    offset: int = Query(0, ge=0),
    current_user: SessionData = Depends(get_current_user),
):
    """
    Get sync logs for a specific integration
    Requires: district-admin role
    """
    from app.lib.db import db

    try:
        # Verify integration belongs to user's district
        district_query = """
            SELECT i.id
            FROM integrations i
            JOIN district_admin_profiles dap ON i.district_id = dap.district_id
            WHERE i.id = $1 AND dap.user_id = $2
        """
        integration_check = await db.fetchrow(district_query, integration_id, current_user.user_id)

        if not integration_check:
            raise HTTPException(status_code=404, detail="Integration not found")

        # Get sync logs
        logs_query = """
            SELECT
                id, integration_id, started_at, completed_at,
                status, records_processed, records_created,
                records_updated, records_failed, error_message
            FROM integration_sync_logs
            WHERE integration_id = $1
            ORDER BY started_at DESC
            LIMIT $2 OFFSET $3
        """
        rows = await db.fetch(logs_query, integration_id, limit, offset)

        return [
            IntegrationSyncLog(
                id=str(row["id"]),
                integration_id=str(row["integration_id"]),
                started_at=row["started_at"].isoformat(),
                completed_at=row["completed_at"].isoformat() if row["completed_at"] else None,
                status=row["status"],
                records_processed=row["records_processed"],
                records_created=row["records_created"],
                records_updated=row["records_updated"],
                records_failed=row["records_failed"],
                error_message=row["error_message"],
            )
            for row in rows
        ]

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e)) from e


@router.post("/{integration_id}/sync")
async def trigger_sync(
    integration_id: str,
    current_user: SessionData = Depends(get_current_user),
):
    """
    Trigger a manual sync for an integration
    Requires: district-admin role
    """
    from app.lib.db import db

    try:
        # Verify integration belongs to user's district
        district_query = """
            SELECT i.id, i.status
            FROM integrations i
            JOIN district_admin_profiles dap ON i.district_id = dap.district_id
            WHERE i.id = $1 AND dap.user_id = $2
        """
        integration = await db.fetchrow(district_query, integration_id, current_user.user_id)

        if not integration:
            raise HTTPException(status_code=404, detail="Integration not found")

        if integration["status"] == "syncing":
            raise HTTPException(status_code=400, detail="Integration is already syncing")

        # Update status to syncing
        await db.execute(
            """
            UPDATE integrations
            SET status = 'syncing', updated_at = NOW()
            WHERE id = $1
            """,
            integration_id,
        )

        # Create sync log entry
        await db.execute(
            """
            INSERT INTO integration_sync_logs (
                integration_id, started_at, status
            )
            VALUES ($1, NOW(), 'in_progress')
            """,
            integration_id,
        )

        return {"message": "Sync triggered successfully"}

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e)) from e
