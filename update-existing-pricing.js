// Update existing pricing plans instead of deleting them
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'https://yzlhipdnqidzkyazdilu.supabase.co'
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl6bGhpcGRucWlkemt5YXpkaWx1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTEwNDA4NiwiZXhwIjoyMDcwNjgwMDg2fQ.QOzIX_s-SxvAfZTIYiVbhPJh6qAaxaG1d13u-u5nAuA'

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function updateExistingPricingPlans() {
  try {
    console.log('🔍 Getting current pricing plans...')
    const { data: currentPlans, error: fetchError } = await supabase
      .from('pricing_plans')
      .select('*')
      .order('display_order')
    
    if (fetchError) {
      console.error('❌ Error fetching current plans:', fetchError)
      return
    }
    
    console.log('📊 Current plans:', currentPlans.map(p => `${p.plan_type}: ${p.display_name}`))
    
    // Update TRIAL plan
    console.log('📝 Updating TRIAL plan...')
    const trialPlan = currentPlans.find(p => p.plan_type === 'trial')
    if (trialPlan) {
      const { error: trialUpdateError } = await supabase
        .from('pricing_plans')
        .update({
          display_name: 'Trial Access',
          price: 0.00,
          trial_price: 0.00,
          trial_days: 999999, // Lifetime
          original_price: 0.00,
          discounted_price: 0.00,
          discount_percentage: 0,
          discount_end_date: null,
          is_active: true,
          updated_at: new Date().toISOString()
        })
        .eq('plan_type', 'trial')
      
      if (trialUpdateError) {
        console.error('❌ Error updating trial plan:', trialUpdateError)
      } else {
        console.log('✅ Trial plan updated: FREE LIFETIME')
      }
    } else {
      console.log('⚠️  No trial plan found to update')
    }
    
    // Update PREMIUM plan  
    console.log('📝 Updating PREMIUM plan...')
    const premiumPlan = currentPlans.find(p => p.plan_type === 'premium')
    if (premiumPlan) {
      const { error: premiumUpdateError } = await supabase
        .from('pricing_plans')
        .update({
          display_name: 'Premium Access',
          price: 19.99,
          trial_price: 0.00,
          trial_days: 3, // FREE 3 DAYS
          original_price: 99.99, // Original price
          discounted_price: 19.99, // Discounted price
          discount_percentage: 80, // 80% discount
          discount_end_date: '2025-12-31T23:59:59',
          is_active: true,
          updated_at: new Date().toISOString()
        })
        .eq('plan_type', 'premium')
      
      if (premiumUpdateError) {
        console.error('❌ Error updating premium plan:', premiumUpdateError)
      } else {
        console.log('✅ Premium plan updated: FREE 3 DAYS, then $19.99 ONE TIME (80% off from $99.99)')
      }
    } else {
      console.log('⚠️  No premium plan found to update')
    }
    
    // Deactivate BASIC plan if it exists
    console.log('📝 Deactivating BASIC plan...')
    const basicPlan = currentPlans.find(p => p.plan_type === 'basic')
    if (basicPlan) {
      const { error: basicUpdateError } = await supabase
        .from('pricing_plans')
        .update({
          is_active: false,
          updated_at: new Date().toISOString()
        })
        .eq('plan_type', 'basic')
      
      if (basicUpdateError) {
        console.error('❌ Error deactivating basic plan:', basicUpdateError)
      } else {
        console.log('✅ Basic plan deactivated')
      }
    }
    
    // Verify the updated plans
    console.log('🔍 Verifying updated pricing plans...')
    const { data: updatedPlans, error: verifyError } = await supabase
      .from('pricing_plans')
      .select('*')
      .eq('is_active', true)
      .order('display_order')
    
    if (verifyError) {
      console.error('❌ Error fetching updated plans:', verifyError)
    } else {
      console.log('📊 Active pricing plans:')
      updatedPlans.forEach(plan => {
        const description = plan.plan_type === 'trial' 
          ? 'FREE LIFETIME'
          : `FREE ${plan.trial_days} DAYS, then $${plan.discounted_price} ONE TIME PAYMENT (${plan.discount_percentage}% off from $${plan.original_price})`
        
        console.log(`  ${plan.plan_type.toUpperCase()}: ${plan.display_name} - ${description}`)
        console.log(`    Original: $${plan.original_price}, Discounted: $${plan.discounted_price}, Trial: ${plan.trial_days} days`)
      })
    }
    
  } catch (error) {
    console.error('❌ Error:', error)
  }
}

updateExistingPricingPlans()