"""
Core configuration settings
"""
from pydantic_settings import BaseSettings
from typing import List


class Settings(BaseSettings):
    """Application settings"""
    
    # Project
    PROJECT_NAME: str = "AIVO API Gateway"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"
    ENVIRONMENT: str = "development"
    DEBUG: bool = True
    LOG_LEVEL: str = "INFO"
    
    # Database
    DATABASE_URL: str
    DB_POOL_SIZE: int = 20
    DB_MAX_OVERFLOW: int = 10
    DB_ECHO: bool = False
    
    # Redis
    REDIS_URL: str
    REDIS_MAX_CONNECTIONS: int = 50
    
    # Security
    JWT_SECRET: str
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7
    PASSWORD_MIN_LENGTH: int = 8
    
    # CORS
    CORS_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://localhost:3004",
        "http://localhost:3005",
        "http://localhost:3006",
        "http://localhost:5005",
        "http://localhost:5009",
    ]
    
    # File Upload
    UPLOAD_DIR: str = "/app/uploads"
    MAX_UPLOAD_SIZE: int = 10485760  # 10MB
    ALLOWED_EXTENSIONS: str = "pdf,doc,docx,txt,jpg,jpeg,png"
    
    # Rate Limiting
    RATE_LIMIT_ENABLED: bool = True
    RATE_LIMIT_REQUESTS: int = 100
    RATE_LIMIT_PERIOD: int = 60
    
    # Service URLs
    AUTH_SERVICE_URL: str = "http://auth-service:8001"
    AI_SERVICE_URL: str = "http://ai-inference-service:8002"
    
    # AI Configuration
    AI_MODEL_NAME: str = "gpt-4-turbo"
    OPENAI_API_KEY: str = ""
    MAX_CONTEXT_LENGTH: int = 128000
    TEMPERATURE: float = 0.7
    MAX_TOKENS: int = 4096
    
    class Config:
        env_file = ".env"
        case_sensitive = True


settings = Settings()
