-- Remove user_type column and simplify to use only coach
-- This aligns with the coach-first approach in the UI

-- Remove the user_type column from users table
ALTER TABLE users DROP COLUMN IF EXISTS user_type CASCADE;

-- Ensure the coach column exists and has proper constraints  
ALTER TABLE users ADD COLUMN IF NOT EXISTS coach VARCHAR(50) DEFAULT 'logan';

-- Add constraint to ensure valid coach values
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_coach_check;
ALTER TABLE users ADD CONSTRAINT users_coach_check 
  CHECK (coach IN ('blake', 'chase', 'logan', 'mason', 'knox'));

-- Create index for fast coach lookups
CREATE INDEX IF NOT EXISTS idx_users_coach ON users(coach);

-- Update any existing NULL coaches to default 'logan'
UPDATE users SET coach = 'logan' WHERE coach IS NULL;

COMMENT ON COLUMN users.coach IS 'Selected coach ID - determines learning path and problem focus';