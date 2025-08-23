-- COMPLETE DATABASE CLEANUP SCRIPT
-- ⚠️ WARNING: This will delete ALL user data and community content!
-- Only run this for testing purposes!

-- Step 1: Clean community content (in correct order for foreign keys)
-- First remove coin transactions that reference answers
DELETE FROM coin_transactions WHERE answer_id IS NOT NULL;
-- Then remove other community-related transactions
DELETE FROM coin_transactions WHERE transaction_type IN ('question_cost', 'answer_reward', 'vote_reward', 'best_answer_reward');
-- Now safe to remove answers and questions
DELETE FROM answers;
DELETE FROM questions;

-- Step 2: Clean bot data (if you want to reset bots too)
-- DELETE FROM bot_activities;
-- DELETE FROM bot_interactions; 
-- DELETE FROM bots;

-- Step 3: Clean user-related data
DELETE FROM user_progress;
DELETE FROM coin_transactions;
DELETE FROM user_stats;
DELETE FROM user_milestones;
DELETE FROM user_sessions;
DELETE FROM user_activities;

-- Step 4: Clean main users table
DELETE FROM users;

-- Step 5: Reset any sequences/counters (if applicable)
-- This ensures IDs start from 1 again
-- ALTER SEQUENCE IF EXISTS users_id_seq RESTART WITH 1;
-- ALTER SEQUENCE IF EXISTS questions_id_seq RESTART WITH 1;
-- ALTER SEQUENCE IF EXISTS answers_id_seq RESTART WITH 1;

-- Step 6: Clean any cached/temporary data
DELETE FROM user_cache WHERE true;
DELETE FROM session_cache WHERE true;

-- Verification queries (run these to check cleanup)
-- SELECT 'users' as table_name, count(*) as remaining_records FROM users
-- UNION ALL
-- SELECT 'questions', count(*) FROM questions  
-- UNION ALL
-- SELECT 'answers', count(*) FROM answers
-- UNION ALL
-- SELECT 'bots', count(*) FROM bots;

-- ✅ Database cleanup complete!
-- Next steps:
-- 1. Run this SQL in Supabase SQL Editor
-- 2. Go to Supabase Auth → Users and delete all users manually
-- 3. Test bot system with clean environment