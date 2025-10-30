-- Migration 010: Agentic AI Brain - Memory and Goals Tables
-- Purpose: Create tables for brain memory, learning goals, and autonomous operations
-- Date: 2025-10-29
-- Related: AGENTIC_BRAIN_MANAGER_INTEGRATION_COMPLETE.md

-- ============================================================================
-- TABLE: brain_memories
-- Purpose: Store episodic memories for each brain to inform future decisions
-- ============================================================================
CREATE TABLE IF NOT EXISTS brain_memories (
    memory_id VARCHAR(50) PRIMARY KEY,
    brain_id VARCHAR(50) NOT NULL,
    learner_id VARCHAR(50) NOT NULL,
    
    -- Memory content
    event_type VARCHAR(50) NOT NULL, -- 'session_completed', 'intervention', 'decision_*', 'reflection', etc.
    context JSONB NOT NULL, -- Full context of the event
    outcome VARCHAR(50) NOT NULL, -- 'successful', 'failed', 'pending', 'completed'
    lessons_learned JSONB DEFAULT '[]'::JSONB, -- Array of insights extracted
    
    -- Memory metadata
    importance FLOAT DEFAULT 0.5, -- 0.0-1.0, used for memory consolidation
    embedding VECTOR(1536), -- Semantic embedding for similarity search (PostgreSQL pgvector)
    access_count INTEGER DEFAULT 0, -- How often this memory was recalled
    last_accessed_at TIMESTAMP,
    
    -- Timestamps
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP, -- For memory decay/consolidation
    
    -- Indexes
    CONSTRAINT fk_brain FOREIGN KEY (brain_id) REFERENCES brains(brain_id) ON DELETE CASCADE,
    CONSTRAINT fk_learner FOREIGN KEY (learner_id) REFERENCES learners(learner_id) ON DELETE CASCADE
);

CREATE INDEX idx_brain_memories_brain ON brain_memories(brain_id);
CREATE INDEX idx_brain_memories_learner ON brain_memories(learner_id);
CREATE INDEX idx_brain_memories_event_type ON brain_memories(event_type);
CREATE INDEX idx_brain_memories_importance ON brain_memories(importance DESC);
CREATE INDEX idx_brain_memories_created ON brain_memories(created_at DESC);

-- For semantic search (requires pgvector extension)
-- CREATE INDEX idx_brain_memories_embedding ON brain_memories USING ivfflat (embedding vector_cosine_ops);


-- ============================================================================
-- TABLE: brain_learning_goals
-- Purpose: Store AI-generated learning goals for each brain
-- ============================================================================
CREATE TABLE IF NOT EXISTS brain_learning_goals (
    goal_id VARCHAR(50) PRIMARY KEY,
    brain_id VARCHAR(50) NOT NULL,
    learner_id VARCHAR(50) NOT NULL,
    
    -- Goal details
    goal_type VARCHAR(50) NOT NULL, -- 'skill_building', 'iep_alignment', 'engagement', 'independence'
    target_skill VARCHAR(200) NOT NULL,
    subject VARCHAR(50) NOT NULL,
    
    -- Skill levels
    current_level FLOAT NOT NULL, -- 0-10 scale
    target_level FLOAT NOT NULL, -- 0-10 scale
    progress FLOAT DEFAULT 0.0, -- 0-100 percentage
    
    -- Timeline
    estimated_sessions INTEGER,
    estimated_weeks INTEGER,
    target_date TIMESTAMP NOT NULL,
    
    -- Alignment
    aligned_iep_goals JSONB DEFAULT '[]'::JSONB, -- Array of IEP goal IDs
    district_standards JSONB DEFAULT '[]'::JSONB, -- Array of standard codes
    
    -- Implementation
    strategies JSONB DEFAULT '[]'::JSONB, -- Teaching strategies
    diagnosis_adaptations JSONB DEFAULT '{}'::JSONB, -- Per-diagnosis adaptations
    milestones JSONB DEFAULT '[]'::JSONB, -- Array of milestone objects
    obstacles JSONB DEFAULT '[]'::JSONB, -- Identified obstacles
    
    -- Status
    status VARCHAR(20) DEFAULT 'active', -- 'active', 'completed', 'paused', 'archived'
    confidence_score FLOAT, -- AI's confidence in goal appropriateness (0-1)
    reasoning TEXT, -- AI's reasoning for this goal
    
    -- Timestamps
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP,
    
    -- Constraints
    CONSTRAINT fk_brain_goal FOREIGN KEY (brain_id) REFERENCES brains(brain_id) ON DELETE CASCADE,
    CONSTRAINT fk_learner_goal FOREIGN KEY (learner_id) REFERENCES learners(learner_id) ON DELETE CASCADE,
    CONSTRAINT check_levels CHECK (current_level >= 0 AND current_level <= 10 AND target_level >= 0 AND target_level <= 10),
    CONSTRAINT check_progress CHECK (progress >= 0 AND progress <= 100),
    CONSTRAINT check_status CHECK (status IN ('active', 'completed', 'paused', 'archived'))
);

