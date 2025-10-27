"""
Parent Portal Dashboard API - Parent dashboard, children, and progress.

Endpoints for parent dashboard data, children management, and progress tracking.
Created: 2025-10-26
"""
from datetime import datetime, timedelta
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel
from sqlalchemy import func, and_
from sqlalchemy.orm import Session

from app.api.deps import get_db, get_current_user
from app.models import Learner, ProgressRecord, User

router = APIRouter()


# Pydantic Schemas
class ChildProgressSummary(BaseModel):
    """Child progress summary for dashboard."""
    id: str
    first_name: str
    last_name: str
    level: int
    streak: int
    progress: dict  # {reading: 65, math: 45, speech: 80}
    recent_activity: str
    last_active: str

    class Config:
        from_attributes = True


class DashboardStats(BaseModel):
    """Dashboard statistics."""
    total_learning_time_hours: float
    activities_completed: int
    streak_days: int
    skills_mastered: int


class UpcomingActivity(BaseModel):
    """Upcoming scheduled activity."""
    time: str
    activity: str
    child_name: str
    icon: str


class DashboardResponse(BaseModel):
    """Complete dashboard response."""
    parent_name: str
    stats: DashboardStats
    children: List[ChildProgressSummary]
    upcoming_activities: List[UpcomingActivity]


class SubjectProgress(BaseModel):
    """Subject progress details."""
    subject: str
    progress_percentage: int
    hours_spent: float
    activities_completed: int
    skills_mastered: int


class ChildDetailResponse(BaseModel):
    """Detailed child information."""
    id: str
    first_name: str
    last_name: str
    date_of_birth: str
    grade_level: int
    current_reading_level: Optional[str]
    current_math_level: Optional[str]
    has_iep: bool
    progress: List[SubjectProgress]


class ActivityDataPoint(BaseModel):
    """Activity chart data point."""
    day: str
    minutes: int


class Achievement(BaseModel):
    """Achievement earned."""
    title: str
    icon: str
    date: str


