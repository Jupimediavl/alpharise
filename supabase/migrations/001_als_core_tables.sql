-- =====================================================
-- AlphaRise Adaptive Learning System (ALS) 
-- Migration 001: Core Learning Tables
-- =====================================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- CORE LEARNING CONTENT TABLES
-- =====================================================

-- Learning Modules (Main content categories)
CREATE TABLE IF NOT EXISTS learning_modules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    coach_id VARCHAR(50) NOT NULL,
    module_code VARCHAR(50) UNIQUE NOT NULL,
    title VARCHAR(255) NOT NULL,
    subtitle VARCHAR(500),
    description TEXT,
    thumbnail_url VARCHAR(500),
    difficulty_level INTEGER DEFAULT 1 CHECK (difficulty_level BETWEEN 1 AND 5),
    estimated_duration INTEGER, -- in minutes
    unlock_at_score INTEGER DEFAULT 0,
    order_priority INTEGER DEFAULT 1,
    tags JSONB DEFAULT '[]'::jsonb,
    prerequisites JSONB DEFAULT '[]'::jsonb,
    is_premium BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Lessons within modules
CREATE TABLE IF NOT EXISTS lessons (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    module_id UUID REFERENCES learning_modules(id) ON DELETE CASCADE,
    lesson_number INTEGER NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    content_type VARCHAR(50) CHECK (content_type IN ('video', 'text', 'audio', 'interactive', 'mixed')),
    content_data JSONB NOT NULL,
    duration_minutes INTEGER,
    xp_reward INTEGER DEFAULT 10,
    coins_reward INTEGER DEFAULT 5,
    thumbnail_url VARCHAR(500),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(module_id, lesson_number)
);

-- Micro-learnings (Quick bite-sized content)
CREATE TABLE IF NOT EXISTS micro_learnings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    coach_id VARCHAR(50),
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    content_type VARCHAR(50) DEFAULT 'tip',
    difficulty INTEGER DEFAULT 1,
    xp_reward INTEGER DEFAULT 5,
    tags JSONB DEFAULT '[]'::jsonb,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Daily Challenges
CREATE TABLE IF NOT EXISTS daily_challenges (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    coach_id VARCHAR(50),
    challenge_type VARCHAR(50),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    difficulty INTEGER DEFAULT 1,
    xp_reward INTEGER DEFAULT 20,
    coins_reward INTEGER DEFAULT 10,
    success_criteria JSONB DEFAULT '{}'::jsonb,
    tags JSONB DEFAULT '[]'::jsonb,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for performance
CREATE INDEX idx_modules_coach_id ON learning_modules(coach_id);
CREATE INDEX idx_modules_active ON learning_modules(is_active);
CREATE INDEX idx_lessons_module_id ON lessons(module_id);
CREATE INDEX idx_lessons_active ON lessons(is_active);
CREATE INDEX idx_micro_coach_id ON micro_learnings(coach_id);
CREATE INDEX idx_challenges_coach_id ON daily_challenges(coach_id);

-- Create update trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply triggers
CREATE TRIGGER update_modules_updated_at BEFORE UPDATE ON learning_modules
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_lessons_updated_at BEFORE UPDATE ON lessons
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_micro_updated_at BEFORE UPDATE ON micro_learnings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_challenges_updated_at BEFORE UPDATE ON daily_challenges
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();