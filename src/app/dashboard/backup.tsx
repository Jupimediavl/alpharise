'use client'

import { motion } from 'framer-motion'
import { useState, useEffect, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { SupabaseUserManager, SupabaseCoinManager, DbUser, DbCoinTransaction } from '@/lib/supabase'

function DashboardContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [user, setUser] = useState<DbUser | null>(null)
  const [transactions, setTransactions] = useState<DbCoinTransaction[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [currentTime, setCurrentTime] = useState('')

  // Avatar data for UI
  const avatarData: {
    [key: string]: {
      name: string
      icon: string
      color: string
      communityName: string
      todayChallenge: string
      quickTip: string
    }
  } = {
    marcus: {
      name: 'Marcus',
      icon: '🧠',
      color: 'from-blue-500 to-purple-600',
      communityName: 'Overthinker\'s Circle',
      todayChallenge: 'Make one decision in under 10 seconds',
      quickTip: 'The 3-Second Rule: Count 3-2-1 and ACT before your mind sabotages you'
    },
    jake: {
      name: 'Jake',
      icon: '⚡',
      color: 'from-yellow-500 to-orange-600',
      communityName: 'Performance Squad',
      todayChallenge: 'Practice confident posture for 5 minutes',
      quickTip: 'Champion\'s Breathing: 4 counts in, 7 hold, 8 out - instant confidence'
    },
    alex: {
      name: 'Alex',
      icon: '📚',
      color: 'from-green-500 to-emerald-600',
      communityName: 'Learning Brotherhood',
      todayChallenge: 'Ask one question in the community',
      quickTip: 'Knowledge builds confidence: Every expert was once a beginner'
    },
    ryan: {
      name: 'Ryan',
      icon: '💎',
      color: 'from-purple-500 to-pink-600',
      communityName: 'Rising Kings Court',
      todayChallenge: 'Approach one new person today',
      quickTip: 'King\'s Posture: Shoulders back, chest out, chin up - instant authority'
    },
    ethan: {
      name: 'Ethan',
      icon: '❤️',
      color: 'from-red-500 to-rose-600',
      communityName: 'Connection Masters',
      todayChallenge: 'Have one meaningful conversation',
      quickTip: 'Heart-to-Heart: Ask "How are you feeling?" instead of "How are you?"'
    }
  }

  // Load user data from database
  useEffect(() => {
    const loadUserData = async () => {
      try {
        setIsLoading(true)
        
        // Get username from URL params or sessionStorage
        let username = searchParams.get('username')
        
        if (!username) {
          const sessionData = sessionStorage.getItem('alpharise_user')
          if (sessionData) {
            const parsedData = JSON.parse(sessionData)
            username = parsedData.username
          }
        }

        if (!username) {
          // No user found, redirect to signup
          router.push('/signup')
          return
        }

        console.log('🔍 Loading user data for:', username)

        // Load user from database
        const userData = await SupabaseUserManager.getUserByUsername(username)
        
        if (!userData) {
          console.error('❌ User not found in database:', username)
          router.push('/signup')
          return
        }

        console.log('✅ User loaded from database:', userData)
        setUser(userData)

        // Load recent transactions
        const userTransactions = await SupabaseCoinManager.getUserTransactions(username, 5)
        setTransactions(userTransactions)

        // Update sessionStorage with fresh data
        sessionStorage.setItem('alpharise_user', JSON.stringify({
          username: userData.username,
          email: userData.email,
          coach: userData.coach,
          coins: userData.coins,
          last_loaded: new Date().toISOString()
        }))

      } catch (error) {
        console.error('❌ Error loading user data:', error)
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

    return () => {
      clearInterval(timeInterval)
    }
  }, [])

  // Navigation functions
  const goToCommunity = () => router.push('/community')
  const goToCoins = () => router.push('/coins')

  // If loading or no user data
  if (isLoading || !user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🚀</div>
          <h2 className="text-2xl font-bold">Loading your dashboard...</h2>
          <div className="mt-4 animate-pulse">
            <div className="h-2 bg-gray-700 rounded w-48 mx-auto"></div>
          </div>
        </div>
      </div>
    )
  }

  const avatar = avatarData[user.coach] || avatarData.marcus
  
  // Calculate level from experience
  const currentLevel = Math.floor(150 / 250) + 1
  const experienceForNextLevel = (currentLevel * 250) - 150
  const levelProgress = (150 % 250) / 250 * 100

  // Generate catchy welcome message
  const welcomeMessages = [
    `Welcome back, ${user.username}! Ready to dominate today? 💪`,
    `${user.username}, your future alpha self is calling! 🔥`,
    `What's up, ${user.username}! Time to level up your game! ⚡`,
    `${user.username}, the alpha in you is awakening! 🚀`,
    `Welcome back, future alpha ${user.username}! Let's crush it! 👑`
  ]
  
  const welcomeMessage = welcomeMessages[Math.floor(Math.random() * welcomeMessages.length)]

  const startChallenge = () => {
    alert(`Starting today's challenge! ${avatar.todayChallenge}`)
  }

  const openAchievements = () => {
    alert('Achievements system coming soon!')
  }

  // Format transaction time
  const formatTransactionTime = (timestamp: string) => {
    const now = new Date()
    const transactionTime = new Date(timestamp)
    const diffMs = now.getTime() - transactionTime.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    return `${diffDays}d ago`
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white">
      {/* Header */}
      <header className="p-6 flex justify-between items-center border-b border-white/10">
        <div className="text-2xl font-black bg-gradient-to-r from-red-500 to-red-600 bg-clip-text text-transparent">
          AlphaRise
        </div>
        <div className="flex items-center gap-4">
          <div className="text-sm opacity-70">{currentTime}</div>
          <div className="bg-green-500/20 text-green-400 px-3 py-1 rounded-full text-sm font-semibold">
            {3} days trial left
          </div>
          <button 
            onClick={() => router.push('/signup')}
            className="text-red-400 hover:text-red-300 text-sm"
          >
            Logout
          </button>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8">
        {/* Welcome Section */}
        <motion.div 
          className="mb-8"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex items-center gap-4 mb-4">
            <div className="text-4xl">{avatar.icon}</div>
            <div>
              <h1 className="text-2xl font-bold">
                {welcomeMessage}
              </h1>
              <p className="text-lg opacity-70">Your coach {avatar.name} • {avatar.communityName}</p>
              <p className="text-sm opacity-50 mt-1">
                Member since {new Date(user.created_at).toLocaleDateString()}
              </p>
            </div>
          </div>
        </motion.div>

        {/* Stats Grid - All from Database */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {/* Coins - Live from DB */}
          <motion.div 
            className="bg-gradient-to-br from-yellow-900/40 to-yellow-800/40 border border-yellow-500/30 rounded-xl p-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <div className="flex items-center gap-2 mb-2">
              <span className="text-2xl">🪙</span>
              <span className="text-sm font-semibold text-yellow-400">Coins</span>
            </div>
            <div className="text-2xl font-bold">{user.coins}</div>
            <div className="text-xs opacity-70">Available balance</div>
          </motion.div>

          {/* Experience - Live from DB */}
          <motion.div 
            className="bg-gradient-to-br from-purple-900/40 to-purple-800/40 border border-purple-500/30 rounded-xl p-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className="flex items-center gap-2 mb-2">
              <span className="text-2xl">⚡</span>
              <span className="text-sm font-semibold text-purple-400">XP</span>
            </div>
            <div className="text-2xl font-bold">{150}</div>
            <div className="text-xs opacity-70">Level {currentLevel} progress</div>
          </motion.div>

          {/* Streak - Live from DB */}
          <motion.div 
            className="bg-gradient-to-br from-red-900/40 to-red-800/40 border border-red-500/30 rounded-xl p-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <div className="flex items-center gap-2 mb-2">
              <span className="text-2xl">🔥</span>
              <span className="text-sm font-semibold text-red-400">Streak</span>
            </div>
            <div className="text-2xl font-bold">{1}</div>
            <div className="text-xs opacity-70">Days active</div>
          </motion.div>

          {/* Confidence Score - Live from DB */}
          <motion.div 
            className="bg-gradient-to-br from-blue-900/40 to-blue-800/40 border border-blue-500/30 rounded-xl p-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <div className="flex items-center gap-2 mb-2">
              <span className="text-2xl">📈</span>
              <span className="text-sm font-semibold text-blue-400">Confidence</span>
            </div>
            <div className="text-2xl font-bold">{user.confidence_score}%</div>
            <div className="text-xs opacity-70">Confidence score</div>
          </motion.div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Community Section */}
          <motion.div 
            className="lg:col-span-2 bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8"
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className="flex items-start gap-6">
              <motion.div 
                className={`w-16 h-16 rounded-full bg-gradient-to-br ${avatar.color} flex items-center justify-center text-2xl shadow-2xl`}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.6, delay: 0.4, type: "spring", bounce: 0.5 }}
              >
                {avatar.icon}
              </motion.div>
              
              <div className="flex-1">
                <h2 className="text-xl font-bold mb-2">{avatar.communityName}</h2>
                <p className="text-lg mb-4 opacity-90">
                  Your tribe of like-minded men on the same journey. Share experiences, ask questions, and learn from each other.
                </p>
                
                <div className="bg-white/10 rounded-lg p-4 border-l-4 border-red-500 mb-4">
                  <p className="text-sm font-semibold text-red-400 mb-1">💡 Today's Quick Tip</p>
                  <p className="text-sm opacity-90">{avatar.quickTip}</p>
                </div>
                
                <motion.button
                  onClick={goToCommunity}
                  className="px-6 py-3 bg-gradient-to-r from-red-600 to-red-700 rounded-lg font-semibold
                           transition-all duration-300 ease-out"
                  whileHover={{ scale: 1.05, y: -1 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Join Your Community 💬
                </motion.button>
              </div>
            </div>
          </motion.div>

          {/* Right Sidebar */}
          <motion.div 
            className="space-y-6"
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            {/* Today's Challenge */}
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <span>🎯</span> Today's Challenge
              </h3>
              <div className="text-center">
                <p className="font-semibold text-red-400 mb-3">{avatar.todayChallenge}</p>
                <button 
                  onClick={startChallenge}
                  className="w-full py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-all duration-300"
                >
                  Accept Challenge (+10 XP)
                </button>
              </div>
            </div>

            {/* Level Progress */}
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <span>⬆️</span> Level Progress
              </h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm opacity-70">Level {currentLevel}</span>
                  <span className="text-sm font-semibold">{150}/{currentLevel * 250} XP</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-3 overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-purple-500 to-purple-600 rounded-full transition-all duration-1000"
                    style={{ width: `${levelProgress}%` }}
                  ></div>
                </div>
                <p className="text-xs opacity-70 text-center">
                  {experienceForNextLevel} XP to Level {currentLevel + 1}
                </p>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
              <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <button 
                  onClick={goToCommunity}
                  className="w-full p-3 bg-blue-600/20 hover:bg-blue-600/30 rounded-lg transition-colors text-left flex items-center gap-3"
                >
                  <span>❓</span>
                  <div>
                    <div className="font-semibold">Ask Question</div>
                    <div className="text-xs opacity-70">Get help from community</div>
                  </div>
                </button>
                
                <button 
                  onClick={goToCommunity}
                  className="w-full p-3 bg-green-600/20 hover:bg-green-600/30 rounded-lg transition-colors text-left flex items-center gap-3"
                >
                  <span>💡</span>
                  <div>
                    <div className="font-semibold">Share Win</div>
                    <div className="text-xs opacity-70">Inspire others</div>
                  </div>
                </button>
                
                <button 
                  onClick={openAchievements}
                  className="w-full p-3 bg-yellow-600/20 hover:bg-yellow-600/30 rounded-lg transition-colors text-left flex items-center gap-3"
                >
                  <span>🏆</span>
                  <div>
                    <div className="font-semibold">Achievements</div>
                    <div className="text-xs opacity-70">View badges earned</div>
                  </div>
                </button>

                <button 
                  onClick={goToCoins}
                  className="w-full p-3 bg-yellow-600/20 hover:bg-yellow-600/30 rounded-lg transition-colors text-left flex items-center gap-3"
                >
                  <span>🪙</span>
                  <div>
                    <div className="font-semibold">Coin Economy</div>
                    <div className="text-xs opacity-70">Current: {user.coins} coins</div>
                  </div>
                </button>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Recent Activity - Live from DB */}
        <motion.div 
          className="mt-8 bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
        >
          <h3 className="text-xl font-semibold mb-6 flex items-center gap-2">
            <span>📋</span> Recent Coin Activity
          </h3>
          
          {transactions.length > 0 ? (
            <div className="space-y-4">
              {transactions.map((transaction, index) => (
                <motion.div 
                  key={transaction.id}
                  className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-white/5"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: 0.8 + (index * 0.1) }}
                >
                  <div className="flex-1">
                    <p className="text-sm">
                      <span className={`font-semibold ${transaction.type === 'earn' ? 'text-green-400' : 'text-red-400'}`}>
                        {transaction.type === 'earn' ? '💰' : '💸'}
                      </span>
                      <span className="opacity-70 ml-2">{transaction.reason}</span>
                    </p>
                    <p className="text-xs opacity-50">{formatTransactionTime(transaction.created_at)}</p>
                  </div>
                  <div className={`font-semibold text-sm ${transaction.type === 'earn' ? 'text-green-400' : 'text-red-400'}`}>
                    {transaction.type === 'earn' ? '+' : '-'}{transaction.amount} 🪙
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 opacity-70">
              <p>No recent activity yet. Start earning coins by engaging with the community!</p>
            </div>
          )}
          
          <button 
            onClick={goToCoins}
            className="w-full mt-6 py-3 bg-gradient-to-r from-red-600 to-red-700 rounded-lg font-semibold transition-all duration-300 hover:from-red-700 hover:to-red-800"
          >
            View All Transactions
          </button>
        </motion.div>

        {/* Stats Summary */}
        <motion.div 
          className="mt-8 bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
        >
          <h3 className="text-xl font-semibold mb-6 flex items-center gap-2">
            <span>📊</span> Your Alpha Journey
          </h3>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-400">0</div>
              <div className="text-sm opacity-70">Total Earned</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-400">0</div>
              <div className="text-sm opacity-70">This Month</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-400">{0}</div>
              <div className="text-sm opacity-70">Badges</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-400">{1}</div>
              <div className="text-sm opacity-70">Level</div>
            </div>
          </div>
        </motion.div>
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
          <h2 className="text-2xl font-bold">Loading your dashboard...</h2>
          <div className="mt-4 animate-pulse">
            <div className="h-2 bg-gray-700 rounded w-48 mx-auto"></div>
          </div>
        </div>
      </div>
    }>
      <DashboardContent />
    </Suspense>
  )
}