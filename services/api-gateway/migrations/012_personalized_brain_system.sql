-- ==================================================================
-- AIVO Personalized Brain System
-- Migration 012: Personalized Brain Cloning & Daily Retraining
-- 
-- Date: 2025-10-30
-- Purpose: Track individual learner brain instances cloned from main brain
--          with daily retraining based on learner progress
-- ==================================================================

BEGIN;

-- ==================================================================
-- PART 1: Personalized Brain Instances
-- ==================================================================

-- Individual brain instances for each learner
CREATE TABLE IF NOT EXISTS learner_brain_instances (
    id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
    learner_id VARCHAR(36) NOT NULL REFERENCES learners(id) ON DELETE CASCADE,
    
    -- Clone Information
    cloned_from_version VARCHAR(50) NOT NULL, -- Main brain version
    cloned_at TIMESTAMP NOT NULL DEFAULT NOW(),
    clone_source_path TEXT NOT NULL, -- Path to main brain training report
    
    -- Current Status
    status VARCHAR(20) NOT NULL DEFAULT 'active', -- active, retraining, archived
    current_grade_level INTEGER NOT NULL, -- Current grade (can advance)
    learning_level_override VARCHAR(50), -- If different from grade level
    
    -- Performance Metadata
    model_config JSONB NOT NULL DEFAULT '{}',
    /* Structure:
    {
      "base_parameters": { ... },
      "learning_preferences": {
        "learning_style": "visual|auditory|kinesthetic",
        "pace": "slow|moderate|fast",
        "difficulty_preference": "easy|adaptive|challenge"
      },
      "strengths": ["reading", "math"],
      "areas_for_growth": ["writing", "science"],
      "current_reading_level": "4.5",
      "current_math_level": "5.2"
    }
    */
    
    -- Training History
    total_retraining_cycles INTEGER NOT NULL DEFAULT 0,
    last_retrained_at TIMESTAMP,
    next_retraining_due TIMESTAMP,
    
    -- Quality Metrics
    average_accuracy DECIMAL(5,2),
    questions_answered INTEGER DEFAULT 0,
    learning_velocity DECIMAL(5,2), -- Rate of improvement
    
    -- Timestamps
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT unique_active_learner_brain UNIQUE (learner_id, status)
        WHERE status = 'active'
);

CREATE INDEX idx_learner_brains_learner ON learner_brain_instances(learner_id);
CREATE INDEX idx_learner_brains_status ON learner_brain_instances(status);
CREATE INDEX idx_learner_brains_next_retrain ON learner_brain_instances(next_retraining_due)
    WHERE status = 'active' AND next_retraining_due IS NOT NULL;

COMMENT ON TABLE learner_brain_instances IS 'Personalized AI brain instances cloned from main brain for each learner';
COMMENT ON COLUMN learner_brain_instances.cloned_from_version IS 'Version of main brain this was cloned from';
COMMENT ON COLUMN learner_brain_instances.learning_level_override IS 'Override when learner works at different level than grade';
COMMENT ON COLUMN learner_brain_instances.learning_velocity IS 'Rate of learner improvement over time';


-- ==================================================================
-- PART 2: Daily Learning Data Collection
-- ==================================================================

-- Daily interactions for training
CREATE TABLE IF NOT EXISTS learner_daily_interactions (
    id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
    learner_id VARCHAR(36) NOT NULL REFERENCES learners(id) ON DELETE CASCADE,
    brain_instance_id VARCHAR(36) NOT NULL REFERENCES learner_brain_instances(id) ON DELETE CASCADE,
    interaction_date DATE NOT NULL DEFAULT CURRENT_DATE,
    
    -- Activity Data
    subject VARCHAR(50) NOT NULL,
    grade_level INTEGER NOT NULL,
    activity_type VARCHAR(50) NOT NULL, -- assessment, homework, practice, game
    
    -- Question/Response Data
    question_text TEXT,
    correct_answer TEXT,
    learner_answer TEXT,
    is_correct BOOLEAN NOT NULL,
    response_time_seconds INTEGER,
    
    -- Context
    difficulty_level VARCHAR(20), -- easy, medium, hard, adaptive
    curriculum_standard_id VARCHAR(36),
    skill_assessed VARCHAR(100),
    
    -- Adaptive Data
    hints_used INTEGER DEFAULT 0,
    attempts INTEGER DEFAULT 1,
    confidence_self_reported VARCHAR(20), -- low, medium, high
    
    -- Metadata
    metadata JSONB DEFAULT '{}',
    /* Structure:
    {
      "distractions_present": boolean,
      "time_of_day": "morning|afternoon|evening",
      "emotional_state": "calm|excited|frustrated|tired",
      "sensory_accommodations_used": [],
      "regulation_breaks_taken": 0
    }
    */
    
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    
    -- Indexes for fast queries
    CONSTRAINT idx_unique_interaction UNIQUE (learner_id, interaction_date, created_at)
);

