"""
SQLAlchemy ORM models for curriculum database.

Maps to curriculum.sql schema.
Part of PROMPT 57: Base Brain Training & Curriculum Integration.
"""

from datetime import datetime
from typing import List, Optional
from uuid import uuid4

from sqlalchemy import (
    Boolean,
    Column,
    Date,
    DateTime,
    ForeignKey,
    Integer,
    Numeric,
    String,
    Text,
    BigInteger,
    ARRAY,
)
from sqlalchemy.dialects.postgresql import JSONB, UUID, POINT
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship

Base = declarative_base()


class EducationSystem(Base):
    """Education system model (e.g., US K-12, UK Year 1-13)."""

    __tablename__ = "education_systems"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid4)
    name = Column(String(255), nullable=False)
    country_code = Column(String(2), nullable=False, index=True)
    region = Column(String(100))
    description = Column(Text)
    grade_system = Column(String(50))  # K-12, 1-13, etc.
    language_primary = Column(String(10))  # ISO 639-1
    languages_supported = Column(ARRAY(Text))
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    districts = relationship("SchoolDistrict", back_populates="education_system")


class SchoolDistrict(Base):
    """School district model."""

    __tablename__ = "school_districts"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid4)
    education_system_id = Column(UUID(as_uuid=True), ForeignKey("education_systems.id"))

    # Identification
    name = Column(String(500), nullable=False)
    district_code = Column(String(100))

    # Location
    country_code = Column(String(2), nullable=False, index=True)
    state_province = Column(String(100), index=True)
    city = Column(String(255))
    postal_codes = Column(ARRAY(Text), index=True)
    coordinates = Column(POINT)

    # Size & Demographics
    student_count = Column(Integer)
    school_count = Column(Integer)
    languages_spoken = Column(ARRAY(Text))

    # Curriculum Info
    standards_followed = Column(ARRAY(Text))
    curriculum_version = Column(String(50))
    assessment_system = Column(String(100))

    # Contact & Links
    website_url = Column(String(500))
    curriculum_url = Column(String(500))
    contact_email = Column(String(255))

    # Status
    active = Column(Boolean, default=True)

    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    education_system = relationship("EducationSystem", back_populates="districts")
    district_standards = relationship("DistrictStandard", back_populates="district")
    brain_instances = relationship("DistrictBrainInstance", back_populates="district")


class EducationalStandard(Base):
    """Educational standard model (Common Core, State, International, etc.)."""

    __tablename__ = "educational_standards"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid4)

    # Standard Info
    name = Column(String(255), nullable=False)
    code = Column(String(100), unique=True, nullable=False, index=True)
    description = Column(Text, nullable=False)

    # Classification
    standard_type = Column(String(50), nullable=False)  # common_core, state, IB, etc.
    subject = Column(String(100), nullable=False, index=True)
    grade_level = Column(Integer, index=True)  # NULL for cross-grade

    # Hierarchy
    parent_standard_id = Column(
        UUID(as_uuid=True), ForeignKey("educational_standards.id"), index=True
    )
    domain = Column(String(255))
    cluster = Column(String(255))

    # Content
    full_text = Column(Text)
    keywords = Column(ARRAY(Text))
    learning_objectives = Column(JSONB)

    # Difficulty
    complexity_level = Column(String(50))
    cognitive_level = Column(String(50))

    # Regions
    applicable_regions = Column(JSONB)

    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    parent = relationship("EducationalStandard", remote_side=[id], backref="children")
    district_mappings = relationship("DistrictStandard", back_populates="standard")
    curriculum_contents = relationship(
        "CurriculumContent", 
        secondary="curriculum_content_standards",
        back_populates="standards"
    )


class DistrictStandard(Base):
    """Mapping between districts and standards they follow."""

    __tablename__ = "district_standards"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid4)
    district_id = Column(
        UUID(as_uuid=True), ForeignKey("school_districts.id"), nullable=False
    )
    standard_id = Column(
        UUID(as_uuid=True), ForeignKey("educational_standards.id"), nullable=False
    )

    # Adoption info
    adopted_date = Column(Date)
    effective_school_year = Column(String(20))

    # Customization
    district_notes = Column(Text)
    local_modifications = Column(JSONB)
    pacing_guide = Column(JSONB)

    # Priority
    emphasis_level = Column(String(50))  # core, supplemental, optional
    assessment_weight = Column(Numeric(5, 2))

    active = Column(Boolean, default=True)

    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    district = relationship("SchoolDistrict", back_populates="district_standards")
    standard = relationship("EducationalStandard", back_populates="district_mappings")