CREATE INDEX idx_brain_goals_brain ON brain_learning_goals(brain_id);
CREATE INDEX idx_brain_goals_learner ON brain_learning_goals(learner_id);
CREATE INDEX idx_brain_goals_status ON brain_learning_goals(status);
CREATE INDEX idx_brain_goals_subject ON brain_learning_goals(subject);
CREATE INDEX idx_brain_goals_created ON brain_learning_goals(created_at DESC);
CREATE INDEX idx_brain_goals_target_date ON brain_learning_goals(target_date);


-- ============================================================================
-- TABLE: brain_action_plans
-- Purpose: Store detailed action plans for each learning goal
-- ============================================================================
CREATE TABLE IF NOT EXISTS brain_action_plans (
    plan_id VARCHAR(50) PRIMARY KEY,
    goal_id VARCHAR(50) NOT NULL,
    brain_id VARCHAR(50) NOT NULL,
    
    -- Plan structure
    scaffolding_sequence JSONB NOT NULL DEFAULT '[]'::JSONB, -- Ordered steps
    weekly_activities JSONB NOT NULL DEFAULT '{}'::JSONB, -- Week number -> activities
    progress_checkpoints JSONB NOT NULL DEFAULT '[]'::JSONB, -- Verification points
    adaptation_triggers JSONB NOT NULL DEFAULT '{}'::JSONB, -- When to adjust
    
    -- Metadata
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    last_reviewed_at TIMESTAMP,
    
    -- Constraints
    CONSTRAINT fk_goal_plan FOREIGN KEY (goal_id) REFERENCES brain_learning_goals(goal_id) ON DELETE CASCADE,
    CONSTRAINT fk_brain_plan FOREIGN KEY (brain_id) REFERENCES brains(brain_id) ON DELETE CASCADE
);

CREATE INDEX idx_action_plans_goal ON brain_action_plans(goal_id);
CREATE INDEX idx_action_plans_brain ON brain_action_plans(brain_id);


-- ============================================================================
-- TABLE: brain_goal_progress
-- Purpose: Track progress on each goal over time
-- ============================================================================
CREATE TABLE IF NOT EXISTS brain_goal_progress (
    progress_id VARCHAR(50) PRIMARY KEY,
    goal_id VARCHAR(50) NOT NULL,
    brain_id VARCHAR(50) NOT NULL,
    
    -- Progress data
    session_id VARCHAR(50), -- If tied to specific session
    progress_percentage FLOAT NOT NULL,
    skill_level_estimate FLOAT, -- Current skill level
    
    -- Evaluation
    evaluation_type VARCHAR(50) NOT NULL, -- 'automatic', 'session_based', 'manual', 'ai_assessment'
    evaluation_data JSONB DEFAULT '{}'::JSONB,
    needs_adjustment BOOLEAN DEFAULT FALSE,
    adjustment_reason TEXT,
    
    -- Timestamps
    evaluated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    -- Constraints
    CONSTRAINT fk_goal_progress FOREIGN KEY (goal_id) REFERENCES brain_learning_goals(goal_id) ON DELETE CASCADE,
    CONSTRAINT fk_brain_progress FOREIGN KEY (brain_id) REFERENCES brains(brain_id) ON DELETE CASCADE,
    CONSTRAINT check_progress_pct CHECK (progress_percentage >= 0 AND progress_percentage <= 100)
);

