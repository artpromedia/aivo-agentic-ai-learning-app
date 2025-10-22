"""Analytics endpoints for learner progress and engagement tracking."""
# type: ignore[import-not-found]
from fastapi import APIRouter, Depends, HTTPException, status  # type: ignore[import-not-found]  # noqa: E501
from sqlalchemy.orm import Session  # type: ignore[import-not-found]
from typing import Optional
from datetime import datetime, date, timedelta

from app.core.database import get_db  # type: ignore[import-not-found]
from app.models.user import User  # type: ignore[import-not-found]
from app.models.learner import Learner  # type: ignore[import-not-found]
from app.models.analytics import DailyMetrics  # type: ignore[import-not-found]
from app.models.iep import IEPGoal  # type: ignore[import-not-found]
from app.schemas.analytics import (  # type: ignore[import-not-found]
    AnalyticsExportRequest
)
from app.schemas.response import (  # type: ignore[import-not-found]
    success_response
)
from app.api.deps import (  # type: ignore[import-not-found]
    get_current_user
)
from app.services.analytics_service import (  # type: ignore[import-not-found]  # noqa: E501
    AnalyticsService
)

router = APIRouter()


@router.get("/learners/{learner_id}", response_model=dict)
async def get_learner_analytics(
    learner_id: str,
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get comprehensive analytics for a learner.
    
    **Includes:**
    - Engagement metrics (sessions, time, streaks)
    - Progress metrics (activities, scores, trends)
    - IEP goal progress
    - Subject-specific performance
    - Focus & attention metrics
    - Homework helper usage
    - Accommodation usage
    
    **Default Period:** Last 30 days
    
    **Use Cases:**
    - Parent progress reports
    - IEP meetings
    - Teacher conferences
    - Data-driven instruction
    """
    # Verify access
    learner = db.query(Learner).filter(Learner.id == learner_id).first()
    
    if not learner:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Learner not found"
        )
    
    if learner.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied"
        )
    
    # Set default date range (last 30 days)
    if not end_date:
        end_date = date.today()
    
    if not start_date:
        start_date = end_date - timedelta(days=30)
    
    # Get analytics
    analytics_service = AnalyticsService(db)
    analytics = await analytics_service.get_learner_analytics(
        learner_id=learner_id,
        start_date=start_date,
        end_date=end_date
    )
    
    return success_response(data=analytics)


@router.get("/learners/{learner_id}/engagement", response_model=dict)
async def get_engagement_metrics(
    learner_id: str,
    days: int = 30,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get detailed engagement metrics.
    
    **Metrics:**
    - Total sessions
    - Total time spent
    - Average session length
    - Active days
    - Current streak
    - Last active date
    - Session frequency
    - Time of day patterns
    """
    # Verify access
    learner = db.query(Learner).filter(Learner.id == learner_id).first()
    
    if not learner:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Learner not found"
        )
    
    if learner.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied"
        )
    
    # Calculate engagement metrics
    since_date = date.today() - timedelta(days=days)
    
    # Get daily metrics
    daily_metrics = db.query(DailyMetrics).filter(
        DailyMetrics.learner_id == learner_id,
        DailyMetrics.date >= since_date
    ).all()
    
    total_sessions = sum(dm.total_sessions for dm in daily_metrics)
    total_minutes = sum(dm.total_minutes for dm in daily_metrics)
    active_days = len([dm for dm in daily_metrics if dm.total_sessions > 0])
    
    # Calculate streak
    streak = 0
    current_date = date.today()
    
    while True:
        day_metric = next(
            (dm for dm in daily_metrics if dm.date == current_date),
            None
        )
        
        if day_metric and day_metric.total_sessions > 0:
            streak += 1
            current_date -= timedelta(days=1)
        else:
            break
    
    # Last active
    last_active = max(
        [dm.date for dm in daily_metrics if dm.total_sessions > 0],
        default=None
    )
    
    avg_session = (
        total_minutes / total_sessions if total_sessions > 0 else 0
    )
    
    engagement = {
        "total_sessions": total_sessions,
        "total_minutes": total_minutes,
        "average_session_length": avg_session,
        "active_days": active_days,
        "streak_days": streak,
        "last_active": last_active.isoformat() if last_active else None,
        "period_days": days,
        "activity_rate": (active_days / days) * 100 if days > 0 else 0
    }
    
    return success_response(data=engagement)


