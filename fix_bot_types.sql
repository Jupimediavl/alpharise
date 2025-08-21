-- Fix bot types directly in database
-- Run this in Supabase SQL editor

-- Update some bots to be questioners (generate questions only)
UPDATE bots 
SET type = 'questioner'
WHERE username IN ('eurolover', 'alexcarter', 'primasex')
AND status = 'active';

-- Update some bots to be mixed (can both ask and answer)
UPDATE bots 
SET type = 'mixed'
WHERE username IN ('tomwalks3', 'SexMachine8')
AND status = 'active';

-- Keep the rest as answerers (only answer questions)
-- nord888, goldenb0y, christianradoo, selfsex, tobiass

-- Verify the changes
SELECT username, type, status, activity_level
FROM bots
WHERE status = 'active'
ORDER BY type, username;