CREATE INDEX idx_goal_progress_goal ON brain_goal_progress(goal_id);
CREATE INDEX idx_goal_progress_brain ON brain_goal_progress(brain_id);
CREATE INDEX idx_goal_progress_evaluated ON brain_goal_progress(evaluated_at DESC);


-- ============================================================================
-- TABLE: brain_autonomous_cycles
-- Purpose: Log each autonomous cycle run for auditing
-- ============================================================================
CREATE TABLE IF NOT EXISTS brain_autonomous_cycles (
    cycle_id VARCHAR(50) PRIMARY KEY,
    brain_id VARCHAR(50) NOT NULL,
    
    -- Cycle details
    trigger VARCHAR(50) NOT NULL, -- 'scheduled', 'manual', 'milestone', 'parent_request'
    
    -- Actions taken
    sessions_analyzed INTEGER DEFAULT 0,
    reflections_stored INTEGER DEFAULT 0,
    goals_generated INTEGER DEFAULT 0,
    patterns_extracted INTEGER DEFAULT 0,
    memory_updated BOOLEAN DEFAULT FALSE,
    actions JSONB DEFAULT '[]'::JSONB, -- Array of action summaries
    
    -- Result
    status VARCHAR(20) NOT NULL, -- 'completed', 'failed', 'partial'
    error_message TEXT,
    
    -- Performance
    duration_seconds FLOAT,
    
    -- Timestamps
    started_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP,
    
    -- Constraints
    CONSTRAINT fk_brain_cycle FOREIGN KEY (brain_id) REFERENCES brains(brain_id) ON DELETE CASCADE,
    CONSTRAINT check_cycle_status CHECK (status IN ('completed', 'failed', 'partial'))
);

CREATE INDEX idx_cycles_brain ON brain_autonomous_cycles(brain_id);
CREATE INDEX idx_cycles_started ON brain_autonomous_cycles(started_at DESC);
CREATE INDEX idx_cycles_status ON brain_autonomous_cycles(status);


-- ============================================================================
-- TABLE: brain_decisions
-- Purpose: Log all AI decisions with reasoning traces
-- ============================================================================
CREATE TABLE IF NOT EXISTS brain_decisions (
    decision_id VARCHAR(50) PRIMARY KEY,
    brain_id VARCHAR(50) NOT NULL,
    learner_id VARCHAR(50) NOT NULL,
    
    -- Decision context
    decision_type VARCHAR(50) NOT NULL, -- 'intervention', 'difficulty', 'goal_adjustment', 'tool_use'
    context JSONB NOT NULL,
    
    -- Decision result
    final_decision JSONB NOT NULL, -- The actual decision made
    reasoning TEXT NOT NULL, -- AI's reasoning trace (ReAct)
    confidence FLOAT, -- Confidence score (0-1)
    
    -- Memory references
    memories_used JSONB DEFAULT '[]'::JSONB, -- Memory IDs that informed this decision
    
    -- Outcome tracking
    decision_executed BOOLEAN DEFAULT FALSE,
    execution_result VARCHAR(50), -- 'successful', 'failed', 'partially_successful', 'pending'
    execution_notes TEXT,
    
    -- Timestamps
    decided_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    executed_at TIMESTAMP,
    
    -- Constraints
    CONSTRAINT fk_brain_decision FOREIGN KEY (brain_id) REFERENCES brains(brain_id) ON DELETE CASCADE,
    CONSTRAINT fk_learner_decision FOREIGN KEY (learner_id) REFERENCES learners(learner_id) ON DELETE CASCADE
);

