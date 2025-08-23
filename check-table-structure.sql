-- Check what columns actually exist in learning_modules table
-- Run this in Supabase SQL Editor first

SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name = 'learning_modules'
ORDER BY ordinal_position;