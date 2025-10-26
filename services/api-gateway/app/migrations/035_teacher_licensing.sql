-- Migration 035: Teacher Licensing System
-- Date: 2025-10-26
-- Description: Add support for district bulk licenses and teacher enrollment

-- 1. Drop existing constraints if they exist (SQLite doesn't support DROP CONSTRAINT directly)
-- We'll handle this by recreating the table if needed

-- 2. Create license_assignments table for tracking teacher enrollments
CREATE TABLE IF NOT EXISTS license_assignments (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  license_id TEXT NOT NULL,
  learner_id TEXT NOT NULL,
  teacher_id TEXT,
  assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  assigned_by_role VARCHAR(20) DEFAULT 'teacher',
  metadata TEXT,
  UNIQUE(license_id, learner_id)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_license_assignments_license ON license_assignments(license_id);
CREATE INDEX IF NOT EXISTS idx_license_assignments_teacher ON license_assignments(teacher_id);
CREATE INDEX IF NOT EXISTS idx_license_assignments_learner ON license_assignments(learner_id);
CREATE INDEX IF NOT EXISTS idx_license_assignments_assigned_at ON license_assignments(assigned_at);

-- 3. Update licenses table indexes
CREATE INDEX IF NOT EXISTS idx_licenses_type ON licenses(license_type);
CREATE INDEX IF NOT EXISTS idx_licenses_district ON licenses(district_id);
CREATE INDEX IF NOT EXISTS idx_licenses_status ON licenses(status);
CREATE INDEX IF NOT EXISTS idx_licenses_key ON licenses(license_key);

-- 4. Insert sample district licenses for testing
INSERT OR IGNORE INTO licenses (
  id, 
  license_key, 
  license_type, 
  status, 
  used_seats,
  district_name,
  district_id,
  created_by_role,
  expires_at,
  metadata
) VALUES 
(
  'test-district-license-1',
  'DIST-2025-ELEM-5678',
  'district_bulk',
  'active',
  0,
  'Springfield Elementary',
  'district-001',
  'district_admin',
  datetime('now', '+1 year'),
  '{"total_seats": 50, "grade_levels": ["K", "1", "2", "3", "4", "5"], "subjects": ["reading", "math", "science"], "features": ["baseline_assessment", "ai_brain", "homework_helper"]}'
),
(
  'test-school-license-1',
  'SCHL-2025-DEMO-1234',
  'school_bulk',
  'active',
  0,
  'Lincoln Middle School',
  'school-002',
  'school_admin',
  datetime('now', '+1 year'),
  '{"total_seats": 25, "grade_levels": ["6", "7", "8"], "subjects": ["reading", "math", "science", "writing"], "features": ["baseline_assessment", "ai_brain", "homework_helper", "progress_reports"]}'
),
(
  'test-classroom-license-1',
  'CLSS-2025-MATH-9999',
  'classroom',
  'active',
  0,
  'Mrs. Johnson - Room 204',
  'classroom-003',
  'teacher',
  datetime('now', '+6 months'),
  '{"total_seats": 10, "grade_levels": ["3"], "subjects": ["math"], "features": ["baseline_assessment", "ai_brain"]}'
);

-- 5. Create triggers to manage used_seats automatically
CREATE TRIGGER IF NOT EXISTS trg_increment_used_seats
AFTER INSERT ON license_assignments
BEGIN
  UPDATE licenses 
  SET used_seats = used_seats + 1
  WHERE id = NEW.license_id;
END;

CREATE TRIGGER IF NOT EXISTS trg_decrement_used_seats
AFTER DELETE ON license_assignments
BEGIN
  UPDATE licenses 
  SET used_seats = used_seats - 1
  WHERE id = OLD.license_id;
END;

PRAGMA foreign_keys = ON;

SELECT '✅ Migration 035 completed: Teacher licensing system ready' as status;
