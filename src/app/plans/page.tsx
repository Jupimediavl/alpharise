'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { Check, Crown, Zap, ArrowRight, Star, Sparkles } from 'lucide-react'
import { SupabaseAuthManager, SupabaseUserManager, SupabasePricingManager } from '@/lib/supabase'
import { useOnboardingProtection } from '@/hooks/useOnboardingProtection'
import Head from 'next/head'
import Image from 'next/image'

export default function PlansPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  
  // Protect onboarding pages from users who already completed onboarding
  const { isLoading: isCheckingOnboarding, shouldRedirect } = useOnboardingProtection()
  
  // Get onboarding data from localStorage
  const [onboardingData, setOnboardingData] = useState<any>(null)
  
  useEffect(() => {
    // Load onboarding data from localStorage
    const savedData = localStorage.getItem('onboarding_data')
    if (savedData) {
      setOnboardingData(JSON.parse(savedData))
    }
  }, [])
  
  const selectedCoach = onboardingData?.coach
  const age = onboardingData?.age
  
  const [selectedPlan, setSelectedPlan] = useState<'trial' | 'premium'>('premium')
  const [isLoading, setIsLoading] = useState(false)
  const [pricingPlans, setPricingPlans] = useState<{
    trial: any,
    premium: any
  }>({
    trial: null,
    premium: null
  })
  
  const [planFeatures, setPlanFeatures] = useState<{
    trial: any[],
    premium: any[]
  }>({
    trial: [],
    premium: []
  })

  // Load pricing plans and features from database
  useEffect(() => {
    async function loadPricingData() {
      try {
        // Load both trial and premium plans
        const [trialPlan, premiumPlan] = await Promise.all([
          SupabasePricingManager.getPlanByType('trial'),
          SupabasePricingManager.getPlanByType('premium')
        ])
        
        setPricingPlans({
          trial: trialPlan,
          premium: premiumPlan
        })
        
        // Load plan features from database
        const { createClient } = await import('@supabase/supabase-js')
        const supabase = createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        )
        
        const { data: features, error: featuresError } = await supabase
          .from('plan_features')
          .select('*')
          .eq('is_enabled', true)
          .in('plan_type', ['trial', 'premium'])
          .order('plan_type')
        
        if (featuresError) {
          console.error('Error loading plan features:', featuresError)
        } else if (features) {
          // Group features by plan type
          const trialFeatures = features.filter(f => f.plan_type === 'trial')
          const premiumFeatures = features.filter(f => f.plan_type === 'premium')
          
          setPlanFeatures({
            trial: trialFeatures,
            premium: premiumFeatures
          })
          
          console.log('Loaded plan features:', { trialFeatures, premiumFeatures })
        }
        
        console.log('Loaded pricing plans:', { trialPlan, premiumPlan })
      } catch (error) {
        console.error('Error loading pricing data:', error)
        // Set fallback values
        setPricingPlans({
          trial: { 
            display_name: 'Trial Access',
            price: 0,
            original_price: 0,
            discounted_price: 0,
            discount_percentage: 0,
            trial_days: 999999
          },
          premium: { 
            display_name: 'Premium Access',
            price: 19.99,
            original_price: 99.99,
            discounted_price: 19.99,
            discount_percentage: 80,
            trial_days: 3
          }
        })
        
        // Set fallback features
        setPlanFeatures({
          trial: [
            { feature_name: 'Access to 3 coaching modules', max_value: 3 },
            { feature_name: 'Basic progress tracking', max_value: null },
            { feature_name: 'Community access', max_value: null },
            { feature_name: 'Limited AI coach messages', max_value: 10 }
          ],
          premium: [
            { feature_name: 'Complete coaching program', max_value: null },
            { feature_name: 'All modules and exercises unlocked', max_value: null },
            { feature_name: 'Unlimited AI coach conversations', max_value: null },
            { feature_name: 'Advanced progress tracking & analytics', max_value: null },
            { feature_name: 'Premium community features', max_value: null },
            { feature_name: 'Priority support', max_value: null }
          ]
        })
      }
    }
    
    loadPricingData()
  }, [])

  const handlePlanSelection = async (plan: 'trial' | 'premium') => {
    setIsLoading(true)
    
    try {
      // Update onboarding data with selected plan
      const updatedOnboardingData = {
        ...onboardingData,
        selected_plan: plan,
        plan_selected_at: new Date().toISOString()
      }
      
      console.log('Updated onboarding data:', updatedOnboardingData)
      
      // Get current user
      const session = await SupabaseAuthManager.getCurrentSession()
      if (!session?.user?.email) {
        // Store updated onboarding data in localStorage for after signup
        localStorage.setItem('onboarding_data', JSON.stringify(updatedOnboardingData))
        router.push('/signup')
        return
      }

      // Get user by email to get username
      const userData = await SupabaseUserManager.getUserByEmail(session.user.email)
      if (!userData) {
        console.error('User not found')
        return
      }

      // Update user's plan in database
      const success = await SupabaseUserManager.updateUserPlan(
        userData.username, 
        plan, 
        plan === 'trial' ? 'trial' : 'active'
      )

      if (success) {
        // Give initial coins based on the selected plan
        const initialCoins = plan === 'premium' ? 100 : 5
        console.log(`💰 Giving ${initialCoins} initial coins for ${plan} plan`)
        
        try {
          await SupabaseUserManager.updateUserCoins(userData.username, initialCoins)
          console.log(`✅ Successfully gave ${initialCoins} coins to user`)
        } catch (coinError) {
          console.error('Error giving initial coins:', coinError)
          // Don't block the flow if coin update fails
        }

        // Clear onboarding data from localStorage
        localStorage.removeItem('onboarding_data')
        localStorage.removeItem('selected_coach')
        
        // Redirect to dashboard with the selected plan
        router.push('/dashboard')
      } else {
        console.error('Failed to update user plan')
      }
    } catch (error) {
      console.error('Error selecting plan:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const getCoachName = (coachId: string | null) => {
    const coachNames: { [key: string]: string } = {
      'blake': 'Blake',
      'chase': 'Chase',
      'logan': 'Logan',
      'mason': 'Mason',
      'knox': 'Knox'
    }
    return coachNames[coachId || ''] || 'your coach'
  }

  // Show loading while checking onboarding status
  if (isCheckingOnboarding || shouldRedirect) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p>{shouldRedirect ? 'Redirecting to dashboard...' : 'Loading...'}</p>
        </div>
      </div>
    )
  }

  return (
    <>
      <Head>
        <title>Choose Your Plan | AlphaRise</title>
        <meta name="description" content="Choose the perfect plan to start your transformation with your personal coach." />
      </Head>

      <div className="min-h-screen bg-black text-white relative overflow-hidden">
        {/* Gradient Background Effects */}
        <div className="absolute inset-0 opacity-40">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-gradient-to-br from-purple-600 to-pink-600 rounded-full filter blur-[128px]" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full filter blur-[128px]" />
        </div>

        {/* Header */}
        <header className="relative z-10 p-6 flex justify-between items-center">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back
          </button>
          
          <div className="text-2xl font-bold">
            <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              AlphaRise
            </span>
          </div>

          <div className="w-16"></div> {/* Spacer for center alignment */}
        </header>

        {/* Progress Indicator */}
        <div className="relative z-10 px-6">
          <div className="max-w-md mx-auto">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-400">Step 3 of 3</span>
              <span className="text-sm text-gray-400">100%</span>
            </div>
            <div className="w-full bg-gray-800 rounded-full h-2">
              <div className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all duration-300" style={{ width: '100%' }}></div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <main className="relative z-10 px-6 py-12">
          <div className="max-w-6xl mx-auto">
            
            {/* Title */}
            <motion.div
              className="text-center mb-12"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h1 className="text-3xl md:text-5xl font-bold mb-4">
                Perfect! Your plan with
                <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent"> {getCoachName(selectedCoach)}</span>
              </h1>
              <p className="text-lg text-gray-300 max-w-2xl mx-auto">
                Choose how you want to start your transformation journey. Both plans include access to your personalized coaching program.
              </p>
            </motion.div>

            {/* Pricing Cards */}
            <div className="flex flex-col lg:flex-row gap-8 items-center justify-center">
              
              {/* Trial Plan */}
              <motion.div
                className={`relative rounded-2xl p-8 border transition-all duration-300 w-full lg:w-96 ${
                  selectedPlan === 'trial' 
                    ? 'border-gray-400 bg-white/10 shadow-xl' 
                    : 'border-gray-600 bg-white/5 hover:border-gray-500'
                }`}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                onClick={() => setSelectedPlan('trial')}
              >
                <div className="text-center mb-6">
                  <Zap className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-2xl font-bold mb-2 text-white">Trial Access</h3>
                  <div className="text-3xl font-bold text-gray-300 mb-2">
                    FREE
                  </div>
                  <p className="text-gray-400">Limited access to get started</p>
                </div>

                <div className="space-y-3 mb-8">
                  {planFeatures.trial && planFeatures.trial.length > 0 ? (
                    planFeatures.trial.map((feature, index) => (
                      <div key={index} className="flex items-center gap-3">
                        <Check className="w-5 h-5 text-gray-400" />
                        <span className="text-gray-300">
                          {feature.feature_name}
                          {feature.max_value && (
                            <span className="text-gray-500"> (max {feature.max_value})</span>
                          )}
                        </span>
                      </div>
                    ))
                  ) : (
                    // Fallback features if database loading fails
                    <>
                      <div className="flex items-center gap-3">
                        <Check className="w-5 h-5 text-gray-400" />
                        <span className="text-gray-300">Access to 3 coaching modules</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <Check className="w-5 h-5 text-gray-400" />
                        <span className="text-gray-300">Basic progress tracking</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <Check className="w-5 h-5 text-gray-400" />
                        <span className="text-gray-300">Community access</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <Check className="w-5 h-5 text-gray-400" />
                        <span className="text-gray-300">Limited AI coach messages</span>
                      </div>
                    </>
                  )}
                  <div className="text-center py-4">
                    <span className="text-xs text-gray-500 bg-gray-800 px-3 py-1 rounded-full">
                      ⚠️ Limited features - upgrade anytime
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => handlePlanSelection('trial')}
                  disabled={isLoading}
                  className="w-full py-4 rounded-xl font-semibold transition-all duration-300 bg-gray-700 hover:bg-gray-600 text-white"
                >
                  {isLoading && selectedPlan === 'trial' ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Starting Trial...
                    </div>
                  ) : (
                    <>Start with Trial <ArrowRight className="w-4 h-4 inline ml-1" /></>
                  )}
                </button>
              </motion.div>

              {/* Premium Plan */}
              <motion.div
                className={`relative rounded-2xl p-8 border-2 transition-all duration-300 w-full lg:w-96 ${
                  selectedPlan === 'premium' 
                    ? 'border-purple-400 bg-gradient-to-br from-purple-500/20 to-pink-500/20 scale-105 shadow-2xl shadow-purple-500/20' 
                    : 'border-purple-500/50 bg-gradient-to-br from-purple-500/10 to-pink-500/10 hover:border-purple-400 hover:shadow-xl hover:shadow-purple-500/10'
                }`}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                onClick={() => setSelectedPlan('premium')}
              >
                {/* Recommended Badge */}
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <div className="bg-gradient-to-r from-purple-400 to-pink-400 text-white px-6 py-2 rounded-full text-sm font-bold flex items-center gap-2 shadow-lg">
                    <Star className="w-4 h-4" />
                    RECOMMENDED
                  </div>
                </div>

                <div className="text-center mb-6">
                  <Crown className="w-16 h-16 text-purple-400 mx-auto mb-4 drop-shadow-lg" />
                  <h3 className="text-3xl font-bold mb-2 text-white">
                    {pricingPlans.premium?.display_name || 'Premium Access'}
                  </h3>
                  
                  {/* Pricing Section */}
                  <div className="mb-4">
                    {pricingPlans.premium?.original_price && 
                     pricingPlans.premium?.discounted_price && 
                     pricingPlans.premium?.original_price > pricingPlans.premium?.discounted_price && (
                      <>
                        {/* Original Price - Crossed Out */}
                        <div className="text-lg text-gray-400 line-through mb-1">
                          ${pricingPlans.premium.original_price}
                        </div>
                        
                        {/* Discount Badge */}
                        <div className="bg-gradient-to-r from-red-500/20 to-orange-500/20 text-red-400 px-3 py-1 rounded-full text-sm font-bold inline-block border border-red-500/30 mb-2">
                          {pricingPlans.premium.discount_percentage}% OFF
                        </div>
                      </>
                    )}
                    
                    {/* Current Price */}
                    <div className="text-4xl font-bold text-purple-400 mb-1">
                      ${pricingPlans.premium?.discounted_price || pricingPlans.premium?.price || '19.99'}
                      <span className="text-lg text-gray-400 block text-center">ONE TIME PAYMENT</span>
                    </div>
                  </div>
                  
                  <div className="bg-gradient-to-r from-green-500/20 to-blue-500/20 text-green-400 px-4 py-2 rounded-full text-sm font-semibold inline-block border border-green-500/30">
                    ⚡ Lifetime Access Forever
                  </div>
                </div>

                <div className="space-y-4 mb-8">
                  {planFeatures.premium && planFeatures.premium.length > 0 ? (
                    planFeatures.premium.map((feature, index) => (
                      <div key={index} className="flex items-center gap-3">
                        <div className="w-5 h-5 rounded-full bg-purple-500 flex items-center justify-center">
                          <Check className="w-3 h-3 text-white" />
                        </div>
                        <span className="text-white font-medium">
                          {feature.feature_name}
                          {feature.max_value && (
                            <span className="text-purple-200"> (up to {feature.max_value})</span>
                          )}
                        </span>
                      </div>
                    ))
                  ) : (
                    // Fallback features if database loading fails
                    <>
                      <div className="flex items-center gap-3">
                        <div className="w-5 h-5 rounded-full bg-purple-500 flex items-center justify-center">
                          <Check className="w-3 h-3 text-white" />
                        </div>
                        <span className="text-white font-medium">Complete coaching program with {getCoachName(selectedCoach)}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-5 h-5 rounded-full bg-purple-500 flex items-center justify-center">
                          <Check className="w-3 h-3 text-white" />
                        </div>
                        <span className="text-white font-medium">All modules and exercises unlocked</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-5 h-5 rounded-full bg-purple-500 flex items-center justify-center">
                          <Check className="w-3 h-3 text-white" />
                        </div>
                        <span className="text-white font-medium">Unlimited AI coach conversations</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-5 h-5 rounded-full bg-purple-500 flex items-center justify-center">
                          <Check className="w-3 h-3 text-white" />
                        </div>
                        <span className="text-white font-medium">Advanced progress tracking & analytics</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-5 h-5 rounded-full bg-purple-500 flex items-center justify-center">
                          <Check className="w-3 h-3 text-white" />
                        </div>
                        <span className="text-white font-medium">Premium community features</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-5 h-5 rounded-full bg-purple-500 flex items-center justify-center">
                          <Check className="w-3 h-3 text-white" />
                        </div>
                        <span className="text-white font-medium">Priority support</span>
                      </div>
                    </>
                  )}
                </div>

                <button
                  onClick={() => handlePlanSelection('premium')}
                  disabled={isLoading}
                  className="w-full py-4 rounded-xl font-bold text-lg transition-all duration-300 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-400 hover:to-pink-400 text-white shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  {isLoading && selectedPlan === 'premium' ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Starting Free Trial...
                    </div>
                  ) : (
                    <>Try Premium for FREE <Sparkles className="w-5 h-5 inline ml-2" /></>
                  )}
                </button>

                <div className="text-center mt-4">
                  <p className="text-xs text-gray-400">
                    🎯 Start with {pricingPlans.premium?.trial_days || 3} days FREE, then one-time payment for lifetime access
                  </p>
                </div>
              </motion.div>
            </div>

            {/* Bottom Info */}
            <motion.div 
              className="text-center mt-12 max-w-3xl mx-auto"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 mb-6">
                <h3 className="font-semibold text-white mb-3">Your Personalized Program Includes:</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-300">
                  <div>✨ Coaching program tailored for {getCoachName(selectedCoach)}</div>
                  <div>🎯 Exercises matched to your specific challenges</div>
                  <div>📊 Progress tracking based on your assessment</div>
                  <div>💬 Personalized AI conversations</div>
                </div>
              </div>
              
              <p className="text-gray-400 text-sm">
                🔒 Secure payment • 💯 30-day money-back guarantee • 📱 Access on all devices
              </p>
            </motion.div>
          </div>
        </main>
      </div>
    </>
  )
}