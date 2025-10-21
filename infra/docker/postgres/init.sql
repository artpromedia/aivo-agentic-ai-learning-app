-- AIVO Database Initialization Script
-- This script runs automatically when PostgreSQL container starts for the first time

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enable pgcrypto for encryption
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create schema if needed
-- CREATE SCHEMA IF NOT EXISTS aivo;

-- Initial database setup complete
SELECT 'AIVO Database initialized successfully!' AS status;
