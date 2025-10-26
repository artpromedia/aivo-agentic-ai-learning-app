-- Model Cloning & Personalization Schema
-- Implements explainable AI model personalization with full transparency and FERPA/COPPA compliance

-- Learner Model Registry
CREATE TABLE IF NOT EXISTS learner_models (
    id TEXT PRIMARY KEY,
    learner_id TEXT NOT NULL,
    
    -- Model metadata
    model_version VARCHAR(50) NOT NULL DEFAULT 'v1.0',
    base_model_id VARCHAR(100) NOT NULL, -- Which Aivo Brain version was cloned
    status VARCHAR(50) NOT NULL DEFAULT 'building', -- building, ready, suspended, deleted
    
    -- Creation details
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    built_at TIMESTAMP,
    last_used_at TIMESTAMP,
    
    -- Privacy settings (JSON for flexibility)
    privacy_settings TEXT NOT NULL DEFAULT '{"store_audio":false,"store_images":false,"store_free_text_long_term":false,"retention_days":30,"history_length":"short","homework_uploads":"none"}',
    
    -- Model configuration (JSON)
    skill_map TEXT NOT NULL DEFAULT '{}',
    pathways TEXT,
    guardrails TEXT,
    scaffolds TEXT,
    
    -- Parent controls
    parent_consent_at TIMESTAMP NOT NULL,
    parent_reviewed_at TIMESTAMP,
    can_export BOOLEAN DEFAULT 1,
    can_delete BOOLEAN DEFAULT 1,
    
    FOREIGN KEY (learner_id) REFERENCES learners(id) ON DELETE CASCADE,
    UNIQUE(learner_id) -- One model per learner
);

CREATE INDEX IF NOT EXISTS idx_learner_models_learner ON learner_models(learner_id);
CREATE INDEX IF NOT EXISTS idx_learner_models_status ON learner_models(status);

