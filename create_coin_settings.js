// Create coin_settings table directly through API
require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')

console.log('Environment check:')
console.log('SUPABASE_URL:', process.env.NEXT_PUBLIC_SUPABASE_URL ? 'Found' : 'Missing')
console.log('SERVICE_KEY:', process.env.SUPABASE_SERVICE_ROLE_KEY ? 'Found' : 'Missing')

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function createCoinSettingsTable() {
  console.log('🔧 Creating coin_settings table...')
  
  try {
    // First, try to create the table using raw SQL
    const createTableQuery = `
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
    `
    
    const { data: createResult, error: createError } = await supabaseAdmin
      .rpc('exec_sql', { query: createTableQuery })

    if (createError) {
      console.error('❌ Table creation failed:', createError)
      return
    }

    console.log('✅ Table created successfully!')

    // Insert default settings
    const { data: insertData, error: insertError } = await supabaseAdmin
      .from('coin_settings')
      .insert({
        coins_per_dollar: 100.00,
        min_cashout: 10.00,
        max_discount_percent: 50.00,
        bonus_multiplier: 1.00,
        is_active: true
      })
      .select()

    if (insertError) {
      console.log('📝 Insert warning (might already exist):', insertError.message)
    } else {
      console.log('✅ Default settings inserted:', insertData)
    }

    // Test the settings API
    console.log('🧪 Testing coin settings API...')
    const { data: testData, error: testError } = await supabaseAdmin
      .from('coin_settings')
      .select('*')
      .eq('is_active', true)
      .order('updated_at', { ascending: false })
      .limit(1)
      .single()

    if (testError) {
      console.error('❌ Test failed:', testError)
    } else {
      console.log('✅ Test successful! Current settings:', testData)
    }

  } catch (err) {
    console.error('💥 Error:', err)
  }
}

createCoinSettingsTable()