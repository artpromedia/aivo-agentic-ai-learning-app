"""
Report models for district-level reporting functionality.
Supports report generation, scheduling, and template management.
"""
from datetime import datetime
from enum import Enum
from sqlalchemy import Column, Integer, String, DateTime, Text, Boolean, JSON, ForeignKey
from sqlalchemy.orm import relationship
from app.models.base import Base


class ReportType(str, Enum):
    """Types of district reports available."""
    DISTRICT_PERFORMANCE = "district-performance"
    SCHOOL_COMPARISON = "school-comparison"
    IEP_COMPLIANCE = "iep-compliance"
    STUDENT_PROGRESS = "student-progress"
    TEACHER_EFFECTIVENESS = "teacher-effectiveness"
    RESOURCE_UTILIZATION = "resource-utilization"
    PARENT_ENGAGEMENT = "parent-engagement"
    SPECIAL_EDUCATION = "special-education"


class ReportFormat(str, Enum):
    """Export formats for reports."""
    PDF = "pdf"
    EXCEL = "excel"
    CSV = "csv"


class ReportStatus(str, Enum):
    """Processing status of report generation."""
    PENDING = "pending"
    PROCESSING = "processing"
    COMPLETED = "completed"
    FAILED = "failed"


class ScheduleFrequency(str, Enum):
    """Scheduling frequency options."""
    DAILY = "daily"
    WEEKLY = "weekly"
    MONTHLY = "monthly"
    QUARTERLY = "quarterly"
    ANNUALLY = "annually"


class Report(Base):
    """
    Generated district reports with file storage and metadata.
    Tracks all report generation requests and their results.
    """
    __tablename__ = "reports"

    id = Column(Integer, primary_key=True, index=True)
    
    # Report identification
    report_type = Column(String(50), nullable=False, index=True)
    report_name = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    
    # Generation details
    format = Column(String(20), nullable=False)  # pdf, excel, csv
    status = Column(String(20), default=ReportStatus.PENDING, nullable=False, index=True)
    
    # File information
    file_path = Column(String(500), nullable=True)  # Server-side file path
    file_name = Column(String(255), nullable=True)
    file_size = Column(Integer, nullable=True)  # Size in bytes
    
    # Parameters used for generation
    date_range_start = Column(DateTime, nullable=True)
    date_range_end = Column(DateTime, nullable=True)
    filters = Column(JSON, nullable=True)  # Additional filters/parameters
    
    # Generation metadata
    generated_by = Column(Integer, ForeignKey("users.id"), nullable=False)
    generated_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    completed_at = Column(DateTime, nullable=True)
    
    # Error tracking
    error_message = Column(Text, nullable=True)
    
    # Relationships
    generator = relationship("User", foreign_keys=[generated_by])
    
    def __repr__(self):
        return f"<Report {self.id}: {self.report_name} ({self.status})>"


class ScheduledReport(Base):
    """
    Scheduled automated report generation.
    Supports recurring reports with cron-like scheduling.
    """
    __tablename__ = "scheduled_reports"

    id = Column(Integer, primary_key=True, index=True)
    
    # Schedule identification
    name = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    
    # Report configuration
    report_type = Column(String(50), nullable=False, index=True)
    format = Column(String(20), nullable=False)  # pdf, excel, csv
    
    # Scheduling details
    frequency = Column(String(20), nullable=False)  # daily, weekly, monthly, quarterly, annually
    schedule_config = Column(JSON, nullable=True)  # Day of week, day of month, time, etc.
    
    # Report parameters
    date_range_type = Column(String(50), nullable=True)  # last_week, last_month, last_quarter, custom
    filters = Column(JSON, nullable=True)
    
    # Delivery options
    email_recipients = Column(JSON, nullable=True)  # List of email addresses
    save_to_dashboard = Column(Boolean, default=True)
    
    # Status
    is_active = Column(Boolean, default=True, nullable=False, index=True)
    
    # Audit fields
    created_by = Column(Integer, ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Last execution tracking
    last_run_at = Column(DateTime, nullable=True)
    next_run_at = Column(DateTime, nullable=True)
    last_run_status = Column(String(20), nullable=True)
    
    # Relationships
    creator = relationship("User", foreign_keys=[created_by])
    
    def __repr__(self):
        return f"<ScheduledReport {self.id}: {self.name} ({self.frequency})>"


class ReportTemplate(Base):
    """
    Report templates with predefined configurations.
    Allows for customizable report formats and layouts.
    """
    __tablename__ = "report_templates"

    id = Column(Integer, primary_key=True, index=True)
    
    # Template identification
    name = Column(String(255), nullable=False, unique=True, index=True)
    report_type = Column(String(50), nullable=False, index=True)
    description = Column(Text, nullable=True)
    
    # Template configuration
    layout_config = Column(JSON, nullable=True)  # Sections, charts, tables to include
    style_config = Column(JSON, nullable=True)   # Colors, fonts, branding
    
    # Default parameters
    default_filters = Column(JSON, nullable=True)
    default_format = Column(String(20), default=ReportFormat.PDF)
    
    # Metadata
    is_system_template = Column(Boolean, default=False)  # System vs custom templates
    is_active = Column(Boolean, default=True, nullable=False)
    
    # Audit fields
    created_by = Column(Integer, ForeignKey("users.id"), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    creator = relationship("User", foreign_keys=[created_by])
    
    def __repr__(self):
        return f"<ReportTemplate {self.id}: {self.name}>"
