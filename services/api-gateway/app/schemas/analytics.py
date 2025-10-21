"""Analytics schemas for aggregated metrics."""
from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import date, datetime


class DailyMetricsResponse(BaseModel):
    """Schema for daily metrics response."""
    id: str
    learner_id: str
    date: date
    total_sessions: int
    total_minutes: int
    activities_completed: int
    average_score: Optional[float] = None
    distraction_events: int
    game_breaks_used: int
    emotion_check_ins: int
    average_emotion_level: Optional[float] = None
    accommodations_used: Optional[Dict[str, Any]] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        orm_mode = True


class SubjectMetricsResponse(BaseModel):
    """Schema for subject metrics response."""
    id: str
    learner_id: str
    subject: str
    period_start: date
    period_end: date
    activities_completed: int
    average_score: Optional[float] = None
    time_spent_minutes: int
    strengths: Optional[List[str]] = None
    areas_for_growth: Optional[List[str]] = None
    recent_activities: Optional[Dict[str, Any]] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        orm_mode = True


class AnalyticsSummary(BaseModel):
    """Summary analytics for a learner."""
    total_activities: int
    total_time_minutes: int
    average_score: Optional[float] = None
    completion_rate: float
    most_active_subject: Optional[str] = None
    improvement_trend: str  # improving | stable | declining
    strengths: List[str]
    areas_for_growth: List[str]
