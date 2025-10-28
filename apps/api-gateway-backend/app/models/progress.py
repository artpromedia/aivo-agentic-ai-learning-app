"""Progress tracking model."""
from sqlalchemy import Column, String, Integer, ForeignKey, JSON, Float, Boolean
from sqlalchemy.orm import relationship

from app.models.base import BaseModel


class ProgressRecord(BaseModel):
    """Progress tracking record for activities/assessments."""
    __tablename__ = "progress_records"

    # Foreign Keys
    learner_id = Column(String(36), ForeignKey("learners.id"), nullable=False, index=True)
    
    # Activity Info
    activity_type = Column(String(100), nullable=False)  # homework | assessment | activity | game
    activity_id = Column(String(255), nullable=False)
    activity_name = Column(String(500), nullable=False)
    
    # Subject & Level
    subject = Column(String(100), nullable=True)
    grade_level = Column(String(50), nullable=True)
    
    # Performance
    score = Column(Float, nullable=True)  # 0-100
    time_spent_seconds = Column(Integer, nullable=True)
    completed = Column(Boolean, default=False, nullable=False)
    
    # Details
    details = Column(JSON, nullable=True)
    # Example: {
    #   "questions_attempted": 10,
    #   "questions_correct": 8,
    #   "hints_used": 2,
    #   "strategies_used": ["visual_timer", "break_taken"]
    # }
    
    # Accommodations Used
    accommodations_used = Column(JSON, nullable=True)
    # Example: ["extended_time", "read_aloud", "calculator"]
    
    # Relationships
    learner = relationship("Learner", back_populates="progress_records")
    
    def __repr__(self):
        return f"<ProgressRecord {self.activity_name} - Score: {self.score}>"
