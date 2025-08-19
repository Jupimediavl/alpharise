// Test if learning tables exist in Supabase
const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')

// Load environment variables manually
function loadEnvVars() {
  try {
    const envContent = fs.readFileSync('.env.local', 'utf8')
    const lines = envContent.split('\n')
    
    for (const line of lines) {
      const [key, value] = line.split('=')
      if (key && value) {
        process.env[key.trim()] = value.trim()
      }
    }
  } catch (error) {
    console.log('Could not load .env.local, using existing environment variables')
  }
}

loadEnvVars()

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function testTables() {
  console.log('🔍 Testing Learning System Tables...')
  console.log('=' .repeat(50))
  
  const tables = [
    { name: 'problems', description: 'Problems table' },
    { name: 'solutions', description: 'Solutions table' },
    { name: 'milestones', description: 'Milestones table' },
    { name: 'user_solution_progress', description: 'User progress table' }
  ]
  
  for (const table of tables) {
    try {
      console.log(`📋 Testing ${table.description}...`)
      
      const { data, error } = await supabase
        .from(table.name)
        .select('count')
        .limit(1)
      
      if (error) {
        console.log(`❌ ${table.description}: ${error.message}`)
        if (error.message.includes('does not exist')) {
          console.log(`   💡 Table "${table.name}" needs to be created`)
        }
      } else {
        console.log(`✅ ${table.description}: Table exists`)
        
        // Count records
        const { count } = await supabase
          .from(table.name)
          .select('*', { count: 'exact', head: true })
        
        console.log(`   📊 Records: ${count || 0}`)
      }
    } catch (err) {
      console.log(`❌ ${table.description}: ${err.message}`)
    }
    
    console.log('')
  }
  
  console.log('=' .repeat(50))
  console.log('📋 NEXT STEPS:')
  console.log('1. Go to Supabase Dashboard → SQL Editor')
  console.log('2. Run: create_learning_system_tables.sql')
  console.log('3. Run: seed_learning_dummy_data.sql')
  console.log('4. Then test the learning system again')
}

testTables().catch(console.error)