// Test coaches functionality
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'https://yzlhipdnqidzkyazdilu.supabase.co'
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl6bGhpcGRucWlkemt5YXpkaWx1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTEwNDA4NiwiZXhwIjoyMDcwNjgwMDg2fQ.QOzIX_s-SxvAfZTIYiVbhPJh6qAaxaG1d13u-u5nAuA'

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function testCoaches() {
  try {
    console.log('🧪 Testing coaches table...')
    
    // Test reading from coaches table
    const { data: coaches, error: coachesError } = await supabase
      .from('coaches')
      .select('*')
    
    if (coachesError) {
      console.error('❌ Error reading coaches:', coachesError)
      return
    }
    
    console.log('✅ Successfully read coaches:')
    coaches.forEach(coach => {
      console.log(`  - ${coach.id}: ${coach.name} ${coach.icon}`)
    })
    
    // Test getting specific coach
    const { data: knox, error: knoxError } = await supabase
      .from('coaches')
      .select('*')
      .eq('id', 'knox')
      .single()
    
    if (knoxError) {
      console.error('❌ Error getting Knox:', knoxError)
    } else {
      console.log('✅ Knox data:', knox)
    }
    
  } catch (error) {
    console.error('Unexpected error:', error)
  }
}

testCoaches()