CREATE INDEX idx_daily_interactions_learner ON learner_daily_interactions(learner_id, interaction_date);
CREATE INDEX idx_daily_interactions_brain ON learner_daily_interactions(brain_instance_id);
CREATE INDEX idx_daily_interactions_subject ON learner_daily_interactions(subject, interaction_date);
CREATE INDEX idx_daily_interactions_date ON learner_daily_interactions(interaction_date);

COMMENT ON TABLE learner_daily_interactions IS 'Daily learner activity data for personalized brain retraining';


-- ==================================================================
-- PART 3: Daily Retraining Schedule
-- ==================================================================

-- Automatic retraining schedule (runs at midnight)
CREATE TABLE IF NOT EXISTS brain_retraining_schedule (
    id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
    brain_instance_id VARCHAR(36) NOT NULL REFERENCES learner_brain_instances(id) ON DELETE CASCADE,
    learner_id VARCHAR(36) NOT NULL REFERENCES learners(id) ON DELETE CASCADE,
    
    -- Schedule Info
    scheduled_date DATE NOT NULL,
    scheduled_time TIME NOT NULL DEFAULT '00:00:00', -- Midnight
    
    -- Execution Status
    status VARCHAR(20) NOT NULL DEFAULT 'pending', -- pending, running, completed, failed, skipped
    started_at TIMESTAMP,
    completed_at TIMESTAMP,
    
    -- Training Data Stats
    new_interactions_count INTEGER DEFAULT 0,
    training_data_start_date DATE,
    training_data_end_date DATE,
    
    -- Results
    training_duration_seconds INTEGER,
    questions_generated INTEGER,
    model_improvements JSONB,
    /* Structure:
    {
      "accuracy_before": 85.5,
      "accuracy_after": 87.2,
      "improvements": {
        "math": {"before": 82, "after": 85},
        "reading": {"before": 90, "after": 91}
      },
      "new_skills_detected": ["fractions", "comprehension"],
      "struggling_areas": ["word_problems", "long_reading"]
    }
    */
    
    -- Error Handling
    error_message TEXT,
    retry_count INTEGER DEFAULT 0,
    max_retries INTEGER DEFAULT 3,
    
    -- Timestamps
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    
    CONSTRAINT unique_learner_schedule_date UNIQUE (learner_id, scheduled_date)
);

CREATE INDEX idx_retraining_schedule_date ON brain_retraining_schedule(scheduled_date, status);
CREATE INDEX idx_retraining_schedule_brain ON brain_retraining_schedule(brain_instance_id);
CREATE INDEX idx_retraining_schedule_pending ON brain_retraining_schedule(status, scheduled_date)
    WHERE status = 'pending';

COMMENT ON TABLE brain_retraining_schedule IS 'Automatic daily retraining schedule for learner brain instances';


-- ==================================================================
-- PART 4: Grade Progression & Milestones
-- ==================================================================

