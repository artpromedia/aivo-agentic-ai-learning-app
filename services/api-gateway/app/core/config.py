"""
Core configuration settings
"""
from pydantic_settings import BaseSettings
from typing import List, Optional
from functools import lru_cache


class Settings(BaseSettings):
    """
    Application settings loaded from environment variables.
    Uses pydantic for validation and type safety.
    """
    
    # ========================================
    # APPLICATION
    # ========================================
    PROJECT_NAME: str = "AIVO API Gateway"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"
    ENVIRONMENT: str = "development"  # development | staging | production
    DEBUG: bool = False
    LOG_LEVEL: str = "INFO"
    
    # ========================================
    # DATABASE
    # ========================================
    DATABASE_URL: str
    DB_POOL_SIZE: int = 20
    DB_MAX_OVERFLOW: int = 10
    DB_POOL_PRE_PING: bool = True
    DB_ECHO: bool = False
    
    # ========================================
    # REDIS
    # ========================================
    REDIS_URL: str
    REDIS_PASSWORD: Optional[str] = None
    REDIS_DB: int = 0
    REDIS_MAX_CONNECTIONS: int = 50
    
    # ========================================
    # SECURITY & AUTH
    # ========================================
    JWT_SECRET: str
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7
    PASSWORD_MIN_LENGTH: int = 8
    
    # ========================================
    # CORS
    # ========================================
    CORS_ORIGINS: List[str] = [
        "http://localhost:3000",  # Main website
        "http://localhost:3001",  # Parent portal
        "http://localhost:3002",  # Teacher portal
        "http://localhost:3003",  # Learner app
        "http://localhost:3004",
        "http://localhost:3005",
        "http://localhost:3006",
        "http://localhost:5005",  # District portal
        "http://localhost:5007",  # Admin portal
        "http://localhost:5009",
    ]
    CORS_CREDENTIALS: bool = True
    CORS_METHODS: List[str] = ["*"]
    CORS_HEADERS: List[str] = ["*"]
    
    # ========================================
    # FILE STORAGE
    # ========================================
    UPLOAD_DIR: str = "/app/uploads"
    MAX_UPLOAD_SIZE: int = 10485760  # 10MB
    ALLOWED_EXTENSIONS: List[str] = [
        "pdf", "doc", "docx", "jpg", "jpeg", "png"
    ]
    USE_S3: bool = False
    S3_BUCKET_NAME: Optional[str] = None
    AWS_ACCESS_KEY_ID: Optional[str] = None
    AWS_SECRET_ACCESS_KEY: Optional[str] = None
    
    # ========================================
    # AI MODEL
    # ========================================
    AI_INFERENCE_URL: str = "http://ai-inference-service:8002"
    AI_MODEL_NAME: str = "gpt-4-turbo"
    AI_MODEL_VERSION: str = "1.0.0"
    MAX_CONTEXT_LENGTH: int = 128000
    TEMPERATURE: float = 0.7
    MAX_TOKENS: int = 4096
    
    # ========================================
    # OCR
    # ========================================
    OCR_ENGINE: str = "tesseract"  # tesseract | google-vision | aws-textract
    GOOGLE_VISION_API_KEY: Optional[str] = None
    
    # ========================================
    # RATE LIMITING
    # ========================================
    RATE_LIMIT_ENABLED: bool = True
    RATE_LIMIT_REQUESTS: int = 100
    RATE_LIMIT_PERIOD: int = 60  # seconds
    
    # ========================================
    # EXTERNAL SERVICES
    # ========================================
    SENDGRID_API_KEY: Optional[str] = None
    STRIPE_SECRET_KEY: Optional[str] = None
    STRIPE_WEBHOOK_SECRET: Optional[str] = None
    
    # ========================================
    # SPECIAL EDUCATION SPECIFIC
    # ========================================
    # IEP
    IEP_UPLOAD_MAX_SIZE: int = 5242880  # 5MB
    IEP_ALLOWED_FORMATS: List[str] = ["pdf", "doc", "docx"]
    
    # Homework Helper
    HOMEWORK_MAX_FILES: int = 5
    HOMEWORK_SESSION_TIMEOUT: int = 3600  # 1 hour
    
    # Sensory Profiles
    SENSORY_PROFILE_CACHE_TTL: int = 300  # 5 minutes
    
    # Analytics
    ANALYTICS_BATCH_SIZE: int = 100
    ANALYTICS_FLUSH_INTERVAL: int = 60  # seconds
    
    class Config:
        env_file = ".env"
        case_sensitive = True


@lru_cache()
def get_settings() -> Settings:
    """
    Create cached settings instance.
    lru_cache ensures settings are loaded only once.
    """
    return Settings()


# Global settings instance
settings = get_settings()
