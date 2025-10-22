"""Pydantic schemas for Aivo Learning API."""
from app.schemas.response import (
    StandardResponse,
    PaginatedResponse,
    ErrorDetail,
    ResponseMeta,
    success_response,
    error_response,
    paginated_response,
)
from app.schemas.user import (
    UserBase,
    UserCreate,
    UserUpdate,
    UserResponse,
    TokenResponse,
    LoginRequest,
    RefreshTokenRequest,
)
from app.schemas.learner import (
    LearnerBase,
    LearnerCreate,
    LearnerUpdate,
    LearnerResponse,
)
from app.schemas.homework import (
    HomeworkStatus,
    HomeworkStep,
    HomeworkInputMethod,
    HomeworkFileUpload,
    HomeworkSessionCreate,
    HomeworkSessionResponse,
    HintRequest,
    HintResponse,
    ExplanationRequest,
    ExplanationResponse,
)
from app.schemas.sensory_profile import (
    VisualSettings,
    AuditorySettings,
    MotorSettings,
    CognitiveSettings,
    EnvironmentSettings,
    TriggerSettings,
    SensoryPreset,
    SensoryProfileCreate,
    SensoryProfileUpdate,
    SensoryProfileResponse,
)
from app.schemas.regulation import (
    EmotionType,
    ActivityType,
    EmotionState,
    RegulationActivity,
    RegulationSessionCreate,
    RegulationSessionComplete,
    RegulationSessionResponse,
    EmotionCheckIn,
    ActivityRecommendation,
)
from app.schemas.iep import (
    IEPGoalStatus,
    IEPGoalCreate,
    IEPGoalUpdate,
    IEPGoalResponse,
    IEPDataPointCreate,
    IEPDataPointResponse,
)
from app.schemas.analytics import (
    DateRangeFilter,
    EngagementMetrics,
    ProgressMetrics,
    IEPGoalProgress,
    SubjectMetrics,
    FocusMetrics,
    HomeworkMetrics,
    AccommodationMetrics,
    LearnerAnalytics,
    ExportFormat,
    AnalyticsExportRequest,
    DailyMetricsResponse,
    SubjectMetricsResponse,
)
from app.schemas.progress import (
    ProgressRecordBase,
    ProgressRecordCreate,
    ProgressRecordUpdate,
    ProgressRecordResponse,
)
from app.schemas.ai_provider import (
    AIProviderBase,
    AIProviderCreate,
    AIProviderUpdate,
    AIProviderResponse,
    AIModelBase,
    AIModelCreate,
    AIModelUpdate,
    AIModelResponse,
    AIProviderFallbackCreate,
    AIProviderFallbackUpdate,
    AIProviderFallbackResponse,
    AICompletionRequest,
    AICompletionResponse,
)

__all__ = [
    # Response
    "StandardResponse",
    "PaginatedResponse",
    "ErrorDetail",
    "ResponseMeta",
    "success_response",
    "error_response",
    "paginated_response",

    # User
    "UserBase",
    "UserCreate",
    "UserUpdate",
    "UserResponse",
    "TokenResponse",
    "LoginRequest",
    "RefreshTokenRequest",

    # Learner
    "LearnerBase",
    "LearnerCreate",
    "LearnerUpdate",
    "LearnerResponse",

    # Homework
    "HomeworkStatus",
    "HomeworkStep",
    "HomeworkInputMethod",
    "HomeworkFileUpload",
    "HomeworkSessionCreate",
    "HomeworkSessionResponse",
    "HintRequest",
    "HintResponse",
    "ExplanationRequest",
    "ExplanationResponse",

    # Sensory Profile
    "VisualSettings",
    "AuditorySettings",
    "MotorSettings",
    "CognitiveSettings",
    "EnvironmentSettings",
    "TriggerSettings",
    "SensoryPreset",
    "SensoryProfileCreate",
    "SensoryProfileUpdate",
    "SensoryProfileResponse",

    # Regulation & Emotions
    "EmotionType",
    "ActivityType",
    "EmotionState",
    "RegulationActivity",
    "RegulationSessionCreate",
    "RegulationSessionComplete",
    "RegulationSessionResponse",
    "EmotionCheckIn",
    "ActivityRecommendation",

    # IEP
    "IEPGoalStatus",
    "IEPGoalCreate",
    "IEPGoalUpdate",
    "IEPGoalResponse",
    "IEPDataPointCreate",
    "IEPDataPointResponse",

    # Analytics
    "DateRangeFilter",
    "EngagementMetrics",
    "ProgressMetrics",
    "IEPGoalProgress",
    "SubjectMetrics",
    "FocusMetrics",
    "HomeworkMetrics",
    "AccommodationMetrics",
    "LearnerAnalytics",
    "ExportFormat",
    "AnalyticsExportRequest",
    "DailyMetricsResponse",
    "SubjectMetricsResponse",

    # Progress
    "ProgressRecordBase",
    "ProgressRecordCreate",
    "ProgressRecordUpdate",
    "ProgressRecordResponse",

    # AI Providers
    "AIProviderBase",
    "AIProviderCreate",
    "AIProviderUpdate",
    "AIProviderResponse",
    "AIModelBase",
    "AIModelCreate",
    "AIModelUpdate",
    "AIModelResponse",
    "AIProviderFallbackCreate",
    "AIProviderFallbackUpdate",
    "AIProviderFallbackResponse",
    "AICompletionRequest",
    "AICompletionResponse",
]
