-- =====================================================
-- AlphaRise ALS - Quick Setup Script
-- Run this directly in Supabase SQL Editor
-- =====================================================

-- Create learning_modules table
CREATE TABLE IF NOT EXISTS learning_modules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  coach_id VARCHAR(50) NOT NULL,
  module_code VARCHAR(50) UNIQUE NOT NULL,
  title VARCHAR(255) NOT NULL,
  subtitle VARCHAR(255),
  description TEXT,
  thumbnail_url VARCHAR(500),
  difficulty_level INTEGER DEFAULT 1,
  estimated_duration INTEGER,
  unlock_at_score INTEGER DEFAULT 0,
  order_priority INTEGER DEFAULT 1,
  tags JSONB DEFAULT '[]'::jsonb,
  prerequisites JSONB DEFAULT '[]'::jsonb,
  is_premium BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create lessons table
CREATE TABLE IF NOT EXISTS lessons (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  module_id UUID REFERENCES learning_modules(id) ON DELETE CASCADE,
  lesson_number INTEGER NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  content_type VARCHAR(50) CHECK (content_type IN ('video', 'text', 'audio', 'interactive', 'mixed')),
  content_data JSONB DEFAULT '{}'::jsonb,
  duration_minutes INTEGER,
  xp_reward INTEGER DEFAULT 20,
  coins_reward INTEGER DEFAULT 10,
  thumbnail_url VARCHAR(500),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create micro_learnings table
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

-- Create daily_challenges table
CREATE TABLE IF NOT EXISTS daily_challenges (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  coach_id VARCHAR(50),
  challenge_type VARCHAR(50),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  difficulty INTEGER DEFAULT 1,
  xp_reward INTEGER DEFAULT 30,
  coins_reward INTEGER DEFAULT 15,
  success_criteria JSONB DEFAULT '{}'::jsonb,
  tags JSONB DEFAULT '[]'::jsonb,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create user_learning_profiles table
CREATE TABLE IF NOT EXISTS user_learning_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID UNIQUE NOT NULL,
  coach_id VARCHAR(50) NOT NULL,
  assessment_data JSONB DEFAULT '{}'::jsonb,
  personalization_data JSONB DEFAULT '{}'::jsonb,
  initial_confidence_score INTEGER DEFAULT 30,
  current_confidence_score INTEGER DEFAULT 30,
  preferred_content_type VARCHAR(50),
  preferred_session_length INTEGER,
  best_learning_time VARCHAR(50),
  learning_pace VARCHAR(50),
  engagement_score INTEGER DEFAULT 50,
  consistency_score INTEGER DEFAULT 50,
  mastery_level INTEGER DEFAULT 1,
  total_xp INTEGER DEFAULT 0,
  current_level INTEGER DEFAULT 1,
  current_streak INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  achievements_unlocked JSONB DEFAULT '[]'::jsonb,
  total_coins INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create achievements table
CREATE TABLE IF NOT EXISTS achievements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code VARCHAR(50) UNIQUE NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  icon_url VARCHAR(500),
  category VARCHAR(50) CHECK (category IN ('progress', 'social', 'mastery', 'special', 'hidden')),
  requirements JSONB NOT NULL DEFAULT '{}'::jsonb,
  xp_reward INTEGER DEFAULT 50,
  coins_reward INTEGER DEFAULT 25,
  badge_type VARCHAR(50) CHECK (badge_type IN ('bronze', 'silver', 'gold', 'platinum', 'diamond')),
  is_secret BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create user_progress table
CREATE TABLE IF NOT EXISTS user_progress (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL,
  module_id UUID REFERENCES learning_modules(id),
  lesson_id UUID REFERENCES lessons(id),
  status VARCHAR(20) CHECK (status IN ('not_started', 'in_progress', 'completed', 'skipped')),
  progress_percentage INTEGER DEFAULT 0,
  time_spent_minutes INTEGER DEFAULT 0,
  completion_date TIMESTAMP WITH TIME ZONE,
  quiz_score INTEGER,
  attempts INTEGER DEFAULT 1,
  notes TEXT,
  engagement_level VARCHAR(20) CHECK (engagement_level IN ('low', 'medium', 'high')),
  found_helpful BOOLEAN,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, lesson_id)
);

-- Create user_activity_log table
CREATE TABLE IF NOT EXISTS user_activity_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL,
  activity_date DATE NOT NULL,
  lessons_completed INTEGER DEFAULT 0,
  challenges_completed INTEGER DEFAULT 0,
  time_spent_minutes INTEGER DEFAULT 0,
  xp_earned INTEGER DEFAULT 0,
  coins_earned INTEGER DEFAULT 0,
  confidence_score INTEGER,
  mood_rating INTEGER,
  login_time TIMESTAMP WITH TIME ZONE,
  logout_time TIMESTAMP WITH TIME ZONE,
  session_count INTEGER DEFAULT 1,
  ai_coach_messages INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, activity_date)
);

