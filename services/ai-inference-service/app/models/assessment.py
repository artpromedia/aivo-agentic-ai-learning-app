"""
Assessment Models - Complete System.

Includes both Quick Assessment (preferences) and Comprehensive Assessment (knowledge).
"""

import enum
import uuid
from datetime import datetime

from sqlalchemy import (
    ARRAY,
    Boolean,
    CheckConstraint,
    Column,
    DateTime,
    ForeignKey,
    Integer,
    Numeric,
    String,
    Text,
    UniqueConstraint,
)
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import relationship

from app.db.base_class import Base


class AssessmentType(str, enum.Enum):
    """Assessment type enumeration."""
    BASELINE = "baseline"  # Initial assessment
    QUARTERLY = "quarterly"  # Every 90 days
    PROGRESS_CHECK = "progress_check"  # On-demand
    IEP_ALIGNMENT = "iep_alignment"  # Aligned to IEP goals


class AssessmentLevel(str, enum.Enum):
    """Assessment level - quick or comprehensive."""
    QUICK = "quick"  # 5 questions - preferences/confidence
    COMPREHENSIVE = "comprehensive"  # 30+ questions - knowledge testing


class AssessmentStatus(str, enum.Enum):
    """Assessment status."""
    PENDING = "pending"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    SKIPPED = "skipped"
    OVERDUE = "overdue"
    ABANDONED = "abandoned"


class AssessmentSchedule(Base):
    """
    Assessment schedule - tracks when assessments are due.
    
    Handles both quick (5Q) and comprehensive (30Q) assessments.
    """
    __tablename__ = "assessment_schedules"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    learner_id = Column(UUID(as_uuid=True), ForeignKey("learners.id", ondelete="CASCADE"), nullable=False, index=True)
    district_id = Column(UUID(as_uuid=True), ForeignKey("districts.id", ondelete="CASCADE"), nullable=False)
    
    # Assessment Type
    assessment_type = Column(String(50), nullable=False, default="baseline")
    assessment_level = Column(String(20), nullable=False, default="quick")
    
    # Scheduling
    scheduled_date = Column(DateTime, nullable=False)
    completed_date = Column(DateTime)
    status = Column(String(20), nullable=False, default="pending")
    is_first_assessment = Column(Boolean, default=False)
    days_since_last = Column(Integer, default=0)
    
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    responses = relationship("AssessmentResponse", back_populates="schedule", cascade="all, delete-orphan")
    results = relationship("AssessmentResult", back_populates="schedule", uselist=False, cascade="all, delete-orphan")
    subject_assessments = relationship("SubjectAssessment", back_populates="schedule", cascade="all, delete-orphan")
    notifications = relationship("AssessmentNotification", back_populates="schedule", cascade="all, delete-orphan")

    __table_args__ = (
        UniqueConstraint('learner_id', 'scheduled_date', name='unique_learner_scheduled_date'),
    )

    def __repr__(self):
        return f"<AssessmentSchedule {self.assessment_level} {self.assessment_type} for learner {self.learner_id}>"


class AssessmentResponse(Base):
    """
    Quick assessment responses (5 questions).
    
    Captures preferences, confidence levels, and learning style.
    """
    __tablename__ = "assessment_responses"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    schedule_id = Column(UUID(as_uuid=True), ForeignKey("assessment_schedules.id", ondelete="CASCADE"), nullable=False, index=True)
    learner_id = Column(UUID(as_uuid=True), ForeignKey("learners.id", ondelete="CASCADE"), nullable=False)
    
    # Question Info
    question_number = Column(Integer, nullable=False)
    question_text = Column(Text, nullable=False)
    answer_value = Column(Text, nullable=False)
    answer_type = Column(String(50))  # emoji, multiple_choice, scale, text
    response_time_seconds = Column(Integer)
    
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    schedule = relationship("AssessmentSchedule", back_populates="responses")

    __table_args__ = (
        UniqueConstraint('schedule_id', 'question_number', name='unique_schedule_question'),
    )

    def __repr__(self):
        return f"<AssessmentResponse Q{self.question_number} for schedule {self.schedule_id}>"


