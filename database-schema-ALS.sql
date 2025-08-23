-- AlphaRise Adaptive Learning System (A.L.S.) Database Schema
-- This creates a Netflix-style personalized learning experience

-- =====================================================
-- CORE LEARNING CONTENT
-- =====================================================

-- Learning Modules (like Netflix categories)
CREATE TABLE learning_modules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    coach_id VARCHAR(50) NOT NULL, -- blake, chase, logan, mason, knox
    module_code VARCHAR(50) UNIQUE NOT NULL,
    title VARCHAR(255) NOT NULL,
    subtitle VARCHAR(500),
    description TEXT,
    thumbnail_url VARCHAR(500),
    difficulty_level INTEGER DEFAULT 1 CHECK (difficulty_level BETWEEN 1 AND 5),
    estimated_duration INTEGER, -- in minutes
    unlock_at_score INTEGER DEFAULT 0,
    order_priority INTEGER DEFAULT 1,
    tags JSONB DEFAULT '[]', -- ['anxiety', 'confidence', 'techniques']
    prerequisites JSONB DEFAULT '[]', -- module_ids that must be completed first
    is_premium BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Lessons within modules (like Netflix episodes)
CREATE TABLE lessons (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    module_id UUID REFERENCES learning_modules(id) ON DELETE CASCADE,
    lesson_number INTEGER NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    content_type VARCHAR(50) CHECK (content_type IN ('video', 'text', 'audio', 'interactive', 'mixed')),
    content_data JSONB NOT NULL, -- stores actual content or references
    duration_minutes INTEGER,
    xp_reward INTEGER DEFAULT 10,
    coins_reward INTEGER DEFAULT 5,
    thumbnail_url VARCHAR(500),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(module_id, lesson_number)
);

-- Micro-learnings (quick daily content - like TikTok for learning)
CREATE TABLE micro_learnings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    coach_id VARCHAR(50),
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    content_type VARCHAR(50) DEFAULT 'tip', -- tip, quote, challenge, fact
    difficulty INTEGER DEFAULT 1,
    xp_reward INTEGER DEFAULT 5,
    tags JSONB DEFAULT '[]',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Daily Challenges (gamification)
CREATE TABLE daily_challenges (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    coach_id VARCHAR(50),
    challenge_type VARCHAR(50), -- mental, physical, social, tracking
    title VARCHAR(255) NOT NULL,
    description TEXT,
    difficulty INTEGER DEFAULT 1,
    xp_reward INTEGER DEFAULT 20,
    coins_reward INTEGER DEFAULT 10,
    success_criteria JSONB, -- what defines completion
    tags JSONB DEFAULT '[]',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- USER LEARNING PROFILE & PROGRESS
-- =====================================================

-- User Learning Profile (Netflix-style user preferences)
CREATE TABLE user_learning_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    coach_id VARCHAR(50) NOT NULL,
    
    -- Assessment & Personalization Data
    assessment_data JSONB NOT NULL, -- all 10 questions responses
    personalization_data JSONB NOT NULL, -- age, specific questions
    initial_confidence_score INTEGER,
    current_confidence_score INTEGER,
    
    -- Learning Preferences (learned over time)
    preferred_content_type VARCHAR(50), -- video, text, audio
    preferred_session_length INTEGER, -- in minutes
    best_learning_time VARCHAR(50), -- morning, afternoon, evening, night
    learning_pace VARCHAR(50) DEFAULT 'moderate', -- slow, moderate, fast
    
    -- Adaptive Metrics
    engagement_score INTEGER DEFAULT 50, -- 0-100
    consistency_score INTEGER DEFAULT 0, -- 0-100
    mastery_level INTEGER DEFAULT 1, -- 1-10
    
    -- Gamification
    total_xp INTEGER DEFAULT 0,
    current_level INTEGER DEFAULT 1,
    current_streak INTEGER DEFAULT 0,
    longest_streak INTEGER DEFAULT 0,
    achievements_unlocked JSONB DEFAULT '[]',
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id)
);

-- User Progress Tracking (like Netflix viewing history)
CREATE TABLE user_progress (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    module_id UUID REFERENCES learning_modules(id),
    lesson_id UUID REFERENCES lessons(id),
    
    status VARCHAR(50) DEFAULT 'not_started', -- not_started, in_progress, completed, skipped
    progress_percentage INTEGER DEFAULT 0,
    time_spent_minutes INTEGER DEFAULT 0,
    completion_date TIMESTAMP,
    
    -- Performance metrics
    quiz_score INTEGER, -- if lesson has quiz
    attempts INTEGER DEFAULT 0,
    notes TEXT, -- user's personal notes
    
    -- Engagement metrics
    engagement_level VARCHAR(50), -- low, medium, high (based on interaction)
    found_helpful BOOLEAN,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, lesson_id)
);

-- Daily Activity Log (for pattern recognition)
CREATE TABLE user_activity_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    activity_date DATE NOT NULL,
    
    -- Daily metrics
    lessons_completed INTEGER DEFAULT 0,
    challenges_completed INTEGER DEFAULT 0,
    time_spent_minutes INTEGER DEFAULT 0,
    xp_earned INTEGER DEFAULT 0,
    coins_earned INTEGER DEFAULT 0,
    confidence_score INTEGER,
    mood_rating INTEGER, -- 1-5 user self-reported
    
    -- Engagement patterns
    login_time TIME,
    logout_time TIME,
    session_count INTEGER DEFAULT 0,
    ai_coach_messages INTEGER DEFAULT 0,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, activity_date)
);

