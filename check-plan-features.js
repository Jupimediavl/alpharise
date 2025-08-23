// Check plan_features table structure and content
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'https://yzlhipdnqidzkyazdilu.supabase.co'
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl6bGhpcGRucWlkemt5YXpkaWx1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTEwNDA4NiwiZXhwIjoyMDcwNjgwMDg2fQ.QOzIX_s-SxvAfZTIYiVbhPJh6qAaxaG1d13u-u5nAuA'

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function checkPlanFeatures() {
  try {
    console.log('🔍 Checking plan_features table...')
    
    // Check if plan_features table exists and get all features
    const { data: features, error: featuresError } = await supabase
      .from('plan_features')
      .select('*')
      .order('plan_type', { ascending: true })
      .order('display_order', { ascending: true })

    if (featuresError) {
      console.error('❌ Error fetching plan features:', featuresError)
      
      // Check if table exists
      const { data: tables, error: tablesError } = await supabase
        .from('information_schema.tables')
        .select('table_name')
        .eq('table_schema', 'public')
        .like('table_name', '%feature%')

      if (!tablesError && tables) {
        console.log('📋 Tables with "feature" in name:', tables.map(t => t.table_name))
      }
      
      return
    }

    if (!features || features.length === 0) {
      console.log('📭 No features found in plan_features table')
      return
    }

    console.log('✅ plan_features table found with data')
    console.log('')
    
    // Group features by plan_type
    const featuresByPlan = {}
    features.forEach(feature => {
      if (!featuresByPlan[feature.plan_type]) {
        featuresByPlan[feature.plan_type] = []
      }
      featuresByPlan[feature.plan_type].push(feature)
    })

    // Display features by plan
    Object.keys(featuresByPlan).forEach(planType => {
      console.log(`📊 ${planType.toUpperCase()} PLAN FEATURES:`)
      featuresByPlan[planType].forEach((feature, index) => {
        console.log(`  ${index + 1}. ${feature.feature_name || feature.name || feature.title}`)
        if (feature.description) {
          console.log(`     └── ${feature.description}`)
        }
        console.log(`     └── Order: ${feature.display_order || 'N/A'}, Active: ${feature.is_active !== false}`)
      })
      console.log('')
    })

    // Check current plans page structure (how features are currently defined)
    console.log('🔍 Current plans page has hardcoded features. Need to replace with database features.')
    
    // Show structure of features table
    console.log('📋 plan_features table structure:')
    if (features.length > 0) {
      console.log('Sample feature record:', Object.keys(features[0]))
    }

  } catch (error) {
    console.error('❌ Error:', error)
  }
}

checkPlanFeatures()