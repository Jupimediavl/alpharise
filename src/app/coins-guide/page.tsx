'use client'

import { motion } from 'framer-motion'
import { useState, useEffect, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { 
  Coins, 
  TrendingUp, 
  MessageCircle, 
  Star, 
  CreditCard, 
  CheckCircle, 
  ArrowRight, 
  DollarSign,
  Users,
  Target,
  Gift,
  AlertTriangle,
  Zap,
  Calendar,
  Trophy,
  ThumbsUp,
  Award
} from 'lucide-react'

function CoinsGuideContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [username, setUsername] = useState<string | null>(null)

  useEffect(() => {
    const usernameParam = searchParams.get('username')
    setUsername(usernameParam)
  }, [searchParams])

  const goToDashboard = () => {
    if (username) {
      router.push(`/dashboard?username=${username}`)
    } else {
      router.push('/dashboard')
    }
  }

  const goToCommunity = () => {
    if (username) {
      router.push(`/community?username=${username}`)
    } else {
      router.push('/community')
    }
  }

  // Current simplified earning methods based on actual implementation
  const earningMethods = [
    {
      icon: <MessageCircle className="w-6 h-6 text-green-400" />,
      emoji: "✍️",
      title: "Post Answer",
      coins: 1,
      description: "Answer someone's question in the community (basic reward)",
      frequency: "Per answer posted",
      status: "active"
    },
    {
      icon: <ThumbsUp className="w-6 h-6 text-purple-400" />,
      emoji: "👍",
      title: "Helpful Votes",
      coins: 1,
      description: "People vote your answer as 'Helpful' (rewards start from 5th vote)",
      frequency: "Per vote (from 5th onwards)",
      status: "active"
    },
    {
      icon: <Award className="w-6 h-6 text-yellow-400" />,
      emoji: "🏆",
      title: "Best Answer",
      coins: 5,
      description: "Your answer gets 7+ helpful votes and becomes Best Answer",
      frequency: "Automatic bonus",
      status: "active"
    }
  ]

  // Current spending methods based on actual implementation
  const spendingMethods = [
    {
      icon: <MessageCircle className="w-6 h-6 text-blue-400" />,
      emoji: "❓",
      title: "Ask Regular Question",
      coins: 2,
      description: "Post a standard question in the community",
      status: "active"
    },
    {
      icon: <MessageCircle className="w-6 h-6 text-red-400" />,
      emoji: "🚨",
      title: "Ask Urgent Question",
      coins: 5,
      description: "Get priority response within 6 hours with higher visibility",
      status: "active"
    }
  ]

  // How to get more coins
  const coinStrategies = [
    {
      icon: <Users className="w-8 h-8 text-blue-400" />,
      title: "Be Active in Community",
      description: "Answer questions regularly to get more opportunities for ratings",
      tip: "Quality answers get better ratings!"
    },
    {
      icon: <Target className="w-8 h-8 text-green-400" />,
      title: "Provide Detailed Answers",
      description: "Longer, more helpful answers tend to receive higher star ratings",
      tip: "Share personal experiences and practical tips"
    },
    {
      icon: <Trophy className="w-8 h-8 text-yellow-400" />,
      title: "Help Others Successfully",
      description: "When your advice actually helps someone, they're more likely to rate it highly",
      tip: "Follow up to see if your advice worked"
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white">
      {/* Header */}
      <header className="p-6 border-b border-purple-500/20">
        <div className="flex items-center justify-between max-w-6xl mx-auto">
          <button
            onClick={goToDashboard}
            className="flex items-center gap-2 px-4 py-2 bg-purple-700/50 hover:bg-purple-600/50 rounded-lg transition-colors"
          >
            <ArrowRight className="w-4 h-4 rotate-180" />
            <span className="font-medium">Back to Dashboard</span>
          </button>
          
          <h1 className="text-2xl font-black text-white">
            AlphaRise Coins Guide
          </h1>
          
          <button
            onClick={goToCommunity}
            className="px-4 py-2 bg-blue-600/50 hover:bg-blue-500/50 rounded-lg font-medium transition-colors"
          >
            Try Community
          </button>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-6 py-8">
        
        {/* Hero Section */}
        <motion.div 
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="inline-flex items-center gap-3 mb-6">
            <div className="w-16 h-16 bg-gradient-to-r from-yellow-400/20 to-orange-400/20 rounded-full flex items-center justify-center border border-yellow-400/30">
              <Coins className="w-8 h-8 text-yellow-400" />
            </div>
            <div>
              <h1 className="text-4xl font-black bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">
                How Coins Work
              </h1>
              <p className="text-gray-400">Simple helpful voting system - Updated 2025</p>
            </div>
          </div>
          
          <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
            Earn coins by providing helpful answers and getting "Helpful" votes from the community. 
            <span className="text-yellow-400 font-semibold"> Use coins to ask questions and get subscription discounts!</span>
          </p>
        </motion.div>

        {/* Current Balance Preview */}
        {username && (
          <motion.div 
            className="mb-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <div className="bg-gradient-to-r from-yellow-500/20 to-orange-600/25 border border-yellow-400/30 rounded-xl p-6 text-center">
              <h3 className="text-xl font-bold text-white mb-2">Your Current Balance</h3>
              <p className="text-yellow-200/80 text-sm mb-4">Check your dashboard for real-time balance</p>
              <button
                onClick={goToDashboard}
                className="px-6 py-3 bg-yellow-500/20 hover:bg-yellow-500/30 border border-yellow-400/40 rounded-lg font-semibold transition-colors"
              >
                View My Coins →
              </button>
            </div>
          </motion.div>
        )}

        {/* How to Earn Coins */}
        <motion.section 
          className="mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <div className="flex items-center gap-3 mb-8">
            <TrendingUp className="w-8 h-8 text-green-400" />
            <h2 className="text-3xl font-bold text-white">How to Earn Coins</h2>
          </div>
          
          <div className="grid md:grid-cols-1 gap-6">
            {earningMethods.map((method, index) => (
              <motion.div
                key={index}
                className="bg-gradient-to-r from-green-500/10 to-emerald-500/15 border border-green-500/20 rounded-xl p-6 hover:border-green-400/30 transition-colors"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
              >
                <div className="flex items-start gap-4">
                  <div className="text-4xl">{method.emoji}</div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-bold text-white">{method.title}</h3>
                      <div className="px-3 py-1 bg-green-500/20 border border-green-400/30 rounded-full">
                        <span className="text-green-400 font-bold text-sm">+{method.coins} coins</span>
                      </div>
                    </div>
                    <p className="text-gray-300 mb-2">{method.description}</p>
                    <div className="flex items-center gap-4 text-sm">
                      <span className="text-green-400">• {method.frequency}</span>
                      <span className="px-2 py-1 bg-green-500/10 text-green-300 rounded text-xs">
                        ✅ Active
                      </span>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="mt-8 bg-blue-500/10 border border-blue-400/20 rounded-xl p-6">
            <div className="flex items-start gap-3">
              <ThumbsUp className="w-6 h-6 text-blue-400 mt-1" />
              <div>
                <h4 className="text-lg font-semibold text-blue-400 mb-2">How Helpful Voting Works</h4>
                <p className="text-blue-200/80 text-sm">
                  After you answer a question, other members can click "Helpful" if your answer was useful. 
                  Starting from the 5th helpful vote, you earn 1 coin per vote. At 7+ votes, your answer automatically becomes "Best Answer" earning you a 5 coin bonus!
                </p>
              </div>
            </div>
          </div>
        </motion.section>

        {/* How to Spend Coins */}
        <motion.section 
          className="mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <div className="flex items-center gap-3 mb-8">
            <CreditCard className="w-8 h-8 text-purple-400" />
            <h2 className="text-3xl font-bold text-white">How to Spend Coins</h2>
          </div>
          
          <div className="grid md:grid-cols-1 gap-6">
            {spendingMethods.map((method, index) => (
              <motion.div
                key={index}
                className="bg-gradient-to-r from-purple-500/10 to-pink-500/15 border border-purple-500/20 rounded-xl p-6 hover:border-purple-400/30 transition-colors"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
              >
                <div className="flex items-start gap-4">
                  <div className="text-4xl">{method.emoji}</div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-bold text-white">{method.title}</h3>
                      <div className="px-3 py-1 bg-purple-500/20 border border-purple-400/30 rounded-full">
                        <span className="text-purple-400 font-bold text-sm">-{method.coins} coins</span>
                      </div>
                    </div>
                    <p className="text-gray-300 mb-2">{method.description}</p>
                    <div className="flex items-center gap-4 text-sm">
                      <span className="px-2 py-1 bg-purple-500/10 text-purple-300 rounded text-xs">
                        ✅ Available Now
                      </span>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="mt-8 bg-orange-500/10 border border-orange-400/20 rounded-xl p-6">
            <div className="flex items-start gap-3">
              <Gift className="w-6 h-6 text-orange-400 mt-1" />
              <div>
                <h4 className="text-lg font-semibold text-orange-400 mb-2">Best Value: Subscription Discounts</h4>
                <p className="text-orange-200/80 text-sm">
                  Instead of spending coins on questions, save them for subscription discounts! 
                  <span className="font-semibold"> 100 coins = $1 off your monthly subscription.</span> 
                  This is the most valuable way to use your coins.
                </p>
              </div>
            </div>
          </div>
        </motion.section>

        {/* Strategies to Get More Coins */}
        <motion.section 
          className="mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <div className="flex items-center gap-3 mb-8">
            <Target className="w-8 h-8 text-yellow-400" />
            <h2 className="text-3xl font-bold text-white">Strategies to Earn More Coins</h2>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6">
            {coinStrategies.map((strategy, index) => (
              <motion.div
                key={index}
                className="bg-gradient-to-r from-yellow-500/10 to-orange-500/15 border border-yellow-500/20 rounded-xl p-6 hover:border-yellow-400/30 transition-colors"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
              >
                <div className="text-center">
                  {strategy.icon}
                  <h3 className="text-lg font-bold text-white mt-4 mb-3">{strategy.title}</h3>
                  <p className="text-gray-300 text-sm mb-4">{strategy.description}</p>
                  <div className="bg-yellow-500/10 border border-yellow-400/20 rounded-lg p-3">
                    <p className="text-yellow-300 text-sm font-semibold">💡 {strategy.tip}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* Current System Status */}
        <motion.section 
          className="mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
        >
          <div className="bg-gradient-to-r from-green-500/10 to-blue-500/15 border border-green-500/20 rounded-xl p-8">
            <div className="text-center">
              <CheckCircle className="w-12 h-12 text-green-400 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-white mb-4">System Status: Fully Active ✅</h2>
              <div className="grid md:grid-cols-2 gap-6 text-left">
                <div>
                  <h3 className="text-lg font-semibold text-green-400 mb-3">✅ What's Working:</h3>
                  <ul className="space-y-2 text-sm text-gray-300">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-400" />
                      Earning coins from answer ratings
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-400" />
                      Spending coins on questions
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-400" />
                      Real-time balance updates
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-400" />
                      Subscription discount calculation
                    </li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-yellow-400 mb-3">🚧 Coming Soon:</h3>
                  <ul className="space-y-2 text-sm text-gray-300">
                    <li className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-yellow-400" />
                      Weekly activity tracking
                    </li>
                    <li className="flex items-center gap-2">
                      <Trophy className="w-4 h-4 text-yellow-400" />
                      Achievement badges
                    </li>
                    <li className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-yellow-400" />
                      Community leaderboards
                    </li>
                    <li className="flex items-center gap-2">
                      <Zap className="w-4 h-4 text-yellow-400" />
                      Bonus coin events
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </motion.section>

        {/* Call to Action */}
        <motion.section 
          className="text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
        >
          <div className="bg-gradient-to-r from-purple-600/20 to-pink-600/25 border border-purple-500/30 rounded-xl p-8">
            <h2 className="text-3xl font-bold text-white mb-4">Ready to Start Earning?</h2>
            <p className="text-xl text-gray-300 mb-6">
              Join the community and start helping others to earn your first coins!
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={goToCommunity}
                className="px-8 py-4 bg-purple-600 hover:bg-purple-700 rounded-lg font-bold text-lg transition-colors flex items-center justify-center gap-2"
              >
                <Users className="w-6 h-6" />
                Join Community
              </button>
              
              <button
                onClick={goToDashboard}
                className="px-8 py-4 bg-gray-700/50 hover:bg-gray-600/50 border border-gray-600/50 rounded-lg font-semibold text-lg transition-colors flex items-center justify-center gap-2"
              >
                <Coins className="w-6 h-6" />
                View Dashboard
              </button>
            </div>
          </div>
        </motion.section>

      </div>
    </div>
  )
}

export default function CoinsGuidePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white flex items-center justify-center">
        <div className="text-center">
          <Coins className="w-12 h-12 text-yellow-400 mx-auto mb-4 animate-spin" />
          <h2 className="text-xl font-bold text-white">Loading Coins Guide...</h2>
        </div>
      </div>
    }>
      <CoinsGuideContent />
    </Suspense>
  )
}