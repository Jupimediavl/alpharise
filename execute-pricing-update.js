// Execute pricing plans update
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'https://yzlhipdnqidzkyazdilu.supabase.co'
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl6bGhpcGRucWlkemt5YXpkaWx1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTEwNDA4NiwiZXhwIjoyMDcwNjgwMDg2fQ.QOzIX_s-SxvAfZTIYiVbhPJh6qAaxaG1d13u-u5nAuA'

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function updatePricingPlans() {
  try {
    console.log('🗑️  Clearing existing pricing plans...')
    
    // Delete all existing plans
    const { error: deleteError } = await supabase
      .from('pricing_plans')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000') // Delete all
    
    if (deleteError) {
      console.error('❌ Error deleting existing plans:', deleteError)
      return
    }
    
    console.log('✅ Existing plans cleared')
    
    console.log('📝 Creating new pricing plans...')
    
    // Insert TRIAL plan
    const { error: trialError } = await supabase
      .from('pricing_plans')
      .insert({
        plan_type: 'trial',
        name: 'AlphaRise Trial',
        display_name: 'Trial Access',
        price: 0.00,
        currency: 'USD',
        trial_price: 0.00,
        trial_days: 999999, // Lifetime
        is_active: true,
        display_order: 1,
        original_price: 0.00,
        discounted_price: 0.00,
        discount_percentage: 0,
        discount_end_date: null
      })
    
    if (trialError) {
      console.error('❌ Error creating trial plan:', trialError)
    } else {
      console.log('✅ Trial plan created: FREE LIFETIME')
    }
    
    // Insert PREMIUM plan
    const { error: premiumError } = await supabase
      .from('pricing_plans')
      .insert({
        plan_type: 'premium',
        name: 'AlphaRise Premium',
        display_name: 'Premium Access',
        price: 19.99,
        currency: 'USD',
        trial_price: 0.00,
        trial_days: 3, // FREE 3 DAYS
        is_active: true,
        display_order: 2,
        original_price: 99.99, // Original price
        discounted_price: 19.99, // Discounted price
        discount_percentage: 80, // 80% discount
        discount_end_date: '2025-12-31T23:59:59'
      })
    
    if (premiumError) {
      console.error('❌ Error creating premium plan:', premiumError)
    } else {
      console.log('✅ Premium plan created: FREE 3 DAYS, then $19.99 ONE TIME (80% off from $99.99)')
    }
    
    // Verify the new plans
    console.log('🔍 Verifying new pricing plans...')
    const { data: plans, error: fetchError } = await supabase
      .from('pricing_plans')
      .select('*')
      .order('display_order')
    
    if (fetchError) {
      console.error('❌ Error fetching plans:', fetchError)
    } else {
      console.log('📊 New pricing plans:')
      plans.forEach(plan => {
        const description = plan.plan_type === 'trial' 
          ? 'FREE LIFETIME'
          : `FREE ${plan.trial_days} DAYS, then $${plan.discounted_price} ONE TIME PAYMENT (${plan.discount_percentage}% off from $${plan.original_price})`
        
        console.log(`  ${plan.plan_type.toUpperCase()}: ${plan.display_name} - ${description}`)
      })
    }
    
  } catch (error) {
    console.error('❌ Error:', error)
  }
}

updatePricingPlans()