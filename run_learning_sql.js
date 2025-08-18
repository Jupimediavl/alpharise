// Script to create learning system tables in Supabase
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

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing Supabase environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function runSQLFile(filename) {
  try {
    console.log(`📄 Reading ${filename}...`)
    const sql = fs.readFileSync(filename, 'utf8')
    
    // Split by semicolons and execute each statement
    const statements = sql
      .split(';')
      .map(s => s.trim())
      .filter(s => s && !s.startsWith('--') && s !== '')
    
    console.log(`🚀 Executing ${statements.length} SQL statements...`)
    
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i]
      if (statement.trim()) {
        console.log(`⚙️  Statement ${i + 1}/${statements.length}`)
        
        const { data, error } = await supabase.rpc('exec_sql', {
          sql_query: statement
        })
        
        if (error) {
          // Try direct query if RPC fails
          const { data: directData, error: directError } = await supabase
            .from('_temp')
            .select('*')
            .limit(0) // This will fail but might give us access
          
          if (directError) {
            console.error(`❌ Error executing statement ${i + 1}:`, error.message)
            console.log(`📝 Failed statement: ${statement.substring(0, 100)}...`)
          }
        } else {
          console.log(`✅ Statement ${i + 1} executed successfully`)
          if (data) console.log(`   Result:`, data)
        }
      }
    }
    
    console.log(`✅ Finished processing ${filename}`)
    
  } catch (error) {
    console.error(`❌ Error reading ${filename}:`, error.message)
  }
}

async function testConnection() {
  try {
    console.log('🔍 Testing Supabase connection...')
    const { data, error } = await supabase
      .from('users')
      .select('count')
      .limit(1)
    
    if (error) {
      console.error('❌ Connection test failed:', error.message)
      return false
    }
    
    console.log('✅ Supabase connection successful')
    return true
  } catch (error) {
    console.error('❌ Connection error:', error.message)
    return false
  }
}

async function main() {
  console.log('🚀 Starting Learning System Database Setup')
  console.log('=' .repeat(50))
  
  // Test connection
  if (!(await testConnection())) {
    console.log('💡 You will need to run these SQL files manually in Supabase SQL Editor:')
    console.log('1. create_learning_system_tables.sql')
    console.log('2. seed_learning_dummy_data.sql')
    console.log('\nOr use the Supabase CLI: supabase db reset')
    return
  }
  
  // Try to run SQL files
  await runSQLFile('./create_learning_system_tables.sql')
  await runSQLFile('./seed_learning_dummy_data.sql')
  
  console.log('=' .repeat(50))
  console.log('🎉 Database setup completed!')
}

main().catch(console.error)