// Delete all features for basic plan since it no longer exists
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'https://yzlhipdnqidzkyazdilu.supabase.co'
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl6bGhpcGRucWlkemt5YXpkaWx1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTEwNDA4NiwiZXhwIjoyMDcwNjgwMDg2fQ.QOzIX_s-SxvAfZTIYiVbhPJh6qAaxaG1d13u-u5nAuA'

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function deleteBasicPlanFeatures() {
  try {
    console.log('🗑️  Deleting features for basic plan...')
    
    // First, get all basic plan features
    const { data: basicFeatures, error: fetchError } = await supabase
      .from('plan_features')
      .select('*')
      .eq('plan_type', 'basic')

    if (fetchError) {
      console.error('❌ Error fetching basic features:', fetchError)
      return
    }

    if (!basicFeatures || basicFeatures.length === 0) {
      console.log('✅ No basic plan features found to delete')
      return
    }

    console.log(`📊 Found ${basicFeatures.length} basic plan features to delete:`)
    basicFeatures.forEach((feature, index) => {
      console.log(`  ${index + 1}. ${feature.feature_name} (${feature.feature_key})`)
    })

    // Delete all basic plan features
    const { error: deleteError } = await supabase
      .from('plan_features')
      .delete()
      .eq('plan_type', 'basic')

    if (deleteError) {
      console.error('❌ Error deleting basic features:', deleteError)
      return
    }

    console.log('✅ Successfully deleted all basic plan features')
    
    // Verify deletion
    const { data: remainingBasic, error: verifyError } = await supabase
      .from('plan_features')
      .select('*')
      .eq('plan_type', 'basic')

    if (verifyError) {
      console.error('❌ Error verifying deletion:', verifyError)
      return
    }

    if (remainingBasic && remainingBasic.length === 0) {
      console.log('✅ Verification: No basic plan features remain')
    } else {
      console.log(`⚠️  Warning: ${remainingBasic?.length || 0} basic plan features still exist`)
    }

    // Show remaining plan features
    console.log('')
    console.log('📊 Remaining active plan features:')
    
    const { data: allFeatures, error: allError } = await supabase
      .from('plan_features')
      .select('*')
      .order('plan_type')

    if (allError) {
      console.error('❌ Error fetching remaining features:', allError)
      return
    }

    const featuresByPlan = {}
    allFeatures.forEach(feature => {
      if (!featuresByPlan[feature.plan_type]) {
        featuresByPlan[feature.plan_type] = []
      }
      featuresByPlan[feature.plan_type].push(feature)
    })

    Object.keys(featuresByPlan).forEach(planType => {
      const enabledCount = featuresByPlan[planType].filter(f => f.is_enabled).length
      const totalCount = featuresByPlan[planType].length
      console.log(`  ${planType.toUpperCase()}: ${enabledCount}/${totalCount} features`)
    })

  } catch (error) {
    console.error('❌ Error:', error)
  }
}

deleteBasicPlanFeatures()