// Simplified Dashboard - Focused on Real Help and Solutions

'use client'

import { motion } from 'framer-motion'
import { useState, useEffect, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { SupabaseUserManager, SupabaseCoinManager, DbUser, DbCoinTransaction } from '@/lib/supabase'

function DashboardContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [user, setUser] = useState<DbUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [currentTime, setCurrentTime] = useState('')

  // Avatar data focused on REAL HELP
  const coachData: {
    [key: string]: {
      name: string
      icon: string
      color: string
      expertise: string
      todayAction: string
      quickWin: string
      helpWith: string[]
    }
  } = {
    marcus: {
      name: 'Marcus',
      icon: '🧠',
      color: 'from-blue-500 to-purple-600',
      expertise: 'Confidence & Mindset Coach',
      todayAction: 'Practice 2 minutes of confident posture',
      quickWin: 'Stand tall for 30 seconds before any conversation',
      helpWith: ['Overthinking', 'Self-doubt', 'Social anxiety', 'Confidence building']
    },
    alex: {
      name: 'Alex',
      icon: '💪',
      color: 'from-red-500 to-orange-600',
      expertise: 'Performance & Intimacy Coach',
      todayAction: 'Practice breathing exercises for 5 minutes',
      quickWin: 'Use the 4-7-8 breathing technique tonight',
      helpWith: ['Premature ejaculation', 'Performance anxiety', 'Lasting longer', 'Bedroom confidence']
    },
    ryan: {
      name: 'Ryan',
      icon: '🗣️',
      color: 'from-green-500 to-emerald-600',
      expertise: 'Social Skills & Dating Coach',
      todayAction: 'Start one conversation with a stranger',
      quickWin: 'Make eye contact and smile at 3 people today',
      helpWith: ['Approach anxiety', 'Dating apps', 'Conversation skills', 'Rejection recovery']
    }
  }

  // Load user data
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
  const goToSolutions = () => router.push('/solutions')
  const goToProgress = () => router.push('/progress')

  if (isLoading || !user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🚀</div>
          <h2 className="text-2xl font-bold">Loading your dashboard...</h2>
        </div>
      </div>
    )
  }

  const coach = coachData[user.avatar_type] || coachData.marcus

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white">
      {/* Simple Header */}
      <header className="p-6 flex justify-between items-center border-b border-white/10">
        <div className="text-2xl font-black bg-gradient-to-r from-red-500 to-red-600 bg-clip-text text-transparent">
          AlphaRise
        </div>
        <div className="flex items-center gap-4">
          <div className="text-sm opacity-70">{currentTime}</div>
          <div className="bg-yellow-500/20 text-yellow-400 px-3 py-1 rounded-full text-sm font-semibold flex items-center gap-1">
            <span>🪙</span>
            {user.coins}
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8 max-w-4xl">
        
        {/* Welcome - Focused on TODAY */}
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
              <h1 className="text-3xl font-bold">
                Hey {user.username}! 👋
              </h1>
              <p className="text-lg opacity-70">Your coach {coach.name} • {coach.expertise}</p>
            </div>
          </div>

          {/* Today's Action - THE MAIN FOCUS */}
          <div className="bg-gradient-to-r from-red-500/20 to-orange-500/20 border border-red-500/30 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-2xl">🎯</span>
              <h2 className="text-xl font-bold">Today's Action</h2>
            </div>
            <p className="text-lg mb-4 opacity-90">{coach.todayAction}</p>
            <div className="flex gap-3">
              <button className="px-6 py-3 bg-red-600 hover:bg-red-700 rounded-lg font-semibold transition-colors">
                Start Now (2 min)
              </button>
              <button className="px-6 py-3 bg-white/10 hover:bg-white/20 rounded-lg font-semibold transition-colors">
                Mark Complete ✓
              </button>
            </div>
          </div>
        </motion.div>

        {/* Quick Win */}
        <motion.div 
          className="mb-8 bg-green-500/10 border border-green-500/30 rounded-xl p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <div className="flex items-center gap-3 mb-3">
            <span className="text-xl">⚡</span>
            <h3 className="text-lg font-semibold text-green-400">Quick Win</h3>
          </div>
          <p className="opacity-90">{coach.quickWin}</p>
        </motion.div>

        {/* Main Actions - SIMPLE */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          
          {/* Get Help */}
          <motion.div 
            className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6"
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
              <span>💬</span> Get Help
            </h3>
            <p className="mb-4 opacity-80">Ask questions, share struggles, and learn from men who've been there.</p>
            <button
              onClick={goToCommunity}
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold transition-colors"
            >
              Join Community
            </button>
          </motion.div>

          {/* Proven Solutions */}
          <motion.div 
            className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6"
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
              <span>📚</span> Proven Solutions
            </h3>
            <p className="mb-4 opacity-80">Step-by-step guides and techniques that actually work.</p>
            <button
              onClick={goToSolutions}
              className="w-full py-3 bg-green-600 hover:bg-green-700 rounded-lg font-semibold transition-colors"
            >
              Browse Solutions
            </button>
          </motion.div>
        </div>

        {/* What I Help With - CLEAR VALUE */}
        <motion.div 
          className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
        >
          <h3 className="text-xl font-bold mb-4">What {coach.name} helps you with:</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {coach.helpWith.map((topic, index) => (
              <div 
                key={index}
                className="bg-white/10 rounded-lg p-3 text-center text-sm font-semibold"
              >
                {topic}
              </div>
            ))}
          </div>
        </motion.div>

        {/* Simple Progress - ONLY MEANINGFUL METRICS */}
        <motion.div 
          className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
        >
          <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
            <span>📈</span> Your Progress
          </h3>
          
          <div className="grid grid-cols-3 gap-6 text-center">
            <div>
              <div className="text-2xl font-bold text-green-400">{user.streak}</div>
              <div className="text-sm opacity-70">Days Active</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-blue-400">{user.total_earned}</div>
              <div className="text-sm opacity-70">Total Coins Earned</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-purple-400">{user.confidence_score}%</div>
              <div className="text-sm opacity-70">Confidence Level</div>
            </div>
          </div>

          <button 
            onClick={goToProgress}
            className="w-full mt-6 py-3 bg-white/10 hover:bg-white/20 rounded-lg font-semibold transition-colors"
          >
            View Detailed Progress
          </button>
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
        </div>
      </div>
    }>
      <DashboardContent />
    </Suspense>
  )
}