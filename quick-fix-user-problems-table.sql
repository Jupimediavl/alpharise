-- Quick fix: Create user_problems table only
-- Run this in Supabase SQL Editor NOW to fix the error

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

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_user_problems_user_id ON public.user_problems(user_id);

-- Grant permissions
GRANT ALL ON public.user_problems TO authenticated;

-- Enable RLS
ALTER TABLE public.user_problems ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view own user_problems" ON public.user_problems
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own user_problems" ON public.user_problems
  FOR ALL USING (auth.uid() = user_id);

-- Success
SELECT 'user_problems table created successfully!' as message;