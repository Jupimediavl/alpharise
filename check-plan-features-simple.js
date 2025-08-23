// Check plan_features table structure and content - simple version
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'https://yzlhipdnqidzkyazdilu.supabase.co'
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl6bGhpcGRucWlkemt5YXpkaWx1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTEwNDA4NiwiZXhwIjoyMDcwNjgwMDg2fQ.QOzIX_s-SxvAfZTIYiVbhPJh6qAaxaG1d13u-u5nAuA'

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function checkPlanFeaturesSimple() {
  try {
    console.log('🔍 Checking plan_features table...')
    
    // Try to get all features without specifying columns
    const { data: features, error: featuresError } = await supabase
      .from('plan_features')
      .select('*')
      .limit(10)

    if (featuresError) {
      console.error('❌ Error fetching plan features:', featuresError)
      
      // Check what tables exist with "feature" in name
      const { data: tables, error: tablesError } = await supabase
        .from('information_schema.tables')
        .select('table_name')
        .eq('table_schema', 'public')
        .like('table_name', '%feature%')

      if (!tablesError && tables) {
        console.log('📋 Tables with "feature" in name:', tables.map(t => t.table_name))
      } else {
        console.log('📋 No tables found with "feature" in name')
      }
      
      return
    }

    if (!features || features.length === 0) {
      console.log('📭 plan_features table is empty')
      return
    }

    console.log('✅ plan_features table found with data')
    console.log('')
    console.log('📋 Table structure (columns):', Object.keys(features[0]))
    console.log('')
    
    // Display all features
    console.log('📊 ALL PLAN FEATURES:')
    features.forEach((feature, index) => {
      console.log(`${index + 1}. Feature:`)
      Object.keys(feature).forEach(key => {
        console.log(`   ${key}: ${feature[key]}`)
      })
      console.log('')
    })

    // Group by plan_type if column exists
    if (features[0].plan_type) {
      const featuresByPlan = {}
      features.forEach(feature => {
        if (!featuresByPlan[feature.plan_type]) {
          featuresByPlan[feature.plan_type] = []
        }
        featuresByPlan[feature.plan_type].push(feature)
      })

      console.log('📊 FEATURES GROUPED BY PLAN TYPE:')
      Object.keys(featuresByPlan).forEach(planType => {
        console.log(`\n${planType.toUpperCase()} PLAN:`)
        featuresByPlan[planType].forEach(feature => {
          const name = feature.feature_name || feature.name || feature.title || 'Unnamed feature'
          console.log(`  • ${name}`)
        })
      })
    }

  } catch (error) {
    console.error('❌ Error:', error)
  }
}

checkPlanFeaturesSimple()