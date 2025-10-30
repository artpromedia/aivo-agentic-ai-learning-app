"""AI Inference Service Configuration."""

from typing import Optional

from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """AI Inference Service Configuration."""

    # Application
    PROJECT_NAME: str = "AIVO AI Inference Service"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/v1"
    DEBUG: bool = False

    # Model Configuration
    BASE_MODEL_NAME: str = "gpt-4-turbo"
    BASE_MODEL_VERSION: str = "1.0.0"
    MODEL_CACHE_DIR: str = "/app/models"

    # Brain Cloning
    ENABLE_BRAIN_CLONING: bool = True
    MAX_BRAIN_INSTANCES: int = 1000
    BRAIN_SYNC_INTERVAL: int = 3600  # 1 hour
    FEDERATED_LEARNING_ENABLED: bool = True

    # Inference
    DEFAULT_TEMPERATURE: float = 0.7
    DEFAULT_MAX_TOKENS: int = 4096
    MAX_CONTEXT_LENGTH: int = 128000
    BATCH_SIZE: int = 8

    # Performance
    USE_GPU: bool = True
    GPU_MEMORY_FRACTION: float = 0.8
    NUM_WORKERS: int = 4

    # Redis (for brain state caching)
    REDIS_URL: str = "redis://localhost:6379/2"
    BRAIN_CACHE_TTL: int = 3600  # 1 hour

    # Special Education Features
    HINT_COMPLEXITY_LEVELS: list = ["simple", "moderate", "detailed"]
    EXPLANATION_MAX_LENGTH: int = 500
    ADAPTIVE_DIFFICULTY: bool = True

    # Agentic AI Features
    ENABLE_AGENTIC_MODE: bool = False  # Feature flag
    AGENTIC_CYCLE_INTERVAL_HOURS: int = 24  # Run autonomous cycle every 24 hours
    AGENTIC_MEMORY_CONSOLIDATION_HOUR: int = 2  # Consolidate memories at 2 AM
    AGENTIC_MAX_GOALS_PER_BRAIN: int = 4  # Max concurrent learning goals
    AGENTIC_GOAL_TIME_HORIZON: str = "2_weeks"  # Default goal timeframe
    AGENTIC_AUTONOMY_LEVEL: str = "GUIDED"  # MINIMAL, GUIDED, PROACTIVE, AUTONOMOUS
    AGENTIC_PROACTIVE_MONITORING: bool = True  # Enable real-time monitoring
    AGENTIC_MIN_IMPORTANCE_THRESHOLD: float = 0.5  # Min importance to store memory
    AGENTIC_REFLECTION_FREQUENCY: str = "session_end"  # or "daily", "weekly"

    # OpenAI API (fallback)
    OPENAI_API_KEY: Optional[str] = None
    OPENAI_ORG_ID: Optional[str] = None

    # Anthropic API (alternative)
    ANTHROPIC_API_KEY: Optional[str] = None

    # Google Gemini API (alternative)
    GOOGLE_API_KEY: Optional[str] = None
    GOOGLE_PROJECT_ID: Optional[str] = None

    class Config:
        env_file = ".env"
        case_sensitive = True


settings = Settings()
