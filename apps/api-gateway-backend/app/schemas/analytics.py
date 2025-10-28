"""Analytics schemas for request/response validation."""
from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import date, datetime
from enum import Enum


class DateRangeFilter(BaseModel):
    """Schema for date range filtering."""
    start_date: date
    end_date: date
    learner_id: str = Field(..., min_length=36, max_length=36)


class EngagementMetrics(BaseModel):
    """Engagement metrics schema."""
    total_sessions: int = Field(ge=0)
    total_minutes: int = Field(ge=0)
    average_session_duration: float = Field(ge=0.0)
    activities_completed: int = Field(ge=0)
    activities_started: int = Field(ge=0)
    completion_rate: float = Field(ge=0.0, le=100.0)
    consecutive_days: int = Field(ge=0)
    last_activity_date: Optional[datetime] = None


class ProgressMetrics(BaseModel):
    """Progress tracking metrics schema."""
    average_score: float = Field(ge=0.0, le=100.0)
    score_trend: str = Field(..., pattern=r'^(improving|stable|declining)$')
    mastery_level: str = Field(
        ...,
        pattern=r'^(beginner|developing|proficient|advanced)$'
    )
    skills_mastered: int = Field(ge=0)
    skills_in_progress: int = Field(ge=0)
    recent_achievements: List[str] = []


class IEPGoalProgress(BaseModel):
    """IEP goal progress metrics schema."""
    goal_id: str
    goal_name: str
    category: str
    current_progress: int = Field(ge=0, le=100)
    target_progress: int = Field(ge=0, le=100)
    on_track: bool
    data_points_count: int = Field(ge=0)
    last_update: Optional[datetime] = None


class SubjectMetrics(BaseModel):
    """Subject-specific metrics schema."""
    subject: str
    activities_completed: int = Field(ge=0)
    average_score: float = Field(ge=0.0, le=100.0)
    time_spent_minutes: int = Field(ge=0)
    mastery_level: str = Field(
        ...,
        pattern=r'^(beginner|developing|proficient|advanced)$'
    )
    strengths: List[str] = []
    areas_for_growth: List[str] = []
    recent_topics: List[str] = []


class FocusMetrics(BaseModel):
    """Focus and attention metrics schema."""
    distraction_events: int = Field(ge=0)
    average_focus_score: float = Field(ge=0.0, le=10.0)
    game_breaks_used: int = Field(ge=0)
    focus_time_minutes: int = Field(ge=0)
    break_time_minutes: int = Field(ge=0)
    optimal_session_length: int = Field(ge=5, le=120)  # minutes


class HomeworkMetrics(BaseModel):
    """Homework helper metrics schema."""
    total_sessions: int = Field(ge=0)
    completed_sessions: int = Field(ge=0)
    completion_rate: float = Field(ge=0.0, le=100.0)
    average_session_duration: int = Field(ge=0)  # minutes
    hints_requested: int = Field(ge=0)
    explanations_requested: int = Field(ge=0)
    photos_uploaded: int = Field(ge=0)
    handwriting_submissions: int = Field(ge=0)
    most_common_subjects: List[str] = []


class AccommodationMetrics(BaseModel):
    """Accommodation usage metrics schema."""
    total_accommodations_active: int = Field(ge=0)
    most_used_accommodations: List[Dict[str, Any]] = []
    sensory_profile_changes: int = Field(ge=0)
    regulation_activities_completed: int = Field(ge=0)
    emotion_check_ins: int = Field(ge=0)
    average_emotion_level: float = Field(ge=1.0, le=5.0)
    accommodation_effectiveness: Optional[float] = Field(
        None, ge=0.0, le=100.0
    )


class LearnerAnalytics(BaseModel):
    """Comprehensive learner analytics schema."""
    learner_id: str
    date_range: DateRangeFilter
    engagement: EngagementMetrics
    progress: ProgressMetrics
    iep_goals: List[IEPGoalProgress] = []
    subjects: List[SubjectMetrics] = []
    focus: FocusMetrics
    homework: Optional[HomeworkMetrics] = None
    accommodations: AccommodationMetrics
    recommendations: List[str] = []
    generated_at: datetime


class ExportFormat(str, Enum):
    """Export format options."""
    PDF = "pdf"
    CSV = "csv"
    JSON = "json"


class AnalyticsExportRequest(BaseModel):
    """Schema for analytics export request."""
    date_range: DateRangeFilter
    format: ExportFormat
    include_charts: bool = False
    include_recommendations: bool = True
    include_sections: Optional[List[str]] = Field(
        None,
        description=(
            "Specific sections to include: engagement, progress, "
            "iep_goals, subjects, focus, homework, accommodations"
        )
    )


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
        from_attributes = True


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
        from_attributes = True
