const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')

const supabaseUrl = 'https://yzlhipdnqidzkyazdilu.supabase.co'
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl6bGhpcGRucWlkemt5YXpkaWx1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTEwNDA4NiwiZXhwIjoyMDcwNjgwMDg2fQ.QOzIX_s-SxvAfZTIYiVbhPJh6qAaxaG1d13u-u5nAuA'

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function migratePricing() {
  console.log('🔄 Starting pricing migration...')
  
  try {
    // Step 1: Add columns (this might fail if columns already exist)
    console.log('📝 Adding new columns...')
    
    const alterQueries = [
      `ALTER TABLE pricing_plans ADD COLUMN IF NOT EXISTS original_price DECIMAL(10,2)`,
      `ALTER TABLE pricing_plans ADD COLUMN IF NOT EXISTS discounted_price DECIMAL(10,2)`,
      `ALTER TABLE pricing_plans ADD COLUMN IF NOT EXISTS discount_percentage INTEGER DEFAULT 0`,
      `ALTER TABLE pricing_plans ADD COLUMN IF NOT EXISTS discount_end_date TIMESTAMP`
    ]
    
    for (const query of alterQueries) {
      const { error } = await supabase.rpc('execute_sql', { query })
      if (error && !error.message.includes('already exists')) {
        console.error('❌ Error adding column:', error)
      }
    }
    
    console.log('✅ Columns added successfully')
    
    // Step 2: Update basic plan with discount
    console.log('💰 Setting up basic plan pricing...')
    const { error: basicError } = await supabase
      .from('pricing_plans')
      .update({
        original_price: 19.99,
        discounted_price: 9.99,
        discount_percentage: 50,
        discount_end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
      })
      .eq('name', 'basic')
    
    if (basicError) {
      console.error('❌ Error updating basic plan:', basicError)
    } else {
      console.log('✅ Basic plan updated with 50% discount')
    }
    
    // Step 3: Update trial pricing
    console.log('🎯 Setting up trial pricing...')
    const { data: trialPlans, error: trialFetchError } = await supabase
      .from('pricing_plans')
      .select('*')
      .eq('plan_type', 'trial')
    
    if (trialFetchError) {
      console.error('❌ Error fetching trial plans:', trialFetchError)
    } else {
      for (const plan of trialPlans || []) {
        const { error: trialUpdateError } = await supabase
          .from('pricing_plans')
          .update({
            original_price: plan.price,
            discounted_price: plan.price
          })
          .eq('id', plan.id)
        
        if (trialUpdateError) {
          console.error('❌ Error updating trial plan:', trialUpdateError)
        }
      }
      console.log('✅ Trial plans updated')
    }
    
    // Step 4: View results
    console.log('📊 Current pricing plans:')
    const { data: results, error: selectError } = await supabase
      .from('pricing_plans')
      .select('name, price, original_price, discounted_price, discount_percentage, currency')
      .order('name')
    
    if (selectError) {
      console.error('❌ Error fetching results:', selectError)
    } else {
      console.table(results)
    }
    
    console.log('✅ Migration completed successfully!')
    
  } catch (error) {
    console.error('❌ Migration failed:', error)
  }
}

migratePricing()