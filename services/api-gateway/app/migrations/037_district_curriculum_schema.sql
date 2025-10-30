-- ═══════════════════════════════════════════════════════════════════════
-- DISTRICT CURRICULUM MANAGEMENT SCHEMA
-- Migration: 037_district_curriculum_schema.sql
-- Created: 2025-10-29
-- Author: aivo-ai
-- ═══════════════════════════════════════════════════════════════════════

-- ═══════════════════════════════════════════════════════════════════════
-- DISTRICTS TABLE
-- ═══════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS districts (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  name TEXT NOT NULL UNIQUE,
  state TEXT,
  type TEXT CHECK (type IN ('public', 'private', 'charter', 'homeschool')),
  student_count INTEGER,
  
  -- Curriculum framework
  primary_framework TEXT DEFAULT 'common_core' CHECK (
    primary_framework IN ('common_core', 'state_standards', 'custom', 'international')
  ),
  framework_version TEXT,
  
  -- Configuration
  settings_json TEXT, -- JSON: assessment preferences, accommodations, etc.
  
  -- Metadata
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  active INTEGER DEFAULT 1
);

-- ═══════════════════════════════════════════════════════════════════════
-- CURRICULUM STANDARDS TABLE
-- ═══════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS curriculum_standards (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  district_id TEXT,
  
  -- Standard identification
  standard_code TEXT NOT NULL, -- e.g., "CCSS.MATH.CONTENT.K.CC.A.1"
  standard_framework TEXT NOT NULL, -- 'common_core', 'ngss', 'state', etc.
  
  -- Classification
  domain TEXT NOT NULL CHECK (domain IN ('reading', 'math', 'science', 'writing', 'sel', 'speech')),
  sub_domain TEXT NOT NULL,
  grade_band TEXT NOT NULL CHECK (grade_band IN ('K-5', '6-8', '9-12')),
  
  -- Content
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  learning_objectives_json TEXT, -- JSON array of specific objectives
  
  -- Metadata
  cognitive_level TEXT CHECK (cognitive_level IN (
    'remember', 'understand', 'apply', 'analyze', 'evaluate', 'create'
  )),
  prerequisites_json TEXT, -- JSON array of prerequisite standard IDs
  
  -- Priority and pacing
  priority TEXT DEFAULT 'core' CHECK (priority IN ('essential', 'core', 'supplemental')),
  recommended_assessment_frequency TEXT, -- 'weekly', 'monthly', 'quarterly', 'annual'
  
  -- Tracking
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  active INTEGER DEFAULT 1,
  
  FOREIGN KEY (district_id) REFERENCES districts(id) ON DELETE CASCADE
);

CREATE INDEX idx_standards_district ON curriculum_standards(district_id);
CREATE INDEX idx_standards_domain_grade ON curriculum_standards(domain, grade_band);
CREATE INDEX idx_standards_code ON curriculum_standards(standard_code);
CREATE INDEX idx_standards_framework ON curriculum_standards(standard_framework, grade_band);

-- ═══════════════════════════════════════════════════════════════════════
-- SCHOOLS TABLE
-- ═══════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS schools (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  district_id TEXT NOT NULL,
  name TEXT NOT NULL,
  school_type TEXT CHECK (school_type IN ('elementary', 'middle', 'high', 'k12', 'special_ed')),
  
  -- Location
  address TEXT,
  city TEXT,
  state TEXT,
  zip_code TEXT,
  
  -- Configuration
  custom_standards_json TEXT, -- School-specific standard modifications
  assessment_preferences_json TEXT,
  
  -- Metadata
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  active INTEGER DEFAULT 1,
  
  FOREIGN KEY (district_id) REFERENCES districts(id) ON DELETE CASCADE
);

CREATE INDEX idx_schools_district ON schools(district_id);

-- ═══════════════════════════════════════════════════════════════════════
-- LEARNER-DISTRICT ASSOCIATION
-- ═══════════════════════════════════════════════════════════════════════

