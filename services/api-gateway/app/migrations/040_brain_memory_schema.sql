-- Migration: Brain Memory System Schema
-- Description: Tables for episodic and semantic memory storage
-- Version: 040
-- Date: 2025-10-29

-- ====================================================================
-- EPISODIC MEMORY TABLE
-- ====================================================================

CREATE TABLE IF NOT EXISTS brain_episodic_memory (
    memory_id VARCHAR(36) PRIMARY KEY,
    brain_id VARCHAR(255) NOT NULL,
    timestamp TIMESTAMP NOT NULL,
    event_type VARCHAR(100) NOT NULL,
    context TEXT,  -- JSON string
    outcome TEXT NOT NULL,
    lessons_learned TEXT,  -- JSON array
    importance_score FLOAT NOT NULL DEFAULT 0.5,
    embedding_vector TEXT,  -- JSON array for vector (1536 dimensions)
    decay_factor FLOAT NOT NULL DEFAULT 1.0,
    times_recalled INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Constraints
    CHECK (importance_score >= 0.0 AND importance_score <= 1.0),
    CHECK (decay_factor >= 0.0 AND decay_factor <= 1.0),
    CHECK (times_recalled >= 0)
);

-- Indexes for episodic memory
CREATE INDEX IF NOT EXISTS idx_episodic_brain 
    ON brain_episodic_memory(brain_id);

CREATE INDEX IF NOT EXISTS idx_episodic_timestamp 
    ON brain_episodic_memory(timestamp DESC);

CREATE INDEX IF NOT EXISTS idx_episodic_event_type 
    ON brain_episodic_memory(event_type);

CREATE INDEX IF NOT EXISTS idx_episodic_importance 
    ON brain_episodic_memory(importance_score DESC);

CREATE INDEX IF NOT EXISTS idx_episodic_brain_timestamp 
    ON brain_episodic_memory(brain_id, timestamp DESC);


-- ====================================================================
-- SEMANTIC MEMORY TABLE
-- ====================================================================

CREATE TABLE IF NOT EXISTS brain_semantic_memory (
    id VARCHAR(36) PRIMARY KEY,
    brain_id VARCHAR(255) NOT NULL,
    knowledge_type VARCHAR(50) NOT NULL,  -- preference, strategy, pattern, trigger, timing
    statement TEXT NOT NULL,
    confidence FLOAT NOT NULL DEFAULT 0.5,
    supporting_evidence TEXT,  -- JSON array of episode memory_ids
    last_updated TIMESTAMP NOT NULL,
    times_confirmed INTEGER NOT NULL DEFAULT 1,
    times_contradicted INTEGER NOT NULL DEFAULT 0,
    metadata TEXT,  -- JSON object with additional context
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Constraints
    CHECK (confidence >= 0.0 AND confidence <= 1.0),
    CHECK (times_confirmed >= 0),
    CHECK (times_contradicted >= 0),
    CHECK (knowledge_type IN ('preference', 'strategy', 'pattern', 'trigger', 'timing')),
    
    -- Unique constraint: one statement per brain
    UNIQUE(brain_id, statement)
);

-- Indexes for semantic memory
CREATE INDEX IF NOT EXISTS idx_semantic_brain 
    ON brain_semantic_memory(brain_id);

CREATE INDEX IF NOT EXISTS idx_semantic_knowledge_type 
    ON brain_semantic_memory(knowledge_type);

CREATE INDEX IF NOT EXISTS idx_semantic_confidence 
    ON brain_semantic_memory(confidence DESC);

CREATE INDEX IF NOT EXISTS idx_semantic_last_updated 
    ON brain_semantic_memory(last_updated DESC);

CREATE INDEX IF NOT EXISTS idx_semantic_brain_confidence 
    ON brain_semantic_memory(brain_id, confidence DESC);


-- ====================================================================
-- MEMORY CONSOLIDATION LOG TABLE
-- ====================================================================