CREATE INDEX idx_decisions_brain ON brain_decisions(brain_id);
CREATE INDEX idx_decisions_learner ON brain_decisions(learner_id);
CREATE INDEX idx_decisions_type ON brain_decisions(decision_type);
CREATE INDEX idx_decisions_decided ON brain_decisions(decided_at DESC);


-- ============================================================================
-- TABLE: brain_intervention_policies
-- Purpose: Store parent-configured autonomy settings for each brain
-- ============================================================================
CREATE TABLE IF NOT EXISTS brain_intervention_policies (
    policy_id VARCHAR(50) PRIMARY KEY,
    brain_id VARCHAR(50) NOT NULL UNIQUE, -- One policy per brain
    learner_id VARCHAR(50) NOT NULL,
    
    -- Autonomy settings
    autonomy_level VARCHAR(20) NOT NULL DEFAULT 'GUIDED', -- 'MINIMAL', 'GUIDED', 'PROACTIVE', 'AUTONOMOUS'
    max_interventions_per_session INTEGER DEFAULT 5,
    min_interval_minutes FLOAT DEFAULT 3.0,
    
    -- Enabled triggers
    enabled_triggers JSONB DEFAULT '[]'::JSONB, -- Array of trigger names
    
    -- Parent preferences
    require_parent_approval BOOLEAN DEFAULT TRUE,
    notification_preferences JSONB DEFAULT '{}'::JSONB,
    
    -- Time restrictions
    active_hours JSONB DEFAULT '{}'::JSONB, -- When AI can act autonomously
    
    -- Timestamps
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    parent_consented_at TIMESTAMP, -- Explicit consent timestamp
    
    -- Constraints
    CONSTRAINT fk_brain_policy FOREIGN KEY (brain_id) REFERENCES brains(brain_id) ON DELETE CASCADE,
    CONSTRAINT fk_learner_policy FOREIGN KEY (learner_id) REFERENCES learners(learner_id) ON DELETE CASCADE,
    CONSTRAINT check_autonomy_level CHECK (autonomy_level IN ('MINIMAL', 'GUIDED', 'PROACTIVE', 'AUTONOMOUS'))
);

CREATE INDEX idx_policies_brain ON brain_intervention_policies(brain_id);
CREATE INDEX idx_policies_learner ON brain_intervention_policies(learner_id);


-- ============================================================================
-- TABLE: brain_reasoning_traces
-- Purpose: Store detailed ReAct reasoning traces for transparency
-- ============================================================================
CREATE TABLE IF NOT EXISTS brain_reasoning_traces (
    trace_id VARCHAR(50) PRIMARY KEY,
    brain_id VARCHAR(50) NOT NULL,
    decision_id VARCHAR(50), -- Link to decision if applicable
    
    -- Trace content
    task VARCHAR(200) NOT NULL,
    steps JSONB NOT NULL DEFAULT '[]'::JSONB, -- Array of {thought, action, observation}
    final_answer TEXT,
    
    -- Metadata
    total_steps INTEGER,
    duration_seconds FLOAT,
    success BOOLEAN DEFAULT TRUE,
    
    -- Timestamps
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    -- Constraints
    CONSTRAINT fk_brain_trace FOREIGN KEY (brain_id) REFERENCES brains(brain_id) ON DELETE CASCADE,
    CONSTRAINT fk_decision_trace FOREIGN KEY (decision_id) REFERENCES brain_decisions(decision_id) ON DELETE CASCADE
);

