-- Migration 011: Adaptive Content Difficulty Engine Schema
-- This enables Aivo's CORE learning philosophy: grade-level translation
-- with parent/teacher approval workflow

-- ============================================================================
-- TABLE 1: Content Adaptations
-- Tracks every content adaptation from source grade to target comprehension level
-- ============================================================================
CREATE TABLE IF NOT EXISTS content_adaptations (
    adaptation_id UUID PRIMARY KEY,
    brain_id VARCHAR(255) NOT NULL,
    learner_id VARCHAR(255),
    subject VARCHAR(100) NOT NULL,
    original_content TEXT NOT NULL,
    adapted_content TEXT NOT NULL,
    source_grade_level FLOAT NOT NULL,  -- Original grade level (e.g., 6.0)
    target_comprehension_level FLOAT NOT NULL,  -- Target level (e.g., 4.0)
    complexity_score FLOAT CHECK (complexity_score >= 0 AND complexity_score <= 10),
    adaptations_made JSONB NOT NULL,  -- List of {type, original, adapted, change}
    reasoning TEXT,  -- Why these adaptations were made
    created_at TIMESTAMP DEFAULT NOW(),
    INDEX idx_adaptations_brain (brain_id),
    INDEX idx_adaptations_subject (subject),
    INDEX idx_adaptations_created (created_at)
);

-- ============================================================================
-- TABLE 2: Mastery Assessments
-- Tracks when learner has mastered current level and ready for increase
-- ============================================================================
CREATE TABLE IF NOT EXISTS mastery_assessments (
    assessment_id UUID PRIMARY KEY,
    brain_id VARCHAR(255) NOT NULL,
    learner_id VARCHAR(255) NOT NULL,
    subject VARCHAR(100) NOT NULL,
    current_level FLOAT NOT NULL,
    sessions_analyzed INT NOT NULL,
    success_rate FLOAT CHECK (success_rate >= 0 AND success_rate <= 1),
    hint_usage_trend VARCHAR(20),  -- "decreasing", "stable", "increasing"
    error_patterns JSONB,  -- List of error types
    mastery_score FLOAT CHECK (mastery_score >= 0 AND mastery_score <= 1),
    ready_for_increase BOOLEAN DEFAULT FALSE,
    recommended_new_level FLOAT,
    confidence FLOAT CHECK (confidence >= 0 AND confidence <= 1),
    created_at TIMESTAMP DEFAULT NOW(),
    INDEX idx_mastery_brain (brain_id),
    INDEX idx_mastery_ready (ready_for_increase),
    INDEX idx_mastery_subject (subject)
);

-- ============================================================================
-- TABLE 3: Difficulty Change Requests
-- Parent/Teacher approval requests for difficulty increases
-- THIS IS THE CORE APPROVAL WORKFLOW
-- ============================================================================
CREATE TABLE IF NOT EXISTS difficulty_change_requests (
    request_id UUID PRIMARY KEY,
    brain_id VARCHAR(255) NOT NULL,
    learner_id VARCHAR(255) NOT NULL,
    learner_name VARCHAR(255) NOT NULL,
    subject VARCHAR(100) NOT NULL,
    current_level FLOAT NOT NULL,
    proposed_level FLOAT NOT NULL,
    change_type VARCHAR(20) NOT NULL,  -- "increase", "decrease", "maintain"
    evidence JSONB NOT NULL,  -- MasteryAssessment data
    sample_content JSONB,  -- Sample at new level for preview
    reasoning TEXT NOT NULL,  -- Human-readable explanation
    status VARCHAR(20) DEFAULT 'pending',  -- pending, approved, declined, expired, auto_approved
    parent_response JSONB,  -- {approved: bool, timestamp, comments}
    teacher_response JSONB,  -- {approved: bool, timestamp, comments}
    created_at TIMESTAMP DEFAULT NOW(),
    expires_at TIMESTAMP NOT NULL,  -- Auto-expire after 7 days
    approved_at TIMESTAMP,
    approved_by VARCHAR(255),  -- User ID who approved
    notification_sent BOOLEAN DEFAULT FALSE,
    INDEX idx_requests_brain (brain_id),
    INDEX idx_requests_status (status),
    INDEX idx_requests_created (created_at),
    INDEX idx_requests_expires (expires_at)
);

