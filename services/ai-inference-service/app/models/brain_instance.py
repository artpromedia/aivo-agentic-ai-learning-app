"""Data models for brain instances and learning profiles."""
from pydantic import BaseModel, Field
from typing import Optional, Dict, Any, List
from datetime import datetime
from enum import Enum


class BrainStatus(str, Enum):
    """Brain instance status."""
    INITIALIZING = "initializing"
    ACTIVE = "active"
    ADAPTING = "adapting"
    SYNCING = "syncing"
    INACTIVE = "inactive"
    ERROR = "error"


class LearningStyle(str, Enum):
    """Learning style preferences."""
    VISUAL = "visual"
    AUDITORY = "auditory"
    KINESTHETIC = "kinesthetic"
    READING_WRITING = "reading_writing"


class DiagnosisType(str, Enum):
    """Special education diagnosis types."""
    ADHD = "adhd"
    ASD = "asd"
    DYSLEXIA = "dyslexia"
    DYSCALCULIA = "dyscalculia"
    DYSGRAPHIA = "dysgraphia"
    ANXIETY = "anxiety"
    OTHER = "other"


class LearningProfile(BaseModel):
    """Learner profile for personalized AI adaptation."""
    learner_id: str
    age: int
    grade_level: str
    learning_style: LearningStyle
    diagnoses: List[DiagnosisType] = Field(default_factory=list)
    strengths: List[str] = Field(default_factory=list)
    challenges: List[str] = Field(default_factory=list)
    accommodations: List[str] = Field(default_factory=list)
    preferred_complexity: str = "moderate"  # simple, moderate, detailed
    attention_span_minutes: Optional[int] = 20
    support_level: str = "moderate"  # minimal, moderate, substantial


class BrainMetrics(BaseModel):
    """Metrics tracking brain performance."""
    total_interactions: int = 0
    successful_hints: int = 0
    hint_success_rate: float = 0.0
    average_complexity_used: float = 0.0
    adaptations_made: int = 0
    last_adaptation_time: Optional[datetime] = None
    total_tokens_used: int = 0
    average_response_time_ms: float = 0.0


class BrainInstance(BaseModel):
    """Federated brain instance for a specific learner."""
    brain_id: str
    learner_id: str
    base_model_name: str
    base_model_version: str
    learning_profile: LearningProfile
    status: BrainStatus = BrainStatus.INITIALIZING
    created_at: datetime = Field(default_factory=datetime.utcnow)
    last_active: datetime = Field(default_factory=datetime.utcnow)
    last_synced: Optional[datetime] = None
    metrics: BrainMetrics = Field(default_factory=BrainMetrics)
    adaptation_context: Dict[str, Any] = Field(default_factory=dict)
    model_params: Dict[str, Any] = Field(default_factory=dict)

    def update_activity(self):
        """Update last active timestamp."""
        self.last_active = datetime.utcnow()

    def record_interaction(
        self,
        success: bool,
        complexity_used: str,
        tokens: int,
        response_time_ms: float
    ):
        """Record an interaction outcome."""
        self.metrics.total_interactions += 1
        if success:
            self.metrics.successful_hints += 1

        # Update success rate
        self.metrics.hint_success_rate = (
            self.metrics.successful_hints / self.metrics.total_interactions
        )

        # Update average complexity
        complexity_map = {"simple": 1.0, "moderate": 2.0, "detailed": 3.0}
        complexity_value = complexity_map.get(complexity_used, 2.0)
        total = self.metrics.total_interactions
        prev_avg = self.metrics.average_complexity_used
        self.metrics.average_complexity_used = (
            (prev_avg * (total - 1) + complexity_value) / total
        )

        # Update tokens and response time
        self.metrics.total_tokens_used += tokens
        prev_time = self.metrics.average_response_time_ms
        self.metrics.average_response_time_ms = (
            (prev_time * (total - 1) + response_time_ms) / total
        )

        self.update_activity()


class AdaptationRequest(BaseModel):
    """Request to adapt a brain instance based on outcomes."""
    brain_id: str
    recent_outcomes: List[Dict[str, Any]]
    context: Optional[Dict[str, Any]] = None


class InferenceRequest(BaseModel):
    """Request for AI inference."""
    brain_id: str
    prompt: str
    context: Optional[Dict[str, Any]] = None
    max_tokens: Optional[int] = None
    temperature: Optional[float] = None


class InferenceResponse(BaseModel):
    """Response from AI inference."""
    brain_id: str
    response_text: str
    tokens_used: int
    response_time_ms: float
    complexity_level: str
    metadata: Dict[str, Any] = Field(default_factory=dict)


class HintRequest(BaseModel):
    """Request for an adaptive hint."""
    brain_id: str
    problem_context: str
    current_attempt: Optional[str] = None
    hint_level: Optional[str] = "moderate"  # simple, moderate, detailed
    subject: str
    grade_level: str


class HintResponse(BaseModel):
    """Response with an adaptive hint."""
    brain_id: str
    hint_text: str
    complexity_level: str
    estimated_support_level: str
    follow_up_questions: List[str] = Field(default_factory=list)
    visual_aids_suggested: List[str] = Field(default_factory=list)
    metadata: Dict[str, Any] = Field(default_factory=dict)


class ExplanationRequest(BaseModel):
    """Request for a detailed explanation."""
    brain_id: str
    concept: str
    subject: str
    grade_level: str
    context: Optional[str] = None


class ExplanationResponse(BaseModel):
    """Response with a detailed explanation."""
    brain_id: str
    explanation_text: str
    examples: List[str] = Field(default_factory=list)
    analogies: List[str] = Field(default_factory=list)
    complexity_level: str
    metadata: Dict[str, Any] = Field(default_factory=dict)
