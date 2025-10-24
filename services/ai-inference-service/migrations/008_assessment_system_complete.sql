-- ============================================================================
-- ASSESSMENT SYSTEM - Complete Implementation
-- Includes both Quick Assessment (PROMPT 58) and Comprehensive Assessment (PROMPT 61)
-- ============================================================================

-- ============================================================================
-- PART 1: QUICK ASSESSMENT TABLES (PROMPT 58)
-- ============================================================================

-- Assessment schedules and completion tracking
CREATE TABLE assessment_schedules (
    id VARCHAR(36) PRIMARY KEY DEFAULT (gen_random_uuid()::TEXT),
    learner_id VARCHAR(36) NOT NULL REFERENCES learners(id) ON DELETE CASCADE,
    district_id VARCHAR(36) NOT NULL REFERENCES districts(id) ON DELETE CASCADE,
    
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
CREATE TABLE assessment_responses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    schedule_id UUID NOT NULL REFERENCES assessment_schedules(id) ON DELETE CASCADE,
    learner_id UUID NOT NULL REFERENCES learners(id) ON DELETE CASCADE,
    
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
CREATE TABLE assessment_results (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    schedule_id UUID NOT NULL REFERENCES assessment_schedules(id) ON DELETE CASCADE,
    learner_id UUID NOT NULL REFERENCES learners(id) ON DELETE CASCADE,
    brain_instance_id UUID REFERENCES brain_instances(id),
    
    -- Overall scores from quick assessment
    overall_score DECIMAL(5,2),
    confidence_level VARCHAR(20), -- low, medium, high
    learning_style VARCHAR(50), -- visual, auditory, kinesthetic, mixed
    
    -- Detailed metrics from 5 questions
    reading_confidence INTEGER CHECK (reading_confidence BETWEEN 1 AND 4),
    math_confidence INTEGER CHECK (math_confidence BETWEEN 1 AND 5),
    preferred_environment VARCHAR(50), -- alone, pairs, group, teacher
    engagement_factors JSONB, -- fun elements selected
    work_preference VARCHAR(50), -- independent, collaborative
    
    -- Progress tracking (compared to previous assessment)
    previous_assessment_id UUID REFERENCES assessment_results(id),
    progress_percentage DECIMAL(5,2),
    improvement_areas JSONB,
    strengths JSONB,
    recommendations JSONB,
    
    -- Model update tracking
    triggered_model_update BOOLEAN DEFAULT false,
    model_updated_at TIMESTAMP,
    model_version_id UUID,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- PART 2: COMPREHENSIVE ASSESSMENT TABLES (PROMPT 61)
-- ============================================================================

-- Subject-specific assessments (detailed knowledge testing)
CREATE TABLE subject_assessments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    schedule_id UUID NOT NULL REFERENCES assessment_schedules(id) ON DELETE CASCADE,
    learner_id UUID NOT NULL REFERENCES learners(id) ON DELETE CASCADE,
    
    -- Subject Coverage
    subjects_included TEXT[] NOT NULL, -- ['math', 'reading', 'science']
    total_questions INTEGER NOT NULL DEFAULT 0,
    questions_answered INTEGER DEFAULT 0,
    
    -- Timing
    estimated_duration_minutes INTEGER DEFAULT 30,
    actual_duration_seconds INTEGER,
    started_at TIMESTAMP,
    
    -- Status
    status VARCHAR(20) DEFAULT 'pending', -- pending, in_progress, completed, abandoned
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Individual subject questions (AI-generated or template)
CREATE TABLE subject_questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    subject_assessment_id UUID NOT NULL REFERENCES subject_assessments(id) ON DELETE CASCADE,
    
    -- Subject Info
    subject VARCHAR(50) NOT NULL, -- math, reading, science
    domain VARCHAR(100), -- e.g., "Number Operations", "Comprehension"
    standard_code VARCHAR(100), -- Aligned to educational standards
    
    -- Question Content
    question_text TEXT NOT NULL,
    question_type VARCHAR(50) NOT NULL, -- multiple_choice, short_answer, problem_solving
    
    -- For multiple choice
    options JSONB, -- ["Option A", "Option B", "Option C", "Option D"]
    correct_answer_index INTEGER, -- 0, 1, 2, or 3
    
    -- For short answer
    acceptable_answers JSONB, -- List of acceptable answer variations
    
    -- Difficulty & Targeting
    difficulty_level INTEGER CHECK (difficulty_level BETWEEN 1 AND 10),
    target_grade_level INTEGER,
    
    -- Learner Response
    learner_answer TEXT,
    is_correct BOOLEAN,
    time_spent_seconds INTEGER,
    attempts INTEGER DEFAULT 0,
    
    -- AI Evaluation (detailed feedback)
    ai_evaluation JSONB,
    /* Structure:
    {
      "correctness": "correct|partial|incorrect",
      "reasoning": "Student showed understanding of...",
      "misconceptions": ["..."],
      "suggestions": ["..."]
    }
    */
    
    -- Ordering
    question_order INTEGER NOT NULL,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    answered_at TIMESTAMP
);

-- Subject-specific results (performance by subject and domain)
CREATE TABLE subject_results (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    subject_assessment_id UUID NOT NULL REFERENCES subject_assessments(id) ON DELETE CASCADE,
    assessment_result_id UUID REFERENCES assessment_results(id), -- Link to quick assessment
    
    -- Subject Breakdown
    subject VARCHAR(50) NOT NULL,
    
    -- Scoring
    raw_score INTEGER NOT NULL, -- e.g., 7 out of 10
    total_questions INTEGER NOT NULL,
    percentage_score DECIMAL(5,2),
    
    -- Level Determination
    assessed_grade_level DECIMAL(3,1), -- e.g., 5.5 (mid-5th grade)
    grade_level_label VARCHAR(50), -- "5th grade", "Advanced 5th grade"
    
    -- Domain Breakdown
    domain_scores JSONB,
    /* Structure:
    {
      "Number Operations": {"correct": 3, "total": 4, "percentage": 75},
      "Fractions": {"correct": 2, "total": 3, "percentage": 67}
    }
    */
    
    -- Strengths & Weaknesses
    strengths TEXT[], -- Domains with >= 75% accuracy
    weaknesses TEXT[], -- Domains with < 50% accuracy
    emerging_skills TEXT[], -- 50-74% accuracy
    
    -- Recommendations
    recommended_activities JSONB,
    focus_areas TEXT[],
    differentiation_needed VARCHAR(50), -- below_level, on_level, above_level, advanced
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- PART 3: BRAIN MODEL ADAPTATION TRACKING
-- ============================================================================

-- Brain model adaptations (tracks all changes from assessments)
CREATE TABLE brain_adaptations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    learner_id UUID NOT NULL REFERENCES learners(id) ON DELETE CASCADE,
    brain_instance_id UUID REFERENCES brain_instances(id),
    
    -- What triggered the adaptation
    trigger_type VARCHAR(50) NOT NULL, -- quick_assessment, comprehensive_assessment, manual, iep_update
    trigger_id UUID, -- ID of the assessment or other trigger
    
    -- Changes Made
    adaptation_type VARCHAR(50) NOT NULL, -- preferences, knowledge_levels, full_retrain
    changes_applied JSONB NOT NULL,
    /* Structure:
    {
      "preferences": {
        "learning_style": {"from": "visual", "to": "kinesthetic"},
        "work_preference": {"from": "independent", "to": "collaborative"}
      },
      "knowledge_levels": {
        "math": {"from": "4.5", "to": "5.2"},
        "reading": {"from": "5.0", "to": "5.5"}
      },
      "new_strengths": ["fractions", "inference"],
      "focus_areas": ["geometry", "vocabulary"]
    }
    */
    
    -- Model Info
    previous_model_version VARCHAR(100),
    new_model_version VARCHAR(100) NOT NULL,
    
    -- Performance Impact
    expected_improvement_areas TEXT[],
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Assessment notifications
CREATE TABLE assessment_notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    learner_id UUID NOT NULL REFERENCES learners(id) ON DELETE CASCADE,
    schedule_id UUID NOT NULL REFERENCES assessment_schedules(id) ON DELETE CASCADE,
    
    -- Notification Details
    notification_type VARCHAR(50) NOT NULL, -- due_soon, overdue, completed, results_ready
    sent_to VARCHAR(20) NOT NULL, -- learner, parent, teacher
    recipient_id UUID NOT NULL,
    sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    read_at TIMESTAMP,
    
    -- Content
    message TEXT,
    metadata JSONB
);

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================

-- Assessment Schedules
CREATE INDEX idx_schedules_learner_status ON assessment_schedules(learner_id, status);
CREATE INDEX idx_schedules_district_date ON assessment_schedules(district_id, scheduled_date);
CREATE INDEX idx_schedules_overdue ON assessment_schedules(scheduled_date, status) WHERE status = 'pending';
CREATE INDEX idx_schedules_level ON assessment_schedules(assessment_level, assessment_type);

-- Assessment Responses
CREATE INDEX idx_responses_schedule ON assessment_responses(schedule_id);
CREATE INDEX idx_responses_learner ON assessment_responses(learner_id, created_at DESC);

-- Assessment Results
CREATE INDEX idx_results_learner ON assessment_results(learner_id, created_at DESC);
CREATE INDEX idx_results_progress ON assessment_results(previous_assessment_id) WHERE previous_assessment_id IS NOT NULL;
CREATE INDEX idx_results_brain ON assessment_results(brain_instance_id);

-- Subject Assessments
CREATE INDEX idx_subject_assessments_learner ON subject_assessments(learner_id, status);
CREATE INDEX idx_subject_assessments_schedule ON subject_assessments(schedule_id);

-- Subject Questions
CREATE INDEX idx_subject_questions_assessment ON subject_questions(subject_assessment_id, question_order);
CREATE INDEX idx_subject_questions_subject ON subject_questions(subject, domain);
CREATE INDEX idx_subject_questions_difficulty ON subject_questions(difficulty_level, target_grade_level);

-- Subject Results
CREATE INDEX idx_subject_results_subject ON subject_results(subject, assessed_grade_level);
CREATE INDEX idx_subject_results_assessment ON subject_results(subject_assessment_id);
CREATE INDEX idx_subject_results_linked ON subject_results(assessment_result_id);

-- Brain Adaptations
CREATE INDEX idx_brain_adaptations_learner ON brain_adaptations(learner_id, created_at DESC);
CREATE INDEX idx_brain_adaptations_trigger ON brain_adaptations(trigger_type, trigger_id);
CREATE INDEX idx_brain_adaptations_brain ON brain_adaptations(brain_instance_id);

-- Notifications
CREATE INDEX idx_notifications_recipient ON assessment_notifications(recipient_id, sent_to, read_at);
CREATE INDEX idx_notifications_schedule ON assessment_notifications(schedule_id);

-- ============================================================================
-- FUNCTIONS AND TRIGGERS
-- ============================================================================

-- Auto-schedule next assessment after completion
CREATE OR REPLACE FUNCTION schedule_next_assessment()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status = 'completed' AND NEW.completed_date IS NOT NULL THEN
        -- Schedule next assessment 90 days from completion
        INSERT INTO assessment_schedules (
            learner_id,
            district_id,
            assessment_type,
            assessment_level,
            scheduled_date,
            status,
            is_first_assessment,
            days_since_last
        )
        VALUES (
            NEW.learner_id,
            NEW.district_id,
            'quarterly',
            NEW.assessment_level, -- Keep same level (quick or comprehensive)
            NEW.completed_date + INTERVAL '90 days',
            'pending',
            false,
            90
        )
        ON CONFLICT (learner_id, scheduled_date) DO NOTHING;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER after_assessment_completed
    AFTER UPDATE OF status ON assessment_schedules
    FOR EACH ROW
    WHEN (NEW.status = 'completed' AND OLD.status != 'completed')
    EXECUTE FUNCTION schedule_next_assessment();

-- Mark overdue assessments
CREATE OR REPLACE FUNCTION mark_overdue_assessments()
RETURNS INTEGER AS $$
DECLARE
    updated_count INTEGER;
BEGIN
    WITH updated AS (
        UPDATE assessment_schedules
        SET status = 'overdue', updated_at = CURRENT_TIMESTAMP
        WHERE status = 'pending'
        AND scheduled_date < CURRENT_TIMESTAMP - INTERVAL '7 days'
        RETURNING id
    )
    SELECT COUNT(*) INTO updated_count FROM updated;
    
    RETURN COALESCE(updated_count, 0);
END;
$$ LANGUAGE plpgsql;

-- Update assessment progress
CREATE OR REPLACE FUNCTION update_assessment_progress()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE subject_assessments
    SET 
        questions_answered = (
            SELECT COUNT(*)
            FROM subject_questions
            WHERE subject_assessment_id = NEW.subject_assessment_id
            AND learner_answer IS NOT NULL
        ),
        updated_at = CURRENT_TIMESTAMP
    WHERE id = NEW.subject_assessment_id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER after_question_answered
    AFTER UPDATE OF learner_answer ON subject_questions
    FOR EACH ROW
    WHEN (NEW.learner_answer IS NOT NULL AND OLD.learner_answer IS NULL)
    EXECUTE FUNCTION update_assessment_progress();

-- ============================================================================
-- UTILITY FUNCTIONS
-- ============================================================================

-- Get learner's assessment history
CREATE OR REPLACE FUNCTION get_learner_assessment_history(p_learner_id UUID)
RETURNS TABLE (
    assessment_date TIMESTAMP,
    assessment_type VARCHAR(50),
    assessment_level VARCHAR(20),
    overall_score DECIMAL(5,2),
    confidence_level VARCHAR(20),
    subjects_assessed TEXT[],
    progress_vs_previous DECIMAL(5,2)
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        s.completed_date,
        s.assessment_type,
        s.assessment_level,
        r.overall_score,
        r.confidence_level,
        COALESCE(sa.subjects_included, ARRAY[]::TEXT[]),
        r.progress_percentage
    FROM assessment_schedules s
    LEFT JOIN assessment_results r ON r.schedule_id = s.id
    LEFT JOIN subject_assessments sa ON sa.schedule_id = s.id
    WHERE s.learner_id = p_learner_id
    AND s.status = 'completed'
    ORDER BY s.completed_date DESC;
END;
$$ LANGUAGE plpgsql;

-- Check if assessment is due
CREATE OR REPLACE FUNCTION is_assessment_due(p_learner_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
    last_assessment TIMESTAMP;
    has_pending BOOLEAN;
BEGIN
    -- Check for pending assessment
    SELECT EXISTS (
        SELECT 1 FROM assessment_schedules
        WHERE learner_id = p_learner_id
        AND status IN ('pending', 'in_progress')
    ) INTO has_pending;
    
    IF has_pending THEN
        RETURN true;
    END IF;
    
    -- Check if 90 days since last assessment
    SELECT MAX(completed_date) INTO last_assessment
    FROM assessment_schedules
    WHERE learner_id = p_learner_id
    AND status = 'completed';
    
    IF last_assessment IS NULL THEN
        -- Never assessed - due for first assessment
        RETURN true;
    END IF;
    
    IF last_assessment < CURRENT_TIMESTAMP - INTERVAL '90 days' THEN
        RETURN true;
    END IF;
    
    RETURN false;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- INITIAL DATA / SEED
-- ============================================================================

-- Create assessment configuration (optional)
CREATE TABLE IF NOT EXISTS assessment_config (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    district_id UUID REFERENCES districts(id),
    
    -- Configuration
    quick_assessment_enabled BOOLEAN DEFAULT true,
    comprehensive_assessment_enabled BOOLEAN DEFAULT true,
    assessment_interval_days INTEGER DEFAULT 90,
    overdue_threshold_days INTEGER DEFAULT 7,
    
    -- Question counts
    quick_questions_count INTEGER DEFAULT 5,
    comprehensive_questions_per_subject INTEGER DEFAULT 10,
    
    -- Subjects to assess
    default_subjects TEXT[] DEFAULT ARRAY['math', 'reading', 'science'],
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert default configuration
INSERT INTO assessment_config (
    quick_assessment_enabled,
    comprehensive_assessment_enabled,
    assessment_interval_days,
    quick_questions_count,
    comprehensive_questions_per_subject,
    default_subjects
) VALUES (
    true,
    true,
    90,
    5,
    10,
    ARRAY['math', 'reading', 'science']
) ON CONFLICT DO NOTHING;

-- ============================================================================
-- COMMENTS FOR DOCUMENTATION
-- ============================================================================

COMMENT ON TABLE assessment_schedules IS 'Schedules for both quick (5Q) and comprehensive (30Q) assessments';
COMMENT ON TABLE assessment_responses IS 'Quick assessment responses - preferences and confidence';
COMMENT ON TABLE assessment_results IS 'Quick assessment results - learning style, preferences';
COMMENT ON TABLE subject_assessments IS 'Comprehensive assessment tracking - detailed knowledge testing';
COMMENT ON TABLE subject_questions IS 'Individual questions for comprehensive assessments - AI generated';
COMMENT ON TABLE subject_results IS 'Comprehensive assessment results - by subject and domain';
COMMENT ON TABLE brain_adaptations IS 'History of all brain model changes triggered by assessments';
COMMENT ON TABLE assessment_notifications IS 'Notifications for assessment events';

-- ============================================================================
-- VERIFICATION QUERIES (for testing)
-- ============================================================================

-- Check tables created
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'assessment_schedules') THEN
        RAISE EXCEPTION 'Assessment schedules table not created';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'subject_questions') THEN
        RAISE EXCEPTION 'Subject questions table not created';
    END IF;
    
    RAISE NOTICE 'All assessment tables created successfully!';
END $$;

-- Count indexes
SELECT 
    schemaname,
    tablename,
    COUNT(*) as index_count
FROM pg_indexes
WHERE tablename IN (
    'assessment_schedules',
    'assessment_responses',
    'assessment_results',
    'subject_assessments',
    'subject_questions',
    'subject_results',
    'brain_adaptations',
    'assessment_notifications'
)
GROUP BY schemaname, tablename
ORDER BY tablename;
