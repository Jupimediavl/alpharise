-- COMMUNITY CLEANUP SCRIPT - Keeps users, removes only community content
-- This script only cleans community posts, keeping user accounts intact

-- Step 1: Remove coin transactions that reference answers (CRITICAL - do this first!)
DELETE FROM coin_transactions 
WHERE answer_id IS NOT NULL;

-- Step 2: Remove other coin transactions (if you want to reset coins completely - optional)
-- DELETE FROM coin_transactions; -- Uncomment this line if you want to reset all coins

-- Step 3: Remove all answers (now safe to delete)
DELETE FROM answers;

-- Step 4: Remove all questions
DELETE FROM questions;

-- Step 5: Clean bot activities related to community
DELETE FROM bot_activities 
WHERE activity_type IN ('question_posted', 'answer_posted', 'vote_cast', 'helpful_vote_received');

-- Verification - check that community is empty
SELECT 
    'questions' as table_name, 
    count(*) as remaining_records 
FROM questions
UNION ALL
SELECT 'answers', count(*) FROM answers
UNION ALL
SELECT 'bot_activities (community)', count(*) FROM bot_activities 
WHERE activity_type IN ('question_posted', 'answer_posted', 'vote_cast');

-- ✅ Community cleanup complete!
-- Community is now empty and ready for fresh bot content.