-- ═══════════════════════════════════════════════════════════════════════
-- BASELINE ASSESSMENT DATABASE SCHEMA
-- Grade-banded adaptive testing with IRT scoring
-- Migration: 034_baseline_assessment_schema.sql
-- Created: 2025-01-26
-- ═══════════════════════════════════════════════════════════════════════

-- ═══════════════════════════════════════════════════════════════════════
-- ITEM BANK
-- ═══════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS baseline_items (
  id TEXT PRIMARY KEY,
  
  -- Item classification
  item_type TEXT NOT NULL CHECK (item_type IN (
    'yes_no',
    'multi_select',
    'single_choice',
    'ordering',
    'fill_blank',
    'read_aloud',
    'constructed_response'
  )),
  domain TEXT NOT NULL CHECK (domain IN ('reading', 'math', 'science', 'writing', 'sel', 'speech')),
  sub_domain TEXT NOT NULL,
  grade_band TEXT NOT NULL CHECK (grade_band IN ('K-5', '6-8', '9-12')),
  
  -- Content
  stem TEXT NOT NULL,
  stimulus TEXT,
  stimulus_type TEXT CHECK (stimulus_type IN ('text', 'image', 'audio', 'video')),
  stimulus_url TEXT,
  options_json TEXT,  -- JSON array: [{"id":"a","label":"Yes","correct":true}]
  correct_answer_json TEXT,
  
  -- Scoring configuration
  points REAL NOT NULL DEFAULT 1.0,
  partial_credit INTEGER DEFAULT 0,  -- Boolean: 0=false, 1=true
  
  -- IRT parameters (calibrated from pilot data)
  difficulty REAL NOT NULL,       -- b parameter (theta location: -4 to +4)
  discrimination REAL NOT NULL,   -- a parameter (slope: 0.5 to 2.5)
  guessing REAL DEFAULT 0.0,      -- c parameter (lower asymptote: 0 to 0.5)
  
  -- Metadata
  cognitive_level TEXT CHECK (cognitive_level IN (
    'remember',
    'understand',
    'apply',
    'analyze',
    'evaluate',
    'create'
  )),
  estimated_time_seconds INTEGER,
  read_aloud_enabled INTEGER DEFAULT 1,  -- Boolean
  allow_calculator INTEGER DEFAULT 0,
  allow_formula_sheet INTEGER DEFAULT 0,
  
  -- Exposure tracking (prevent item overuse)
  exposure_count INTEGER DEFAULT 0,
  last_used_at TIMESTAMP,
  
  -- Versioning and tags
  version INTEGER DEFAULT 1,
  tags_json TEXT,  -- JSON array: ["algebra","equations","word-problems"]
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'pilot', 'retired')),
  
  -- Audit
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_by TEXT,
  
  -- Constraints
  CHECK (discrimination > 0 AND discrimination <= 3),
  CHECK (difficulty >= -4 AND difficulty <= 4),
  CHECK (guessing >= 0 AND guessing <= 0.5)
);

-- Indexes for efficient item selection
CREATE INDEX IF NOT EXISTS idx_items_domain_band ON baseline_items(domain, grade_band) WHERE status = 'active';
CREATE INDEX IF NOT EXISTS idx_items_subdomain ON baseline_items(sub_domain) WHERE status = 'active';
CREATE INDEX IF NOT EXISTS idx_items_difficulty ON baseline_items(difficulty);
CREATE INDEX IF NOT EXISTS idx_items_exposure ON baseline_items(exposure_count, last_used_at);

