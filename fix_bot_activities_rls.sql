-- Fix RLS policies for bot_activities to allow automation

-- Drop existing restrictive policies
DROP POLICY IF EXISTS "Bot activities readable by authenticated" ON bot_activities;
DROP POLICY IF EXISTS "Only authenticated can insert bot activities" ON bot_activities;

-- Create more permissive policies for automation
CREATE POLICY "Allow all to read bot activities" ON bot_activities 
    FOR SELECT USING (true);

CREATE POLICY "Allow all to insert bot activities" ON bot_activities 
    FOR INSERT WITH CHECK (true);

-- Also ensure the policy for bot schedules is working
DROP POLICY IF EXISTS "Bot schedules manageable by authenticated" ON bot_schedules;
CREATE POLICY "Allow all to access bot schedules" ON bot_schedules 
    FOR ALL USING (true);

-- Optional: Add policies for bots and personalities if needed
-- Drop and recreate to avoid conflicts
DROP POLICY IF EXISTS "Allow all to read bots" ON bots;
CREATE POLICY "Allow all to read bots" ON bots 
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow all to read bot_personalities" ON bot_personalities;    
CREATE POLICY "Allow all to read bot_personalities" ON bot_personalities 
    FOR SELECT USING (true);