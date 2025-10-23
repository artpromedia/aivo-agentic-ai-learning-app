"""
Assessment Pydantic Schemas.

Request/response schemas for both Quick and Comprehensive assessments.
"""

from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime


# ============================================================================
# QUICK ASSESSMENT SCHEMAS (PROMPT 58)
# ============================================================================

class AssessmentResponseItem(BaseModel):
    """Single question response in quick assessment."""
    question_number: int
    question_text: str
    answer_value: str
    answer_type: str  # emoji, multiple_choice, scale, text
    response_time_seconds: Optional[int] = None


class QuickAssessmentSubmission(BaseModel):
    """Submit quick assessment (5 questions)."""
    schedule_id: str
    learner_id: str
    responses: List[AssessmentResponseItem]


class AssessmentScheduleResponse(BaseModel):
    """Assessment schedule details."""
    id: str
    learner_id: str
    district_id: str
    assessment_type: str
    assessment_level: str
    scheduled_date: datetime
    completed_date: Optional[datetime]
    status: str
    is_first_assessment: bool
    days_since_last: int
    created_at: datetime

    class Config:
        from_attributes = True


class AssessmentResultResponse(BaseModel):
    """Quick assessment results."""
    id: str
    learner_id: str
    overall_score: float
    confidence_level: str
    learning_style: str
    reading_confidence: int
    math_confidence: int
    preferred_environment: str
    engagement_factors: Dict[str, Any]
    work_preference: str
    progress_percentage: Optional[float]
    improvement_areas: List[str]
    strengths: List[str]
    recommendations: List[str]
    triggered_model_update: bool
    model_updated_at: Optional[datetime]
    created_at: datetime

    class Config:
        from_attributes = True


class AssessmentHistoryResponse(BaseModel):
    """Complete assessment history for learner."""
    learner_id: str
    total_assessments: int
    results: List[AssessmentResultResponse]
    upcoming_schedules: List[AssessmentScheduleResponse]
    completion_rate: float


# ============================================================================
# COMPREHENSIVE ASSESSMENT SCHEMAS (PROMPT 61)
# ============================================================================

class SubjectQuestionResponse(BaseModel):
    """Individual question in comprehensive assessment."""
    id: str
    subject: str
    domain: str
    question_text: str
    question_type: str  # multiple_choice, short_answer
    options: Optional[List[str]] = None
    difficulty_level: int
    question_order: int

    class Config:
        from_attributes = True


class CreateComprehensiveAssessment(BaseModel):
    """Request to create comprehensive assessment."""
    learner_id: str
    schedule_id: str
    subjects: Optional[List[str]] = ['math', 'reading', 'science']


class ComprehensiveAssessmentResponse(BaseModel):
    """Created comprehensive assessment with questions."""
    assessment_id: str
    total_questions: int
    subjects: List[str]
    estimated_minutes: int
    questions: List[SubjectQuestionResponse]


class SubmitAnswerRequest(BaseModel):
    """Submit answer for a single question."""
    question_id: str
    learner_answer: str
    time_spent_seconds: int


class AnswerFeedbackResponse(BaseModel):
    """Immediate feedback on answer."""
    correct: bool
    feedback: str
    explanation: str
    suggestions: Optional[List[str]] = None


class DomainScore(BaseModel):
    """Score for a specific domain."""
    domain: str
    correct: int
    total: int
    percentage: float


class SubjectResultResponse(BaseModel):
    """Results for a single subject."""
    subject: str
    raw_score: int
    total_questions: int
    percentage_score: float
    assessed_grade_level: float
    grade_level_label: str
    domain_scores: Dict[str, Dict[str, Any]]
    strengths: List[str]
    weaknesses: List[str]
    emerging_skills: List[str]
    differentiation_needed: str
    recommendations: Dict[str, List[str]]

    class Config:
        from_attributes = True


class ComprehensiveResultsResponse(BaseModel):
    """Complete comprehensive assessment results."""
    overall_score: float
    subject_results: Dict[str, SubjectResultResponse]
    brain_adaptation_recommended: bool
    changes_needed: Dict[str, Any]
    assessment_id: str


# ============================================================================
# BRAIN ADAPTATION SCHEMAS
# ============================================================================

class BrainAdaptationResponse(BaseModel):
    """Brain model adaptation details."""
    id: str
    learner_id: str
    trigger_type: str
    adaptation_type: str
    changes_applied: Dict[str, Any]
    previous_model_version: Optional[str]
    new_model_version: str
    expected_improvement_areas: List[str]
    created_at: datetime

    class Config:
        from_attributes = True


class AdaptBrainRequest(BaseModel):
    """Request to adapt brain model."""
    assessment_id: str  # Can be quick or comprehensive
    changes: Dict[str, Any]


# ============================================================================
# COMBINED SCHEMAS
# ============================================================================

class CombinedAssessmentHistory(BaseModel):
    """
    Combined history showing both quick and comprehensive assessments.
    """
    learner_id: str
    
    # Quick assessments
    quick_assessments: List[AssessmentResultResponse]
    
    # Comprehensive assessments
    comprehensive_assessments: List[ComprehensiveResultsResponse]
    
    # Brain adaptations
    brain_adaptations: List[BrainAdaptationResponse]
    
    # Statistics
    total_assessments: int
    completion_rate: float
    average_score: float
    latest_assessment_date: Optional[datetime]
    next_assessment_due: Optional[datetime]


class AssessmentDueResponse(BaseModel):
    """Check if assessment is due."""
    is_due: bool
    assessment_type: Optional[str]  # quick or comprehensive
    scheduled_date: Optional[datetime]
    days_since_last: Optional[int]
    schedule_id: Optional[str]


# ============================================================================
# NOTIFICATION SCHEMAS
# ============================================================================

class NotificationResponse(BaseModel):
    """Assessment notification."""
    id: str
    notification_type: str
    sent_to: str
    message: str
    sent_at: datetime
    read_at: Optional[datetime]

    class Config:
        from_attributes = True


class CreateNotificationRequest(BaseModel):
    """Create assessment notification."""
    learner_id: str
    schedule_id: str
    notification_type: str
    sent_to: str
    recipient_id: str
    message: str
    metadata: Optional[Dict[str, Any]] = None
