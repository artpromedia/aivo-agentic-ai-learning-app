"""Homework schemas for request/response validation."""
from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime

from app.models.homework import HomeworkStatus, HomeworkStep


class HomeworkSessionBase(BaseModel):
    """Base homework session schema."""
    title: str = Field(..., min_length=1, max_length=500)
    input_method: str = Field(..., regex="^(photo|document|text)$")
    problem_statement: str


class HomeworkSessionCreate(HomeworkSessionBase):
    """Schema for creating a homework session."""
    original_text: Optional[str] = None
    settings: Optional[Dict[str, Any]] = None


class HomeworkSessionUpdate(BaseModel):
    """Schema for updating a homework session."""
    status: Optional[HomeworkStatus] = None
    current_step: Optional[HomeworkStep] = None
    detected_subject: Optional[str] = None
    detected_grade: Optional[str] = None
    target_level: Optional[str] = None
    difficulty_adjustment: Optional[str] = None
    extracted_content: Optional[Dict[str, Any]] = None
    key_questions: Optional[List[str]] = None
    completed_steps: Optional[List[str]] = None
    settings: Optional[Dict[str, Any]] = None
    hints_given: Optional[int] = None
    explanations_provided: Optional[List[str]] = None
    scaffolding_level: Optional[str] = None


class HomeworkSessionResponse(HomeworkSessionBase):
    """Schema for homework session response."""
    id: str
    learner_id: str
    status: HomeworkStatus
    input_method: str
    original_text: Optional[str] = None
    detected_subject: Optional[str] = None
    detected_grade: Optional[str] = None
    target_level: Optional[str] = None
    difficulty_adjustment: Optional[str] = None
    extracted_content: Optional[Dict[str, Any]] = None
    key_questions: Optional[List[str]] = None
    current_step: HomeworkStep
    completed_steps: Optional[List[str]] = None
    settings: Optional[Dict[str, Any]] = None
    hints_given: int
    explanations_provided: Optional[List[str]] = None
    scaffolding_level: str
    created_at: datetime
    updated_at: datetime

    class Config:
        orm_mode = True


class HomeworkFileCreate(BaseModel):
    """Schema for creating a homework file."""
    filename: str = Field(..., min_length=1, max_length=500)
    file_type: str
    file_size: int = Field(..., gt=0)
    file_url: str = Field(..., min_length=1, max_length=1000)


class HomeworkFileResponse(BaseModel):
    """Schema for homework file response."""
    id: str
    session_id: str
    filename: str
    file_type: str
    file_size: int
    file_url: str
    ocr_status: str
    extracted_text: Optional[str] = None
    ocr_confidence: Optional[int] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        orm_mode = True


class WorkProductCreate(BaseModel):
    """Schema for creating a work product."""
    step: HomeworkStep
    work_type: str = Field(..., min_length=1, max_length=50)
    content: str
    feedback: Optional[str] = None


class WorkProductResponse(BaseModel):
    """Schema for work product response."""
    id: str
    session_id: str
    step: HomeworkStep
    work_type: str
    content: str
    feedback: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        orm_mode = True
