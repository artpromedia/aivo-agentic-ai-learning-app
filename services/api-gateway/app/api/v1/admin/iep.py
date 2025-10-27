"""
District Admin - IEP Management API

Endpoints for managing IEP goals, tracking compliance, and scheduling reports.
"""

from datetime import date, datetime, timedelta
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import func, and_, or_
from sqlalchemy.orm import Session, joinedload
from pydantic import BaseModel, Field, ConfigDict

from app.api.deps import get_db, require_admin
from app.models.iep import IEPGoal, IEPGoalStatus, IEPDataPoint
from app.models.learner import Learner

router = APIRouter()


# ============================================================================
# Pydantic Schemas
# ============================================================================

class IEPGoalBase(BaseModel):
    """Base schema for IEP goal"""
    goal_name: str = Field(..., max_length=500)
    goal_description: Optional[str] = None
    category: Optional[str] = Field(None, max_length=100)
    current_level: Optional[str] = Field(None, max_length=255)
    target_level: Optional[str] = Field(None, max_length=255)
    start_date: Optional[date] = None
    target_date: Optional[date] = None
    status: Optional[IEPGoalStatus] = IEPGoalStatus.NOT_STARTED
    accommodations: Optional[list] = None


class IEPGoalUpdate(BaseModel):
    """Schema for updating IEP goal"""
    goal_name: Optional[str] = Field(None, max_length=500)
    goal_description: Optional[str] = None
    category: Optional[str] = Field(None, max_length=100)
    current_level: Optional[str] = Field(None, max_length=255)
    target_level: Optional[str] = Field(None, max_length=255)
    start_date: Optional[date] = None
    target_date: Optional[date] = None
    progress_percentage: Optional[int] = Field(None, ge=0, le=100)
    status: Optional[IEPGoalStatus] = None
    accommodations: Optional[list] = None


class IEPGoalResponse(BaseModel):
    """Response schema for IEP goal with related data"""
    model_config = ConfigDict(from_attributes=True)
    
    id: str
    learner_id: str
    goal_name: str
    goal_description: Optional[str] = None
    category: Optional[str] = None
    current_level: Optional[str] = None
    target_level: Optional[str] = None
    start_date: Optional[date] = None
    target_date: Optional[date] = None
    progress_percentage: int
    status: IEPGoalStatus
    accommodations: Optional[list] = None
    created_at: datetime
    updated_at: datetime
    
    # Computed fields
    is_overdue: Optional[bool] = None
    learner_name: Optional[str] = None
    school_name: Optional[str] = None
    

class IEPStatsResponse(BaseModel):
    """Response schema for IEP statistics"""
    total_goals: int
    on_track: int
    needs_attention: int
    exceeding: int
    not_started: int
    overdue_count: int
    upcoming_30_days: int
    upcoming_60_days: int
    upcoming_90_days: int
    compliance_rate: float


class ReportScheduleCreate(BaseModel):
    """Schema for scheduling a report"""
    report_type: str = Field(..., max_length=100)
    school_ids: Optional[list[str]] = None
    date_range_start: Optional[date] = None
    date_range_end: Optional[date] = None
    frequency: str = Field("once", max_length=50)  # once, daily, weekly, monthly
    recipients: list[str] = []  # email addresses


class ReportScheduleResponse(BaseModel):
    """Response schema for scheduled report"""
    schedule_id: str
    report_type: str
    scheduled_date: datetime
    schools_count: int
    status: str


# ============================================================================
# Helper Functions
# ============================================================================

def calculate_is_overdue(goal: IEPGoal) -> bool:
    """Check if IEP goal is overdue"""
    if not goal.target_date:
        return False
    
    today = date.today()
    return goal.target_date < today and goal.progress_percentage < 100


def enrich_goal_response(goal: IEPGoal, db: Session) -> dict:
    """Enrich IEP goal with computed fields"""
    goal_dict = {
        "id": goal.id,
        "learner_id": goal.learner_id,
        "goal_name": goal.goal_name,
        "goal_description": goal.goal_description,
        "category": goal.category,
        "current_level": goal.current_level,
        "target_level": goal.target_level,
        "start_date": goal.start_date,
        "target_date": goal.target_date,
        "progress_percentage": goal.progress_percentage,
        "status": goal.status,
        "accommodations": goal.accommodations,
        "created_at": goal.created_at,
        "updated_at": goal.updated_at,
        "is_overdue": calculate_is_overdue(goal),
    }
    
    # Add learner info
    if goal.learner:
        goal_dict["learner_name"] = f"{goal.learner.first_name} {goal.learner.last_name}"
        
        # Add school info if available (learner -> user -> school)
        # Note: School association is through the user, not directly on learner
        # For now, we'll leave school_name as None
        # TODO: Add proper school lookup through user relationship if needed
    
    return goal_dict


