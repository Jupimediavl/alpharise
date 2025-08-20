-- Run this SQL in Supabase SQL Editor to create the coin_settings table

CREATE TABLE IF NOT EXISTS coin_settings (
  id SERIAL PRIMARY KEY,
  coins_per_dollar DECIMAL(10,2) DEFAULT 100.00,
  min_cashout DECIMAL(10,2) DEFAULT 10.00,
  max_discount_percent DECIMAL(5,2) DEFAULT 50.00,
  bonus_multiplier DECIMAL(3,2) DEFAULT 1.00,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default settings
INSERT INTO coin_settings (coins_per_dollar, min_cashout, max_discount_percent, bonus_multiplier, is_active) 
VALUES (100.00, 10.00, 50.00, 1.00, true)
ON CONFLICT DO NOTHING;

-- Verify the table was created
SELECT * FROM coin_settings WHERE is_active = true LIMIT 1;