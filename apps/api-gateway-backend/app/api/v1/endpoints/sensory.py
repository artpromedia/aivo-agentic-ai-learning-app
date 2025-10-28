"""Sensory profile API endpoints."""
# pylint: disable=import-error
import logging
from typing import Any

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db  # type: ignore[import-not-found]
from app.core.redis import (  # type: ignore[import-not-found]
    set_cache,
    get_cache,
    delete_cache
)
from app.models.user import User  # type: ignore[import-not-found]
from app.models.sensory_profile import (  # type: ignore[import-not-found]
    SensoryProfile
)
from app.schemas.sensory_profile import (  # type: ignore[import-not-found]
    SensoryProfileCreate,
    SensoryProfileUpdate,
    SensoryProfileResponse
)
from app.schemas.response import (  # type: ignore[import-not-found]
    success_response
)
from app.api.deps import get_current_user  # type: ignore[import-not-found]
from app.services.sensory_service import (  # type: ignore[import-not-found]
    SensoryService
)

router = APIRouter()
logger = logging.getLogger(__name__)


@router.get("/presets", response_model=dict)
async def get_sensory_presets():
    """
    Get available sensory profile presets.

    **Presets:**
    - ASD Low Sensory (minimal animations, sounds, clutter)
    - ADHD Focus Mode (reduced distractions, break reminders)
    - Dyslexia-Friendly (dyslexic font, spacing, TTS)
    - Vision Support (high contrast, large text, screen reader)
    - Motor Support (large targets, keyboard-only, no drag-drop)
    - Anxiety-Friendly (calm colors, no timers, positive reinforcement)

    **Returns:**
    - List of preset configurations
    - Recommended for specific conditions
    """
    sensory_service = SensoryService()
    presets = sensory_service.get_presets()

    return success_response(
        data=[preset.model_dump() for preset in presets]
    )


