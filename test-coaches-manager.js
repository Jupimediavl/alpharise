// Test coaches using SupabaseCoachManager.getAllCoaches() method
// This script uses the existing SupabaseCoachManager class to query coach data

const { createClient } = require('@supabase/supabase-js')

// Supabase configuration (using the correct API keys)
const supabaseUrl = 'https://yzlhipdnqidzkyazdilu.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl6bGhpcGRucWlkemt5YXpkaWx1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUxMDQwODYsImV4cCI6MjA3MDY4MDA4Nn0.eUDjQv9ZixgwkbRHhIHDT25s92SU3kMIbRJmPOWCQEM'

const supabase = createClient(supabaseUrl, supabaseAnonKey)

// SupabaseCoachManager class (simplified version for Node.js testing)
class SupabaseCoachManager {
  static async getAllCoaches() {
    try {
      const { data, error } = await supabase
        .from('coaches')
        .select('*')
        .order('created_at', { ascending: true })
      
      if (error) {
        console.error('Error getting coaches:', error)
        return []
      }
      
      return data || []
    } catch (error) {
      console.error('Error in getAllCoaches:', error)
      return []
    }
  }

  static async getCoachById(coachId) {
    try {
      const { data, error } = await supabase
        .from('coaches')
        .select('*')
        .eq('id', coachId)
        .single()
      
      if (error && error.code !== 'PGRST116') {
        console.error('Error getting coach:', error)
        return null
      }
      
      return data
    } catch (error) {
      console.error('Error in getCoachById:', error)
      return null
    }
  }
}

async function testCoachManager() {
  try {
    console.log('🧪 Testing SupabaseCoachManager.getAllCoaches() method...')
    console.log('📋 Fetching all coaches from database...\n')
    
    // Use the getAllCoaches method
    const coaches = await SupabaseCoachManager.getAllCoaches()
    
    if (coaches.length === 0) {
      console.log('⚠️  No coaches found in database')
      return
    }
    
    console.log(`✅ Successfully retrieved ${coaches.length} coaches:\n`)
    
    // Display coach data in a formatted way
    coaches.forEach((coach, index) => {
      console.log(`${index + 1}. Coach: ${coach.name} (${coach.id})`)
      console.log(`   Icon: ${coach.icon}`)
      console.log(`   Description: ${coach.description}`)
      
      if (coach.title) {
        console.log(`   Title: ${coach.title}`)
      }
      
      if (coach.helpsWith) {
        console.log(`   Helps With: ${coach.helpsWith}`)
      }
      
      if (coach.userTypeProblem) {
        console.log(`   User Type Problem: ${coach.userTypeProblem}`)
      }
      
      if (coach.personalMessage) {
        console.log(`   Personal Message: ${coach.personalMessage}`)
      }
      
      if (coach.coachStyle) {
        console.log(`   Coaching Style: ${coach.coachStyle}`)
      }
      
      if (coach.color) {
        console.log(`   Color: ${coach.color}`)
      }
      
      if (coach.features && coach.features.length > 0) {
        console.log(`   Features: ${coach.features.join(', ')}`)
      }
      
      console.log(`   Created: ${new Date(coach.created_at).toLocaleDateString()}`)
      console.log('   ' + '─'.repeat(50))
    })
    
    console.log('\n🔍 Testing individual coach retrieval...')
    
    // Test getting a specific coach (Logan as example)
    const logan = await SupabaseCoachManager.getCoachById('logan')
    if (logan) {
      console.log(`✅ Successfully retrieved Logan: ${logan.name}`)
      console.log(`   ${logan.description}`)
    } else {
      console.log('⚠️  Logan coach not found')
    }
    
    // Display summary statistics
    console.log('\n📊 Coach Statistics:')
    console.log(`   Total Coaches: ${coaches.length}`)
    
    const coachTypes = coaches.map(c => c.id).join(', ')
    console.log(`   Coach IDs: ${coachTypes}`)
    
    const hasExtendedInfo = coaches.filter(c => c.title || c.helpsWith || c.personalMessage).length
    console.log(`   Coaches with Extended Info: ${hasExtendedInfo}/${coaches.length}`)
    
    const withFeatures = coaches.filter(c => c.features && c.features.length > 0).length
    console.log(`   Coaches with Features: ${withFeatures}/${coaches.length}`)
    
  } catch (error) {
    console.error('❌ Unexpected error in testCoachManager:', error)
  }
}

// Run the test
console.log('🚀 Starting Coach Manager Test')
console.log('=' .repeat(60))
testCoachManager().then(() => {
  console.log('=' .repeat(60))
  console.log('✅ Coach Manager Test Completed')
}).catch(error => {
  console.error('💥 Test failed:', error)
  process.exit(1)
})