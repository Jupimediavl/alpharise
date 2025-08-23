-- Create missing ALS (Adaptive Learning System) tables
-- Run this in Supabase SQL Editor to enable full ALS functionality

-- 1. AI Learning Paths table
CREATE TABLE IF NOT EXISTS public.ai_learning_paths (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  coach_id TEXT NOT NULL,
  path_type TEXT DEFAULT 'adaptive',
  generated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  path_data JSONB,
  ai_recommendations JSONB,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_ai_learning_paths_user_id ON public.ai_learning_paths(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_learning_paths_coach_id ON public.ai_learning_paths(coach_id);
CREATE INDEX IF NOT EXISTS idx_ai_learning_paths_active ON public.ai_learning_paths(is_active);

-- 2. User Problem Steps table (if not exists)
CREATE TABLE IF NOT EXISTS public.user_problem_steps (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  step_number INTEGER NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  content_type TEXT DEFAULT 'lesson',
  estimated_minutes INTEGER DEFAULT 15,
  is_completed BOOLEAN DEFAULT false,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_user_problem_steps_user_id ON public.user_problem_steps(user_id);
CREATE INDEX IF NOT EXISTS idx_user_problem_steps_completed ON public.user_problem_steps(is_completed);

-- 3. User Problems table (if not exists)
CREATE TABLE IF NOT EXISTS public.user_problems (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  primary_problem TEXT NOT NULL,
  additional_problems TEXT[] DEFAULT '{}',
  current_step INTEGER DEFAULT 1,
  completed_steps INTEGER[] DEFAULT '{}',
  total_steps INTEGER DEFAULT 10,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Add index
CREATE INDEX IF NOT EXISTS idx_user_problems_user_id ON public.user_problems(user_id);

-- 4. Learning Progress Events table
CREATE TABLE IF NOT EXISTS public.learning_progress_events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL, -- 'lesson_start', 'lesson_complete', 'module_complete', etc.
  event_data JSONB,
  module_id UUID,
  lesson_id UUID,
  xp_earned INTEGER DEFAULT 0,
  coins_earned INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_learning_progress_events_user_id ON public.learning_progress_events(user_id);
CREATE INDEX IF NOT EXISTS idx_learning_progress_events_type ON public.learning_progress_events(event_type);
CREATE INDEX IF NOT EXISTS idx_learning_progress_events_created ON public.learning_progress_events(created_at);

-- 5. AI Recommendations table
CREATE TABLE IF NOT EXISTS public.ai_recommendations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  recommendation_type TEXT NOT NULL, -- 'next_lesson', 'review', 'challenge', etc.
  recommendation_data JSONB,
  confidence_score DECIMAL(3,2), -- 0.00 to 1.00
  is_accepted BOOLEAN,
  accepted_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_ai_recommendations_user_id ON public.ai_recommendations(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_recommendations_type ON public.ai_recommendations(recommendation_type);

-- Grant permissions
GRANT ALL ON public.ai_learning_paths TO authenticated;
GRANT ALL ON public.user_problem_steps TO authenticated;
GRANT ALL ON public.user_problems TO authenticated;
GRANT ALL ON public.learning_progress_events TO authenticated;
GRANT ALL ON public.ai_recommendations TO authenticated;

-- Enable RLS (Row Level Security)
ALTER TABLE public.ai_learning_paths ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_problem_steps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_problems ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.learning_progress_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_recommendations ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view own ai_learning_paths" ON public.ai_learning_paths
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own ai_learning_paths" ON public.ai_learning_paths
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own ai_learning_paths" ON public.ai_learning_paths
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own user_problem_steps" ON public.user_problem_steps
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own user_problem_steps" ON public.user_problem_steps
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view own user_problems" ON public.user_problems
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own user_problems" ON public.user_problems
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view own learning_progress_events" ON public.learning_progress_events
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own learning_progress_events" ON public.learning_progress_events
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own ai_recommendations" ON public.ai_recommendations
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own ai_recommendations" ON public.ai_recommendations
  FOR ALL USING (auth.uid() = user_id);

-- Success message
SELECT 'ALS tables created successfully! You can now enable ALS in the application.' as message;