CREATE TABLE IF NOT EXISTS brain_memory_consolidation_log (
    consolidation_id VARCHAR(36) PRIMARY KEY,
    brain_id VARCHAR(255) NOT NULL,
    consolidation_date TIMESTAMP NOT NULL,
    patterns_extracted INTEGER NOT NULL DEFAULT 0,
    memories_updated INTEGER NOT NULL DEFAULT 0,
    episodes_decayed INTEGER NOT NULL DEFAULT 0,
    episodes_pruned INTEGER NOT NULL DEFAULT 0,
    duration_seconds FLOAT,
    status VARCHAR(50) DEFAULT 'completed',  -- completed, failed, partial
    error_message TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for consolidation log
CREATE INDEX IF NOT EXISTS idx_consolidation_brain 
    ON brain_memory_consolidation_log(brain_id);

CREATE INDEX IF NOT EXISTS idx_consolidation_date 
    ON brain_memory_consolidation_log(consolidation_date DESC);


-- ====================================================================
-- SAMPLE DATA FOR TESTING
-- ====================================================================

-- Sample episodic memory: Breakthrough moment
INSERT OR IGNORE INTO brain_episodic_memory (
    memory_id,
    brain_id,
    timestamp,
    event_type,
    context,
    outcome,
    lessons_learned,
    importance_score,
    decay_factor,
    times_recalled
) VALUES (
    'ep_sample_001',
    'brain_demo_001',
    datetime('now', '-5 days'),
    'breakthrough',
    '{"subject": "math", "topic": "fractions", "difficulty": 5, "learner_state": {"frustration_level": "medium"}}',
    'Learner completed fraction worksheet with visual models, scored 90%',
    '["Visual representations very effective for fractions", "Step-by-step approach builds confidence"]',
    0.95,
    1.0,
    2
);

-- Sample episodic memory: Typical progress
INSERT OR IGNORE INTO brain_episodic_memory (
    memory_id,
    brain_id,
    timestamp,
    event_type,
    context,
    outcome,
    lessons_learned,
    importance_score,
    decay_factor,
    times_recalled
) VALUES (
    'ep_sample_002',
    'brain_demo_001',
    datetime('now', '-3 days'),
    'typical_progress',
    '{"subject": "math", "topic": "decimals", "difficulty": 4, "learner_state": {"frustration_level": "low"}}',
    'Completed decimal addition exercises, 75% accuracy',
    '["Consistent performance with practice problems"]',
    0.5,
    1.0,
    0
);

-- Sample episodic memory: Struggle pattern
INSERT OR IGNORE INTO brain_episodic_memory (
    memory_id,
    brain_id,
    timestamp,
    event_type,
    context,
    outcome,
    lessons_learned,
    importance_score,
    decay_factor,
    times_recalled
) VALUES (
    'ep_sample_003',
    'brain_demo_001',
    datetime('now', '-1 day'),
    'persistent_struggle',
    '{"subject": "reading", "topic": "comprehension", "difficulty": 6, "learner_state": {"frustration_level": "high"}}',
    'Struggled with reading comprehension questions, needed multiple explanations',
    '["Text-heavy content causes disengagement", "Audio support might help"]',
    0.85,
    1.0,
    1
);

-- Sample semantic memory: Visual learning preference
INSERT OR IGNORE INTO brain_semantic_memory (
    id,
    brain_id,
    knowledge_type,
    statement,
    confidence,
    supporting_evidence,
    last_updated,
    times_confirmed,
    times_contradicted,
    metadata
) VALUES (
    'sem_sample_001',
    'brain_demo_001',
    'preference',
    'Learner responds very well to visual representations in math',
    0.85,
    '["ep_sample_001"]',
    datetime('now', '-2 days'),
    3,
    0,
    '{"subject": "math", "topics": ["fractions", "geometry"], "states": ["struggling", "confused"]}'
);

-- Sample semantic memory: Strategy effectiveness
INSERT OR IGNORE INTO brain_semantic_memory (
    id,
    brain_id,
    knowledge_type,
    statement,
    confidence,
    supporting_evidence,
    last_updated,
    times_confirmed,
    times_contradicted,
    metadata
) VALUES (
    'sem_sample_002',
    'brain_demo_001',
    'strategy',
    'Step-by-step breakdown works best for multi-step problems',
    0.78,
    '["ep_sample_001"]',
    datetime('now', '-2 days'),
    4,
    1,
    '{"subject": "math", "topics": ["fractions", "algebra"], "complexity": "multi-step"}'
);

-- Sample semantic memory: Trigger pattern
INSERT OR IGNORE INTO brain_semantic_memory (
    id,
    brain_id,
    knowledge_type,
    statement,
    confidence,
    supporting_evidence,
    last_updated,
    times_confirmed,
    times_contradicted,
    metadata
) VALUES (
    'sem_sample_003',
    'brain_demo_001',
    'trigger',
    'Frustration rises significantly after 3 consecutive errors',
    0.82,
    '["ep_sample_003"]',
    datetime('now', '-1 day'),
    5,
    0,
    '{"states": ["frustrated", "disengaged"], "threshold": 3}'
);

-- Sample consolidation log entry
INSERT OR IGNORE INTO brain_memory_consolidation_log (
    consolidation_id,
    brain_id,
    consolidation_date,
    patterns_extracted,
    memories_updated,
    episodes_decayed,
    episodes_pruned,
    duration_seconds,
    status
) VALUES (
    'cons_sample_001',
    'brain_demo_001',
    datetime('now', '-1 day'),
    2,
    1,
    15,
    3,
    2.45,
    'completed'
);


-- ====================================================================
-- VIEWS FOR COMMON QUERIES
-- ====================================================================

-- View: Recent high-importance episodic memories
CREATE VIEW IF NOT EXISTS v_recent_important_episodes AS
SELECT 
    memory_id,
    brain_id,
    timestamp,
    event_type,
    context,
    outcome,
    importance_score,
    times_recalled
FROM brain_episodic_memory
WHERE importance_score >= 0.7
  AND timestamp >= datetime('now', '-30 days')
ORDER BY importance_score DESC, timestamp DESC;

-- View: High-confidence semantic memories
CREATE VIEW IF NOT EXISTS v_high_confidence_semantics AS
SELECT 
    id,
    brain_id,
    knowledge_type,
    statement,
    confidence,
    times_confirmed,
    times_contradicted,
    last_updated
FROM brain_semantic_memory
WHERE confidence >= 0.7
ORDER BY confidence DESC, last_updated DESC;

-- View: Memory consolidation summary by brain
CREATE VIEW IF NOT EXISTS v_consolidation_summary AS
SELECT 
    brain_id,
    COUNT(*) as total_consolidations,
    SUM(patterns_extracted) as total_patterns,
    SUM(episodes_pruned) as total_pruned,
    MAX(consolidation_date) as last_consolidation,
    AVG(duration_seconds) as avg_duration
FROM brain_memory_consolidation_log
WHERE status = 'completed'
GROUP BY brain_id;


-- ====================================================================
-- CLEANUP FUNCTION (for development/testing)
-- ====================================================================

-- To reset memory data for a specific brain:
-- DELETE FROM brain_episodic_memory WHERE brain_id = 'brain_xxx';
-- DELETE FROM brain_semantic_memory WHERE brain_id = 'brain_xxx';
-- DELETE FROM brain_memory_consolidation_log WHERE brain_id = 'brain_xxx';
