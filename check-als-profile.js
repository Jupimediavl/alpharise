// Check ALS profile for ramon user
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'https://yzlhipdnqidzkyazdilu.supabase.co'
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl6bGhpcGRucWlkemt5YXpkaWx1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTEwNDA4NiwiZXhwIjoyMDcwNjgwMDg2fQ.QOzIX_s-SxvAfZTIYiVbhPJh6qAaxaG1d13u-u5nAuA'

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function checkALSProfile() {
  try {
    console.log('🔍 Checking ALS profile for ramon...')
    
    // Find the user first
    const { data: users } = await supabase
      .from('users')
      .select('id, username, coach')
      .eq('username', 'ramon')
    
    if (!users || users.length === 0) {
      console.log('❌ User not found')
      return
    }

    const user = users[0]
    console.log('👤 User:', { id: user.id, username: user.username, coach: user.coach })

    // Check ALS profile
    const { data: alsProfile, error } = await supabase
      .from('user_learning_profiles')
      .select('*')
      .eq('user_id', user.id)

    if (error) {
      console.error('❌ Error checking ALS profile:', error)
      return
    }

    if (!alsProfile || alsProfile.length === 0) {
      console.log('📝 No ALS profile found - this explains why modal should show')
      console.log('User should see problem confirmation modal with detected problem: premature_ejaculation')
      return
    }

    const profile = alsProfile[0]
    console.log('📊 ALS Profile found:', {
      id: profile.id,
      coach_id: profile.coach_id,
      assessment_data: profile.assessment_data,
      created_at: profile.created_at
    })

    // If profile exists but has wrong data, update it
    if (profile.coach_id !== 'chase') {
      console.log(`🔧 Fixing coach_id from "${profile.coach_id}" to "chase"`)
      
      const { error: updateError } = await supabase
        .from('user_learning_profiles')
        .update({
          coach_id: 'chase',
          assessment_data: {
            ...profile.assessment_data,
            primary_problem: 'premature_ejaculation',
            coach: 'chase'
          }
        })
        .eq('id', profile.id)

      if (updateError) {
        console.error('❌ Error updating profile:', updateError)
      } else {
        console.log('✅ ALS profile updated successfully!')
      }
    }

  } catch (error) {
    console.error('❌ Unexpected error:', error)
  }
}

checkALSProfile()