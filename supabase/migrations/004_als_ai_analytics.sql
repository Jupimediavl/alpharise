-- =====================================================
-- AlphaRise Adaptive Learning System (ALS)
-- Migration 004: AI & Analytics Tables
-- =====================================================

-- AI Learning Paths (Personalized curriculum)
CREATE TABLE IF NOT EXISTS ai_learning_paths (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID UNIQUE NOT NULL,
    
    -- Current path
    current_focus VARCHAR(255),
    current_module_id UUID REFERENCES learning_modules(id),
    current_lesson_id UUID REFERENCES lessons(id),
    
    -- AI recommendations
    recommended_modules JSONB DEFAULT '[]'::jsonb,
    recommended_challenges JSONB DEFAULT '[]'::jsonb,
    recommended_micro_learnings JSONB DEFAULT '[]'::jsonb,
    next_best_action JSONB DEFAULT '{}'::jsonb,
    
    -- Adaptation parameters
    difficulty_adjustment DECIMAL(3,2) DEFAULT 1.0,
    pace_adjustment DECIMAL(3,2) DEFAULT 1.0,
    content_mix JSONB DEFAULT '{"video": 40, "text": 30, "interactive": 30}'::jsonb,
    
    -- AI insights
    strengths JSONB DEFAULT '[]'::jsonb,
    improvement_areas JSONB DEFAULT '[]'::jsonb,
    breakthrough_moments JSONB DEFAULT '[]'::jsonb,
    learning_style JSONB DEFAULT '{}'::jsonb,
    
    last_recalculated TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Content Effectiveness Tracking
CREATE TABLE IF NOT EXISTS content_effectiveness (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    content_type VARCHAR(50) NOT NULL,
    content_id UUID NOT NULL,
    
    -- Aggregate metrics
    total_views INTEGER DEFAULT 0,
    total_completions INTEGER DEFAULT 0,
    completion_rate DECIMAL(5,2) DEFAULT 0,
    average_rating DECIMAL(3,2),
    average_time_spent INTEGER,
    bounce_rate DECIMAL(5,2) DEFAULT 0,
    
    -- Effectiveness by user segment
    effectiveness_by_age JSONB DEFAULT '{}'::jsonb,
    effectiveness_by_coach JSONB DEFAULT '{}'::jsonb,
    effectiveness_by_problem JSONB DEFAULT '{}'::jsonb,
    effectiveness_by_level JSONB DEFAULT '{}'::jsonb,
    
    -- AI insights
    common_drop_points JSONB DEFAULT '[]'::jsonb,
    success_patterns JSONB DEFAULT '[]'::jsonb,
    improvement_suggestions JSONB DEFAULT '[]'::jsonb,
    
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(content_type, content_id)
);

-- User Journey Analytics
CREATE TABLE IF NOT EXISTS user_journey_analytics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID UNIQUE NOT NULL,
    
    -- Journey milestones
    onboarding_completed TIMESTAMP WITH TIME ZONE,
    first_lesson_completed TIMESTAMP WITH TIME ZONE,
    first_achievement_unlocked TIMESTAMP WITH TIME ZONE,
    first_week_completed TIMESTAMP WITH TIME ZONE,
    first_month_completed TIMESTAMP WITH TIME ZONE,
    
    -- Conversion metrics
    trial_to_premium_date TIMESTAMP WITH TIME ZONE,
    churn_risk_score DECIMAL(3,2) DEFAULT 0.5,
    engagement_trend VARCHAR(50) DEFAULT 'stable',
    lifetime_value DECIMAL(10,2) DEFAULT 0,
    
    -- Behavioral patterns
    usage_pattern JSONB DEFAULT '{}'::jsonb,
    content_preferences JSONB DEFAULT '{}'::jsonb,
    peak_activity_times JSONB DEFAULT '[]'::jsonb,
    interaction_style JSONB DEFAULT '{}'::jsonb,
    
    -- Predictive metrics
    predicted_next_login TIMESTAMP WITH TIME ZONE,
    predicted_churn_date TIMESTAMP WITH TIME ZONE,
    predicted_lifetime_value DECIMAL(10,2),
    conversion_probability DECIMAL(3,2) DEFAULT 0.5,
    
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- A/B Testing Framework
CREATE TABLE IF NOT EXISTS ab_tests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    test_name VARCHAR(255) NOT NULL,
    test_type VARCHAR(50) NOT NULL,
    hypothesis TEXT,
    
    -- Test configuration
    variants JSONB NOT NULL DEFAULT '[]'::jsonb,
    target_metric VARCHAR(100) NOT NULL,
    minimum_sample_size INTEGER DEFAULT 100,
    confidence_level DECIMAL(3,2) DEFAULT 0.95,
    
    -- Test status
    status VARCHAR(50) DEFAULT 'draft' CHECK (status IN ('draft', 'running', 'paused', 'completed', 'cancelled')),
    start_date TIMESTAMP WITH TIME ZONE,
    end_date TIMESTAMP WITH TIME ZONE,
    
    -- Results
    winner_variant VARCHAR(100),
    results JSONB DEFAULT '{}'::jsonb,
    statistical_significance DECIMAL(3,2),
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- User AB Test Assignments
CREATE TABLE IF NOT EXISTS user_ab_test_assignments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    test_id UUID REFERENCES ab_tests(id) ON DELETE CASCADE,
    variant VARCHAR(100) NOT NULL,
    assigned_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, test_id)
);

