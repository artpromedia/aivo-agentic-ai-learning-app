"""
Feature Flags API Endpoints
For managing feature rollouts and A/B testing
"""
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from app.api.deps import require_admin
from app.core.database import get_db
from app.models.feature_flag import FeatureFlag

router = APIRouter()


# Pydantic schemas


class FeatureFlagCreate(BaseModel):
    key: str = Field(..., max_length=100)
    name: str = Field(..., max_length=200)
    description: Optional[str] = None
    enabled: bool = False
    rollout_percentage: float = Field(0.0, ge=0, le=100)
    target_roles: Optional[List[str]] = None
    target_districts: Optional[List[str]] = None
    target_users: Optional[List[str]] = None
    environment: str = "production"
    tags: Optional[List[str]] = None


class FeatureFlagUpdate(BaseModel):
    name: Optional[str] = Field(None, max_length=200)
    description: Optional[str] = None
    enabled: Optional[bool] = None
    rollout_percentage: Optional[float] = Field(None, ge=0, le=100)
    target_roles: Optional[List[str]] = None
    target_districts: Optional[List[str]] = None
    target_users: Optional[List[str]] = None
    environment: Optional[str] = None
    tags: Optional[List[str]] = None


class FeatureFlagResponse(BaseModel):
    id: int
    key: str
    name: str
    description: Optional[str]
    enabled: bool
    rollout_percentage: float
    target_roles: Optional[List[str]]
    target_districts: Optional[List[str]]
    target_users: Optional[List[str]]
    environment: str
    tags: Optional[List[str]]
    created_by: Optional[str]
    created_at: str
    updated_at: str

    class Config:
        from_attributes = True


# API Endpoints

@router.get(
    "/",
    response_model=List[FeatureFlagResponse],
    summary="List all feature flags"
)
async def list_feature_flags(
    environment: Optional[str] = Query(
        None,
        description="Filter by environment"
    ),
    enabled: Optional[bool] = Query(None, description="Filter by enabled"),
    db: Session = Depends(get_db),
    _: dict = Depends(require_admin)
):
    """Get all feature flags with optional filtering."""
    query = db.query(FeatureFlag)
    
    if environment:
        query = query.filter(FeatureFlag.environment == environment)
    if enabled is not None:
        query = query.filter(FeatureFlag.enabled == enabled)
    
    flags = query.order_by(FeatureFlag.name).all()
    return flags


@router.post(
    "/",
    response_model=FeatureFlagResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create a new feature flag"
)
async def create_feature_flag(
    flag_data: FeatureFlagCreate,
    db: Session = Depends(get_db),
    admin: dict = Depends(require_admin)
):
    """Create a new feature flag."""
    # Check if key already exists
    existing = db.query(FeatureFlag).filter(
        FeatureFlag.key == flag_data.key
    ).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Feature flag with key '{flag_data.key}' already exists"
        )
    
    flag = FeatureFlag(
        **flag_data.model_dump(),
        created_by=admin.get("email", "unknown")
    )
    db.add(flag)
    db.commit()
    db.refresh(flag)
    
    return flag


@router.get(
    "/{flag_id}",
    response_model=FeatureFlagResponse,
    summary="Get a feature flag by ID"
)
async def get_feature_flag(
    flag_id: int,
    db: Session = Depends(get_db),
    _: dict = Depends(require_admin)
):
    """Get a specific feature flag."""
    flag = db.query(FeatureFlag).filter(FeatureFlag.id == flag_id).first()
    if not flag:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Feature flag not found"
        )
    return flag


@router.patch(
    "/{flag_id}",
    response_model=FeatureFlagResponse,
    summary="Update a feature flag"
)
async def update_feature_flag(
    flag_id: int,
    flag_data: FeatureFlagUpdate,
    db: Session = Depends(get_db),
    _: dict = Depends(require_admin)
):
    """Update a feature flag."""
    flag = db.query(FeatureFlag).filter(FeatureFlag.id == flag_id).first()
    if not flag:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Feature flag not found"
        )
    
    # Update only provided fields
    update_data = flag_data.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(flag, key, value)
    
    db.commit()
    db.refresh(flag)
    
    return flag


@router.delete(
    "/{flag_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Delete a feature flag"
)
async def delete_feature_flag(
    flag_id: int,
    db: Session = Depends(get_db),
    _: dict = Depends(require_admin)
):
    """Delete a feature flag."""
    flag = db.query(FeatureFlag).filter(FeatureFlag.id == flag_id).first()
    if not flag:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Feature flag not found"
        )
    
    db.delete(flag)
    db.commit()
    
    return None


@router.post(
    "/{flag_id}/toggle",
    response_model=FeatureFlagResponse,
    summary="Toggle a feature flag on/off"
)
async def toggle_feature_flag(
    flag_id: int,
    db: Session = Depends(get_db),
    _: dict = Depends(require_admin)
):
    """Toggle a feature flag enabled state."""
    flag = db.query(FeatureFlag).filter(FeatureFlag.id == flag_id).first()
    if not flag:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Feature flag not found"
        )
    
    flag.enabled = not flag.enabled
    db.commit()
    db.refresh(flag)
    
    return flag


@router.get(
    "/check/{key}",
    summary="Check if a feature flag is enabled"
)
async def check_feature_flag(
    key: str,
    user_id: Optional[str] = Query(None),
    district_id: Optional[str] = Query(None),
    role: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    """
    Check if a feature flag is enabled for a specific user/context.
    
    This endpoint is public (no auth required) for client-side checks.
    """
    flag = db.query(FeatureFlag).filter(
        FeatureFlag.key == key
    ).first()
    
    if not flag or not flag.enabled:
        return {"enabled": False, "key": key}
    
    # Check targeting rules
    if flag.target_users and user_id:
        if user_id not in flag.target_users:
            return {"enabled": False, "key": key, "reason": "user_not_targeted"}
    
    if flag.target_districts and district_id:
        if district_id not in flag.target_districts:
            return {
                "enabled": False,
                "key": key,
                "reason": "district_not_targeted"
            }
    
    if flag.target_roles and role:
        if role not in flag.target_roles:
            return {"enabled": False, "key": key, "reason": "role_not_targeted"}
    
    # Check rollout percentage (simple hash-based rollout)
    if flag.rollout_percentage < 100 and user_id:
        user_hash = hash(user_id) % 100
        if user_hash >= flag.rollout_percentage:
            return {"enabled": False, "key": key, "reason": "rollout_percentage"}
    
    return {"enabled": True, "key": key}
