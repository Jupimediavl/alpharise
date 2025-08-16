// Personalized Problem-Solution Oriented Dashboard

'use client'

import { motion } from 'framer-motion'
import { useState, useEffect, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { SupabaseUserManager, DbUser } from '@/lib/supabase'
import { simpleCoinHelpers } from '@/lib/simple-coin-system'
import { ChevronRight, Zap, Target, AlertCircle, CheckCircle, Play, Book, Users, TrendingUp, Search, Send, MessageCircle, Coins, User, Settings, BarChart3, CreditCard, ChevronDown, LogOut } from 'lucide-react'

// Types
interface Solution {
  title: string
  action: string
  type: string
  description: string
}

interface BaseProblem {
  primaryProblem: string
  description: string
  icon: string
  color: string
  urgency: string
  solutions: Solution[]
}

interface PersonalizedProblem extends BaseProblem {
  ageContext?: string
  ageSpecificNote?: string
}

// Problem-Solution Matrix based on Avatar + Age
const getPersonalizedProblems = (avatarType: string, userAge: number): PersonalizedProblem => {
  const baseProblems = {
    marcus: {
      primaryProblem: "Overthinking is killing your confidence",
      description: "Your analytical mind works against you in social situations",
      icon: "🧠",
      color: "from-purple-500 to-pink-500",
      urgency: "high",
      solutions: [
        {
          title: "Stop Analysis Paralysis",
          action: "5-minute confidence reset",
          type: "immediate",
          description: "Break the overthinking loop RIGHT NOW"
        },
        {
          title: "Channel Mental Energy",
          action: "Turn thinking into power",
          type: "practice",
          description: "Use your analytical mind as a weapon"
        }
      ]
    },
    alex: {
      primaryProblem: "You feel behind and inexperienced",
      description: "Everyone else seems to know something you don't",
      icon: "📚",
      color: "from-blue-500 to-purple-500",
      urgency: "medium",
      solutions: [
        {
          title: "Beginner's Advantage",
          action: "Start with fundamentals",
          type: "learning",
          description: "Turn inexperience into fresh perspective"
        },
        {
          title: "Rapid Skill Building",
          action: "Daily micro-practices",
          type: "practice",
          description: "Catch up faster than you think"
        }
      ]
    },
    ryan: {
      primaryProblem: "Inconsistent confidence holds you back",
      description: "You have great moments but can't maintain them",
      icon: "💎",
      color: "from-magenta-500 to-pink-500",
      urgency: "high",
      solutions: [
        {
          title: "Consistency System",
          action: "Build reliable confidence",
          type: "system",
          description: "Make your good days your normal days"
        },
        {
          title: "Momentum Builder",
          action: "Stack small wins",
          type: "practice",
          description: "Turn potential into consistent results"
        }
      ]
    },
    jake: {
      primaryProblem: "Performance anxiety stops you from trying",
      description: "Fear of not being good enough keeps you stuck",
      icon: "⚡",
      color: "from-purple-500 to-magenta-600",
      urgency: "high",
      solutions: [
        {
          title: "Performance Breakthrough",
          action: "Overcome anxiety triggers",
          type: "immediate",
          description: "Stop letting fear control your actions"
        },
        {
          title: "Excellence Training",
          action: "Build unshakeable skills",
          type: "practice",
          description: "Become so good anxiety disappears"
        }
      ]
    },
    ethan: {
      primaryProblem: "Shallow connections frustrate you",
      description: "You want depth but struggle to create it",
      icon: "❤️",
      color: "from-pink-500 to-purple-600",
      urgency: "medium",
      solutions: [
        {
          title: "Deep Connection Formula",
          action: "Create meaningful bonds",
          type: "technique",
          description: "Turn conversations into connections"
        },
        {
          title: "Emotional Intelligence",
          action: "Read and respond perfectly",
          type: "skill",
          description: "Use your natural empathy as strength"
        }
      ]
    }
  }

  let problems: PersonalizedProblem = baseProblems[avatarType as keyof typeof baseProblems] || baseProblems.marcus
  
  // Age-based modifications
  if (userAge >= 18 && userAge <= 22) {
    problems = {
      ...problems,
      ageContext: "College/Early Career Phase",
      ageSpecificNote: "Your age is actually an advantage - you're building habits that will last a lifetime"
    }
  } else if (userAge >= 23 && userAge <= 27) {
    problems = {
      ...problems,
      ageContext: "Quarter-Life Transition",
      ageSpecificNote: "This is prime time for transformation - you have energy and wisdom"
    }
  } else if (userAge >= 28 && userAge <= 35) {
    problems = {
      ...problems,
      ageContext: "Peak Performance Years",
      ageSpecificNote: "You have experience and resources - time to leverage them fully"
    }
  } else if (userAge >= 36) {
    problems = {
      ...problems,
      ageContext: "Wisdom & Experience Phase",
      ageSpecificNote: "Your maturity is attractive - focus on authentic confidence"
    }
  }

  return problems
}

// AI Response Generator using OpenAI API
const generateAIResponse = async (query: string, avatarType: string, userAge: number, username: string) => {
  try {
    const response = await fetch('/api/ai-coach', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query,
        avatarType,
        userAge,
        username
      })
    })

    if (!response.ok) {
      throw new Error('API request failed')
    }

    const data = await response.json()
    
    if (data.success) {
      return {
        response: data.response,
        source: 'openai' as const
      }
    } else {
      // Return fallback response if API fails
      return {
        response: data.response,
        source: 'fallback' as const
      }
    }
  } catch (error) {
    console.error('Error calling AI Coach API:', error)
    
    // Local fallback if API is completely down
    const fallbackMessages = {
      marcus: `Hey ${username}, I'm having some technical issues right now, but I hear you. Let's think this through together - your analytical mind is actually a superpower. Whatever you're dealing with regarding "${query}" is completely normal. Can you try asking me again in a moment?`,
      alex: `Hey ${username}! Don't worry, this is totally normal - I'm just having a small technical hiccup. About "${query}" - let me break this down for you once my systems are back up. You're learning faster than you think!`,
      ryan: `${username}, you've got this spark in me! I'm just having a quick system restart, but I'm excited to help you with "${query}". Time to level up - try asking me again in a second!`,
      jake: `Alright ${username}, here's the game plan - I'm optimizing my systems right now, but I'll be back to help you with "${query}" in just a moment. Time to perform like a champion!`,
      ethan: `${username}, your feelings about "${query}" are completely valid. I'm having a small technical moment, but let's focus on genuine connection - try reaching out again in just a second. Authentic confidence is your greatest strength!`
    }
    
    return {
      response: fallbackMessages[avatarType as keyof typeof fallbackMessages] || fallbackMessages.marcus,
      source: 'local' as const
    }
  }
}

function DashboardContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [user, setUser] = useState<DbUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [currentTime, setCurrentTime] = useState('')
  const [userCoinStats, setUserCoinStats] = useState<any>(null)
  const [userAge, setUserAge] = useState<number>(25) // Default age
  const [problemsData, setProblemsData] = useState<any>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [isSearching, setIsSearching] = useState(false)
  const [aiResponse, setAiResponse] = useState<string | null>(null)
  const [showChat, setShowChat] = useState(false)
  const [responseSource, setResponseSource] = useState<'openai' | 'fallback' | 'local' | null>(null)
  const [responseTime, setResponseTime] = useState<number>(0)
  const [showUserDropdown, setShowUserDropdown] = useState(false)

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

        // Load user age from localStorage (from assessment)
        const alphariseUser = localStorage.getItem('alpharise_user')
        let ageToUse = userAge // default
        if (alphariseUser) {
          const parsedUser = JSON.parse(alphariseUser)
          if (parsedUser.age) {
            ageToUse = parsedUser.age
            setUserAge(ageToUse)
          }
        }

        // Generate personalized problems based on avatar + age
        const personalizedProblems = getPersonalizedProblems(userData.avatar_type, ageToUse)
        setProblemsData(personalizedProblems)

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
  
  // Handle AI Search
  const handleSearch = async () => {
    if (!searchQuery.trim() || !user) return
    
    setIsSearching(true)
    setShowChat(true)
    const startTime = Date.now()
    
    try {
      const result = await generateAIResponse(searchQuery, user.avatar_type, userAge, user.username)
      const endTime = Date.now()
      
      setAiResponse(result.response)
      setResponseSource(result.source)
      setResponseTime(endTime - startTime)
      
      // Debug logging
      console.log('🤖 AI Coach Response Details:', {
        query: searchQuery,
        avatar: user.avatar_type,
        age: userAge,
        source: result.source,
        responseTime: endTime - startTime,
        responseLength: result.response.length
      })
    } catch (error) {
      console.error('AI Search error:', error)
      setAiResponse('Sorry, I had trouble processing that. Can you try rephrasing your question?')
      setResponseSource('local')
      setResponseTime(Date.now() - startTime)
    } finally {
      setIsSearching(false)
    }
  }
  
  // Handle Enter key
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSearch()
    }
  }

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
      {/* Header with User Dropdown */}
      <header className="p-6 flex justify-between items-center border-b border-purple-500/20">
        <button
          onClick={() => router.push('/')}
          className="text-2xl font-black text-white hover:text-purple-400 transition-colors"
        >
          AlphaRise
        </button>
        <div className="flex items-center gap-4">
          <div className="text-sm opacity-70">{currentTime}</div>
          
          {/* Coins Display */}
          <div className="bg-gradient-to-r from-purple-500/20 to-magenta-500/20 text-white px-3 py-1 rounded-full text-sm font-semibold flex items-center gap-1 border border-purple-500/30">
            <span>🪙</span>
            {userCoinStats?.profile?.currentBalance || user?.coins || 0}
          </div>

          {/* User Profile Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowUserDropdown(!showUserDropdown)}
              className="flex items-center gap-3 bg-gray-800/50 hover:bg-gray-700/50 px-4 py-2 rounded-xl border border-gray-600/30 hover:border-purple-500/30 transition-all"
            >
              {/* User Avatar */}
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-sm">
                {user?.username?.charAt(0).toUpperCase() || 'U'}
              </div>
              
              {/* User Info */}
              <div className="text-left hidden md:block">
                <div className="text-sm font-semibold text-white">{user?.username || 'User'}</div>
                <div className="text-xs text-gray-400">{user?.avatar_type || 'Member'}</div>
              </div>
              
              <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${showUserDropdown ? 'rotate-180' : ''}`} />
            </button>

            {/* Dropdown Menu */}
            {showUserDropdown && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                className="absolute right-0 mt-2 w-64 bg-gray-800/95 backdrop-blur border border-gray-600/30 rounded-xl shadow-2xl z-50"
              >
                {/* User Info Header */}
                <div className="p-4 border-b border-gray-600/30">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold">
                      {user?.username?.charAt(0).toUpperCase() || 'U'}
                    </div>
                    <div>
                      <div className="font-semibold text-white">{user?.username || 'User'}</div>
                      <div className="text-sm text-gray-400">{user?.email || 'member@alpharise.app'}</div>
                      <div className="text-xs text-purple-400 capitalize">{user?.avatar_type || 'Member'} • Level {user?.level || 1}</div>
                    </div>
                  </div>
                </div>

                {/* Menu Items */}
                <div className="py-2">
                  <button
                    onClick={() => {
                      router.push('/profile')
                      setShowUserDropdown(false)
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3 text-gray-300 hover:bg-gray-700/50 hover:text-white transition-all"
                  >
                    <User className="w-5 h-5" />
                    <span>Profile</span>
                  </button>
                  
                  <button
                    onClick={() => {
                      router.push('/settings')
                      setShowUserDropdown(false)
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3 text-gray-300 hover:bg-gray-700/50 hover:text-white transition-all"
                  >
                    <Settings className="w-5 h-5" />
                    <span>Settings</span>
                  </button>
                  
                  <button
                    onClick={() => {
                      router.push('/analytics')
                      setShowUserDropdown(false)
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3 text-gray-300 hover:bg-gray-700/50 hover:text-white transition-all"
                  >
                    <BarChart3 className="w-5 h-5" />
                    <span>Analytics</span>
                  </button>
                  
                  <button
                    onClick={() => {
                      router.push('/billing')
                      setShowUserDropdown(false)
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3 text-gray-300 hover:bg-gray-700/50 hover:text-white transition-all"
                  >
                    <CreditCard className="w-5 h-5" />
                    <span>Billing</span>
                  </button>
                </div>

                {/* Logout */}
                <div className="border-t border-gray-600/30 py-2">
                  <button
                    onClick={() => {
                      setShowUserDropdown(false)
                      router.push('/login')
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3 text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-all"
                  >
                    <LogOut className="w-5 h-5" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8 max-w-6xl">
        
        {/* AI Personal Coach Search */}
        <motion.div 
          className="mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="bg-gradient-to-r from-purple-500/20 to-magenta-500/20 border border-purple-500/30 rounded-2xl p-6 backdrop-blur-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${problemsData?.color || 'from-purple-500 to-magenta-500'} flex items-center justify-center text-xl`}>
                {problemsData?.icon || '🤝'}
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Ask {coach.name} Anything</h2>
                <p className="text-sm opacity-70">Your personal coach who understands your exact situation</p>
              </div>
            </div>
            
            <div className="relative">
              <div className="flex gap-3">
                <div className="flex-1 relative">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-purple-400" />
                  <input
                    type="text"
                    placeholder="What's on your mind? (e.g., 'I'm nervous about approaching women' or 'How do I last longer in bed?')"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={handleKeyPress}
                    className="w-full pl-12 pr-4 py-4 bg-black/60 border border-purple-500/30 rounded-xl text-white placeholder-gray-400 focus:border-purple-500 focus:outline-none text-lg"
                  />
                </div>
                <button
                  onClick={handleSearch}
                  disabled={!searchQuery.trim() || isSearching}
                  className="px-6 py-4 bg-gradient-to-r from-purple-600 to-magenta-600 hover:from-purple-700 hover:to-magenta-700 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed rounded-xl font-semibold transition-all transform hover:scale-105 disabled:scale-100 flex items-center gap-2"
                >
                  {isSearching ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                      <span>Thinking...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-5 h-5" />
                      <span>Ask {coach.name}</span>
                    </>
                  )}
                </button>
              </div>
              
              <div className="mt-3 text-xs opacity-60 flex items-center gap-4">
                <span>💡 Try: "I feel anxious when talking to women"</span>
                <span>💡 Try: "How do I build confidence?"</span>
                <span>💡 Try: "I'm struggling with dating apps"</span>
              </div>
            </div>
          </div>
          
          {/* AI Response Chat */}
          {showChat && (
            <motion.div 
              className="mt-6 bg-black/40 border border-purple-500/20 rounded-2xl p-6 backdrop-blur-sm"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              transition={{ duration: 0.5 }}
            >
              <div className="flex items-start gap-4">
                <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${coach.color} flex items-center justify-center text-lg flex-shrink-0`}>
                  {coach.icon}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-3">
                    <h3 className="font-bold text-white">{coach.name}</h3>
                    <div className="text-xs text-purple-400 bg-purple-500/20 px-2 py-1 rounded-full">
                      Personal Coach
                    </div>
                    
                    {/* Response Source Indicator */}
                    {responseSource && (
                      <div className={`text-xs px-2 py-1 rounded-full font-semibold ${
                        responseSource === 'openai' 
                          ? 'bg-green-500/20 text-green-400' 
                          : responseSource === 'fallback'
                          ? 'bg-yellow-500/20 text-yellow-400'
                          : 'bg-red-500/20 text-red-400'
                      }`}>
                        {responseSource === 'openai' ? '🤖 AI Live' : 
                         responseSource === 'fallback' ? '⚡ API Backup' : 
                         '🔧 Local Mode'}
                      </div>
                    )}
                    
                    {/* Response Time */}
                    {responseTime > 0 && (
                      <div className="text-xs text-gray-400 bg-gray-500/20 px-2 py-1 rounded-full">
                        {responseTime}ms
                      </div>
                    )}
                  </div>
                  
                  {isSearching ? (
                    <div className="flex items-center gap-3 text-purple-400">
                      <div className="w-4 h-4 border-2 border-purple-400/20 border-t-purple-400 rounded-full animate-spin" />
                      <span className="text-sm">Analyzing your situation and crafting a personalized response...</span>
                    </div>
                  ) : aiResponse ? (
                    <div className="prose prose-invert max-w-none">
                      <div className="text-white leading-relaxed whitespace-pre-line">{aiResponse}</div>
                      
                      <div className="mt-4 pt-4 border-t border-purple-500/20 flex gap-2">
                        <button className="px-4 py-2 bg-purple-500/20 hover:bg-purple-500/30 text-purple-400 rounded-lg text-sm font-semibold transition-colors">
                          Ask Follow-up
                        </button>
                        <button className="px-4 py-2 bg-green-500/20 hover:bg-green-500/30 text-green-400 rounded-lg text-sm font-semibold transition-colors">
                          Get Action Plan
                        </button>
                        <button 
                          onClick={() => {
                            setShowChat(false)
                            setAiResponse(null)
                            setSearchQuery('')
                            setResponseSource(null)
                            setResponseTime(0)
                          }}
                          className="px-4 py-2 bg-gray-500/20 hover:bg-gray-500/30 text-gray-400 rounded-lg text-sm font-semibold transition-colors ml-auto"
                        >
                          New Question
                        </button>
                      </div>
                    </div>
                  ) : null}
                </div>
              </div>
            </motion.div>
          )}
        </motion.div>
        
        {/* Problem Recognition Header */}
        <motion.div 
          className="mb-8"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex items-center gap-4 mb-6">
            <div className={`w-16 h-16 rounded-full bg-gradient-to-br ${problemsData?.color || coach.color} flex items-center justify-center text-2xl shadow-xl`}>
              {problemsData?.icon || coach.icon}
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 via-magenta-400 to-pink-400 bg-clip-text text-transparent">
                Hey {user.username}! 👋
              </h1>
              <p className="text-lg opacity-70">{problemsData?.ageContext || 'Your Personal Coach'} • Age {userAge}</p>
            </div>
          </div>

          {/* Problem Recognition */}
          {problemsData && (
            <div className={`bg-gradient-to-r ${problemsData.color}/10 border-2 border-red-500/30 rounded-2xl p-6 mb-6 backdrop-blur-sm relative overflow-hidden`}>
              <div className="absolute top-4 right-4">
                <AlertCircle className="w-6 h-6 text-red-400" />
              </div>
              
              <div className="mb-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-lg">🎯</span>
                  <h2 className="text-xl font-bold text-white">I see your problem...</h2>
                  {problemsData.urgency === 'high' && (
                    <div className="bg-red-500/20 text-red-400 px-2 py-1 rounded-full text-xs font-semibold ml-auto">
                      🚨 High Priority
                    </div>
                  )}
                </div>
                <h3 className="text-2xl font-bold text-red-400 mb-2">{problemsData.primaryProblem}</h3>
                <p className="text-lg opacity-90 mb-4">{problemsData.description}</p>
                
                {problemsData.ageSpecificNote && (
                  <div className="bg-black/30 rounded-lg p-3 mb-4">
                    <div className="text-cyan-400 font-semibold text-sm mb-1">💡 Age-Specific Insight:</div>
                    <div className="text-sm opacity-80">{problemsData.ageSpecificNote}</div>
                  </div>
                )}
              </div>
              
              <div className="text-sm opacity-70 mb-4">
                Based on your assessment answers and age, this is your #1 barrier to success.
              </div>
            </div>
          )}
        </motion.div>

        {/* Immediate Solutions */}
        {problemsData?.solutions && (
          <motion.div 
            className="mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <span>⚡</span> 
              <span className="bg-gradient-to-r from-green-400 to-cyan-400 bg-clip-text text-transparent">
                Your Personalized Solutions
              </span>
            </h2>
            <p className="text-lg opacity-70 mb-6">These solutions are specifically designed for your profile and problem:</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {problemsData.solutions.map((solution: any, index: number) => {
                const typeColors = {
                  immediate: 'border-red-500/50 bg-red-500/10',
                  practice: 'border-yellow-500/50 bg-yellow-500/10',
                  learning: 'border-blue-500/50 bg-blue-500/10',
                  system: 'border-green-500/50 bg-green-500/10',
                  technique: 'border-purple-500/50 bg-purple-500/10',
                  skill: 'border-cyan-500/50 bg-cyan-500/10'
                }
                
                const typeIcons = {
                  immediate: '🚨',
                  practice: '🏋️',
                  learning: '📚',
                  system: '⚙️',
                  technique: '🎯',
                  skill: '💡'
                }

                return (
                  <motion.div
                    key={index}
                    className={`border-2 rounded-xl p-6 backdrop-blur-sm transition-all duration-300 hover:scale-105 cursor-pointer ${typeColors[solution.type as keyof typeof typeColors] || 'border-purple-500/50 bg-purple-500/10'}`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: index * 0.1 }}
                    whileHover={{ y: -5 }}
                    onClick={() => {
                      // Navigate to specific solution
                      router.push(`/solutions/${solution.type}?problem=${encodeURIComponent(problemsData.primaryProblem)}&username=${user?.username}`)
                    }}
                  >
                    <div className="flex items-center gap-3 mb-4">
                      <span className="text-2xl">{typeIcons[solution.type as keyof typeof typeIcons]}</span>
                      <div>
                        <h3 className="text-xl font-bold text-white mb-1">{solution.title}</h3>
                        <div className="text-sm opacity-70 uppercase tracking-wide font-semibold">{solution.type} solution</div>
                      </div>
                    </div>
                    
                    <p className="text-lg font-semibold text-cyan-400 mb-3">{solution.action}</p>
                    <p className="opacity-80 mb-4">{solution.description}</p>
                    
                    <div className="flex items-center gap-2 text-sm font-semibold">
                      <Play className="w-4 h-4" />
                      <span>Start Now</span>
                      <ChevronRight className="w-4 h-4 ml-auto" />
                    </div>
                  </motion.div>
                )
              })}
            </div>
          </motion.div>
        )}

        {/* Action Hub */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <motion.div 
            className="bg-black/30 backdrop-blur-sm border border-green-500/30 rounded-2xl p-6"
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
              <span>🎯</span> 
              <span className="text-white">Take Action</span>
            </h3>
            <p className="mb-4 opacity-80">Your personalized problem-solving starts here.</p>
            <button
              onClick={() => router.push(`/action-plan?avatar=${user?.avatar_type}&age=${userAge}&username=${user?.username}`)}
              className="w-full py-3 bg-gradient-to-r from-green-600 to-cyan-600 hover:from-green-700 hover:to-cyan-700 rounded-lg font-semibold transition-all transform hover:scale-105"
            >
              Start Action Plan
            </button>
          </motion.div>

          <motion.div 
            className="bg-black/30 backdrop-blur-sm border border-purple-500/20 rounded-2xl p-6"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
              <span>💬</span> 
              <span className="text-white">Get Support</span>
            </h3>
            <p className="mb-4 opacity-80">Connect with men solving similar problems.</p>
            <button
              onClick={goToCommunity}
              className="w-full py-3 bg-gradient-to-r from-purple-600 to-magenta-600 hover:from-purple-700 hover:to-magenta-700 rounded-lg font-semibold transition-all transform hover:scale-105"
            >
              Join Community
            </button>
          </motion.div>

          <motion.div 
            className="bg-black/30 backdrop-blur-sm border border-yellow-500/30 rounded-2xl p-6"
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
          >
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
              <span>📈</span> 
              <span className="text-white">Track Progress</span>
            </h3>
            
            <div className="grid grid-cols-2 gap-4 text-center mb-4">
              <div>
                <div className="text-lg font-bold text-purple-400">{userCoinStats?.profile?.streak || user.streak}</div>
                <div className="text-xs opacity-70">Days Active</div>
              </div>
              <div>
                <div className="text-lg font-bold text-cyan-400">{userCoinStats?.community?.answersGiven || 0}</div>
                <div className="text-xs opacity-70">Contributions</div>
              </div>
            </div>
            
            <button
              onClick={() => router.push(`/progress?username=${user?.username}`)}
              className="w-full py-2 bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700 rounded-lg font-semibold transition-all text-sm"
            >
              View Full Progress
            </button>
          </motion.div>
        </div>

        {/* Footer Navigation */}
        <footer className="mt-16 border-t border-gray-700/50 pt-12 pb-8">
          <div className="max-w-6xl mx-auto px-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {/* Main Pages */}
              <div>
                <h4 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <Target className="w-5 h-5 text-purple-400" />
                  Core Features
                </h4>
                <ul className="space-y-2">
                  <li>
                    <button
                      onClick={() => router.push('/dashboard')}
                      className="text-gray-300 hover:text-purple-400 transition-colors text-sm flex items-center gap-2"
                    >
                      <span>🏠</span> Dashboard
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => router.push('/community')}
                      className="text-gray-300 hover:text-purple-400 transition-colors text-sm flex items-center gap-2"
                    >
                      <Users className="w-4 h-4" /> Community
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => router.push('/assessment')}
                      className="text-gray-300 hover:text-purple-400 transition-colors text-sm flex items-center gap-2"
                    >
                      <span>📋</span> Assessment
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => router.push('/solutions/sexual-performance')}
                      className="text-gray-300 hover:text-purple-400 transition-colors text-sm flex items-center gap-2"
                    >
                      <span>⚡</span> Solutions
                    </button>
                  </li>
                </ul>
              </div>

              {/* Coins & Economy */}
              <div>
                <h4 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <Coins className="w-5 h-5 text-yellow-400" />
                  Coins System
                </h4>
                <ul className="space-y-2">
                  <li>
                    <button
                      onClick={() => router.push('/coins-guide')}
                      className="text-gray-300 hover:text-yellow-400 transition-colors text-sm flex items-center gap-2"
                    >
                      <span>📖</span> How Coins Work
                    </button>
                  </li>
                  <li>
                    <span className="text-gray-500 text-sm flex items-center gap-2">
                      <span>🏆</span> Leaderboard (Soon)
                    </span>
                  </li>
                  <li>
                    <span className="text-gray-500 text-sm flex items-center gap-2">
                      <span>🎁</span> Rewards (Soon)
                    </span>
                  </li>
                </ul>
              </div>

              {/* Account & Settings */}
              <div>
                <h4 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <span>⚙️</span>
                  Account
                </h4>
                <ul className="space-y-2">
                  <li>
                    <button
                      onClick={() => router.push('/profile')}
                      className="text-gray-300 hover:text-blue-400 transition-colors text-sm flex items-center gap-2"
                    >
                      <span>👤</span> Profile
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => router.push('/settings')}
                      className="text-gray-300 hover:text-green-400 transition-colors text-sm flex items-center gap-2"
                    >
                      <span>⚙️</span> Settings
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => router.push('/analytics')}
                      className="text-gray-300 hover:text-purple-400 transition-colors text-sm flex items-center gap-2"
                    >
                      <span>📊</span> Analytics
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => router.push('/billing')}
                      className="text-gray-300 hover:text-pink-400 transition-colors text-sm flex items-center gap-2"
                    >
                      <span>💳</span> Billing
                    </button>
                  </li>
                </ul>
              </div>

              {/* Help & Support */}
              <div>
                <h4 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <span>❓</span>
                  Help & Support
                </h4>
                <ul className="space-y-2">
                  <li>
                    <span className="text-gray-500 text-sm flex items-center gap-2">
                      <span>📚</span> Help Center (Soon)
                    </span>
                  </li>
                  <li>
                    <span className="text-gray-500 text-sm flex items-center gap-2">
                      <MessageCircle className="w-4 h-4" /> Support Chat (Soon)
                    </span>
                  </li>
                  <li>
                    <span className="text-gray-500 text-sm flex items-center gap-2">
                      <span>📧</span> Contact Us (Soon)
                    </span>
                  </li>
                  <li>
                    <span className="text-gray-500 text-sm flex items-center gap-2">
                      <span>🔐</span> Privacy Policy (Soon)
                    </span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Bottom Footer */}
            <div className="mt-12 pt-8 border-t border-gray-700/30">
              <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                <button
                  onClick={() => router.push('/')}
                  className="flex items-center gap-3 hover:opacity-80 transition-opacity"
                >
                  <div className="text-2xl">🚀</div>
                  <div>
                    <div className="text-xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                      AlphaRise
                    </div>
                    <div className="text-xs text-gray-400">Build confidence. Transform your life.</div>
                  </div>
                </button>
                
                <div className="flex items-center gap-6 text-sm text-gray-400">
                  <span>© 2025 AlphaRise</span>
                  <div className="flex items-center gap-2">
                    <span>Balance:</span>
                    <div className="flex items-center gap-1 bg-yellow-500/20 px-2 py-1 rounded-full">
                      <Coins className="w-3 h-3 text-yellow-400" />
                      <span className="text-yellow-400 font-semibold text-xs">
                        {userCoinStats?.profile?.currentBalance || user?.coins || 0}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </footer>
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