# Endpoints
@router.get("/dashboard", response_model=DashboardResponse)
async def get_parent_dashboard(
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    """
    Get parent dashboard overview.

    Returns:
    - Parent name
    - Overall stats (learning time, activities, streak, skills)
    - Children progress summaries
    - Upcoming activities
    """
    user_id = current_user.get("user_id")
    user = db.query(User).filter(User.id == user_id).first()
    
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # Get all children for this parent
    children = db.query(Learner).filter(Learner.user_id == user_id).all()

    if not children:
        # Return empty dashboard for parents with no children yet
        return DashboardResponse(
            parent_name=user.full_name,
            stats=DashboardStats(
                total_learning_time_hours=0.0,
                activities_completed=0,
                streak_days=0,
                skills_mastered=0,
            ),
            children=[],
            upcoming_activities=[],
        )

    # Calculate aggregate stats
    total_time = 0
    total_activities = 0
    total_skills = 0

    children_summaries = []
    
    for child in children:
        # Get child's progress records
        progress_records = db.query(ProgressRecord).filter(
            ProgressRecord.learner_id == child.id
        ).all()

        # Calculate time spent (convert seconds to hours)
        child_time = sum(
            pr.time_spent_seconds or 0 for pr in progress_records
        ) / 3600.0
        total_time += child_time

        # Count completed activities
        child_activities = sum(
            1 for pr in progress_records if pr.completed
        )
        total_activities += child_activities

        # Get subject progress (mock for now, would need more sophisticated calculation)
        subject_progress = {
            "reading": 65,
            "math": 45,
            "speech": 80,
        }

        # Get recent activity
        recent = db.query(ProgressRecord).filter(
            ProgressRecord.learner_id == child.id
        ).order_by(ProgressRecord.created_at.desc()).first()

        recent_activity = (
            recent.activity_name if recent else "No recent activity"
        )
        last_active = (
            recent.created_at.strftime("%H:%M") if recent 
            else "Never"
        )

        children_summaries.append(
            ChildProgressSummary(
                id=child.id,
                first_name=child.first_name,
                last_name=child.last_name,
                level=child.grade_level,
                streak=7,  # TODO: Calculate from activity history
                progress=subject_progress,
                recent_activity=recent_activity,
                last_active=last_active,
            )
        )

    # Mock upcoming activities (would come from scheduling system)
    upcoming = [
        UpcomingActivity(
            time="Today, 3:00 PM",
            activity="Speech Practice",
            child_name=children[0].first_name if children else "Child",
            icon="🗣️",
        ),
    ]

    return DashboardResponse(
        parent_name=user.full_name,
        stats=DashboardStats(
            total_learning_time_hours=round(total_time, 1),
            activities_completed=total_activities,
            streak_days=7,  # TODO: Calculate from activity history
            skills_mastered=total_skills,
        ),
        children=children_summaries,
        upcoming_activities=upcoming,
    )


@router.get("/children", response_model=List[ChildDetailResponse])
async def list_children(
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    """
    Get list of all children enrolled by this parent.
    """
    user_id = current_user.get("user_id")
    
    children = db.query(Learner).filter(Learner.user_id == user_id).all()

    result = []
    for child in children:
        # Get progress by subject
        progress_records = db.query(ProgressRecord).filter(
            ProgressRecord.learner_id == child.id
        ).all()

        # Group by subject
        subjects = {}
        for pr in progress_records:
            subject = pr.subject or "general"
            if subject not in subjects:
                subjects[subject] = {
                    "time": 0,
                    "activities": 0,
                    "completed": 0,
                }
            subjects[subject]["time"] += (pr.time_spent_seconds or 0) / 3600.0
            subjects[subject]["activities"] += 1
            if pr.completed:
                subjects[subject]["completed"] += 1

        # Build subject progress list
        subject_progress = []
        for subject, data in subjects.items():
            progress_pct = int(
                (data["completed"] / data["activities"] * 100)
                if data["activities"] > 0
                else 0
            )
            subject_progress.append(
                SubjectProgress(
                    subject=subject,
                    progress_percentage=progress_pct,
                    hours_spent=round(data["time"], 1),
                    activities_completed=data["completed"],
                    skills_mastered=0,  # TODO: Calculate from progress data
                )
            )

        result.append(
            ChildDetailResponse(
                id=child.id,
                first_name=child.first_name,
                last_name=child.last_name,
                date_of_birth=child.date_of_birth.isoformat(),
                grade_level=child.grade_level,
                current_reading_level=child.current_reading_level,
                current_math_level=child.current_math_level,
                has_iep=child.has_iep,
                progress=subject_progress,
            )
        )

    return result


@router.get("/children/{child_id}/progress")
async def get_child_progress(
    child_id: str,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    """
    Get detailed progress for a specific child.
    """
    user_id = current_user.get("user_id")
    
    # Verify child belongs to this parent
    child = db.query(Learner).filter(
        and_(Learner.id == child_id, Learner.user_id == user_id)
    ).first()
    
    if not child:
        raise HTTPException(
            status_code=404,
            detail="Child not found or not authorized"
        )

    # Get progress records
    progress_records = db.query(ProgressRecord).filter(
        ProgressRecord.learner_id == child_id
    ).order_by(ProgressRecord.created_at.desc()).all()

    # Group by subject
    subjects = {}
    for pr in progress_records:
        subject = pr.subject or "general"
        if subject not in subjects:
            subjects[subject] = {
                "records": [],
                "time": 0,
                "activities": 0,
                "completed": 0,
                "avg_score": 0,
            }
        subjects[subject]["records"].append(pr)
        subjects[subject]["time"] += (pr.time_spent_seconds or 0) / 3600.0
        subjects[subject]["activities"] += 1
        if pr.completed:
            subjects[subject]["completed"] += 1
        if pr.score is not None:
            subjects[subject]["avg_score"] += pr.score

    # Calculate averages
    for subject, data in subjects.items():
        if data["activities"] > 0:
            data["avg_score"] = round(
                data["avg_score"] / data["activities"], 1
            )

    return {
        "child_id": child_id,
        "first_name": child.first_name,
        "last_name": child.last_name,
        "subjects": subjects,
    }


@router.get("/children/{child_id}/activity-chart")
async def get_activity_chart(
    child_id: str,
    range: str = Query("week", regex="^(week|month|year)$"),
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    """
    Get activity chart data for a child.

    Query params:
    - range: week, month, or year
    """
    user_id = current_user.get("user_id")
    
    # Verify child belongs to this parent
    child = db.query(Learner).filter(
        and_(Learner.id == child_id, Learner.user_id == user_id)
    ).first()
    
    if not child:
        raise HTTPException(
            status_code=404,
            detail="Child not found or not authorized"
        )

    # Calculate date range
    now = datetime.utcnow()
    if range == "week":
        start_date = now - timedelta(days=7)
        days = 7
    elif range == "month":
        start_date = now - timedelta(days=30)
        days = 30
    else:  # year
        start_date = now - timedelta(days=365)
        days = 365

    # Get progress records in range
    progress_records = db.query(ProgressRecord).filter(
        and_(
            ProgressRecord.learner_id == child_id,
            ProgressRecord.created_at >= start_date,
        )
    ).all()

    # Group by day
    daily_minutes = {}
    for pr in progress_records:
        day_key = pr.created_at.strftime("%Y-%m-%d")
        minutes = (pr.time_spent_seconds or 0) / 60.0
        daily_minutes[day_key] = daily_minutes.get(day_key, 0) + minutes

    # Build chart data
    chart_data = []
    for i in range(days):
        date = start_date + timedelta(days=i)
        day_key = date.strftime("%Y-%m-%d")
        day_label = date.strftime("%a" if range == "week" else "%b %d")
        
        chart_data.append(
            ActivityDataPoint(
                day=day_label,
                minutes=int(daily_minutes.get(day_key, 0)),
            )
        )

    return chart_data


@router.get("/children/{child_id}/achievements")
async def get_achievements(
    child_id: str,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    """
    Get achievements earned by a child.
    """
    user_id = current_user.get("user_id")
    
    # Verify child belongs to this parent
    child = db.query(Learner).filter(
        and_(Learner.id == child_id, Learner.user_id == user_id)
    ).first()
    
    if not child:
        raise HTTPException(
            status_code=404,
            detail="Child not found or not authorized"
        )

    # TODO: Implement real achievement system
    # For now, return mock achievements
    achievements = [
        Achievement(
            title="First Week Complete",
            icon="🎉",
            date="Jan 15, 2025",
        ),
        Achievement(
            title="7-Day Streak",
            icon="🔥",
            date="Jan 20, 2025",
        ),
    ]

    return achievements


@router.get("/activities/upcoming")
async def get_upcoming_activities(
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    """
    Get upcoming scheduled activities for all children.
    """
    # TODO: Implement scheduling system
    # For now, return mock data
    return [
        {
            "time": "Today, 3:00 PM",
            "activity": "Speech Practice",
            "child": "Alex",
            "icon": "🗣️",
        },
    ]


@router.post("/reminders")
async def create_reminder(
    activity_time: str,
    activity_name: str,
    child_id: str,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    """
    Create a reminder for an activity.
    """
    # TODO: Implement reminder/notification system
    return {
        "message": "Reminder created successfully",
        "activity_name": activity_name,
        "activity_time": activity_time,
    }
