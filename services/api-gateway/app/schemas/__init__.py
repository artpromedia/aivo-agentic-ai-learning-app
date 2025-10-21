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
    HomeworkSessionBase,
    HomeworkSessionCreate,
    HomeworkSessionUpdate,
    HomeworkSessionResponse,
    HomeworkFileCreate,
    HomeworkFileResponse,
    WorkProductCreate,
    WorkProductResponse,
)
from app.schemas.sensory_profile import (
    SensoryProfileBase,
    SensoryProfileCreate,
    SensoryProfileUpdate,
    SensoryProfileResponse,
)
from app.schemas.regulation import (
    RegulationSessionBase,
    RegulationSessionCreate,
    RegulationSessionUpdate,
    RegulationSessionResponse,
    EmotionHistoryCreate,
    EmotionHistoryResponse,
)
from app.schemas.iep import (
    IEPGoalBase,
    IEPGoalCreate,
    IEPGoalUpdate,
    IEPGoalResponse,
    IEPDataPointCreate,
    IEPDataPointResponse,
)
from app.schemas.progress import (
    ProgressRecordBase,
    ProgressRecordCreate,
    ProgressRecordUpdate,
    ProgressRecordResponse,
)
from app.schemas.analytics import (
    DailyMetricsResponse,
    SubjectMetricsResponse,
    AnalyticsSummary,
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
    "HomeworkSessionBase",
    "HomeworkSessionCreate",
    "HomeworkSessionUpdate",
    "HomeworkSessionResponse",
    "HomeworkFileCreate",
    "HomeworkFileResponse",
    "WorkProductCreate",
    "WorkProductResponse",
    
    # Sensory Profile
    "SensoryProfileBase",
    "SensoryProfileCreate",
    "SensoryProfileUpdate",
    "SensoryProfileResponse",
    
    # Regulation & Emotions
    "RegulationSessionBase",
    "RegulationSessionCreate",
    "RegulationSessionUpdate",
    "RegulationSessionResponse",
    "EmotionHistoryCreate",
    "EmotionHistoryResponse",
    
    # IEP
    "IEPGoalBase",
    "IEPGoalCreate",
    "IEPGoalUpdate",
    "IEPGoalResponse",
    "IEPDataPointCreate",
    "IEPDataPointResponse",
    
    # Progress
    "ProgressRecordBase",
    "ProgressRecordCreate",
    "ProgressRecordUpdate",
    "ProgressRecordResponse",
    
    # Analytics
    "DailyMetricsResponse",
    "SubjectMetricsResponse",
    "AnalyticsSummary",
]
