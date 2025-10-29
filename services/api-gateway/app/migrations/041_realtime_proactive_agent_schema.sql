-- Migration: Real-Time Proactive Agent Schema
-- Description: Tables for real-time monitoring and proactive interventions
-- Version: 041
-- Date: 2025-10-29

-- ====================================================================
-- PROACTIVE INTERVENTIONS TABLE
-- ====================================================================

CREATE TABLE IF NOT EXISTS brain_proactive_interventions (
    intervention_id VARCHAR(36) PRIMARY KEY,
    brain_id VARCHAR(255) NOT NULL,
    learner_id VARCHAR(255) NOT NULL,
    session_id VARCHAR(255) NOT NULL,
    trigger_type VARCHAR(50) NOT NULL,  -- frustration, disengagement, success_momentum, etc.
    intervention_type VARCHAR(100) NOT NULL,  -- offer_hint_or_break, re_engagement_prompt, etc.
    message TEXT NOT NULL,
    parameters TEXT,  -- JSON object with intervention parameters
    timestamp TIMESTAMP NOT NULL,
    learner_response VARCHAR(50),  -- accepted, rejected, ignored
    response_timestamp TIMESTAMP,
    effectiveness FLOAT,  -- 0.0-1.0
    follow_up_observed BOOLEAN DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for proactive interventions
CREATE INDEX IF NOT EXISTS idx_proactive_brain 
    ON brain_proactive_interventions(brain_id);

CREATE INDEX IF NOT EXISTS idx_proactive_learner 
    ON brain_proactive_interventions(learner_id);

CREATE INDEX IF NOT EXISTS idx_proactive_session 
    ON brain_proactive_interventions(session_id);

CREATE INDEX IF NOT EXISTS idx_proactive_timestamp 
    ON brain_proactive_interventions(timestamp DESC);

CREATE INDEX IF NOT EXISTS idx_proactive_trigger_type 
    ON brain_proactive_interventions(trigger_type);

CREATE INDEX IF NOT EXISTS idx_proactive_learner_session 
    ON brain_proactive_interventions(learner_id, session_id);


-- ====================================================================
-- INTERVENTION POLICIES TABLE
-- ====================================================================

CREATE TABLE IF NOT EXISTS brain_intervention_policies (
    policy_id VARCHAR(36) PRIMARY KEY,
    brain_id VARCHAR(255) NOT NULL,
    learner_id VARCHAR(255) NOT NULL,
    max_per_session INTEGER DEFAULT 4,
    min_time_between_minutes INTEGER DEFAULT 5,
    autonomy_level INTEGER DEFAULT 2,  -- 1=monitor only, 2=low-stakes, 3=full
    enabled_triggers TEXT,  -- JSON array of enabled trigger types
    proactive_mode_enabled BOOLEAN DEFAULT 1,
    rejection_threshold INTEGER DEFAULT 2,
    diagnosis_considerations TEXT,  -- JSON object with diagnosis info
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Constraints
    CHECK (autonomy_level >= 1 AND autonomy_level <= 3),
    CHECK (max_per_session >= 0),
    CHECK (min_time_between_minutes >= 0),
    
    -- Unique constraint: one policy per brain-learner pair
    UNIQUE(brain_id, learner_id)
);

-- Indexes for intervention policies
CREATE INDEX IF NOT EXISTS idx_policy_brain 
    ON brain_intervention_policies(brain_id);

CREATE INDEX IF NOT EXISTS idx_policy_learner 
    ON brain_intervention_policies(learner_id);

CREATE INDEX IF NOT EXISTS idx_policy_autonomy 
    ON brain_intervention_policies(autonomy_level);


-- ====================================================================
-- SESSION MONITORING TABLE
-- ====================================================================

CREATE TABLE IF NOT EXISTS brain_session_monitoring (
    monitor_id VARCHAR(36) PRIMARY KEY,
    brain_id VARCHAR(255) NOT NULL,
    learner_id VARCHAR(255) NOT NULL,
    session_id VARCHAR(255) NOT NULL,
    monitoring_start TIMESTAMP NOT NULL,
    monitoring_end TIMESTAMP,
    baseline_metrics TEXT,  -- JSON object with baseline performance
    final_metrics TEXT,  -- JSON object with final performance
    total_alerts INTEGER DEFAULT 0,
    total_state_changes INTEGER DEFAULT 0,
    interventions_count INTEGER DEFAULT 0,
    monitoring_duration_seconds FLOAT,
    status VARCHAR(50) DEFAULT 'active',  -- active, completed, terminated
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Unique constraint: one active monitor per session
    UNIQUE(session_id)
);

-- Indexes for session monitoring
CREATE INDEX IF NOT EXISTS idx_monitor_brain 
    ON brain_session_monitoring(brain_id);

CREATE INDEX IF NOT EXISTS idx_monitor_learner 
    ON brain_session_monitoring(learner_id);

CREATE INDEX IF NOT EXISTS idx_monitor_session 
    ON brain_session_monitoring(session_id);

CREATE INDEX IF NOT EXISTS idx_monitor_status 
    ON brain_session_monitoring(status);

CREATE INDEX IF NOT EXISTS idx_monitor_start 
    ON brain_session_monitoring(monitoring_start DESC);


-- ====================================================================
-- TRIGGER DETECTIONS TABLE
-- ====================================================================

CREATE TABLE IF NOT EXISTS brain_trigger_detections (
    detection_id VARCHAR(36) PRIMARY KEY,
    brain_id VARCHAR(255) NOT NULL,
    learner_id VARCHAR(255) NOT NULL,
    session_id VARCHAR(255) NOT NULL,
    trigger_type VARCHAR(50) NOT NULL,
    condition_met BOOLEAN NOT NULL,
    severity VARCHAR(20) NOT NULL,  -- low, medium, high, critical
    confidence FLOAT NOT NULL,
    context TEXT,  -- JSON object with detection context
    reasoning TEXT,
    detected_at TIMESTAMP NOT NULL,
    intervention_triggered BOOLEAN DEFAULT 0,
    intervention_id VARCHAR(36),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Constraints
    CHECK (confidence >= 0.0 AND confidence <= 1.0),
    CHECK (severity IN ('low', 'medium', 'high', 'critical'))
);

-- Indexes for trigger detections
CREATE INDEX IF NOT EXISTS idx_detection_brain 
    ON brain_trigger_detections(brain_id);

CREATE INDEX IF NOT EXISTS idx_detection_learner 
    ON brain_trigger_detections(learner_id);

CREATE INDEX IF NOT EXISTS idx_detection_session 
    ON brain_trigger_detections(session_id);

CREATE INDEX IF NOT EXISTS idx_detection_trigger_type 
    ON brain_trigger_detections(trigger_type);

CREATE INDEX IF NOT EXISTS idx_detection_detected_at 
    ON brain_trigger_detections(detected_at DESC);

CREATE INDEX IF NOT EXISTS idx_detection_severity 
    ON brain_trigger_detections(severity);


-- ====================================================================
-- SAMPLE DATA FOR TESTING
-- ====================================================================

-- Sample intervention policy
INSERT OR IGNORE INTO brain_intervention_policies (
    policy_id,
    brain_id,
    learner_id,
    max_per_session,
    min_time_between_minutes,
    autonomy_level,
    enabled_triggers,
    proactive_mode_enabled,
    rejection_threshold,
    diagnosis_considerations
) VALUES (
    'policy_demo_001',
    'brain_demo_001',
    'learner_demo_001',
    4,
    5,
    2,
    '["frustration", "disengagement", "success_momentum", "fatigue", "stuck", "breakthrough"]',
    1,
    2,
    '{"diagnoses": ["adhd"], "learning_style": "visual", "attention_span": 15}'
);

-- Sample proactive intervention: Frustration detection
INSERT OR IGNORE INTO brain_proactive_interventions (
    intervention_id,
    brain_id,
    learner_id,
    session_id,
    trigger_type,
    intervention_type,
    message,
    parameters,
    timestamp,
    learner_response,
    response_timestamp,
    effectiveness,
    follow_up_observed
) VALUES (
    'int_sample_001',
    'brain_demo_001',
    'learner_demo_001',
    'session_001',
    'frustration',
    'offer_hint_or_break',
    'I notice these 3 problems have been tricky. Would you like a hint, or should we take a quick break?',
    '{"consecutive_errors": 3, "options": ["hint", "break"]}',
    datetime('now', '-10 minutes'),
    'accepted',
    datetime('now', '-9 minutes'),
    0.85,
    1
);

-- Sample proactive intervention: Success momentum
INSERT OR IGNORE INTO brain_proactive_interventions (
    intervention_id,
    brain_id,
    learner_id,
    session_id,
    trigger_type,
    intervention_type,
    message,
    parameters,
    timestamp,
    learner_response,
    effectiveness,
    follow_up_observed
) VALUES (
    'int_sample_002',
    'brain_demo_001',
    'learner_demo_001',
    'session_001',
    'success_momentum',
    'offer_challenge',
    'Amazing! You got 4 in a row correct! 🌟 Ready for a challenge problem?',
    '{"consecutive_successes": 4, "options": ["challenge", "continue"]}',
    datetime('now', '-5 minutes'),
    'rejected',
    0.3,
    1
);

-- Sample session monitoring record
INSERT OR IGNORE INTO brain_session_monitoring (
    monitor_id,
    brain_id,
    learner_id,
    session_id,
    monitoring_start,
    monitoring_end,
    baseline_metrics,
    final_metrics,
    total_alerts,
    total_state_changes,
    interventions_count,
    monitoring_duration_seconds,
    status
) VALUES (
    'monitor_sample_001',
    'brain_demo_001',
    'learner_demo_001',
    'session_001',
    datetime('now', '-30 minutes'),
    datetime('now', '-5 minutes'),
    '{"accuracy": 0.75, "average_speed": 45, "engagement": "high"}',
    '{"accuracy": 0.82, "average_speed": 40, "engagement": "moderate"}',
    3,
    5,
    2,
    1500,
    'completed'
);

-- Sample trigger detection: Frustration
INSERT OR IGNORE INTO brain_trigger_detections (
    detection_id,
    brain_id,
    learner_id,
    session_id,
    trigger_type,
    condition_met,
    severity,
    confidence,
    context,
    reasoning,
    detected_at,
    intervention_triggered,
    intervention_id
) VALUES (
    'detect_sample_001',
    'brain_demo_001',
    'learner_demo_001',
    'session_001',
    'frustration',
    1,
    'medium',
    0.75,
    '{"consecutive_errors": 3, "error_rate": 0.6}',
    'Detected 3 consecutive errors, indicating frustration',
    datetime('now', '-10 minutes'),
    1,
    'int_sample_001'
);

-- Sample trigger detection: Success momentum
INSERT OR IGNORE INTO brain_trigger_detections (
    detection_id,
    brain_id,
    learner_id,
    session_id,
    trigger_type,
    condition_met,
    severity,
    confidence,
    context,
    reasoning,
    detected_at,
    intervention_triggered,
    intervention_id
) VALUES (
    'detect_sample_002',
    'brain_demo_001',
    'learner_demo_001',
    'session_001',
    'success_momentum',
    1,
    'medium',
    0.82,
    '{"consecutive_successes": 4, "accuracy": 0.9}',
    '4 consecutive successes, learner building confidence',
    datetime('now', '-5 minutes'),
    1,
    'int_sample_002'
);


-- ====================================================================
-- VIEWS FOR COMMON QUERIES
-- ====================================================================

-- View: Active monitoring sessions
CREATE VIEW IF NOT EXISTS v_active_monitoring_sessions AS
SELECT 
    monitor_id,
    brain_id,
    learner_id,
    session_id,
    monitoring_start,
    (julianday('now') - julianday(monitoring_start)) * 86400 as duration_seconds,
    total_alerts,
    interventions_count
FROM brain_session_monitoring
WHERE status = 'active'
ORDER BY monitoring_start DESC;

-- View: Intervention effectiveness by type
CREATE VIEW IF NOT EXISTS v_intervention_effectiveness AS
SELECT 
    intervention_type,
    COUNT(*) as total_count,
    SUM(CASE WHEN learner_response = 'accepted' THEN 1 ELSE 0 END) as accepted_count,
    SUM(CASE WHEN learner_response = 'rejected' THEN 1 ELSE 0 END) as rejected_count,
    SUM(CASE WHEN learner_response = 'ignored' THEN 1 ELSE 0 END) as ignored_count,
    AVG(effectiveness) as avg_effectiveness,
    AVG(CASE WHEN learner_response = 'accepted' THEN effectiveness END) as avg_effectiveness_when_accepted
FROM brain_proactive_interventions
WHERE effectiveness IS NOT NULL
GROUP BY intervention_type
ORDER BY avg_effectiveness DESC;

-- View: Trigger detection summary by learner
CREATE VIEW IF NOT EXISTS v_trigger_summary_by_learner AS
SELECT 
    learner_id,
    trigger_type,
    COUNT(*) as total_detections,
    SUM(CASE WHEN condition_met = 1 THEN 1 ELSE 0 END) as conditions_met,
    SUM(CASE WHEN intervention_triggered = 1 THEN 1 ELSE 0 END) as interventions_triggered,
    AVG(confidence) as avg_confidence,
    MAX(detected_at) as last_detected
FROM brain_trigger_detections
GROUP BY learner_id, trigger_type
ORDER BY learner_id, total_detections DESC;

-- View: Recent interventions (last 24 hours)
CREATE VIEW IF NOT EXISTS v_recent_interventions AS
SELECT 
    intervention_id,
    brain_id,
    learner_id,
    session_id,
    trigger_type,
    intervention_type,
    message,
    timestamp,
    learner_response,
    effectiveness
FROM brain_proactive_interventions
WHERE timestamp >= datetime('now', '-24 hours')
ORDER BY timestamp DESC;


-- ====================================================================
-- CLEANUP FUNCTION (for development/testing)
-- ====================================================================

-- To reset monitoring data for a specific learner:
-- DELETE FROM brain_proactive_interventions WHERE learner_id = 'learner_xxx';
-- DELETE FROM brain_session_monitoring WHERE learner_id = 'learner_xxx';
-- DELETE FROM brain_trigger_detections WHERE learner_id = 'learner_xxx';
