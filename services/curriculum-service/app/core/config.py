"""
Curriculum Service Configuration.

Part of PROMPT 57: Base Brain Training & Curriculum Integration.
"""

from pydantic_settings import BaseSettings
from typing import Optional


class Settings(BaseSettings):
    """Application settings."""
    
    # Service Info
    SERVICE_NAME: str = "curriculum-service"
    SERVICE_VERSION: str = "1.0.0"
    API_V1_PREFIX: str = "/api/v1"
    
    # Database
    DATABASE_URL: str = "postgresql://postgres:postgres@localhost:5432/aivo_curriculum"
    DATABASE_POOL_SIZE: int = 10
    DATABASE_MAX_OVERFLOW: int = 20
    
    # Redis (for caching)
    REDIS_URL: str = "redis://localhost:6379/2"
    
    # API Keys for data sources
    OPENAI_API_KEY: Optional[str] = None
    ANTHROPIC_API_KEY: Optional[str] = None
    
    # Data Import Sources
    NCES_API_KEY: Optional[str] = None  # National Center for Education Statistics
    COMMON_CORE_API_URL: str = "http://www.corestandards.org/wp-json/ccss"
    NGSS_API_URL: str = "https://www.nextgenscience.org/api"
    
    # File Storage
    CURRICULUM_DATA_PATH: str = "./data/curriculum"
    TRAINING_DATA_PATH: str = "./data/training"
    MODEL_ARTIFACTS_PATH: str = "./data/models"
    
    # Import Settings
    BATCH_SIZE: int = 100  # Number of standards to import at once
    MAX_CONCURRENT_IMPORTS: int = 5
    IMPORT_TIMEOUT_SECONDS: int = 300
    
    # Training Settings
    BASE_MODEL_PROVIDER: str = "openai"  # openai, anthropic, google
    BASE_MODEL_NAME: str = "gpt-4-turbo-preview"
    TRAINING_BATCH_SIZE: int = 32
    TRAINING_EPOCHS: int = 3
    
    # Logging
    LOG_LEVEL: str = "INFO"
    LOG_FORMAT: str = "json"
    
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
