-- Quick script to ensure all ALS progress tables exist
-- Run this in Supabase SQL editor if needed

-- XP Transactions Log
CREATE TABLE IF NOT EXISTS xp_transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    amount INTEGER NOT NULL,
    transaction_type VARCHAR(50) NOT NULL, -- lesson_complete, challenge_complete, achievement, bonus, etc
    source_id UUID, -- ID of lesson, challenge, achievement, etc
    source_type VARCHAR(50), -- lesson, challenge, achievement, milestone
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Coins Transactions Log  
CREATE TABLE IF NOT EXISTS coins_transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    amount INTEGER NOT NULL,
    transaction_type VARCHAR(50) NOT NULL, -- earned, spent, bonus
    source_id UUID,
    source_type VARCHAR(50),
    description TEXT,
    balance_after INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- User Progress Tracking
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

-- RLS Policies
ALTER TABLE xp_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE coins_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_progress ENABLE ROW LEVEL SECURITY;

-- Policies for xp_transactions
DROP POLICY IF EXISTS "Users can view their own XP transactions" ON xp_transactions;
CREATE POLICY "Users can view their own XP transactions" ON xp_transactions FOR SELECT USING (auth.uid()::text = user_id::text);

DROP POLICY IF EXISTS "Users can insert their own XP transactions" ON xp_transactions;
CREATE POLICY "Users can insert their own XP transactions" ON xp_transactions FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);

-- Policies for coins_transactions
DROP POLICY IF EXISTS "Users can view their own coins transactions" ON coins_transactions;
CREATE POLICY "Users can view their own coins transactions" ON coins_transactions FOR SELECT USING (auth.uid()::text = user_id::text);

DROP POLICY IF EXISTS "Users can insert their own coins transactions" ON coins_transactions;
CREATE POLICY "Users can insert their own coins transactions" ON coins_transactions FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);

-- Policies for user_progress
DROP POLICY IF EXISTS "Users can view their own progress" ON user_progress;
CREATE POLICY "Users can view their own progress" ON user_progress FOR SELECT USING (auth.uid()::text = user_id::text);

DROP POLICY IF EXISTS "Users can insert their own progress" ON user_progress;
CREATE POLICY "Users can insert their own progress" ON user_progress FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);

DROP POLICY IF EXISTS "Users can update their own progress" ON user_progress;
CREATE POLICY "Users can update their own progress" ON user_progress FOR UPDATE USING (auth.uid()::text = user_id::text);