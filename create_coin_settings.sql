-- Create coin settings table for admin-managed conversion rates
CREATE TABLE coin_settings (
  id SERIAL PRIMARY KEY,
  coins_per_dollar DECIMAL(10,2) DEFAULT 100.00, -- 100 coins = $1
  min_cashout DECIMAL(10,2) DEFAULT 10.00,       -- minimum $10 cashout
  max_discount_percent DECIMAL(5,2) DEFAULT 50.00, -- max 50% discount
  bonus_multiplier DECIMAL(3,2) DEFAULT 1.00,     -- current bonus multiplier
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default settings
INSERT INTO coin_settings (coins_per_dollar, min_cashout, max_discount_percent) 
VALUES (100.00, 10.00, 50.00);

-- Create function to get current coin settings
CREATE OR REPLACE FUNCTION get_coin_settings()
RETURNS TABLE (
  coins_per_dollar DECIMAL(10,2),
  min_cashout DECIMAL(10,2), 
  max_discount_percent DECIMAL(5,2),
  bonus_multiplier DECIMAL(3,2)
) AS $$
BEGIN
  RETURN QUERY 
  SELECT cs.coins_per_dollar, cs.min_cashout, cs.max_discount_percent, cs.bonus_multiplier
  FROM coin_settings cs 
  WHERE cs.is_active = true 
  ORDER BY cs.updated_at DESC 
  LIMIT 1;
END;
$$ LANGUAGE plpgsql;