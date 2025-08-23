-- MINIMAL CLEANUP SCRIPT - Only removes core community content
-- This script avoids unknown column names and focuses on essential cleanup

-- Step 1: Check what tables exist first
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('coin_transactions', 'answers', 'questions', 'bot_activities')
ORDER BY table_name;

-- Step 2: Clean coin_transactions that reference answers (if answer_id column exists)
-- This is the safest approach - only delete if the reference exists
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'coin_transactions' AND column_name = 'answer_id'
    ) THEN
        DELETE FROM coin_transactions WHERE answer_id IS NOT NULL;
        RAISE NOTICE 'Deleted coin_transactions with answer_id references';
    ELSE
        RAISE NOTICE 'answer_id column not found in coin_transactions';
    END IF;
END $$;

-- Step 3: Clean bot activities safely (if table exists)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'bot_activities') THEN
        DELETE FROM bot_activities WHERE activity_type IN ('question_posted', 'answer_posted', 'vote_cast');
        RAISE NOTICE 'Cleaned bot_activities';
    ELSE
        RAISE NOTICE 'bot_activities table not found';
    END IF;
END $$;

-- Step 4: Delete answers (now safe)
DELETE FROM answers;

-- Step 5: Delete questions
DELETE FROM questions;

-- Final verification
SELECT 'answers' as table_name, count(*) as remaining_count FROM answers
UNION ALL
SELECT 'questions', count(*) FROM questions;

SELECT '✅ Minimal cleanup completed!' as result;