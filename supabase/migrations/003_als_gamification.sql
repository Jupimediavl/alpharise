-- =====================================================
-- AlphaRise Adaptive Learning System (ALS)
-- Migration 003: Gamification & Achievements
-- =====================================================

-- Achievements System
CREATE TABLE IF NOT EXISTS achievements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code VARCHAR(50) UNIQUE NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    icon_url VARCHAR(500),
    category VARCHAR(50) CHECK (category IN ('progress', 'social', 'mastery', 'special', 'hidden')),
    
    -- Requirements
    requirements JSONB NOT NULL DEFAULT '{}'::jsonb,
    xp_reward INTEGER DEFAULT 50,
    coins_reward INTEGER DEFAULT 25,
    badge_type VARCHAR(50) CHECK (badge_type IN ('bronze', 'silver', 'gold', 'platinum', 'diamond')),
    
    is_secret BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- User Achievements
CREATE TABLE IF NOT EXISTS user_achievements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    achievement_id UUID REFERENCES achievements(id) ON DELETE CASCADE,
    unlocked_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    progress JSONB DEFAULT '{}'::jsonb,
    notified BOOLEAN DEFAULT false,
    UNIQUE(user_id, achievement_id)
);

-- Leaderboards
CREATE TABLE IF NOT EXISTS leaderboards (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    coach_id VARCHAR(50),
    
    -- Weekly scores
    weekly_xp INTEGER DEFAULT 0,
    weekly_streak INTEGER DEFAULT 0,
    weekly_challenges INTEGER DEFAULT 0,
    weekly_rank INTEGER,
    
    -- Monthly scores
    monthly_xp INTEGER DEFAULT 0,
    monthly_rank INTEGER,
    
    -- All-time scores
    total_xp INTEGER DEFAULT 0,
    total_rank INTEGER,
    
    period_start DATE NOT NULL,
    period_type VARCHAR(20) CHECK (period_type IN ('weekly', 'monthly', 'all_time')),
    
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, period_start, period_type)
);

-- Rewards & Milestones
CREATE TABLE IF NOT EXISTS milestones (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    milestone_type VARCHAR(50) CHECK (milestone_type IN ('xp', 'level', 'streak', 'lessons', 'confidence')),
    threshold_value INTEGER NOT NULL,
    
    -- Rewards
    xp_reward INTEGER DEFAULT 0,
    coins_reward INTEGER DEFAULT 0,
    unlock_content JSONB DEFAULT '[]'::jsonb, -- module or lesson IDs to unlock
    badge_url VARCHAR(500),
    
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- User Milestones Progress
CREATE TABLE IF NOT EXISTS user_milestones (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    milestone_id UUID REFERENCES milestones(id) ON DELETE CASCADE,
    current_value INTEGER DEFAULT 0,
    achieved BOOLEAN DEFAULT false,
    achieved_at TIMESTAMP WITH TIME ZONE,
    claimed BOOLEAN DEFAULT false,
    UNIQUE(user_id, milestone_id)
);

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

-- Create indexes
CREATE INDEX idx_achievements_active ON achievements(is_active);
CREATE INDEX idx_user_achievements_user ON user_achievements(user_id);
CREATE INDEX idx_leaderboards_user ON leaderboards(user_id);
CREATE INDEX idx_leaderboards_weekly_rank ON leaderboards(weekly_rank) WHERE period_type = 'weekly';
CREATE INDEX idx_leaderboards_monthly_rank ON leaderboards(monthly_rank) WHERE period_type = 'monthly';
CREATE INDEX idx_user_milestones_user ON user_milestones(user_id);
CREATE INDEX idx_xp_transactions_user ON xp_transactions(user_id);
CREATE INDEX idx_coins_transactions_user ON coins_transactions(user_id);

-- Apply update triggers
CREATE TRIGGER update_achievements_updated_at BEFORE UPDATE ON achievements
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_leaderboards_updated_at BEFORE UPDATE ON leaderboards
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();