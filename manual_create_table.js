// Manually create coin_settings table
const { createClient } = require('@supabase/supabase-js')

// Use the same environment variables as the app
const supabaseUrl = 'https://nkxqcqlzzafwjslygmca.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5reHFjcWx6emFmd2pzbHlnbWNhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzMwNjc0MzcsImV4cCI6MjA0ODY0MzQzN30.5YePh1TVDXfzFBE2ckfLlHc5fPW1bPGJKZvepYF1J7A'
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5reHFjcWx6emFmd2pzbHlnbWNhIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczMzA2NzQzNywiZXhwIjoyMDQ4NjQzNDM3fQ.MfL6TGQB1Jb1HqwETB3ZqnJmJxKUwLDYjYA2_OUckYE'

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)

async function createTable() {
  console.log('🔧 Creating coin_settings table...')
  
  try {
    // First, let's just try to insert a record and see if the table exists
    const { data: testData, error: testError } = await supabaseAdmin
      .from('coin_settings')
      .select('id')
      .limit(1)

    if (testError && testError.code === 'PGRST205') {
      console.log('❌ Table does not exist:', testError.message)
      console.log('Please create the table manually in Supabase dashboard with this SQL:')
      console.log(`
        CREATE TABLE coin_settings (
          id SERIAL PRIMARY KEY,
          coins_per_dollar DECIMAL(10,2) DEFAULT 100.00,
          min_cashout DECIMAL(10,2) DEFAULT 10.00,
          max_discount_percent DECIMAL(5,2) DEFAULT 50.00,
          bonus_multiplier DECIMAL(3,2) DEFAULT 1.00,
          is_active BOOLEAN DEFAULT true,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );

        INSERT INTO coin_settings (coins_per_dollar, min_cashout, max_discount_percent) 
        VALUES (100.00, 10.00, 50.00);
      `)
    } else if (testError) {
      console.error('❌ Other error:', testError)
    } else {
      console.log('✅ Table already exists!')
      
      // Insert default settings if none exist
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

      if (insertError && insertError.code !== '23505') { // ignore duplicate key error
        console.error('❌ Insert error:', insertError)
      } else {
        console.log('✅ Default settings available!')
      }
    }
  } catch (err) {
    console.error('💥 Error:', err)
  }
}

createTable()