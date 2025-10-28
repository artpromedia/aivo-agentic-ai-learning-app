-- ═══════════════════════════════════════════════════════════════════════
-- BASELINE ASSESSMENT SCHEMA UPDATES FOR NEURODIVERSE SUPPORT
-- Migration: 036_update_schema_neurodiverse.sql
-- Created: 2025-10-28
-- ═══════════════════════════════════════════════════════════════════════

-- ═══════════════════════════════════════════════════════════════════════
-- 1. ADD NEW SUB-DOMAINS
-- ═══════════════════════════════════════════════════════════════════════

-- Note: SQLite doesn't support ALTER CHECK constraint
-- If new sub-domains needed, items can still be inserted
-- The CHECK constraint on sub_domain is just TEXT NOT NULL

-- ═══════════════════════════════════════════════════════════════════════
-- 2. ADD ACCESSIBILITY METADATA COLUMNS TO baseline_items
-- ═══════════════════════════════════════════════════════════════════════

-- Add accessibility features JSON column
ALTER TABLE baseline_items ADD COLUMN accessibility_features_json TEXT DEFAULT '{}';

-- Add neurodiverse-friendly flag
ALTER TABLE baseline_items ADD COLUMN neurodiverse_friendly INTEGER DEFAULT 0;

-- Add estimated difficulty level for reports
ALTER TABLE baseline_items ADD COLUMN estimated_difficulty_level TEXT 
  CHECK (estimated_difficulty_level IN ('easy', 'medium', 'hard', NULL));

-- Add visual support URL
ALTER TABLE baseline_items ADD COLUMN visual_support_url TEXT;

-- Add audio support URL (for pronunciation, instructions)
ALTER TABLE baseline_items ADD COLUMN audio_support_url TEXT;

-- Add hint text for struggling learners
ALTER TABLE baseline_items ADD COLUMN hint_text TEXT;

-- ═══════════════════════════════════════════════════════════════════════
-- 3. CREATE ACCESSIBILITY PREFERENCES TABLE
-- ═══════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS learner_accessibility_preferences (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  learner_id TEXT NOT NULL,
  
  -- Visual preferences
  font_size TEXT DEFAULT 'medium' CHECK (font_size IN ('small', 'medium', 'large', 'xlarge')),
  font_family TEXT DEFAULT 'default' CHECK (font_family IN ('default', 'dyslexic', 'comic')),
  high_contrast INTEGER DEFAULT 0,
  color_scheme TEXT DEFAULT 'calm-blue' CHECK (color_scheme IN ('calm-blue', 'soft-green', 'warm-purple', 'neutral-gray')),
  reduce_animations INTEGER DEFAULT 0,
  
  -- Audio preferences
  text_to_speech INTEGER DEFAULT 0,
  tts_voice TEXT DEFAULT 'female' CHECK (tts_voice IN ('male', 'female', 'child')),
  tts_speed REAL DEFAULT 1.0 CHECK (tts_speed >= 0.5 AND tts_speed <= 2.0),
  sound_effects INTEGER DEFAULT 1,
  
  -- Interaction preferences
  show_timer INTEGER DEFAULT 0,
  auto_advance INTEGER DEFAULT 0,
  keyboard_nav INTEGER DEFAULT 1,
  
  -- Break and pacing
  break_reminders INTEGER DEFAULT 1,
  break_interval INTEGER DEFAULT 15, -- minutes
  focus_mode INTEGER DEFAULT 0,
  
  -- Support features
  show_hints INTEGER DEFAULT 1,
  show_confidence_slider INTEGER DEFAULT 1,
  show_encouragement INTEGER DEFAULT 1,
  
  -- Metadata
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (learner_id) REFERENCES learners(id) ON DELETE CASCADE
);

CREATE INDEX idx_accessibility_prefs_learner ON learner_accessibility_preferences(learner_id);

-- ═══════════════════════════════════════════════════════════════════════
-- 4. UPDATE baseline_sessions TABLE
-- ═══════════════════════════════════════════════════════════════════════

-- Add engagement tracking columns
ALTER TABLE baseline_sessions ADD COLUMN breaks_taken INTEGER DEFAULT 0;
ALTER TABLE baseline_sessions ADD COLUMN total_break_time_ms INTEGER DEFAULT 0;
ALTER TABLE baseline_sessions ADD COLUMN hints_used INTEGER DEFAULT 0;
ALTER TABLE baseline_sessions ADD COLUMN tts_usage_count INTEGER DEFAULT 0;
ALTER TABLE baseline_sessions ADD COLUMN avg_confidence_level REAL;

-- Update stopping criteria
ALTER TABLE baseline_sessions ADD COLUMN min_items_per_domain INTEGER DEFAULT 5;
ALTER TABLE baseline_sessions ADD COLUMN max_items_per_domain INTEGER DEFAULT 7;

-- ═══════════════════════════════════════════════════════════════════════
-- 5. UPDATE baseline_responses TABLE
-- ═══════════════════════════════════════════════════════════════════════

-- Add confidence level (1-5 scale)
ALTER TABLE baseline_responses ADD COLUMN confidence_level INTEGER CHECK (confidence_level >= 1 AND confidence_level <= 5);

