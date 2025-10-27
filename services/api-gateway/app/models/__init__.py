"""SQLAlchemy models for Aivo Learning API."""
from app.models.analytics import DailyMetrics, SubjectMetrics
from app.models.ai_provider import (
    AIModel,
    AIModelCapability,
    AIProvider,
    AIProviderFallback,
    AIProviderType,
)
from app.models.base import BaseModel, TimestampMixin, UUIDMixin
from app.models.feature_flag import FeatureFlag
from app.models.hitl import (
    HITLQueue,
    HITLQueuePriority,
    HITLQueueStatus,
    HITLQueueType,
)
from app.models.homework import (
    HomeworkFile,
    HomeworkSession,
    HomeworkStatus,
    HomeworkStep,
    WorkProduct,
)
from app.models.iep import IEPDataPoint, IEPGoal, IEPGoalStatus
from app.models.learner import Learner
from app.models.license import (
    DistrictAccount,
    DistrictStatus,
    LicenseAssignmentV2,
    LicensePool,
    LicenseStatus,
    LicenseType,
    LicenseUsageLog,
    LicenseV2,
    LicenseVault,
    SchoolAccount,
)
from app.models.progress import ProgressRecord
from app.models.regulation import EmotionHistory, EmotionType, RegulationSession
from app.models.sensory_profile import SensoryProfile
from app.models.user import User, UserRole

__all__ = [
    # Base
    "BaseModel",
    "TimestampMixin",
    "UUIDMixin",
    # User
    "User",
    "UserRole",
    # Learner
    "Learner",
    # Homework
    "HomeworkSession",
    "HomeworkFile",
    "WorkProduct",
    "HomeworkStatus",
    "HomeworkStep",
    # Sensory Profile
    "SensoryProfile",
    # Regulation & Emotions
    "RegulationSession",
    "EmotionHistory",
    "EmotionType",
    # IEP
    "IEPGoal",
    "IEPDataPoint",
    "IEPGoalStatus",
    # Progress
    "ProgressRecord",
    # Analytics
    "DailyMetrics",
    "SubjectMetrics",
    # AI Providers
    "AIProvider",
    "AIModel",
    "AIProviderFallback",
    "AIProviderType",
    "AIModelCapability",
    # Licensing & Districts
    "DistrictAccount",
    "SchoolAccount",
    "LicenseVault",
    "LicensePool",
    "LicenseV2",
    "LicenseAssignmentV2",
    "LicenseUsageLog",
    "LicenseType",
    "LicenseStatus",
    "DistrictStatus",
    # Feature Flags
    "FeatureFlag",
    # HITL Operations
    "HITLQueue",
    "HITLQueueStatus",
    "HITLQueuePriority",
    "HITLQueueType",
]
