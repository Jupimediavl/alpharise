// Get all plan features to see the complete structure
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'https://yzlhipdnqidzkyazdilu.supabase.co'
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl6bGhpcGRucWlkemt5YXpkaWx1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTEwNDA4NiwiZXhwIjoyMDcwNjgwMDg2fQ.QOzIX_s-SxvAfZTIYiVbhPJh6qAaxaG1d13u-u5nAuA'

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function getAllPlanFeatures() {
  try {
    console.log('🔍 Getting ALL plan features...')
    
    // Get all features without limit
    const { data: features, error: featuresError } = await supabase
      .from('plan_features')
      .select('*')
      .order('plan_type')

    if (featuresError) {
      console.error('❌ Error fetching plan features:', featuresError)
      return
    }

    // Group by plan_type
    const featuresByPlan = {}
    features.forEach(feature => {
      if (!featuresByPlan[feature.plan_type]) {
        featuresByPlan[feature.plan_type] = []
      }
      featuresByPlan[feature.plan_type].push(feature)
    })

    console.log('📊 ALL FEATURES GROUPED BY PLAN TYPE:')
    console.log('')
    
    Object.keys(featuresByPlan).forEach(planType => {
      console.log(`🔷 ${planType.toUpperCase()} PLAN (${featuresByPlan[planType].length} features):`)
      featuresByPlan[planType].forEach((feature, index) => {
        const status = feature.is_enabled ? '✅' : '❌'
        const maxValue = feature.max_value ? ` (max: ${feature.max_value})` : ''
        console.log(`  ${index + 1}. ${status} ${feature.feature_name}${maxValue}`)
        console.log(`     └── ${feature.feature_description}`)
        console.log(`     └── Key: ${feature.feature_key}`)
      })
      console.log('')
    })

    // Count by plan type
    console.log('📊 FEATURE COUNT BY PLAN:')
    Object.keys(featuresByPlan).forEach(planType => {
      const enabledCount = featuresByPlan[planType].filter(f => f.is_enabled).length
      const totalCount = featuresByPlan[planType].length
      console.log(`  ${planType.toUpperCase()}: ${enabledCount}/${totalCount} features enabled`)
    })

    // Show basic plan features to delete
    if (featuresByPlan['basic']) {
      console.log('')
      console.log('🗑️  BASIC PLAN FEATURES TO DELETE:')
      featuresByPlan['basic'].forEach(feature => {
        console.log(`  - ${feature.feature_name} (ID: ${feature.id})`)
      })
    }

  } catch (error) {
    console.error('❌ Error:', error)
  }
}

getAllPlanFeatures()