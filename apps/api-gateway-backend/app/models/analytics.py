"""Analytics models for aggregated metrics."""
from sqlalchemy import Column, String, Integer, Date, ForeignKey, JSON, Float
from sqlalchemy.orm import relationship

from app.models.base import BaseModel


class DailyMetrics(BaseModel):
    """Daily aggregated metrics for learners."""
    __tablename__ = "daily_metrics"

    # Foreign Keys
    learner_id = Column(String(36), ForeignKey("learners.id"), nullable=False, index=True)
    
    # Date
    date = Column(Date, nullable=False, index=True)
    
    # Engagement
    total_sessions = Column(Integer, default=0, nullable=False)
    total_minutes = Column(Integer, default=0, nullable=False)
    activities_completed = Column(Integer, default=0, nullable=False)
    
    # Performance
    average_score = Column(Float, nullable=True)
    
    # Focus & Regulation
    distraction_events = Column(Integer, default=0, nullable=False)
    game_breaks_used = Column(Integer, default=0, nullable=False)
    emotion_check_ins = Column(Integer, default=0, nullable=False)
    average_emotion_level = Column(Float, nullable=True)  # 1-5
    
    # Accommodations
    accommodations_used = Column(JSON, nullable=True)
    
    # Relationships
    learner = relationship("Learner")
    
    def __repr__(self):
        return f"<DailyMetrics {self.learner_id} - {self.date}>"


class SubjectMetrics(BaseModel):
    """Subject-specific metrics for learners."""
    __tablename__ = "subject_metrics"

    # Foreign Keys
    learner_id = Column(String(36), ForeignKey("learners.id"), nullable=False, index=True)
    
    # Subject
    subject = Column(String(100), nullable=False)
    
    # Time Period
    period_start = Column(Date, nullable=False)
    period_end = Column(Date, nullable=False)
    
    # Performance
    activities_completed = Column(Integer, default=0, nullable=False)
    average_score = Column(Float, nullable=True)
    time_spent_minutes = Column(Integer, default=0, nullable=False)
    
    # Strengths & Growth Areas
    strengths = Column(JSON, nullable=True)  # Array of strings
    areas_for_growth = Column(JSON, nullable=True)  # Array of strings
    
    # Recent Activities
    recent_activities = Column(JSON, nullable=True)
    
    # Relationships
    learner = relationship("Learner")
    
    def __repr__(self):
        return f"<SubjectMetrics {self.subject} - Avg Score: {self.average_score}>"