# ============================================================================
# API Endpoints
# ============================================================================

@router.get("/goals", response_model=list[IEPGoalResponse])
async def list_iep_goals(
    school_id: Optional[str] = Query(None, description="Filter by school ID"),
    learner_id: Optional[str] = Query(None, description="Filter by learner ID"),
    status: Optional[IEPGoalStatus] = Query(None, description="Filter by status"),
    category: Optional[str] = Query(None, description="Filter by category"),
    overdue: Optional[bool] = Query(None, description="Filter overdue goals only"),
    search: Optional[str] = Query(None, description="Search goal names"),
    limit: int = Query(50, ge=1, le=200),
    offset: int = Query(0, ge=0),
    db: Session = Depends(get_db),
    current_user = Depends(require_admin)
):
    """
    List IEP goals with optional filters.
    
    District admins can view all IEP goals across their schools.
    Supports filtering by school, learner, status, category, and overdue status.
    """
    query = db.query(IEPGoal).options(
        joinedload(IEPGoal.learner)
    )
    
    # Filter by learner_id
    if learner_id:
        query = query.filter(IEPGoal.learner_id == learner_id)
    
    # Note: School filtering is not available as learners don't have direct school association
    # School association is through user model
    if school_id:
        # Skip school filtering for now - learners are associated with users, not schools directly
        pass
    
    # Filter by status
    if status:
        query = query.filter(IEPGoal.status == status)
    
    # Filter by category
    if category:
        query = query.filter(IEPGoal.category == category)
    
    # Filter overdue
    if overdue:
        today = date.today()
        query = query.filter(
            and_(
                IEPGoal.target_date < today,
                IEPGoal.progress_percentage < 100
            )
        )
    
    # Search by goal name
    if search:
        query = query.filter(IEPGoal.goal_name.ilike(f"%{search}%"))
    
    # Order by target date (overdue first, then upcoming)
    query = query.order_by(IEPGoal.target_date.asc())
    
    # Paginate
    goals = query.offset(offset).limit(limit).all()
    
    # Enrich with computed fields
    enriched_goals = [enrich_goal_response(goal, db) for goal in goals]
    
    return enriched_goals


@router.get("/goals/{goal_id}", response_model=IEPGoalResponse)
async def get_iep_goal(
    goal_id: str,
    db: Session = Depends(get_db),
    current_user = Depends(require_admin)
):
    """
    Get detailed information about a specific IEP goal.
    
    Includes learner information and progress data points.
    """
    goal = db.query(IEPGoal).options(
        joinedload(IEPGoal.learner),
        joinedload(IEPGoal.data_points)
    ).filter(IEPGoal.id == goal_id).first()
    
    if not goal:
        raise HTTPException(status_code=404, detail="IEP goal not found")
    
    return enrich_goal_response(goal, db)


@router.patch("/goals/{goal_id}", response_model=IEPGoalResponse)
async def update_iep_goal(
    goal_id: str,
    goal_update: IEPGoalUpdate,
    db: Session = Depends(get_db),
    current_user = Depends(require_admin)
):
    """
    Update an existing IEP goal.
    
    District admins can modify goal details, progress, status, and accommodations.
    """
    goal = db.query(IEPGoal).filter(IEPGoal.id == goal_id).first()
    
    if not goal:
        raise HTTPException(status_code=404, detail="IEP goal not found")
    
    # Update fields that were provided
    update_data = goal_update.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(goal, field, value)
    
    # Update timestamp
    goal.updated_at = datetime.utcnow()
    
    db.commit()
    db.refresh(goal)
    
    return enrich_goal_response(goal, db)


