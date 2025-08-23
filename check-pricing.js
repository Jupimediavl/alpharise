// Check current premium pricing
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'https://yzlhipdnqidzkyazdilu.supabase.co'
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl6bGhpcGRucWlkemt5YXpkaWx1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTEwNDA4NiwiZXhwIjoyMDcwNjgwMDg2fQ.QOzIX_s-SxvAfZTIYiVbhPJh6qAaxaG1d13u-u5nAuA'

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function checkPricing() {
  try {
    console.log('🔍 Checking pricing tables...')
    
    // Check pricing_plans table
    const { data: pricingPlans, error: plansError } = await supabase
      .from('pricing_plans')
      .select('*')

    if (plansError) {
      console.error('Error fetching pricing_plans:', plansError)
    } else if (pricingPlans && pricingPlans.length > 0) {
      console.log('📊 Pricing plans found:', pricingPlans)
    } else {
      console.log('📊 No pricing plans found')
    }

    // Check any other pricing-related tables
    const { data: tables, error: tablesError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .like('table_name', '%pric%')

    if (!tablesError && tables) {
      console.log('📋 Tables with "pric" in name:', tables.map(t => t.table_name))
    }

  } catch (error) {
    console.error('❌ Error:', error)
  }
}

checkPricing()