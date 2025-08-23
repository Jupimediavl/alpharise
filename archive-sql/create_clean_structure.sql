-- AlphaRise Clean Database Structure
-- 1. Drop old pricing_plans if exists
DROP TABLE IF EXISTS pricing_plans CASCADE;

-- 2. Create clean pricing_plans table (pricing only)
CREATE TABLE pricing_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_type TEXT NOT NULL UNIQUE CHECK (plan_type IN ('trial', 'basic', 'premium')),
  name TEXT NOT NULL,
  display_name TEXT NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  currency TEXT DEFAULT 'USD',
  trial_price DECIMAL(10,2) DEFAULT 1.00,
  trial_days INTEGER DEFAULT 3,
  is_active BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Create plan_features table (features and limits)
CREATE TABLE plan_features (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_type TEXT NOT NULL REFERENCES pricing_plans(plan_type),
  feature_key TEXT NOT NULL,
  feature_name TEXT NOT NULL,
  feature_description TEXT,
  max_value INTEGER, -- -1 for unlimited, NULL for boolean features
  is_enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(plan_type, feature_key)
);

-- 4. Update users table structure (remove old features, add subscription)
ALTER TABLE users DROP COLUMN IF EXISTS streak CASCADE;
ALTER TABLE users DROP COLUMN IF EXISTS level CASCADE;
ALTER TABLE users DROP COLUMN IF EXISTS total_earned CASCADE;
ALTER TABLE users DROP COLUMN IF EXISTS monthly_earnings CASCADE;
ALTER TABLE users DROP COLUMN IF EXISTS discount_earned CASCADE;
ALTER TABLE users DROP COLUMN IF EXISTS subscription_type CASCADE;
ALTER TABLE users DROP COLUMN IF EXISTS trial_days_left CASCADE;
ALTER TABLE users DROP COLUMN IF EXISTS experience CASCADE;
ALTER TABLE users DROP COLUMN IF EXISTS badges CASCADE;

-- Add new subscription columns to users
ALTER TABLE users ADD COLUMN IF NOT EXISTS current_plan TEXT DEFAULT 'trial' 
  CHECK (current_plan IN ('trial', 'basic', 'premium'));
ALTER TABLE users ADD COLUMN IF NOT EXISTS subscription_status TEXT DEFAULT 'active' 
  CHECK (subscription_status IN ('trial', 'active', 'cancelled', 'expired'));
ALTER TABLE users ADD COLUMN IF NOT EXISTS subscription_expires_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS trial_started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- 5. Create indexes
CREATE INDEX idx_pricing_plans_active ON pricing_plans(is_active, display_order);
CREATE INDEX idx_plan_features_plan ON plan_features(plan_type, is_enabled);
CREATE INDEX idx_users_plan ON users(current_plan, subscription_status);

-- 6. Insert pricing data
INSERT INTO pricing_plans (plan_type, name, display_name, price, currency, trial_price, trial_days, is_active, display_order) VALUES
('trial', 'AlphaRise Trial', 'Free Trial', 0.00, 'USD', 1.00, 3, true, 1),
('basic', 'AlphaRise Basic', 'Basic Plan', 9.99, 'USD', 1.00, 3, true, 2),
('premium', 'AlphaRise Premium', 'Premium Plan', 19.99, 'USD', 1.00, 3, true, 3);

-- 7. Insert plan features
-- TRIAL FEATURES
INSERT INTO plan_features (plan_type, feature_key, feature_name, feature_description, max_value, is_enabled) VALUES
('trial', 'max_coins_daily', 'Daily Coins Limit', 'Maximum coins that can be earned per day', 25, true),
('trial', 'max_questions_daily', 'Daily Questions Limit', 'Maximum questions that can be asked per day', 2, true),
('trial', 'community_access', 'Community Access', 'Access to community forum', NULL, true),
('trial', 'coach_access', 'Coach Access', 'Access to assigned coach', NULL, true),
('trial', 'daily_challenges', 'Daily Challenges', 'Access to daily confidence challenges', NULL, true),
('trial', 'priority_support', 'Priority Support', 'Priority customer support', NULL, false),
('trial', 'advanced_modules', 'Advanced Modules', 'Access to advanced confidence modules', NULL, false);

-- BASIC FEATURES
INSERT INTO plan_features (plan_type, feature_key, feature_name, feature_description, max_value, is_enabled) VALUES
('basic', 'max_coins_daily', 'Daily Coins Limit', 'Maximum coins that can be earned per day', 50, true),
('basic', 'max_questions_daily', 'Daily Questions Limit', 'Maximum questions that can be asked per day', 5, true),
('basic', 'community_access', 'Community Access', 'Access to community forum', NULL, true),
('basic', 'coach_access', 'Coach Access', 'Access to all coaches', NULL, true),
('basic', 'daily_challenges', 'Daily Challenges', 'Access to daily confidence challenges', NULL, true),
('basic', 'priority_support', 'Priority Support', 'Priority customer support', NULL, false),
('basic', 'advanced_modules', 'Advanced Modules', 'Access to advanced confidence modules', NULL, true),
('basic', 'progress_tracking', 'Progress Tracking', 'Detailed progress analytics', NULL, true),
('basic', 'unlimited_community', 'Unlimited Community', 'Unlimited community interactions', NULL, true);

-- PREMIUM FEATURES
INSERT INTO plan_features (plan_type, feature_key, feature_name, feature_description, max_value, is_enabled) VALUES
('premium', 'max_coins_daily', 'Daily Coins Limit', 'Maximum coins that can be earned per day', 100, true),
('premium', 'max_questions_daily', 'Daily Questions Limit', 'Maximum questions that can be asked per day', 10, true),
('premium', 'community_access', 'Community Access', 'Access to community forum', NULL, true),
('premium', 'coach_access', 'Coach Access', 'Access to all coaches', NULL, true),
('premium', 'daily_challenges', 'Daily Challenges', 'Access to daily confidence challenges', NULL, true),
('premium', 'priority_support', 'Priority Support', 'Priority customer support', NULL, true),
('premium', 'advanced_modules', 'Advanced Modules', 'Access to advanced confidence modules', NULL, true),
('premium', 'progress_tracking', 'Progress Tracking', 'Detailed progress analytics', NULL, true),
('premium', 'unlimited_community', 'Unlimited Community', 'Unlimited community interactions', NULL, true),
('premium', 'private_coaching', 'Private Coaching', 'Access to private coaching sessions', NULL, true),
('premium', 'exclusive_content', 'Exclusive Content', 'Access to premium exclusive content', NULL, true),
('premium', 'coach_messaging', 'Coach Messaging', 'Direct messaging with coaches', NULL, true);

-- 8. Create function for auto-updating timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 9. Create triggers
CREATE TRIGGER update_pricing_plans_updated_at 
  BEFORE UPDATE ON pricing_plans 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- 10. Update existing users to have trial plan if they don't have current_plan
UPDATE users 
SET current_plan = 'trial', 
    subscription_status = 'trial', 
    trial_started_at = NOW()
WHERE current_plan IS NULL;