-- Model Building Steps (for transparency)
CREATE TABLE IF NOT EXISTS model_build_steps (
    id TEXT PRIMARY KEY,
    learner_model_id TEXT NOT NULL,
    
    -- Step details
    step_number INTEGER NOT NULL,
    step_name VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    
    -- What data was used (JSON)
    data_inputs TEXT NOT NULL,
    data_outputs TEXT NOT NULL,
    
    -- Processing details
    started_at TIMESTAMP NOT NULL,
    completed_at TIMESTAMP,
    duration_ms INTEGER,
    status VARCHAR(50) NOT NULL DEFAULT 'pending', -- pending, running, completed, failed
    
    -- Parent visibility
    parent_visible BOOLEAN DEFAULT 1,
    explanation TEXT, -- Plain language explanation
    
    FOREIGN KEY (learner_model_id) REFERENCES learner_models(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_build_steps_model ON model_build_steps(learner_model_id);
CREATE INDEX IF NOT EXISTS idx_build_steps_number ON model_build_steps(step_number);

-- Model Audit Trail (every operation logged)
CREATE TABLE IF NOT EXISTS model_audit_trail (
    id TEXT PRIMARY KEY,
    learner_model_id TEXT,
    
    -- Event details
    event_type VARCHAR(100) NOT NULL, -- model_intro_view, consent_accept, build_start, step_complete, etc.
    event_timestamp TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    -- Actor
    actor_id TEXT, -- Parent/teacher who performed action
    actor_role VARCHAR(50), -- parent, teacher, system
    
    -- Event data (JSON)
    event_data TEXT,
    
    -- IP and session (for security)
    ip_address VARCHAR(45),
    session_id VARCHAR(255),
    user_agent TEXT,
    
    FOREIGN KEY (learner_model_id) REFERENCES learner_models(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_audit_model ON model_audit_trail(learner_model_id);
CREATE INDEX IF NOT EXISTS idx_audit_timestamp ON model_audit_trail(event_timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_audit_type ON model_audit_trail(event_type);

-- Model Cards (ML model documentation standard)
CREATE TABLE IF NOT EXISTS model_cards (
    id TEXT PRIMARY KEY,
    learner_model_id TEXT NOT NULL,
    
    -- Card version
    card_version VARCHAR(50) NOT NULL DEFAULT '1.0',
    generated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    -- Model details (JSON - following Model Card standard)
    model_details TEXT NOT NULL,
    intended_use TEXT NOT NULL,
    factors TEXT,
    metrics TEXT,
    training_data TEXT NOT NULL,
    ethical_considerations TEXT,
    caveats_recommendations TEXT,
    
    -- Export formats
    pdf_url TEXT,
    json_export TEXT,
    
    FOREIGN KEY (learner_model_id) REFERENCES learner_models(id) ON DELETE CASCADE,
    UNIQUE(learner_model_id)
);

-- Privacy Preferences History (track changes)
CREATE TABLE IF NOT EXISTS model_privacy_history (
    id TEXT PRIMARY KEY,
    learner_model_id TEXT NOT NULL,
    
    changed_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    changed_by TEXT, -- Parent/teacher ID
    
    old_settings TEXT NOT NULL,
    new_settings TEXT NOT NULL,
    change_reason TEXT,
    
    FOREIGN KEY (learner_model_id) REFERENCES learner_models(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_privacy_history_model ON model_privacy_history(learner_model_id);

-- Baseline Data Corrections (parent-initiated)
CREATE TABLE IF NOT EXISTS baseline_corrections (
    id TEXT PRIMARY KEY,
    learner_id TEXT NOT NULL,
    baseline_id TEXT NOT NULL, -- Reference to original baseline
    
    corrected_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    corrected_by TEXT NOT NULL, -- Parent/teacher ID
    
    correction_type VARCHAR(50) NOT NULL, -- invalid_item, misclick, technical_issue
    affected_items TEXT NOT NULL, -- JSON array of question IDs
    
    old_scores TEXT NOT NULL, -- JSON of original domain scores
    new_scores TEXT NOT NULL, -- JSON of recalculated scores
    
    reason TEXT NOT NULL,
    notes TEXT,
    
    FOREIGN KEY (learner_id) REFERENCES learners(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_corrections_learner ON baseline_corrections(learner_id);

-- Model Deletion Log (for GDPR/CCPA compliance)
CREATE TABLE IF NOT EXISTS model_deletion_log (
    id TEXT PRIMARY KEY,
    
    learner_id TEXT NOT NULL,
    model_id TEXT NOT NULL,
    
    deleted_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_by TEXT NOT NULL, -- Parent/teacher who requested deletion
    
    deletion_reason VARCHAR(100) NOT NULL, -- user_request, account_closure, retention_expired
    data_purged BOOLEAN DEFAULT 0, -- Whether all data was hard-deleted
    purge_completed_at TIMESTAMP,
    
    -- What was deleted (JSON)
    artifacts_deleted TEXT NOT NULL
);

-- Consent Records (for model creation)
CREATE TABLE IF NOT EXISTS model_creation_consent (
    id TEXT PRIMARY KEY,
    learner_id TEXT NOT NULL,
    learner_model_id TEXT,
    
    consented_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    consented_by TEXT NOT NULL, -- Parent/guardian ID
    
    -- What they consented to
    consent_version VARCHAR(50) NOT NULL DEFAULT '1.0',
    consent_text TEXT NOT NULL,
    
    -- Specific agreements
    data_processing_consent BOOLEAN NOT NULL DEFAULT 1,
    personalization_consent BOOLEAN NOT NULL DEFAULT 1,
    audit_trail_consent BOOLEAN NOT NULL DEFAULT 1,
    
    -- IP and metadata
    ip_address VARCHAR(45),
    user_agent TEXT,
    
    -- Withdrawal
    withdrawn_at TIMESTAMP,
    withdrawal_reason TEXT,
    
    FOREIGN KEY (learner_id) REFERENCES learners(id) ON DELETE CASCADE,
    FOREIGN KEY (learner_model_id) REFERENCES learner_models(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_consent_learner ON model_creation_consent(learner_id);
