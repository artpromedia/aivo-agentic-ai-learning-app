"""
Training Service Configuration.

Part of PROMPT 57 Part B: Base Brain Training Strategy.
"""

from pydantic_settings import BaseSettings
from typing import Optional


class Settings(BaseSettings):
    """Application settings."""
    
    # Service Info
    SERVICE_NAME: str = "training-service"
    SERVICE_VERSION: str = "1.0.0"
    API_V1_PREFIX: str = "/api/v1"
    
    # Database (shared with curriculum service)
    CURRICULUM_DATABASE_URL: str = "postgresql://postgres:postgres@localhost:5432/aivo_curriculum"
    
    # Redis (for training job tracking)
    REDIS_URL: str = "redis://localhost:6379/3"
    
    # API Keys for training
    OPENAI_API_KEY: Optional[str] = None
    ANTHROPIC_API_KEY: Optional[str] = None
    GOOGLE_AI_API_KEY: Optional[str] = None
    
    # Training Configuration
    TRAINING_CONFIG_PATH: str = "config/training_config.yaml"
    MODELS_PATH: str = "./models"
    TRAINING_DATA_PATH: str = "./data/training"
    CHECKPOINTS_PATH: str = "./data/checkpoints"
    
    # Training Resources
    MAX_CONCURRENT_TRAINING_JOBS: int = 2
    TRAINING_TIMEOUT_HOURS: int = 48
    
    # Monitoring
    WANDB_API_KEY: Optional[str] = None  # Weights & Biases for tracking
    MLFLOW_TRACKING_URI: Optional[str] = None
    
    # Logging
    LOG_LEVEL: str = "INFO"
    
    # CORS
    CORS_ORIGINS: list = [
        "http://localhost:3000",
        "http://localhost:3001",
        "http://localhost:8000"
    ]
    
    class Config:
        env_file = ".env"
        case_sensitive = True


settings = Settings()
