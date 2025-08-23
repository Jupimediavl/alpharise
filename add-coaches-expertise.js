// Add expertise column to coaches table and update data
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'https://yzlhipdnqidzkyazdilu.supabase.co'
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl6bGhpcGRucWlkemt5YXpkaWx1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTEwNDA4NiwiZXhwIjoyMDcwNjgwMDg2fQ.QOzIX_s-SxvAfZTIYiVbhPJh6qAaxaG1d13u-u5nAuA'

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function addExpertiseColumn() {
  try {
    console.log('🔧 Adding expertise column to coaches table...')
    
    // Add the expertise column
    const { error: alterError } = await supabase
      .rpc('exec_sql', {
        sql: `
          ALTER TABLE coaches 
          ADD COLUMN IF NOT EXISTS expertise VARCHAR(100);
        `
      })

    if (alterError) {
      console.error('❌ Error adding column:', alterError)
      
      // Try alternative method using raw SQL
      console.log('🔄 Trying alternative method...')
      const { error: altError } = await supabase
        .from('coaches')
        .select('expertise')
        .limit(1)
      
      if (altError && altError.message.includes('column "expertise" does not exist')) {
        console.log('⚠️ Column does not exist, will need manual database update')
        console.log('Please run this SQL in your Supabase SQL editor:')
        console.log('ALTER TABLE coaches ADD COLUMN expertise VARCHAR(100);')
        
        // For now, let's proceed with updating data assuming the column will exist
      }
    } else {
      console.log('✅ Column added successfully')
    }

    console.log('📝 Updating coaches with expertise data...')
    
    // Update each coach with their expertise
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

  } catch (error) {
    console.error('❌ Error:', error)
  }
}

addExpertiseColumn()