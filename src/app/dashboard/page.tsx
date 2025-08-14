'use client'

import { useSearchParams } from 'next/navigation'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { useState, useEffect, Suspense } from 'react'

function DashboardContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [avatarType, setAvatarType] = useState('marcus')
  const [userEmail, setUserEmail] = useState('')
  const [userName, setUserName] = useState('')
  const [trialDaysLeft, setTrialDaysLeft] = useState(7)
  const [currentTime, setCurrentTime] = useState('')
  const [confidenceScore, setConfidenceScore] = useState(0)
  const [coins, setCoins] = useState(200)
  const [experience, setExperience] = useState(0)
  const [level, setLevel] = useState(1)
  const [streak, setStreak] = useState(1)

  const avatarData = {
    marcus: {
      name: 'Marcus',
      fullName: 'Marcus "The Overthinker"',
      icon: '🧠',
      color: 'from-blue-500 to-purple-600',
      communityName: 'Overthinker\'s Circle',
      todayChallenge: 'Make one decision in under 10 seconds',
      quickTip: 'The 3-Second Rule: Count 3-2-1 and ACT before your mind sabotages you'
    },
    jake: {
      name: 'Jake',
      fullName: 'Jake "The Performer"',
      icon: '⚡',
      color: 'from-yellow-500 to-orange-600',
      communityName: 'Performance Squad',
      todayChallenge: 'Practice confident posture for 5 minutes',
      quickTip: 'Champion\'s Breathing: 4 counts in, 7 hold, 8 out - instant confidence'
    },
    alex: {
      name: 'Alex',
      fullName: 'Alex "The Student"',
      icon: '📚',
      color: 'from-green-500 to-emerald-600',
      communityName: 'Learning Brotherhood',
      todayChallenge: 'Ask one question in the community',
      quickTip: 'Knowledge builds confidence: Every expert was once a beginner'
    },
    ryan: {
      name: 'Ryan',
      fullName: 'Ryan "The Rising King"',
      icon: '💎',
      color: 'from-purple-500 to-pink-600',
      communityName: 'Rising Kings Court',
      todayChallenge: 'Approach one new person today',
      quickTip: 'King\'s Posture: Shoulders back, chest out, chin up - instant authority'
    },
    ethan: {
      name: 'Ethan',
      fullName: 'Ethan "The Connection Master"',
      icon: '❤️',
      color: 'from-red-500 to-rose-600',
      communityName: 'Connection Masters',
      todayChallenge: 'Have one meaningful conversation',
      quickTip: 'Heart-to-Heart: Ask "How are you feeling?" instead of "How are you?"'
    }
  }

  const currentAvatar = avatarData[avatarType as keyof typeof avatarData] || avatarData.marcus

  useEffect(() => {
    // Get params from URL
    const avatar = searchParams.get('avatar') || 'marcus'
    const email = searchParams.get('email') || ''
    const name = searchParams.get('name') || 'Future Alpha'
    const trial = searchParams.get('trial') === 'true'
    
    setAvatarType(avatar)
    setUserEmail(email)
    setUserName(name)

    // Update time
    const updateTime = () => {
      const now = new Date()
      const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      setCurrentTime(timeStr)
    }
    updateTime()
    const timeInterval = setInterval(updateTime, 1000)

    // Animate confidence score
    let score = 0
    const scoreInterval = setInterval(() => {
      score += 2
      setConfidenceScore(score)
      if (score >= 34) clearInterval(scoreInterval)
    }, 50)

    // Animate experience
    let exp = 0
    const expInterval = setInterval(() => {
      exp += 5
      setExperience(exp)
      if (exp >= 150) clearInterval(expInterval)
    }, 80)

    return () => {
      clearInterval(timeInterval)
      clearInterval(scoreInterval)
      clearInterval(expInterval)
    }
  }, [searchParams])

  const goToCommunity = () => {
    router.push(`/community?avatar=${avatarType}`)
  }

  const startChallenge = () => {
    alert(`Starting today's challenge! ${currentAvatar.todayChallenge}`)
  }

  const openAchievements = () => {
    alert('Achievements system coming soon!')
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
            {trialDaysLeft} days trial left
          </div>
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
            <div className="text-4xl">{currentAvatar.icon}</div>
            <div>
              <h1 className="text-2xl font-bold">Welcome back, {userName}!</h1>
              <p className="text-lg opacity-70">Your coach {currentAvatar.name} is ready to help you level up</p>
            </div>
          </div>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {/* Coins */}
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
            <div className="text-2xl font-bold">{coins}</div>
            <div className="text-xs opacity-70">Monthly allowance</div>
          </motion.div>

          {/* Experience */}
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
            <div className="text-2xl font-bold">{experience}</div>
            <div className="text-xs opacity-70">Level {level} progress</div>
          </motion.div>

          {/* Streak */}
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
            <div className="text-2xl font-bold">{streak}</div>
            <div className="text-xs opacity-70">Days active</div>
          </motion.div>

          {/* Confidence Score */}
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
            <div className="text-2xl font-bold">{confidenceScore}%</div>
            <div className="text-xs opacity-70">Assessment score</div>
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
                className={`w-16 h-16 rounded-full bg-gradient-to-br ${currentAvatar.color} flex items-center justify-center text-2xl shadow-2xl`}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.6, delay: 0.4, type: "spring", bounce: 0.5 }}
              >
                {currentAvatar.icon}
              </motion.div>
              
              <div className="flex-1">
                <h2 className="text-xl font-bold mb-2">{currentAvatar.communityName}</h2>
                <p className="text-lg mb-4 opacity-90">
                  Your tribe of like-minded men on the same journey. Share experiences, ask questions, and learn from each other.
                </p>
                
                <div className="bg-white/10 rounded-lg p-4 border-l-4 border-red-500 mb-4">
                  <p className="text-sm font-semibold text-red-400 mb-1">💡 Today's Quick Tip</p>
                  <p className="text-sm opacity-90">{currentAvatar.quickTip}</p>
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
                <p className="font-semibold text-red-400 mb-3">{currentAvatar.todayChallenge}</p>
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
                  <span className="text-sm opacity-70">Level {level}</span>
                  <span className="text-sm font-semibold">{experience}/250 XP</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-3 overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-purple-500 to-purple-600 rounded-full transition-all duration-1000"
                    style={{ width: `${(experience / 250) * 100}%` }}
                  ></div>
                </div>
                <p className="text-xs opacity-70 text-center">
                  {250 - experience} XP to Level {level + 1}
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
  onClick={() => router.push('/coins')}
  className="w-full p-3 bg-yellow-600/20 hover:bg-yellow-600/30 rounded-lg transition-colors text-left flex items-center gap-3"
