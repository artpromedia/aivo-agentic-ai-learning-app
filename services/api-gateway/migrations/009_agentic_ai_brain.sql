-- ============================================================================
-- Agentic AI Brain Database Migration
-- Version: 009
-- Description: Complete schema for autonomous goal planning, reasoning,
--              memory, tool execution, and proactive interventions
-- Date: 2025-10-29
-- Author: Aivo AI Team
-- ============================================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgvector";

-- ============================================================================
-- TABLE: brain_learning_goals
-- Purpose: Stores autonomous goals set by AI Brain
-- ============================================================================

CREATE TABLE IF NOT EXISTS brain_learning_goals (
    goal_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    brain_id UUID NOT NULL REFERENCES brain_instances(brain_id) ON DELETE CASCADE,
    learner_id UUID NOT NULL,
    
    -- Goal definition
    goal_type VARCHAR(50) NOT NULL CHECK (goal_type IN (
        'skill_mastery', 'concept_understanding', 'fluency_building',
        'remediation', 'acceleration', 'iep_aligned'
    )),
    target_skill VARCHAR(200) NOT NULL,
    subject VARCHAR(100) NOT NULL,
    current_level DECIMAL(3,2) CHECK (current_level BETWEEN 0 AND 1),
    target_level DECIMAL(3,2) CHECK (target_level BETWEEN 0 AND 1),
    
    -- Alignment
    aligned_iep_goals JSONB DEFAULT '[]'::jsonb,
    district_standards JSONB DEFAULT '[]'::jsonb,
    
    -- Planning
    estimated_sessions INTEGER,
    estimated_weeks INTEGER,
    milestones JSONB DEFAULT '[]'::jsonb,
    strategies JSONB DEFAULT '[]'::jsonb,
    
    -- Progress tracking
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    target_date DATE,
    progress DECIMAL(3,2) DEFAULT 0.00 CHECK (progress BETWEEN 0 AND 1),
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN (
        'active', 'achieved', 'paused', 'abandoned', 'adjusted'
    )),
    obstacles JSONB DEFAULT '[]'::jsonb,
    adaptations_made JSONB DEFAULT '[]'::jsonb,
    
    -- AI metadata
    confidence_score DECIMAL(3,2) CHECK (confidence_score BETWEEN 0 AND 1),
    reasoning TEXT,
    created_by VARCHAR(20) DEFAULT 'ai_brain' CHECK (created_by IN (
        'ai_brain', 'parent', 'teacher', 'system'
    )),
    parent_approved BOOLEAN DEFAULT FALSE,
    
    -- Audit
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    achieved_at TIMESTAMP
);

CREATE INDEX idx_brain_goals_brain_id ON brain_learning_goals(brain_id);
CREATE INDEX idx_brain_goals_status ON brain_learning_goals(status);
CREATE INDEX idx_brain_goals_learner ON brain_learning_goals(learner_id);
CREATE INDEX idx_brain_goals_subject ON brain_learning_goals(subject);

COMMENT ON TABLE brain_learning_goals IS 'Autonomous learning goals set by AI Brain';

-- ============================================================================
-- TABLE: brain_reasoning_traces
-- Purpose: Stores complete reasoning chains for explainability
-- ============================================================================

