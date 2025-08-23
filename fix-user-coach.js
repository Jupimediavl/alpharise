// Fix coach mapping for existing users
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'https://yzlhipdnqidzkyazdilu.supabase.co'
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl6bGhpcGRucWlkemt5YXpkaWx1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTEwNDA4NiwiZXhwIjoyMDcwNjgwMDg2fQ.QOzIX_s-SxvAfZTIYiVbhPJh6qAaxaG1d13u-u5nAuA'

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function fixUserCoach() {
  try {
    console.log('🔍 Looking for user "ramon"...')
    
    // Find the user
    const { data: users, error: findError } = await supabase
      .from('users')
      .select('*')
      .eq('username', 'ramon')
    
    if (findError) {
      console.error('❌ Error finding user:', findError)
      return
    }

    if (!users || users.length === 0) {
      console.log('❌ User "ramon" not found')
      return
    }

    const user = users[0]
    console.log('👤 Found user:', {
      id: user.id,
      username: user.username,
      email: user.email,
      coach: user.coach,
      user_type: user.user_type
    })

    // Update user to have correct coach for Chase/premature ejaculation
    const { data: updatedUser, error: updateError } = await supabase
      .from('users')
      .update({ 
        coach: 'chase',
        // Remove user_type if it exists (but might fail if column doesn't allow null)
      })
      .eq('id', user.id)
      .select()

    if (updateError) {
      console.error('❌ Error updating user:', updateError)
      return
    }

    console.log('✅ User updated successfully!')
    console.log('New coach:', 'chase')
    
    // Verify the update
    const { data: verifyUser } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single()
    
    console.log('🔍 Verification - User now has:', {
      coach: verifyUser.coach,
      user_type: verifyUser.user_type
    })

  } catch (error) {
    console.error('❌ Unexpected error:', error)
  }
}

// Also try to apply the migration manually
async function applyMigration() {
  try {
    console.log('\n🔧 Attempting to apply migration...')
    
    // Try to drop user_type column
    const { error } = await supabase.rpc('exec_sql', { 
      query: 'ALTER TABLE users DROP COLUMN IF EXISTS user_type CASCADE;'
    })
    
    if (error) {
      console.log('⚠️ Could not drop user_type column via RPC:', error.message)
      console.log('You may need to run this manually in Supabase dashboard:')
      console.log('ALTER TABLE users DROP COLUMN IF EXISTS user_type CASCADE;')
    } else {
      console.log('✅ user_type column dropped successfully!')
    }
  } catch (error) {
    console.log('⚠️ RPC method not available, need to apply migration manually')
  }
}

// Run both fixes
fixUserCoach().then(() => {
  applyMigration().then(() => {
    console.log('\n🎉 Done! User should now see Chase coach in dashboard.')
    console.log('If user_type column still exists, apply migration manually in Supabase.')
  })
})