-- =====================================================
-- AI & RECOMMENDATION ENGINE
-- =====================================================

-- AI Learning Paths (personalized curriculum)
CREATE TABLE ai_learning_paths (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    
    -- Current path
    current_focus VARCHAR(255), -- what we're working on now
    current_module_id UUID REFERENCES learning_modules(id),
    current_lesson_id UUID REFERENCES lessons(id),
    
    -- AI recommendations
    recommended_modules JSONB DEFAULT '[]', -- ordered list of module_ids
    recommended_challenges JSONB DEFAULT '[]',
    recommended_micro_learnings JSONB DEFAULT '[]',
    
    -- Adaptation parameters
    difficulty_adjustment DECIMAL(3,2) DEFAULT 1.0, -- multiplier for difficulty
    pace_adjustment DECIMAL(3,2) DEFAULT 1.0, -- multiplier for pace
    content_mix JSONB, -- {video: 40, text: 30, interactive: 30}
    
    -- AI insights
    strengths JSONB DEFAULT '[]',
    improvement_areas JSONB DEFAULT '[]',
    breakthrough_moments JSONB DEFAULT '[]',
    
    last_recalculated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Content Effectiveness Tracking (for AI learning)
CREATE TABLE content_effectiveness (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    content_type VARCHAR(50), -- lesson, module, challenge
    content_id UUID NOT NULL,
    
    -- Aggregate metrics
    total_views INTEGER DEFAULT 0,
    completion_rate DECIMAL(5,2),
    average_rating DECIMAL(3,2),
    average_time_spent INTEGER,
    
    -- Effectiveness by user segment
    effectiveness_by_age JSONB, -- {18-24: 0.8, 25-34: 0.9, ...}
    effectiveness_by_coach JSONB,
    effectiveness_by_problem JSONB,
    
    -- AI insights
    common_drop_points JSONB, -- where users typically stop
    success_patterns JSONB, -- what makes users succeed
    
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- GAMIFICATION & REWARDS
-- =====================================================

-- Achievements System
CREATE TABLE achievements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code VARCHAR(50) UNIQUE NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    icon_url VARCHAR(500),
    category VARCHAR(50), -- progress, social, mastery, special
    
    -- Requirements
    requirements JSONB NOT NULL, -- complex criteria
    xp_reward INTEGER DEFAULT 50,
    coins_reward INTEGER DEFAULT 25,
    badge_type VARCHAR(50), -- bronze, silver, gold, platinum
    
    is_secret BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- User Achievements
CREATE TABLE user_achievements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    achievement_id UUID REFERENCES achievements(id),
    unlocked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    progress JSONB, -- for multi-step achievements
    UNIQUE(user_id, achievement_id)
);

-- Leaderboards
CREATE TABLE leaderboards (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    coach_id VARCHAR(50),
    
    -- Weekly scores
    weekly_xp INTEGER DEFAULT 0,
    weekly_streak INTEGER DEFAULT 0,
    weekly_challenges INTEGER DEFAULT 0,
    weekly_rank INTEGER,
    
    -- All-time scores
    total_xp INTEGER DEFAULT 0,
    total_rank INTEGER,
    
    week_start DATE,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, week_start)
);

-- =====================================================
-- ADMIN CONTENT MANAGEMENT
-- =====================================================

-- Content Templates (for easy admin creation)
CREATE TABLE content_templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    template_name VARCHAR(255) NOT NULL,
    template_type VARCHAR(50), -- module, lesson, challenge
    template_structure JSONB NOT NULL,
    tags JSONB DEFAULT '[]',
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Content Versions (for A/B testing)
CREATE TABLE content_versions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    original_content_id UUID NOT NULL,
    content_type VARCHAR(50),
    version_name VARCHAR(255),
    content_data JSONB,
    is_active BOOLEAN DEFAULT false,
    performance_metrics JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- ANALYTICS & INSIGHTS
-- =====================================================

-- User Journey Analytics
CREATE TABLE user_journey_analytics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    
    -- Journey milestones
    onboarding_completed TIMESTAMP,
    first_lesson_completed TIMESTAMP,
    first_week_completed TIMESTAMP,
    first_month_completed TIMESTAMP,
    
    -- Conversion metrics
    trial_to_premium_date TIMESTAMP,
    churn_risk_score DECIMAL(3,2), -- 0-1 probability
    engagement_trend VARCHAR(50), -- increasing, stable, decreasing
    
    -- Behavioral patterns
    usage_pattern JSONB, -- time of day, frequency, duration patterns
    content_preferences JSONB,
    learning_style JSONB,
    
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================

CREATE INDEX idx_user_progress_user_id ON user_progress(user_id);
CREATE INDEX idx_user_progress_status ON user_progress(status);
CREATE INDEX idx_lessons_module_id ON lessons(module_id);
CREATE INDEX idx_activity_log_user_date ON user_activity_log(user_id, activity_date);
CREATE INDEX idx_learning_paths_user_id ON ai_learning_paths(user_id);
CREATE INDEX idx_leaderboards_weekly_rank ON leaderboards(weekly_rank);
CREATE INDEX idx_modules_coach_id ON learning_modules(coach_id);

-- =====================================================
-- TRIGGERS FOR AUTO-UPDATES
-- =====================================================

-- Auto-update timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_learning_modules_updated_at BEFORE UPDATE ON learning_modules
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_progress_updated_at BEFORE UPDATE ON user_progress
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_learning_profiles_updated_at BEFORE UPDATE ON user_learning_profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();