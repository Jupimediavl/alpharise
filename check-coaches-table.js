// Check if coaches table exists in database
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'https://yzlhipdnqidzkyazdilu.supabase.co'
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl6bGhpcGRucWlkemt5YXpkaWx1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTEwNDA4NiwiZXhwIjoyMDcwNjgwMDg2fQ.QOzIX_s-SxvAfZTIYiVbhPJh6qAaxaG1d13u-u5nAuA'

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function checkCoachesTable() {
  try {
    console.log('🔍 Checking for coaches table...')
    
    // Try to fetch from coaches table
    const { data: coaches, error: coachesError } = await supabase
      .from('coaches')
      .select('*')

    if (coachesError) {
      console.log('❌ Coaches table does not exist or has error:', coachesError.message)
    } else if (coaches && coaches.length > 0) {
      console.log('✅ Coaches table found with data:', coaches)
      return
    } else {
      console.log('📭 Coaches table exists but is empty')
    }

    // Check all tables with "coach" in name
    const { data: tables, error: tablesError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .like('table_name', '%coach%')

    if (!tablesError && tables && tables.length > 0) {
      console.log('📋 Tables containing "coach":', tables.map(t => t.table_name))
    } else {
      console.log('📋 No tables found with "coach" in name')
    }

  } catch (error) {
    console.error('❌ Error:', error)
  }
}

checkCoachesTable()