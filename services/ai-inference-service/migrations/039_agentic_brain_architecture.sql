-- Migration 039: Agentic AI Brain Architecture Tables
-- Enables autonomous goal planning, reasoning, memory, and proactive agents

-- Learning Goals set autonomously by Brain
CREATE TABLE IF NOT EXISTS brain_learning_goals (
    goal_id UUID PRIMARY KEY,
    brain_id VARCHAR(255) NOT NULL,
    learner_id VARCHAR(255) NOT NULL,
    goal_type VARCHAR(50), -- skill_building, confidence, behavior, foundation
    target_skill VARCHAR(255),
    current_level FLOAT,
    target_level FLOAT,
    strategies JSONB, -- Teaching strategies to use
    milestones JSONB, -- Progress checkpoints
    progress FLOAT DEFAULT 0.0,
    reasoning TEXT, -- Why this goal was chosen
    confidence FLOAT, -- AI confidence in achievability
    status VARCHAR(20) DEFAULT 'active', -- active, completed, abandoned
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_brain_goals_brain_id ON brain_learning_goals(brain_id);
CREATE INDEX idx_brain_goals_learner_id ON brain_learning_goals(learner_id);
CREATE INDEX idx_brain_goals_status ON brain_learning_goals(status);

-- Reasoning Traces for Explainability (ReAct pattern)
CREATE TABLE IF NOT EXISTS brain_reasoning_traces (
    trace_id UUID PRIMARY KEY,
    brain_id VARCHAR(255) NOT NULL,
    decision_context VARCHAR(255), -- What decision was being made
    decision_type VARCHAR(100), -- teaching_strategy, intervention, etc.
    reasoning_steps JSONB, -- Full thought → action → observation chain
    final_decision JSONB, -- The actual decision made
    confidence FLOAT,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_reasoning_traces_brain_id ON brain_reasoning_traces(brain_id);
CREATE INDEX idx_reasoning_traces_type ON brain_reasoning_traces(decision_type);
CREATE INDEX idx_reasoning_traces_created ON brain_reasoning_traces(created_at);

-- Episodic Memory (Remember specific interactions)
CREATE TABLE IF NOT EXISTS brain_episodic_memory (
    memory_id UUID PRIMARY KEY,
    brain_id VARCHAR(255) NOT NULL,
    event_type VARCHAR(100), -- session_interaction, error_pattern, breakthrough, frustration
    context JSONB, -- What was happening
    outcome TEXT, -- What happened as a result
    lessons_learned JSONB, -- Insights gained
    importance_score FLOAT, -- How significant this memory is (0.0-1.0)
    timestamp TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_episodic_memory_brain_id ON brain_episodic_memory(brain_id);
CREATE INDEX idx_episodic_memory_type ON brain_episodic_memory(event_type);
CREATE INDEX idx_episodic_memory_importance ON brain_episodic_memory(importance_score);
CREATE INDEX idx_episodic_memory_timestamp ON brain_episodic_memory(timestamp);

-- Semantic Memory (Learned patterns about learner)
CREATE TABLE IF NOT EXISTS brain_semantic_memory (
    memory_id UUID PRIMARY KEY,
    brain_id VARCHAR(255) NOT NULL,
    knowledge_type VARCHAR(50), -- pattern, preference, trigger, strength, weakness
    statement TEXT NOT NULL, -- e.g., "Learns better in morning", "Visual aids improve comprehension 40%"
    confidence FLOAT, -- How certain we are about this knowledge
    supporting_evidence JSONB, -- Sessions/data that support this
    last_updated TIMESTAMP DEFAULT NOW(),
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_semantic_memory_brain_id ON brain_semantic_memory(brain_id);
CREATE INDEX idx_semantic_memory_type ON brain_semantic_memory(knowledge_type);
CREATE INDEX idx_semantic_memory_confidence ON brain_semantic_memory(confidence);

-- Proactive Interventions (Autonomous actions by Brain)
CREATE TABLE IF NOT EXISTS brain_interventions (
    intervention_id UUID PRIMARY KEY,
    brain_id VARCHAR(255) NOT NULL,
    learner_id VARCHAR(255) NOT NULL,
    session_id VARCHAR(255),
    intervention_type VARCHAR(100), -- break_suggestion, hint_offer, difficulty_adjust, support_request
    trigger_reason TEXT, -- Why Brain decided to intervene
    action_taken JSONB, -- What the Brain did
    learner_response VARCHAR(50), -- accepted, rejected, ignored
    effectiveness_score FLOAT, -- How helpful was it (from learner feedback)
    reasoning_trace_id UUID, -- Link to reasoning that led to this
    created_at TIMESTAMP DEFAULT NOW(),
    FOREIGN KEY (reasoning_trace_id) REFERENCES brain_reasoning_traces(trace_id)
);

CREATE INDEX idx_interventions_brain_id ON brain_interventions(brain_id);
CREATE INDEX idx_interventions_learner_id ON brain_interventions(learner_id);
CREATE INDEX idx_interventions_type ON brain_interventions(intervention_type);
CREATE INDEX idx_interventions_effectiveness ON brain_interventions(effectiveness_score);
CREATE INDEX idx_interventions_created ON brain_interventions(created_at);

-- Tool Execution Log (Track autonomous tool usage)
CREATE TABLE IF NOT EXISTS brain_tool_executions (
    execution_id UUID PRIMARY KEY,
    brain_id VARCHAR(255) NOT NULL,
    tool_name VARCHAR(100) NOT NULL, -- adjust_difficulty, recommend_break, etc.
    parameters JSONB, -- Parameters passed to tool
    result JSONB, -- Tool execution result
    success BOOLEAN,
    reasoning TEXT, -- Why Brain decided to use this tool
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_tool_executions_brain_id ON brain_tool_executions(brain_id);
CREATE INDEX idx_tool_executions_tool ON brain_tool_executions(tool_name);
CREATE INDEX idx_tool_executions_success ON brain_tool_executions(success);
CREATE INDEX idx_tool_executions_created ON brain_tool_executions(created_at);

-- Autonomous Cycles (Track when Brain runs its agentic loops)
CREATE TABLE IF NOT EXISTS brain_autonomous_cycles (
    cycle_id UUID PRIMARY KEY,
    brain_id VARCHAR(255) NOT NULL,
    cycle_type VARCHAR(50), -- daily_reflection, goal_review, strategy_adjustment
    actions_taken JSONB, -- What the Brain decided to do
    insights_gained JSONB, -- What the Brain learned
    next_cycle_scheduled TIMESTAMP,
    duration_seconds INTEGER,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_autonomous_cycles_brain_id ON brain_autonomous_cycles(brain_id);
CREATE INDEX idx_autonomous_cycles_type ON brain_autonomous_cycles(cycle_type);
CREATE INDEX idx_autonomous_cycles_next ON brain_autonomous_cycles(next_cycle_scheduled);
CREATE INDEX idx_autonomous_cycles_created ON brain_autonomous_cycles(created_at);

-- Comments for documentation
COMMENT ON TABLE brain_learning_goals IS 'Goals autonomously generated by AI Brain for each learner';
COMMENT ON TABLE brain_reasoning_traces IS 'ReAct reasoning chains for explainability and auditing';
COMMENT ON TABLE brain_episodic_memory IS 'Specific remembered interactions and events';
COMMENT ON TABLE brain_semantic_memory IS 'Learned patterns and generalizations about learner';
COMMENT ON TABLE brain_interventions IS 'Proactive actions initiated by Brain without prompting';
COMMENT ON TABLE brain_tool_executions IS 'Log of autonomous tool usage by Brain';
COMMENT ON TABLE brain_autonomous_cycles IS 'Scheduled self-improvement and reflection cycles';