-- Add district/school columns to learners table (if not exists)
-- Note: SQLite doesn't support IF NOT EXISTS for ALTER TABLE, so we'll handle this carefully
-- Check if columns exist first in production

-- CREATE TABLE learners_new AS SELECT * FROM learners;
-- ALTER TABLE learners_new ADD COLUMN district_id TEXT;
-- ALTER TABLE learners_new ADD COLUMN school_id TEXT;
-- DROP TABLE learners;
-- ALTER TABLE learners_new RENAME TO learners;

-- For safety, we'll skip the ALTER TABLE here and handle it in code
-- Uncomment if learners table needs these columns:
-- ALTER TABLE learners ADD COLUMN district_id TEXT;
-- ALTER TABLE learners ADD COLUMN school_id TEXT;

-- CREATE INDEX IF NOT EXISTS idx_learners_district ON learners(district_id);
-- CREATE INDEX IF NOT EXISTS idx_learners_school ON learners(school_id);

-- ═══════════════════════════════════════════════════════════════════════
-- ASSESSMENT-STANDARD MAPPING
-- ═══════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS baseline_item_standards (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  item_id TEXT NOT NULL,
  standard_id TEXT NOT NULL,
  
  -- Alignment strength
  alignment_strength TEXT DEFAULT 'primary' CHECK (
    alignment_strength IN ('primary', 'secondary', 'tangential')
  ),
  
  -- Notes
  alignment_notes TEXT,
  verified_by TEXT, -- educator who verified alignment
  verified_at TIMESTAMP,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (standard_id) REFERENCES curriculum_standards(id) ON DELETE CASCADE,
  
  UNIQUE(item_id, standard_id)
);

CREATE INDEX idx_item_standards_item ON baseline_item_standards(item_id);
CREATE INDEX idx_item_standards_standard ON baseline_item_standards(standard_id);

-- ═══════════════════════════════════════════════════════════════════════
-- STANDARD COVERAGE TRACKING
-- ═══════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS learner_standard_coverage (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  learner_id TEXT NOT NULL,
  standard_id TEXT NOT NULL,
  
  -- Coverage metrics
  times_assessed INTEGER DEFAULT 0,
  first_assessed_at TIMESTAMP,
  last_assessed_at TIMESTAMP,
  
  -- Performance on this standard
  total_items_attempted INTEGER DEFAULT 0,
  total_items_correct INTEGER DEFAULT 0,
  accuracy_rate REAL, -- percentage correct
  
  -- IRT estimates for this specific standard
  theta_estimate REAL,
  standard_error REAL,
  
  -- Mastery tracking
  mastery_status TEXT CHECK (mastery_status IN (
    'not_assessed', 'emerging', 'developing', 'proficient', 'advanced'
  )),
  mastery_achieved_at TIMESTAMP,
  
  -- Metadata
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  UNIQUE(learner_id, standard_id)
);

CREATE INDEX idx_coverage_learner ON learner_standard_coverage(learner_id);
CREATE INDEX idx_coverage_standard ON learner_standard_coverage(standard_id);
CREATE INDEX idx_coverage_mastery ON learner_standard_coverage(learner_id, mastery_status);

-- ═══════════════════════════════════════════════════════════════════════
-- INSERT DEFAULT COMMON CORE STANDARDS
-- ═══════════════════════════════════════════════════════════════════════

-- Create default district for unassigned learners
INSERT OR IGNORE INTO districts (id, name, state, primary_framework)
VALUES ('default-district', 'Default District', NULL, 'common_core');

-- K-5 Reading Standards
INSERT OR IGNORE INTO curriculum_standards (
  id, district_id, standard_code, standard_framework, domain, sub_domain, grade_band,
  title, description, cognitive_level, priority
) VALUES
('ccss-rf-k5-phonics', 'default-district', 'CCSS.ELA-LITERACY.RF.K-5.3', 'common_core', 
 'reading', 'phonics', 'K-5',
 'Phonics and Word Recognition',
 'Know and apply grade-level phonics and word analysis skills in decoding words.',
 'remember', 'essential'),

