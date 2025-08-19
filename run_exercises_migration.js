// Run the exercises migration on Supabase
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
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function runMigration() {
  console.log('🔄 Starting Solutions → Exercises Migration...')
  console.log('=' .repeat(50))
  
  try {
    // Step 1: Rename the solutions table to exercises
    console.log('📋 Step 1: Renaming solutions table to exercises...')
    let { data, error } = await supabase.rpc('exec_sql', {
      sql: 'ALTER TABLE solutions RENAME TO exercises;'
    })
    if (error && !error.message.includes('already exists')) {
      console.log('❌ Error renaming solutions table:', error.message)
    } else {
      console.log('✅ Solutions table renamed to exercises')
    }

    // Step 2: Rename columns in problems table
    console.log('📋 Step 2: Renaming columns in problems table...')
    const result2 = await supabase.rpc('exec_sql', {
      sql: 'ALTER TABLE problems RENAME COLUMN total_solutions TO total_exercises;'
    })
    if (result2.error && !result2.error.message.includes('does not exist')) {
      console.log('❌ Error renaming problems columns:', result2.error.message)
    } else {
      console.log('✅ Problems table columns renamed')
    }

    // Step 3: Rename user_solution_progress table
    console.log('📋 Step 3: Renaming user_solution_progress to user_exercise_progress...')
    const result3 = await supabase.rpc('exec_sql', {
      sql: 'ALTER TABLE user_solution_progress RENAME TO user_exercise_progress;'
    })
    if (result3.error && !result3.error.message.includes('already exists')) {
      console.log('❌ Error renaming user progress table:', result3.error.message)
    } else {
      console.log('✅ User progress table renamed')
    }

    // Step 4: Rename columns in user_exercise_progress
    console.log('📋 Step 4: Renaming columns in user_exercise_progress...')
    const result4 = await supabase.rpc('exec_sql', {
      sql: 'ALTER TABLE user_exercise_progress RENAME COLUMN solution_id TO exercise_id;'
    })
    if (result4.error && !result4.error.message.includes('does not exist')) {
      console.log('❌ Error renaming user progress columns:', result4.error.message)
    } else {
      console.log('✅ User progress columns renamed')
    }

    // Step 5: Update indexes
    console.log('📋 Step 5: Updating indexes...')
    const indexQueries = [
      'DROP INDEX IF EXISTS idx_solutions_problem_id;',
      'DROP INDEX IF EXISTS idx_solutions_difficulty;',
      'DROP INDEX IF EXISTS idx_user_progress_user_id;',
      'DROP INDEX IF EXISTS idx_user_progress_status;',
      'CREATE INDEX IF NOT EXISTS idx_exercises_problem_id ON exercises(problem_id, order_index);',
      'CREATE INDEX IF NOT EXISTS idx_exercises_difficulty ON exercises(difficulty);',
      'CREATE INDEX IF NOT EXISTS idx_user_exercise_progress_user_id ON user_exercise_progress(user_id);',
      'CREATE INDEX IF NOT EXISTS idx_user_exercise_progress_status ON user_exercise_progress(user_id, status);'
    ]

    for (const query of indexQueries) {
      const result = await supabase.rpc('exec_sql', { sql: query })
      if (result.error) {
        console.log(`⚠️  Index query warning: ${result.error.message}`)
      }
    }
    console.log('✅ Indexes updated')

    // Step 6: Update dummy data text
    console.log('📋 Step 6: Updating dummy data text...')
    const result6 = await supabase.rpc('exec_sql', {
      sql: `UPDATE exercises SET 
        title = REPLACE(title, 'Solution', 'Exercise'),
        description = REPLACE(description, 'solution', 'exercise');`
    })
    if (result6.error) {
      console.log('❌ Error updating dummy data:', result6.error.message)
    } else {
      console.log('✅ Dummy data text updated')
    }

    console.log('')
    console.log('🎉 Migration completed successfully!')
    console.log('✅ Solutions → Exercises migration is complete')
    
  } catch (error) {
    console.error('❌ Migration failed:', error)
  }
}

runMigration().catch(console.error)