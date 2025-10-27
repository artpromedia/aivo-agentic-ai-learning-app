"""
Support Desk API endpoints.
Handles support tickets, replies, and knowledge base articles.
"""
from datetime import datetime
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel, Field
from sqlalchemy import desc
from sqlalchemy.orm import Session

from app.api.deps import get_db, require_admin
from app.models.support import (
    KnowledgeBaseArticle,
    SupportTicket,
    TicketCategory,
    TicketPriority,
    TicketReply,
    TicketStatus,
)
from app.models.user import User

router = APIRouter()


# ============================================================================
# Pydantic Models
# ============================================================================

class TicketCreateRequest(BaseModel):
    """Request model for creating a new support ticket."""
    title: str = Field(..., min_length=3, max_length=255)
    description: str = Field(..., min_length=10)
    category: str
    priority: str


class TicketUpdateRequest(BaseModel):
    """Request model for updating a support ticket."""
    status: Optional[str] = None
    priority: Optional[str] = None
    assigned_to: Optional[int] = None


class ReplyCreateRequest(BaseModel):
    """Request model for adding a reply to a ticket."""
    message: str = Field(..., min_length=1)


class TicketResponse(BaseModel):
    """Response model for support ticket details."""
    id: int
    ticket_number: str
    title: str
    description: str
    category: str
    priority: str
    status: str
    submitted_by: int
    submitted_by_name: Optional[str]
    submitted_by_role: Optional[str]
    school_name: Optional[str]
    assigned_to: Optional[int]
    created_at: datetime
    updated_at: datetime
    resolved_at: Optional[datetime]
    closed_at: Optional[datetime]
    
    class Config:
        from_attributes = True


class ReplyResponse(BaseModel):
    """Response model for ticket reply."""
    id: int
    ticket_id: int
    message: str
    author_id: int
    author_name: Optional[str]
    is_staff_reply: str
    created_at: datetime
    
    class Config:
        from_attributes = True


class TicketWithRepliesResponse(BaseModel):
    """Response model for ticket with all replies."""
    ticket: TicketResponse
    replies: List[ReplyResponse]


class KBArticleResponse(BaseModel):
    """Response model for knowledge base article."""
    id: int
    title: str
    content: str
    summary: Optional[str]
    category: str
    tags: Optional[str]
    is_published: str
    view_count: int
    helpful_count: int
    not_helpful_count: int
    author_id: int
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True


# ============================================================================
# Helper Functions
# ============================================================================

def generate_ticket_number(db: Session) -> str:
    """Generate a unique ticket number."""
    # Get count of tickets to generate sequential number
    count = db.query(SupportTicket).count()
    return f"TICKET-{count + 1:06d}"


# ============================================================================
# API Endpoints
# ============================================================================

@router.get("/tickets", response_model=List[TicketResponse])
async def list_tickets(
    category: Optional[str] = Query(None, description="Filter by category"),
    status: Optional[str] = Query(None, description="Filter by status"),
    priority: Optional[str] = Query(None, description="Filter by priority"),
    limit: int = Query(50, ge=1, le=100),
    offset: int = Query(0, ge=0),
    admin: User = Depends(require_admin()),
    db: Session = Depends(get_db),
):
    """
    List all support tickets with optional filtering.
    Returns tickets ordered by created date (newest first).
    """
    query = db.query(SupportTicket)
    
    # Apply filters
    if category:
        query = query.filter(SupportTicket.category == category)
    
    if status:
        query = query.filter(SupportTicket.status == status)
    
    if priority:
        query = query.filter(SupportTicket.priority == priority)
    
    # Order by created date descending
    query = query.order_by(desc(SupportTicket.created_at))
    
    # Pagination
    tickets = query.offset(offset).limit(limit).all()
    
    return tickets


@router.post("/tickets", response_model=TicketResponse, status_code=201)
async def create_ticket(
    request: TicketCreateRequest,
    admin: User = Depends(require_admin()),
    db: Session = Depends(get_db),
):
    """
    Create a new support ticket.
    Automatically generates a unique ticket number.
    """
    # Generate ticket number
    ticket_number = generate_ticket_number(db)
    
    # Create ticket
    ticket = SupportTicket(
        ticket_number=ticket_number,
        title=request.title,
        description=request.description,
        category=request.category,
        priority=request.priority,
        status=TicketStatus.OPEN,
        submitted_by=admin.id,
        submitted_by_name=admin.full_name,
        submitted_by_role=admin.role.value if hasattr(admin.role, 'value') else str(admin.role),
        school_name=getattr(admin, 'school_name', None),
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow(),
    )
    
    db.add(ticket)
    db.commit()
    db.refresh(ticket)
    
    return ticket


@router.get("/tickets/{ticket_id}", response_model=TicketWithRepliesResponse)
async def get_ticket(
    ticket_id: int,
    admin: User = Depends(require_admin()),
    db: Session = Depends(get_db),
):
    """
    Get details of a specific ticket including all replies.
    """
    ticket = db.query(SupportTicket).filter(SupportTicket.id == ticket_id).first()
    
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket not found")
    
    # Get all replies for this ticket
    replies = db.query(TicketReply).filter(
        TicketReply.ticket_id == ticket_id
    ).order_by(TicketReply.created_at).all()
    
    return {
        "ticket": ticket,
        "replies": replies
    }


