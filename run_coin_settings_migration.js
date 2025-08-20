// Run coin settings migration
const { createClient } = require('@supabase/supabase-js')

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function runMigration() {
  console.log('🔧 Creating coin_settings table...')
  
  try {
    // Create the coin_settings table
    const { data, error } = await supabaseAdmin.rpc('exec_sql', {
      query: `
        -- Create coin settings table for admin-managed conversion rates
        CREATE TABLE IF NOT EXISTS coin_settings (
          id SERIAL PRIMARY KEY,
          coins_per_dollar DECIMAL(10,2) DEFAULT 100.00, -- 100 coins = $1
          min_cashout DECIMAL(10,2) DEFAULT 10.00,       -- minimum $10 cashout
          max_discount_percent DECIMAL(5,2) DEFAULT 50.00, -- max 50% discount
          bonus_multiplier DECIMAL(3,2) DEFAULT 1.00,     -- current bonus multiplier
          is_active BOOLEAN DEFAULT true,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );

        -- Insert default settings if not exists
        INSERT INTO coin_settings (coins_per_dollar, min_cashout, max_discount_percent) 
        SELECT 100.00, 10.00, 50.00
        WHERE NOT EXISTS (SELECT 1 FROM coin_settings WHERE is_active = true);
      `
    })

    if (error) {
      console.error('❌ Migration failed:', error)
    } else {
      console.log('✅ Migration completed successfully!')
      console.log('📊 Coin settings table created with default values')
    }
  } catch (err) {
    console.error('💥 Migration error:', err)
  }
}

runMigration()