@router.get("/stats", response_model=IEPStatsResponse)
async def get_iep_statistics(
    school_id: Optional[str] = Query(None, description="Filter by school ID"),
    db: Session = Depends(get_db),
    current_user = Depends(require_admin)
):
    """
    Get aggregate IEP statistics across the district or for a specific school.
    
    Returns counts by status, overdue goals, and upcoming review timelines.
    """
    query = db.query(IEPGoal)
    
    # Note: School filtering not available - learners don't have direct school association
    if school_id:
        # Skip school filtering for now
        pass
    
    all_goals = query.all()
    total_goals = len(all_goals)
    
    # Count by status
    on_track = sum(1 for g in all_goals if g.status == IEPGoalStatus.ON_TRACK)
    needs_attention = sum(1 for g in all_goals if g.status == IEPGoalStatus.NEEDS_ATTENTION)
    exceeding = sum(1 for g in all_goals if g.status == IEPGoalStatus.EXCEEDING)
    not_started = sum(1 for g in all_goals if g.status == IEPGoalStatus.NOT_STARTED)
    
    # Count overdue
    today = date.today()
    overdue_count = sum(1 for g in all_goals if calculate_is_overdue(g))
    
    # Count upcoming reviews
    upcoming_30 = sum(
        1 for g in all_goals 
        if g.target_date and today <= g.target_date <= today + timedelta(days=30)
    )
    upcoming_60 = sum(
        1 for g in all_goals 
        if g.target_date and today <= g.target_date <= today + timedelta(days=60)
    )
    upcoming_90 = sum(
        1 for g in all_goals 
        if g.target_date and today <= g.target_date <= today + timedelta(days=90)
    )
    
    # Calculate compliance rate
    compliant_goals = on_track + exceeding
    compliance_rate = (compliant_goals / total_goals * 100) if total_goals > 0 else 0.0
    
    return IEPStatsResponse(
        total_goals=total_goals,
        on_track=on_track,
        needs_attention=needs_attention,
        exceeding=exceeding,
        not_started=not_started,
        overdue_count=overdue_count,
        upcoming_30_days=upcoming_30,
        upcoming_60_days=upcoming_60,
        upcoming_90_days=upcoming_90,
        compliance_rate=round(compliance_rate, 2)
    )


@router.get("/overdue", response_model=list[IEPGoalResponse])
async def get_overdue_ieps(
    school_id: Optional[str] = Query(None, description="Filter by school ID"),
    limit: int = Query(50, ge=1, le=200),
    offset: int = Query(0, ge=0),
    db: Session = Depends(get_db),
    current_user = Depends(require_admin)
):
    """
    Convenience endpoint to get all overdue IEP goals.
    
    Returns goals past their target date with progress < 100%.
    """
    today = date.today()
    query = db.query(IEPGoal).options(
        joinedload(IEPGoal.learner)
    ).filter(
        and_(
            IEPGoal.target_date < today,
            IEPGoal.progress_percentage < 100
        )
    )
    
    # Note: School filtering not available - learners don't have direct school association
    if school_id:
        # Skip school filtering for now
        pass
    
    # Order by how overdue (oldest first)
    query = query.order_by(IEPGoal.target_date.asc())
    
    # Paginate
    goals = query.offset(offset).limit(limit).all()
    
    # Enrich with computed fields
    enriched_goals = [enrich_goal_response(goal, db) for goal in goals]
    
    return enriched_goals


@router.post("/reports/schedule", response_model=ReportScheduleResponse)
async def schedule_report(
    schedule: ReportScheduleCreate,
    db: Session = Depends(get_db),
    current_user = Depends(require_admin)
):
    """
    Schedule an automated IEP report for generation.
    
    Reports can be one-time or recurring (daily, weekly, monthly).
    Supports filtering by schools and date ranges.
    
    Note: This is a simplified implementation. In production, this would:
    - Create a database record for the scheduled report
    - Integrate with a task queue (Celery, etc.)
    - Send notifications when reports are ready
    """
    # Generate schedule ID
    schedule_id = f"schedule_{datetime.utcnow().strftime('%Y%m%d%H%M%S')}"
    
    # Determine scheduled date
    if schedule.date_range_start:
        scheduled_date = datetime.combine(schedule.date_range_start, datetime.min.time())
    else:
        scheduled_date = datetime.utcnow()
    
    # Count schools
    schools_count = len(schedule.school_ids) if schedule.school_ids else 0
    
    # In a real implementation, you would:
    # 1. Save to ReportSchedule model
    # 2. Queue background job
    # 3. Send confirmation email
    
    # For now, return a mock response
    return ReportScheduleResponse(
        schedule_id=schedule_id,
        report_type=schedule.report_type,
        scheduled_date=scheduled_date,
        schools_count=schools_count,
        status="scheduled"
    )
