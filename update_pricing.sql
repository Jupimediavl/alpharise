-- Update pricing to 2 days trial for $2
UPDATE pricing_plans 
SET trial_days = 2, trial_price = 2.00
WHERE plan_type = 'basic';

-- Verify the update
SELECT plan_type, name, trial_days, trial_price, price 
FROM pricing_plans 
WHERE plan_type = 'basic';