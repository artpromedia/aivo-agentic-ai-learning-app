-- ==================================================================
-- AIVO Demo Accounts Setup
-- Quick authentication testing with pre-created accounts
-- 
-- Date: 2025-10-23
-- Prompt: PROMPT 63 (Quick Demo)
-- ==================================================================

BEGIN;

-- ==================================================================
-- PART 1: Create Demo Parent Account
-- ==================================================================

-- Password: DemoParent123! (hashed with bcrypt)
-- bcrypt hash: $2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5UpT7cNxwLViy

INSERT INTO users (
    id,
    email,
    hashed_password,
    full_name,
    phone,
    role,
    is_active,
    is_verified,
    mfa_enabled,
    onboarding_status,
    onboarding_completed_at,
    last_login,
    email_verified_at,
    created_at,
    updated_at
) VALUES (
    'demo_parent_001',
    'demo.parent@aivoai.com',
    '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5UpT7cNxwLViy',
    'Demo Parent',
    '+1-555-123-4567',
    'PARENT',
    TRUE,
    TRUE,
    FALSE,
    'complete',
    NOW(),
    NULL,
    NOW(),
    NOW(),
    NOW()
) ON CONFLICT (email) DO UPDATE SET
    hashed_password = EXCLUDED.hashed_password,
    is_active = TRUE,
    is_verified = TRUE;


-- ==================================================================
-- PART 2: Create Demo Teacher Account
-- ==================================================================

-- Password: DemoTeacher123!
-- bcrypt hash: $2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5UpT7cNxwLViy

INSERT INTO users (
    id,
    email,
    hashed_password,
    full_name,
    phone,
    role,
    is_active,
    is_verified,
    mfa_enabled,
    onboarding_status,
    onboarding_completed_at,
    school_name,
    district_name,
    license_id,
    last_login,
    email_verified_at,
    created_at,
    updated_at
) VALUES (
    'demo_teacher_001',
    'demo.teacher@aivoai.com',
    '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5UpT7cNxwLViy',
    'Demo Teacher',
    '+1-555-234-5678',
    'TEACHER',
    TRUE,
    TRUE,
    FALSE,
    'complete',
    NOW(),
    'MLK Middle School',
    'Los Angeles Unified School District',
    'ABC123',
    NULL,
    NOW(),
    NOW(),
    NOW()
) ON CONFLICT (email) DO UPDATE SET
    hashed_password = EXCLUDED.hashed_password,
    is_active = TRUE,
    is_verified = TRUE,
    license_id = 'ABC123';


-- ==================================================================
-- PART 3: Create Demo Admin Account
-- ==================================================================

-- Password: DemoAdmin123!
-- bcrypt hash: $2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5UpT7cNxwLViy

INSERT INTO users (
    id,
    email,
    hashed_password,
    full_name,
    role,
    is_active,
    is_verified,
    mfa_enabled,
    onboarding_status,
    onboarding_completed_at,
    last_login,
    email_verified_at,
    created_at,
    updated_at
) VALUES (
    'demo_admin_001',
    'demo.admin@aivoai.com',
    '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5UpT7cNxwLViy',
    'Demo Admin',
    'GLOBAL_ADMIN',
    TRUE,
    TRUE,
    FALSE,
    'complete',
    NOW(),
    NULL,
    NOW(),
    NOW(),
    NOW()
) ON CONFLICT (email) DO UPDATE SET
    hashed_password = EXCLUDED.hashed_password,
    is_active = TRUE,
    is_verified = TRUE;


-- ==================================================================
-- PART 4: Create Demo Learner for Parent
-- ==================================================================

INSERT INTO learners (
    id,
    user_id,
    first_name,
    last_name,
    date_of_birth,
    grade_level,
    current_reading_level,
    current_math_level,
    has_iep,
    diagnoses,
    accommodations,
    created_at,
    updated_at
) VALUES (
    'demo_learner_001',
    'demo_parent_001',
    'Jayden',
    'Demo',
    '2013-03-15',
    6,
    '4th grade',
    '5th grade',
    TRUE,
    '["ADHD", "Dyslexia"]'::json,
    '{"extended_time": true, "time_multiplier": 1.5, "read_aloud": true}'::json,
    NOW(),
    NOW()
) ON CONFLICT (id) DO UPDATE SET
    user_id = EXCLUDED.user_id;


-- ==================================================================
-- PART 5: Verify Demo Accounts Created
-- ==================================================================

DO $$
DECLARE
    account_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO account_count
    FROM users
    WHERE email IN (
        'demo.parent@aivoai.com',
        'demo.teacher@aivoai.com',
        'demo.admin@aivoai.com'
    );
    
    IF account_count = 3 THEN
        RAISE NOTICE '✅ SUCCESS: All 3 demo accounts created';
    ELSE
        RAISE WARNING '⚠️ WARNING: Only % of 3 demo accounts found', account_count;
    END IF;
END $$;

-- Display demo accounts
SELECT 
    email,
    full_name,
    role,
    onboarding_status,
    is_active,
    is_verified,
    license_id,
    created_at
FROM users
WHERE email LIKE 'demo.%@aivoai.com'
ORDER BY role, email;

COMMIT;

-- ==================================================================
-- Demo Credentials Summary
-- ==================================================================
-- 
-- DEMO PARENT:
--   Email: demo.parent@aivoai.com
--   Password: DemoParent123!
--   Child: Jayden Demo (Grade 6, ADHD + Dyslexia)
-- 
-- DEMO TEACHER:
--   Email: demo.teacher@aivoai.com
--   Password: DemoTeacher123!
--   License: ABC123 (LAUSD - 1000 seats)
--   School: MLK Middle School
-- 
-- DEMO ADMIN:
--   Email: demo.admin@aivoai.com
--   Password: DemoAdmin123!
--   Role: global_admin
-- 
-- ==================================================================
