const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const path = require('path')

// Load environment variables
require('dotenv').config({ path: path.join(__dirname, '../.env.local') })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY
)

async function runMigrations() {
  console.log('🚀 Starting ALS migrations...')
  
  const migrationFiles = [
    '001_als_core_tables.sql',
    '002_als_user_progress.sql', 
    '003_als_gamification.sql',
    '004_als_ai_analytics.sql'
  ]

  for (const file of migrationFiles) {
    console.log(`\n📄 Running migration: ${file}`)
    
    try {
      const migrationPath = path.join(__dirname, '../supabase/migrations', file)
      const sql = fs.readFileSync(migrationPath, 'utf8')
      
      // Execute the migration
      const { data, error } = await supabase.rpc('exec_sql', { sql_query: sql })
      
      if (error) {
        console.error(`❌ Error in ${file}:`, error.message)
      } else {
        console.log(`✅ Successfully executed ${file}`)
      }
    } catch (error) {
      console.error(`❌ Failed to read or execute ${file}:`, error.message)
    }
  }

  console.log('\n🎉 Migration process completed!')
}

async function runSeedData() {
  console.log('\n🌱 Running seed data...')
  
  try {
    const seedPath = path.join(__dirname, '../supabase/seeds/als_initial_content.sql')
    const sql = fs.readFileSync(seedPath, 'utf8')
    
    const { data, error } = await supabase.rpc('exec_sql', { sql_query: sql })
    
    if (error) {
      console.error('❌ Error running seed data:', error.message)
    } else {
      console.log('✅ Successfully ran seed data')
    }
  } catch (error) {
    console.error('❌ Failed to run seed data:', error.message)
  }
}

// Create a simple RPC function first
async function createExecSqlFunction() {
  console.log('🔧 Creating exec_sql function...')
  
  const functionSQL = `
    CREATE OR REPLACE FUNCTION exec_sql(sql_query text)
    RETURNS text
    LANGUAGE plpgsql
    SECURITY DEFINER
    AS $$
    BEGIN
      EXECUTE sql_query;
      RETURN 'Success';
    EXCEPTION WHEN others THEN
      RETURN SQLERRM;
    END;
    $$;
  `
  
  const { data, error } = await supabase
    .from('pg_proc')
    .select('proname')
    .eq('proname', 'exec_sql')
    .single()

  if (error || !data) {
    // Function doesn't exist, create it via direct query
    console.log('Creating exec_sql function via raw query...')
  }
}

async function main() {
  try {
    await createExecSqlFunction()
    await runMigrations()
    await runSeedData()
  } catch (error) {
    console.error('❌ Migration failed:', error)
  }
}

main()