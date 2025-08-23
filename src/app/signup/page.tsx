'use client'

import { useSearchParams } from 'next/navigation'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { useState, Suspense } from 'react'
import { SupabaseAuthManager, SupabaseUserManager } from '@/lib/supabase'
import { ALSProgressManager } from '@/lib/als-supabase'
import Head from 'next/head'

function SignupContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  
  const [email, setEmail] = useState('')
  const [confirmEmail, setConfirmEmail] = useState('')
  const [name, setName] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!email || !confirmEmail || !name) {
      setError('Please fill in all fields')
      return
    }

    if (email !== confirmEmail) {
      setError('Email addresses do not match')
      return
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address')
      return
    }

    setIsLoading(true)
    setError('')

    try {
      // Debug user state first to see if there's a conflict
      console.log('🔍 Debugging user state before signup...')
      const debugResult = await SupabaseAuthManager.debugUserState(email.trim())
      console.log('Debug result:', debugResult)
      
      // If user already exists in database but auth failed, clean up state
      if (debugResult.publicUser && !debugResult.hasActiveSession) {
        console.log('⚠️ Found orphaned user profile, cleaning up...')
        const cleanupResult = await SupabaseAuthManager.cleanupUserState(email.trim())
        console.log('Cleanup result:', cleanupResult)
      }

      // Get onboarding data from localStorage
      const onboardingData = localStorage.getItem('onboarding_data')
      let parsedOnboardingData = null
      
      if (onboardingData) {
        parsedOnboardingData = JSON.parse(onboardingData)
      }

      // Generate automatic password
      const temporaryPassword = SupabaseAuthManager.generateTemporaryPassword()
      console.log('🔑 Generated temporary password for email setup')
      
      // Create user account with auto-generated password
      console.log('📝 Creating user account...')
      const authResult = await SupabaseAuthManager.signUpUser(
        email.trim(),
        temporaryPassword,
        {
          username: name.trim(),
          coach: parsedOnboardingData?.coach || 'logan',
          age: parseInt(parsedOnboardingData?.age || '25'),
          confidence_score: 25
          // Don't set selected_plan here - let user choose in /plans page
        }
      )
      
      console.log('🔄 Signup result:', authResult)
      
      if (!authResult.success) {
        console.error('❌ Signup failed:', authResult.error)
        throw new Error(authResult.error || 'Failed to create account')
      }

      // Clear onboarding data from localStorage
      localStorage.removeItem('onboarding_data')
      localStorage.removeItem('selected_coach')

      // Check if user is automatically signed in
      const session = await SupabaseAuthManager.getCurrentSession()
      
      if (session && session.user) {
        try {
          // Get the confidence score from URL params or parsed data
          const confidenceScore = parseInt(searchParams.get('confidenceScore') || '') || 
                                  parsedOnboardingData?.confidenceScore || 30

          // Don't set initial coins yet - user will get them when they choose a plan
          // This ensures they go through the plan selection process
          const initialCoins = 0
          
          console.log(`💰 Setting initial coins to ${initialCoins} - user will receive coins when they choose a plan`)

          // Create user learning profile in ALS system
          await ALSProgressManager.upsertUserProfile({
            user_id: session.user.id,
            coach_id: parsedOnboardingData?.coach || 'logan',
            assessment_data: {
              coach: parsedOnboardingData?.coach || 'logan',
              age: parsedOnboardingData?.age || 25,
              problem_type: parsedOnboardingData?.problem_type || 'confidence_building',
              onboarding_answers: parsedOnboardingData?.answers || {},
              profile_data: parsedOnboardingData?.profile_data || {},
              onboardingCompleted: true,
              signupDate: new Date().toISOString()
            },
            personalization_data: {
              selectedCoach: parsedOnboardingData?.coach || 'logan',
              selectedPlan: null, // Let user choose plan in /plans page
              problemType: parsedOnboardingData?.problem_type || 'confidence_building',
              ageGroup: parsedOnboardingData?.profile_data?.age_group || 'adult',
              severity: parsedOnboardingData?.profile_data?.severity || 'moderate',
              preferredLearningTime: 'evening',
              learningGoals: ['confidence', 'personal_growth']
            },
            initial_confidence_score: confidenceScore,
            current_confidence_score: confidenceScore,
            engagement_score: 50,
            consistency_score: 50,
            mastery_level: 1,
            total_xp: 0,
            current_level: 1,
            current_streak: 0,
            longest_streak: 0,
            achievements_unlocked: [],
            total_coins: initialCoins, // Set initial coins based on plan
            preferred_content_type: 'video',
            preferred_session_length: 15,
            best_learning_time: 'evening',
            learning_pace: 'steady'
          })

          // Don't set user plan here - let them choose in /plans page
          // This ensures users who signup go through the plan selection process
          console.log('👤 User created without plan - will choose in /plans page')

          // Redirect to plans selection
          router.push('/plans')
          return
        } catch (alsError) {
          console.error('Error creating ALS profile:', alsError)
          // Still redirect to plans even if ALS profile creation fails
          router.push('/plans')
          return
        }
      }
      
      // Email confirmation required - show success message with password setup info
      setError('🎉 Account created! Check your email for a password setup link, then you can access your dashboard.')
      
    } catch (error: any) {
      console.error('Signup error:', error)
      
      // Handle specific Supabase error messages
      if (error.message?.includes('User already registered')) {
        setError('This email is already registered. Try signing in instead or use a different email address.')
      } else if (error.message?.includes('already been registered')) {
        setError('This email is already registered. Try signing in instead or use a different email address.')
      } else if (error.message?.includes('email already exists')) {
        setError('This email is already registered. Try signing in instead or use a different email address.')
      } else {
        setError(error.message || 'Something went wrong. Please try again.')
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <Head>
        <title>Create Your Account | AlphaRise</title>
        <meta name="description" content="Create your account and start your transformation journey." />
      </Head>

      <div className="min-h-screen bg-black text-white relative overflow-hidden">
        {/* Background Effects */}
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

          <div className="w-16"></div>
        </header>

        {/* Main Content */}
        <main className="relative z-10 px-6 py-12">
          <div className="max-w-md mx-auto">
            
            {/* Title */}
            <motion.div
              className="text-center mb-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h1 className="text-3xl md:text-4xl font-bold mb-4">
                Create Your 
                <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent"> Account</span>
              </h1>
              <p className="text-lg text-gray-300">
                We'll send you a secure login link via email
              </p>
            </motion.div>

            {/* Signup Form */}
            <motion.div
              className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              {error && (
                <motion.div 
                  className={`mb-6 p-4 border rounded-lg text-center ${
                    error.includes('🎉') 
                      ? 'bg-green-500/20 border-green-500/30 text-green-400'
                      : 'bg-red-500/20 border-red-500/30 text-red-400'
                  }`}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                >
                  {error}
                  {error.includes('already registered') && (
                    <div className="mt-3">
                      <button
                        onClick={() => router.push('/login')}
                        className="text-purple-400 hover:text-purple-300 font-medium underline"
                      >
                        Sign in to existing account
                      </button>
                    </div>
                  )}
                </motion.div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Name Field */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Full Name
                  </label>
                  <input 
                    type="text" 
                    placeholder="Enter your full name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full p-4 bg-black/60 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 transition-colors"
                    required
                    disabled={isLoading}
                  />
                </div>

                {/* Email Field */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Email Address
                  </label>
                  <input 
                    type="email" 
                    placeholder="Enter your email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full p-4 bg-black/60 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 transition-colors"
                    required
                    disabled={isLoading}
                  />
                </div>

                {/* Confirm Email Field */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Confirm Email Address
                  </label>
                  <input 
                    type="email" 
                    placeholder="Confirm your email address"
                    value={confirmEmail}
                    onChange={(e) => setConfirmEmail(e.target.value)}
                    className={`w-full p-4 bg-black/60 border rounded-xl text-white placeholder-gray-400 focus:outline-none transition-colors ${
                      confirmEmail && email !== confirmEmail 
                        ? 'border-red-500 focus:border-red-400' 
                        : confirmEmail && email === confirmEmail
                        ? 'border-green-500 focus:border-green-400'
                        : 'border-white/20 focus:border-purple-500'
                    }`}
                    required
                    disabled={isLoading}
                  />
                  {confirmEmail && email !== confirmEmail && (
                    <p className="text-xs text-red-400 mt-2">
                      Email addresses do not match
                    </p>
                  )}
                  {confirmEmail && email === confirmEmail && (
                    <p className="text-xs text-green-400 mt-2">
                      ✓ Email addresses match
                    </p>
                  )}
                </div>

                {/* Submit Button */}
                <button 
                  type="submit"
                  disabled={isLoading || !name || !email || !confirmEmail || email !== confirmEmail}
                  className={`w-full p-4 rounded-xl font-semibold text-lg transition-all ${
                    isLoading || !name || !email || !confirmEmail || email !== confirmEmail
                      ? 'bg-gray-600 cursor-not-allowed opacity-50' 
                      : 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 transform hover:scale-105'
                  }`}
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Creating Account...
                    </div>
                  ) : (
                    'Create Account'
                  )}
                </button>
              </form>

              {/* Login Link */}
              <div className="text-center mt-6">
                <p className="text-gray-400 text-sm">
                  Already have an account?{' '}
                  <button
                    onClick={() => router.push('/login')}
                    className="text-purple-400 hover:text-purple-300 font-medium"
                  >
                    Sign in
                  </button>
                </p>
              </div>
            </motion.div>

            {/* Trust Signals */}
            <motion.div 
              className="text-center mt-8 opacity-60"
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.6 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <p className="text-sm text-gray-400">
                🔒 Your data is secure • 📧 No spam, ever
              </p>
            </motion.div>
          </div>
        </main>
      </div>
    </>
  )
}

export default function SignupPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p>Loading...</p>
        </div>
      </div>
    }>
      <SignupContent />
    </Suspense>
  )
}