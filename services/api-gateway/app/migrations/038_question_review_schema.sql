-- ═══════════════════════════════════════════════════════════════════════
-- QUESTION REVIEW AND QUALITY ASSURANCE SCHEMA
-- Migration: 038_question_review_schema.sql
-- Created: 2025-10-28
-- Purpose: Expert review workflow, pilot testing, and quality metrics
-- ═══════════════════════════════════════════════════════════════════════

-- ═══════════════════════════════════════════════════════════════════════
-- QUESTION REVIEW QUEUE
-- ═══════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS question_review_queue (
  id TEXT PRIMARY KEY,
  item_id TEXT NOT NULL,
  
  -- Review status
  status TEXT DEFAULT 'pending' CHECK (status IN (
    'pending', 'in_review', 'approved', 'needs_revision', 'rejected'
  )),
  priority TEXT DEFAULT 'normal' CHECK (priority IN (
    'low', 'normal', 'high', 'urgent'
  )),
  
  -- Reviewer assignment
  reviewer_id TEXT,
  review_started_at TIMESTAMP,
  review_completed_at TIMESTAMP,
  
  -- Automated validation
  automated_validation_json TEXT,
  automated_score REAL,
  
  -- Review results
  approved INTEGER,
  reviewer_feedback TEXT,
  quality_ratings_json TEXT,
  suggested_revisions_json TEXT,
  
  -- Metadata
  submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  submitted_by TEXT DEFAULT 'ai-generator',
  
  FOREIGN KEY (item_id) REFERENCES baseline_items(id) ON DELETE CASCADE
);

CREATE INDEX idx_review_queue_status 
ON question_review_queue(status, priority);

CREATE INDEX idx_review_queue_item 
ON question_review_queue(item_id);

CREATE INDEX idx_review_queue_reviewer 
ON question_review_queue(reviewer_id);

-- ═══════════════════════════════════════════════════════════════════════
-- QUESTION REVISION HISTORY
-- ═══════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS question_revision_history (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  item_id TEXT NOT NULL,
  version INTEGER NOT NULL,
  
  -- Revision details
  revision_type TEXT CHECK (revision_type IN (
    'initial', 'expert_revision', 'automated_refinement', 'pilot_calibration'
  )),
  revised_by TEXT,
  revision_reason TEXT,
  
  -- Content snapshot
  stem_before TEXT,
  stem_after TEXT,
  options_json_before TEXT,
  options_json_after TEXT,
  
  -- IRT parameters
  difficulty_before REAL,
  difficulty_after REAL,
  discrimination_before REAL,
  discrimination_after REAL,
  
  -- Quality scores
  quality_score_before REAL,
  quality_score_after REAL,
  
  -- Metadata
  revised_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (item_id) REFERENCES baseline_items(id) ON DELETE CASCADE
);

CREATE INDEX idx_revision_history_item 
ON question_revision_history(item_id);

-- ═══════════════════════════════════════════════════════════════════════
-- PILOT TEST SESSIONS
-- ═══════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS pilot_test_sessions (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  item_id TEXT NOT NULL,
  
  -- Pilot test config
  target_sample_size INTEGER DEFAULT 30,
  current_sample_size INTEGER DEFAULT 0,
  status TEXT DEFAULT 'active' CHECK (status IN (
    'active', 'completed', 'cancelled'
  )),
  
  -- IRT estimates (updated as data comes in)
  estimated_difficulty REAL,
  estimated_discrimination REAL,
  estimated_guessing REAL,
  standard_error REAL,
  
  -- Performance metrics
  mean_score REAL,
  score_variance REAL,
  completion_rate REAL,
  avg_time_seconds REAL,
  
  -- Metadata
  started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  completed_at TIMESTAMP,
  
  FOREIGN KEY (item_id) REFERENCES baseline_items(id) ON DELETE CASCADE
);

CREATE INDEX idx_pilot_sessions_item 
ON pilot_test_sessions(item_id);