class AssessmentResult(Base):
    """
    Quick assessment results.
    
    Stores preferences, confidence levels, and recommendations.
    """
    __tablename__ = "assessment_results"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    schedule_id = Column(UUID(as_uuid=True), ForeignKey("assessment_schedules.id", ondelete="CASCADE"), nullable=False)
    learner_id = Column(UUID(as_uuid=True), ForeignKey("learners.id", ondelete="CASCADE"), nullable=False, index=True)
    brain_instance_id = Column(UUID(as_uuid=True), ForeignKey("brain_instances.id"))

    # Overall scores
    overall_score = Column(Numeric(5, 2))
    confidence_level = Column(String(20))  # low, medium, high
    learning_style = Column(String(50))  # visual, auditory, kinesthetic, mixed

    # Detailed metrics from 5 questions
    reading_confidence = Column(Integer)
    math_confidence = Column(Integer)
    preferred_environment = Column(String(50))
    engagement_factors = Column(JSONB)
    work_preference = Column(String(50))

    # Progress tracking
    previous_assessment_id = Column(UUID(as_uuid=True), ForeignKey("assessment_results.id"))
    progress_percentage = Column(Numeric(5, 2))
    improvement_areas = Column(JSONB)
    strengths = Column(JSONB)
    recommendations = Column(JSONB)

    # Model update tracking
    triggered_model_update = Column(Boolean, default=False)
    model_updated_at = Column(DateTime)
    model_version_id = Column(UUID(as_uuid=True))

    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    schedule = relationship("AssessmentSchedule", back_populates="results")
    previous_assessment = relationship("AssessmentResult", remote_side=[id], foreign_keys=[previous_assessment_id])
    subject_results = relationship("SubjectResult", back_populates="assessment_result")

    __table_args__ = (
        CheckConstraint('reading_confidence BETWEEN 1 AND 4', name='check_reading_confidence'),
        CheckConstraint('math_confidence BETWEEN 1 AND 5', name='check_math_confidence'),
    )

    def __repr__(self):
        return f"<AssessmentResult {self.overall_score}% for learner {self.learner_id}>"


