'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Check, Crown, Zap, ArrowRight, Star } from 'lucide-react'
import { SupabaseAuthManager, SupabaseUserManager } from '@/lib/supabase'

export default function PricingPage() {
  const router = useRouter()
  const [selectedPlan, setSelectedPlan] = useState<'trial' | 'premium'>('trial')
  const [isLoading, setIsLoading] = useState(false)

  const handlePlanSelection = async (plan: 'trial' | 'premium') => {
    setIsLoading(true)
    
    try {
      // Get current user
      const session = await SupabaseAuthManager.getCurrentSession()
      if (!session?.user?.email) {
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white">
      <div className="container mx-auto px-6 py-12">
        
        {/* Header */}
        <div className="text-center mb-12">
          <motion.h1 
            className="text-4xl md:text-5xl font-bold mb-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            Choose Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-orange-500">Confidence</span> Journey
          </motion.h1>
          <motion.p 
            className="text-xl text-gray-300 max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            Start your transformation today. Choose the plan that fits your goals.
          </motion.p>
        </div>

        {/* Pricing Cards */}
        <div className="flex flex-col md:flex-row gap-8 max-w-6xl mx-auto items-center justify-center">
          
          {/* Trial Plan - Smaller, less emphasized */}
          <motion.div
            className={`relative rounded-2xl p-6 border transition-all duration-300 w-full md:w-80 ${
              selectedPlan === 'trial' 
                ? 'border-gray-500 bg-gray-800/70' 
                : 'border-gray-700 bg-gray-800/30 hover:border-gray-600'
            }`}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            onClick={() => setSelectedPlan('trial')}
          >
            <div className="text-center mb-4">
              <h3 className="text-xl font-semibold mb-2 text-gray-200">Start with Trial</h3>
              <div className="text-2xl font-bold text-gray-400 mb-1">
                FREE
              </div>
              <p className="text-sm text-gray-500">3 days access</p>
            </div>

            <div className="space-y-3 mb-6 text-sm">
              <div className="flex items-center gap-3">
                <Check className="w-4 h-4 text-gray-400" />
                <span className="text-gray-300">First 3 learning problems</span>
              </div>
              <div className="flex items-center gap-3">
                <Check className="w-4 h-4 text-gray-400" />
                <span className="text-gray-300">Community access</span>
              </div>
              <div className="flex items-center gap-3">
                <Check className="w-4 h-4 text-gray-400" />
                <span className="text-gray-300">10 starter coins</span>
              </div>
              <div className="flex items-center gap-3">
                <Check className="w-4 h-4 text-gray-400" />
                <span className="text-gray-300">Basic AI Coach chat</span>
              </div>
              <div className="flex items-center gap-3">
                <Check className="w-4 h-4 text-gray-400" />
                <span className="text-gray-300">Progress tracking</span>
              </div>
            </div>

            <button
              onClick={() => handlePlanSelection('trial')}
              disabled={isLoading}
              className={`w-full py-3 rounded-lg font-medium transition-all duration-300 ${
                selectedPlan === 'trial'
                  ? 'bg-gray-600 hover:bg-gray-700 text-white'
                  : 'bg-gray-700/50 hover:bg-gray-700 text-gray-300'
              }`}
            >
              {isLoading && selectedPlan === 'trial' ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Starting...
                </div>
              ) : (
                <>Try Free <ArrowRight className="w-4 h-4 inline ml-1" /></>
              )}
            </button>
          </motion.div>

          {/* Premium Plan - Bigger, more emphasized */}
          <motion.div
            className={`relative rounded-2xl p-8 border-2 transition-all duration-300 w-full md:w-96 ${
              selectedPlan === 'premium' 
                ? 'border-green-400 bg-gradient-to-br from-green-900/20 to-emerald-900/20 scale-105 shadow-2xl shadow-green-500/20' 
                : 'border-green-600/50 bg-gradient-to-br from-gray-800/40 to-gray-900/40 hover:border-green-500 hover:shadow-xl hover:shadow-green-500/10'
            }`}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            onClick={() => setSelectedPlan('premium')}
          >
            {/* Popular Badge */}
            <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
              <div className="bg-gradient-to-r from-green-400 to-emerald-400 text-black px-6 py-2 rounded-full text-sm font-bold flex items-center gap-2 shadow-lg">
                <Star className="w-4 h-4" />
                RECOMMENDED
              </div>
            </div>

            {/* Premium glow effect */}
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-green-500/10 to-emerald-500/10 blur-xl"></div>
            
            <div className="relative">
              <div className="text-center mb-6">
                <Crown className="w-16 h-16 text-green-400 mx-auto mb-4 drop-shadow-lg" />
                <h3 className="text-3xl font-bold mb-2 text-white">Premium</h3>
                <div className="text-4xl font-bold text-green-400 mb-2">
                  $9.99
                  <span className="text-lg text-gray-400">/month</span>
                </div>
                <p className="text-gray-300">Unlock your full potential</p>
              </div>

              <div className="space-y-4 mb-8">
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center">
                    <Check className="w-3 h-3 text-white" />
                  </div>
                  <span className="text-white font-medium">ALL learning content unlocked</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center">
                    <Check className="w-3 h-3 text-white" />
                  </div>
                  <span className="text-white font-medium">Full community + best answers</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center">
                    <Check className="w-3 h-3 text-white" />
                  </div>
                  <span className="text-white font-medium">100 starter coins bonus</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center">
                    <Check className="w-3 h-3 text-white" />
                  </div>
                  <span className="text-white font-medium">Unlimited AI Coach chat</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center">
                    <Check className="w-3 h-3 text-white" />
                  </div>
                  <span className="text-white font-medium">Bonus modules (Intimacy & Body)</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center">
                    <Check className="w-3 h-3 text-white" />
                  </div>
                  <span className="text-white font-medium">Priority support</span>
                </div>
              </div>

              <button
                onClick={() => handlePlanSelection('premium')}
                disabled={isLoading}
                className="w-full py-4 rounded-xl font-bold text-lg transition-all duration-300 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-400 hover:to-emerald-400 text-white shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                {isLoading && selectedPlan === 'premium' ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Activating Premium...
                  </div>
                ) : (
                  <>Get Premium Access <Crown className="w-5 h-5 inline ml-2" /></>
                )}
              </button>

              {/* Value proposition */}
              <div className="text-center mt-4">
                <p className="text-xs text-green-400">💎 Join 9,500+ premium members</p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Bottom Info */}
        <motion.div 
          className="text-center mt-12 text-gray-400"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <p className="mb-2">✨ <strong>Trial automatically converts to Premium after 3 days</strong> ✨</p>
          <p className="text-sm">Cancel anytime during trial period. No commitment required.</p>
        </motion.div>
      </div>
    </div>
  )
}