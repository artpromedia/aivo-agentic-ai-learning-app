"""Homework schemas for request/response validation."""
from pydantic import BaseModel, Field, validator
from typing import Optional, List, Dict, Any
from datetime import datetime
from enum import Enum


class HomeworkStatus(str, Enum):
    """Homework session status."""
    IN_PROGRESS = "in-progress"
    COMPLETED = "completed"
    ABANDONED = "abandoned"


class HomeworkStep(str, Enum):
    """Homework helper steps."""
    UNDERSTAND = "understand"
    PLAN = "plan"
    SOLVE = "solve"
    CHECK = "check"


class HomeworkInputMethod(str, Enum):
    """Homework input method."""
    PHOTO = "photo"
    DOCUMENT = "document"
    TEXT = "text"
    MULTIPLE = "multiple"


class HomeworkFileUpload(BaseModel):
    """Schema for file upload metadata."""
    filename: str
    content_type: str
    size: int
    
    @validator('size')
    @classmethod
    def validate_size(cls, v):
        max_size = 10 * 1024 * 1024  # 10MB
        if v > max_size:
            raise ValueError(f'File size must not exceed {max_size} bytes')
        return v

    @validator('content_type')
    @classmethod
    def validate_content_type(cls, v):
        allowed = [
            'image/jpeg',
            'image/png',
            'application/pdf',
            'application/msword',
            'application/vnd.openxmlformats-officedocument'
            '.wordprocessingml.document'
        ]
        if v not in allowed:
            types_str = ", ".join(allowed)
            raise ValueError(
                f'Content type must be one of: {types_str}'
            )
        return v


class HomeworkSessionCreate(BaseModel):
    """Schema for creating a homework session."""
    learner_id: str = Field(..., min_length=36, max_length=36)
    title: str = Field(..., min_length=1, max_length=500)
    input_method: HomeworkInputMethod
    original_text: Optional[str] = None
    
    @validator('original_text')
    @classmethod
    def validate_text_if_method(cls, v, values):
        if values.get('input_method') == HomeworkInputMethod.TEXT and not v:
            raise ValueError(
                'original_text is required when input_method is TEXT'
            )
        return v


class HomeworkSessionUpdate(BaseModel):
    """Schema for updating a homework session."""
    title: Optional[str] = Field(None, min_length=1, max_length=500)
    current_step: Optional[HomeworkStep] = None
    status: Optional[HomeworkStatus] = None
    settings: Optional[Dict[str, Any]] = None


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
    
    class Config:
        from_attributes = True


class WorkProductCreate(BaseModel):
    """Schema for creating work product."""
    session_id: str
    step: HomeworkStep
    work_type: str = Field(..., pattern=r'^(drawing|text|equation|diagram)$')
    content: str  # JSON or data URL
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
    
    class Config:
        from_attributes = True


class HomeworkSessionResponse(BaseModel):
    """Schema for homework session response."""
    id: str
    learner_id: str
    title: str
    status: HomeworkStatus
    input_method: str
    original_text: Optional[str] = None
    detected_subject: Optional[str] = None
    detected_grade: Optional[str] = None
    target_level: Optional[str] = None
    difficulty_adjustment: Optional[str] = None
    extracted_content: Optional[Dict[str, Any]] = None
    problem_statement: str
    key_questions: Optional[List[str]] = None
    current_step: HomeworkStep
    completed_steps: Optional[List[str]] = None
    settings: Optional[Dict[str, Any]] = None
    hints_given: int
    explanations_provided: Optional[List[str]] = None
    scaffolding_level: str
    files: List[HomeworkFileResponse] = []
    work_products: List[WorkProductResponse] = []
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True


class HintRequest(BaseModel):
    """Schema for requesting a hint."""
    session_id: str
    student_question: Optional[str] = None


class HintResponse(BaseModel):
    """Schema for hint response."""
    hint: str
    hints_remaining: int


class ExplanationRequest(BaseModel):
    """Schema for requesting an explanation."""
    session_id: str
    step: HomeworkStep
    specific_question: Optional[str] = None


class ExplanationResponse(BaseModel):
    """Schema for explanation response."""
    explanation: str
    additional_resources: Optional[List[Dict[str, str]]] = None