>
  <span>🪙</span>
  <div>
    <div className="font-semibold">Coin Economy</div>
    <div className="text-xs opacity-70">Manage your coins & rewards</div>
  </div>
</button>

              </div>
            </div>
          </motion.div>
        </div>

        {/* Recent Activity */}
        <motion.div 
          className="mt-8 bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
        >
          <h3 className="text-xl font-semibold mb-6 flex items-center gap-2">
            <span>📋</span> Recent Community Activity
          </h3>
          <div className="space-y-4">
            {[
              { user: "Mike_Confident", action: "answered your question about approaching women", time: "2h ago", coins: "+5" },
              { user: "David_Phoenix", action: "shared a success story in your community", time: "4h ago", coins: "+8" },
              { user: "Coach_Dan", action: "gave you expert advice on confidence building", time: "1d ago", coins: "+12" }
            ].map((activity, index) => (
              <motion.div 
                key={index}
                className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-white/5"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: 0.8 + (index * 0.1) }}
              >
                <div className="flex-1">
                  <p className="text-sm">
                    <span className="font-semibold text-blue-400">{activity.user}</span>
                    <span className="opacity-70"> {activity.action}</span>
                  </p>
                  <p className="text-xs opacity-50">{activity.time}</p>
                </div>
                <div className="text-yellow-400 font-semibold text-sm">
                  {activity.coins} 🪙
                </div>
              </motion.div>
            ))}
          </div>
          
          <button 
            onClick={goToCommunity}
            className="w-full mt-6 py-3 bg-gradient-to-r from-red-600 to-red-700 rounded-lg font-semibold transition-all duration-300 hover:from-red-700 hover:to-red-800"
          >
            View All Community Activity
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