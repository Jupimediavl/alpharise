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
  const [trialDaysLeft, setTrialDaysLeft] = useState(7)
  const [currentTime, setCurrentTime] = useState('')
  const [confidenceScore, setConfidenceScore] = useState(0)

  const avatarData = {
    marcus: {
      name: 'Marcus',
      fullName: 'Marcus "The Overthinker"',
      icon: '🧠',
      color: 'from-blue-500 to-purple-600',
      greeting: "Hey there! Marcus here. I can already tell you're the type who thinks things through carefully - that's actually your superpower, even if it doesn't always feel like it.",
      firstMessage: "Let's start by getting you out of that mental loop and into action. I've been exactly where you are, and I know the way out.",
      todaysFocus: "Stop overthinking, start doing",
      quickWin: "The 3-Second Rule technique that kills analysis paralysis instantly"
    },
    jake: {
      name: 'Jake',
      fullName: 'Jake "The Performer"',
      icon: '⚡',
      color: 'from-yellow-500 to-orange-600',
      greeting: "What's up! Jake here, and I'm pumped to work with you. I can see you're someone who wants to excel at everything - that drive is going to serve you well.",
      firstMessage: "Performance anxiety? Been there, conquered that. Let me show you how to turn that competitive energy into unshakeable bedroom confidence.",
      todaysFocus: "Transform pressure into power",
      quickWin: "The Champion's Breathing technique that eliminates performance anxiety in 60 seconds"
    },
    alex: {
      name: 'Alex',
      fullName: 'Alex "The Student"',
      icon: '📚',
      color: 'from-green-500 to-emerald-600',
      greeting: "Hey! Alex here, and honestly, I'm excited to work with you. Your willingness to learn puts you ahead of 90% of guys out there.",
      firstMessage: "Most men are too proud to admit they need help, but you're different. That growth mindset is going to transform your confidence faster than you think.",
      todaysFocus: "Build knowledge, build confidence",
      quickWin: "The Confidence Foundation - 5 principles every confident man knows"
    },
    ryan: {
      name: 'Ryan',
      fullName: 'Ryan "The Rising King"',
      icon: '💎',
      color: 'from-purple-500 to-pink-600',
      greeting: "Hey! Ryan here. I can see that spark in you - those moments when your natural charisma shines through. That's what we're going to unlock permanently.",
      firstMessage: "You don't lack confidence, you just can't access it consistently. I'm here to change that. No more good days and bad days - just reliable, magnetic presence.",
      todaysFocus: "Unlock your consistent confidence",
      quickWin: "The King's Posture technique that instantly activates your natural charisma"
    },
    ethan: {
      name: 'Ethan',
      fullName: 'Ethan "The Connection Master"',
      icon: '❤️',
      color: 'from-red-500 to-rose-600',
      greeting: "Hey there! Ethan here. I can tell you're someone who values real connection - that emotional intelligence you have is actually rare and incredibly powerful.",
      firstMessage: "Most guys think it's all about techniques, but you understand it's about genuine connection. Let me show you how to combine that with confident physical presence.",
      todaysFocus: "Deep connection + confident expression",
      quickWin: "The Heart-to-Heart technique that creates instant emotional intimacy"
    }
  }

  const currentAvatar = avatarData[avatarType as keyof typeof avatarData] || avatarData.marcus

  useEffect(() => {
    // Get params from URL
    const avatar = searchParams.get('avatar') || 'marcus'
    const email = searchParams.get('email') || ''
    const trial = searchParams.get('trial') === 'true'
    
    setAvatarType(avatar)
    setUserEmail(email)

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

    return () => {
      clearInterval(timeInterval)
      clearInterval(scoreInterval)
    }
  }, [searchParams])

  const startChat = () => {
    router.push(`/chat?avatar=${avatarType}`)
  }

  const startLesson = () => {
    alert(`Starting your first lesson with ${currentAvatar.name}! (Lesson system coming soon)`)
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
          className="mb-12"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex items-center gap-4 mb-6">
            <div className="text-5xl">{currentAvatar.icon}</div>
            <div>
              <h1 className="text-3xl font-bold">Welcome to your transformation</h1>
              <p className="text-lg opacity-70">Your personal coach {currentAvatar.name} is ready</p>
            </div>
          </div>
        </motion.div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Coach Introduction */}
          <motion.div 
            className="lg:col-span-2 bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8"
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className="flex items-start gap-6">
              <motion.div 
                className={`w-20 h-20 rounded-full bg-gradient-to-br ${currentAvatar.color} flex items-center justify-center text-3xl shadow-2xl`}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.6, delay: 0.4, type: "spring", bounce: 0.5 }}
              >
                {currentAvatar.icon}
              </motion.div>
              
              <div className="flex-1">
                <h2 className="text-2xl font-bold mb-4">{currentAvatar.fullName}</h2>
                <div className="space-y-4">
                  <div className="bg-white/10 rounded-lg p-4 border-l-4 border-red-500">
                    <p className="text-lg leading-relaxed italic">
                      "{currentAvatar.greeting}"
                    </p>
                  </div>
                  <p className="text-lg leading-relaxed opacity-90">
                    {currentAvatar.firstMessage}
                  </p>
                </div>
                
                <motion.button
                  onClick={startChat}
                  className="mt-6 px-6 py-3 bg-gradient-to-r from-red-600 to-red-700 rounded-lg font-semibold
                           transition-all duration-300 ease-out"
                  whileHover={{ scale: 1.05, y: -1 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Start chatting with {currentAvatar.name}
                </motion.button>
              </div>
            </div>
          </motion.div>

          {/* Progress Sidebar */}
          <motion.div 
            className="space-y-6"
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            {/* Confidence Score */}
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
              <h3 className="text-lg font-semibold mb-4">Your Confidence Score</h3>
              <div className="relative">
                <div className="w-32 h-32 rounded-full border-8 border-gray-700 relative mx-auto">
                  <div 
                    className="absolute inset-0 rounded-full border-8 border-red-500 border-t-transparent transition-all duration-1000"
                    style={{ 
                      transform: `rotate(${(confidenceScore / 100) * 360}deg)`,
                      borderTopColor: confidenceScore > 50 ? '#ef4444' : 'transparent'
                    }}
                  ></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-2xl font-bold">{confidenceScore}%</span>
                  </div>
                </div>
                <p className="text-center mt-4 text-sm opacity-70">
                  Based on your assessment
                </p>
              </div>
            </div>

            {/* Today's Focus */}
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
              <h3 className="text-lg font-semibold mb-4">Today's Focus</h3>
              <div className="text-center">
                <div className="text-3xl mb-3">🎯</div>
                <p className="font-semibold text-red-400 mb-2">{currentAvatar.todaysFocus}</p>
                <p className="text-sm opacity-70 leading-relaxed">
                  {currentAvatar.quickWin}
                </p>
              </div>
              <button 
                onClick={startLesson}
                className="w-full mt-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-all duration-300"
              >
                Start Today's Lesson
              </button>
            </div>

            {/* Quick Stats */}
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
              <h3 className="text-lg font-semibold mb-4">Your Progress</h3>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="opacity-70">Lessons completed</span>
                  <span className="font-semibold">0/5</span>
                </div>
                <div className="flex justify-between">
                  <span className="opacity-70">Exercises done</span>
                  <span className="font-semibold">0/3</span>
                </div>
                <div className="flex justify-between">
                  <span className="opacity-70">Streak</span>
                  <span className="font-semibold text-red-400">Day 1</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Action Cards */}
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
        >
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 text-center">
            <div className="text-3xl mb-4">💬</div>
            <h3 className="font-semibold mb-2">Chat with {currentAvatar.name}</h3>
            <p className="text-sm opacity-70 mb-4">Get instant answers and guidance</p>
            <button 
              onClick={startChat}
              className="w-full py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
            >
              Start Chat
            </button>
          </div>

          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 text-center">
            <div className="text-3xl mb-4">📚</div>
            <h3 className="font-semibold mb-2">Today's Lesson</h3>
            <p className="text-sm opacity-70 mb-4">Personalized for your type</p>
            <button 
              onClick={startLesson}
              className="w-full py-2 bg-green-600 hover:bg-green-700 rounded-lg transition-colors"
            >
              Start Learning
            </button>
          </div>

          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 text-center">
            <div className="text-3xl mb-4">⚡</div>
            <h3 className="font-semibold mb-2">Quick Exercise</h3>
            <p className="text-sm opacity-70 mb-4">5-minute confidence boost</p>
            <button className="w-full py-2 bg-red-600 hover:bg-red-700 rounded-lg transition-colors">
              Start Exercise
            </button>
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
        </div>
      </div>
    }>
      <DashboardContent />
    </Suspense>
  )
}