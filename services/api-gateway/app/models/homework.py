"""Homework helper models."""
from sqlalchemy import Column, String, Integer, ForeignKey, Enum as SQLEnum, JSON, Text, Boolean
from sqlalchemy.orm import relationship
import enum

from app.models.base import BaseModel


class HomeworkStatus(str, enum.Enum):
    """Homework session status."""
    IN_PROGRESS = "in-progress"
    COMPLETED = "completed"
    ABANDONED = "abandoned"


class HomeworkStep(str, enum.Enum):
    """Homework helper steps."""
    UNDERSTAND = "understand"
    PLAN = "plan"
    SOLVE = "solve"
    CHECK = "check"


class HomeworkSession(BaseModel):
    """Homework helper session."""
    __tablename__ = "homework_sessions"

    # Foreign Keys
    learner_id = Column(String(36), ForeignKey("learners.id"), nullable=False, index=True)
    
    # Basic Info
    title = Column(String(500), nullable=False)
    status = Column(SQLEnum(HomeworkStatus), default=HomeworkStatus.IN_PROGRESS, nullable=False)
    
    # Input
    input_method = Column(String(50), nullable=False)  # photo | document | text
    original_text = Column(Text, nullable=True)
    
    # Analysis
    detected_subject = Column(String(100), nullable=True)
    detected_grade = Column(String(50), nullable=True)
    target_level = Column(String(50), nullable=True)
    difficulty_adjustment = Column(String(50), nullable=True)  # none | simplified | scaffolded
    
    # Content
    extracted_content = Column(JSON, nullable=True)
    problem_statement = Column(Text, nullable=False)
    key_questions = Column(JSON, nullable=True)  # Array of strings
    
    # Progress
    current_step = Column(SQLEnum(HomeworkStep), default=HomeworkStep.UNDERSTAND, nullable=False)
    completed_steps = Column(JSON, nullable=True)  # Array of step names
    
    # Settings
    settings = Column(JSON, nullable=True)
    # Example: {
    #   "read_aloud": true,
    #   "parent_assist_mode": false,
    #   "show_hints": true,
    #   "allow_calculator": true
    # }
    
    # AI Assistance
    hints_given = Column(Integer, default=0, nullable=False)
    explanations_provided = Column(JSON, nullable=True)  # Array of explanation texts
    scaffolding_level = Column(String(50), default="moderate", nullable=False)
    
    # Relationships
    learner = relationship("Learner", back_populates="homework_sessions")
    files = relationship("HomeworkFile", back_populates="session", cascade="all, delete-orphan")
    work_products = relationship("WorkProduct", back_populates="session", cascade="all, delete-orphan")
    
    def __repr__(self):
        return f"<HomeworkSession {self.title} - {self.status}>"


class HomeworkFile(BaseModel):
    """Uploaded homework file."""
    __tablename__ = "homework_files"

    # Foreign Keys
    session_id = Column(String(36), ForeignKey("homework_sessions.id"), nullable=False, index=True)
    
    # File Info
    filename = Column(String(500), nullable=False)
    file_type = Column(String(50), nullable=False)  # image/jpeg, application/pdf, etc.
    file_size = Column(Integer, nullable=False)
    file_url = Column(String(1000), nullable=False)
    
    # OCR Processing
    ocr_status = Column(String(50), default="pending", nullable=False)
    extracted_text = Column(Text, nullable=True)
    ocr_confidence = Column(Integer, nullable=True)  # 0-100
    
    # Relationships
    session = relationship("HomeworkSession", back_populates="files")
    
    def __repr__(self):
        return f"<HomeworkFile {self.filename}>"


class WorkProduct(BaseModel):
    """Student work product (drawing, text, etc.)."""
    __tablename__ = "work_products"

    # Foreign Keys
    session_id = Column(String(36), ForeignKey("homework_sessions.id"), nullable=False, index=True)
    
    # Work Info
    step = Column(SQLEnum(HomeworkStep), nullable=False)
    work_type = Column(String(50), nullable=False)  # drawing | text | equation | diagram
    content = Column(Text, nullable=False)  # JSON or data URL
    feedback = Column(Text, nullable=True)
    
    # Relationships
    session = relationship("HomeworkSession", back_populates="work_products")
    
    def __repr__(self):
        return f"<WorkProduct {self.work_type} for {self.step}>"