CREATE INDEX idx_traces_brain ON brain_reasoning_traces(brain_id);
CREATE INDEX idx_traces_decision ON brain_reasoning_traces(decision_id);
CREATE INDEX idx_traces_created ON brain_reasoning_traces(created_at DESC);


-- ============================================================================
-- TABLE: brain_pattern_library
-- Purpose: Store discovered patterns for each brain
-- ============================================================================
CREATE TABLE IF NOT EXISTS brain_pattern_library (
    pattern_id VARCHAR(50) PRIMARY KEY,
    brain_id VARCHAR(50) NOT NULL,
    
    -- Pattern details
    pattern_type VARCHAR(50) NOT NULL, -- 'learning', 'behavioral', 'temporal', 'contextual'
    pattern_name VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    
    -- Supporting data
    confidence FLOAT NOT NULL, -- 0-1
    occurrence_count INTEGER DEFAULT 1,
    supporting_memories JSONB DEFAULT '[]'::JSONB, -- Memory IDs
    
    -- Application
    actionable BOOLEAN DEFAULT TRUE,
    recommended_actions JSONB DEFAULT '[]'::JSONB,
    
    -- Timestamps
    discovered_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    last_observed_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    -- Constraints
    CONSTRAINT fk_brain_pattern FOREIGN KEY (brain_id) REFERENCES brains(brain_id) ON DELETE CASCADE,
    CONSTRAINT check_confidence CHECK (confidence >= 0 AND confidence <= 1)
);

CREATE INDEX idx_patterns_brain ON brain_pattern_library(brain_id);
CREATE INDEX idx_patterns_type ON brain_pattern_library(pattern_type);
CREATE INDEX idx_patterns_confidence ON brain_pattern_library(confidence DESC);


-- ============================================================================
-- VIEWS: Convenience views for common queries
-- ============================================================================

-- View: Active goals summary
CREATE OR REPLACE VIEW v_active_brain_goals AS
SELECT 
    blg.goal_id,
    blg.brain_id,
    blg.learner_id,
    blg.target_skill,
    blg.subject,
    blg.progress,
    blg.target_date,
    blg.status,
    COUNT(DISTINCT bgp.progress_id) as evaluation_count,
    MAX(bgp.evaluated_at) as last_evaluated
FROM brain_learning_goals blg
LEFT JOIN brain_goal_progress bgp ON blg.goal_id = bgp.goal_id
WHERE blg.status = 'active'
GROUP BY blg.goal_id, blg.brain_id, blg.learner_id, blg.target_skill, 
         blg.subject, blg.progress, blg.target_date, blg.status;

-- View: Brain autonomy dashboard
CREATE OR REPLACE VIEW v_brain_autonomy_dashboard AS
SELECT 
    b.brain_id,
    b.learner_id,
    bip.autonomy_level,
    COUNT(DISTINCT blg.goal_id) as active_goals,
    COUNT(DISTINCT bac.cycle_id) as total_cycles,
    COUNT(DISTINCT CASE WHEN bac.started_at > NOW() - INTERVAL '7 days' THEN bac.cycle_id END) as recent_cycles,
    COUNT(DISTINCT bd.decision_id) as total_decisions,
    COUNT(DISTINCT CASE WHEN bd.decided_at > NOW() - INTERVAL '7 days' THEN bd.decision_id END) as recent_decisions,
    MAX(bac.started_at) as last_cycle_run,
    MAX(bd.decided_at) as last_decision_made
FROM brains b
LEFT JOIN brain_intervention_policies bip ON b.brain_id = bip.brain_id
LEFT JOIN brain_learning_goals blg ON b.brain_id = blg.brain_id AND blg.status = 'active'
LEFT JOIN brain_autonomous_cycles bac ON b.brain_id = bac.brain_id
LEFT JOIN brain_decisions bd ON b.brain_id = bd.brain_id
GROUP BY b.brain_id, b.learner_id, bip.autonomy_level;