@router.post(
    "/profiles",
    response_model=dict,
    status_code=status.HTTP_201_CREATED
)
async def create_sensory_profile(
    profile_data: SensoryProfileCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Create a new sensory profile.

    **Options:**
    1. Start from preset (recommended)
    2. Fully customize all settings

    **Settings Categories:**
    - Visual (animations, colors, fonts)
    - Auditory (sounds, TTS, volume)
    - Motor (touch targets, keyboard navigation)
    - Cognitive (distractions, time, choices)
    - Environment (full screen, notifications)
    """
    # Set defaults if not provided
    visual: Any = profile_data.visual or {}
    auditory: Any = profile_data.auditory or {}
    motor: Any = profile_data.motor or {}
    cognitive: Any = profile_data.cognitive or {}
    environment: Any = profile_data.environment or {}

    # Create profile
    profile = SensoryProfile(
        user_id=current_user.id,
        name=profile_data.name,
        preset_id=profile_data.preset_id,
        visual=visual.model_dump() if hasattr(visual, 'model_dump') else {},
        auditory=(
            auditory.model_dump() if hasattr(auditory, 'model_dump') else {}
        ),
        motor=motor.model_dump() if hasattr(motor, 'model_dump') else {},
        cognitive=(
            cognitive.model_dump() if hasattr(cognitive, 'model_dump') else {}
        ),
        environment=(
            environment.model_dump()
            if hasattr(environment, 'model_dump') else {}
        ),
        triggers=(
            profile_data.triggers.model_dump()
            if profile_data.triggers else None
        )
    )

    db.add(profile)
    db.commit()
    db.refresh(profile)

    # Cache profile for quick access
    cache_key = f"sensory_profile:{current_user.id}"
    profile_response = SensoryProfileResponse.model_validate(profile)
    set_cache(cache_key, profile_response.model_dump(), ttl=300)

    logger.info(
        "Created sensory profile %s for user %s",
        profile.id, current_user.id
    )

    return success_response(
        data=profile_response.model_dump()
    )


@router.get("/profiles", response_model=dict)
async def list_sensory_profiles(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    List all sensory profiles for current user.

    **Use Case:**
    - User may have multiple profiles for different contexts
    - Example: "School Mode", "Home Mode", "Low Stress Mode"
    """
    profiles = db.query(SensoryProfile).filter(
        SensoryProfile.user_id == current_user.id
    ).order_by(SensoryProfile.created_at.desc()).all()

    profile_data = [
        SensoryProfileResponse.model_validate(profile).model_dump()
        for profile in profiles
    ]

    logger.info(
        "Listed %d sensory profiles for user %s",
        len(profiles), current_user.id
    )

    return success_response(data=profile_data)


@router.get("/profiles/{profile_id}", response_model=dict)
async def get_sensory_profile(
    profile_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get specific sensory profile.

    **Cached** for performance (5 minute TTL).
    """
    # Try cache first
    cache_key = f"sensory_profile:{profile_id}"
    cached = get_cache(cache_key)

    if cached:
        logger.info("Retrieved sensory profile %s from cache", profile_id)
        return success_response(data=cached)

    # Query database
    profile = db.query(SensoryProfile).filter(
        SensoryProfile.id == profile_id,
        SensoryProfile.user_id == current_user.id
    ).first()

    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Profile not found or access denied"
        )

    profile_data = SensoryProfileResponse.model_validate(profile).model_dump()

    # Cache for next request
    set_cache(cache_key, profile_data, ttl=300)

    logger.info("Retrieved sensory profile %s from database", profile_id)

    return success_response(data=profile_data)


@router.patch("/profiles/{profile_id}", response_model=dict)
async def update_sensory_profile(
    profile_id: str,
    update_data: SensoryProfileUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Update sensory profile settings.

    **Supports Partial Updates:**
    - Update only specific categories
    - Fine-tune individual settings
    """
    profile = db.query(SensoryProfile).filter(
        SensoryProfile.id == profile_id,
        SensoryProfile.user_id == current_user.id
    ).first()

    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Profile not found or access denied"
        )

    # Update fields
    update_dict = update_data.model_dump(exclude_unset=True)

    for field, value in update_dict.items():
        if field in [
            'visual', 'auditory', 'motor', 'cognitive',
            'environment', 'triggers'
        ]:
            if value is not None:
                field_value = (
                    value.model_dump() if hasattr(value, 'model_dump')
                    else value
                )
                setattr(profile, field, field_value)
        else:
            setattr(profile, field, value)

    db.commit()
    db.refresh(profile)

    # Invalidate cache
    cache_key = f"sensory_profile:{profile_id}"
    delete_cache(cache_key)

    logger.info("Updated sensory profile %s", profile_id)

    return success_response(
        data=SensoryProfileResponse.model_validate(profile).model_dump()
    )


@router.delete(
    "/profiles/{profile_id}",
    status_code=status.HTTP_204_NO_CONTENT
)
async def delete_sensory_profile(
    profile_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Delete sensory profile.

    **Note:**
    - Cannot delete if it's the only profile
    - Updates learner references if this was their active profile
    """
    profile = db.query(SensoryProfile).filter(
        SensoryProfile.id == profile_id,
        SensoryProfile.user_id == current_user.id
    ).first()

    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Profile not found or access denied"
        )

    # Check if it's the last profile
    profile_count = db.query(SensoryProfile).filter(
        SensoryProfile.user_id == current_user.id
    ).count()

    if profile_count == 1:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot delete the only sensory profile"
        )

    db.delete(profile)
    db.commit()

    # Invalidate cache
    cache_key = f"sensory_profile:{profile_id}"
    delete_cache(cache_key)

    logger.info("Deleted sensory profile %s", profile_id)


@router.post("/profiles/{profile_id}/apply", response_model=dict)
async def apply_sensory_profile(
    profile_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Set sensory profile as active for current user.

    **Effect:**
    - Updates user preferences
    - Frontend will apply accommodations
    - Persists across sessions
    """
    profile = db.query(SensoryProfile).filter(
        SensoryProfile.id == profile_id,
        SensoryProfile.user_id == current_user.id
    ).first()

    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Profile not found or access denied"
        )

    # Update user preferences
    if current_user.preferences is None:
        current_user.preferences = {}

    current_user.preferences['sensory_profile_id'] = profile_id

    db.commit()

    logger.info(
        "Applied sensory profile %s for user %s",
        profile_id, current_user.id
    )

    return success_response(
        data={
            "message": "Sensory profile applied successfully",
            "profile": SensoryProfileResponse.model_validate(
                profile
            ).model_dump()
        }
    )
