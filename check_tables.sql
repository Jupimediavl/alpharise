-- TABLE VERIFICATION SCRIPT
-- Run this to see what tables exist and their current record counts

-- Check all tables in the database
SELECT 
    table_name,
    table_type
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- Check record counts for main tables
SELECT 'users' as table_name, count(*) as record_count FROM users
UNION ALL
SELECT 'questions', count(*) FROM questions
UNION ALL  
SELECT 'answers', count(*) FROM answers
UNION ALL
SELECT 'bots', count(*) FROM bots
UNION ALL
SELECT 'bot_personalities', count(*) FROM bot_personalities
UNION ALL
SELECT 'bot_activities', count(*) FROM bot_activities
UNION ALL
SELECT 'coin_transactions', count(*) FROM coin_transactions
ORDER BY table_name;

-- Check if bot tables exist
SELECT 
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'bots') 
        THEN 'bots table exists' 
        ELSE 'bots table missing - run supabase_bot_system.sql' 
    END as bot_system_status;

-- Check recent activity in community
SELECT 
    'Recent questions (last 7 days)' as metric,
    count(*) as count
FROM questions 
WHERE created_at > NOW() - INTERVAL '7 days'
UNION ALL
SELECT 
    'Recent answers (last 7 days)',
    count(*) 
FROM answers 
WHERE created_at > NOW() - INTERVAL '7 days';