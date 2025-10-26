"""AI Provider schemas for request/response validation."""
from pydantic import BaseModel, Field, validator
from typing import Optional, List, Dict, Any
from datetime import datetime

from app.models.ai_provider import AIProviderType, AIModelCapability


class AIProviderBase(BaseModel):
    """Base AI provider schema."""
    name: str = Field(..., min_length=1, max_length=255)
    provider_type: AIProviderType
    display_name: str = Field(..., min_length=1, max_length=255)
    description: Optional[str] = None


class AIProviderCreate(AIProviderBase):
    """Schema for creating an AI provider."""
    api_key: Optional[str] = Field(None, min_length=1, max_length=500)
    api_base_url: Optional[str] = Field(None, max_length=500)
    api_version: Optional[str] = Field(None, max_length=50)
    organization_id: Optional[str] = Field(None, max_length=255)
    rate_limit_rpm: Optional[int] = Field(None, gt=0)
    rate_limit_tpm: Optional[int] = Field(None, gt=0)
    cost_per_1k_input_tokens: Optional[float] = Field(None, ge=0)
    cost_per_1k_output_tokens: Optional[float] = Field(None, ge=0)
    settings: Optional[Dict[str, Any]] = None
    supported_capabilities: Optional[List[AIModelCapability]] = None
    is_active: bool = True
    is_default: bool = False
    priority: int = Field(0, ge=0)


class AIProviderUpdate(BaseModel):
    """Schema for updating an AI provider."""
    display_name: Optional[str] = Field(None, min_length=1, max_length=255)
    description: Optional[str] = None
    api_key: Optional[str] = Field(None, min_length=1, max_length=500)
    api_base_url: Optional[str] = Field(None, max_length=500)
    api_version: Optional[str] = Field(None, max_length=50)
    organization_id: Optional[str] = Field(None, max_length=255)
    rate_limit_rpm: Optional[int] = Field(None, gt=0)
    rate_limit_tpm: Optional[int] = Field(None, gt=0)
    cost_per_1k_input_tokens: Optional[float] = Field(None, ge=0)
    cost_per_1k_output_tokens: Optional[float] = Field(None, ge=0)
    settings: Optional[Dict[str, Any]] = None
    supported_capabilities: Optional[List[AIModelCapability]] = None
    is_active: Optional[bool] = None
    is_default: Optional[bool] = None
    priority: Optional[int] = Field(None, ge=0)


class AIProviderResponse(AIProviderBase):
    """Schema for AI provider response."""
    id: str
    is_active: bool
    is_default: bool
    priority: int
    api_base_url: Optional[str] = None
    api_version: Optional[str] = None
    rate_limit_rpm: Optional[int] = None
    rate_limit_tpm: Optional[int] = None
    cost_per_1k_input_tokens: Optional[float] = None
    cost_per_1k_output_tokens: Optional[float] = None
    settings: Optional[Dict[str, Any]] = None
    supported_capabilities: Optional[List[str]] = None
    total_requests: int
    total_tokens_used: int
    total_cost: float
    last_used_at: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class AIModelBase(BaseModel):
    """Base AI model schema."""
    model_config = {"protected_namespaces": ()}
    
    model_name: str = Field(..., min_length=1, max_length=255)
    display_name: str = Field(..., min_length=1, max_length=255)
    description: Optional[str] = None


class AIModelCreate(AIModelBase):
    """Schema for creating an AI model."""
    model_config = {"protected_namespaces": ()}
    
    provider_id: str
    capabilities: List[AIModelCapability]
    max_context_length: int = Field(..., gt=0)
    max_output_tokens: Optional[int] = Field(None, gt=0)
    supports_streaming: bool = True
    supports_function_calling: bool = False
    supports_vision: bool = False
    default_temperature: float = Field(0.7, ge=0, le=2)
    default_top_p: float = Field(1.0, ge=0, le=1)
    default_max_tokens: Optional[int] = Field(None, gt=0)
    cost_per_1k_input_tokens: Optional[float] = Field(None, ge=0)
    cost_per_1k_output_tokens: Optional[float] = Field(None, ge=0)
    recommended_for: Optional[List[str]] = None
    settings: Optional[Dict[str, Any]] = None
    is_active: bool = True
    is_default: bool = False