class CurriculumContent(Base):
    """Curriculum content model (lessons, examples, problems, explanations)."""

    __tablename__ = "curriculum_content"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid4)

    # Classification
    content_type = Column(String(50), nullable=False)
    subject = Column(String(100), nullable=False, index=True)
    grade_level = Column(Integer, nullable=False, index=True)

    # Standards Alignment (array of UUIDs)
    aligned_standards = Column(ARRAY(UUID(as_uuid=True)), nullable=False, index=True)

    # Content
    title = Column(String(500), nullable=False)
    description = Column(Text)
    content_text = Column(Text, nullable=False)
    content_data = Column(JSONB)

    # Metadata
    difficulty_level = Column(String(50))
    estimated_time_minutes = Column(Integer)
    language = Column(String(10), default="en")

    # Teaching Strategy
    teaching_approach = Column(String(100))
    learning_styles = Column(ARRAY(Text))

    # Special Education
    differentiation_notes = Column(Text)
    accommodations_suggested = Column(JSONB)

    # Source
    source_url = Column(String(500))
    source_name = Column(String(255))
    copyright_info = Column(Text)

    # Quality
    reviewed = Column(Boolean, default=False)
    review_score = Column(Numeric(3, 2))

    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class TrainingCorpus(Base):
    """Training data corpus for base brain model training."""

    __tablename__ = "training_corpus"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid4)

    # Classification
    corpus_type = Column(String(50), nullable=False)
    subject = Column(String(100), nullable=False, index=True)
    grade_levels = Column(ARRAY(Integer), nullable=False, index=True)

    # Content
    raw_text = Column(Text, nullable=False)
    processed_text = Column(Text)
    tokens_count = Column(Integer)

    # Standards Alignment
    aligned_standards = Column(ARRAY(UUID(as_uuid=True)))
    topics = Column(ARRAY(Text))

    # Source
    source_type = Column(String(100))
    source_name = Column(String(255))
    source_url = Column(String(500))
    license = Column(String(100))

    # Quality
    quality_score = Column(Numeric(3, 2))
    verified = Column(Boolean, default=False)

    # Regional Relevance
    countries = Column(ARRAY(Text))
    districts = Column(ARRAY(UUID(as_uuid=True)))

    # Processing
    processed = Column(Boolean, default=False, index=True)
    included_in_training = Column(Boolean, default=False, index=True)
    training_batch_id = Column(String(100))

    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class BaseModelVersion(Base):
    """Base AI model versions for brain training."""

    __tablename__ = "base_model_versions"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid4)

    # Version Info
    version = Column(String(50), unique=True, nullable=False)
    name = Column(String(255), nullable=False)
    description = Column(Text)

    # Training Info
    base_model = Column(String(100))  # gpt-4, claude-3, etc.
    training_started_at = Column(DateTime)
    training_completed_at = Column(DateTime)

    # Data Stats
    total_examples = Column(Integer)
    total_tokens = Column(BigInteger)
    curricula_count = Column(Integer)
    standards_covered = Column(Integer)

    # Performance Metrics
    accuracy_score = Column(Numeric(5, 2))
    curriculum_alignment_score = Column(Numeric(5, 2))
    special_ed_optimization = Column(Boolean, default=False)

    # Deployment
    status = Column(String(50))  # training, testing, production, deprecated
    deployed_at = Column(DateTime)

    # Model Artifacts
    model_path = Column(String(500))
    checkpoint_path = Column(String(500))
    config = Column(JSONB)

    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    district_instances = relationship("DistrictBrainInstance", back_populates="base_model")


class DistrictBrainInstance(Base):
    """District-specific brain instances cloned from base model."""

    __tablename__ = "district_brain_instances"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid4)

    # District Info
    district_id = Column(
        UUID(as_uuid=True), ForeignKey("school_districts.id"), index=True
    )
    base_model_version_id = Column(
        UUID(as_uuid=True), ForeignKey("base_model_versions.id")
    )

    # Instance Info
    brain_id = Column(String(255), unique=True, nullable=False)
    status = Column(String(50), default="active", index=True)

    # Curriculum Context
    curriculum_standards = Column(ARRAY(UUID(as_uuid=True)))
    pacing_calendar = Column(JSONB)
    local_terminology = Column(JSONB)

    # Customization
    emphasis_subjects = Column(ARRAY(Text))
    teaching_philosophies = Column(ARRAY(Text))
    assessment_approaches = Column(ARRAY(Text))

    # Performance
    learners_count = Column(Integer, default=0)
    interactions_count = Column(Integer, default=0)
    success_rate = Column(Numeric(5, 2))

    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    district = relationship("SchoolDistrict", back_populates="brain_instances")
    base_model = relationship("BaseModelVersion", back_populates="district_instances")
