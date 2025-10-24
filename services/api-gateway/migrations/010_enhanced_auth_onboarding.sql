-- ==================================================================
-- AIVO Enhanced Authentication & Onboarding System
-- Migration 010: User Onboarding + License Management
-- 
-- Date: 2025-10-23
-- Prompt: PROMPT 63
-- Author: aivo-ai
-- ==================================================================

BEGIN;

-- ==================================================================
-- PART 1: Update Users Table with Onboarding Support
-- ==================================================================

-- Add onboarding status enum if not exists
DO $$ BEGIN
    CREATE TYPE onboarding_status AS ENUM (
        'pending',
        'profile_complete',
        'child_added',
        'assessment_pending',
        'assessment_complete',
        'complete'
    );
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

-- Add new columns to users table
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS phone VARCHAR(20),
ADD COLUMN IF NOT EXISTS onboarding_status onboarding_status DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS onboarding_completed_at TIMESTAMP,
ADD COLUMN IF NOT EXISTS school_name VARCHAR(500),
ADD COLUMN IF NOT EXISTS district_name VARCHAR(500),
ADD COLUMN IF NOT EXISTS license_id VARCHAR(6),
ADD COLUMN IF NOT EXISTS last_login TIMESTAMP,
ADD COLUMN IF NOT EXISTS email_verified_at TIMESTAMP,
ADD COLUMN IF NOT EXISTS password_reset_token VARCHAR(255),
ADD COLUMN IF NOT EXISTS password_reset_expires TIMESTAMP;

-- Create index on license_id for teacher lookups
CREATE INDEX IF NOT EXISTS idx_users_license_id ON users(license_id) WHERE license_id IS NOT NULL;

-- Create index on onboarding_status for analytics
CREATE INDEX IF NOT EXISTS idx_users_onboarding_status ON users(onboarding_status);

COMMENT ON COLUMN users.onboarding_status IS 'Progressive onboarding flow tracking';
COMMENT ON COLUMN users.school_name IS 'Teacher school name (for teachers only)';
COMMENT ON COLUMN users.district_name IS 'Teacher district name (for teachers only)';
COMMENT ON COLUMN users.license_id IS 'Teacher 6-digit license ID';


-- ==================================================================
-- PART 2: License Management Tables
-- ==================================================================

-- Licenses table for district/school seat allocation
CREATE TABLE IF NOT EXISTS licenses (
    id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
    license_id VARCHAR(6) UNIQUE NOT NULL,
    license_type VARCHAR(50) NOT NULL CHECK (license_type IN ('district', 'school', 'individual')),
    
    -- Assignment
    district_id VARCHAR(36),
    district_name VARCHAR(500),
    school_name VARCHAR(500),
    
    -- Allocation
    total_seats INTEGER NOT NULL CHECK (total_seats > 0),
    used_seats INTEGER NOT NULL DEFAULT 0 CHECK (used_seats >= 0),
    available_seats INTEGER NOT NULL CHECK (available_seats >= 0),
    
    -- Validity
    valid_from TIMESTAMP NOT NULL DEFAULT NOW(),
    valid_until TIMESTAMP NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    
    -- Timestamps
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT chk_seats_valid CHECK (used_seats <= total_seats),
    CONSTRAINT chk_available_seats CHECK (available_seats = total_seats - used_seats),
    CONSTRAINT chk_valid_dates CHECK (valid_until > valid_from)
);

CREATE INDEX idx_licenses_license_id ON licenses(license_id);
CREATE INDEX idx_licenses_district_id ON licenses(district_id) WHERE district_id IS NOT NULL;
CREATE INDEX idx_licenses_active ON licenses(is_active, valid_until) WHERE is_active = TRUE;

COMMENT ON TABLE licenses IS 'Teacher/District license seat allocation';
COMMENT ON COLUMN licenses.license_id IS '6-digit unique license identifier';
COMMENT ON COLUMN licenses.total_seats IS 'Total student seats allocated to this license';
COMMENT ON COLUMN licenses.used_seats IS 'Number of seats currently in use';
COMMENT ON COLUMN licenses.available_seats IS 'Remaining available seats (computed)';


