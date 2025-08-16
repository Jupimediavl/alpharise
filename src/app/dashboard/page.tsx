// Clean Dashboard - Direct Navigation to Solutions Pages

'use client'

import { motion } from 'framer-motion'
import { useState, useEffect, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { SupabaseUserManager, DbUser } from '@/lib/supabase'
import { simpleCoinHelpers } from '@/lib/simple-coin-system'
import { ChevronRight, Zap, Target } from 'lucide-react'

// Solution Categories Structure
const solutionCategories = [
  {
    id: 'sexual-performance',
    title: '🔥 Sexual Performance',
    description: 'Last longer and perform with confidence',
    solutionCount: 5
  },
  {
    id: 'approach-conversation',
    title: '💬 Approach & Conversation', 
    description: 'Start conversations that lead somewhere',
    solutionCount: 6
  },
  {
    id: 'digital-dating',
    title: '📱 Digital Dating',
    description: 'Master dating apps and online game',
    solutionCount: 6
  },
  {
    id: 'physical-intimacy',
    title: '💋 Physical & Intimacy',
    description: 'From first kiss to satisfying her',
    solutionCount: 6
  },
  {
    id: 'first-dates',
    title: '🷷 First Dates',
    description: 'Plan, execute, and close successfully',
    solutionCount: 6
  },
  {
    id: 'confidence-mindset',
    title: '🧠 Confidence & Mindset',
    description: 'Build unshakeable inner confidence',
    solutionCount: 6
  },
  {
    id: 'presence-attitude',
    title: '💪 Presence & Attitude',
    description: 'Attract through masculine energy',
    solutionCount: 6
  },
  {
    id: 'social-situations',
    title: '🎭 Social Situations',
    description: 'Navigate any social scenario smoothly',
    solutionCount: 6
  },
  {
    id: 'emotional-psychological',
    title: '❤️ Emotional & Psychological',
    description: 'Handle emotions and attachment healthily',
    solutionCount: 6
  },
  {
    id: 'zero-experience',
    title: '🔥 Zero Experience',
    description: 'From virgin to confident - complete guide',
    solutionCount: 6
  }
]

function DashboardContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [user, setUser] = useState<DbUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [currentTime, setCurrentTime] = useState('')
  const [userCoinStats, setUserCoinStats] = useState<any>(null)

  // Enhanced coach data with personalized encouragement messages
  const coachData: {
    [key: string]: {
      name: string
      icon: string
      color: string
      expertise: string
      encouragementMessage: string
      powerMove: string
      powerMoveIcon: string
      powerMoveColor: string
    }
  } = {
    marcus: {
      name: 'Marcus',
      icon: '🧠',
      color: 'from-purple-500 to-pink-500',
      expertise: 'Confidence & Mindset Coach',
      encouragementMessage: "Marcus, your analytical mind is actually your secret weapon. Today, I want you to use that overthinking superpower FOR you, not against you. Channel that mental energy into planning your next confident move. You've got this! 🚀",
      powerMove: "Mind Control Challenge",
      powerMoveIcon: "🎯",
      powerMoveColor: "from-purple-400 to-magenta-500"
    },
    alex: {
      name: 'Alex',
      icon: '📚',
      color: 'from-purple-600 to-pink-400',
      expertise: 'Knowledge & Growth Coach',
      encouragementMessage: "Alex, your hunger for knowledge is what separates you from guys who stay stuck. Every expert was once a beginner, and you're already ahead because you're here, learning and growing. Today is another step toward mastery! 📚✨",
      powerMove: "Learning Sprint",
      powerMoveIcon: "⚡",
      powerMoveColor: "from-purple-400 to-pink-500"
    },
    ryan: {
      name: 'Ryan',
      icon: '💎',
      color: 'from-magenta-500 to-pink-500',
      expertise: 'Potential & Consistency Coach',
      encouragementMessage: "Ryan, I see that fire in you - those moments when your natural charisma breaks through. Today we're turning those flashes of brilliance into your default setting. Your potential is limitless! 💎🔥",
      powerMove: "Consistency Streak",
      powerMoveIcon: "🔥",
      powerMoveColor: "from-magenta-400 to-pink-500"
    },
    jake: {
      name: 'Jake',
      icon: '⚡',
      color: 'from-purple-500 to-magenta-600',
      expertise: 'Performance & Excellence Coach',
      encouragementMessage: "Jake, your drive for excellence is what champions are made of. Instead of letting performance pressure hold you back, we're channeling it into unstoppable confidence. Today, you dominate! ⚡💪",
      powerMove: "Performance Peak",
      powerMoveIcon: "🚀",
      powerMoveColor: "from-purple-400 to-magenta-500"
    },
    ethan: {
      name: 'Ethan',
      icon: '❤️',
      color: 'from-pink-500 to-purple-600',
      expertise: 'Connection & Emotional Coach',
      encouragementMessage: "Ethan, your emotional intelligence is rare and powerful. While other guys struggle to connect, you naturally understand people. Today, we combine that emotional depth with magnetic confidence! ❤️✨",
      powerMove: "Connection Catalyst",
      powerMoveIcon: "💫",
      powerMoveColor: "from-pink-400 to-purple-500"
    }
  }

  // Load user data and coin stats
  useEffect(() => {
    const loadUserData = async () => {
      try {
        setIsLoading(true)
        
        let username = searchParams.get('username')
        if (!username) {
          const sessionData = sessionStorage.getItem('alpharise_user')
          if (sessionData) {
            const parsedData = JSON.parse(sessionData)
            username = parsedData.username
          }
        }

        if (!username) {
          router.push('/signup')
          return
        }

        const userData = await SupabaseUserManager.getUserByUsername(username)
        if (!userData) {
          router.push('/signup')
          return
        }

        setUser(userData)

        // Load coin stats
        const coinStats = simpleCoinHelpers.getUserStats(username)
        setUserCoinStats(coinStats)

        // Process daily login reward
        const dailyReward = simpleCoinHelpers.dailyLogin(username)
        if (dailyReward) {
          console.log('🎉 Daily login reward:', dailyReward)
          // Update user coins in session
          userData.coins = (userData.coins || 0) + dailyReward.amount
        }

        sessionStorage.setItem('alpharise_user', JSON.stringify({
          username: userData.username,
          email: userData.email,
          avatar_type: userData.avatar_type,
          coins: userData.coins,
          last_loaded: new Date().toISOString()
        }))

      } catch (error) {
        console.error('Error loading user data:', error)
        router.push('/signup')
      } finally {
        setIsLoading(false)
      }
    }

    loadUserData()
  }, [searchParams, router])

  // Update time
  useEffect(() => {
    const updateTime = () => {
      const now = new Date()
      const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      setCurrentTime(timeStr)
    }
    updateTime()
    const timeInterval = setInterval(updateTime, 1000)
    return () => clearInterval(timeInterval)
  }, [])

  // Navigation
  const goToCommunity = () => router.push('/community')

  // Handle solution selection - Navigate to separate page
  const selectSolution = (categoryId: string) => {
    router.push(`/solutions/${categoryId}?username=${user?.username}`)
  }

  if (isLoading || !user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🚀</div>
          <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-500 via-magenta-500 to-pink-500 bg-clip-text text-transparent">
            Loading your dashboard...
          </h2>
        </div>
      </div>
    )
  }

  const coach = coachData[user.avatar_type] || coachData.marcus

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white">
      {/* Simple Header */}
      <header className="p-6 flex justify-between items-center border-b border-purple-500/20">
        <div className="text-2xl font-black text-white">
          AlphaRise
        </div>
        <div className="flex items-center gap-4">
          <div className="text-sm opacity-70">{currentTime}</div>
          <div className="bg-gradient-to-r from-purple-500/20 to-magenta-500/20 text-white px-3 py-1 rounded-full text-sm font-semibold flex items-center gap-1 border border-purple-500/30">
            <span>🪙</span>
            {user?.coins || 0}
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8 max-w-6xl">
        
        {/* Welcome Section */}
        <motion.div 
          className="mb-8"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex items-center gap-4 mb-6">
            <div className={`w-16 h-16 rounded-full bg-gradient-to-br ${coach.color} flex items-center justify-center text-2xl shadow-xl`}>
              {coach.icon}
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 via-magenta-400 to-pink-400 bg-clip-text text-transparent">
                Hey {user.username}! 👋
              </h1>
              <p className="text-lg opacity-70">Your coach {coach.name} • {coach.expertise}</p>
            </div>
          </div>

          {/* Daily Encouragement Message */}
          <div className="bg-gradient-to-r from-purple-500/20 to-magenta-500/20 border border-purple-500/30 rounded-2xl p-6 mb-6 backdrop-blur-sm">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-2xl">💪</span>
              <h2 className="text-xl font-bold text-white">Your Daily Alpha Boost</h2>
              {userCoinStats?.profile?.streak && (
                <div className="bg-purple-500/20 text-purple-400 px-2 py-1 rounded-full text-xs font-semibold">
                  🔥 {userCoinStats.profile.streak} day streak
                </div>
              )}
            </div>
            <p className="text-lg mb-4 opacity-90 leading-relaxed">{coach.encouragementMessage}</p>
            <div className="flex gap-3 mb-4">
              <button className="px-6 py-3 bg-gradient-to-r from-purple-600 to-magenta-600 hover:from-purple-700 hover:to-magenta-700 rounded-lg font-semibold transition-all transform hover:scale-105">
                I'm Ready! 🚀
              </button>
              <button className="px-6 py-3 bg-white/10 hover:bg-purple-500/20 rounded-lg font-semibold transition-colors border border-purple-500/30">
                Save for Later
              </button>
            </div>
            
            {/* Coin earning info */}
            <div className="bg-black/30 rounded-lg p-3 text-sm">
              <div className="text-cyan-400 font-semibold mb-1">💰 Today's Earning Opportunities:</div>
              <div className="text-xs opacity-70 space-y-1">
                <div>• Daily login: ✅ Already earned (+1 coin)</div>
                <div>• Answer questions: +1 coin per answer</div>
                <div>• Get helpful votes: +1 coin per vote (from 5th vote)</div>
                <div>• Best answer: +5 coins bonus (auto at 7+ votes)</div>
              </div>
            </div>
          </div>

          {/* Power Move Challenge */}
          <div className={`bg-gradient-to-r ${coach.powerMoveColor}/10 border border-purple-400/30 rounded-xl p-4 relative overflow-hidden`}>
            <div className="absolute inset-0 bg-gradient-to-r from-purple-400/5 to-magenta-400/5"></div>
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-2">
                <span className="text-xl">{coach.powerMoveIcon}</span>
                <h3 className="text-lg font-semibold text-white">{coach.powerMove}</h3>
                <div className="ml-auto">
                  <motion.div
                    className="w-2 h-2 bg-magenta-400 rounded-full"
                    animate={{ scale: [1, 1.5, 1], opacity: [1, 0.5, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                </div>
              </div>
              <p className="opacity-90">Complete today's challenge to unlock exclusive content and earn bonus coins!</p>
            </div>
          </div>
        </motion.div>

        {/* Solutions Categories Grid */}
        <motion.div 
          className="mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <span>📚</span> 
            <span className="bg-gradient-to-r from-purple-400 to-magenta-400 bg-clip-text ">
              Instant Solutions
            </span>
          </h2>
          <p className="text-lg opacity-70 mb-6">Click any category to see step-by-step guides that actually work:</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
            {solutionCategories.map((category, index) => (
              <motion.div
                key={category.id}
                className="bg-black/30 backdrop-blur-sm border border-purple-500/20 rounded-xl overflow-hidden hover:border-magenta-500/40 transition-all duration-300"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                whileHover={{ scale: 1.02 }}
              >
                <button
                  onClick={() => selectSolution(category.id)}
                  className="w-full p-6 text-left hover:bg-purple-500/5 transition-colors flex items-center justify-between"
                >
                  <div className="flex-1">
                    <h3 className="text-lg font-bold mb-2">{category.title}</h3>
                    <p className="text-sm opacity-70">{category.description}</p>
                    <div className="mt-3 text-xs text-magenta-400">
                      {category.solutionCount} solutions available
                    </div>
                  </div>
                  <div className="ml-4">
                    <ChevronRight className="w-5 h-5 text-purple-400" />
                  </div>
                </button>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <motion.div 
            className="bg-black/30 backdrop-blur-sm border border-purple-500/20 rounded-2xl p-6"
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
              <span>💬</span> 
              <span className="text-white">Get Help</span>
            </h3>
            <p className="mb-4 opacity-80">Ask questions and learn from men who've solved these problems.</p>
            <button
              onClick={goToCommunity}
              className="w-full py-3 bg-gradient-to-r from-purple-600 to-magenta-600 hover:from-purple-700 hover:to-magenta-700 rounded-lg font-semibold transition-all transform hover:scale-105"
            >
              Join Community
            </button>
          </motion.div>

          <motion.div 
            className="bg-black/30 backdrop-blur-sm border border-purple-500/20 rounded-2xl p-6"
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
              <span>📈</span> 
              <span className="text-white">Your Progress</span>
            </h3>
            
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-xl font-bold text-purple-400">{userCoinStats?.profile?.streak || user.streak}</div>
                <div className="text-xs opacity-70">Days Active</div>
              </div>
              <div>
                <div className="text-xl font-bold text-magenta-400">{userCoinStats?.profile?.totalEarned || user.total_earned}</div>
                <div className="text-xs opacity-70">Coins Earned</div>
              </div>
              <div>
                <div className="text-xl font-bold text-pink-400">{userCoinStats?.community?.answersGiven || 0}</div>
                <div className="text-xs opacity-70">Answers Given</div>
              </div>
            </div>
            
            {/* Coin system stats */}
            {userCoinStats?.community && (
              <div className="mt-4 pt-4 border-t border-white/10">
                <div className="grid grid-cols-2 gap-4 text-center text-xs">
                  <div>
                    <div className="font-semibold text-cyan-400">{userCoinStats.community.totalVotesReceived}</div>
                    <div className="opacity-70">Helpful Votes</div>
                  </div>
                  <div>
                    <div className="font-semibold text-yellow-400">{userCoinStats.community.bestAnswersCount}</div>
                    <div className="opacity-70">Best Answers</div>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  )
}

export default function DashboardPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🚀</div>
          <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-500 via-magenta-500 to-pink-500 bg-clip-text text-transparent">
            Loading your dashboard...
          </h2>
        </div>
      </div>
    }>
      <DashboardContent />
    </Suspense>
  )
}