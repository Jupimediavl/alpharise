-- Enable ALS (Adaptive Learning System)
-- Run this script in Supabase SQL Editor to activate the full system

-- 1. Create user_learning_profiles table (core of ALS)
CREATE TABLE IF NOT EXISTS public.user_learning_profiles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  coach_id TEXT NOT NULL,
  assessment_data JSONB DEFAULT '{}',
  personalization_data JSONB DEFAULT '{}',
  initial_confidence_score INTEGER DEFAULT 30,
  current_confidence_score INTEGER DEFAULT 30,
  engagement_score INTEGER DEFAULT 0,
  consistency_score INTEGER DEFAULT 0,
  mastery_level INTEGER DEFAULT 1,
  total_xp INTEGER DEFAULT 0,
  current_level INTEGER DEFAULT 1,
  current_streak INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  achievements_unlocked TEXT[] DEFAULT '{}',
  total_coins INTEGER DEFAULT 0,
  preferred_content_type TEXT DEFAULT 'video',
  preferred_session_length INTEGER DEFAULT 15,
  best_learning_time TEXT DEFAULT 'evening',
  learning_pace TEXT DEFAULT 'steady',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Create lesson_progress table
CREATE TABLE IF NOT EXISTS public.lesson_progress (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  lesson_id UUID REFERENCES public.lessons(id) ON DELETE CASCADE,
  module_id UUID REFERENCES public.learning_modules(id) ON DELETE CASCADE,
  progress_percentage INTEGER DEFAULT 0,
  time_spent_seconds INTEGER DEFAULT 0,
  is_completed BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMP WITH TIME ZONE,
  xp_earned INTEGER DEFAULT 0,
  coins_earned INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, lesson_id)
);

-- 3. Create module_progress table  
CREATE TABLE IF NOT EXISTS public.module_progress (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  module_id UUID REFERENCES public.learning_modules(id) ON DELETE CASCADE,
  progress_percentage INTEGER DEFAULT 0,
  lessons_completed INTEGER DEFAULT 0,
  total_lessons INTEGER DEFAULT 0,
  is_completed BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMP WITH TIME ZONE,
  total_xp_earned INTEGER DEFAULT 0,
  total_coins_earned INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, module_id)
);

-- 4. Create ai_learning_paths table
CREATE TABLE IF NOT EXISTS public.ai_learning_paths (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  coach_id TEXT NOT NULL,
  path_type TEXT DEFAULT 'adaptive',
  generated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  path_data JSONB DEFAULT '{}',
  ai_recommendations JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_learning_profiles_user_id ON public.user_learning_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_learning_profiles_coach_id ON public.user_learning_profiles(coach_id);
CREATE INDEX IF NOT EXISTS idx_lesson_progress_user_id ON public.lesson_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_lesson_progress_lesson_id ON public.lesson_progress(lesson_id);
CREATE INDEX IF NOT EXISTS idx_lesson_progress_module_id ON public.lesson_progress(module_id);
CREATE INDEX IF NOT EXISTS idx_module_progress_user_id ON public.module_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_module_progress_module_id ON public.module_progress(module_id);
CREATE INDEX IF NOT EXISTS idx_ai_learning_paths_user_id ON public.ai_learning_paths(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_learning_paths_coach_id ON public.ai_learning_paths(coach_id);

-- Grant permissions
GRANT ALL ON public.user_learning_profiles TO authenticated;
GRANT ALL ON public.lesson_progress TO authenticated;
GRANT ALL ON public.module_progress TO authenticated;
GRANT ALL ON public.ai_learning_paths TO authenticated;

-- Temporarily disable RLS on new tables (for simplicity, like user_problems)
ALTER TABLE public.user_learning_profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.lesson_progress DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.module_progress DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_learning_paths DISABLE ROW LEVEL SECURITY;

-- Also disable RLS on existing tables to avoid issues
ALTER TABLE public.learning_modules DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.lessons DISABLE ROW LEVEL SECURITY;

-- Success message
SELECT 
  'ALS System Enabled Successfully!' as message,
  'Tables created: user_learning_profiles, lesson_progress, module_progress, ai_learning_paths' as details;

-- Show what was created
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN ('user_learning_profiles', 'lesson_progress', 'module_progress', 'ai_learning_paths')
ORDER BY table_name;