-- ═══════════════════════════════════════════════════════════════════════
-- ASSESSMENT SESSIONS
-- ═══════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS baseline_sessions (
  id TEXT PRIMARY KEY,
  learner_id TEXT NOT NULL,
  grade_band TEXT NOT NULL CHECK (grade_band IN ('K-5', '6-8', '9-12')),
  
  -- Status tracking
  status TEXT NOT NULL DEFAULT 'not_started' CHECK (status IN (
    'not_started',
    'in_progress',
    'paused',
    'completed',
    'abandoned'
  )),
  
  -- Progress
  current_domain TEXT CHECK (current_domain IN ('reading', 'math', 'science', 'writing', 'sel', 'speech')),
  domains_completed_json TEXT DEFAULT '[]',  -- JSON array: ["reading","math"]
  items_answered INTEGER DEFAULT 0,
  total_items_planned INTEGER,
  
  -- Timing
  started_at TIMESTAMP,
  paused_at TIMESTAMP,
  resumed_at TIMESTAMP,
  completed_at TIMESTAMP,
  total_time_ms INTEGER DEFAULT 0,
  
  -- Settings
  audio_recording_enabled INTEGER DEFAULT 0,
  text_to_speech_enabled INTEGER DEFAULT 0,
  high_contrast_mode INTEGER DEFAULT 0,
  
  -- Current ability estimates (updated after each response)
  -- JSON structure: {"reading": 0.5, "math": -0.3, "science": 0.1, "sel": 0.0}
  ability_estimates_json TEXT DEFAULT '{}',
  standard_errors_json TEXT DEFAULT '{}',
  
  -- Stopping criteria configuration
  min_items_per_domain INTEGER DEFAULT 10,
  max_items_per_domain INTEGER DEFAULT 25,
  target_standard_error REAL DEFAULT 0.3,
  
  -- Device and browser info (for analytics)
  device_info_json TEXT,
  
  -- Audit
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_sessions_learner ON baseline_sessions(learner_id);
CREATE INDEX IF NOT EXISTS idx_sessions_status ON baseline_sessions(status);
CREATE INDEX IF NOT EXISTS idx_sessions_created ON baseline_sessions(created_at DESC);

-- ═══════════════════════════════════════════════════════════════════════
-- ITEM RESPONSES
-- ═══════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS baseline_responses (
  id TEXT PRIMARY KEY,
  session_id TEXT NOT NULL,
  item_id TEXT NOT NULL,
  
  -- Response data
  selected_options_json TEXT,           -- JSON: ["a", "c"]
  constructed_response TEXT,            -- For open-ended
  audio_url TEXT,                       -- Storage URL
  audio_duration_seconds INTEGER,
  self_rating TEXT CHECK (self_rating IN ('easy', 'just_right', 'hard')),
  
  -- Timing
  time_started TIMESTAMP NOT NULL,
  time_submitted TIMESTAMP NOT NULL,
  time_spent_ms INTEGER,
  
  -- Engagement metrics
  engagement_metrics_json TEXT,
  hesitation_count INTEGER DEFAULT 0,
  skipped INTEGER DEFAULT 0,
  used_hint INTEGER DEFAULT 0,
  used_read_aloud INTEGER DEFAULT 0,
  
  -- Scoring (computed after submission)
  correct INTEGER,  -- Boolean
  score REAL,
  max_score REAL,
  
  -- IRT context at time of response
  theta_at_response REAL,
  se_at_response REAL,
  item_difficulty REAL,
  item_discrimination REAL,
  
  -- Feedback (optional)
  feedback_text TEXT,
  feedback_shown_at TIMESTAMP,
  
  -- Audit
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  CHECK (score IS NULL OR (score >= 0 AND score <= max_score)),
  FOREIGN KEY (session_id) REFERENCES baseline_sessions(id) ON DELETE CASCADE,
  FOREIGN KEY (item_id) REFERENCES baseline_items(id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_responses_session ON baseline_responses(session_id);
CREATE INDEX IF NOT EXISTS idx_responses_item ON baseline_responses(item_id);
CREATE INDEX IF NOT EXISTS idx_responses_created ON baseline_responses(created_at);
CREATE INDEX IF NOT EXISTS idx_responses_session_item ON baseline_responses(session_id, item_id);

-- ═══════════════════════════════════════════════════════════════════════
-- FINAL RESULTS
-- ═══════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS baseline_results (
  id TEXT PRIMARY KEY,
  session_id TEXT UNIQUE NOT NULL,
  learner_id TEXT NOT NULL,
  grade_band TEXT NOT NULL CHECK (grade_band IN ('K-5', '6-8', '9-12')),
  
  -- Overall metrics
  total_time_ms INTEGER NOT NULL,
  items_attempted INTEGER NOT NULL,
  accuracy_rate REAL,
  
  -- Domain scores (grade-level equivalents)
  domain_scores_json TEXT NOT NULL,  -- {"reading": 4.2, "math": 3.8}
  
  -- Ability estimates (IRT theta scale: -3 to +3)
  ability_estimates_json TEXT NOT NULL,  -- {"reading": 0.5, "math": -0.3}
  
  -- Measurement precision
  standard_errors_json TEXT NOT NULL,  -- {"reading": 0.28, "math": 0.35}
  
  -- Confidence intervals (95% CI)
  confidence_intervals_json TEXT NOT NULL,  -- {"reading": {"lower": 3.8, "upper": 4.6}}
  
  -- Sub-domain breakdown
  sub_domain_scores_json TEXT,
  
  -- Recommendations
  strengths_json TEXT,     -- ["Decoding skills", "Number sense"]
  gaps_json TEXT,          -- ["Reading comprehension", "Algebra"]
  scaffolds_json TEXT,     -- ["text_to_speech", "chunked_steps"]
  starting_levels_json TEXT,  -- {"reading": "Grade 4 Level 2"}
  
  -- Engagement summary
  average_time_per_item_ms INTEGER,
  hesitation_rate REAL,
  completion_rate REAL,
  frustration_indicators_json TEXT,
  
  -- Reading-specific
  reading_fluency_json TEXT,  -- {"wpm": 95, "accuracy": 0.92}
  
  -- Metadata
  model_version TEXT NOT NULL DEFAULT 'irt-3pl-v1.0',
  item_pool_version TEXT NOT NULL,
  scoring_algorithm TEXT NOT NULL DEFAULT 'eap',
  
  -- Timestamps
  completed_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  CHECK (accuracy_rate IS NULL OR (accuracy_rate >= 0 AND accuracy_rate <= 1)),
  CHECK (hesitation_rate IS NULL OR (hesitation_rate >= 0 AND hesitation_rate <= 1)),
  CHECK (completion_rate IS NULL OR (completion_rate >= 0 AND completion_rate <= 1)),
  FOREIGN KEY (session_id) REFERENCES baseline_sessions(id) ON DELETE CASCADE
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_results_learner ON baseline_results(learner_id);
CREATE INDEX IF NOT EXISTS idx_results_completed ON baseline_results(completed_at DESC);
CREATE INDEX IF NOT EXISTS idx_results_grade_band ON baseline_results(grade_band);

-- ═══════════════════════════════════════════════════════════════════════
-- SEED DATA (Sample Items)
-- ═══════════════════════════════════════════════════════════════════════

-- K-5 Reading
INSERT OR IGNORE INTO baseline_items (
  id, item_type, domain, sub_domain, grade_band,
  stem, options_json, difficulty, discrimination, guessing,
  cognitive_level, estimated_time_seconds, read_aloud_enabled
) VALUES
('reading-k5-001', 'yes_no', 'reading', 'phonics', 'K-5',
  'Does the word "cat" rhyme with "hat"?',
  '[{"id":"yes","label":"Yes","correct":true},{"id":"no","label":"No","correct":false}]',
  -2.0, 1.2, 0.0, 'remember', 15, 1),

('reading-k5-002', 'multi_select', 'reading', 'comprehension', 'K-5',
  'Select all the sentences that are TRUE about the story.',
  '[{"id":"a","label":"The kite is red.","correct":true},{"id":"b","label":"The kite sinks in a pond.","correct":false},{"id":"c","label":"Wind helps the kite move.","correct":true},{"id":"d","label":"It is raining hard.","correct":false}]',
  0.2, 1.5, 0.0, 'understand', 45, 1),

('reading-k5-003', 'single_choice', 'reading', 'vocabulary', 'K-5',
  'What does the word "gigantic" mean?',
  '[{"id":"a","label":"Very small","correct":false},{"id":"b","label":"Very big","correct":true},{"id":"c","label":"Very fast","correct":false},{"id":"d","label":"Very slow","correct":false}]',
  -0.5, 1.3, 0.25, 'remember', 30, 1);

-- 6-8 Math
INSERT OR IGNORE INTO baseline_items (
  id, item_type, domain, sub_domain, grade_band,
  stem, options_json, difficulty, discrimination, guessing,
  cognitive_level, estimated_time_seconds, allow_calculator
) VALUES
('math-68-001', 'yes_no', 'math', 'operations', '6-8',
  'Is −4 × −2 = 8?',
  '[{"id":"yes","label":"Yes","correct":true},{"id":"no","label":"No","correct":false}]',
  -0.5, 1.8, 0.0, 'apply', 20, 0),

('math-68-002', 'multi_select', 'math', 'algebra', '6-8',
  'Select all equations equivalent to y = 3x + 6.',
  '[{"id":"a","label":"y − 6 = 3x","correct":true},{"id":"b","label":"y = 3(x + 2)","correct":true},{"id":"c","label":"y = 6x + 3","correct":false},{"id":"d","label":"y/3 = x + 2","correct":true}]',
  0.8, 1.6, 0.0, 'analyze', 60, 0),

('math-68-003', 'single_choice', 'math', 'number_sense', '6-8',
  'Which fraction is equivalent to 0.75?',
  '[{"id":"a","label":"1/4","correct":false},{"id":"b","label":"2/3","correct":false},{"id":"c","label":"3/4","correct":true},{"id":"d","label":"4/5","correct":false}]',
  -0.3, 1.4, 0.25, 'understand', 25, 0);

-- 9-12 Science
INSERT OR IGNORE INTO baseline_items (
  id, item_type, domain, sub_domain, grade_band,
  stem, options_json, difficulty, discrimination, guessing,
  cognitive_level, estimated_time_seconds
) VALUES
('science-912-001', 'yes_no', 'science', 'physical_science', '9-12',
  'Is gravitational force always attractive?',
  '[{"id":"yes","label":"Yes","correct":true},{"id":"no","label":"No","correct":false}]',
  0.5, 1.4, 0.0, 'understand', 25),

('science-912-002', 'multi_select', 'science', 'life_science', '9-12',
  'Select all accurate statements about DNA.',
  '[{"id":"a","label":"It is a double helix.","correct":true},{"id":"b","label":"It is made of nucleotides.","correct":true},{"id":"c","label":"All mutations are harmful.","correct":false},{"id":"d","label":"It is only found in animals.","correct":false}]',
  1.2, 1.7, 0.0, 'analyze', 50),

('science-912-003', 'single_choice', 'science', 'earth_science', '9-12',
  'What causes seasons on Earth?',
  '[{"id":"a","label":"Earth''s distance from the Sun","correct":false},{"id":"b","label":"Earth''s axial tilt","correct":true},{"id":"c","label":"The Moon''s gravity","correct":false},{"id":"d","label":"Solar flares","correct":false}]',
  0.3, 1.5, 0.25, 'understand', 35);

-- SEL (Social-Emotional Learning)
INSERT OR IGNORE INTO baseline_items (
  id, item_type, domain, sub_domain, grade_band,
  stem, options_json, difficulty, discrimination, guessing,
  cognitive_level, estimated_time_seconds
) VALUES
('sel-k5-001', 'single_choice', 'sel', 'self_awareness', 'K-5',
  'When you feel angry, what is a good way to calm down?',
  '[{"id":"a","label":"Yell at someone","correct":false},{"id":"b","label":"Take deep breaths","correct":true},{"id":"c","label":"Throw things","correct":false},{"id":"d","label":"Run away","correct":false}]',
  -0.8, 1.3, 0.25, 'apply', 30),

('sel-68-001', 'multi_select', 'sel', 'social_awareness', '6-8',
  'Select signs that someone might be feeling sad.',
  '[{"id":"a","label":"Smiling and laughing","correct":false},{"id":"b","label":"Crying or teary eyes","correct":true},{"id":"c","label":"Avoiding friends","correct":true},{"id":"d","label":"Talking excitedly","correct":false}]',
  0.0, 1.4, 0.0, 'understand', 40);

-- Comment
INSERT OR IGNORE INTO baseline_items (id, item_type, domain, sub_domain, grade_band, stem, difficulty, discrimination, cognitive_level, estimated_time_seconds, status)
VALUES ('schema-version', 'yes_no', 'reading', 'meta', 'K-5', 'Schema v1.1 - Speech Therapy Added - 2025-01-26', 0, 1, 'remember', 0, 'retired');

-- ═══════════════════════════════════════════════════════════════════════
-- SPEECH THERAPY ITEMS
-- ═══════════════════════════════════════════════════════════════════════

-- K-5 Speech Therapy - Articulation
INSERT OR IGNORE INTO baseline_items (
  id, item_type, domain, sub_domain, grade_band,
  stem, stimulus, options_json, difficulty, discrimination, guessing,
  cognitive_level, estimated_time_seconds, read_aloud_enabled
) VALUES
('speech-k5-001', 'read_aloud', 'speech', 'articulation', 'K-5',
  'Say the word "sun" clearly. Listen to how it sounds.',
  'sun',
  NULL,
  -1.5, 1.4, 0.0, 'apply', 20, 1),

('speech-k5-002', 'read_aloud', 'speech', 'articulation', 'K-5',
  'Say this sentence: "The cat sat on the mat."',
  'The cat sat on the mat',
  NULL,
  -0.8, 1.5, 0.0, 'apply', 30, 1),

('speech-k5-003', 'read_aloud', 'speech', 'articulation', 'K-5',
  'Say these sounds: /s/ /th/ /r/',
  's, th, r',
  NULL,
  0.2, 1.6, 0.0, 'apply', 25, 1);

-- K-5 Speech Therapy - Language Expression
INSERT OR IGNORE INTO baseline_items (
  id, item_type, domain, sub_domain, grade_band,
  stem, stimulus, difficulty, discrimination, guessing,
  cognitive_level, estimated_time_seconds
) VALUES
('speech-k5-004', 'read_aloud', 'speech', 'language_expression', 'K-5',
  'Tell me what you see in this picture. Use complete sentences.',
  'Picture of children playing at a park',
  -0.5, 1.4, 0.0, 'create', 60),

('speech-k5-005', 'single_choice', 'speech', 'language_comprehension', 'K-5',
  'Listen: "The boy threw the ball." Who threw the ball?',
  '[{"id":"a","label":"The girl","correct":false},{"id":"b","label":"The boy","correct":true},{"id":"c","label":"The dog","correct":false},{"id":"d","label":"The teacher","correct":false}]',
  -1.0, 1.3, 0.25, 'understand', 20);

-- 6-8 Speech Therapy - Fluency
INSERT OR IGNORE INTO baseline_items (
  id, item_type, domain, sub_domain, grade_band,
  stem, stimulus, difficulty, discrimination, guessing,
  cognitive_level, estimated_time_seconds
) VALUES
('speech-68-001', 'read_aloud', 'speech', 'fluency_stuttering', '6-8',
  'Read this passage smoothly and at your own pace: "The quick brown fox jumps over the lazy dog. Every morning, the fox runs through the meadow looking for breakfast."',
  'The quick brown fox jumps over the lazy dog. Every morning, the fox runs through the meadow looking for breakfast.',
  0.3, 1.5, 0.0, 'apply', 45),

('speech-68-002', 'read_aloud', 'speech', 'voice', '6-8',
  'Say "Hello, how are you today?" in a clear, friendly voice.',
  'Hello, how are you today?',
  -0.2, 1.4, 0.0, 'apply', 15);

-- 6-8 Speech Therapy - Pragmatics
INSERT OR IGNORE INTO baseline_items (
  id, item_type, domain, sub_domain, grade_band,
  stem, stimulus, difficulty, discrimination,
  cognitive_level, estimated_time_seconds
) VALUES
('speech-68-003', 'read_aloud', 'speech', 'pragmatics', '6-8',
  'Your friend asks you about your favorite movie. Respond to them in 2-3 sentences.',
  'Friend: "What''s your favorite movie and why do you like it?"',
  0.5, 1.5, 'evaluate', 60);

-- 9-12 Speech Therapy - Advanced Language
INSERT OR IGNORE INTO baseline_items (
  id, item_type, domain, sub_domain, grade_band,
  stem, stimulus, difficulty, discrimination,
  cognitive_level, estimated_time_seconds
) VALUES
('speech-912-001', 'read_aloud', 'speech', 'language_expression', '9-12',
  'Explain the water cycle in your own words. Include at least 3 steps.',
  NULL,
  1.0, 1.6, 'create', 90),

('speech-912-002', 'read_aloud', 'speech', 'articulation', '9-12',
  'Read this tongue twister clearly: "She sells seashells by the seashore. The shells she sells are surely seashells."',
  'She sells seashells by the seashore. The shells she sells are surely seashells.',
  1.5, 1.7, 'apply', 40),

('speech-912-003', 'multi_select', 'speech', 'pragmatics', '9-12',
  'Which are good ways to show you''re listening in a conversation?',
  '[{"id":"a","label":"Make eye contact","correct":true},{"id":"b","label":"Look at your phone","correct":false},{"id":"c","label":"Nod your head","correct":true},{"id":"d","label":"Interrupt frequently","correct":false},{"id":"e","label":"Ask follow-up questions","correct":true}]',
  0.8, 1.5, 'evaluate', 40);
