-- SAFE CLEANUP SCRIPT - Handles foreign key constraints automatically
-- This script checks dependencies and cleans in the correct order

-- First, let's see what we're dealing with
SELECT 'Before cleanup:' as status;
SELECT 'coin_transactions' as table_name, count(*) as count FROM coin_transactions
UNION ALL
SELECT 'answers', count(*) FROM answers
UNION ALL  
SELECT 'questions', count(*) FROM questions;

-- Step 1: Clean coin_transactions first (they reference answers)
-- Remove transactions that reference specific answers
DELETE FROM coin_transactions 
WHERE answer_id IN (SELECT id FROM answers);

-- Remove community-related transactions by type
DELETE FROM coin_transactions 
WHERE transaction_type IN ('question_cost', 'answer_reward', 'vote_reward', 'best_answer_reward');

-- Step 2: Clean bot activities that reference community content
DELETE FROM bot_activities 
WHERE content_type = 'answer' AND content_id IN (SELECT id FROM answers);

DELETE FROM bot_activities 
WHERE content_type = 'question' AND content_id IN (SELECT id FROM questions);

DELETE FROM bot_activities 
WHERE activity_type IN ('question_posted', 'answer_posted', 'vote_cast', 'helpful_vote_received');

-- Step 3: Now safe to delete answers and questions
DELETE FROM answers;
DELETE FROM questions;

-- Verification
SELECT 'After cleanup:' as status;
SELECT 'coin_transactions (remaining)' as table_name, count(*) as count FROM coin_transactions
UNION ALL
SELECT 'answers', count(*) FROM answers
UNION ALL  
SELECT 'questions', count(*) FROM questions
UNION ALL
SELECT 'bot_activities (community)', count(*) FROM bot_activities 
WHERE activity_type IN ('question_posted', 'answer_posted', 'vote_cast');

-- Success message
SELECT '✅ Community cleanup completed successfully!' as result;