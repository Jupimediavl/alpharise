-- Add admin functionality to existing users table
-- This allows any user to be promoted to admin

-- Add is_admin column to users table
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT FALSE;

-- Create index for fast admin lookups
CREATE INDEX IF NOT EXISTS idx_users_is_admin ON users(is_admin);

-- Set your user as admin (replace with your email)
-- UPDATE users SET is_admin = TRUE WHERE email = 'your-admin-email@example.com';

-- Optional: Create admin role policy for future use
-- This ensures only admins can modify admin status
-- ALTER TABLE users ENABLE ROW LEVEL SECURITY;
-- CREATE POLICY "Only admins can modify admin status" ON users
--   FOR UPDATE USING (auth.uid() IN (SELECT id FROM users WHERE is_admin = TRUE));

COMMENT ON COLUMN users.is_admin IS 'TRUE if user has admin privileges for moderation and system management';