('ccss-rl-k5-details', 'default-district', 'CCSS.ELA-LITERACY.RL.K-5.1', 'common_core',
 'reading', 'comprehension', 'K-5',
 'Key Details',
 'Ask and answer questions about key details in a text.',
 'understand', 'essential'),

('ccss-rl-k5-theme', 'default-district', 'CCSS.ELA-LITERACY.RL.K-5.2', 'common_core',
 'reading', 'comprehension', 'K-5',
 'Main Idea and Theme',
 'Recount stories and determine their central message, lesson, or moral.',
 'understand', 'core'),

('ccss-rl-k5-inference', 'default-district', 'CCSS.ELA-LITERACY.RL.K-5.3', 'common_core',
 'reading', 'inference', 'K-5',
 'Making Inferences',
 'Describe characters, settings, and major events using key details.',
 'analyze', 'core');

-- K-5 Math Standards
INSERT OR IGNORE INTO curriculum_standards (
  id, district_id, standard_code, standard_framework, domain, sub_domain, grade_band,
  title, description, cognitive_level, priority
) VALUES
('ccss-math-k5-counting', 'default-district', 'CCSS.MATH.CONTENT.K.CC.A', 'common_core',
 'math', 'number_sense', 'K-5',
 'Counting and Cardinality',
 'Know number names and the count sequence.',
 'remember', 'essential'),

('ccss-math-k5-operations', 'default-district', 'CCSS.MATH.CONTENT.K-5.OA', 'common_core',
 'math', 'operations', 'K-5',
 'Operations and Algebraic Thinking',
 'Represent and solve problems involving addition and subtraction.',
 'apply', 'essential'),

('ccss-math-k5-place-value', 'default-district', 'CCSS.MATH.CONTENT.K-5.NBT', 'common_core',
 'math', 'number_sense', 'K-5',
 'Number and Operations in Base Ten',
 'Understand place value and properties of operations.',
 'understand', 'essential'),

('ccss-math-k5-geometry', 'default-district', 'CCSS.MATH.CONTENT.K-5.G', 'common_core',
 'math', 'geometry', 'K-5',
 'Geometry',
 'Identify and describe shapes (squares, circles, triangles, rectangles).',
 'understand', 'core');

-- K-5 Science Standards (NGSS)
INSERT OR IGNORE INTO curriculum_standards (
  id, district_id, standard_code, standard_framework, domain, sub_domain, grade_band,
  title, description, cognitive_level, priority
) VALUES
('ngss-k5-ps-matter', 'default-district', 'NGSS.K-5-PS1', 'ngss',
 'science', 'physical_science', 'K-5',
 'Matter and Its Interactions',
 'Plan and conduct investigations to describe and classify different kinds of materials.',
 'apply', 'essential'),

('ngss-k5-ls-organisms', 'default-district', 'NGSS.K-5-LS1', 'ngss',
 'science', 'life_science', 'K-5',
 'From Molecules to Organisms',
 'Use observations to describe patterns of what plants and animals need to survive.',
 'understand', 'essential'),

('ngss-k5-ess-earth', 'default-district', 'NGSS.K-5-ESS2', 'ngss',
 'science', 'earth_space', 'K-5',
 'Earth''s Systems',
 'Use and share observations of local weather conditions to describe patterns over time.',
 'analyze', 'core');

-- 6-8 Reading Standards
INSERT OR IGNORE INTO curriculum_standards (
  id, district_id, standard_code, standard_framework, domain, sub_domain, grade_band,
  title, description, cognitive_level, priority
) VALUES
('ccss-rl-68-cite', 'default-district', 'CCSS.ELA-LITERACY.RL.6-8.1', 'common_core',
 'reading', 'comprehension', '6-8',
 'Cite Textual Evidence',
 'Cite textual evidence to support analysis of what the text says explicitly and implicitly.',
 'analyze', 'essential'),

