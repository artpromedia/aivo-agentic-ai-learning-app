"""AI Provider models for multi-provider support."""
from sqlalchemy import (
    Column,
    String,
    Boolean,
    Integer,
    Float,
    JSON,
    Enum as SQLEnum,
    Text,
    ForeignKey,
    UniqueConstraint,
)
from sqlalchemy.orm import relationship
import enum

from app.models.base import BaseModel


class AIProviderType(str, enum.Enum):
    """Supported AI provider types."""
    OPENAI = "openai"
    ANTHROPIC = "anthropic"
    GOOGLE = "google"
    META = "meta"
    COHERE = "cohere"
    MISTRAL = "mistral"
    HUGGINGFACE = "huggingface"
    CUSTOM = "custom"


class AIModelCapability(str, enum.Enum):
    """AI model capabilities."""
    TEXT_GENERATION = "text_generation"
    CHAT = "chat"
    EMBEDDINGS = "embeddings"
    IMAGE_GENERATION = "image_generation"
    IMAGE_UNDERSTANDING = "image_understanding"
    FUNCTION_CALLING = "function_calling"
    CODE_GENERATION = "code_generation"
    MATH_REASONING = "math_reasoning"


class AIProvider(BaseModel):
    """
    AI Provider configuration.
    
    Stores provider-level settings for different AI services
    (OpenAI, Anthropic, Google, Meta, etc.)
    """
    __tablename__ = "ai_providers"
    __table_args__ = (
        UniqueConstraint('provider_type', 'name', name='uq_provider_name'),
    )

    # Provider Info
    name = Column(String(255), nullable=False)
    provider_type = Column(
        SQLEnum(AIProviderType),
        nullable=False,
        index=True
    )
    display_name = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    
    # Status
    is_active = Column(Boolean, default=True, nullable=False)
    is_default = Column(Boolean, default=False, nullable=False)
    priority = Column(Integer, default=0, nullable=False)
    # Higher priority = preferred provider (for fallback chains)
    
    # API Configuration
    api_key = Column(String(500), nullable=True)  # Encrypted
    api_base_url = Column(String(500), nullable=True)
    api_version = Column(String(50), nullable=True)
    organization_id = Column(String(255), nullable=True)
    
    # Rate Limiting (provider-specific)
    rate_limit_rpm = Column(Integer, nullable=True)  # Requests per minute
    rate_limit_tpm = Column(Integer, nullable=True)  # Tokens per minute
    
    # Cost Settings (per 1K tokens)
    cost_per_1k_input_tokens = Column(Float, nullable=True)
    cost_per_1k_output_tokens = Column(Float, nullable=True)
    
    # Additional Settings
    settings = Column(JSON, nullable=True)
    # Example: {
    #   "timeout": 30,
    #   "max_retries": 3,
    #   "retry_delay": 1,
    #   "custom_headers": {},
    #   "proxy_url": null
    # }
    
    # Capabilities
    supported_capabilities = Column(JSON, nullable=True)
    # Example: ["text_generation", "chat", "function_calling"]
    
    # Usage Tracking
    total_requests = Column(Integer, default=0, nullable=False)
    total_tokens_used = Column(Integer, default=0, nullable=False)
    total_cost = Column(Float, default=0.0, nullable=False)
    last_used_at = Column(String(50), nullable=True)
    
    # Relationships
    models = relationship(
        "AIModel",
        back_populates="provider",
        cascade="all, delete-orphan"
    )
    
    def __repr__(self):
        return f"<AIProvider {self.display_name} ({self.provider_type})>"


class AIModel(BaseModel):
    """
    AI Model configuration.
    
    Individual models within a provider
    (e.g., gpt-4, claude-3-opus, gemini-pro)
    """
    __tablename__ = "ai_models"
    __table_args__ = (
        UniqueConstraint(
            'provider_id',
            'model_name',
            name='uq_provider_model'
        ),
    )

    # Foreign Keys
    provider_id = Column(
        String(36),
        ForeignKey("ai_providers.id"),
        nullable=False,
        index=True
    )
    
    # Model Info
    model_name = Column(String(255), nullable=False)
    # e.g., "gpt-4-turbo", "claude-3-opus-20240229"
    display_name = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    
    # Status
    is_active = Column(Boolean, default=True, nullable=False)
    is_default = Column(Boolean, default=False, nullable=False)
    
    # Capabilities
    capabilities = Column(JSON, nullable=False)
    # List of AIModelCapability values
    
    # Context & Token Limits
    max_context_length = Column(Integer, nullable=False)
    max_output_tokens = Column(Integer, nullable=True)
    supports_streaming = Column(Boolean, default=True, nullable=False)
    supports_function_calling = Column(Boolean, default=False, nullable=False)
    supports_vision = Column(Boolean, default=False, nullable=False)
    
    # Default Parameters
    default_temperature = Column(Float, default=0.7, nullable=False)
    default_top_p = Column(Float, default=1.0, nullable=False)
    default_max_tokens = Column(Integer, nullable=True)
    
    # Cost (per 1K tokens) - can override provider defaults
    cost_per_1k_input_tokens = Column(Float, nullable=True)
    cost_per_1k_output_tokens = Column(Float, nullable=True)
    
    # Use Cases
    recommended_for = Column(JSON, nullable=True)
    # Example: ["homework_help", "iep_analysis", "lesson_planning"]
    
    # Model-specific Settings
    settings = Column(JSON, nullable=True)
    # Example: {
    #   "system_prompt": "You are a helpful assistant...",
    #   "stop_sequences": ["\n\n"],
    #   "frequency_penalty": 0,
    #   "presence_penalty": 0
    # }
    
    # Usage Tracking
    total_requests = Column(Integer, default=0, nullable=False)
    total_tokens_input = Column(Integer, default=0, nullable=False)
    total_tokens_output = Column(Integer, default=0, nullable=False)
    total_cost = Column(Float, default=0.0, nullable=False)
    average_latency_ms = Column(Float, nullable=True)
    last_used_at = Column(String(50), nullable=True)
    
    # Relationships
    provider = relationship("AIProvider", back_populates="models")
    
    def __repr__(self):
        return f"<AIModel {self.display_name}>"


class AIProviderFallback(BaseModel):
    """
    AI Provider fallback chain configuration.
    
    Defines fallback order when primary provider fails.
    """
    __tablename__ = "ai_provider_fallbacks"

    # Fallback Chain
    name = Column(String(255), nullable=False, unique=True)
    description = Column(Text, nullable=True)
    is_active = Column(Boolean, default=True, nullable=False)
    
    # Providers in order (array of provider IDs)
    provider_chain = Column(JSON, nullable=False)
    # Example: ["provider-id-1", "provider-id-2", "provider-id-3"]
    
    # Use Case Filter
    use_case = Column(String(100), nullable=True)
    # e.g., "homework_help", "iep_analysis", null for global
    
    # Fallback Rules
    max_retries_per_provider = Column(Integer, default=2, nullable=False)
    retry_delay_seconds = Column(Integer, default=1, nullable=False)
    
    # Usage Tracking
    total_fallbacks = Column(Integer, default=0, nullable=False)
    successful_fallbacks = Column(Integer, default=0, nullable=False)
    
    def __repr__(self):
        return f"<AIProviderFallback {self.name}>"