-- Add focus level tracking
ALTER TABLE baseline_responses ADD COLUMN focus_level TEXT CHECK (focus_level IN ('high', 'medium', 'low', NULL));

-- ═══════════════════════════════════════════════════════════════════════
-- 6. CREATE BREAK ACTIVITY LOG TABLE
-- ═══════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS baseline_break_activities (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  session_id TEXT NOT NULL,
  
  -- Break details
  break_type TEXT CHECK (break_type IN ('breathing', 'physical', 'mindful', 'custom')),
  activity_name TEXT,
  started_at TIMESTAMP NOT NULL,
  ended_at TIMESTAMP,
  duration_ms INTEGER,
  
  -- Context
  questions_completed_before_break INTEGER,
  current_domain TEXT,
  
  -- Effectiveness (optional learner self-report)
  felt_helpful INTEGER CHECK (felt_helpful IN (0, 1, NULL)),
  
  FOREIGN KEY (session_id) REFERENCES baseline_sessions(id) ON DELETE CASCADE
);

CREATE INDEX idx_break_activities_session ON baseline_break_activities(session_id);

-- ═══════════════════════════════════════════════════════════════════════
-- 7. UPDATE EXISTING ITEMS WITH ESTIMATED DIFFICULTY LEVELS
-- ═══════════════════════════════════════════════════════════════════════

UPDATE baseline_items
SET estimated_difficulty_level = CASE
  WHEN difficulty < -1.0 THEN 'easy'
  WHEN difficulty >= -1.0 AND difficulty < 0.5 THEN 'medium'
  WHEN difficulty >= 0.5 THEN 'hard'
END;

-- ═══════════════════════════════════════════════════════════════════════
-- 8. CREATE INDEXES FOR PERFORMANCE
-- ═══════════════════════════════════════════════════════════════════════

CREATE INDEX IF NOT EXISTS idx_baseline_items_neurodiverse 
  ON baseline_items(neurodiverse_friendly, domain, grade_band);

CREATE INDEX IF NOT EXISTS idx_baseline_items_difficulty_level 
  ON baseline_items(estimated_difficulty_level, grade_band);

CREATE INDEX IF NOT EXISTS idx_baseline_items_accessibility 
  ON baseline_items(domain, grade_band, neurodiverse_friendly, estimated_difficulty_level);

-- ═══════════════════════════════════════════════════════════════════════
-- 9. SAMPLE ACCESSIBILITY FEATURES DATA
-- ═══════════════════════════════════════════════════════════════════════

-- Update some items with accessibility features
UPDATE baseline_items
SET 
  accessibility_features_json = json_object(
    'tts_text', stem,
    'supports_audio', read_aloud_enabled,
    'visual_supports', CASE WHEN stimulus_type = 'image' THEN 1 ELSE 0 END,
    'complexity_level', estimated_difficulty_level
  ),
  neurodiverse_friendly = CASE 
    WHEN estimated_difficulty_level = 'easy' AND read_aloud_enabled = 1 THEN 1
    ELSE 0
  END
WHERE id LIKE 'reading-k5%' OR id LIKE 'math-k5%';

-- Add hints to some questions
UPDATE baseline_items
SET hint_text = 'Try reading the question slowly and identifying key words.'
WHERE domain = 'reading' AND grade_band = 'K-5';

UPDATE baseline_items
SET hint_text = 'Draw a picture or use objects to help you solve this.'
WHERE domain = 'math' AND grade_band = 'K-5';

UPDATE baseline_items
SET hint_text = 'Think about what you already know about this topic.'
WHERE domain = 'science';

-- ═══════════════════════════════════════════════════════════════════════
-- 10. DATA VALIDATION QUERIES
-- ═══════════════════════════════════════════════════════════════════════

-- Verify min 5 items per domain/grade_band
SELECT 
  domain,
  grade_band,
  COUNT(*) as item_count,
  CASE WHEN COUNT(*) >= 5 THEN '✓' ELSE '✗ MISSING ITEMS' END as status
FROM baseline_items
GROUP BY domain, grade_band
HAVING COUNT(*) < 5
ORDER BY domain, grade_band;

-- Check IRT parameter ranges
SELECT 
  COUNT(*) as invalid_items
FROM baseline_items
WHERE 
  discrimination <= 0 OR discrimination > 3 OR
  difficulty < -4 OR difficulty > 4 OR
  guessing < 0 OR guessing > 0.5;

-- Verify accessibility features
SELECT 
  COUNT(*) as items_with_accessibility,
  ROUND(COUNT(*) * 100.0 / (SELECT COUNT(*) FROM baseline_items), 1) as percentage
FROM baseline_items
WHERE accessibility_features_json IS NOT NULL AND accessibility_features_json != '{}';

-- Check neurodiverse-friendly items
SELECT 
  grade_band,
  COUNT(*) as neurodiverse_items
FROM baseline_items
WHERE neurodiverse_friendly = 1
GROUP BY grade_band;

-- ═══════════════════════════════════════════════════════════════════════
-- MIGRATION COMPLETE
-- ═══════════════════════════════════════════════════════════════════════

SELECT '✅ Migration 036 complete: Neurodiverse support schema updated' as status;