('ccss-rl-68-theme', 'default-district', 'CCSS.ELA-LITERACY.RL.6-8.2', 'common_core',
 'reading', 'comprehension', '6-8',
 'Determine Theme',
 'Determine a theme or central idea of a text and how it is developed through specific details.',
 'analyze', 'essential'),

('ccss-rl-68-analysis', 'default-district', 'CCSS.ELA-LITERACY.RL.6-8.3', 'common_core',
 'reading', 'inference', '6-8',
 'Analyze Story Elements',
 'Analyze how particular elements of a story or drama interact.',
 'analyze', 'core');

-- 6-8 Math Standards
INSERT OR IGNORE INTO curriculum_standards (
  id, district_id, standard_code, standard_framework, domain, sub_domain, grade_band,
  title, description, cognitive_level, priority
) VALUES
('ccss-math-68-ratios', 'default-district', 'CCSS.MATH.CONTENT.6-8.RP', 'common_core',
 'math', 'ratios', '6-8',
 'Ratios and Proportional Relationships',
 'Understand ratio concepts and use ratio reasoning to solve problems.',
 'apply', 'essential'),

('ccss-math-68-expressions', 'default-district', 'CCSS.MATH.CONTENT.6-8.EE', 'common_core',
 'math', 'algebra', '6-8',
 'Expressions and Equations',
 'Apply and extend understanding of arithmetic to algebraic expressions.',
 'apply', 'essential'),

('ccss-math-68-functions', 'default-district', 'CCSS.MATH.CONTENT.8.F', 'common_core',
 'math', 'algebra', '6-8',
 'Functions',
 'Define, evaluate, and compare functions.',
 'understand', 'core');

-- 9-12 Reading Standards
INSERT OR IGNORE INTO curriculum_standards (
  id, district_id, standard_code, standard_framework, domain, sub_domain, grade_band,
  title, description, cognitive_level, priority
) VALUES
('ccss-rl-912-evidence', 'default-district', 'CCSS.ELA-LITERACY.RL.9-12.1', 'common_core',
 'reading', 'comprehension', '9-12',
 'Cite Strong Evidence',
 'Cite strong and thorough textual evidence to support analysis of what the text says explicitly and implicitly.',
 'evaluate', 'essential'),

('ccss-rl-912-theme', 'default-district', 'CCSS.ELA-LITERACY.RL.9-12.2', 'common_core',
 'reading', 'comprehension', '9-12',
 'Analyze Theme Development',
 'Determine two or more themes or central ideas of a text and analyze their development.',
 'evaluate', 'essential');

-- 9-12 Math Standards
INSERT OR IGNORE INTO curriculum_standards (
  id, district_id, standard_code, standard_framework, domain, sub_domain, grade_band,
  title, description, cognitive_level, priority
) VALUES
('ccss-math-912-algebra', 'default-district', 'CCSS.MATH.CONTENT.HSA', 'common_core',
 'math', 'algebra', '9-12',
 'Algebra',
 'Perform arithmetic operations on polynomials and rational expressions.',
 'apply', 'essential'),

('ccss-math-912-functions', 'default-district', 'CCSS.MATH.CONTENT.HSF', 'common_core',
 'math', 'algebra', '9-12',
 'Functions',
 'Interpret functions that arise in applications in terms of context.',
 'analyze', 'essential');

-- ═══════════════════════════════════════════════════════════════════════
-- VERIFICATION QUERIES
-- ═══════════════════════════════════════════════════════════════════════

-- Count standards by domain and grade band
SELECT 
  domain,
  grade_band,
  COUNT(*) as standard_count
FROM curriculum_standards
GROUP BY domain, grade_band
ORDER BY domain, grade_band;

-- Verify districts table
SELECT COUNT(*) as district_count FROM districts;

SELECT '✅ Migration 037 complete: District curriculum schema created' as status;
