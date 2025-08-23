// Test plan features integration with the plans page logic
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'https://yzlhipdnqidzkyazdilu.supabase.co'
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl6bGhpcGRucWlkemt5YXpkaWx1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTEwNDA4NiwiZXhwIjoyMDcwNjgwMDg2fQ.QOzIX_s-SxvAfZTIYiVbhPJh6qAaxaG1d13u-u5nAuA'

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function testPlanFeaturesIntegration() {
  try {
    console.log('🧪 Testing plan features integration like the plans page...')
    
    // Test the exact query from the plans page
    const { data: features, error: featuresError } = await supabase
      .from('plan_features')
      .select('*')
      .eq('is_enabled', true)
      .in('plan_type', ['trial', 'premium'])
      .order('plan_type')
    
    if (featuresError) {
      console.error('❌ Error loading plan features:', featuresError)
      return
    }

    // Group features by plan type (like in the plans page)
    const trialFeatures = features.filter(f => f.plan_type === 'trial')
    const premiumFeatures = features.filter(f => f.plan_type === 'premium')
    
    console.log('✅ Plan features loaded successfully')
    console.log('')
    
    console.log('🔷 TRIAL PLAN FEATURES (enabled):')
    trialFeatures.forEach((feature, index) => {
      const maxValue = feature.max_value ? ` (max ${feature.max_value})` : ''
      console.log(`  ${index + 1}. ${feature.feature_name}${maxValue}`)
      console.log(`     └── ${feature.feature_description}`)
    })
    
    console.log('')
    console.log('🔷 PREMIUM PLAN FEATURES (enabled):')
    premiumFeatures.forEach((feature, index) => {
      const maxValue = feature.max_value ? ` (up to ${feature.max_value})` : ''
      console.log(`  ${index + 1}. ${feature.feature_name}${maxValue}`)
      console.log(`     └── ${feature.feature_description}`)
    })

    console.log('')
    console.log('📊 FEATURE SUMMARY:')
    console.log(`  Trial: ${trialFeatures.length} features`)
    console.log(`  Premium: ${premiumFeatures.length} features`)
    
    // Test if the data structure matches what the plans page expects
    console.log('')
    console.log('🔍 Data structure validation:')
    console.log('✅ Features have feature_name property:', trialFeatures.every(f => f.feature_name))
    console.log('✅ Features have max_value property:', trialFeatures.every(f => f.hasOwnProperty('max_value')))
    console.log('✅ Features are properly filtered by is_enabled:', trialFeatures.every(f => f.is_enabled))
    
    // Show what the UI would display
    console.log('')
    console.log('🎨 UI DISPLAY PREVIEW:')
    console.log('')
    console.log('TRIAL PLAN FEATURES:')
    trialFeatures.forEach((feature) => {
      const displayText = feature.max_value 
        ? `${feature.feature_name} (max ${feature.max_value})`
        : feature.feature_name
      console.log(`  ✓ ${displayText}`)
    })
    
    console.log('')
    console.log('PREMIUM PLAN FEATURES:')
    premiumFeatures.forEach((feature) => {
      const displayText = feature.max_value 
        ? `${feature.feature_name} (up to ${feature.max_value})`
        : feature.feature_name
      console.log(`  ✓ ${displayText}`)
    })

  } catch (error) {
    console.error('❌ Error:', error)
  }
}

testPlanFeaturesIntegration()