class SubjectAssessment(Base):
    """
    Comprehensive subject assessment tracking.
    
    Manages 30+ questions across multiple subjects (math, reading, science).
    """
    __tablename__ = "subject_assessments"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    schedule_id = Column(UUID(as_uuid=True), ForeignKey("assessment_schedules.id", ondelete="CASCADE"), nullable=False, index=True)
    learner_id = Column(UUID(as_uuid=True), ForeignKey("learners.id", ondelete="CASCADE"), nullable=False, index=True)
    
    # Subject Coverage
    subjects_included = Column(ARRAY(String))  # ['math', 'reading', 'science']
    total_questions = Column(Integer, nullable=False, default=0)
    questions_answered = Column(Integer, default=0)
    
    # Timing
    estimated_duration_minutes = Column(Integer, default=30)
    actual_duration_seconds = Column(Integer)
    started_at = Column(DateTime)
    
    # Status
    status = Column(String(20), default="pending")  # pending, in_progress, completed, abandoned
    
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    schedule = relationship("AssessmentSchedule", back_populates="subject_assessments")
    questions = relationship("SubjectQuestion", back_populates="assessment", cascade="all, delete-orphan")
    results = relationship("SubjectResult", back_populates="assessment", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<SubjectAssessment {self.id} - {self.questions_answered}/{self.total_questions}>"


class SubjectQuestion(Base):
    """
    Individual comprehensive assessment question.
    
    AI-generated or template-based questions with detailed tracking.
    """
    __tablename__ = "subject_questions"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    subject_assessment_id = Column(UUID(as_uuid=True), ForeignKey("subject_assessments.id", ondelete="CASCADE"), nullable=False, index=True)
    
    # Subject Info
    subject = Column(String(50), nullable=False)  # math, reading, science
    domain = Column(String(100))  # e.g., "Number Operations", "Comprehension"
    standard_code = Column(String(100))  # Aligned to educational standards
    
    # Question Content
    question_text = Column(Text, nullable=False)
    question_type = Column(String(50), nullable=False)  # multiple_choice, short_answer, problem_solving
    
    # For multiple choice
    options = Column(JSONB)  # ["Option A", "Option B", "Option C", "Option D"]
    correct_answer_index = Column(Integer)  # 0, 1, 2, or 3
    
    # For short answer
    acceptable_answers = Column(JSONB)  # List of acceptable answer variations
    
    # Difficulty & Targeting
    difficulty_level = Column(Integer, nullable=False)
    target_grade_level = Column(Integer)
    
    # Learner Response
    learner_answer = Column(Text)
    is_correct = Column(Boolean)
    time_spent_seconds = Column(Integer)
    attempts = Column(Integer, default=0)
    
    # AI Evaluation
    ai_evaluation = Column(JSONB)  # Detailed feedback
    
    # Ordering
    question_order = Column(Integer, nullable=False)
    
    created_at = Column(DateTime, default=datetime.utcnow)
    answered_at = Column(DateTime)

    # Relationships
    assessment = relationship("SubjectAssessment", back_populates="questions")

    __table_args__ = (
        CheckConstraint('difficulty_level BETWEEN 1 AND 10', name='check_difficulty_level'),
    )

    def __repr__(self):
        return f"<SubjectQuestion {self.subject} Q{self.question_order}>"


class SubjectResult(Base):
    """
    Comprehensive assessment results by subject.
    
    Detailed scoring with domain breakdowns and recommendations.
    """
    __tablename__ = "subject_results"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    subject_assessment_id = Column(UUID(as_uuid=True), ForeignKey("subject_assessments.id", ondelete="CASCADE"), nullable=False, index=True)
    assessment_result_id = Column(UUID(as_uuid=True), ForeignKey("assessment_results.id"))  # Link to quick assessment
    
    # Subject Breakdown
    subject = Column(String(50), nullable=False)
    
    # Scoring
    raw_score = Column(Integer, nullable=False)
    total_questions = Column(Integer, nullable=False)
    percentage_score = Column(Numeric(5, 2))
    
    # Level Determination
    assessed_grade_level = Column(Numeric(3, 1))  # e.g., 5.5 (mid-5th grade)
    grade_level_label = Column(String(50))  # "5th grade", "Advanced 5th grade"
    
    # Domain Breakdown
    domain_scores = Column(JSONB)
    
    # Strengths & Weaknesses
    strengths = Column(ARRAY(String))  # Domains with >= 75% accuracy
    weaknesses = Column(ARRAY(String))  # Domains with < 50% accuracy
    emerging_skills = Column(ARRAY(String))  # 50-74% accuracy
    
    # Recommendations
    recommended_activities = Column(JSONB)
    focus_areas = Column(ARRAY(String))
    differentiation_needed = Column(String(50))  # below_level, on_level, above_level, advanced
    
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    assessment = relationship("SubjectAssessment", back_populates="results")
    assessment_result = relationship("AssessmentResult", back_populates="subject_results")

    def __repr__(self):
        return f"<SubjectResult {self.subject}: {self.percentage_score}%>"


class BrainAdaptation(Base):
    """
    Brain model adaptation history.
    
    Tracks all changes to learner's brain model from assessments.
    """
    __tablename__ = "brain_adaptations"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    learner_id = Column(UUID(as_uuid=True), ForeignKey("learners.id", ondelete="CASCADE"), nullable=False, index=True)
    brain_instance_id = Column(UUID(as_uuid=True), ForeignKey("brain_instances.id"))
    
    # What triggered the adaptation
    trigger_type = Column(String(50), nullable=False)  # quick_assessment, comprehensive_assessment, manual, iep_update
    trigger_id = Column(UUID(as_uuid=True))  # ID of the assessment or other trigger
    
    # Changes Made
    adaptation_type = Column(String(50), nullable=False)  # preferences, knowledge_levels, full_retrain
    changes_applied = Column(JSONB, nullable=False)
    
    # Model Info
    previous_model_version = Column(String(100))
    new_model_version = Column(String(100), nullable=False)
    
    # Performance Impact
    expected_improvement_areas = Column(ARRAY(String))
    
    created_at = Column(DateTime, default=datetime.utcnow)

    def __repr__(self):
        return f"<BrainAdaptation {self.trigger_type} → {self.new_model_version}>"


class AssessmentNotification(Base):
    """Notifications for assessment events."""
    __tablename__ = "assessment_notifications"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    learner_id = Column(UUID(as_uuid=True), ForeignKey("learners.id", ondelete="CASCADE"), nullable=False)
    schedule_id = Column(UUID(as_uuid=True), ForeignKey("assessment_schedules.id", ondelete="CASCADE"), nullable=False)
    
    notification_type = Column(String(50), nullable=False)  # due_soon, overdue, completed, results_ready
    sent_to = Column(String(20), nullable=False)  # learner, parent, teacher
    recipient_id = Column(UUID(as_uuid=True), nullable=False)
    sent_at = Column(DateTime, default=datetime.utcnow)
    read_at = Column(DateTime)
    message = Column(Text)
    metadata = Column(JSONB)

    # Relationships
    schedule = relationship("AssessmentSchedule", back_populates="notifications")

    def __repr__(self):
        return f"<AssessmentNotification {self.notification_type} for {self.sent_to}>"


class AssessmentConfig(Base):
    """Assessment system configuration."""
    __tablename__ = "assessment_config"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    district_id = Column(UUID(as_uuid=True), ForeignKey("districts.id"))
    
    # Configuration
    quick_assessment_enabled = Column(Boolean, default=True)
    comprehensive_assessment_enabled = Column(Boolean, default=True)
    assessment_interval_days = Column(Integer, default=90)
    overdue_threshold_days = Column(Integer, default=7)
    
    # Question counts
    quick_questions_count = Column(Integer, default=5)
    comprehensive_questions_per_subject = Column(Integer, default=10)
    
    # Subjects to assess
    default_subjects = Column(ARRAY(String), default=['math', 'reading', 'science'])
    
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def __repr__(self):
        return f"<AssessmentConfig interval={self.assessment_interval_days}d>"
