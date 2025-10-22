-- ========================================
-- AIVO CURRICULUM DATABASE SCHEMA
-- Part of PROMPT 57: Base Brain Training & Curriculum Integration
-- ========================================

-- ========================================
-- EDUCATION SYSTEMS & REGIONS
-- ========================================

CREATE TABLE education_systems (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    country_code VARCHAR(2) NOT NULL, -- ISO 3166-1 alpha-2
    region VARCHAR(100),
    description TEXT,
    grade_system VARCHAR(50), -- K-12, 1-13, etc.
    language_primary VARCHAR(10), -- ISO 639-1
    languages_supported TEXT[], -- Additional languages
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_education_systems_country ON education_systems(country_code);

-- Example data:
-- US: K-12 system, grades Kindergarten through 12
-- UK: Year 1-13 system
-- Australia: Foundation-Year 12
-- China: Grade 1-12
-- India: Class 1-12


-- ========================================
-- SCHOOL DISTRICTS
-- ========================================

CREATE TABLE school_districts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    education_system_id UUID REFERENCES education_systems(id),
    
    -- Identification
    name VARCHAR(500) NOT NULL,
    district_code VARCHAR(100), -- Official code/ID
    
    -- Location
    country_code VARCHAR(2) NOT NULL,
    state_province VARCHAR(100),
    city VARCHAR(255),
    postal_codes TEXT[], -- Array of zip/postal codes
    coordinates POINT, -- Lat/long for geocoding
    
    -- Size & Demographics
    student_count INTEGER,
    school_count INTEGER,
    languages_spoken TEXT[],
    
    -- Curriculum Info
    standards_followed TEXT[], -- e.g., ["Common Core", "NGSS"]
    curriculum_version VARCHAR(50),
    assessment_system VARCHAR(100),
    
    -- Contact & Links
    website_url VARCHAR(500),
    curriculum_url VARCHAR(500),
    contact_email VARCHAR(255),
    
    -- Status
    active BOOLEAN DEFAULT true,
    
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_districts_country ON school_districts(country_code);
CREATE INDEX idx_districts_state ON school_districts(state_province);
CREATE INDEX idx_districts_postal ON school_districts USING GIN(postal_codes);


-- ========================================
-- EDUCATIONAL STANDARDS
-- ========================================

CREATE TABLE educational_standards (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Standard Info
    name VARCHAR(255) NOT NULL,
    code VARCHAR(100) UNIQUE NOT NULL, -- e.g., "CCSS.MATH.6.RP.A.1"
    description TEXT NOT NULL,
    
    -- Classification
    standard_type VARCHAR(50) NOT NULL, -- common_core, state, district, IB, etc.
    subject VARCHAR(100) NOT NULL, -- Math, ELA, Science, etc.
    grade_level INTEGER, -- NULL for cross-grade
    
    -- Hierarchy
    parent_standard_id UUID REFERENCES educational_standards(id),
    domain VARCHAR(255), -- e.g., "Ratios and Proportional Relationships"
    cluster VARCHAR(255), -- e.g., "Understand ratio concepts"
    
    -- Content
    full_text TEXT,
    keywords TEXT[],
    learning_objectives JSONB,
    
    -- Difficulty
    complexity_level VARCHAR(50), -- basic, intermediate, advanced
    cognitive_level VARCHAR(50), -- remember, understand, apply, analyze, evaluate, create
    
    -- Regions where this standard applies
    applicable_regions JSONB, -- {"countries": ["US"], "states": ["CA", "NY"]}
    
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_standards_code ON educational_standards(code);
CREATE INDEX idx_standards_subject ON educational_standards(subject);
CREATE INDEX idx_standards_grade ON educational_standards(grade_level);
CREATE INDEX idx_standards_parent ON educational_standards(parent_standard_id);


-- ========================================
-- DISTRICT STANDARDS MAPPING
-- ========================================

CREATE TABLE district_standards (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    district_id UUID REFERENCES school_districts(id),
    standard_id UUID REFERENCES educational_standards(id),
    
    -- Adoption info
    adopted_date DATE,
    effective_school_year VARCHAR(20), -- e.g., "2024-2025"
    
    -- Customization
    district_notes TEXT,
    local_modifications JSONB,
    pacing_guide JSONB, -- When this standard is taught
    
    -- Priority
    emphasis_level VARCHAR(50), -- core, supplemental, optional
    assessment_weight DECIMAL(5,2), -- Percentage on assessments
    
    active BOOLEAN DEFAULT true,
    
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    
    UNIQUE(district_id, standard_id)
);


-- ========================================
-- CURRICULUM CONTENT
-- ========================================

CREATE TABLE curriculum_content (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Classification
    content_type VARCHAR(50) NOT NULL, -- lesson, example, problem, explanation
    subject VARCHAR(100) NOT NULL,
    grade_level INTEGER NOT NULL,
    
    -- Standards Alignment
    aligned_standards UUID[] NOT NULL, -- Array of standard IDs
    
    -- Content
    title VARCHAR(500) NOT NULL,
    description TEXT,
    content_text TEXT NOT NULL,
    content_data JSONB, -- Structured content (equations, diagrams, etc.)
    
    -- Metadata
    difficulty_level VARCHAR(50),
    estimated_time_minutes INTEGER,
    language VARCHAR(10) DEFAULT 'en',
    
    -- Teaching Strategy
    teaching_approach VARCHAR(100), -- direct, inquiry, project-based, etc.
    learning_styles TEXT[], -- visual, auditory, kinesthetic
    
    -- Special Education
    differentiation_notes TEXT,
    accommodations_suggested JSONB,
    
    -- Source
    source_url VARCHAR(500),
    source_name VARCHAR(255),
    copyright_info TEXT,
    
    -- Quality
    reviewed BOOLEAN DEFAULT false,
    review_score DECIMAL(3,2),
    
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_curriculum_subject ON curriculum_content(subject);
CREATE INDEX idx_curriculum_grade ON curriculum_content(grade_level);
CREATE INDEX idx_curriculum_standards ON curriculum_content USING GIN(aligned_standards);


-- ========================================
-- TRAINING DATA CORPUS
-- ========================================

CREATE TABLE training_corpus (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Classification
    corpus_type VARCHAR(50) NOT NULL, -- textbook, worksheet, assessment, explanation
    subject VARCHAR(100) NOT NULL,
    grade_levels INTEGER[] NOT NULL,
    
    -- Content
    raw_text TEXT NOT NULL,
    processed_text TEXT,
    tokens_count INTEGER,
    
    -- Standards Alignment
    aligned_standards UUID[],
    topics TEXT[],
    
    -- Source
    source_type VARCHAR(100), -- government, publisher, open_source, teacher_created
    source_name VARCHAR(255),
    source_url VARCHAR(500),
    license VARCHAR(100),
    
    -- Quality
    quality_score DECIMAL(3,2),
    verified BOOLEAN DEFAULT false,
    
    -- Regional Relevance
    countries TEXT[],
    districts UUID[], -- Specific districts this is relevant to
    
    -- Processing
    processed BOOLEAN DEFAULT false,
    included_in_training BOOLEAN DEFAULT false,
    training_batch_id VARCHAR(100),
    
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_training_subject ON training_corpus(subject);
CREATE INDEX idx_training_grades ON training_corpus USING GIN(grade_levels);
CREATE INDEX idx_training_processed ON training_corpus(processed, included_in_training);


-- ========================================
-- MODEL VERSIONS
-- ========================================

CREATE TABLE base_model_versions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Version Info
    version VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    
    -- Training Info
    base_model VARCHAR(100), -- gpt-4, claude-3, gemini-pro
    training_started_at TIMESTAMP,
    training_completed_at TIMESTAMP,
    
    -- Data Stats
    total_examples INTEGER,
    total_tokens BIGINT,
    curricula_count INTEGER, -- How many districts/regions
    standards_covered INTEGER,
    
    -- Performance Metrics
    accuracy_score DECIMAL(5,2),
    curriculum_alignment_score DECIMAL(5,2),
    special_ed_optimization BOOLEAN DEFAULT false,
    
    -- Deployment
    status VARCHAR(50), -- training, testing, production, deprecated
    deployed_at TIMESTAMP,
    
    -- Model Artifacts
    model_path VARCHAR(500),
    checkpoint_path VARCHAR(500),
    config JSONB,
    
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);


-- ========================================
-- DISTRICT BRAIN INSTANCES
-- ========================================

CREATE TABLE district_brain_instances (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- District Info
    district_id UUID REFERENCES school_districts(id),
    base_model_version_id UUID REFERENCES base_model_versions(id),
    
    -- Instance Info
    brain_id VARCHAR(255) NOT NULL UNIQUE,
    status VARCHAR(50) DEFAULT 'active',
    
    -- Curriculum Context
    curriculum_standards UUID[], -- Array of standard IDs for this district
    pacing_calendar JSONB, -- When standards are taught
    local_terminology JSONB, -- District-specific terms
    
    -- Customization
    emphasis_subjects TEXT[],
    teaching_philosophies TEXT[],
    assessment_approaches TEXT[],
    
    -- Performance
    learners_count INTEGER DEFAULT 0,
    interactions_count INTEGER DEFAULT 0,
    success_rate DECIMAL(5,2),
    
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_district_brains_district ON district_brain_instances(district_id);
CREATE INDEX idx_district_brains_status ON district_brain_instances(status);
