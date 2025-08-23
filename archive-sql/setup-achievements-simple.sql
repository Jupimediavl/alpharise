-- First, let's drop the tables if they exist to start fresh
DROP TABLE IF EXISTS user_achievements CASCADE;
DROP TABLE IF EXISTS achievements CASCADE;

-- Create achievements table with all columns
CREATE TABLE achievements (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title VARCHAR(255) NOT NULL UNIQUE,
  description TEXT NOT NULL,
  icon VARCHAR(100) DEFAULT '🏆',
  category VARCHAR(100) DEFAULT 'progress',
  points INTEGER DEFAULT 100,
  requirements JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create user_achievements table
CREATE TABLE user_achievements (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  achievement_id UUID NOT NULL REFERENCES achievements(id) ON DELETE CASCADE,
  unlocked_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  progress_data JSONB DEFAULT '{}',
  UNIQUE(user_id, achievement_id)
);

-- Insert sample achievements
INSERT INTO achievements (title, description, icon, category, points, requirements) VALUES
  ('First Steps', 'Complete your first lesson', '👶', 'progress', 50, '{"lessons_completed": 1}'),
  ('Week Warrior', 'Maintain a 7-day learning streak', '🔥', 'consistency', 200, '{"streak_days": 7}'),
  ('Confidence Builder', 'Increase your confidence score by 20 points', '💪', 'confidence', 150, '{"confidence_increase": 20}'),
  ('Early Bird', 'Complete 5 lessons before 9 AM', '🌅', 'timing', 100, '{"early_lessons": 5}'),
  ('Knowledge Seeker', 'Complete 10 different modules', '📚', 'exploration', 300, '{"modules_completed": 10}'),
  ('Challenge Master', 'Complete 20 daily challenges', '🏆', 'challenges', 250, '{"challenges_completed": 20}'),
  ('XP Hunter', 'Earn 1000 total XP', '⚡', 'points', 200, '{"total_xp": 1000}'),
  ('Perfectionist', 'Achieve 100% completion rate for a week', '✨', 'achievement', 300, '{"perfect_week": true}'),
  ('Social Learner', 'Reach top 10 in weekly leaderboard', '👥', 'social', 175, '{"leaderboard_top10": true}'),
  ('Micro Master', 'Complete 50 micro-learning sessions', '💡', 'micro_learning', 150, '{"micro_sessions": 50}');

-- Add indexes for better performance
CREATE INDEX idx_user_achievements_user_id ON user_achievements(user_id);
CREATE INDEX idx_user_achievements_achievement_id ON user_achievements(achievement_id);
CREATE INDEX idx_achievements_category ON achievements(category);
CREATE INDEX idx_achievements_active ON achievements(is_active);

-- Enable RLS (Row Level Security)
ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;

-- Create policies for achievements (public read)
DROP POLICY IF EXISTS "Achievements are viewable by everyone" ON achievements;
CREATE POLICY "Achievements are viewable by everyone" ON achievements FOR SELECT USING (true);

-- Create policies for user_achievements (users can only see their own)
DROP POLICY IF EXISTS "Users can view their own achievements" ON user_achievements;
CREATE POLICY "Users can view their own achievements" ON user_achievements FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own achievements" ON user_achievements;
CREATE POLICY "Users can insert their own achievements" ON user_achievements FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own achievements" ON user_achievements;
CREATE POLICY "Users can update their own achievements" ON user_achievements FOR UPDATE USING (auth.uid() = user_id);