-- ============================================================================
-- TABLE 4: Difficulty Transitions
-- Tracks gradual difficulty increases with monitoring and rollback capability
-- ============================================================================
CREATE TABLE IF NOT EXISTS difficulty_transitions (
    transition_id UUID PRIMARY KEY,
    brain_id VARCHAR(255) NOT NULL,
    learner_id VARCHAR(255) NOT NULL,
    subject VARCHAR(100) NOT NULL,
    from_level FLOAT NOT NULL,
    to_level FLOAT NOT NULL,
    transition_strategy VARCHAR(50) NOT NULL,  -- gradual_5sessions, gradual_10sessions, immediate, mixed
    current_step INT DEFAULT 0,
    total_steps INT NOT NULL,
    monitoring_period_days INT DEFAULT 14,
    rollback_threshold FLOAT DEFAULT 0.6,  -- Roll back if accuracy drops below this
    started_at TIMESTAMP DEFAULT NOW(),
    completed_at TIMESTAMP,
    rolled_back BOOLEAN DEFAULT FALSE,
    rollback_reason TEXT,
    rollback_at TIMESTAMP,
    INDEX idx_transitions_brain (brain_id),
    INDEX idx_transitions_active (completed_at),  -- NULL = active
    INDEX idx_transitions_rolled_back (rolled_back)
);

-- ============================================================================
-- TABLE 5: Transition Monitoring Log
-- Detailed session-by-session monitoring during transitions
-- ============================================================================
CREATE TABLE IF NOT EXISTS transition_monitoring_log (
    log_id UUID PRIMARY KEY,
    transition_id UUID NOT NULL REFERENCES difficulty_transitions(transition_id),
    session_number INT NOT NULL,
    current_step INT NOT NULL,
    new_level_ratio FLOAT,  -- 0.0 (all old) to 1.0 (all new)
    success_rate FLOAT,
    accuracy_rate FLOAT,
    hint_usage INT,
    time_on_task_minutes INT,
    frustration_level VARCHAR(20),  -- low, moderate, high, severe
    struggle_detected BOOLEAN DEFAULT FALSE,
    notes TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    INDEX idx_monitoring_transition (transition_id),
    INDEX idx_monitoring_created (created_at)
);

-- ============================================================================
-- TABLE 6: Brain Difficulty Levels
-- Current difficulty level per subject for each brain
-- ============================================================================
CREATE TABLE IF NOT EXISTS brain_difficulty_levels (
    brain_id VARCHAR(255) NOT NULL,
    subject VARCHAR(100) NOT NULL,
    current_level FLOAT NOT NULL,
    target_grade_level FLOAT,  -- Actual grade level (e.g., 6th grader)
    gap FLOAT GENERATED ALWAYS AS (target_grade_level - current_level) STORED,
    active_transition_id UUID REFERENCES difficulty_transitions(transition_id),
    last_assessment_date TIMESTAMP,
    last_change_date TIMESTAMP,
    total_increases INT DEFAULT 0,
    total_decreases INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    PRIMARY KEY (brain_id, subject),
    INDEX idx_difficulty_brain (brain_id),
    INDEX idx_difficulty_gap (gap),  -- Find learners with biggest gaps
    INDEX idx_difficulty_updated (updated_at)
);

-- ============================================================================
-- TABLE 7: Approval Notification Log
-- Track all notifications sent to parents/teachers
-- ============================================================================
CREATE TABLE IF NOT EXISTS approval_notifications (
    notification_id UUID PRIMARY KEY,
    request_id UUID NOT NULL REFERENCES difficulty_change_requests(request_id),
    user_id VARCHAR(255) NOT NULL,
    user_type VARCHAR(20) NOT NULL,  -- "parent" or "teacher"
    notification_type VARCHAR(50) NOT NULL,
    sent_at TIMESTAMP DEFAULT NOW(),
    delivered BOOLEAN DEFAULT FALSE,
    opened BOOLEAN DEFAULT FALSE,
    opened_at TIMESTAMP,
    action_taken VARCHAR(50),  -- "approved", "declined", "ignored"
    action_taken_at TIMESTAMP,
    INDEX idx_notifications_request (request_id),
    INDEX idx_notifications_user (user_id),
    INDEX idx_notifications_sent (sent_at)
);

-- ============================================================================
-- VIEWS FOR DASHBOARDS AND REPORTING
-- ============================================================================

-- View 1: Active Approval Requests (for parent/teacher dashboards)
CREATE OR REPLACE VIEW v_active_approval_requests AS
SELECT 
    r.request_id,
    r.learner_name,
    r.subject,
    r.current_level,
    r.proposed_level,
    r.proposed_level - r.current_level AS increase_amount,
    r.status,
    r.created_at,
    r.expires_at,
    EXTRACT(EPOCH FROM (r.expires_at - NOW())) / 86400 AS days_until_expiry,
    m.success_rate,
    m.mastery_score,
    m.sessions_analyzed
FROM difficulty_change_requests r
LEFT JOIN mastery_assessments m ON r.evidence::jsonb->>'assessment_id' = m.assessment_id::text
WHERE r.status = 'pending'
AND r.expires_at > NOW()
ORDER BY r.created_at DESC;

