-- Create pricing_plans table for AlphaRise
CREATE TABLE pricing_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_type TEXT NOT NULL CHECK (plan_type IN ('trial', 'basic', 'premium', 'vip')),
  name TEXT NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  currency TEXT DEFAULT 'USD' CHECK (currency IN ('USD', 'EUR')),
  duration_days INTEGER NOT NULL,
  trial_days INTEGER,
  trial_price DECIMAL(10,2),
  features TEXT[] DEFAULT '{}',
  max_coins_per_day INTEGER,
  max_questions_per_day INTEGER,
  priority_support BOOLEAN DEFAULT false,
  coach_access TEXT[] DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX idx_pricing_plans_active ON pricing_plans(is_active, display_order);
CREATE INDEX idx_pricing_plans_type ON pricing_plans(plan_type, is_active);

-- Insert initial pricing data
INSERT INTO pricing_plans (
  plan_type, 
  name, 
  price, 
  currency, 
  duration_days, 
  trial_days, 
  trial_price, 
  features, 
  max_coins_per_day, 
  max_questions_per_day, 
  priority_support, 
  coach_access, 
  is_active, 
  display_order
) VALUES 
(
  'basic',
  'AlphaRise Basic',
  9.99,
  'USD',
  30,
  3,
  1.00,
  ARRAY[
    'Access to all coaches',
    'Unlimited community questions',
    'Daily challenges',
    'Progress tracking',
    'Confidence building exercises'
  ],
  50,
  5,
  false,
  ARRAY['all'],
  true,
  1
),
(
  'premium',
  'AlphaRise Premium',
  19.99,
  'USD',
  30,
  3,
  1.00,
  ARRAY[
    'Everything in Basic',
    'Priority coach responses',
    'Advanced confidence modules',
    'Private coaching sessions',
    'Exclusive premium content',
    '2x daily coin earning'
  ],
  100,
  10,
  true,
  ARRAY['all'],
  true,
  2
),
(
  'vip',
  'AlphaRise VIP',
  39.99,
  'USD',
  30,
  3,
  1.00,
  ARRAY[
    'Everything in Premium',
    '1-on-1 video coaching calls',
    'Custom confidence program',
    'Direct coach messaging',
    'VIP community access',
    'Unlimited coins & questions'
  ],
  -1,
  -1,
  true,
  ARRAY['all'],
  false,
  3
);

-- Create function to auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for auto-updating updated_at
CREATE TRIGGER update_pricing_plans_updated_at 
  BEFORE UPDATE ON pricing_plans 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();