-- Insert sample data
INSERT INTO learning_modules (coach_id, module_code, title, subtitle, description, difficulty_level, estimated_duration, unlock_at_score, order_priority, tags, is_premium) VALUES
('blake', 'BLAKE_CONFIDENCE_101', 'Building Unshakeable Confidence', 'Transform anxiety into power', 'Learn to turn your nervous energy into confident action with proven techniques and exercises.', 1, 60, 0, 1, '["confidence", "anxiety", "fundamentals"]', false),
('chase', 'CHASE_CONTROL_101', 'Mastering Self Control', 'Develop lasting control and stamina', 'Advanced techniques for building control and stamina in high-pressure situations.', 1, 90, 0, 1, '["control", "stamina", "techniques"]', false),
('logan', 'LOGAN_SOCIAL_101', 'Social Confidence Mastery', 'Navigate any social situation with ease', 'Master the art of social interactions and build genuine connections.', 1, 75, 0, 1, '["social", "communication", "confidence"]', false)
ON CONFLICT (module_code) DO NOTHING;

-- Insert sample lessons
INSERT INTO lessons (module_id, lesson_number, title, description, content_type, duration_minutes, xp_reward, coins_reward) VALUES
((SELECT id FROM learning_modules WHERE module_code = 'BLAKE_CONFIDENCE_101'), 1, 'Understanding Confidence', 'Learn what real confidence looks like and how to build it', 'video', 20, 25, 12),
((SELECT id FROM learning_modules WHERE module_code = 'BLAKE_CONFIDENCE_101'), 2, 'Overcoming Self-Doubt', 'Techniques to silence your inner critic', 'interactive', 25, 30, 15),
((SELECT id FROM learning_modules WHERE module_code = 'CHASE_CONTROL_101'), 1, 'The Science of Control', 'Understanding how your body and mind work together', 'video', 30, 25, 12),
((SELECT id FROM learning_modules WHERE module_code = 'LOGAN_SOCIAL_101'), 1, 'Reading Social Cues', 'Master the subtle art of social communication', 'video', 25, 25, 12)
ON CONFLICT DO NOTHING;

-- Insert sample micro-learnings
INSERT INTO micro_learnings (coach_id, title, content, content_type, difficulty, xp_reward, tags) VALUES
('blake', '2-Minute Confidence Boost', 'Stand tall, take 5 deep breaths, and remind yourself of one thing you accomplished today. Your body language affects your mind.', 'tip', 1, 5, '["confidence", "quick", "breathing"]'),
('chase', 'Focus Technique', 'When you feel overwhelmed, count backwards from 100 by 7s. This redirects your mental energy and builds control.', 'tip', 2, 8, '["focus", "mental", "control"]'),
('logan', 'Conversation Starter', 'Best opener: "Hi, I noticed [specific observation]. I''m [name]." Simple, genuine, effective.', 'tip', 1, 5, '["social", "conversation", "opener"]')
ON CONFLICT DO NOTHING;

-- Insert sample challenges
INSERT INTO daily_challenges (coach_id, challenge_type, title, description, difficulty, xp_reward, coins_reward, success_criteria, tags) VALUES
('blake', 'mental', 'Morning Confidence Ritual', 'Start your day with 5 minutes of positive self-talk and power poses', 1, 30, 15, '{"duration": 5, "completed": true}', '["confidence", "morning", "routine"]'),
('chase', 'physical', 'Control Practice Session', 'Practice your control techniques for 10 minutes', 2, 40, 20, '{"duration": 10, "technique_practiced": true}', '["control", "practice", "technique"]'),
('logan', 'social', 'Start 3 Conversations', 'Initiate meaningful conversations with 3 different people today', 2, 50, 25, '{"conversations": 3, "meaningful": true}', '["social", "conversation", "practice"]')
ON CONFLICT DO NOTHING;

-- Insert sample achievements
INSERT INTO achievements (code, title, description, category, requirements, xp_reward, coins_reward, badge_type) VALUES
('FIRST_LESSON', 'First Steps', 'Complete your first lesson', 'progress', '{"lessons_completed": 1}', 50, 25, 'bronze'),
('WEEK_WARRIOR', 'Week Warrior', 'Complete lessons for 7 days in a row', 'progress', '{"streak_days": 7}', 100, 50, 'silver'),
('CONFIDENCE_BOOST', 'Confidence Boost', 'Increase your confidence score by 10 points', 'progress', '{"confidence_increase": 10}', 200, 100, 'gold')
ON CONFLICT (code) DO NOTHING;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_learning_modules_coach ON learning_modules(coach_id);
CREATE INDEX IF NOT EXISTS idx_learning_modules_active ON learning_modules(is_active);
CREATE INDEX IF NOT EXISTS idx_lessons_module ON lessons(module_id);
CREATE INDEX IF NOT EXISTS idx_lessons_active ON lessons(is_active);
CREATE INDEX IF NOT EXISTS idx_user_progress_user ON user_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_user_progress_lesson ON user_progress(lesson_id);
CREATE INDEX IF NOT EXISTS idx_user_activity_user ON user_activity_log(user_id);
CREATE INDEX IF NOT EXISTS idx_user_activity_date ON user_activity_log(activity_date);

-- Success message
SELECT 'ALS tables created successfully! 🎉' AS result;