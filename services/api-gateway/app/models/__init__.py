"""SQLAlchemy models for Aivo Learning API."""
from app.models.base import BaseModel, TimestampMixin, UUIDMixin
from app.models.user import User, UserRole
from app.models.learner import Learner
from app.models.homework import HomeworkSession, HomeworkFile, WorkProduct, HomeworkStatus, HomeworkStep
from app.models.sensory_profile import SensoryProfile
from app.models.regulation import RegulationSession, EmotionHistory, EmotionType
from app.models.iep import IEPGoal, IEPDataPoint, IEPGoalStatus
from app.models.progress import ProgressRecord
from app.models.analytics import DailyMetrics, SubjectMetrics
from app.models.ai_provider import (
    AIProvider,
    AIModel,
    AIProviderFallback,
    AIProviderType,
    AIModelCapability,
)

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
]
