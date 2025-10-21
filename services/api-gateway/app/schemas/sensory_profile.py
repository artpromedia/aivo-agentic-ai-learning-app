"""Sensory profile schemas for request/response validation."""
from pydantic import BaseModel, Field
from typing import Optional, Dict, Any
from datetime import datetime


class SensoryProfileBase(BaseModel):
    """Base sensory profile schema."""
    visual: Dict[str, Any]
    auditory: Dict[str, Any]
    motor: Dict[str, Any]
    cognitive: Dict[str, Any]
    environment: Dict[str, Any]


class SensoryProfileCreate(SensoryProfileBase):
    """Schema for creating a sensory profile."""
    name: Optional[str] = Field(None, max_length=255)
    preset_id: Optional[str] = Field(None, max_length=100)
    triggers: Optional[Dict[str, Any]] = None


class SensoryProfileUpdate(BaseModel):
    """Schema for updating a sensory profile."""
    name: Optional[str] = Field(None, max_length=255)
    preset_id: Optional[str] = Field(None, max_length=100)
    visual: Optional[Dict[str, Any]] = None
    auditory: Optional[Dict[str, Any]] = None
    motor: Optional[Dict[str, Any]] = None
    cognitive: Optional[Dict[str, Any]] = None
    environment: Optional[Dict[str, Any]] = None
    triggers: Optional[Dict[str, Any]] = None


class SensoryProfileResponse(SensoryProfileBase):
    """Schema for sensory profile response."""
    id: str
    user_id: str
    name: Optional[str] = None
    preset_id: Optional[str] = None
    triggers: Optional[Dict[str, Any]] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        orm_mode = True
