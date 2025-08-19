const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'https://yzlhipdnqidzkyazdilu.supabase.co'
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl6bGhpcGRucWlkemt5YXpkaWx1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTEwNDA4NiwiZXhwIjoyMDcwNjgwMDg2fQ.QOzIX_s-SxvAfZTIYiVbhPJh6qAaxaG1d13u-u5nAuA'

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function checkExercisesTable() {
  console.log('🔍 Checking exercises table...')
  
  try {
    // First, try to get one exercise to see structure
    const { data, error } = await supabase
      .from('exercises')
      .select('*')
      .limit(1)
    
    if (error) {
      console.error('❌ Error accessing exercises table:', error)
      return
    }
    
    if (data && data.length > 0) {
      console.log('✅ Exercises table exists')
      console.log('📋 Columns:', Object.keys(data[0]))
      console.log('📄 Sample exercise:', data[0])
    } else {
      console.log('⚠️ Table exists but is empty')
    }
    
    // Check total count
    const { count, error: countError } = await supabase
      .from('exercises')
      .select('*', { count: 'exact', head: true })
    
    if (countError) {
      console.error('❌ Error counting exercises:', countError)
    } else {
      console.log(`📊 Total exercises: ${count}`)
    }
    
    // Try a simple update on a specific exercise to test permissions
    const { data: updateTest, error: updateError } = await supabase
      .from('exercises')
      .select('id')
      .limit(1)
    
    if (updateTest && updateTest.length > 0) {
      console.log('🧪 Testing update permissions...')
      const testId = updateTest[0].id
      
      const { data: updateResult, error: updateTestError } = await supabase
        .from('exercises')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', testId)
        .select()
        .single()
      
      if (updateTestError) {
        console.error('❌ Update test failed:', updateTestError)
      } else {
        console.log('✅ Update permissions working')
      }
    }
    
  } catch (error) {
    console.error('❌ Failed:', error)
  }
}

checkExercisesTable()