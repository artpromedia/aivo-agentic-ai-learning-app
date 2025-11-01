"""
District Admin - Support Desk
Endpoints for district administrators to manage support tickets
"""

from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel

from app.middleware.auth import get_current_user
from app.types.auth import SessionData

router = APIRouter()


# Pydantic Models
class SupportStats(BaseModel):
    """Support ticket statistics"""

    total_tickets: int
    open: int
    in_progress: int
    resolved: int
    closed: int
    urgent_open: int


class SupportTicket(BaseModel):
    """Support ticket details"""

    id: str
    ticket_number: str
    title: str
    description: str
    category: str
    priority: str
    status: str
    created_by: str
    created_by_name: str
    assigned_to: Optional[str] = None
    assigned_to_name: Optional[str] = None
    created_at: str
    updated_at: Optional[str] = None
    resolved_at: Optional[str] = None


class TicketReply(BaseModel):
    """Ticket reply details"""

    id: str
    ticket_id: str
    message: str
    created_by: str
    created_by_name: str
    is_staff_reply: bool
    created_at: str


class TicketWithReplies(BaseModel):
    """Ticket with all replies"""

    ticket: SupportTicket
    replies: List[TicketReply]


@router.get("/stats", response_model=SupportStats)
async def get_support_stats(
    current_user: SessionData = Depends(get_current_user),
):
    """
    Get support ticket statistics for the district
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

        # Get ticket stats
        stats_query = """
            SELECT
                COUNT(*) as total_tickets,
                COUNT(*) FILTER (WHERE status = 'open') as open,
                COUNT(*) FILTER (WHERE status = 'in_progress') as in_progress,
                COUNT(*) FILTER (WHERE status = 'resolved') as resolved,
                COUNT(*) FILTER (WHERE status = 'closed') as closed,
                COUNT(*) FILTER (
                    WHERE status IN ('open', 'in_progress')
                    AND priority = 'urgent'
                ) as urgent_open
            FROM support_tickets st
            JOIN users u ON st.created_by = u.id
            LEFT JOIN teacher_profiles tp ON u.id = tp.user_id
            LEFT JOIN parent_profiles pp ON u.id = pp.user_id
            LEFT JOIN schools s ON (
                tp.school_id = s.id OR pp.school_id = s.id
            )
            WHERE s.district_id = $1
        """
        stats = await db.fetchrow(stats_query, district_id)

        return SupportStats(
            total_tickets=stats["total_tickets"],
            open=stats["open"],
            in_progress=stats["in_progress"],
            resolved=stats["resolved"],
            closed=stats["closed"],
            urgent_open=stats["urgent_open"],
        )

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e)) from e


@router.get("", response_model=List[SupportTicket])
async def list_tickets(
    status: Optional[str] = Query(None),
    category: Optional[str] = Query(None),
    priority: Optional[str] = Query(None),
    limit: int = Query(100, ge=1, le=500),
    offset: int = Query(0, ge=0),
    current_user: SessionData = Depends(get_current_user),
):
    """
    List all support tickets in the district
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
                st.id, st.ticket_number, st.title, st.description,
                st.category, st.priority, st.status,
                st.created_by, st.assigned_to,
                st.created_at, st.updated_at, st.resolved_at,
                creator.full_name as created_by_name,
                assignee.full_name as assigned_to_name
            FROM support_tickets st
            JOIN users creator ON st.created_by = creator.id
            LEFT JOIN users assignee ON st.assigned_to = assignee.id
            LEFT JOIN teacher_profiles tp ON creator.id = tp.user_id
            LEFT JOIN parent_profiles pp ON creator.id = pp.user_id
            LEFT JOIN schools s ON (
                tp.school_id = s.id OR pp.school_id = s.id
            )
            WHERE s.district_id = $1
            """
        ]

        params = [district_id]
        param_num = 2

        if status:
            query_parts.append(f"AND st.status = ${param_num}")
            params.append(status)
            param_num += 1

        if category:
            query_parts.append(f"AND st.category = ${param_num}")
            params.append(category)
            param_num += 1

        if priority:
            query_parts.append(f"AND st.priority = ${param_num}")
            params.append(priority)
            param_num += 1

        query_parts.append("ORDER BY st.created_at DESC")
        query_parts.append(f"LIMIT ${param_num} OFFSET ${param_num + 1}")
        params.extend([limit, offset])

        query = " ".join(query_parts)
        rows = await db.fetch(query, *params)

        return [
            SupportTicket(
                id=str(row["id"]),
                ticket_number=row["ticket_number"],
                title=row["title"],
                description=row["description"],
                category=row["category"],
                priority=row["priority"],
                status=row["status"],
                created_by=str(row["created_by"]),
                created_by_name=row["created_by_name"],
                assigned_to=str(row["assigned_to"]) if row["assigned_to"] else None,
                assigned_to_name=row["assigned_to_name"],
                created_at=row["created_at"].isoformat(),
                updated_at=row["updated_at"].isoformat() if row["updated_at"] else None,
                resolved_at=row["resolved_at"].isoformat() if row["resolved_at"] else None,
            )
            for row in rows
        ]

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e)) from e


@router.get("/{ticket_id}", response_model=TicketWithReplies)
async def get_ticket_details(
    ticket_id: str,
    current_user: SessionData = Depends(get_current_user),
):
    """
    Get ticket details with all replies
    Requires: district-admin role
    """
    from app.lib.db import db

    try:
        # Verify ticket belongs to user's district
        ticket_query = """
            SELECT
                st.id, st.ticket_number, st.title, st.description,
                st.category, st.priority, st.status,
                st.created_by, st.assigned_to,
                st.created_at, st.updated_at, st.resolved_at,
                creator.full_name as created_by_name,
                assignee.full_name as assigned_to_name
            FROM support_tickets st
            JOIN users creator ON st.created_by = creator.id
            LEFT JOIN users assignee ON st.assigned_to = assignee.id
            LEFT JOIN teacher_profiles tp ON creator.id = tp.user_id
            LEFT JOIN parent_profiles pp ON creator.id = pp.user_id
            LEFT JOIN schools s ON (
                tp.school_id = s.id OR pp.school_id = s.id
            )
            JOIN district_admin_profiles dap ON s.district_id = dap.district_id
            WHERE st.id = $1 AND dap.user_id = $2
        """
        ticket_row = await db.fetchrow(ticket_query, ticket_id, current_user.user_id)

        if not ticket_row:
            raise HTTPException(status_code=404, detail="Ticket not found")

        ticket = SupportTicket(
            id=str(ticket_row["id"]),
            ticket_number=ticket_row["ticket_number"],
            title=ticket_row["title"],
            description=ticket_row["description"],
            category=ticket_row["category"],
            priority=ticket_row["priority"],
            status=ticket_row["status"],
            created_by=str(ticket_row["created_by"]),
            created_by_name=ticket_row["created_by_name"],
            assigned_to=str(ticket_row["assigned_to"]) if ticket_row["assigned_to"] else None,
            assigned_to_name=ticket_row["assigned_to_name"],
            created_at=ticket_row["created_at"].isoformat(),
            updated_at=ticket_row["updated_at"].isoformat() if ticket_row["updated_at"] else None,
            resolved_at=ticket_row["resolved_at"].isoformat()
            if ticket_row["resolved_at"]
            else None,
        )

        # Get replies
        replies_query = """
            SELECT
                tr.id, tr.ticket_id, tr.message,
                tr.created_by, tr.is_staff_reply, tr.created_at,
                u.full_name as created_by_name
            FROM ticket_replies tr
            JOIN users u ON tr.created_by = u.id
            WHERE tr.ticket_id = $1
            ORDER BY tr.created_at ASC
        """
        reply_rows = await db.fetch(replies_query, ticket_id)

        replies = [
            TicketReply(
                id=str(row["id"]),
                ticket_id=str(row["ticket_id"]),
                message=row["message"],
                created_by=str(row["created_by"]),
                created_by_name=row["created_by_name"],
                is_staff_reply=row["is_staff_reply"],
                created_at=row["created_at"].isoformat(),
            )
            for row in reply_rows
        ]

        return TicketWithReplies(ticket=ticket, replies=replies)

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e)) from e
