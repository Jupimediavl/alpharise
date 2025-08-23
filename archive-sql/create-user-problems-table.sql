-- User Problems Tracking Table
-- Run this in Supabase SQL Editor

CREATE TABLE IF NOT EXISTS user_problems (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL,
    primary_problem VARCHAR(100) NOT NULL,
    additional_problems JSONB DEFAULT '[]'::jsonb,
    confirmed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Learning path progress
    current_step INTEGER DEFAULT 1,
    total_steps INTEGER DEFAULT 12,
    completed_steps JSONB DEFAULT '[]'::jsonb,
    
    -- Problem-specific progress
    progress_data JSONB DEFAULT '{}'::jsonb,
    
    UNIQUE(user_id)
);

-- Enable RLS
ALTER TABLE user_problems ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own problems" ON user_problems
    FOR SELECT USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can insert their own problems" ON user_problems
    FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);

CREATE POLICY "Users can update their own problems" ON user_problems
    FOR UPDATE USING (auth.uid()::text = user_id::text);

-- Index for performance
CREATE INDEX IF NOT EXISTS idx_user_problems_user_id ON user_problems(user_id);
CREATE INDEX IF NOT EXISTS idx_user_problems_primary ON user_problems(primary_problem);

-- Test data - Sample learning paths for different problems
INSERT INTO user_problems (user_id, primary_problem, additional_problems, total_steps, progress_data) VALUES
    ('00000000-0000-0000-0000-000000000001', 'premature_ejaculation', '["performance_anxiety"]', 12, '{"pe_technique_mastery": 0, "confidence_level": 30}'),
    ('00000000-0000-0000-0000-000000000002', 'confidence_building', '["communication_skills"]', 10, '{"social_interactions": 0, "self_esteem_score": 25}')
ON CONFLICT (user_id) DO NOTHING;

SELECT 'User problems table created successfully!' as status;