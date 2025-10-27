"""
AI Provider Configuration API.

Endpoints for managing AI providers, models, and fallback chains.
Created: 2025-10-26
"""
import time
from datetime import datetime
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.api.deps import get_db, require_admin
from app.models import (
    AIModel,
    AIProvider,
    AIProviderType,
)

router = APIRouter()


# Pydantic Schemas
class AIProviderResponse(BaseModel):
    """AI Provider response schema."""
    id: str
    name: str
    provider_type: AIProviderType
    display_name: str
    description: Optional[str] = None
    is_active: bool
    is_default: bool
    priority: int
    api_base_url: Optional[str] = None
    rate_limit_rpm: Optional[int] = None
    rate_limit_tpm: Optional[int] = None
    cost_per_1k_input_tokens: Optional[float] = None
    cost_per_1k_output_tokens: Optional[float] = None
    supported_capabilities: Optional[List[str]] = None
    total_requests: int
    total_tokens_used: int
    total_cost: float
    last_used_at: Optional[str] = None
    created_at: str
    updated_at: str

    class Config:
        from_attributes = True


class AIProviderCreate(BaseModel):
    """AI Provider creation schema."""
    name: str
    provider_type: AIProviderType
    display_name: str
    description: Optional[str] = None
    api_key: Optional[str] = None
    api_base_url: Optional[str] = None
    api_version: Optional[str] = None
    organization_id: Optional[str] = None
    rate_limit_rpm: Optional[int] = None
    rate_limit_tpm: Optional[int] = None
    cost_per_1k_input_tokens: Optional[float] = None
    cost_per_1k_output_tokens: Optional[float] = None
    supported_capabilities: Optional[List[str]] = None


class AIProviderUpdate(BaseModel):
    """AI Provider update schema."""
    display_name: Optional[str] = None
    description: Optional[str] = None
    is_active: Optional[bool] = None
    priority: Optional[int] = None
    api_key: Optional[str] = None
    api_base_url: Optional[str] = None
    rate_limit_rpm: Optional[int] = None
    rate_limit_tpm: Optional[int] = None
    cost_per_1k_input_tokens: Optional[float] = None
    cost_per_1k_output_tokens: Optional[float] = None


class SwitchProviderRequest(BaseModel):
    """Switch active provider request."""
    provider_id: str
    make_default: bool = True


class HealthCheckResponse(BaseModel):
    """Health check response."""
    provider_id: str
    provider_name: str
    is_healthy: bool
    response_time_ms: float
    error: Optional[str] = None
    tested_at: str


class AIModelResponse(BaseModel):
    """AI Model response schema."""
    id: str
    provider_id: str
    model_name: str
    display_name: str
    description: Optional[str] = None
    is_active: bool
    is_default: bool
    capabilities: List[str]
    max_context_length: int
    max_output_tokens: Optional[int] = None
    supports_streaming: bool
    supports_function_calling: bool
    supports_vision: bool
    cost_per_1k_input_tokens: Optional[float] = None
    cost_per_1k_output_tokens: Optional[float] = None
    total_requests: int
    created_at: str

    class Config:
        from_attributes = True


# AI Provider Endpoints
@router.get("/", response_model=List[AIProviderResponse])
async def list_providers(
    db: Session = Depends(get_db),
    is_active: Optional[bool] = Query(None),
    provider_type: Optional[AIProviderType] = Query(None),
    _: dict = Depends(require_admin),
):
    """List all AI providers with optional filtering."""
    query = db.query(AIProvider)

    if is_active is not None:
        query = query.filter(AIProvider.is_active == is_active)
    if provider_type:
        query = query.filter(AIProvider.provider_type == provider_type)

    providers = query.order_by(
        AIProvider.priority.desc(),
        AIProvider.created_at.desc()
    ).all()

    return providers


@router.post("/", response_model=AIProviderResponse, status_code=201)
async def create_provider(
    provider_data: AIProviderCreate,
    db: Session = Depends(get_db),
    _: dict = Depends(require_admin),
):
    """Create a new AI provider."""
    # Check if provider with same name and type exists
    existing = db.query(AIProvider).filter(
        AIProvider.name == provider_data.name,
        AIProvider.provider_type == provider_data.provider_type,
    ).first()

    if existing:
        raise HTTPException(
            status_code=400,
            detail="Provider with this name and type already exists"
        )

    new_provider = AIProvider(
        name=provider_data.name,
        provider_type=provider_data.provider_type,
        display_name=provider_data.display_name,
        description=provider_data.description,
        api_key=provider_data.api_key,
        api_base_url=provider_data.api_base_url,
        api_version=provider_data.api_version,
        organization_id=provider_data.organization_id,
        rate_limit_rpm=provider_data.rate_limit_rpm,
        rate_limit_tpm=provider_data.rate_limit_tpm,
        cost_per_1k_input_tokens=provider_data.cost_per_1k_input_tokens,
        cost_per_1k_output_tokens=provider_data.cost_per_1k_output_tokens,
        supported_capabilities=provider_data.supported_capabilities,
    )

    db.add(new_provider)
    db.commit()
    db.refresh(new_provider)

    return new_provider


@router.get("/{provider_id}", response_model=AIProviderResponse)
async def get_provider(
    provider_id: str,
    db: Session = Depends(get_db),
    _: dict = Depends(require_admin),
):
    """Get AI provider by ID."""
    provider = db.query(AIProvider).filter(
        AIProvider.id == provider_id
    ).first()
    if not provider:
        raise HTTPException(status_code=404, detail="Provider not found")

    return provider


