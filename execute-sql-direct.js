// Execute SQL directly to add expertise column
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'https://yzlhipdnqidzkyazdilu.supabase.co'
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl6bGhpcGRucWlkemt5YXpkaWx1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTEwNDA4NiwiZXhwIjoyMDcwNjgwMDg2fQ.QOzIX_s-SxvAfZTIYiVbhPJh6qAaxaG1d13u-u5nAuA'

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function executeSQL() {
  try {
    console.log('🔧 Executing SQL to add expertise column...')
    
    // Try to execute the ALTER TABLE command using the query method
    const { data, error } = await supabase
      .from('coaches')
      .select('*')
      .limit(1)
    
    // Check if we can access coaches table first
    if (error) {
      console.error('❌ Cannot access coaches table:', error)
      return
    }
    
    console.log('✅ Can access coaches table')
    
    // Since we cannot execute DDL statements through the API, let's check if we can manually add data
    // by trying to insert a record with expertise field
    console.log('🧪 Testing if expertise column exists by trying to insert...')
    
    // First, let's check current structure
    const { data: currentCoaches, error: fetchError } = await supabase
      .from('coaches')
      .select('*')
      .limit(1)
    
    if (fetchError) {
      console.error('❌ Error fetching coaches:', fetchError)
      return
    }
    
    console.log('📊 Current coach structure:', Object.keys(currentCoaches[0]))
    
    // Check if expertise column exists
    if (currentCoaches[0].hasOwnProperty('expertise')) {
      console.log('✅ Expertise column already exists')
      await updateExpertiseData()
    } else {
      console.log('❌ Expertise column does not exist')
      console.log('')
      console.log('📋 Please run this SQL manually in your Supabase SQL Editor:')
      console.log('')
      console.log('-- Add expertise column to coaches table')
      console.log('ALTER TABLE coaches ADD COLUMN expertise VARCHAR(100);')
      console.log('')
      console.log('-- Update coaches with their expertise')
      console.log("UPDATE coaches SET expertise = 'Premature Ejaculation' WHERE id = 'chase';")
      console.log("UPDATE coaches SET expertise = 'Performance Anxiety' WHERE id = 'blake';")
      console.log("UPDATE coaches SET expertise = 'Intimacy & Communication' WHERE id = 'knox';")
      console.log("UPDATE coaches SET expertise = 'Approach Anxiety' WHERE id = 'logan';")
      console.log("UPDATE coaches SET expertise = 'Erectile Dysfunction' WHERE id = 'mason';")
      console.log('')
      console.log('📋 Then run this script again to verify')
    }
    
  } catch (error) {
    console.error('❌ Error:', error)
  }
}

async function updateExpertiseData() {
  console.log('📝 Updating coaches with expertise data...')
  
  const updates = [
    { id: 'chase', expertise: 'Premature Ejaculation' },
    { id: 'blake', expertise: 'Performance Anxiety' },
    { id: 'knox', expertise: 'Intimacy & Communication' },
    { id: 'logan', expertise: 'Approach Anxiety' },
    { id: 'mason', expertise: 'Erectile Dysfunction' }
  ]

  for (const update of updates) {
    const { error: updateError } = await supabase
      .from('coaches')
      .update({ expertise: update.expertise })
      .eq('id', update.id)

    if (updateError) {
      console.error(`❌ Error updating ${update.id}:`, updateError)
    } else {
      console.log(`✅ Updated ${update.id} with expertise: ${update.expertise}`)
    }
  }

  // Verify the updates
  console.log('🔍 Verifying updates...')
  const { data: coaches, error: fetchError } = await supabase
    .from('coaches')
    .select('id, name, expertise')

  if (fetchError) {
    console.error('❌ Error fetching coaches:', fetchError)
  } else {
    console.log('📊 Updated coaches data:')
    coaches.forEach(coach => {
      console.log(`  ${coach.id}: ${coach.name} - ${coach.expertise || 'No expertise set'}`)
    })
  }
}

executeSQL()