CREATE INDEX idx_pilot_sessions_status 
ON pilot_test_sessions(status);

-- ═══════════════════════════════════════════════════════════════════════
-- PILOT TEST RESPONSES
-- ═══════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS pilot_test_responses (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  pilot_session_id TEXT NOT NULL,
  learner_id TEXT NOT NULL,
  item_id TEXT NOT NULL,
  
  -- Response data
  selected_options_json TEXT,
  correct INTEGER NOT NULL,
  score REAL NOT NULL,
  max_score REAL NOT NULL,
  time_spent_ms INTEGER,
  
  -- Learner context (for IRT calibration)
  learner_theta_estimate REAL,
  learner_grade_level INTEGER,
  
  -- Feedback
  difficulty_rating INTEGER CHECK (difficulty_rating BETWEEN 1 AND 5),
  clarity_rating INTEGER CHECK (clarity_rating BETWEEN 1 AND 5),
  learner_comments TEXT,
  
  -- Metadata
  responded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (pilot_session_id) 
    REFERENCES pilot_test_sessions(id) ON DELETE CASCADE,
  FOREIGN KEY (item_id) 
    REFERENCES baseline_items(id) ON DELETE CASCADE,
  FOREIGN KEY (learner_id) 
    REFERENCES learners(id) ON DELETE CASCADE
);

CREATE INDEX idx_pilot_responses_session 
ON pilot_test_responses(pilot_session_id);

CREATE INDEX idx_pilot_responses_item 
ON pilot_test_responses(item_id);

-- ═══════════════════════════════════════════════════════════════════════
-- QUESTION QUALITY METRICS
-- ═══════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS question_quality_metrics (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  item_id TEXT NOT NULL UNIQUE,
  
  -- Validation scores (0-100)
  clarity_score REAL,
  bias_score REAL,
  pedagogical_score REAL,
  accessibility_score REAL,
  overall_quality_score REAL,
  
  -- Expert ratings (1-10)
  expert_clarity_rating REAL,
  expert_pedagogy_rating REAL,
  expert_accuracy_rating REAL,
  expert_overall_rating REAL,
  
  -- Usage statistics
  times_used INTEGER DEFAULT 0,
  times_correct INTEGER DEFAULT 0,
  accuracy_rate REAL,
  avg_response_time_ms INTEGER,
  
  -- IRT fit statistics
  irt_fit_statistic REAL,
  discrimination_accuracy REAL,
  
  -- Flags
  needs_review INTEGER DEFAULT 0,
  flagged_by_count INTEGER DEFAULT 0,
  last_flagged_at TIMESTAMP,
  
  -- Metadata
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (item_id) REFERENCES baseline_items(id) ON DELETE CASCADE
);

CREATE INDEX idx_quality_metrics_item 
ON question_quality_metrics(item_id);

CREATE INDEX idx_quality_metrics_score 
ON question_quality_metrics(overall_quality_score);

CREATE INDEX idx_quality_metrics_review 
ON question_quality_metrics(needs_review);

-- ═══════════════════════════════════════════════════════════════════════
-- EXPERT REVIEWERS
-- ═══════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS expert_reviewers (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  user_id TEXT NOT NULL,
  
  -- Expertise
  domains_json TEXT,
  grade_bands_json TEXT,
  certifications_json TEXT,
  years_experience INTEGER,
  
  -- Review statistics
  reviews_completed INTEGER DEFAULT 0,
  avg_review_time_minutes REAL,
  approval_rate REAL,
  
  -- Status
  active INTEGER DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_reviewers_user 
ON expert_reviewers(user_id);

CREATE INDEX idx_reviewers_active 
ON expert_reviewers(active);

-- ═══════════════════════════════════════════════════════════════════════
-- VERIFICATION
-- ═══════════════════════════════════════════════════════════════════════

SELECT '✅ Migration 038 complete: Question review and QA schema created' as status;