-- Content Versions for Testing
CREATE TABLE IF NOT EXISTS content_versions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    original_content_id UUID NOT NULL,
    content_type VARCHAR(50) NOT NULL,
    version_name VARCHAR(255) NOT NULL,
    version_data JSONB NOT NULL,
    
    -- Testing metrics
    test_id UUID REFERENCES ab_tests(id),
    is_active BOOLEAN DEFAULT false,
    performance_metrics JSONB DEFAULT '{}'::jsonb,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- System Analytics Dashboard
CREATE TABLE IF NOT EXISTS system_analytics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    metric_date DATE NOT NULL,
    
    -- User metrics
    total_users INTEGER DEFAULT 0,
    active_users INTEGER DEFAULT 0,
    new_users INTEGER DEFAULT 0,
    churned_users INTEGER DEFAULT 0,
    
    -- Engagement metrics
    average_session_duration INTEGER DEFAULT 0,
    average_lessons_per_user DECIMAL(5,2) DEFAULT 0,
    average_confidence_increase DECIMAL(5,2) DEFAULT 0,
    
    -- Content metrics
    total_lessons_completed INTEGER DEFAULT 0,
    total_challenges_completed INTEGER DEFAULT 0,
    total_xp_earned INTEGER DEFAULT 0,
    
    -- Revenue metrics
    trial_to_premium_rate DECIMAL(5,2) DEFAULT 0,
    monthly_recurring_revenue DECIMAL(10,2) DEFAULT 0,
    average_revenue_per_user DECIMAL(10,2) DEFAULT 0,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(metric_date)
);

-- Create indexes
CREATE INDEX idx_ai_paths_user ON ai_learning_paths(user_id);
CREATE INDEX idx_content_effectiveness_type ON content_effectiveness(content_type);
CREATE INDEX idx_journey_analytics_user ON user_journey_analytics(user_id);
CREATE INDEX idx_journey_analytics_churn ON user_journey_analytics(churn_risk_score);
CREATE INDEX idx_ab_tests_status ON ab_tests(status);
CREATE INDEX idx_ab_assignments_user ON user_ab_test_assignments(user_id);
CREATE INDEX idx_system_analytics_date ON system_analytics(metric_date);

-- Apply update triggers
CREATE TRIGGER update_ai_paths_updated_at BEFORE UPDATE ON ai_learning_paths
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_content_effectiveness_updated_at BEFORE UPDATE ON content_effectiveness
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_journey_analytics_updated_at BEFORE UPDATE ON user_journey_analytics
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ab_tests_updated_at BEFORE UPDATE ON ab_tests
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_content_versions_updated_at BEFORE UPDATE ON content_versions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();