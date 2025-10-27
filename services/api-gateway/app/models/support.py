"""
Support ticket models for help desk functionality.
Tracks support tickets, replies, and knowledge base articles.
"""
from datetime import datetime
from enum import Enum

from sqlalchemy import Column, DateTime, ForeignKey, Integer, String, Text
from sqlalchemy.orm import relationship

from app.models.base import Base


class TicketCategory(str, Enum):
    """Support ticket categories."""
    TECHNICAL = "technical"
    TRAINING = "training"
    BILLING = "billing"
    FEATURE_REQUEST = "feature-request"
    BUG_REPORT = "bug-report"


class TicketPriority(str, Enum):
    """Support ticket priority levels."""
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    URGENT = "urgent"


class TicketStatus(str, Enum):
    """Support ticket statuses."""
    OPEN = "open"
    IN_PROGRESS = "in-progress"
    RESOLVED = "resolved"
    CLOSED = "closed"


class SupportTicket(Base):
    """
    Support tickets submitted by users.
    Tracks help requests, bug reports, and feature requests.
    """
    __tablename__ = "support_tickets"

    id = Column(Integer, primary_key=True, index=True)
    
    # Ticket identification
    ticket_number = Column(String(50), unique=True, nullable=False, index=True)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=False)
    
    # Classification
    category = Column(String(50), nullable=False, index=True)
    priority = Column(String(20), nullable=False, index=True)
    status = Column(String(20), default=TicketStatus.OPEN, nullable=False, index=True)
    
    # User information
    submitted_by = Column(Integer, ForeignKey("users.id"), nullable=False)
    submitted_by_name = Column(String(255), nullable=True)  # Cached for display
    submitted_by_role = Column(String(50), nullable=True)
    school_name = Column(String(255), nullable=True)
    
    # Assignment
    assigned_to = Column(Integer, ForeignKey("users.id"), nullable=True)
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
    resolved_at = Column(DateTime, nullable=True)
    closed_at = Column(DateTime, nullable=True)
    
    # Relationships
    submitter = relationship("User", foreign_keys=[submitted_by])
    assignee = relationship("User", foreign_keys=[assigned_to])
    replies = relationship("TicketReply", back_populates="ticket", cascade="all, delete-orphan")
    
    def __repr__(self):
        return f"<SupportTicket {self.ticket_number}: {self.title}>"


class TicketReply(Base):
    """
    Replies to support tickets.
    Allows conversation between users and support staff.
    """
    __tablename__ = "ticket_replies"

    id = Column(Integer, primary_key=True, index=True)
    
    # Reply content
    ticket_id = Column(Integer, ForeignKey("support_tickets.id"), nullable=False)
    message = Column(Text, nullable=False)
    
    # Author information
    author_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    author_name = Column(String(255), nullable=True)  # Cached for display
    is_staff_reply = Column(String(10), default="false", nullable=False)  # SQLite-friendly boolean
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    
    # Relationships
    ticket = relationship("SupportTicket", back_populates="replies")
    author = relationship("User", foreign_keys=[author_id])
    
    def __repr__(self):
        return f"<TicketReply {self.id} for Ticket {self.ticket_id}>"


class KnowledgeBaseArticle(Base):
    """
    Knowledge base articles for self-service support.
    Contains guides, FAQs, and troubleshooting documentation.
    """
    __tablename__ = "kb_articles"

    id = Column(Integer, primary_key=True, index=True)
    
    # Article content
    title = Column(String(255), nullable=False)
    content = Column(Text, nullable=False)
    summary = Column(Text, nullable=True)
    
    # Classification
    category = Column(String(50), nullable=False, index=True)
    tags = Column(Text, nullable=True)  # Comma-separated tags
    
    # Visibility and metrics
    is_published = Column(String(10), default="true", nullable=False)  # SQLite-friendly boolean
    view_count = Column(Integer, default=0, nullable=False)
    helpful_count = Column(Integer, default=0, nullable=False)
    not_helpful_count = Column(Integer, default=0, nullable=False)
    
    # Author
    author_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
    
    # Relationships
    author = relationship("User", foreign_keys=[author_id])
    
    def __repr__(self):
        return f"<KBArticle {self.id}: {self.title}>"