CREATE TABLE IF NOT EXISTS brain_reasoning_traces (
    trace_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    brain_id UUID NOT NULL REFERENCES brain_instances(brain_id) ON DELETE CASCADE,
    
    -- Context
    decision_context VARCHAR(100) NOT NULL,
    situation_summary TEXT NOT NULL,
    
    -- Reasoning process
    reasoning_steps JSONB NOT NULL,  -- Array of step objects
    final_decision JSONB NOT NULL,   -- Decision object with action and parameters
    total_confidence DECIMAL(3,2) CHECK (total_confidence BETWEEN 0 AND 1),
    
    -- Timing
    started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP,
    tokens_used INTEGER,
    
    -- Audit
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_reasoning_traces_brain_id ON brain_reasoning_traces(brain_id);
CREATE INDEX idx_reasoning_traces_context ON brain_reasoning_traces(decision_context);
CREATE INDEX idx_reasoning_traces_timestamp ON brain_reasoning_traces(created_at DESC);

COMMENT ON TABLE brain_reasoning_traces IS 'Complete reasoning chains for AI decisions';

-- ============================================================================
-- TABLE: brain_episodic_memory
-- Purpose: Stores specific interaction episodes
-- ============================================================================

CREATE TABLE IF NOT EXISTS brain_episodic_memory (
    memory_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    brain_id UUID NOT NULL REFERENCES brain_instances(brain_id) ON DELETE CASCADE,
    
    -- Episode details
    timestamp TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    event_type VARCHAR(50) NOT NULL CHECK (event_type IN (
        'interaction', 'intervention', 'breakthrough', 'struggle',
        'success', 'failure', 'behavioral_event', 'emotional_event'
    )),
    context JSONB NOT NULL,  -- Who, what, where, when
    outcome TEXT,
    lessons_learned JSONB DEFAULT '[]'::jsonb,
    
    -- Importance
    importance_score DECIMAL(3,2) NOT NULL DEFAULT 0.50 
        CHECK (importance_score BETWEEN 0 AND 1),
    
    -- Vector search
    embedding_vector vector(1536),  -- OpenAI embedding dimension
    
    -- Audit
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_episodic_memory_brain_id ON brain_episodic_memory(brain_id);
CREATE INDEX idx_episodic_memory_event_type ON brain_episodic_memory(event_type);
CREATE INDEX idx_episodic_memory_timestamp ON brain_episodic_memory(timestamp DESC);
CREATE INDEX idx_episodic_memory_importance ON brain_episodic_memory(importance_score DESC);

-- Vector similarity search index (IVFFlat for performance)
CREATE INDEX idx_episodic_memory_vector ON brain_episodic_memory 
    USING ivfflat (embedding_vector vector_cosine_ops)
    WITH (lists = 100);

COMMENT ON TABLE brain_episodic_memory IS 'Specific interaction episodes for retrieval';

-- ============================================================================
-- TABLE: brain_semantic_memory
-- Purpose: Stores generalized knowledge about learner
-- ============================================================================

CREATE TABLE IF NOT EXISTS brain_semantic_memory (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    brain_id UUID NOT NULL REFERENCES brain_instances(brain_id) ON DELETE CASCADE,
    
    -- Knowledge
    knowledge_type VARCHAR(50) NOT NULL CHECK (knowledge_type IN (
        'preference', 'strength', 'weakness', 'pattern', 
        'strategy_effectiveness', 'behavioral_trait', 'learning_style'
    )),
    statement TEXT NOT NULL,  -- "Learner prefers visual explanations"
    confidence DECIMAL(3,2) CHECK (confidence BETWEEN 0 AND 1),
    
    -- Evidence
    supporting_evidence JSONB DEFAULT '[]'::jsonb,  -- Array of memory_ids
    times_confirmed INTEGER DEFAULT 1,
    
    -- Audit
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_semantic_memory_brain_id ON brain_semantic_memory(brain_id);
CREATE INDEX idx_semantic_memory_type ON brain_semantic_memory(knowledge_type);
CREATE INDEX idx_semantic_memory_confidence ON brain_semantic_memory(confidence DESC);

COMMENT ON TABLE brain_semantic_memory IS 'Generalized knowledge about learner';

-- ============================================================================
-- TABLE: brain_tool_executions
-- Purpose: Audit trail of autonomous tool use
-- ============================================================================

CREATE TABLE IF NOT EXISTS brain_tool_executions (
    execution_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    brain_id UUID NOT NULL REFERENCES brain_instances(brain_id) ON DELETE CASCADE,
    
    -- Tool details
    tool_name VARCHAR(100) NOT NULL,
    parameters JSONB NOT NULL,
    
    -- Execution
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    outcome TEXT,
    effectiveness_rating DECIMAL(3,2) CHECK (effectiveness_rating BETWEEN 0 AND 1),
    learner_response VARCHAR(50),
    execution_time_ms INTEGER,
    
    -- Audit
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_tool_executions_brain_id ON brain_tool_executions(brain_id);
CREATE INDEX idx_tool_executions_tool_name ON brain_tool_executions(tool_name);
CREATE INDEX idx_tool_executions_timestamp ON brain_tool_executions(timestamp DESC);

COMMENT ON TABLE brain_tool_executions IS 'Audit trail of autonomous tool usage';

-- ============================================================================
-- TABLE: brain_proactive_interventions
-- Purpose: Log of all autonomous interventions
-- ============================================================================

CREATE TABLE IF NOT EXISTS brain_proactive_interventions (
    intervention_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    brain_id UUID NOT NULL REFERENCES brain_instances(brain_id) ON DELETE CASCADE,
    session_id UUID NOT NULL,
    
    -- Trigger
    trigger_type VARCHAR(50) NOT NULL CHECK (trigger_type IN (
        'frustration', 'disengagement', 'success_momentum',
        'fatigue_pattern', 'stuck_on_problem', 'breakthrough_moment'
    )),
    trigger_confidence DECIMAL(3,2) CHECK (trigger_confidence BETWEEN 0 AND 1),
    
    -- Intervention
    intervention_type VARCHAR(50) NOT NULL CHECK (intervention_type IN (
        'unsolicited_hint', 'break_suggestion', 'difficulty_adjustment',
        'encouragement', 'resource_recommendation', 'parent_notification'
    )),
    message TEXT NOT NULL,
    parameters JSONB DEFAULT '{}'::jsonb,
    
    -- Response
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    learner_response VARCHAR(20) CHECK (learner_response IN (
        'accepted', 'rejected', 'ignored', 'dismissed'
    )),
    response_time_seconds INTEGER,
    was_effective BOOLEAN,
    
    -- Reasoning
    reasoning TEXT,
    
    -- Audit
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_interventions_brain_id ON brain_proactive_interventions(brain_id);
CREATE INDEX idx_interventions_session_id ON brain_proactive_interventions(session_id);
CREATE INDEX idx_interventions_trigger_type ON brain_proactive_interventions(trigger_type);
CREATE INDEX idx_interventions_timestamp ON brain_proactive_interventions(timestamp DESC);
CREATE INDEX idx_interventions_effectiveness ON brain_proactive_interventions(was_effective);

COMMENT ON TABLE brain_proactive_interventions IS 'Log of autonomous interventions';

-- ============================================================================
-- TABLE: brain_state_snapshots
-- Purpose: Periodic snapshots of learner state for monitoring
-- ============================================================================

CREATE TABLE IF NOT EXISTS brain_state_snapshots (
    snapshot_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    brain_id UUID NOT NULL REFERENCES brain_instances(brain_id) ON DELETE CASCADE,
    session_id UUID NOT NULL,
    
    -- Timing
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Metrics (JSONB for flexibility)
    performance_metrics JSONB NOT NULL,  -- accuracy, speed, completion_rate, etc.
    engagement_metrics JSONB NOT NULL,   -- time_on_task, interaction_freq, etc.
    emotional_indicators JSONB NOT NULL, -- frustration, confidence, stress, etc.
    fatigue_level DECIMAL(3,2) CHECK (fatigue_level BETWEEN 0 AND 1),
    
    -- Audit
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_state_snapshots_brain_id ON brain_state_snapshots(brain_id);
CREATE INDEX idx_state_snapshots_session_id ON brain_state_snapshots(session_id);
CREATE INDEX idx_state_snapshots_timestamp ON brain_state_snapshots(timestamp DESC);

COMMENT ON TABLE brain_state_snapshots IS 'Periodic learner state snapshots';

-- ============================================================================
-- TABLE: brain_intervention_policies
-- Purpose: Per-learner configuration for autonomous behavior
-- ============================================================================

CREATE TABLE IF NOT EXISTS brain_intervention_policies (
    brain_id UUID PRIMARY KEY REFERENCES brain_instances(brain_id) ON DELETE CASCADE,
    
    -- Policy settings
    autonomy_level INTEGER NOT NULL DEFAULT 2 CHECK (autonomy_level BETWEEN 1 AND 3),
    max_interventions_per_session INTEGER DEFAULT 4,
    min_time_between_interventions INTEGER DEFAULT 5,  -- minutes
    
    -- Enabled triggers
    enabled_triggers JSONB DEFAULT '["frustration", "success_momentum", "breakthrough_moment"]'::jsonb,
    
    -- Control
    disabled_by_learner BOOLEAN DEFAULT FALSE,
    
    -- Audit
    parent_configured_at TIMESTAMP,
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON TABLE brain_intervention_policies IS 'Intervention policy configuration';

-- ============================================================================
-- SAMPLE DATA for Testing
-- ============================================================================

-- Sample learning goal
INSERT INTO brain_learning_goals (
    goal_id, brain_id, learner_id, goal_type, target_skill, subject,
    current_level, target_level, estimated_sessions, estimated_weeks,
    confidence_score, reasoning, status
) VALUES (
    uuid_generate_v4(),
    (SELECT brain_id FROM brain_instances LIMIT 1),
    uuid_generate_v4(),
    'skill_mastery',
    'Addition with regrouping (2-digit)',
    'Mathematics',
    0.45,
    0.85,
    12,
    3,
    0.82,
    'Learner shows strong number sense but struggles with carrying. Targeted practice with visual aids should improve skill to mastery level.',
    'active'
) ON CONFLICT DO NOTHING;

-- Sample reasoning trace
INSERT INTO brain_reasoning_traces (
    trace_id, brain_id, decision_context, situation_summary,
    reasoning_steps, final_decision, total_confidence
) VALUES (
    uuid_generate_v4(),
    (SELECT brain_id FROM brain_instances LIMIT 1),
    'intervention_decision',
    'Learner has made 3 consecutive errors on fraction problems',
    '[
        {"step": 1, "thought": "Detected frustration pattern", "confidence": 0.85},
        {"step": 2, "thought": "Last hint was 8 minutes ago", "confidence": 0.90},
        {"step": 3, "thought": "ADHD diagnosis suggests proactive support helpful", "confidence": 0.75},
        {"step": 4, "thought": "Parent autonomy level set to full", "confidence": 1.0}
    ]'::jsonb,
    '{
        "action": "offer_hint",
        "parameters": {"hint_type": "visual", "concept": "equivalent_fractions"},
        "reasoning": "Proactive hint appropriate given frustration, diagnosis, and timing"
    }'::jsonb,
    0.88
) ON CONFLICT DO NOTHING;

-- Sample episodic memory
INSERT INTO brain_episodic_memory (
    memory_id, brain_id, event_type, context, outcome,
    lessons_learned, importance_score
) VALUES (
    uuid_generate_v4(),
    (SELECT brain_id FROM brain_instances LIMIT 1),
    'breakthrough',
    '{
        "timestamp": "2025-10-29T10:30:00Z",
        "activity": "fraction_equivalence",
        "trigger": "visual_model_showed",
        "learner_state": "struggling_then_sudden_understanding"
    }'::jsonb,
    'Learner suddenly understood fraction equivalence after seeing pie chart visual',
    '[
        "Visual models particularly effective for this learner",
        "Breakthrough happened after 4 attempts with increasing scaffolding"
    ]'::jsonb,
    0.92
) ON CONFLICT DO NOTHING;

-- Sample semantic memory
INSERT INTO brain_semantic_memory (
    id, brain_id, knowledge_type, statement, confidence,
    supporting_evidence, times_confirmed
) VALUES (
    uuid_generate_v4(),
    (SELECT brain_id FROM brain_instances LIMIT 1),
    'preference',
    'Learner strongly prefers visual explanations over verbal descriptions',
    0.87,
    '["memory_id_1", "memory_id_2", "memory_id_3"]'::jsonb,
    5
) ON CONFLICT DO NOTHING;

-- Sample tool execution
INSERT INTO brain_tool_executions (
    execution_id, brain_id, tool_name, parameters,
    outcome, effectiveness_rating, learner_response, execution_time_ms
) VALUES (
    uuid_generate_v4(),
    (SELECT brain_id FROM brain_instances LIMIT 1),
    'generate_scaffold_hint',
    '{"problem_id": "prob_123", "hint_level": "medium", "learning_style": "visual"}'::jsonb,
    'Generated visual step-by-step hint. Learner solved problem after viewing hint.',
    0.85,
    'accepted',
    450
) ON CONFLICT DO NOTHING;

-- Sample intervention policy
INSERT INTO brain_intervention_policies (
    brain_id, autonomy_level, max_interventions_per_session,
    min_time_between_interventions, enabled_triggers
) VALUES (
    (SELECT brain_id FROM brain_instances LIMIT 1),
    3,
    4,
    5,
    '["frustration", "success_momentum", "disengagement", "breakthrough_moment"]'::jsonb
) ON CONFLICT DO NOTHING;

-- ============================================================================
-- ROLLBACK SCRIPT (run in case of issues)
-- ============================================================================

/*
DROP TABLE IF EXISTS brain_intervention_policies CASCADE;
DROP TABLE IF EXISTS brain_state_snapshots CASCADE;
DROP TABLE IF EXISTS brain_proactive_interventions CASCADE;
DROP TABLE IF EXISTS brain_tool_executions CASCADE;
DROP TABLE IF EXISTS brain_semantic_memory CASCADE;
DROP TABLE IF EXISTS brain_episodic_memory CASCADE;
DROP TABLE IF EXISTS brain_reasoning_traces CASCADE;
DROP TABLE IF EXISTS brain_learning_goals CASCADE;
*/

-- ============================================================================
-- END OF MIGRATION
-- ============================================================================
