// Test if we can create users without avatar_type
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'https://yzlhipdnqidzkyazdilu.supabase.co'
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl6bGhpcGRucWlkemt5YXpkaWx1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTEwNDA4NiwiZXhwIjoyMDcwNjgwMDg2fQ.QOzIX_s-SxvAfZTIYiVbhPJh6qAaxaG1d13u-u5nAuA'

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function testWithoutAvatarType() {
  try {
    console.log('🧪 Testing user creation WITHOUT avatar_type...')
    
    const testUser = {
      username: 'test_no_avatar_' + Date.now(),
      email: 'test_no_avatar@example.com',
      user_type: 'updown',
      coach: 'blake',
      age: 28,
      coins: 200,
      streak: 1,
      level: 1,
      total_earned: 0,
      monthly_earnings: 0,
      discount_earned: 0,
      subscription_type: 'trial',
      trial_days_left: 7,
      confidence_score: 32,
      experience: 150,
      badges: [],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      last_active: new Date().toISOString()
    }
    
    console.log('📝 Attempting insert without avatar_type...')
    
    const { data: newUser, error: insertError } = await supabase
      .from('users')
      .insert(testUser)
      .select()
      .single()
    
    if (insertError) {
      console.error('❌ Insert failed:', insertError)
      console.error('This means avatar_type is still required in DB')
      return false
    } else {
      console.log('✅ SUCCESS! User created without avatar_type:')
      console.log(`  - username: ${newUser.username}`)
      console.log(`  - user_type: ${newUser.user_type}`)
      console.log(`  - coach: ${newUser.coach}`)
      console.log(`  - age: ${newUser.age}`)
      console.log(`  - confidence_score: ${newUser.confidence_score}`)
      
      // Clean up
      await supabase.from('users').delete().eq('id', newUser.id)
      console.log('🧹 Test user cleaned up')
      return true
    }
    
  } catch (error) {
    console.error('❌ Unexpected error:', error)
    return false
  }
}

testWithoutAvatarType().then(success => {
  if (success) {
    console.log('\n🎉 READY TO DROP COLUMN!')
    console.log('You can safely run this SQL in Supabase:')
    console.log('ALTER TABLE users DROP COLUMN avatar_type;')
  } else {
    console.log('\n⚠️ NOT READY - avatar_type is still needed')
    console.log('Check the error above to see what needs fixing')
  }
})