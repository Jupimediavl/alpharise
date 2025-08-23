-- =====================================================
-- Fix Database Tables for Lesson Completion
-- Run this in Supabase SQL Editor
-- =====================================================

-- Ensure xp_transactions table exists
CREATE TABLE IF NOT EXISTS xp_transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    amount INTEGER NOT NULL,
    transaction_type VARCHAR(50) NOT NULL,
    source_id VARCHAR(255),
    source_type VARCHAR(50),
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Ensure coins_transactions table exists
CREATE TABLE IF NOT EXISTS coins_transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    amount INTEGER NOT NULL,
    transaction_type VARCHAR(50) NOT NULL,
    source_id VARCHAR(255),
    source_type VARCHAR(50),
    description TEXT,
    balance_after INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Ensure user_progress table exists
CREATE TABLE IF NOT EXISTS user_progress (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    module_id UUID,
    lesson_id UUID,
    status VARCHAR(50) DEFAULT 'not_started' CHECK (status IN ('not_started', 'in_progress', 'completed', 'skipped')),
    progress_percentage INTEGER DEFAULT 0 CHECK (progress_percentage BETWEEN 0 AND 100),
    time_spent_minutes INTEGER DEFAULT 0,
    completion_date TIMESTAMP WITH TIME ZONE,
    quiz_score INTEGER CHECK (quiz_score BETWEEN 0 AND 100),
    attempts INTEGER DEFAULT 1,
    notes TEXT,
    engagement_level VARCHAR(20) CHECK (engagement_level IN ('low', 'medium', 'high')),
    found_helpful BOOLEAN,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, lesson_id)
);

-- Enable RLS
ALTER TABLE xp_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE coins_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_progress ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist and recreate
DROP POLICY IF EXISTS "Users can view their own XP transactions" ON xp_transactions;
CREATE POLICY "Users can view their own XP transactions" ON xp_transactions FOR SELECT USING (auth.uid()::text = user_id::text);

DROP POLICY IF EXISTS "Users can insert their own XP transactions" ON xp_transactions;
CREATE POLICY "Users can insert their own XP transactions" ON xp_transactions FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);

DROP POLICY IF EXISTS "Users can view their own coins transactions" ON coins_transactions;
CREATE POLICY "Users can view their own coins transactions" ON coins_transactions FOR SELECT USING (auth.uid()::text = user_id::text);

DROP POLICY IF EXISTS "Users can insert their own coins transactions" ON coins_transactions;
CREATE POLICY "Users can insert their own coins transactions" ON coins_transactions FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);

DROP POLICY IF EXISTS "Users can view their own progress" ON user_progress;
CREATE POLICY "Users can view their own progress" ON user_progress FOR SELECT USING (auth.uid()::text = user_id::text);

DROP POLICY IF EXISTS "Users can insert their own progress" ON user_progress;
CREATE POLICY "Users can insert their own progress" ON user_progress FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);

DROP POLICY IF EXISTS "Users can update their own progress" ON user_progress;
CREATE POLICY "Users can update their own progress" ON user_progress FOR UPDATE USING (auth.uid()::text = user_id::text);

-- Create indexes if they don't exist
CREATE INDEX IF NOT EXISTS idx_xp_transactions_user ON xp_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_coins_transactions_user ON coins_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_progress_user_id ON user_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_user_progress_status ON user_progress(status);

-- Show success message
SELECT 'Database tables and policies created successfully!' as status;