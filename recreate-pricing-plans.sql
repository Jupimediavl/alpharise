-- Recreate pricing_plans table with new structure for 2 plans
-- TRIAL: FREE LIFETIME
-- PREMIUM: FREE 3 DAYS, then $19.99 ONE TIME PAYMENT (reduced from $99.99)

-- First, backup existing data if needed, then clear table
DELETE FROM pricing_plans;

-- Update the existing pricing plans with new structure
INSERT INTO pricing_plans (
    id,
    plan_type,
    name,
    display_name,
    price,
    currency,
    trial_price,
    trial_days,
    is_active,
    display_order,
    original_price,
    discounted_price,
    discount_percentage,
    discount_end_date,
    created_at,
    updated_at
) VALUES 
-- TRIAL PLAN - FREE LIFETIME
(
    gen_random_uuid(),
    'trial',
    'AlphaRise Trial',
    'Trial Access',
    0.00,
    'USD',
    0.00,
    999999, -- Lifetime (very large number)
    true,
    1,
    0.00,
    0.00,
    0,
    NULL,
    NOW(),
    NOW()
),
-- PREMIUM PLAN - FREE 3 DAYS, then $19.99 ONE TIME (reduced from $99.99)  
(
    gen_random_uuid(),
    'premium',
    'AlphaRise Premium',
    'Premium Access',
    19.99,
    'USD',
    0.00,
    3, -- FREE 3 DAYS
    true,
    2,
    99.99, -- Original price
    19.99, -- Discounted price  
    80, -- 80% discount (99.99 -> 19.99)
    '2025-12-31 23:59:59', -- End of year
    NOW(),
    NOW()
);

-- Verify the new pricing plans
SELECT 
    plan_type,
    display_name,
    original_price,
    discounted_price,
    discount_percentage,
    trial_days,
    CASE 
        WHEN plan_type = 'trial' THEN 'FREE LIFETIME'
        WHEN plan_type = 'premium' THEN CONCAT('FREE ', trial_days, ' DAYS, then $', discounted_price, ' ONE TIME PAYMENT')
        ELSE 'Unknown'
    END as plan_description
FROM pricing_plans 
ORDER BY display_order;