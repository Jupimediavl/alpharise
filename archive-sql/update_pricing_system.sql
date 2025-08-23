-- Add columns for real price vs discounted price
ALTER TABLE pricing_plans 
ADD COLUMN original_price DECIMAL(10,2),
ADD COLUMN discounted_price DECIMAL(10,2),
ADD COLUMN discount_percentage INTEGER DEFAULT 0,
ADD COLUMN discount_end_date TIMESTAMP;

-- Update the main subscription plan with realistic pricing
UPDATE pricing_plans 
SET 
  original_price = 19.99,
  discounted_price = 9.99,
  discount_percentage = 50,
  discount_end_date = NOW() + INTERVAL '30 days'
WHERE plan_name = 'basic';

-- Keep trial pricing simple
UPDATE pricing_plans 
SET 
  original_price = price,
  discounted_price = price
WHERE plan_name = 'trial';

-- Add some sample data for other plans if needed
UPDATE pricing_plans 
SET 
  original_price = 39.99,
  discounted_price = 19.99,
  discount_percentage = 50,
  discount_end_date = NOW() + INTERVAL '30 days'
WHERE plan_name = 'premium';

-- View the results
SELECT 
  plan_name,
  price as current_price,
  original_price,
  discounted_price,
  discount_percentage,
  currency,
  discount_end_date
FROM pricing_plans 
ORDER BY plan_name;