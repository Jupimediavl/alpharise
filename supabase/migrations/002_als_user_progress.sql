-- =====================================================
-- AlphaRise Adaptive Learning System (ALS)
-- Migration 002: User Progress & Profile Tables
-- =====================================================

-- User Learning Profile (Main user profile for ALS)
CREATE TABLE IF NOT EXISTS user_learning_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID UNIQUE NOT NULL,
    coach_id VARCHAR(50) NOT NULL,
    
    -- Assessment & Personalization Data
    assessment_data JSONB NOT NULL DEFAULT '{}'::jsonb,
    personalization_data JSONB NOT NULL DEFAULT '{}'::jsonb,
    initial_confidence_score INTEGER DEFAULT 50,
    current_confidence_score INTEGER DEFAULT 50,
    
    -- Learning Preferences
    preferred_content_type VARCHAR(50) DEFAULT 'mixed',
    preferred_session_length INTEGER DEFAULT 15,
    best_learning_time VARCHAR(50) DEFAULT 'evening',
    learning_pace VARCHAR(50) DEFAULT 'moderate',
    
    -- Adaptive Metrics
    engagement_score INTEGER DEFAULT 50 CHECK (engagement_score BETWEEN 0 AND 100),
    consistency_score INTEGER DEFAULT 0 CHECK (consistency_score BETWEEN 0 AND 100),
    mastery_level INTEGER DEFAULT 1 CHECK (mastery_level BETWEEN 1 AND 10),
    
    -- Gamification
    total_xp INTEGER DEFAULT 0,
    current_level INTEGER DEFAULT 1,
    current_streak INTEGER DEFAULT 0,
    longest_streak INTEGER DEFAULT 0,
    achievements_unlocked JSONB DEFAULT '[]'::jsonb,
    total_coins INTEGER DEFAULT 100,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- User Progress Tracking
CREATE TABLE IF NOT EXISTS user_progress (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    module_id UUID REFERENCES learning_modules(id) ON DELETE CASCADE,
    lesson_id UUID REFERENCES lessons(id) ON DELETE CASCADE,
    
    status VARCHAR(50) DEFAULT 'not_started' CHECK (status IN ('not_started', 'in_progress', 'completed', 'skipped')),
    progress_percentage INTEGER DEFAULT 0 CHECK (progress_percentage BETWEEN 0 AND 100),
    time_spent_minutes INTEGER DEFAULT 0,
    completion_date TIMESTAMP WITH TIME ZONE,
    
    -- Performance metrics
    quiz_score INTEGER CHECK (quiz_score BETWEEN 0 AND 100),
    attempts INTEGER DEFAULT 0,
    notes TEXT,
    
    -- Engagement metrics
    engagement_level VARCHAR(50) CHECK (engagement_level IN ('low', 'medium', 'high')),
    found_helpful BOOLEAN,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, lesson_id)
);

-- Daily Activity Log
CREATE TABLE IF NOT EXISTS user_activity_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    activity_date DATE NOT NULL,
    
    -- Daily metrics
    lessons_completed INTEGER DEFAULT 0,
    challenges_completed INTEGER DEFAULT 0,
    time_spent_minutes INTEGER DEFAULT 0,
    xp_earned INTEGER DEFAULT 0,
    coins_earned INTEGER DEFAULT 0,
    confidence_score INTEGER,
    mood_rating INTEGER CHECK (mood_rating BETWEEN 1 AND 5),
    
    -- Engagement patterns
    login_time TIME,
    logout_time TIME,
    session_count INTEGER DEFAULT 0,
    ai_coach_messages INTEGER DEFAULT 0,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, activity_date)
);

-- User Challenge Progress
CREATE TABLE IF NOT EXISTS user_challenge_progress (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    challenge_id UUID REFERENCES daily_challenges(id) ON DELETE CASCADE,
    
    status VARCHAR(50) DEFAULT 'not_started' CHECK (status IN ('not_started', 'in_progress', 'completed', 'failed')),
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    attempts INTEGER DEFAULT 0,
    progress_data JSONB DEFAULT '{}'::jsonb,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, challenge_id)
);

-- Create indexes
CREATE INDEX idx_user_profiles_user_id ON user_learning_profiles(user_id);
CREATE INDEX idx_user_progress_user_id ON user_progress(user_id);
CREATE INDEX idx_user_progress_status ON user_progress(status);
CREATE INDEX idx_activity_log_user_date ON user_activity_log(user_id, activity_date);
CREATE INDEX idx_challenge_progress_user ON user_challenge_progress(user_id);

-- Apply update triggers
CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON user_learning_profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_progress_updated_at BEFORE UPDATE ON user_progress
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_challenge_progress_updated_at BEFORE UPDATE ON user_challenge_progress
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();