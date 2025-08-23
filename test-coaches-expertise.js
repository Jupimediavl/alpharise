// Test loading coaches with expertise fallback
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'https://yzlhipdnqidzkyazdilu.supabase.co'
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl6bGhpcGRucWlkemt5YXpkaWx1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTEwNDA4NiwiZXhwIjoyMDcwNjgwMDg2fQ.QOzIX_s-SxvAfZTIYiVbhPJh6qAaxaG1d13u-u5nAuA'

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function testCoachesLoad() {
  try {
    console.log('🧪 Testing coaches loading with expertise query...')
    
    // Try the exact query from the component
    const { data: coachesData, error } = await supabase
      .from('coaches')
      .select('id, name, description, expertise, icon, features, created_at')
      .order('id')

    if (error) {
      console.error('❌ Error loading coaches:', error)
      
      // Try without expertise column
      console.log('🔄 Trying without expertise column...')
      const { data: fallbackData, error: fallbackError } = await supabase
        .from('coaches')
        .select('id, name, description, icon, features, created_at')
        .order('id')
      
      if (fallbackError) {
        console.error('❌ Fallback query also failed:', fallbackError)
        return
      }
      
      console.log('✅ Fallback query successful')
      console.log('📊 Coaches data (without expertise):')
      fallbackData.forEach(coach => {
        console.log(`  ${coach.id}: ${coach.name}`)
      })
      
      return
    }

    console.log('✅ Query successful with expertise column!')
    console.log('📊 Coaches data:')
    coachesData.forEach(coach => {
      console.log(`  ${coach.id}: ${coach.name} - ${coach.expertise || 'No expertise'}`)
    })

    // Test the mapping logic
    console.log('')
    console.log('🔄 Testing expertise mapping logic...')
    const mergedCoaches = coachesData.map(dbCoach => {
      // Use expertise from database if available, otherwise fallback to mapping
      let expertise = dbCoach.expertise
      
      if (!expertise) {
        // Fallback mapping if expertise column doesn't exist yet
        const expertiseMapping = {
          'chase': 'Premature Ejaculation',
          'blake': 'Performance Anxiety',
          'knox': 'Intimacy & Communication',  
          'logan': 'Approach Anxiety',
          'mason': 'Erectile Dysfunction'
        }
        expertise = expertiseMapping[dbCoach.id] || 'Personal Development'
      }
      
      return {
        id: dbCoach.id,
        name: dbCoach.name,
        problem: expertise,
        description: dbCoach.description
      }
    })

    console.log('📊 Final merged data with expertise:')
    mergedCoaches.forEach(coach => {
      console.log(`  ${coach.id}: ${coach.name} - ${coach.problem}`)
    })

  } catch (error) {
    console.error('❌ Error:', error)
  }
}

testCoachesLoad()