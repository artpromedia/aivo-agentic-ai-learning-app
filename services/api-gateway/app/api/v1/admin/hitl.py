"""
HITL (Human-in-the-Loop) Operations API
For content moderation and AI output review
"""
from datetime import datetime
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.api.deps import require_admin
from app.core.database import get_db
from app.models.hitl import (
    HITLQueue,
    HITLQueuePriority,
    HITLQueueStatus,
    HITLQueueType,
)

router = APIRouter()


# Pydantic schemas


class HITLQueueItemCreate(BaseModel):
    type: HITLQueueType
    source_id: Optional[str] = None
    source_type: Optional[str] = None
    content: str
    context: Optional[dict] = None
    ai_metadata: Optional[dict] = None
    priority: HITLQueuePriority = HITLQueuePriority.MEDIUM
    flagged_reason: Optional[str] = None
    flagged_by: Optional[str] = None


class HITLQueueItemReview(BaseModel):
    status: HITLQueueStatus
    review_notes: Optional[str] = None
    review_decision: Optional[dict] = None


class HITLQueueItemAssign(BaseModel):
    assigned_to: str


class HITLQueueItemResponse(BaseModel):
    id: int
    type: str
    source_id: Optional[str]
    source_type: Optional[str]
    content: str
    context: Optional[dict]
    ai_metadata: Optional[dict]
    status: str
    priority: str
    reviewed_by: Optional[str]
    reviewed_at: Optional[datetime]
    review_notes: Optional[str]
    review_decision: Optional[dict]
    assigned_to: Optional[str]
    assigned_at: Optional[datetime]
    flagged_reason: Optional[str]
    flagged_by: Optional[str]
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# API Endpoints


@router.get(
    "/",
    response_model=List[HITLQueueItemResponse],
    summary="List HITL queue items"
)
async def list_hitl_queue(
    status_filter: Optional[HITLQueueStatus] = Query(
        None,
        alias="status",
        description="Filter by status"
    ),
    priority: Optional[HITLQueuePriority] = Query(
        None,
        description="Filter by priority"
    ),
    type_filter: Optional[HITLQueueType] = Query(
        None,
        alias="type",
        description="Filter by type"
    ),
    assigned_to: Optional[str] = Query(
        None,
        description="Filter by assigned user"
    ),
    limit: int = Query(50, ge=1, le=500),
    offset: int = Query(0, ge=0),
    db: Session = Depends(get_db),
    _: dict = Depends(require_admin)
):
    """Get HITqueue items with optional filtering."""
    query = db.query(HITLQueue)
    
    if status_filter:
        query = query.filter(HITLQueue.status == status_filter)
    if priority:
        query = query.filter(HITLQueue.priority == priority)
    if type_filter:
        query = query.filter(HITLQueue.type == type_filter)
    if assigned_to:
        query = query.filter(HITLQueue.assigned_to == assigned_to)
    
    # Order by priority and created date
    query = query.order_by(
        HITLQueue.priority.desc(),
        HITLQueue.created_at.asc()
    )
    
    items = query.limit(limit).offset(offset).all()
    return items


@router.post(
    "/",
    response_model=HITLQueueItemResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create a new HITL queue item"
)
async def create_hitl_item(
    item_data: HITLQueueItemCreate,
    db: Session = Depends(get_db),
    _: dict = Depends(require_admin)
):
    """Add a new item to the HITL queue."""
    item = HITLQueue(**item_data.model_dump())
    db.add(item)
    db.commit()
    db.refresh(item)
    
    return item


@router.get(
    "/{item_id}",
    response_model=HITLQueueItemResponse,
    summary="Get a HITL queue item by ID"
)
async def get_hitl_item(
    item_id: int,
    db: Session = Depends(get_db),
    _: dict = Depends(require_admin)
):
    """Get a specific HITL queue item."""
    item = db.query(HITLQueue).filter(HITLQueue.id == item_id).first()
    if not item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="HITL queue item not found"
        )
    return item


@router.post(
    "/{item_id}/review",
    response_model=HITLQueueItemResponse,
    summary="Review a HITL queue item"
)
async def review_hitl_item(
    item_id: int,
    review_data: HITLQueueItemReview,
    db: Session = Depends(get_db),
    admin: dict = Depends(require_admin)
):
    """Review and approve/reject a HITL queue item."""
    item = db.query(HITLQueue).filter(HITLQueue.id == item_id).first()
    if not item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="HITL queue item not found"
        )
    
    # Update review fields
    item.status = review_data.status
    item.review_notes = review_data.review_notes
    item.review_decision = review_data.review_decision
    item.reviewed_by = admin.get("email", "unknown")
    item.reviewed_at = datetime.utcnow()
    
    db.commit()
    db.refresh(item)
    
    return item