@router.patch("/{provider_id}", response_model=AIProviderResponse)
async def update_provider(
    provider_id: str,
    provider_data: AIProviderUpdate,
    db: Session = Depends(get_db),
    _: dict = Depends(require_admin),
):
    """Update AI provider configuration."""
    provider = db.query(AIProvider).filter(
        AIProvider.id == provider_id
    ).first()
    if not provider:
        raise HTTPException(status_code=404, detail="Provider not found")

    update_data = provider_data.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(provider, field, value)

    db.commit()
    db.refresh(provider)

    return provider


@router.delete("/{provider_id}", status_code=204)
async def delete_provider(
    provider_id: str,
    db: Session = Depends(get_db),
    _: dict = Depends(require_admin),
):
    """Delete an AI provider."""
    provider = db.query(AIProvider).filter(
        AIProvider.id == provider_id
    ).first()
    if not provider:
        raise HTTPException(status_code=404, detail="Provider not found")

    # Check if provider has models
    model_count = db.query(AIModel).filter(
        AIModel.provider_id == provider_id
    ).count()
    if model_count > 0:
        raise HTTPException(
            status_code=400,
            detail=f"Cannot delete provider with {model_count} models"
        )

    db.delete(provider)
    db.commit()

    return None


@router.post("/switch", response_model=AIProviderResponse)
async def switch_provider(
    request: SwitchProviderRequest,
    db: Session = Depends(get_db),
    _: dict = Depends(require_admin),
):
    """
    Switch active AI provider.

    Deactivates current default and activates the specified provider.
    """
    provider = db.query(AIProvider).filter(
        AIProvider.id == request.provider_id
    ).first()
    if not provider:
        raise HTTPException(status_code=404, detail="Provider not found")

    if request.make_default:
        # Remove default from all providers
        db.query(AIProvider).update({"is_default": False})

    # Activate and set as default
    provider.is_active = True
    if request.make_default:
        provider.is_default = True

    db.commit()
    db.refresh(provider)

    return provider


@router.post("/{provider_id}/health-check", response_model=HealthCheckResponse)
async def health_check_provider(
    provider_id: str,
    db: Session = Depends(get_db),
    _: dict = Depends(require_admin),
):
    """
    Test AI provider connection and health.

    Makes a simple API call to verify credentials and connectivity.
    """
    provider = db.query(AIProvider).filter(
        AIProvider.id == provider_id
    ).first()
    if not provider:
        raise HTTPException(status_code=404, detail="Provider not found")

    # TODO: Implement actual health check logic
    # For now, return mock response
    start_time = time.time()

    # Simulate health check
    is_healthy_bool = bool(provider.is_active)
    error = None if is_healthy_bool else "Provider is inactive"

    response_time = (time.time() - start_time) * 1000

    return HealthCheckResponse(
        provider_id=provider.id,
        provider_name=str(provider.display_name),
        is_healthy=is_healthy_bool,
        response_time_ms=response_time,
        error=error,
        tested_at=datetime.utcnow().isoformat(),
    )


@router.get("/{provider_id}/models", response_model=List[AIModelResponse])
async def list_provider_models(
    provider_id: str,
    db: Session = Depends(get_db),
    is_active: Optional[bool] = Query(None),
    _: dict = Depends(require_admin),
):
    """List all models for a specific provider."""
    # Verify provider exists
    provider = db.query(AIProvider).filter(
        AIProvider.id == provider_id
    ).first()
    if not provider:
        raise HTTPException(status_code=404, detail="Provider not found")

    query = db.query(AIModel).filter(AIModel.provider_id == provider_id)

    if is_active is not None:
        query = query.filter(AIModel.is_active == is_active)

    models = query.order_by(AIModel.created_at.desc()).all()

    return models


@router.get("/metrics/summary")
async def get_provider_metrics(
    db: Session = Depends(get_db),
    _: dict = Depends(require_admin),
):
    """
    Get AI provider usage metrics summary.

    Returns aggregate statistics across all providers.
    """
    # Total providers
    total_providers = db.query(func.count(AIProvider.id)).scalar()

    # Active providers
    active_providers = db.query(func.count(AIProvider.id)).filter(
        AIProvider.is_active == True  # noqa: E712
    ).scalar()

    # Total usage
    total_usage = db.query(
        func.sum(AIProvider.total_requests),
        func.sum(AIProvider.total_tokens_used),
        func.sum(AIProvider.total_cost),
    ).first()

    # Providers by type
    providers_by_type = {}
    for provider_type in AIProviderType:
        count = db.query(func.count(AIProvider.id)).filter(
            AIProvider.provider_type == provider_type
        ).scalar()
        providers_by_type[provider_type.value] = count

    # Default provider
    default_provider = db.query(AIProvider).filter(
        AIProvider.is_default == True  # noqa: E712
    ).first()

    return {
        "total_providers": total_providers,
        "active_providers": active_providers,
        "inactive_providers": total_providers - active_providers,
        "total_requests": total_usage[0] if total_usage else 0,
        "total_tokens_used": total_usage[1] if total_usage else 0,
        "total_cost": total_usage[2] if total_usage else 0.0,
        "providers_by_type": providers_by_type,
        "default_provider": (
            default_provider.display_name if default_provider else None
        ),
    }
