// Test pricing integration like the plans page does
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'https://yzlhipdnqidzkyazdilu.supabase.co'
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl6bGhpcGRucWlkekt5YXpkaWx1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTEwNDA4NiwiZXhwIjoyMDcwNjgwMDg2fQ.QOzIX_s-SxvAfZTIYiVbhPJh6qAaxaG1d13u-u5nAuA'

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function testPricingIntegration() {
  try {
    console.log('🧪 Testing pricing integration like the plans page...')
    
    // Test loading both trial and premium plans (simulating SupabasePricingManager.getPlanByType)
    console.log('📊 Loading trial and premium plans...')
    
    const [trialResult, premiumResult] = await Promise.all([
      supabase.from('pricing_plans').select('*').eq('plan_type', 'trial').eq('is_active', true).single(),
      supabase.from('pricing_plans').select('*').eq('plan_type', 'premium').eq('is_active', true).single()
    ])
    
    const trialPlan = trialResult.data
    const premiumPlan = premiumResult.data
    
    if (trialResult.error) {
      console.error('❌ Error loading trial plan:', trialResult.error)
    } else {
      console.log('✅ Trial plan loaded successfully')
    }
    
    if (premiumResult.error) {
      console.error('❌ Error loading premium plan:', premiumResult.error)
    } else {
      console.log('✅ Premium plan loaded successfully')
    }
    
    // Test the data structure that the plans page expects
    const pricingPlans = {
      trial: trialPlan,
      premium: premiumPlan
    }
    
    console.log('')
    console.log('📊 Plans page data structure:')
    console.log('Trial Plan:', {
      display_name: pricingPlans.trial?.display_name,
      price: pricingPlans.trial?.price,
      original_price: pricingPlans.trial?.original_price,
      discounted_price: pricingPlans.trial?.discounted_price,
      discount_percentage: pricingPlans.trial?.discount_percentage,
      trial_days: pricingPlans.trial?.trial_days
    })
    
    console.log('Premium Plan:', {
      display_name: pricingPlans.premium?.display_name,
      price: pricingPlans.premium?.price,
      original_price: pricingPlans.premium?.original_price,
      discounted_price: pricingPlans.premium?.discounted_price,
      discount_percentage: pricingPlans.premium?.discount_percentage,
      trial_days: pricingPlans.premium?.trial_days
    })
    
    // Test the UI calculations
    console.log('')
    console.log('🎨 UI Display Calculations:')
    
    // Trial plan display
    console.log('TRIAL PLAN:')
    console.log(`  Display Name: ${pricingPlans.trial?.display_name || 'Trial Access'}`)
    console.log(`  Price: FREE LIFETIME (${pricingPlans.trial?.trial_days || 999999} days)`)
    
    // Premium plan display
    console.log('PREMIUM PLAN:')
    console.log(`  Display Name: ${pricingPlans.premium?.display_name || 'Premium Access'}`)
    
    if (pricingPlans.premium?.original_price && 
        pricingPlans.premium?.discounted_price && 
        pricingPlans.premium?.original_price > pricingPlans.premium?.discounted_price) {
      console.log(`  Original Price: $${pricingPlans.premium.original_price} (crossed out)`)
      console.log(`  Discount Badge: ${pricingPlans.premium.discount_percentage}% OFF`)
      console.log(`  Current Price: $${pricingPlans.premium.discounted_price}`)
    } else {
      console.log(`  Price: $${pricingPlans.premium?.discounted_price || pricingPlans.premium?.price || '19.99'}`)
    }
    
    console.log(`  Trial Period: ${pricingPlans.premium?.trial_days || 3} days FREE`)
    
    // Simulate the pricing display logic
    console.log('')
    console.log('💰 Final Pricing Display:')
    console.log(`TRIAL: FREE LIFETIME`)
    console.log(`PREMIUM: $${pricingPlans.premium?.original_price} -> $${pricingPlans.premium?.discounted_price} (${pricingPlans.premium?.discount_percentage}% OFF)`)
    console.log(`PREMIUM TRIAL: Start with ${pricingPlans.premium?.trial_days} days FREE, then one-time payment for lifetime access`)
    
  } catch (error) {
    console.error('❌ Error:', error)
  }
}

testPricingIntegration()