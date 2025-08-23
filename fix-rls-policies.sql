-- Fix RLS policies for user_problems table
-- The current policies are blocking inserts

-- First, drop existing policies
DROP POLICY IF EXISTS "Users can view own user_problems" ON public.user_problems;
DROP POLICY IF EXISTS "Users can manage own user_problems" ON public.user_problems;

-- Create more permissive policies that work correctly
-- Policy for SELECT
CREATE POLICY "Enable read access for users" ON public.user_problems
  FOR SELECT
  USING (auth.uid() = user_id);

-- Policy for INSERT - THIS IS THE KEY FIX
CREATE POLICY "Enable insert for users" ON public.user_problems
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy for UPDATE
CREATE POLICY "Enable update for users" ON public.user_problems
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Policy for DELETE
CREATE POLICY "Enable delete for users" ON public.user_problems
  FOR DELETE
  USING (auth.uid() = user_id);

-- Alternative: If still having issues, temporarily disable RLS
-- (uncomment the line below only if the above doesn't work)
-- ALTER TABLE public.user_problems DISABLE ROW LEVEL SECURITY;

-- Verify the table structure
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'user_problems'
ORDER BY ordinal_position;

-- Success message
SELECT 'RLS policies fixed! Try saving user problems again.' as message;