@router.patch("/tickets/{ticket_id}", response_model=TicketResponse)
async def update_ticket(
    ticket_id: int,
    request: TicketUpdateRequest,
    admin: User = Depends(require_admin()),
    db: Session = Depends(get_db),
):
    """
    Update a support ticket status, priority, or assignment.
    Automatically updates timestamps for status changes.
    """
    ticket = db.query(SupportTicket).filter(SupportTicket.id == ticket_id).first()
    
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket not found")
    
    # Update fields if provided
    if request.status is not None:
        old_status = ticket.status
        ticket.status = request.status
        
        # Update timestamps based on status change
        if request.status == TicketStatus.RESOLVED and old_status != TicketStatus.RESOLVED:
            ticket.resolved_at = datetime.utcnow()
        elif request.status == TicketStatus.CLOSED and old_status != TicketStatus.CLOSED:
            ticket.closed_at = datetime.utcnow()
    
    if request.priority is not None:
        ticket.priority = request.priority
    
    if request.assigned_to is not None:
        ticket.assigned_to = request.assigned_to
    
    ticket.updated_at = datetime.utcnow()
    
    db.commit()
    db.refresh(ticket)
    
    return ticket


@router.post("/tickets/{ticket_id}/replies", response_model=ReplyResponse, status_code=201)
async def add_reply(
    ticket_id: int,
    request: ReplyCreateRequest,
    admin: User = Depends(require_admin()),
    db: Session = Depends(get_db),
):
    """
    Add a reply to a support ticket.
    Updates the ticket's updated_at timestamp.
    """
    # Verify ticket exists
    ticket = db.query(SupportTicket).filter(SupportTicket.id == ticket_id).first()
    
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket not found")
    
    # Create reply
    reply = TicketReply(
        ticket_id=ticket_id,
        message=request.message,
        author_id=admin.id,
        author_name=admin.full_name,
        is_staff_reply="true",  # Assume admin users are staff
        created_at=datetime.utcnow(),
    )
    
    db.add(reply)
    
    # Update ticket's updated_at timestamp
    ticket.updated_at = datetime.utcnow()
    
    db.commit()
    db.refresh(reply)
    
    return reply


@router.get("/kb-articles", response_model=List[KBArticleResponse])
async def list_kb_articles(
    category: Optional[str] = Query(None, description="Filter by category"),
    search: Optional[str] = Query(None, description="Search in title and content"),
    limit: int = Query(20, ge=1, le=100),
    offset: int = Query(0, ge=0),
    db: Session = Depends(get_db),
):
    """
    List knowledge base articles.
    Public endpoint - no authentication required for reading articles.
    """
    query = db.query(KnowledgeBaseArticle).filter(
        KnowledgeBaseArticle.is_published == "true"
    )
    
    # Apply filters
    if category:
        query = query.filter(KnowledgeBaseArticle.category == category)
    
    if search:
        search_pattern = f"%{search}%"
        query = query.filter(
            (KnowledgeBaseArticle.title.ilike(search_pattern)) |
            (KnowledgeBaseArticle.content.ilike(search_pattern))
        )
    
    # Order by helpful count and view count
    query = query.order_by(
        desc(KnowledgeBaseArticle.helpful_count),
        desc(KnowledgeBaseArticle.view_count)
    )
    
    # Pagination
    articles = query.offset(offset).limit(limit).all()
    
    return articles


@router.get("/kb-articles/{article_id}", response_model=KBArticleResponse)
async def get_kb_article(
    article_id: int,
    db: Session = Depends(get_db),
):
    """
    Get a specific knowledge base article.
    Increments view count automatically.
    """
    article = db.query(KnowledgeBaseArticle).filter(
        KnowledgeBaseArticle.id == article_id,
        KnowledgeBaseArticle.is_published == "true"
    ).first()
    
    if not article:
        raise HTTPException(status_code=404, detail="Article not found")
    
    # Increment view count
    article.view_count += 1
    db.commit()
    db.refresh(article)
    
    return article


@router.get("/stats", response_model=dict)
async def get_support_stats(
    admin: User = Depends(require_admin()),
    db: Session = Depends(get_db),
):
    """
    Get support desk statistics.
    Returns counts by status, category, and priority.
    """
    total_tickets = db.query(SupportTicket).count()
    
    # Count by status
    open_count = db.query(SupportTicket).filter(
        SupportTicket.status == TicketStatus.OPEN
    ).count()
    
    in_progress_count = db.query(SupportTicket).filter(
        SupportTicket.status == TicketStatus.IN_PROGRESS
    ).count()
    
    resolved_count = db.query(SupportTicket).filter(
        SupportTicket.status == TicketStatus.RESOLVED
    ).count()
    
    closed_count = db.query(SupportTicket).filter(
        SupportTicket.status == TicketStatus.CLOSED
    ).count()
    
    # Count by priority
    urgent_count = db.query(SupportTicket).filter(
        SupportTicket.priority == TicketPriority.URGENT,
        SupportTicket.status.in_([TicketStatus.OPEN, TicketStatus.IN_PROGRESS])
    ).count()
    
    return {
        "total_tickets": total_tickets,
        "open": open_count,
        "in_progress": in_progress_count,
        "resolved": resolved_count,
        "closed": closed_count,
        "urgent_open": urgent_count,
    }