-- View: Memory importance distribution
CREATE OR REPLACE VIEW v_brain_memory_stats AS
SELECT 
    brain_id,
    COUNT(*) as total_memories,
    AVG(importance) as avg_importance,
    COUNT(CASE WHEN importance > 0.7 THEN 1 END) as high_importance_count,
    COUNT(CASE WHEN access_count > 5 THEN 1 END) as frequently_accessed_count,
    MAX(created_at) as most_recent_memory,
    AVG(access_count) as avg_access_count
FROM brain_memories
GROUP BY brain_id;


-- ============================================================================
-- FUNCTIONS: Helper functions
-- ============================================================================

-- Function: Update goal progress
CREATE OR REPLACE FUNCTION update_goal_progress(
    p_goal_id VARCHAR(50),
    p_new_progress FLOAT
) RETURNS VOID AS $$
BEGIN
    UPDATE brain_learning_goals
    SET 
        progress = p_new_progress,
        updated_at = CURRENT_TIMESTAMP,
        completed_at = CASE 
            WHEN p_new_progress >= 100 THEN CURRENT_TIMESTAMP 
            ELSE completed_at 
        END,
        status = CASE 
            WHEN p_new_progress >= 100 THEN 'completed'
            ELSE status
        END
    WHERE goal_id = p_goal_id;
END;
$$ LANGUAGE plpgsql;

-- Function: Clean old memories (retention policy)
CREATE OR REPLACE FUNCTION cleanup_old_memories() RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    -- Delete low-importance memories older than 90 days
    DELETE FROM brain_memories
    WHERE 
        importance < 0.3 
        AND created_at < NOW() - INTERVAL '90 days'
        AND access_count < 2;
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- Function: Increment memory access
CREATE OR REPLACE FUNCTION increment_memory_access(p_memory_id VARCHAR(50)) RETURNS VOID AS $$
BEGIN
    UPDATE brain_memories
    SET 
        access_count = access_count + 1,
        last_accessed_at = CURRENT_TIMESTAMP
    WHERE memory_id = p_memory_id;
END;
$$ LANGUAGE plpgsql;


-- ============================================================================
-- TRIGGERS: Auto-update timestamps
-- ============================================================================

-- Trigger for brain_learning_goals updated_at
CREATE OR REPLACE FUNCTION update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_brain_learning_goals_update
    BEFORE UPDATE ON brain_learning_goals
    FOR EACH ROW
    EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER trg_brain_action_plans_update
    BEFORE UPDATE ON brain_action_plans
    FOR EACH ROW
    EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER trg_brain_intervention_policies_update
    BEFORE UPDATE ON brain_intervention_policies
    FOR EACH ROW
    EXECUTE FUNCTION update_timestamp();


-- ============================================================================
-- INITIAL DATA: Default policy
-- ============================================================================

-- Note: Policies are created per-brain when brain is initialized
-- This is just a template reference

COMMENT ON TABLE brain_memories IS 'Episodic memories for brain learning and decision-making';
COMMENT ON TABLE brain_learning_goals IS 'AI-generated learning goals aligned with IEP and assessments';
COMMENT ON TABLE brain_action_plans IS 'Detailed action plans for achieving learning goals';
COMMENT ON TABLE brain_goal_progress IS 'Progress tracking for learning goals over time';
COMMENT ON TABLE brain_autonomous_cycles IS 'Audit log of autonomous cycle executions';
COMMENT ON TABLE brain_decisions IS 'All AI decisions with reasoning traces for transparency';
COMMENT ON TABLE brain_intervention_policies IS 'Parent-configured autonomy settings and consent';
COMMENT ON TABLE brain_reasoning_traces IS 'Detailed ReAct reasoning steps for explainability';
COMMENT ON TABLE brain_pattern_library IS 'Discovered learning patterns for each brain';

-- Migration complete
SELECT 'Migration 010 complete: Agentic AI Brain tables created successfully' AS status;
