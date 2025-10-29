"""
Database Schema for Tool Executor
Stores tool definitions, executions, and effectiveness tracking
"""

-- Table: brain_tool_executions
-- Stores records of all autonomous tool executions
CREATE TABLE IF NOT EXISTS brain_tool_executions (
    execution_id VARCHAR(255) PRIMARY KEY,
    brain_id VARCHAR(255) NOT NULL,
    learner_id VARCHAR(255) NOT NULL,
    tool_name VARCHAR(100) NOT NULL,
    parameters JSON NOT NULL,
    timestamp TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    outcome JSON,
    effectiveness_rating FLOAT,
    learner_response TEXT,
    execution_duration_ms INTEGER,
    error TEXT,
    success BOOLEAN DEFAULT TRUE,
    FOREIGN KEY (brain_id) REFERENCES ai_brains(brain_id),
    FOREIGN KEY (learner_id) REFERENCES learners(learner_id)
);

CREATE INDEX idx_tool_executions_brain ON brain_tool_executions(brain_id);
CREATE INDEX idx_tool_executions_learner ON brain_tool_executions(learner_id);
CREATE INDEX idx_tool_executions_tool ON brain_tool_executions(tool_name);
CREATE INDEX idx_tool_executions_timestamp ON brain_tool_executions(timestamp);

-- Table: brain_tool_decisions
-- Stores decision-making process for tool use
CREATE TABLE IF NOT EXISTS brain_tool_decisions (
    decision_id VARCHAR(255) PRIMARY KEY,
    brain_id VARCHAR(255) NOT NULL,
    learner_id VARCHAR(255) NOT NULL,
    should_use BOOLEAN NOT NULL,
    tool_name VARCHAR(100),
    parameters JSON,
    reasoning TEXT NOT NULL,
    confidence FLOAT NOT NULL,
    alternatives_considered JSON,
    expected_impact TEXT,
    requires_approval BOOLEAN DEFAULT FALSE,
    urgency VARCHAR(20) DEFAULT 'low',
    timestamp TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    execution_id VARCHAR(255),
    FOREIGN KEY (brain_id) REFERENCES ai_brains(brain_id),
    FOREIGN KEY (learner_id) REFERENCES learners(learner_id),
    FOREIGN KEY (execution_id) REFERENCES brain_tool_executions(execution_id)
);

CREATE INDEX idx_tool_decisions_brain ON brain_tool_decisions(brain_id);
CREATE INDEX idx_tool_decisions_learner ON brain_tool_decisions(learner_id);
CREATE INDEX idx_tool_decisions_timestamp ON brain_tool_decisions(timestamp);

-- Table: brain_tool_effectiveness
-- Tracks effectiveness of tools by context for learning
CREATE TABLE IF NOT EXISTS brain_tool_effectiveness (
    record_id VARCHAR(255) PRIMARY KEY,
    brain_id VARCHAR(255) NOT NULL,
    tool_name VARCHAR(100) NOT NULL,
    context_type VARCHAR(50) NOT NULL, -- frustration/errors/attention/etc
    context_value VARCHAR(100) NOT NULL,
    total_uses INTEGER DEFAULT 0,
    successful_uses INTEGER DEFAULT 0,
    average_effectiveness FLOAT DEFAULT 0.5,
    last_updated TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (brain_id) REFERENCES ai_brains(brain_id),
    UNIQUE (brain_id, tool_name, context_type, context_value)
);

CREATE INDEX idx_tool_effectiveness_brain ON brain_tool_effectiveness(brain_id);
CREATE INDEX idx_tool_effectiveness_tool ON brain_tool_effectiveness(tool_name);

-- Table: brain_autonomy_settings
-- Stores parent-configured autonomy levels and permissions
CREATE TABLE IF NOT EXISTS brain_autonomy_settings (
    setting_id VARCHAR(255) PRIMARY KEY,
    brain_id VARCHAR(255) NOT NULL,
    learner_id VARCHAR(255) NOT NULL,
    autonomy_level VARCHAR(20) NOT NULL DEFAULT 'guided', -- supervised/guided/autonomous
    allowed_tools JSON NOT NULL DEFAULT '[]',
    max_interventions_per_session INTEGER DEFAULT 5,
    require_approval_for JSON NOT NULL DEFAULT '["request_parent_support"]',
    emergency_escalation_enabled BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (brain_id) REFERENCES ai_brains(brain_id),
    FOREIGN KEY (learner_id) REFERENCES learners(learner_id),
    UNIQUE (brain_id, learner_id)
);

CREATE INDEX idx_autonomy_settings_brain ON brain_autonomy_settings(brain_id);
CREATE INDEX idx_autonomy_settings_learner ON brain_autonomy_settings(learner_id);

-- Table: brain_tool_approvals
-- Stores pending and completed tool approvals
CREATE TABLE IF NOT EXISTS brain_tool_approvals (
    approval_id VARCHAR(255) PRIMARY KEY,
    brain_id VARCHAR(255) NOT NULL,
    learner_id VARCHAR(255) NOT NULL,
    decision_id VARCHAR(255) NOT NULL,
    tool_name VARCHAR(100) NOT NULL,
    parameters JSON NOT NULL,
    reasoning TEXT NOT NULL,
    status VARCHAR(20) DEFAULT 'pending', -- pending/approved/rejected
    requested_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    responded_at TIMESTAMP,
    responder_id VARCHAR(255),
    responder_type VARCHAR(20), -- parent/teacher/admin
    response_notes TEXT,
    FOREIGN KEY (brain_id) REFERENCES ai_brains(brain_id),
    FOREIGN KEY (learner_id) REFERENCES learners(learner_id),
    FOREIGN KEY (decision_id) REFERENCES brain_tool_decisions(decision_id)
);

CREATE INDEX idx_tool_approvals_brain ON brain_tool_approvals(brain_id);
CREATE INDEX idx_tool_approvals_learner ON brain_tool_approvals(learner_id);
CREATE INDEX idx_tool_approvals_status ON brain_tool_approvals(status);
CREATE INDEX idx_tool_approvals_requested ON brain_tool_approvals(requested_at);

-- Sample data: Default autonomy settings
INSERT OR IGNORE INTO brain_autonomy_settings (
    setting_id,
    brain_id,
    learner_id,
    autonomy_level,
    allowed_tools,
    max_interventions_per_session,
    require_approval_for
) VALUES (
    'default_autonomy_001',
    'brain_default',
    'learner_default',
    'guided',
    '["recommend_break", "fetch_related_content", "adjust_difficulty"]',
    5,
    '["request_parent_support", "update_learning_path", "trigger_assessment"]'
);
