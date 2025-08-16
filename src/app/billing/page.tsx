'use client'

import { motion } from 'framer-motion'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { SupabaseUserManager, DbUser } from '@/lib/supabase'
import { CreditCard, ArrowLeft, Check, Star, Zap, Crown, Gift, Download, Calendar, DollarSign, AlertTriangle, Clock } from 'lucide-react'
import Link from 'next/link'

export default function BillingPage() {
  const router = useRouter()
  const [user, setUser] = useState<DbUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [selectedPlan, setSelectedPlan] = useState<'trial' | 'premium'>('premium')
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly')

  // Mock billing history and subscription data
  const [billingHistory] = useState([
    {
      id: '1',
      date: '2025-01-15',
      amount: 19.99,
      status: 'paid',
      description: 'Premium Monthly Subscription',
      invoice: 'INV-2025-001'
    },
    {
      id: '2', 
      date: '2024-12-15',
      amount: 19.99,
      status: 'paid',
      description: 'Premium Monthly Subscription',
      invoice: 'INV-2024-012'
    },
    {
      id: '3',
      date: '2024-11-15', 
      amount: 19.99,
      status: 'paid',
      description: 'Premium Monthly Subscription',
      invoice: 'INV-2024-011'
    }
  ])

  useEffect(() => {
    const loadUser = async () => {
      try {
        const username = localStorage.getItem('username') || 'testuser1'
        const userData = await SupabaseUserManager.getUserByUsername(username)
        
        if (userData) {
          setUser(userData)
          setSelectedPlan(userData.subscription_type === 'premium' ? 'premium' : 'trial')
        } else {
          router.push('/login')
        }
      } catch (error) {
        console.error('Error loading user:', error)
        router.push('/login')
      } finally {
        setIsLoading(false)
      }
    }

    loadUser()
  }, [router])

  const plans = {
    trial: {
      name: 'Trial',
      price: { monthly: 0, yearly: 0 },
      description: 'Perfect for getting started',
      features: [
        '50 coins per month',
        'Basic AI coaching',
        'Community access',
        'Basic solutions library',
        'Email support'
      ],
      limitations: [
        'Limited AI interactions',
        'No priority support',
        'Basic features only'
      ]
    },
    premium: {
      name: 'Premium',
      price: { monthly: 19.99, yearly: 199.99 },
      description: 'Everything you need to transform',
      features: [
        '200 coins per month',
        'Unlimited AI coaching',
        'Priority community access',
        'Full solutions library',
        'VIP coach sessions',
        'Advanced analytics',
        'Priority support',
        'Exclusive content',
        'Weekly group calls',
        'Personalized action plans'
      ],
      popular: true
    }
  }

  const PlanCard = ({ 
    planKey, 
    plan, 
    isSelected 
  }: { 
    planKey: 'trial' | 'premium'
    plan: typeof plans.trial 
    isSelected: boolean 
  }) => (
    <motion.div
      className={`relative bg-gray-800/50 backdrop-blur border rounded-2xl p-6 cursor-pointer transition-all ${
        isSelected 
          ? 'border-purple-500 bg-purple-500/10' 
          : 'border-gray-700 hover:border-gray-600'
      }`}
      onClick={() => setSelectedPlan(planKey)}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      {plan.popular && (
        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-1 rounded-full text-sm font-semibold">
          Most Popular
        </div>
      )}
      
      <div className="text-center mb-6">
        <h3 className="text-2xl font-bold text-white mb-2">{plan.name}</h3>
        <div className="text-4xl font-bold text-white mb-2">
          ${plan.price[billingCycle]}
          <span className="text-lg text-gray-400">
            /{billingCycle === 'monthly' ? 'mo' : 'yr'}
          </span>
        </div>
        {billingCycle === 'yearly' && plan.price.yearly > 0 && (
          <div className="text-green-400 text-sm">
            Save ${(plan.price.monthly * 12 - plan.price.yearly).toFixed(2)} per year
          </div>
        )}
        <p className="text-gray-400">{plan.description}</p>
      </div>

      <div className="space-y-3 mb-6">
        {plan.features.map((feature, index) => (
          <div key={index} className="flex items-center gap-3">
            <Check className="w-5 h-5 text-green-400 flex-shrink-0" />
            <span className="text-gray-300">{feature}</span>
          </div>
        ))}
        
        {plan.limitations && plan.limitations.map((limitation, index) => (
          <div key={index} className="flex items-center gap-3 opacity-60">
            <AlertTriangle className="w-5 h-5 text-yellow-400 flex-shrink-0" />
            <span className="text-gray-400">{limitation}</span>
          </div>
        ))}
      </div>

      {isSelected && (
        <div className="flex items-center justify-center gap-2 text-purple-400 font-semibold">
          <Check className="w-5 h-5" />
          Currently Selected
        </div>
      )}
    </motion.div>
  )

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">💳</div>
          <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-500 via-magenta-500 to-pink-500 bg-clip-text text-transparent">
            Loading billing...
          </h2>
        </div>
      </div>
    )
  }

  if (!user) return null

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white">
      {/* Header */}
      <div className="border-b border-purple-500/20 p-6">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link 
              href="/dashboard"
              className="p-2 hover:bg-gray-800/50 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-white">Billing & Subscription</h1>
              <p className="text-gray-400">Manage your subscription and payment details</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2 bg-gray-800/50 px-4 py-2 rounded-lg">
            <Crown className="w-5 h-5 text-yellow-400" />
            <span className="text-white font-semibold capitalize">{user.subscription_type}</span>
            {user.subscription_type === 'trial' && (
              <span className="text-orange-400 text-sm">({user.trial_days_left} days left)</span>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-6 space-y-8">
        {/* Current Subscription Status */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gray-800/50 backdrop-blur border border-gray-700 rounded-2xl p-6"
        >
          <h2 className="text-xl font-semibold text-white mb-4">Current Subscription</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-purple-500/20 rounded-full flex items-center justify-center">
                <Crown className="w-6 h-6 text-purple-400" />
              </div>
              <div>
                <div className="text-white font-semibold capitalize">{user.subscription_type} Plan</div>
                <div className="text-gray-400 text-sm">
                  {user.subscription_type === 'trial' 
                    ? `${user.trial_days_left} days remaining`
                    : 'Active subscription'
                  }
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center">
                <Calendar className="w-6 h-6 text-green-400" />
              </div>
              <div>
                <div className="text-white font-semibold">Next Billing</div>
                <div className="text-gray-400 text-sm">
                  {user.subscription_type === 'trial' 
                    ? 'No billing (trial)'
                    : 'February 15, 2025'
                  }
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-yellow-500/20 rounded-full flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-yellow-400" />
              </div>
              <div>
                <div className="text-white font-semibold">Monthly Cost</div>
                <div className="text-gray-400 text-sm">
                  {user.subscription_type === 'trial' ? '$0.00' : '$19.99'}
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Subscription Plans */}
        <motion.section 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-white mb-4">Choose Your Plan</h2>
            <p className="text-gray-400 text-lg mb-6">Unlock your full potential with the right subscription</p>
            
            {/* Billing Cycle Toggle */}
            <div className="flex items-center justify-center gap-4 mb-8">
              <span className={`${billingCycle === 'monthly' ? 'text-white' : 'text-gray-400'}`}>Monthly</span>
              <button
                onClick={() => setBillingCycle(billingCycle === 'monthly' ? 'yearly' : 'monthly')}
                className={`w-12 h-6 rounded-full transition-colors ${
                  billingCycle === 'yearly' ? 'bg-purple-600' : 'bg-gray-600'
                }`}
              >
                <div className={`w-5 h-5 bg-white rounded-full transition-transform ${
                  billingCycle === 'yearly' ? 'translate-x-6' : 'translate-x-0.5'
                }`} />
              </button>
              <span className={`${billingCycle === 'yearly' ? 'text-white' : 'text-gray-400'}`}>
                Yearly
                <span className="text-green-400 text-sm ml-1">(Save 17%)</span>
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <PlanCard 
              planKey="trial" 
              plan={plans.trial} 
              isSelected={selectedPlan === 'trial'} 
            />
            <PlanCard 
              planKey="premium" 
              plan={plans.premium} 
              isSelected={selectedPlan === 'premium'} 
            />
          </div>

          {/* Action Buttons */}
          <div className="text-center mt-8">
            {user.subscription_type !== selectedPlan && (
              <button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-8 py-3 rounded-lg font-semibold transition-all transform hover:scale-105">
                {selectedPlan === 'premium' ? 'Upgrade to Premium' : 'Downgrade to Trial'}
              </button>
            )}
          </div>
        </motion.section>

        {/* Payment Method */}
        {user.subscription_type === 'premium' && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-gray-800/50 backdrop-blur border border-gray-700 rounded-2xl p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-white">Payment Method</h2>
              <button className="text-purple-400 hover:text-purple-300 text-sm">Edit</button>
            </div>
            
            <div className="flex items-center gap-4 p-4 bg-gray-700/30 rounded-lg">
              <div className="w-12 h-8 bg-blue-600 rounded flex items-center justify-center">
                <CreditCard className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <div className="text-white font-medium">•••• •••• •••• 4242</div>
                <div className="text-gray-400 text-sm">Visa ending in 4242 • Expires 12/27</div>
              </div>
              <div className="text-green-400 text-sm">Active</div>
            </div>
          </motion.div>
        )}

        {/* Billing History */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-gray-800/50 backdrop-blur border border-gray-700 rounded-2xl p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-white">Billing History</h2>
            <button className="text-purple-400 hover:text-purple-300 text-sm">View All</button>
          </div>
          
          <div className="space-y-3">
            {billingHistory.map((transaction) => (
              <div key={transaction.id} className="flex items-center justify-between p-4 bg-gray-700/30 rounded-lg">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-green-500/20 rounded-full flex items-center justify-center">
                    <Check className="w-5 h-5 text-green-400" />
                  </div>
                  <div>
                    <div className="text-white font-medium">{transaction.description}</div>
                    <div className="text-gray-400 text-sm">{new Date(transaction.date).toLocaleDateString()}</div>
                  </div>
                </div>
                
                <div className="text-right">
                  <div className="text-white font-semibold">${transaction.amount}</div>
                  <button className="text-purple-400 hover:text-purple-300 text-sm flex items-center gap-1">
                    <Download className="w-4 h-4" />
                    Invoice
                  </button>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Subscription Benefits */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/20 rounded-2xl p-6"
        >
          <h2 className="text-xl font-semibold text-white mb-4">Why Premium?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Zap className="w-8 h-8 text-purple-400" />
              </div>
              <h3 className="text-white font-semibold mb-2">Unlimited AI Coaching</h3>
              <p className="text-gray-400 text-sm">Get personalized advice anytime with no limits</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-yellow-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Star className="w-8 h-8 text-yellow-400" />
              </div>
              <h3 className="text-white font-semibold mb-2">VIP Access</h3>
              <p className="text-gray-400 text-sm">Priority support and exclusive content</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Gift className="w-8 h-8 text-green-400" />
              </div>
              <h3 className="text-white font-semibold mb-2">4x More Coins</h3>
              <p className="text-gray-400 text-sm">200 coins monthly vs 50 in trial</p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}