-- View 2: Learner Progress Dashboard
CREATE OR REPLACE VIEW v_learner_difficulty_progress AS
SELECT 
    dl.brain_id,
    dl.subject,
    dl.current_level,
    dl.target_grade_level,
    dl.gap,
    dl.total_increases,
    dl.total_decreases,
    COUNT(DISTINCT t.transition_id) AS total_transitions,
    SUM(CASE WHEN t.rolled_back THEN 1 ELSE 0 END) AS rollbacks,
    MAX(t.completed_at) AS last_transition_date,
    CASE 
        WHEN dl.gap > 2 THEN 'significant_gap'
        WHEN dl.gap > 1 THEN 'moderate_gap'
        WHEN dl.gap > 0 THEN 'slight_gap'
        WHEN dl.gap = 0 THEN 'on_level'
        ELSE 'above_level'
    END AS gap_category
FROM brain_difficulty_levels dl
LEFT JOIN difficulty_transitions t ON dl.brain_id = t.brain_id AND dl.subject = t.subject
GROUP BY dl.brain_id, dl.subject, dl.current_level, dl.target_grade_level, dl.gap, 
         dl.total_increases, dl.total_decreases;

-- View 3: Mastery Pipeline (learners ready for level up)
CREATE OR REPLACE VIEW v_mastery_pipeline AS
SELECT 
    m.brain_id,
    m.learner_id,
    m.subject,
    m.current_level,
    m.recommended_new_level,
    m.mastery_score,
    m.success_rate,
    m.sessions_analyzed,
    m.confidence,
    m.created_at AS assessed_at,
    r.request_id,
    r.status AS approval_status,
    r.created_at AS request_sent_at
FROM mastery_assessments m
LEFT JOIN difficulty_change_requests r 
    ON m.brain_id = r.brain_id 
    AND m.subject = r.subject 
    AND r.created_at > m.created_at
WHERE m.ready_for_increase = TRUE
AND m.created_at > NOW() - INTERVAL '14 days'
ORDER BY m.mastery_score DESC, m.confidence DESC;

-- View 4: Rollback Analysis (identify problematic transitions)
CREATE OR REPLACE VIEW v_rollback_analysis AS
SELECT 
    t.brain_id,
    t.subject,
    t.from_level,
    t.to_level,
    t.to_level - t.from_level AS jump_size,
    t.transition_strategy,
    t.current_step,
    t.total_steps,
    t.rollback_reason,
    t.rollback_at,
    EXTRACT(EPOCH FROM (t.rollback_at - t.started_at)) / 3600 AS hours_before_rollback
FROM difficulty_transitions t
WHERE t.rolled_back = TRUE
ORDER BY t.rollback_at DESC;

-- ============================================================================
-- FUNCTIONS FOR COMMON OPERATIONS
-- ============================================================================

-- Function 1: Check if approval expired and auto-expire
CREATE OR REPLACE FUNCTION auto_expire_requests()
RETURNS INT AS $$
DECLARE
    expired_count INT;
BEGIN
    UPDATE difficulty_change_requests
    SET status = 'expired'
    WHERE status = 'pending'
    AND expires_at < NOW();
    
    GET DIAGNOSTICS expired_count = ROW_COUNT;
    RETURN expired_count;
END;
$$ LANGUAGE plpgsql;

-- Function 2: Get current difficulty for brain+subject
CREATE OR REPLACE FUNCTION get_current_difficulty(
    p_brain_id VARCHAR(255),
    p_subject VARCHAR(100)
)
RETURNS FLOAT AS $$
DECLARE
    current_diff FLOAT;
BEGIN
    SELECT current_level INTO current_diff
    FROM brain_difficulty_levels
    WHERE brain_id = p_brain_id AND subject = p_subject;
    
    RETURN COALESCE(current_diff, 0.0);
END;
$$ LANGUAGE plpgsql;

-- Function 3: Record transition monitoring
CREATE OR REPLACE FUNCTION record_transition_monitoring(
    p_transition_id UUID,
    p_session_data JSONB
)
RETURNS UUID AS $$
DECLARE
    log_id UUID;
    transition_info RECORD;
BEGIN
    -- Get transition details
    SELECT current_step, total_steps, rollback_threshold
    INTO transition_info
    FROM difficulty_transitions
    WHERE transition_id = p_transition_id;
    
    -- Insert monitoring log
    INSERT INTO transition_monitoring_log (
        log_id, transition_id, session_number, current_step,
        new_level_ratio, success_rate, accuracy_rate,
        hint_usage, time_on_task_minutes, frustration_level, struggle_detected
    ) VALUES (
        gen_random_uuid(),
        p_transition_id,
        (p_session_data->>'session_number')::INT,
        transition_info.current_step,
        transition_info.current_step::FLOAT / transition_info.total_steps,
        (p_session_data->>'success_rate')::FLOAT,
        (p_session_data->>'accuracy_rate')::FLOAT,
        (p_session_data->>'hint_usage')::INT,
        (p_session_data->>'time_on_task_minutes')::INT,
        p_session_data->>'frustration_level',
        (p_session_data->>'accuracy_rate')::FLOAT < transition_info.rollback_threshold
    )
    RETURNING log_id INTO log_id;
    
    RETURN log_id;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- TRIGGERS FOR AUTO-UPDATES