@router.get("/learners/{learner_id}/iep-progress", response_model=dict)
async def get_iep_progress(
    learner_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get IEP goal progress summary.
    
    **Returns:**
    - All active goals
    - Progress percentage
    - Trend (on-track, needs-attention, exceeding)
    - Days until target
    - Recent data points
    
    **Sorted by:** Priority (needs-attention first)
    """
    # Verify access
    learner = db.query(Learner).filter(Learner.id == learner_id).first()
    
    if not learner:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Learner not found"
        )
    
    if learner.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied"
        )
    
    # Get all active IEP goals
    goals = db.query(IEPGoal).filter(
        IEPGoal.learner_id == learner_id,
        IEPGoal.target_date >= date.today()
    ).all()
    
    goal_progress = []
    
    for goal in goals:
        days_remaining = (goal.target_date - date.today()).days
        
        goal_progress.append({
            "goal_id": goal.id,
            "goal_name": goal.goal_name,
            "category": goal.category,
            "progress": goal.progress_percentage,
            "status": goal.status,
            "current_level": goal.current_level,
            "target_level": goal.target_level,
            "target_date": goal.target_date.isoformat(),
            "days_remaining": days_remaining,
            "data_points_count": len(goal.data_points)
        })
    
    # Sort by priority (needs-attention first)
    priority_order = {
        "needs-attention": 0,
        "on-track": 1,
        "exceeding": 2,
        "not-started": 3
    }
    
    goal_progress.sort(key=lambda x: priority_order.get(x["status"], 99))
    
    on_track = [g for g in goal_progress if g["status"] == "on-track"]
    needs_att = [g for g in goal_progress if g["status"] == "needs-attention"]
    exceeding = [g for g in goal_progress if g["status"] == "exceeding"]
    not_started = [g for g in goal_progress if g["status"] == "not-started"]
    
    return success_response(
        data={
            "learner_id": learner_id,
            "total_goals": len(goals),
            "goals": goal_progress,
            "summary": {
                "on_track": len(on_track),
                "needs_attention": len(needs_att),
                "exceeding": len(exceeding),
                "not_started": len(not_started)
            }
        }
    )


@router.get("/learners/{learner_id}/subjects", response_model=dict)
async def get_subject_performance(
    learner_id: str,
    days: int = 30,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get subject-specific performance metrics.
    
    **For Each Subject:**
    - Activities completed
    - Average score
    - Time spent
    - Strengths
    - Areas for growth
    - Recent activities
    """
    from app.models.progress import ProgressRecord
    
    # Verify access
    learner = db.query(Learner).filter(Learner.id == learner_id).first()
    
    if not learner:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Learner not found"
        )
    
    if learner.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied"
        )
    
    # Get progress records
    since_date = date.today() - timedelta(days=days)
    
    progress_records = db.query(ProgressRecord).filter(
        ProgressRecord.learner_id == learner_id,
        ProgressRecord.created_at >= datetime.combine(
            since_date,
            datetime.min.time()
        )
    ).all()
    
    # Group by subject
    subjects = {}
    
    for record in progress_records:
        subject = record.subject or "Other"
        
        if subject not in subjects:
            subjects[subject] = {
                "subject": subject,
                "activities_completed": 0,
                "total_score": 0,
                "scored_activities": 0,
                "time_spent": 0,
                "recent_activities": []
            }
        
        subjects[subject]["activities_completed"] += 1
        
        if record.score is not None:
            subjects[subject]["total_score"] += record.score
            subjects[subject]["scored_activities"] += 1
        
        if record.time_spent_seconds:
            time_spent = record.time_spent_seconds // 60
            subjects[subject]["time_spent"] += time_spent
        
        subjects[subject]["recent_activities"].append({
            "name": record.activity_name,
            "score": record.score,
            "completed_at": record.created_at.isoformat()
        })
    
    # Calculate averages and format
    subject_metrics = []
    
    for subject_data in subjects.values():
        scored = subject_data["scored_activities"]
        avg_score = (
            subject_data["total_score"] / scored
            if scored > 0
            else None
        )
        
        # Sort recent activities and take top 5
        recent = sorted(
            subject_data["recent_activities"],
            key=lambda x: x["completed_at"],
            reverse=True
        )[:5]
        
        subject_metrics.append({
            "subject": subject_data["subject"],
            "activities_completed": subject_data["activities_completed"],
            "average_score": round(avg_score, 1) if avg_score else None,
            "time_spent_minutes": subject_data["time_spent"],
            "recent_activities": recent
        })
    
    # Sort by activities completed
    subject_metrics.sort(
        key=lambda x: x["activities_completed"],
        reverse=True
    )
    
    return success_response(
        data={
            "learner_id": learner_id,
            "period_days": days,
            "subjects": subject_metrics
        }
    )