class AIModelUpdate(BaseModel):
    """Schema for updating an AI model."""
    display_name: Optional[str] = Field(None, min_length=1, max_length=255)
    description: Optional[str] = None
    capabilities: Optional[List[AIModelCapability]] = None
    max_context_length: Optional[int] = Field(None, gt=0)
    max_output_tokens: Optional[int] = Field(None, gt=0)
    supports_streaming: Optional[bool] = None
    supports_function_calling: Optional[bool] = None
    supports_vision: Optional[bool] = None
    default_temperature: Optional[float] = Field(None, ge=0, le=2)
    default_top_p: Optional[float] = Field(None, ge=0, le=1)
    default_max_tokens: Optional[int] = Field(None, gt=0)
    cost_per_1k_input_tokens: Optional[float] = Field(None, ge=0)
    cost_per_1k_output_tokens: Optional[float] = Field(None, ge=0)
    recommended_for: Optional[List[str]] = None
    settings: Optional[Dict[str, Any]] = None
    is_active: Optional[bool] = None
    is_default: Optional[bool] = None


class AIModelResponse(AIModelBase):
    """Schema for AI model response."""
    model_config = {"protected_namespaces": (), "from_attributes": True}
    
    id: str
    provider_id: str
    capabilities: List[str]
    max_context_length: int
    max_output_tokens: Optional[int] = None
    supports_streaming: bool
    supports_function_calling: bool
    supports_vision: bool
    default_temperature: float
    default_top_p: float
    default_max_tokens: Optional[int] = None
    cost_per_1k_input_tokens: Optional[float] = None
    cost_per_1k_output_tokens: Optional[float] = None
    recommended_for: Optional[List[str]] = None
    settings: Optional[Dict[str, Any]] = None
    is_active: bool
    is_default: bool
    total_requests: int
    total_tokens_input: int
    total_tokens_output: int
    total_cost: float
    average_latency_ms: Optional[float] = None
    last_used_at: Optional[str] = None
    created_at: datetime
    updated_at: datetime


class AIProviderFallbackCreate(BaseModel):
    """Schema for creating a fallback chain."""
    name: str = Field(..., min_length=1, max_length=255)
    description: Optional[str] = None
    provider_chain: List[str] = Field(..., min_items=2)
    # List of provider IDs in fallback order
    use_case: Optional[str] = Field(None, max_length=100)
    max_retries_per_provider: int = Field(2, ge=1, le=5)
    retry_delay_seconds: int = Field(1, ge=0, le=10)
    is_active: bool = True


class AIProviderFallbackUpdate(BaseModel):
    """Schema for updating a fallback chain."""
    description: Optional[str] = None
    provider_chain: Optional[List[str]] = Field(None, min_items=2)
    use_case: Optional[str] = Field(None, max_length=100)
    max_retries_per_provider: Optional[int] = Field(None, ge=1, le=5)
    retry_delay_seconds: Optional[int] = Field(None, ge=0, le=10)
    is_active: Optional[bool] = None


class AIProviderFallbackResponse(BaseModel):
    """Schema for fallback chain response."""
    id: str
    name: str
    description: Optional[str] = None
    provider_chain: List[str]
    use_case: Optional[str] = None
    max_retries_per_provider: int
    retry_delay_seconds: int
    is_active: bool
    total_fallbacks: int
    successful_fallbacks: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class AICompletionRequest(BaseModel):
    """Schema for AI completion request."""
    model_config = {"protected_namespaces": ()}
    
    prompt: str = Field(..., min_length=1)
    model_id: Optional[str] = None  # Specific model, or use default
    provider_type: Optional[AIProviderType] = None  # Or specific provider
    temperature: Optional[float] = Field(None, ge=0, le=2)
    max_tokens: Optional[int] = Field(None, gt=0)
    top_p: Optional[float] = Field(None, ge=0, le=1)
    stream: bool = False
    use_case: Optional[str] = None  # For fallback chain selection
    system_prompt: Optional[str] = None
    stop_sequences: Optional[List[str]] = None


class AICompletionResponse(BaseModel):
    """Schema for AI completion response."""
    model_config = {"protected_namespaces": ()}
    
    text: str
    model_used: str
    provider_used: str
    tokens_input: int
    tokens_output: int
    cost: float
    latency_ms: float
    finish_reason: str
    fallback_occurred: bool = False
    fallback_chain: Optional[List[str]] = None