-- ============================================================================

-- Trigger: Update brain_difficulty_levels.updated_at on change
CREATE OR REPLACE FUNCTION update_difficulty_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_difficulty_timestamp
BEFORE UPDATE ON brain_difficulty_levels
FOR EACH ROW
EXECUTE FUNCTION update_difficulty_timestamp();

-- Trigger: Increment total_increases/decreases on difficulty change
CREATE OR REPLACE FUNCTION track_difficulty_changes()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.current_level > OLD.current_level THEN
        NEW.total_increases = OLD.total_increases + 1;
    ELSIF NEW.current_level < OLD.current_level THEN
        NEW.total_decreases = OLD.total_decreases + 1;
    END IF;
    NEW.last_change_date = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_track_difficulty_changes
BEFORE UPDATE ON brain_difficulty_levels
FOR EACH ROW
WHEN (OLD.current_level IS DISTINCT FROM NEW.current_level)
EXECUTE FUNCTION track_difficulty_changes();

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================

-- Composite indexes for common queries
CREATE INDEX IF NOT EXISTS idx_requests_brain_status 
ON difficulty_change_requests(brain_id, status);

CREATE INDEX IF NOT EXISTS idx_transitions_brain_active 
ON difficulty_transitions(brain_id, completed_at) 
WHERE completed_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_mastery_brain_ready 
ON mastery_assessments(brain_id, ready_for_increase, created_at);

-- ============================================================================
-- COMMENTS FOR DOCUMENTATION
-- ============================================================================

COMMENT ON TABLE content_adaptations IS 
'Tracks every content adaptation from source grade to target comprehension level. Core of Aivo learning philosophy.';

COMMENT ON TABLE difficulty_change_requests IS 
'Parent/teacher approval requests for difficulty changes. THIS IS THE CORE APPROVAL WORKFLOW.';

COMMENT ON TABLE difficulty_transitions IS 
'Gradual difficulty transitions with monitoring and automatic rollback capability.';

COMMENT ON TABLE brain_difficulty_levels IS 
'Current difficulty level per subject for each brain. Shows gap between target grade and actual comprehension.';

COMMENT ON COLUMN brain_difficulty_levels.gap IS 
'Gap between target grade level and current comprehension (e.g., 6th grader at 4th grade level = 2.0 gap)';

-- ============================================================================
-- SAMPLE DATA FOR TESTING (Comment out in production)
-- ============================================================================

-- Example: Jayden (6th grade, 4th grade reading)
/*
INSERT INTO brain_difficulty_levels (brain_id, subject, current_level, target_grade_level)
VALUES ('brain_jayden_abc123', 'reading', 4.0, 6.0);

-- After 3 weeks, mastery detected
INSERT INTO mastery_assessments (
    assessment_id, brain_id, learner_id, subject, current_level,
    sessions_analyzed, success_rate, hint_usage_trend, mastery_score,
    ready_for_increase, recommended_new_level, confidence
) VALUES (
    gen_random_uuid(), 'brain_jayden_abc123', 'learner_jayden', 'reading', 4.0,
    10, 0.87, 'decreasing', 0.91, TRUE, 4.5, 0.85
);

-- Approval request created
INSERT INTO difficulty_change_requests (
    request_id, brain_id, learner_id, learner_name, subject,
    current_level, proposed_level, change_type, evidence, reasoning,
    expires_at
) VALUES (
    gen_random_uuid(), 'brain_jayden_abc123', 'learner_jayden', 'Jayden', 'reading',
    4.0, 4.5, 'increase', 
    '{"mastery_score": 0.91, "success_rate": 0.87}'::jsonb,
    'Strong consistent performance over 10 sessions',
    NOW() + INTERVAL '7 days'
);
*/

-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================

-- Verify tables created
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name LIKE '%difficulty%' OR table_name LIKE '%adaptation%' OR table_name LIKE '%mastery%'
ORDER BY table_name;

-- Verify views created
SELECT table_name FROM information_schema.views 
WHERE table_schema = 'public' 
AND table_name LIKE 'v_%'
ORDER BY table_name;

-- Verify functions created
SELECT routine_name FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND routine_type = 'FUNCTION'
ORDER BY routine_name;

-- ============================================================================
-- MIGRATION COMPLETE
-- ============================================================================
-- Migration 011: Adaptive Content Difficulty Engine Schema ✅
-- Tables: 7
-- Views: 4
-- Functions: 3
-- Triggers: 2
-- Enables: Grade-level content translation with parent/teacher approval
-- ============================================================================
