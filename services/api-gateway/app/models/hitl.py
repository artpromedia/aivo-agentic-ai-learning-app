"""
HITL (Human-in-the-Loop) Operations Models
For content moderation, AI output review, and quality assurance
"""
from enum import Enum

from sqlalchemy import (
    Column,
    DateTime,
    Enum as SQLEnum,
    Integer,
    JSON,
    String,
    Text,
)
from sqlalchemy.sql import func

from app.core.database import Base


class HITLQueueStatus(str, Enum):
    """Status of HITL queue item"""
    PENDING = "pending"
    IN_REVIEW = "in_review"
    APPROVED = "approved"
    REJECTED = "rejected"
    ESCALATED = "escalated"


class HITLQueuePriority(str, Enum):
    """Priority level of HITL queue item"""
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    URGENT = "urgent"


class HITLQueueType(str, Enum):
    """Type of content requiring human review"""
    AI_RESPONSE = "ai_response"
    USER_CONTENT = "user_content"
    CURRICULUM = "curriculum"
    ASSESSMENT = "assessment"
    IEP_RECOMMENDATION = "iep_recommendation"
    CONTENT_FLAG = "content_flag"


class HITLQueue(Base):
    """Queue for human-in-the-loop review and moderation"""
    __tablename__ = "hitl_queue"

    id = Column(Integer, primary_key=True, index=True)
    
    # Item identification
    type = Column(SQLEnum(HITLQueueType), nullable=False, index=True)
    # ID of the content being reviewed
    source_id = Column(String(200), nullable=True)
    # learner, parent, teacher, etc.
    source_type = Column(String(100), nullable=True)
    
    # Content
    content = Column(Text, nullable=False)
    # Additional context about the content
    context = Column(JSON, nullable=True)
    # AI confidence scores, model used, etc.
    ai_metadata = Column(JSON, nullable=True)
    
    # Review status
    status = Column(
        SQLEnum(HITLQueueStatus),
        default=HITLQueueStatus.PENDING,
        nullable=False,
        index=True
    )
    priority = Column(
        SQLEnum(HITLQueuePriority),
        default=HITLQueuePriority.MEDIUM,
        nullable=False,
        index=True
    )
    
    # Review details
    reviewed_by = Column(String(200), nullable=True)
    reviewed_at = Column(DateTime, nullable=True)
    review_notes = Column(Text, nullable=True)
    review_decision = Column(JSON, nullable=True)  # Structured decision data
    
    # Assignment
    assigned_to = Column(String(200), nullable=True, index=True)
    assigned_at = Column(DateTime, nullable=True)
    
    # Flagging
    flagged_reason = Column(Text, nullable=True)
    flagged_by = Column(String(200), nullable=True)
    
    # Timestamps
    created_at = Column(
        DateTime, server_default=func.now(), nullable=False, index=True
    )
    updated_at = Column(
        DateTime,
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False
    )
    
    def __repr__(self):
        return (
            f"<HITLQueue(id={self.id}, type={self.type}, "
            f"status={self.status}, priority={self.priority})>"
        )
