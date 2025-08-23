-- TEMPORARY FIX: Disable RLS to allow saving user problems
-- Run this NOW in Supabase SQL Editor

-- Disable RLS on user_problems table
ALTER TABLE public.user_problems DISABLE ROW LEVEL SECURITY;

-- Verify RLS is disabled
SELECT 
  tablename,
  rowsecurity
FROM pg_tables
WHERE schemaname = 'public' 
  AND tablename = 'user_problems';

-- Success message
SELECT 'RLS disabled on user_problems table. Try saving now!' as message;

-- NOTE: To re-enable RLS later with proper policies:
-- ALTER TABLE public.user_problems ENABLE ROW LEVEL SECURITY;