@router.post("/learners/{learner_id}/export", response_model=dict)
async def export_analytics(
    learner_id: str,
    export_request: AnalyticsExportRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Export analytics report.
    
    **Formats:**
    - PDF: Formatted report for printing/sharing
    - CSV: Raw data for analysis
    - JSON: Complete data export
    
    **Sections:**
    - Engagement
    - Progress
    - IEP goals
    - Subject performance
    - Accommodations
    
    **Returns:** Download URL (expires in 1 hour)
    """
    # Verify access
    learner = db.query(Learner).filter(Learner.id == learner_id).first()
    
    if not learner:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Learner not found"
        )
    
    if learner.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied"
        )
    
    # Generate export
    analytics_service = AnalyticsService(db)
    
    sections = export_request.include_sections or []
    
    export_url = await analytics_service.generate_export(
        learner_id=learner_id,
        start_date=export_request.date_range.start_date,
        end_date=export_request.date_range.end_date,
        export_format=export_request.format.value,
        sections=sections
    )
    
    return success_response(
        data={
            "export_url": export_url,
            "format": export_request.format.value,
            "expires_at": (
                datetime.utcnow() + timedelta(hours=1)
            ).isoformat(),
            "learner_id": learner_id
        }
    )


@router.get("/learners/{learner_id}/daily-summary", response_model=dict)
async def get_daily_summary(
    learner_id: str,
    summary_date: date,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get summary for a specific day.
    
    **Useful for:**
    - Daily reports to parents
    - Tracking day-to-day patterns
    - Identifying what works
    """
    # Verify access
    learner = db.query(Learner).filter(Learner.id == learner_id).first()
    
    if not learner:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Learner not found"
        )
    
    if learner.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied"
        )
    
    # Get or create daily metrics
    daily_metric = db.query(DailyMetrics).filter(
        DailyMetrics.learner_id == learner_id,
        DailyMetrics.date == summary_date
    ).first()
    
    if not daily_metric:
        # No activity on this day
        return success_response(
            data={
                "date": summary_date.isoformat(),
                "active": False,
                "total_sessions": 0,
                "total_minutes": 0,
                "activities_completed": 0
            }
        )
    
    return success_response(
        data={
            "date": summary_date.isoformat(),
            "active": True,
            "total_sessions": daily_metric.total_sessions,
            "total_minutes": daily_metric.total_minutes,
            "activities_completed": daily_metric.activities_completed,
            "average_score": daily_metric.average_score,
            "distraction_events": daily_metric.distraction_events,
            "game_breaks_used": daily_metric.game_breaks_used,
            "emotion_check_ins": daily_metric.emotion_check_ins,
            "average_emotion_level": daily_metric.average_emotion_level
        }
    )
