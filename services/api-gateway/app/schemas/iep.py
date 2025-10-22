"""IEP schemas for request/response validation."""
from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import date, datetime
from enum import Enum


class IEPGoalStatus(str, Enum):
    """IEP goal status."""
    ON_TRACK = "on-track"
    NEEDS_ATTENTION = "needs-attention"
    EXCEEDING = "exceeding"
    NOT_STARTED = "not-started"


class IEPGoalCreate(BaseModel):
    """Schema for creating IEP goal."""
    learner_id: str = Field(..., min_length=36, max_length=36)
    goal_name: str = Field(..., min_length=1, max_length=500)
    goal_description: Optional[str] = None
    category: str = Field(
        ...,
        pattern=r'^(reading|math|social|motor|communication)$'
    )
    current_level: str = Field(..., min_length=1, max_length=255)
    target_level: str = Field(..., min_length=1, max_length=255)
    start_date: date
    target_date: date
    accommodations: Optional[List[str]] = None


class IEPGoalUpdate(BaseModel):
    """Schema for updating IEP goal."""
    goal_name: Optional[str] = Field(None, min_length=1, max_length=500)
    goal_description: Optional[str] = None
    current_level: Optional[str] = None
    target_level: Optional[str] = None
    target_date: Optional[date] = None
    progress_percentage: Optional[int] = Field(None, ge=0, le=100)
    status: Optional[IEPGoalStatus] = None
    accommodations: Optional[List[str]] = None


class IEPDataPointCreate(BaseModel):
    """Schema for creating data point."""
    goal_id: str
    value: int = Field(..., ge=0, le=100)
    notes: Optional[str] = None
    recorded_by: str


class IEPDataPointResponse(BaseModel):
    """Schema for data point response."""
    id: str
    goal_id: str
    value: int
    notes: Optional[str] = None
    recorded_by: str
    created_at: datetime
    
    class Config:
        from_attributes = True


class IEPGoalResponse(BaseModel):
    """Schema for IEP goal response."""
    id: str
    learner_id: str
    goal_name: str
    goal_description: Optional[str] = None
    category: str
    current_level: str
    target_level: str
    start_date: date
    target_date: date
    progress_percentage: int
    status: IEPGoalStatus
    accommodations: Optional[List[str]] = None
    data_points: List[IEPDataPointResponse] = []
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True
