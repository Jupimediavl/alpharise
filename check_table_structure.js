const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'https://yzlhipdnqidzkyazdilu.supabase.co'
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl6bGhpcGRucWlkemt5YXpkaWx1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTEwNDA4NiwiZXhwIjoyMDcwNjgwMDg2fQ.QOzIX_s-SxvAfZTIYiVbhPJh6qAaxaG1d13u-u5nAuA'

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function checkTableStructure() {
  console.log('🔍 Checking pricing_plans table structure...')
  
  try {
    // Get current pricing plans to see existing columns
    const { data, error } = await supabase
      .from('pricing_plans')
      .select('*')
      .limit(1)
    
    if (error) {
      console.error('❌ Error:', error)
    } else {
      console.log('📋 Current table structure (sample row):')
      if (data && data.length > 0) {
        console.log('Columns:', Object.keys(data[0]))
        console.log('Sample data:', data[0])
      } else {
        console.log('No data found in table')
      }
    }
    
    // Also try to get all plans
    const { data: allPlans, error: allError } = await supabase
      .from('pricing_plans')
      .select('*')
    
    if (allError) {
      console.error('❌ Error getting all plans:', allError)
    } else {
      console.log('\n📊 All pricing plans:')
      console.table(allPlans)
    }
    
  } catch (error) {
    console.error('❌ Failed:', error)
  }
}

checkTableStructure()