-- ============================================================================
-- AIVO COMPLETE DATABASE SCHEMA
-- Includes: Districts, Brain Instances, and Assessment System
-- ============================================================================

-- ============================================================================
-- PART 1: CORE INFRASTRUCTURE TABLES
-- ============================================================================

-- Districts table (for district-aware brain cloning)
CREATE TABLE IF NOT EXISTS districts (
    id VARCHAR(36) PRIMARY KEY DEFAULT (gen_random_uuid()::TEXT),
    
    -- District Information
    district_name VARCHAR(255) NOT NULL,
    district_code VARCHAR(50) UNIQUE,
    state_code VARCHAR(2) NOT NULL,
    country_code VARCHAR(3) DEFAULT 'US',
    
    -- Location Data
    city VARCHAR(100),
    postal_code VARCHAR(20),
    timezone VARCHAR(50) DEFAULT 'America/Los_Angeles',
    
    -- District Settings
    curriculum_standard VARCHAR(50) DEFAULT 'common_core', -- common_core, state_specific, ib, uk_national
    grade_system VARCHAR(20) DEFAULT 'us_k12', -- us_k12, ib, uk_year
    
    -- AI Brain Settings
    base_brain_model VARCHAR(50) DEFAULT 'gpt-4-turbo',
    brain_training_status VARCHAR(20) DEFAULT 'pending', -- pending, training, trained, failed
    last_brain_training_date TIMESTAMP,
    
    -- Metadata
    student_count INTEGER DEFAULT 0,
    active_learners INTEGER DEFAULT 0,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Indexes
    CONSTRAINT unique_district_code UNIQUE(district_code),
    CONSTRAINT unique_district_state UNIQUE(district_name, state_code)
);

