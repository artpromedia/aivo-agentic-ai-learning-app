"""
District Admin - Professional Development & Training
Endpoints for district administrators to manage training programs
"""

from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel

from app.middleware.auth import get_current_user
from app.types.auth import Role, SessionData

router = APIRouter()


# Pydantic Models
class TrainingModule(BaseModel):
    """Training module details"""

    id: str
    title: str
    description: Optional[str] = None
    category: str
    duration_hours: int
    certification_available: bool
    content_url: Optional[str] = None
    thumbnail_url: Optional[str] = None
    is_active: bool
    enrollment_count: int
    completion_rate: float
    created_at: str


class CertificationStats(BaseModel):
    """Training certification statistics"""

    total_enrolled: int
    completed: int
    in_progress: int
    completion_rate: float
    average_time_hours: float
    certifications_issued: int


class TrainingEnrollment(BaseModel):
    """Training enrollment details"""

    id: str
    user_id: str
    module_id: str
    enrolled_at: str
    started_at: Optional[str] = None
    completed_at: Optional[str] = None
    progress: int
    status: str


@router.get("/modules", response_model=List[TrainingModule])
async def list_training_modules(
    category: Optional[str] = Query(None),
    limit: int = Query(100, ge=1, le=500),
    offset: int = Query(0, ge=0),
    current_user: SessionData = Depends(get_current_user),
):
    """
    List all training modules available in the district
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
                tm.id, tm.title, tm.description, tm.category,
                tm.duration_hours, tm.certification_available,
                tm.content_url, tm.thumbnail_url, tm.is_active,
                tm.created_at,
                COUNT(DISTINCT te.id) as enrollment_count,
                COALESCE(
                    AVG(
                        CASE WHEN te.completed_at IS NOT NULL 
                        THEN 100 ELSE 0 END
                    ), 0
                ) as completion_rate
            FROM training_modules tm
            LEFT JOIN training_enrollments te ON tm.id = te.module_id
            LEFT JOIN users u ON te.user_id = u.id
            LEFT JOIN teacher_profiles tp ON u.id = tp.user_id
            LEFT JOIN parent_profiles pp ON u.id = pp.user_id
            LEFT JOIN schools s ON (
                tp.school_id = s.id OR pp.school_id = s.id
            )
            WHERE s.district_id = $1 OR te.id IS NULL
            """
        ]

        params = [district_id]
        param_num = 2

        if category:
            query_parts.append(f"AND tm.category = ${param_num}")
            params.append(category)
            param_num += 1

        query_parts.append(
            """
            GROUP BY tm.id, tm.title, tm.description, tm.category,
                     tm.duration_hours, tm.certification_available,
                     tm.content_url, tm.thumbnail_url, tm.is_active,
                     tm.created_at
            ORDER BY tm.created_at DESC
            """
        )
        query_parts.append(f"LIMIT ${param_num} OFFSET ${param_num + 1}")
        params.extend([limit, offset])

        query = " ".join(query_parts)
        rows = await db.fetch(query, *params)

        return [
            TrainingModule(
                id=str(row["id"]),
                title=row["title"],
                description=row["description"],
                category=row["category"],
                duration_hours=row["duration_hours"],
                certification_available=row["certification_available"],
                content_url=row["content_url"],
                thumbnail_url=row["thumbnail_url"],
                is_active=row["is_active"],
                enrollment_count=row["enrollment_count"],
                completion_rate=round(float(row["completion_rate"]), 2),
                created_at=row["created_at"].isoformat(),
            )
            for row in rows
        ]

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e)) from e


@router.get("/stats", response_model=CertificationStats)
async def get_certification_stats(
    current_user: SessionData = Depends(get_current_user),
):
    """
    Get training and certification statistics for the district
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

        # Get enrollment stats
        stats_query = """
            SELECT
                COUNT(DISTINCT te.id) as total_enrolled,
                COUNT(DISTINCT te.id) FILTER (
                    WHERE te.completed_at IS NOT NULL
                ) as completed,
                COUNT(DISTINCT te.id) FILTER (
                    WHERE te.started_at IS NOT NULL 
                    AND te.completed_at IS NULL
                ) as in_progress,
                COALESCE(
                    AVG(
                        EXTRACT(
                            EPOCH FROM (
                                te.completed_at - te.enrolled_at
                            )
                        ) / 3600
                    ) FILTER (WHERE te.completed_at IS NOT NULL),
                    0
                ) as average_time_hours,
                COUNT(DISTINCT tc.id) as certifications_issued
            FROM training_enrollments te
            JOIN users u ON te.user_id = u.id
            LEFT JOIN teacher_profiles tp ON u.id = tp.user_id
            LEFT JOIN parent_profiles pp ON u.id = pp.user_id
            LEFT JOIN schools s ON (
                tp.school_id = s.id OR pp.school_id = s.id
            )
            LEFT JOIN training_certifications tc ON (
                te.user_id = tc.user_id 
                AND te.module_id = tc.module_id
            )
            WHERE s.district_id = $1
        """
        stats = await db.fetchrow(stats_query, district_id)

        total = stats["total_enrolled"] or 0
        completed = stats["completed"] or 0
        completion_rate = (completed / total * 100) if total > 0 else 0

        return CertificationStats(
            total_enrolled=total,
            completed=completed,
            in_progress=stats["in_progress"] or 0,
            completion_rate=round(completion_rate, 2),
            average_time_hours=round(float(stats["average_time_hours"]), 2),
            certifications_issued=stats["certifications_issued"] or 0,
        )

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e)) from e


@router.get("/enrollments", response_model=List[TrainingEnrollment])
async def list_enrollments(
    module_id: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
    limit: int = Query(100, ge=1, le=500),
    offset: int = Query(0, ge=0),
    current_user: SessionData = Depends(get_current_user),
):
    """
    List training enrollments in the district
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
                te.id, te.user_id, te.module_id,
                te.enrolled_at, te.started_at, te.completed_at,
                te.progress, te.status
            FROM training_enrollments te
            JOIN users u ON te.user_id = u.id
            LEFT JOIN teacher_profiles tp ON u.id = tp.user_id
            LEFT JOIN parent_profiles pp ON u.id = pp.user_id
            LEFT JOIN schools s ON (
                tp.school_id = s.id OR pp.school_id = s.id
            )
            WHERE s.district_id = $1
            """
        ]

        params = [district_id]
        param_num = 2

        if module_id:
            query_parts.append(f"AND te.module_id = ${param_num}")
            params.append(module_id)
            param_num += 1

        if status:
            query_parts.append(f"AND te.status = ${param_num}")
            params.append(status)
            param_num += 1

        query_parts.append("ORDER BY te.enrolled_at DESC")
        query_parts.append(f"LIMIT ${param_num} OFFSET ${param_num + 1}")
        params.extend([limit, offset])

        query = " ".join(query_parts)
        rows = await db.fetch(query, *params)

        return [
            TrainingEnrollment(
                id=str(row["id"]),
                user_id=str(row["user_id"]),
                module_id=str(row["module_id"]),
                enrolled_at=row["enrolled_at"].isoformat(),
                started_at=row["started_at"].isoformat() if row["started_at"] else None,
                completed_at=row["completed_at"].isoformat() if row["completed_at"] else None,
                progress=row["progress"],
                status=row["status"],
            )
            for row in rows
        ]

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e)) from e
