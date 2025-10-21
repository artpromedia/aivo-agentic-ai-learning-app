"""IEP schemas for request/response validation."""
from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import date, datetime

from app.models.iep import IEPGoalStatus


class IEPGoalBase(BaseModel):
    """Base IEP goal schema."""
    goal_name: str = Field(..., min_length=1, max_length=500)
    category: str = Field(..., min_length=1, max_length=100)
    current_level: str = Field(..., min_length=1, max_length=255)
    target_level: str = Field(..., min_length=1, max_length=255)
    start_date: date
    target_date: date


class IEPGoalCreate(IEPGoalBase):
    """Schema for creating an IEP goal."""
    goal_description: Optional[str] = None
    accommodations: Optional[List[str]] = None


class IEPGoalUpdate(BaseModel):
    """Schema for updating an IEP goal."""
    goal_name: Optional[str] = Field(None, min_length=1, max_length=500)
    goal_description: Optional[str] = None
    category: Optional[str] = Field(None, min_length=1, max_length=100)
    current_level: Optional[str] = Field(None, min_length=1, max_length=255)
    target_level: Optional[str] = Field(None, min_length=1, max_length=255)
    start_date: Optional[date] = None
    target_date: Optional[date] = None
    progress_percentage: Optional[int] = Field(None, ge=0, le=100)
    status: Optional[IEPGoalStatus] = None
    accommodations: Optional[List[str]] = None


class IEPGoalResponse(IEPGoalBase):
    """Schema for IEP goal response."""
    id: str
    learner_id: str
    goal_description: Optional[str] = None
    progress_percentage: int
    status: IEPGoalStatus
    accommodations: Optional[List[str]] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        orm_mode = True


class IEPDataPointCreate(BaseModel):
    """Schema for creating an IEP data point."""
    value: int = Field(..., ge=0, le=100)
    notes: Optional[str] = None
    recorded_by: str = Field(..., min_length=1, max_length=255)


class IEPDataPointResponse(BaseModel):
    """Schema for IEP data point response."""
    id: str
    goal_id: str
    value: int
    notes: Optional[str] = None
    recorded_by: str
    created_at: datetime
    updated_at: datetime

    class Config:
        orm_mode = True
