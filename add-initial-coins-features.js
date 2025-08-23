// Add initial coins features to plan_features table
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'https://yzlhipdnqidzkyazdilu.supabase.co'
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl6bGhpcGRucWlkemt5YXpkaWx1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTEwNDA4NiwiZXhwIjoyMDcwNjgwMDg2fQ.QOzIX_s-SxvAfZTIYiVbhPJh6qAaxaG1d13u-u5nAuA'

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function addInitialCoinsFeatures() {
  try {
    console.log('💰 Adding initial coins features to plan_features table...')
    
    // Feature for Trial plan
    const trialFeature = {
      plan_type: 'trial',
      feature_key: 'initial_coins',
      feature_name: 'Welcome Coins',
      feature_description: '5 coins to get started in the community',
      max_value: 5,
      is_enabled: true
    }
    
    // Feature for Premium plan
    const premiumFeature = {
      plan_type: 'premium',
      feature_key: 'initial_coins',
      feature_name: 'Premium Welcome Bonus',
      feature_description: '100 coins for community engagement (20x more than Trial)',
      max_value: 100,
      is_enabled: true
    }
    
    // Insert trial feature
    console.log('📝 Adding trial initial coins feature...')
    const { error: trialError } = await supabase
      .from('plan_features')
      .insert(trialFeature)
    
    if (trialError) {
      console.error('❌ Error adding trial feature:', trialError)
    } else {
      console.log('✅ Trial initial coins feature added: 5 coins')
    }
    
    // Insert premium feature
    console.log('📝 Adding premium initial coins feature...')
    const { error: premiumError } = await supabase
      .from('plan_features')
      .insert(premiumFeature)
    
    if (premiumError) {
      console.error('❌ Error adding premium feature:', premiumError)
    } else {
      console.log('✅ Premium initial coins feature added: 100 coins (20x more)')
    }
    
    // Verify the new features
    console.log('')
    console.log('🔍 Verifying new features...')
    const { data: features, error: fetchError } = await supabase
      .from('plan_features')
      .select('*')
      .eq('feature_key', 'initial_coins')
      .order('plan_type')
    
    if (fetchError) {
      console.error('❌ Error fetching new features:', fetchError)
    } else if (features && features.length > 0) {
      console.log('📊 Initial coins features:')
      features.forEach(feature => {
        console.log(`  ${feature.plan_type.toUpperCase()}: ${feature.feature_name}`)
        console.log(`    └── ${feature.feature_description}`)
        console.log(`    └── Amount: ${feature.max_value} coins`)
      })
    }
    
    // Show updated feature count
    console.log('')
    console.log('📊 Updated feature counts:')
    const { data: allFeatures, error: countError } = await supabase
      .from('plan_features')
      .select('plan_type, is_enabled')
      .eq('is_enabled', true)
    
    if (!countError && allFeatures) {
      const counts = {}
      allFeatures.forEach(f => {
        counts[f.plan_type] = (counts[f.plan_type] || 0) + 1
      })
      
      Object.keys(counts).forEach(planType => {
        console.log(`  ${planType.toUpperCase()}: ${counts[planType]} features`)
      })
    }

  } catch (error) {
    console.error('❌ Error:', error)
  }
}

addInitialCoinsFeatures()