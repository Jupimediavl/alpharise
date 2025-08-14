'use client'

import { motion } from 'framer-motion'
import { useState, useEffect, Suspense } from 'react'
import { useAlphaRise, withUserAuth } from '@/lib/user-context'

function DashboardContent() {
  const { user, avatar, navigation, updateUser } = useAlphaRise()
  const [currentTime, setCurrentTime] = useState('')

  // DEBUG - să vedem ce date primim
  useEffect(() => {
    console.log('Dashboard - User data:', user)
    console.log('Dashboard - Username:', user?.userName)
    console.log('Dashboard - URL params:', window.location.search)
    console.log('Dashboard - localStorage:', localStorage.getItem('alpharise_user'))
  }, [user])

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

  // If no user or avatar data, show loading
  if (!user || !avatar) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🚀</div>
          <h2 className="text-2xl font-bold">Loading your dashboard...</h2>
        </div>
      </div>
    )
  }

  const startChallenge = () => {
    alert(`Starting today's challenge! ${avatar.todayChallenge}`)
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
            {user.trialDaysLeft} days trial left
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
            <div className="text-4xl">{avatar.icon}</div>
            <div>
              <h1 className="text-2xl font-bold">
                Welcome back, {user.userName || 'Alpha'}!
              </h1>
              <p className="text-lg opacity-70">Your coach {avatar.name} is ready to help you level up</p>
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
            <div className="text-2xl font-bold">{user.coins}</div>
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
            <div className="text-2xl font-bold">{user.experience}</div>
            <div className="text-xs opacity-70">Level {user.level} progress</div>
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
            <div className="text-2xl font-bold">{user.streak}</div>
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
            <div className="text-2xl font-bold">{user.confidenceScore}%</div>
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
                  onClick={navigation.goToCommunity}
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
                  <span className="text-sm opacity-70">Level {user.level}</span>
                  <span className="text-sm font-semibold">{user.experience}/250 XP</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-3 overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-purple-500 to-purple-600 rounded-full transition-all duration-1000"
                    style={{ width: `${(user.experience / 250) * 100}%` }}
                  ></div>
                </div>
                <p className="text-xs opacity-70 text-center">
                  {250 - user.experience} XP to Level {user.level + 1}
                </p>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
              <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <button 
                  onClick={navigation.goToCommunity}
                  className="w-full p-3 bg-blue-600/20 hover:bg-blue-600/30 rounded-lg transition-colors text-left flex items-center gap-3"
                >
                  <span>❓</span>
                  <div>
                    <div className="font-semibold">Ask Question</div>
                    <div className="text-xs opacity-70">Get help from community</div>
                  </div>
                </button>
                
                <button 
                  onClick={navigation.goToCommunity}
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
                  onClick={navigation.goToCoins}
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
            onClick={navigation.goToCommunity}
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
      <DashboardWithAuth />
    </Suspense>
  )
}

const DashboardWithAuth = withUserAuth(DashboardContent)