-- License Assignments table (which student → which license)
CREATE TABLE IF NOT EXISTS license_assignments (
    id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
    
    -- Foreign Keys
    license_id VARCHAR(6) NOT NULL REFERENCES licenses(license_id) ON DELETE CASCADE,
    learner_id VARCHAR(36) NOT NULL REFERENCES learners(id) ON DELETE CASCADE,
    teacher_id VARCHAR(36) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Assignment Info
    assigned_at TIMESTAMP NOT NULL DEFAULT NOW(),
    assigned_by VARCHAR(36) NOT NULL,  -- User ID who assigned
    
    -- Status
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    deactivated_at TIMESTAMP,
    
    -- Timestamps
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    
    -- Unique constraint: one active assignment per learner
    CONSTRAINT uq_active_learner_license UNIQUE (learner_id, is_active)
);

CREATE INDEX idx_license_assignments_license ON license_assignments(license_id);
CREATE INDEX idx_license_assignments_learner ON license_assignments(learner_id);
CREATE INDEX idx_license_assignments_teacher ON license_assignments(teacher_id);
CREATE INDEX idx_license_assignments_active ON license_assignments(is_active) WHERE is_active = TRUE;

COMMENT ON TABLE license_assignments IS 'Tracks which students are assigned to which licenses';
COMMENT ON COLUMN license_assignments.assigned_by IS 'User ID of teacher/admin who made the assignment';


-- ==================================================================
-- PART 3: Refresh Token Management (for JWT)
-- ==================================================================