@router.post(
    "/{item_id}/assign",
    response_model=HITLQueueItemResponse,
    summary="Assign a HITL queue item to a reviewer"
)
async def assign_hitl_item(
    item_id: int,
    assign_data: HITLQueueItemAssign,
    db: Session = Depends(get_db),
    _: dict = Depends(require_admin)
):
    """Assign a HITL queue item to a specific reviewer."""
    item = db.query(HITLQueue).filter(HITLQueue.id == item_id).first()
    if not item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="HITL queue item not found"
        )
    
    item.assigned_to = assign_data.assigned_to
    item.assigned_at = datetime.utcnow()
    item.status = HITLQueueStatus.IN_REVIEW
    
    db.commit()
    db.refresh(item)
    
    return item


@router.post(
    "/{item_id}/approve",
    response_model=HITLQueueItemResponse,
    summary="Approve a HITL queue item"
)
async def approve_hitl_item(
    item_id: int,
    notes: Optional[str] = Query(None, description="Approval notes"),
    db: Session = Depends(get_db),
    admin: dict = Depends(require_admin)
):
    """Quick approve a HITL queue item."""
    item = db.query(HITLQueue).filter(HITLQueue.id == item_id).first()
    if not item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="HITL queue item not found"
        )
    
    item.status = HITLQueueStatus.APPROVED
    item.review_notes = notes
    item.reviewed_by = admin.get("email", "unknown")
    item.reviewed_at = datetime.utcnow()
    
    db.commit()
    db.refresh(item)
    
    return item


@router.post(
    "/{item_id}/reject",
    response_model=HITLQueueItemResponse,
    summary="Reject a HITL queue item"
)
async def reject_hitl_item(
    item_id: int,
    notes: Optional[str] = Query(None, description="Rejection reason"),
    db: Session = Depends(get_db),
    admin: dict = Depends(require_admin)
):
    """Quick reject a HITL queue item."""
    item = db.query(HITLQueue).filter(HITLQueue.id == item_id).first()
    if not item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="HITL queue item not found"
        )
    
    item.status = HITLQueueStatus.REJECTED
    item.review_notes = notes
    item.reviewed_by = admin.get("email", "unknown")
    item.reviewed_at = datetime.utcnow()
    
    db.commit()
    db.refresh(item)
    
    return item


@router.delete(
    "/{item_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Delete a HITL queue item"
)
async def delete_hitl_item(
    item_id: int,
    db: Session = Depends(get_db),
    _: dict = Depends(require_admin)
):
    """Delete a HITL queue item."""
    item = db.query(HITLQueue).filter(HITLQueue.id == item_id).first()
    if not item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="HITL queue item not found"
        )
    
    db.delete(item)
    db.commit()
    
    return None


@router.get(
    "/stats/summary",
    summary="Get HITL queue statistics"
)
async def get_hitl_stats(
    db: Session = Depends(get_db),
    _: dict = Depends(require_admin)
):
    """Get summary statistics for the HITL queue."""
    total = db.query(HITLQueue).count()
    pending = db.query(HITLQueue).filter(
        HITLQueue.status == HITLQueueStatus.PENDING
    ).count()
    in_review = db.query(HITLQueue).filter(
        HITLQueue.status == HITLQueueStatus.IN_REVIEW
    ).count()
    approved = db.query(HITLQueue).filter(
        HITLQueue.status == HITLQueueStatus.APPROVED
    ).count()
    rejected = db.query(HITLQueue).filter(
        HITLQueue.status == HITLQueueStatus.REJECTED
    ).count()
    escalated = db.query(HITLQueue).filter(
        HITLQueue.status == HITLQueueStatus.ESCALATED
    ).count()
    
    # Priority breakdown
    urgent = db.query(HITLQueue).filter(
        HITLQueue.priority == HITLQueuePriority.URGENT,
        HITLQueue.status == HITLQueueStatus.PENDING
    ).count()
    high = db.query(HITLQueue).filter(
        HITLQueue.priority == HITLQueuePriority.HIGH,
        HITLQueue.status == HITLQueueStatus.PENDING
    ).count()
    
    return {
        "total": total,
        "by_status": {
            "pending": pending,
            "in_review": in_review,
            "approved": approved,
            "rejected": rejected,
            "escalated": escalated
        },
        "urgent_pending": urgent,
        "high_pending": high,
        "requires_attention": pending + in_review
    }