-- Track grade level changes and learning milestones
CREATE TABLE IF NOT EXISTS learner_milestones (
    id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
    learner_id VARCHAR(36) NOT NULL REFERENCES learners(id) ON DELETE CASCADE,
    brain_instance_id VARCHAR(36) NOT NULL REFERENCES learner_brain_instances(id) ON DELETE CASCADE,
    
    -- Milestone Type
    milestone_type VARCHAR(50) NOT NULL,
    -- Types: grade_advancement, birthday_grade_change, skill_mastery, 
    --        reading_level_up, math_level_up, subject_completion
    
    -- Before/After State
    previous_state JSONB NOT NULL,
    /* Structure:
    {
      "grade_level": 4,
      "reading_level": "4.2",
      "math_level": "4.5",
      "age": 10
    }
    */
    
    new_state JSONB NOT NULL,
    /* Structure:
    {
      "grade_level": 5,
      "reading_level": "5.0",
      "math_level": "5.2",
      "age": 11
    }
    */
    
    -- Trigger Information
    triggered_by VARCHAR(50) NOT NULL, -- birthday, assessment, teacher_override, mastery_achievement
    trigger_date DATE NOT NULL,
    
    -- Impact on Brain
    brain_updated BOOLEAN NOT NULL DEFAULT FALSE,
    brain_update_type VARCHAR(50), -- grade_level_shift, curriculum_upgrade, full_retrain
    update_applied_at TIMESTAMP,
    
    -- Details
    description TEXT,
    celebration_triggered BOOLEAN DEFAULT FALSE, -- Show achievement UI
    
    -- Metadata
    metadata JSONB DEFAULT '{}',
    
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_milestones_learner ON learner_milestones(learner_id);
CREATE INDEX idx_milestones_brain ON learner_milestones(brain_instance_id);
CREATE INDEX idx_milestones_type ON learner_milestones(milestone_type, trigger_date);
CREATE INDEX idx_milestones_pending_updates ON learner_milestones(brain_updated, brain_instance_id)
    WHERE brain_updated = FALSE;

COMMENT ON TABLE learner_milestones IS 'Track learning milestones and grade progressions for personalized brain updates';


-- ==================================================================
-- PART 5: Brain Performance Tracking
-- ==================================================================

-- Weekly/monthly performance snapshots
CREATE TABLE IF NOT EXISTS brain_performance_snapshots (
    id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
    brain_instance_id VARCHAR(36) NOT NULL REFERENCES learner_brain_instances(id) ON DELETE CASCADE,
    learner_id VARCHAR(36) NOT NULL REFERENCES learners(id) ON DELETE CASCADE,
    
    -- Time Period
    snapshot_date DATE NOT NULL,
    period_type VARCHAR(20) NOT NULL, -- daily, weekly, monthly
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,
    
    -- Overall Metrics
    total_interactions INTEGER NOT NULL DEFAULT 0,
    correct_answers INTEGER NOT NULL DEFAULT 0,
    accuracy_percentage DECIMAL(5,2),
    average_response_time_seconds INTEGER,
    
    -- Subject-specific Performance
    subject_performance JSONB NOT NULL DEFAULT '[]',
    /* Structure: [
      {
        "subject": "math",
        "interactions": 45,
        "accuracy": 87.5,
        "improvement": +2.3,
        "struggling_topics": ["fractions", "word_problems"],
        "mastered_topics": ["addition", "subtraction"]
      }
    ]
    */
    
    -- Learning Insights
    learning_velocity DECIMAL(5,2), -- Rate of improvement
    engagement_score DECIMAL(5,2), -- Based on time spent, interactions
    challenge_level_optimal BOOLEAN, -- Is difficulty well-calibrated?
    
    -- Recommendations
    ai_recommendations JSONB DEFAULT '[]',
    /* Structure: [
      {
        "type": "increase_difficulty",
        "subject": "reading",
        "reason": "Consistent 95%+ accuracy",
        "confidence": 0.92
      }
    ]
    */
    
    -- Model Health
    retraining_cycles_count INTEGER DEFAULT 0,
    data_quality_score DECIMAL(5,2), -- How good is training data
    needs_intervention BOOLEAN DEFAULT FALSE,
    intervention_reason TEXT,
    
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    
    CONSTRAINT unique_brain_snapshot UNIQUE (brain_instance_id, snapshot_date, period_type)
);

CREATE INDEX idx_performance_snapshots_brain ON brain_performance_snapshots(brain_instance_id, snapshot_date);
CREATE INDEX idx_performance_snapshots_learner ON brain_performance_snapshots(learner_id, snapshot_date);
CREATE INDEX idx_performance_snapshots_period ON brain_performance_snapshots(period_type, period_start, period_end);

COMMENT ON TABLE brain_performance_snapshots IS 'Performance tracking snapshots for monitoring learner brain effectiveness';


-- ==================================================================
-- PART 6: Triggers & Functions
-- ==================================================================

-- Function: Auto-schedule next retraining
CREATE OR REPLACE FUNCTION schedule_next_retraining()
RETURNS TRIGGER AS $$
BEGIN
    -- When brain instance is created or retrained, schedule next midnight retraining
    NEW.next_retraining_due := (CURRENT_DATE + INTERVAL '1 day')::timestamp + TIME '00:00:00';
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_auto_schedule_retraining
BEFORE INSERT OR UPDATE OF last_retrained_at ON learner_brain_instances
FOR EACH ROW
EXECUTE FUNCTION schedule_next_retraining();


-- Function: Update brain status on milestone
CREATE OR REPLACE FUNCTION update_brain_on_milestone()
RETURNS TRIGGER AS $$
BEGIN
    -- When milestone is created, flag brain for update if grade changes
    IF NEW.milestone_type IN ('grade_advancement', 'birthday_grade_change') THEN
        UPDATE learner_brain_instances
        SET current_grade_level = (NEW.new_state->>'grade_level')::INTEGER,
            learning_level_override = NEW.new_state->>'learning_level',
            updated_at = NOW()
        WHERE id = NEW.brain_instance_id;
        
        NEW.brain_updated := TRUE;
        NEW.update_applied_at := NOW();
        NEW.brain_update_type := 'grade_level_shift';
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_milestone_brain_update
BEFORE INSERT ON learner_milestones
FOR EACH ROW
EXECUTE FUNCTION update_brain_on_milestone();


-- Function: Track interaction count
CREATE OR REPLACE FUNCTION increment_brain_interactions()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE learner_brain_instances
    SET questions_answered = questions_answered + 1,
        updated_at = NOW()
    WHERE id = NEW.brain_instance_id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_track_interactions
AFTER INSERT ON learner_daily_interactions
FOR EACH ROW
EXECUTE FUNCTION increment_brain_interactions();


COMMIT;

-- ==================================================================
-- INDEXES FOR PERFORMANCE
-- ==================================================================

-- Composite indexes for common queries
CREATE INDEX IF NOT EXISTS idx_interactions_learner_date_subject 
    ON learner_daily_interactions(learner_id, interaction_date, subject);

CREATE INDEX IF NOT EXISTS idx_interactions_brain_date 
    ON learner_daily_interactions(brain_instance_id, interaction_date DESC);

CREATE INDEX IF NOT EXISTS idx_retraining_due_active
    ON learner_brain_instances(next_retraining_due, status)
    WHERE status = 'active' AND next_retraining_due IS NOT NULL;