-- Brain Instances (cloned and trained models per district)
CREATE TABLE IF NOT EXISTS brain_instances (
    id VARCHAR(36) PRIMARY KEY DEFAULT (gen_random_uuid()::TEXT),
    district_id VARCHAR(36) NOT NULL REFERENCES districts(id) ON DELETE CASCADE,
    
    -- Brain Model Info
    brain_name VARCHAR(255) NOT NULL,
    base_model VARCHAR(50) NOT NULL, -- gpt-4-turbo, claude-3-opus, gemini-pro
    model_version VARCHAR(50),
    training_version INTEGER DEFAULT 1,
    
    -- Training Status
    status VARCHAR(20) DEFAULT 'pending', -- pending, training, trained, active, archived
    training_started_at TIMESTAMP,
    training_completed_at TIMESTAMP,
    training_duration_seconds INTEGER,
    
    -- Training Data
    training_data_size INTEGER, -- number of examples
    curriculum_sources JSONB, -- array of curriculum sources used
    fine_tuning_config JSONB,
    
    -- Performance Metrics
    accuracy_score DECIMAL(5,2),
    curriculum_alignment_score DECIMAL(5,2),
    student_success_rate DECIMAL(5,2),
    
    -- Deployment
    is_active BOOLEAN DEFAULT false,
    deployment_date TIMESTAMP,
    api_endpoint VARCHAR(500),
    model_artifact_url VARCHAR(500), -- S3 or cloud storage URL
    
    -- Usage Stats
    total_inferences INTEGER DEFAULT 0,
    total_learners INTEGER DEFAULT 0,
    average_response_time_ms INTEGER,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create partial unique index for active brains (PostgreSQL 15+ compatible)
CREATE UNIQUE INDEX IF NOT EXISTS idx_unique_active_district_brain 
    ON brain_instances(district_id) 
    WHERE is_active = true;

-- ============================================================================
-- PART 2: ASSESSMENT SYSTEM TABLES
-- ============================================================================

-- Assessment schedules and completion tracking
CREATE TABLE IF NOT EXISTS assessment_schedules (
    id VARCHAR(36) PRIMARY KEY DEFAULT (gen_random_uuid()::TEXT),
    learner_id VARCHAR(36) NOT NULL REFERENCES learners(id) ON DELETE CASCADE,
    district_id VARCHAR(36) REFERENCES districts(id) ON DELETE SET NULL,
    
    -- Assessment Type
    assessment_type VARCHAR(50) NOT NULL DEFAULT 'baseline', -- baseline, quarterly, progress_check
    assessment_level VARCHAR(20) NOT NULL DEFAULT 'quick', -- quick (5 questions) or comprehensive (30+ questions)
    
    -- Scheduling
    scheduled_date TIMESTAMP NOT NULL,
    completed_date TIMESTAMP,
    status VARCHAR(20) NOT NULL DEFAULT 'pending', -- pending, in_progress, completed, skipped, overdue
    is_first_assessment BOOLEAN DEFAULT false,
    days_since_last INTEGER DEFAULT 0,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT unique_learner_scheduled_date UNIQUE(learner_id, scheduled_date)
);

-- Quick assessment responses (5 preference/confidence questions)
CREATE TABLE IF NOT EXISTS assessment_responses (
    id VARCHAR(36) PRIMARY KEY DEFAULT (gen_random_uuid()::TEXT),
    schedule_id VARCHAR(36) NOT NULL REFERENCES assessment_schedules(id) ON DELETE CASCADE,
    learner_id VARCHAR(36) NOT NULL REFERENCES learners(id) ON DELETE CASCADE,
    
    -- Question Info
    question_number INTEGER NOT NULL,
    question_text TEXT NOT NULL,
    answer_value TEXT NOT NULL,
    answer_type VARCHAR(50), -- emoji, multiple_choice, scale, text
    response_time_seconds INTEGER,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT unique_schedule_question UNIQUE(schedule_id, question_number)
);

-- Quick assessment results (preferences, confidence, learning style)
CREATE TABLE IF NOT EXISTS assessment_results (
    id VARCHAR(36) PRIMARY KEY DEFAULT (gen_random_uuid()::TEXT),
    schedule_id VARCHAR(36) NOT NULL UNIQUE REFERENCES assessment_schedules(id) ON DELETE CASCADE,
    learner_id VARCHAR(36) NOT NULL REFERENCES learners(id) ON DELETE CASCADE,
    
    -- Overall Results
    overall_score DECIMAL(5,2),
    confidence_level VARCHAR(20), -- low, medium, high
    learning_style VARCHAR(50), -- visual, auditory, kinesthetic, mixed
    
    -- Preferences (from quick assessment)
    preferred_subjects JSONB, -- array of subjects
    challenging_subjects JSONB, -- array of subjects
    learning_pace VARCHAR(20), -- slow, moderate, fast
    
    -- Comprehensive Results (if applicable)
    math_score DECIMAL(5,2),
    reading_score DECIMAL(5,2),
    writing_score DECIMAL(5,2),
    science_score DECIMAL(5,2),
    
    -- Analysis
    strengths JSONB, -- array of strength areas
    weaknesses JSONB, -- array of improvement areas
    recommendations JSONB, -- AI-generated recommendations
    
    -- Tracking
    completion_time_seconds INTEGER,
    next_assessment_date TIMESTAMP,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Subject-specific assessments (comprehensive 30+ questions)
CREATE TABLE IF NOT EXISTS subject_assessments (
    id VARCHAR(36) PRIMARY KEY DEFAULT (gen_random_uuid()::TEXT),
    schedule_id VARCHAR(36) NOT NULL REFERENCES assessment_schedules(id) ON DELETE CASCADE,
    learner_id VARCHAR(36) NOT NULL REFERENCES learners(id) ON DELETE CASCADE,
    
    -- Subject Info
    subject VARCHAR(50) NOT NULL, -- math, reading, writing, science, social_studies
    grade_level INTEGER NOT NULL,
    difficulty_level VARCHAR(20), -- below_grade, at_grade, above_grade
    
    -- Status
    status VARCHAR(20) DEFAULT 'pending', -- pending, in_progress, completed
    current_question_index INTEGER DEFAULT 0,
    total_questions INTEGER NOT NULL,
    
    -- Timing
    time_limit_seconds INTEGER,
    time_spent_seconds INTEGER DEFAULT 0,
    started_at TIMESTAMP,
    completed_at TIMESTAMP,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT unique_schedule_subject UNIQUE(schedule_id, subject)
);

-- Individual questions in comprehensive assessments
CREATE TABLE IF NOT EXISTS subject_questions (
    id VARCHAR(36) PRIMARY KEY DEFAULT (gen_random_uuid()::TEXT),
    subject_assessment_id VARCHAR(36) NOT NULL REFERENCES subject_assessments(id) ON DELETE CASCADE,
    
    -- Question Data
    question_number INTEGER NOT NULL,
    question_text TEXT NOT NULL,
    question_type VARCHAR(50), -- multiple_choice, short_answer, essay, true_false
    
    -- Multiple Choice Options
    options JSONB, -- array of answer options
    correct_answer TEXT,
    
    -- Difficulty & Standards
    difficulty VARCHAR(20), -- easy, medium, hard
    curriculum_standard VARCHAR(100), -- e.g., "CCSS.MATH.6.NS.A.1"
    skill_tested VARCHAR(100),
    
    -- Media
    has_image BOOLEAN DEFAULT false,
    image_url VARCHAR(500),
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT unique_assessment_question_number UNIQUE(subject_assessment_id, question_number)
);

-- Results per subject
CREATE TABLE IF NOT EXISTS subject_results (
    id VARCHAR(36) PRIMARY KEY DEFAULT (gen_random_uuid()::TEXT),
    subject_assessment_id VARCHAR(36) NOT NULL UNIQUE REFERENCES subject_assessments(id) ON DELETE CASCADE,
    result_id VARCHAR(36) NOT NULL REFERENCES assessment_results(id) ON DELETE CASCADE,
    
    -- Scores
    raw_score INTEGER NOT NULL,
    total_possible INTEGER NOT NULL,
    percentage_score DECIMAL(5,2) NOT NULL,
    
    -- Performance Breakdown
    questions_correct INTEGER NOT NULL,
    questions_incorrect INTEGER NOT NULL,
    questions_skipped INTEGER DEFAULT 0,
    
    -- Skill Analysis
    mastered_skills JSONB, -- array of mastered curriculum standards
    developing_skills JSONB, -- array of skills in progress
    needs_improvement_skills JSONB, -- array of skills needing work
    
    -- Comparison
    grade_level_equivalent VARCHAR(20),
    percentile_rank INTEGER, -- compared to grade level peers
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Brain model adaptations based on assessment results
CREATE TABLE IF NOT EXISTS brain_adaptations (
    id VARCHAR(36) PRIMARY KEY DEFAULT (gen_random_uuid()::TEXT),
    learner_id VARCHAR(36) NOT NULL REFERENCES learners(id) ON DELETE CASCADE,
    result_id VARCHAR(36) NOT NULL REFERENCES assessment_results(id) ON DELETE CASCADE,
    brain_instance_id VARCHAR(36) REFERENCES brain_instances(id) ON DELETE SET NULL,
    
    -- Adaptation Type
    adaptation_type VARCHAR(50) NOT NULL, -- difficulty_adjustment, pace_change, content_focus, style_shift
    trigger_reason VARCHAR(100), -- e.g., "low_math_score", "high_confidence_reading"
    
    -- Changes Made
    previous_settings JSONB,
    new_settings JSONB,
    changes_summary TEXT,
    
    -- Effectiveness Tracking
    applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    success_metric DECIMAL(5,2), -- measured improvement
    is_active BOOLEAN DEFAULT true,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Assessment notifications and reminders
CREATE TABLE IF NOT EXISTS assessment_notifications (
    id VARCHAR(36) PRIMARY KEY DEFAULT (gen_random_uuid()::TEXT),
    learner_id VARCHAR(36) NOT NULL REFERENCES learners(id) ON DELETE CASCADE,
    schedule_id VARCHAR(36) REFERENCES assessment_schedules(id) ON DELETE CASCADE,
    
    -- Notification Details
    notification_type VARCHAR(50) NOT NULL, -- reminder, overdue, completed, results_ready
    message TEXT NOT NULL,
    
    -- Delivery
    sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    delivery_method VARCHAR(20), -- in_app, email, push
    is_read BOOLEAN DEFAULT false,
    read_at TIMESTAMP,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- PART 3: INDEXES FOR PERFORMANCE
-- ============================================================================

-- Districts indexes
CREATE INDEX IF NOT EXISTS idx_districts_state ON districts(state_code);
CREATE INDEX IF NOT EXISTS idx_districts_status ON districts(brain_training_status);

-- Brain instances indexes
CREATE INDEX IF NOT EXISTS idx_brain_district ON brain_instances(district_id);
CREATE INDEX IF NOT EXISTS idx_brain_status ON brain_instances(status);
CREATE INDEX IF NOT EXISTS idx_brain_active ON brain_instances(is_active);

-- Assessment schedules indexes
CREATE INDEX IF NOT EXISTS idx_assessment_schedules_learner ON assessment_schedules(learner_id);
CREATE INDEX IF NOT EXISTS idx_assessment_schedules_district ON assessment_schedules(district_id);
CREATE INDEX IF NOT EXISTS idx_assessment_schedules_status ON assessment_schedules(status);
CREATE INDEX IF NOT EXISTS idx_assessment_schedules_date ON assessment_schedules(scheduled_date);
CREATE INDEX IF NOT EXISTS idx_assessment_schedules_overdue ON assessment_schedules(status, scheduled_date) WHERE status = 'overdue';

-- Assessment responses indexes
CREATE INDEX IF NOT EXISTS idx_assessment_responses_schedule ON assessment_responses(schedule_id);
CREATE INDEX IF NOT EXISTS idx_assessment_responses_learner ON assessment_responses(learner_id);

-- Assessment results indexes
CREATE INDEX IF NOT EXISTS idx_assessment_results_schedule ON assessment_results(schedule_id);
CREATE INDEX IF NOT EXISTS idx_assessment_results_learner ON assessment_results(learner_id);
CREATE INDEX IF NOT EXISTS idx_assessment_results_next_date ON assessment_results(next_assessment_date);

-- Subject assessments indexes
CREATE INDEX IF NOT EXISTS idx_subject_assessments_schedule ON subject_assessments(schedule_id);
CREATE INDEX IF NOT EXISTS idx_subject_assessments_learner ON subject_assessments(learner_id);
CREATE INDEX IF NOT EXISTS idx_subject_assessments_subject ON subject_assessments(subject);

-- Subject questions indexes
CREATE INDEX IF NOT EXISTS idx_subject_questions_assessment ON subject_questions(subject_assessment_id);

-- Subject results indexes
CREATE INDEX IF NOT EXISTS idx_subject_results_assessment ON subject_results(subject_assessment_id);
CREATE INDEX IF NOT EXISTS idx_subject_results_result ON subject_results(result_id);

-- Brain adaptations indexes
CREATE INDEX IF NOT EXISTS idx_brain_adaptations_learner ON brain_adaptations(learner_id);
CREATE INDEX IF NOT EXISTS idx_brain_adaptations_result ON brain_adaptations(result_id);
CREATE INDEX IF NOT EXISTS idx_brain_adaptations_brain ON brain_adaptations(brain_instance_id);
CREATE INDEX IF NOT EXISTS idx_brain_adaptations_active ON brain_adaptations(is_active);

-- Assessment notifications indexes
CREATE INDEX IF NOT EXISTS idx_assessment_notifications_learner ON assessment_notifications(learner_id);
CREATE INDEX IF NOT EXISTS idx_assessment_notifications_schedule ON assessment_notifications(schedule_id);
CREATE INDEX IF NOT EXISTS idx_assessment_notifications_unread ON assessment_notifications(learner_id, is_read) WHERE is_read = false;

-- ============================================================================
-- PART 4: TRIGGERS AND FUNCTIONS
-- ============================================================================

-- Update updated_at timestamp function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at triggers
CREATE TRIGGER update_districts_updated_at BEFORE UPDATE ON districts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_brain_instances_updated_at BEFORE UPDATE ON brain_instances
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_assessment_schedules_updated_at BEFORE UPDATE ON assessment_schedules
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_assessment_results_updated_at BEFORE UPDATE ON assessment_results
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_subject_assessments_updated_at BEFORE UPDATE ON subject_assessments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_subject_results_updated_at BEFORE UPDATE ON subject_results
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_brain_adaptations_updated_at BEFORE UPDATE ON brain_adaptations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Auto-schedule next assessment (90 days after completion)
CREATE OR REPLACE FUNCTION schedule_next_assessment()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status = 'completed' AND OLD.status != 'completed' THEN
        INSERT INTO assessment_schedules (
            learner_id,
            district_id,
            assessment_type,
            assessment_level,
            scheduled_date,
            days_since_last
        ) VALUES (
            NEW.learner_id,
            NEW.district_id,
            'quarterly',
            'quick',
            NEW.completed_date + INTERVAL '90 days',
            90
        ) ON CONFLICT (learner_id, scheduled_date) DO NOTHING;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_schedule_next_assessment
    AFTER UPDATE ON assessment_schedules
    FOR EACH ROW
    EXECUTE FUNCTION schedule_next_assessment();

-- Update assessment progress
CREATE OR REPLACE FUNCTION update_assessment_progress()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE assessment_schedules
    SET status = 'in_progress',
        updated_at = CURRENT_TIMESTAMP
    WHERE id = NEW.schedule_id
    AND status = 'pending';
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_assessment_progress
    AFTER INSERT ON assessment_responses
    FOR EACH ROW
    EXECUTE FUNCTION update_assessment_progress();

-- Mark overdue assessments
CREATE OR REPLACE FUNCTION mark_overdue_assessments()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE assessment_schedules
    SET status = 'overdue'
    WHERE status = 'pending'
    AND scheduled_date < CURRENT_TIMESTAMP - INTERVAL '7 days';
    
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- PART 5: SEED DATA
-- ============================================================================

-- Insert default districts (examples)
INSERT INTO districts (district_name, district_code, state_code, city, curriculum_standard) VALUES
('Los Angeles Unified School District', 'LAUSD', 'CA', 'Los Angeles', 'common_core'),
('New York City Department of Education', 'NYCDOE', 'NY', 'New York', 'common_core'),
('Chicago Public Schools', 'CPS', 'IL', 'Chicago', 'common_core'),
('Miami-Dade County Public Schools', 'MDCPS', 'FL', 'Miami', 'common_core'),
('Houston Independent School District', 'HISD', 'TX', 'Houston', 'common_core')
ON CONFLICT (district_code) DO NOTHING;

-- ============================================================================
-- PART 6: VERIFICATION
-- ============================================================================

-- Verify all tables were created
DO $$
DECLARE
    table_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO table_count
    FROM information_schema.tables
    WHERE table_schema = 'public'
    AND table_name IN (
        'districts', 'brain_instances',
        'assessment_schedules', 'assessment_responses', 'assessment_results',
        'subject_assessments', 'subject_questions', 'subject_results',
        'brain_adaptations', 'assessment_notifications'
    );
    
    IF table_count = 10 THEN
        RAISE NOTICE '✅ All 10 tables created successfully!';
    ELSE
        RAISE WARNING '⚠️  Only % of 10 tables created', table_count;
    END IF;
END $$;

-- Show created tables and their index counts
SELECT 
    schemaname,
    tablename,
    COUNT(indexname) as index_count
FROM pg_indexes
WHERE schemaname = 'public'
AND tablename IN (
    'districts', 'brain_instances',
    'assessment_schedules', 'assessment_responses', 'assessment_results',
    'subject_assessments', 'subject_questions', 'subject_results',
    'brain_adaptations', 'assessment_notifications'
)
GROUP BY schemaname, tablename
ORDER BY tablename;

-- Show triggers
SELECT 
    trigger_name,
    event_object_table,
    action_timing,
    event_manipulation
FROM information_schema.triggers
WHERE trigger_schema = 'public'
AND event_object_table IN (
    'districts', 'brain_instances',
    'assessment_schedules', 'assessment_responses', 'assessment_results',
    'subject_assessments', 'subject_questions', 'subject_results',
    'brain_adaptations', 'assessment_notifications'
)
ORDER BY event_object_table, trigger_name;

RAISE NOTICE '🎉 Database migration complete! Districts, Brain Instances, and Assessment System are ready.';