CREATE TABLE IF NOT EXISTS refresh_tokens (
    id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
    
    -- Foreign Key
    user_id VARCHAR(36) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Token Info
    token VARCHAR(500) UNIQUE NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    is_revoked BOOLEAN NOT NULL DEFAULT FALSE,
    
    -- Timestamps
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_refresh_tokens_user ON refresh_tokens(user_id);
CREATE INDEX idx_refresh_tokens_token ON refresh_tokens(token);
CREATE INDEX idx_refresh_tokens_expires ON refresh_tokens(expires_at, is_revoked) 
    WHERE is_revoked = FALSE;

COMMENT ON TABLE refresh_tokens IS 'JWT refresh token tracking for secure session management';


-- ==================================================================
-- PART 4: Triggers for Auto-Computing Available Seats
-- ==================================================================

-- Function to auto-compute available_seats
CREATE OR REPLACE FUNCTION update_license_available_seats()
RETURNS TRIGGER AS $$
BEGIN
    NEW.available_seats := NEW.total_seats - NEW.used_seats;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger on licenses table
CREATE TRIGGER trg_license_compute_available_seats
BEFORE INSERT OR UPDATE OF total_seats, used_seats ON licenses
FOR EACH ROW
EXECUTE FUNCTION update_license_available_seats();


-- Function to auto-increment/decrement used_seats
CREATE OR REPLACE FUNCTION update_license_used_seats()
RETURNS TRIGGER AS $$
BEGIN
    IF (TG_OP = 'INSERT' AND NEW.is_active = TRUE) THEN
        -- New active assignment: increment used_seats
        UPDATE licenses 
        SET used_seats = used_seats + 1
        WHERE license_id = NEW.license_id;
    ELSIF (TG_OP = 'UPDATE') THEN
        IF (OLD.is_active = FALSE AND NEW.is_active = TRUE) THEN
            -- Reactivated: increment
            UPDATE licenses 
            SET used_seats = used_seats + 1
            WHERE license_id = NEW.license_id;
        ELSIF (OLD.is_active = TRUE AND NEW.is_active = FALSE) THEN
            -- Deactivated: decrement
            UPDATE licenses 
            SET used_seats = used_seats - 1
            WHERE license_id = NEW.license_id;
        END IF;
    ELSIF (TG_OP = 'DELETE' AND OLD.is_active = TRUE) THEN
        -- Deleted active assignment: decrement
        UPDATE licenses 
        SET used_seats = used_seats - 1
        WHERE license_id = OLD.license_id;
    END IF;
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Trigger on license_assignments table
CREATE TRIGGER trg_license_assignment_update_seats
AFTER INSERT OR UPDATE OF is_active OR DELETE ON license_assignments
FOR EACH ROW
EXECUTE FUNCTION update_license_used_seats();


-- ==================================================================
-- PART 5: Sample Data - Create Demo Licenses
-- ==================================================================

-- Insert 3 demo licenses for testing
INSERT INTO licenses (
    license_id,
    license_type,
    district_id,
    district_name,
    school_name,
    total_seats,
    used_seats,
    available_seats,
    valid_from,
    valid_until,
    is_active
) VALUES
    (
        'ABC123',
        'district',
        '1',
        'Los Angeles Unified School District',
        NULL,
        1000,
        0,
        1000,
        NOW(),
        NOW() + INTERVAL '1 year',
        TRUE
    ),
    (
        'DEF456',
        'school',
        '2',
        'New York City Department of Education',
        'PS 123 Elementary School',
        100,
        0,
        100,
        NOW(),
        NOW() + INTERVAL '1 year',
        TRUE
    ),
    (
        'GHI789',
        'individual',
        NULL,
        NULL,
        'Homeschool - Private',
        30,
        0,
        30,
        NOW(),
        NOW() + INTERVAL '1 year',
        TRUE
    )
ON CONFLICT (license_id) DO NOTHING;


-- ==================================================================
-- PART 6: Verification Queries
-- ==================================================================

-- Verify tables created
DO $$
DECLARE
    table_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO table_count
    FROM information_schema.tables
    WHERE table_schema = 'public'
    AND table_name IN ('licenses', 'license_assignments', 'refresh_tokens');
    
    IF table_count = 3 THEN
        RAISE NOTICE 'SUCCESS: All 3 new tables created (licenses, license_assignments, refresh_tokens)';
    ELSE
        RAISE EXCEPTION 'FAILED: Expected 3 tables, found %', table_count;
    END IF;
END $$;

-- Verify users table updated
DO $$
DECLARE
    column_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO column_count
    FROM information_schema.columns
    WHERE table_name = 'users'
    AND column_name IN (
        'phone', 'onboarding_status', 'onboarding_completed_at',
        'school_name', 'district_name', 'license_id',
        'last_login', 'email_verified_at'
    );
    
    IF column_count = 8 THEN
        RAISE NOTICE 'SUCCESS: Users table updated with 8 new columns';
    ELSE
        RAISE WARNING 'Users table has % of expected 8 columns', column_count;
    END IF;
END $$;

-- Verify indexes created
DO $$
DECLARE
    index_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO index_count
    FROM pg_indexes
    WHERE schemaname = 'public'
    AND indexname LIKE '%license%';
    
    RAISE NOTICE 'Created % license-related indexes', index_count;
END $$;

-- Verify sample licenses
SELECT 
    license_id,
    license_type,
    district_name,
    total_seats,
    used_seats,
    available_seats,
    valid_until
FROM licenses
ORDER BY license_id;

COMMIT;

-- ==================================================================
-- Migration Summary
-- ==================================================================
-- ✅ Updated users table with 8 onboarding fields
-- ✅ Created licenses table for seat allocation
-- ✅ Created license_assignments table for student-license tracking
-- ✅ Created refresh_tokens table for JWT session management
-- ✅ Added 2 triggers for auto-computing seat availability
-- ✅ Created 10+ indexes for performance
-- ✅ Seeded 3 demo licenses (ABC123, DEF456, GHI789)
-- 
-- Next Steps:
-- 1. Run migration: psql -U aivo_user -d aivo_db -f 010_enhanced_auth_onboarding.sql
-- 2. Build authentication endpoints (auth.py)
-- 3. Create frontend registration forms
-- 4. Test parent & teacher onboarding flows
-- ==================================================================
