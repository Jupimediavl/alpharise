// Personalized Problem-Solution Oriented Dashboard

'use client'

import { motion } from 'framer-motion'
import { useState, useEffect, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { SupabaseUserManager, DbUser, SupabaseCoachManager, DbCoach, supabaseHelpers } from '@/lib/supabase'
import { simpleCoinHelpers } from '@/lib/simple-coin-system'
import { ChevronRight, Zap, Target, AlertCircle, CheckCircle, Play, Book, Users, TrendingUp, Search, Send, MessageCircle, Coins, User, Settings, BarChart3, CreditCard, ChevronDown, LogOut } from 'lucide-react'
import ChatDrawer from '@/components/ChatDrawer'

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
      marcus: `Hey ${username}, Logan here! I'm having some technical issues right now, but I hear you. Let's think this through together - your analytical mind is actually a superpower. Whatever you're dealing with regarding "${query}" is completely normal. Can you try asking me again in a moment?`,
      alex: `Hey ${username}! Mason here - don't worry, this is totally normal. I'm just having a small technical hiccup. About "${query}" - let me break this down for you once my systems are back up. You're learning faster than you think!`,
      ryan: `${username}, Blake here! You've got this spark in you! I'm just having a quick system restart, but I'm excited to help you with "${query}". Time to level up - try asking me again in a second!`,
      jake: `Alright ${username}, Chase here! Here's the game plan - I'm optimizing my systems right now, but I'll be back to help you with "${query}" in just a moment. Time to perform like a champion!`,
      ethan: `${username}, Knox here! Your feelings about "${query}" are completely valid. I'm having a small technical moment, but let's focus on genuine connection - try reaching out again in just a second. Authentic confidence is your greatest strength!`
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
  const [coaches, setCoaches] = useState<DbCoach[]>([])
  const [currentCoach, setCurrentCoach] = useState<DbCoach | null>(null)
  const [currentTime, setCurrentTime] = useState('')
  const [userCoinStats, setUserCoinStats] = useState<any>(null)
  const [userAge, setUserAge] = useState<number>(25) // Default age
  const [problemsData, setProblemsData] = useState<any>(null)
  const [showUserDropdown, setShowUserDropdown] = useState(false)
  const [showProblemDetails, setShowProblemDetails] = useState(false)
  const [isChatOpen, setIsChatOpen] = useState(false)
  
  // State for old search functionality (kept for compatibility)
  const [searchQuery, setSearchQuery] = useState('')
  const [isSearching, setIsSearching] = useState(false)
  const [showChat, setShowChat] = useState(false)
  const [aiResponse, setAiResponse] = useState('')
  const [responseSource, setResponseSource] = useState<'openai' | 'fallback' | 'local'>('openai')
  const [responseTime, setResponseTime] = useState(0)

  // Map new coach names to legacy coach configurations
  const coachMapping: Record<string, string> = {
    'logan': 'marcus',    // Logan (Overthinker) -> Marcus config
    'chase': 'jake',      // Chase (Nervous) -> Jake config  
    'mason': 'alex',      // Mason (Rookie) -> Alex config
    'blake': 'ryan',      // Blake (Up&Down) -> Ryan config
    'knox': 'ethan'       // Knox (Surface) -> Ethan config
  }

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
      name: 'Logan "The Straight Shooter"',
      icon: '🎯',
      color: 'from-purple-500 to-pink-500',
      expertise: 'Confidence & Mindset Coach',
      encouragementMessage: "Logan here! Your analytical mind is actually your secret weapon. Today, I want you to use that overthinking superpower FOR you, not against you. Channel that mental energy into planning your next confident move. You've got this! 🚀",
      powerMove: "Mind Control Challenge",
      powerMoveIcon: "🎯",
      powerMoveColor: "from-purple-400 to-magenta-500"
    },
    alex: {
      name: 'Mason "The Patient Pro"',
      icon: '🧑‍🏫',
      color: 'from-purple-600 to-pink-400',
      expertise: 'Knowledge & Growth Coach',
      encouragementMessage: "Mason here! Your hunger for knowledge is what separates you from guys who stay stuck. Every expert was once a beginner, and you're already ahead because you're here, learning and growing. Today is another step toward mastery! 📚✨",
      powerMove: "Learning Sprint",
      powerMoveIcon: "⚡",
      powerMoveColor: "from-purple-400 to-pink-500"
    },
    ryan: {
      name: 'Blake "The Reliable Guy"',
      icon: '⚡',
      color: 'from-magenta-500 to-pink-500',
      expertise: 'Potential & Consistency Coach',
      encouragementMessage: "Blake here! I see that fire in you - those moments when your natural charisma breaks through. Today we're turning those flashes of brilliance into your default setting. Your potential is limitless! 💎🔥",
      powerMove: "Consistency Streak",
      powerMoveIcon: "🔥",
      powerMoveColor: "from-magenta-400 to-pink-500"
    },
    jake: {
      name: 'Chase "The Cool Cat"',
      icon: '😎',
      color: 'from-purple-500 to-magenta-600',
      expertise: 'Performance & Excellence Coach',
      encouragementMessage: "Chase here! Your drive for excellence is what champions are made of. Instead of letting performance pressure hold you back, we're channeling it into unstoppable confidence. Today, you dominate! ⚡💪",
      powerMove: "Performance Peak",
      powerMoveIcon: "🚀",
      powerMoveColor: "from-purple-400 to-magenta-500"
    },
    ethan: {
      name: 'Knox "The Authentic One"',
      icon: '❤️',
      color: 'from-pink-500 to-purple-600',
      expertise: 'Connection & Emotional Coach',
      encouragementMessage: "Knox here! Your emotional intelligence is rare and powerful. While other guys struggle to connect, you naturally understand people. Today, we combine that emotional depth with magnetic confidence! ❤️✨",
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
          // If no username in URL, redirect to signup
          router.push('/signup')
          return
        }

        const userData = await SupabaseUserManager.getUserByUsername(username)
        if (!userData) {
          router.push('/signup')
          return
        }

        setUser(userData)

        // Load coaches from database
        const allCoaches = await supabaseHelpers.getAllCoaches()
        setCoaches(allCoaches)
        
        // Find current user's coach
        if (userData.coach) {
          const userCoach = await supabaseHelpers.getCoachById(userData.coach)
          setCurrentCoach(userCoach)
        }

        // Use age from database
        const ageToUse = userData.age || 25
        setUserAge(ageToUse)

        // Generate personalized problems based on coach + age
        const mappedCoachForProblems = userData.coach ? coachMapping[userData.coach] || 'marcus' : 'marcus'
        const personalizedProblems = getPersonalizedProblems(mappedCoachForProblems, ageToUse)
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

        // No need for sessionStorage - everything comes from database

      } catch (error) {
        console.error('Error loading user data:', error)
        router.push('/signup')
      } finally {
        setIsLoading(false)
      }
    }

    loadUserData()
  }, [searchParams, router])

  // Update time (client-side only to avoid hydration mismatch)
  useEffect(() => {
    const updateTime = () => {
      const now = new Date()
      const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      setCurrentTime(timeStr)
    }
    // Only run on client side to avoid hydration mismatch
    if (typeof window !== 'undefined') {
      updateTime()
      const timeInterval = setInterval(updateTime, 1000)
      return () => clearInterval(timeInterval)
    }
  }, [])

  // Handle chat message sending
  const handleChatMessage = async (message: string): Promise<string | null> => {
    if (!user) return null

    try {
      const mappedCoachForAI = user.coach ? coachMapping[user.coach] || 'marcus' : 'marcus'
      const result = await generateAIResponse(message, mappedCoachForAI, userAge, user.username)
      
      console.log('🤖 Chat Response:', {
        query: message,
        coach: user.coach,
        response: result.response?.substring(0, 100) + '...',
        source: result.source
      })
      
      return result.response
    } catch (error) {
      console.error('❌ Chat error:', error)
      return 'Sorry, I encountered an error. Please try again.'
    }
  }

  // Navigation
  const goToCommunity = () => router.push('/community')
  
  // Handle AI Search
  const handleSearch = async () => {
    if (!searchQuery.trim() || !user) return
    
    setIsSearching(true)
    setShowChat(true)
    const startTime = Date.now()
    
    try {
      const mappedCoachForAI = user.coach ? coachMapping[user.coach] || 'marcus' : 'marcus'
      const result = await generateAIResponse(searchQuery, mappedCoachForAI, userAge, user.username)
      const endTime = Date.now()
      
      setAiResponse(result.response)
      setResponseSource(result.source)
      setResponseTime(endTime - startTime)
      
      // Debug logging
      console.log('🤖 AI Coach Response Details:', {
        query: searchQuery,
        coach: user.coach,
        mappedLegacyCoach: mappedCoachForAI,
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

  // Use coach data directly from database
  const coach = currentCoach || {
    name: 'Coach',
    icon: '👤',
    description: 'Your personal coach'
  }

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
          <div className="text-sm opacity-70">{currentTime || '--:--'}</div>
          
          {/* Coins Display */}
          <div className="bg-gradient-to-r from-yellow-500/20 to-amber-500/20 text-white px-3 py-1 rounded-full text-sm font-semibold flex items-center gap-1 border border-yellow-500/30">
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
              <div className="w-8 h-8 rounded-full overflow-hidden">
                <img
                  src={`/avatars/${user?.coach || 'logan'}.png`}
                  alt={`Coach ${user?.coach || 'logan'}`}
                  className="w-full h-full object-cover"
                />
              </div>
              
              {/* User Info */}
              <div className="text-left hidden md:block">
                <div className="text-sm font-semibold text-white">{user?.username || 'User'}</div>
                <div className="text-xs text-gray-400">Coach: {coach.name.split(' ')[0] || 'Logan'}</div>
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
                    <div className="w-12 h-12 rounded-full overflow-hidden">
                      <img
                        src={`/avatars/${user?.coach || 'logan'}.png`}
                        alt={`Coach ${user?.coach || 'logan'}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div>
                      <div className="font-semibold text-white">{user?.username || 'User'}</div>
                      <div className="text-sm text-gray-400">{user?.email || 'member@alpharise.app'}</div>
                      <div className="text-xs text-purple-400 capitalize">{user?.coach || 'Member'} • Level {1}</div>
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
        
        {/* Chat with Coach */}
        <motion.div 
          className="mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <motion.button
            onClick={() => setIsChatOpen(true)}
            className="w-full bg-gradient-to-r from-purple-500/20 to-magenta-500/20 border border-purple-500/30 rounded-2xl p-6 backdrop-blur-sm hover:from-purple-500/30 hover:to-magenta-500/30 hover:border-purple-500/50 transition-all group"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full overflow-hidden group-hover:scale-110 transition-transform">
                <img
                  src={`/avatars/${user?.coach || 'logan'}.png`}
                  alt={`Coach ${user?.coach || 'logan'}`}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1 text-left">
                <h2 className="text-xl font-bold text-white mb-1">Chat with {coach.name}</h2>
                <p className="text-gray-300 mb-2">Your personal coach who understands your exact situation</p>
                <div className="flex items-center gap-2 text-purple-400">
                  <MessageCircle className="w-5 h-5" />
                  <span className="font-semibold">Start a conversation</span>
                  <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </div>
          </motion.button>
        </motion.div>
        
        {/* Welcome Header */}

        {/* Compact Problem Card */}
        {problemsData && (
          <motion.div 
            className="mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <div 
              className={`bg-gradient-to-r ${problemsData.color}/10 border border-red-500/30 rounded-xl p-4 backdrop-blur-sm cursor-pointer hover:border-red-500/50 transition-all group`}
              onClick={() => setShowProblemDetails(!showProblemDetails)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div>
                    <h3 className="text-lg font-bold text-white">{problemsData.primaryProblem}</h3>
                    <p className="text-sm text-white/80">{problemsData.description}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  {problemsData.urgency === 'high' && (
                    <div className="bg-white/90 text-red-600 px-2 py-1 rounded-full text-xs font-semibold border border-red-300">
                      🚨 High Priority
                    </div>
                  )}
                  {problemsData.urgency === 'medium' && (
                    <div className="bg-white/90 text-orange-600 px-2 py-1 rounded-full text-xs font-semibold border border-orange-300">
                      ⚠️ Medium Priority
                    </div>
                  )}
                  <ChevronRight className={`w-5 h-5 text-gray-400 transition-transform group-hover:translate-x-1 ${showProblemDetails ? 'rotate-90' : ''}`} />
                </div>
              </div>
              
              {/* Expandable Details */}
              {showProblemDetails && (
                <motion.div 
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="mt-4 pt-4 border-t border-red-500/20"
                >
                  {problemsData.ageSpecificNote && (
                    <div className="bg-black/30 rounded-lg p-3 mb-3">
                      <div className="text-white font-semibold text-sm mb-1">💡 Age-Specific Insight:</div>
                      <div className="text-sm text-white/80">{problemsData.ageSpecificNote}</div>
                    </div>
                  )}
                  <div className="text-xs text-white/70">
                    Based on your confidence test results and age, this is your #1 barrier to success.
                  </div>
                </motion.div>
              )}
            </div>
          </motion.div>
        )}

        {/* Quick Solutions Preview */}
        {problemsData?.solutions && (
          <motion.div 
            className="mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <span>⚡</span> 
              <span className="text-white">Quick Solutions</span>
              <span className="text-sm text-gray-400 font-normal">Choose your approach</span>
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {problemsData.solutions.slice(0, 2).map((solution: any, index: number) => {
                const typeColors = {
                  immediate: 'border-purple-500/30 bg-purple-500/8 hover:bg-purple-500/12',
                  practice: 'border-purple-500/25 bg-purple-500/6 hover:bg-purple-500/10',
                  learning: 'border-purple-500/35 bg-purple-500/7 hover:bg-purple-500/11',
                  system: 'border-purple-500/28 bg-purple-500/5 hover:bg-purple-500/9',
                  technique: 'border-purple-500/32 bg-purple-500/6 hover:bg-purple-500/10',
                  skill: 'border-purple-500/26 bg-purple-500/4 hover:bg-purple-500/8'
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
                  <motion.button
                    key={index}
                    className={`text-left border rounded-xl p-4 transition-all duration-200 hover:scale-[1.02] ${typeColors[solution.type as keyof typeof typeColors] || 'border-purple-500/40 bg-purple-500/5 hover:bg-purple-500/10'}`}
                    initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.4, delay: index * 0.1 }}
                    onClick={() => {
                      router.push(`/solutions/${solution.type}?problem=${encodeURIComponent(problemsData.primaryProblem)}&username=${user?.username}`)
                    }}
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-xl">{typeIcons[solution.type as keyof typeof typeIcons]}</span>
                      <h3 className="font-bold text-white">{solution.title}</h3>
                    </div>
                    
                    <p className="text-sm text-gray-400 mb-3">{solution.action}</p>
                    
                    <div className="flex items-center gap-2 text-xs font-semibold text-purple-400">
                      <Play className="w-3 h-3" />
                      <span>Start {solution.type}</span>
                      <ChevronRight className="w-3 h-3 ml-auto" />
                    </div>
                  </motion.button>
                )
              })}
            </div>
            
            {problemsData.solutions.length > 2 && (
              <button 
                onClick={() => router.push(`/solutions?username=${user?.username}`)}
                className="w-full mt-4 py-3 border border-gray-600 text-gray-300 rounded-xl hover:bg-gray-800/50 transition-colors text-sm"
              >
                View All {problemsData.solutions.length} Solutions →
              </button>
            )}
          </motion.div>
        )}

        {/* Main Action Buttons */}
        <motion.div 
          className="mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <h2 className="text-xl font-bold mb-4 text-white">What do you want to do?</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* AI Coach Button */}
            <button
              onClick={() => (document.querySelector('input[placeholder*="What\'s on your mind"]') as HTMLInputElement)?.focus()}
              className="group bg-gradient-to-br from-purple-600/15 to-purple-800/20 border border-purple-500/25 hover:border-purple-400/40 rounded-xl p-4 transition-all hover:scale-[1.02] text-left"
            >
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-purple-500/15 rounded-full flex items-center justify-center">
                  <span className="text-xl">🤖</span>
                </div>
                <div>
                  <h3 className="font-bold text-white">Ask AI Coach</h3>
                  <p className="text-xs text-gray-400">Get instant advice</p>
                </div>
              </div>
            </button>

            {/* Community Button */}
            <button
              onClick={goToCommunity}
              className="group bg-gradient-to-br from-purple-600/10 to-purple-800/15 border border-purple-500/20 hover:border-purple-400/35 rounded-xl p-4 transition-all hover:scale-[1.02] text-left"
            >
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-purple-500/15 rounded-full flex items-center justify-center">
                  <span className="text-xl">💬</span>
                </div>
                <div>
                  <h3 className="font-bold text-white">Join Community</h3>
                  <p className="text-xs text-gray-400">Connect & learn</p>
                </div>
              </div>
            </button>

            {/* Progress Button */}
            <button
              onClick={() => router.push('/analytics')}
              className="group bg-gradient-to-br from-green-600/10 to-green-800/15 border border-green-500/20 hover:border-green-400/35 rounded-xl p-4 transition-all hover:scale-[1.02] text-left"
            >
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-green-500/15 rounded-full flex items-center justify-center">
                  <span className="text-xl">📊</span>
                </div>
                <div>
                  <h3 className="font-bold text-white">View Progress</h3>
                  <p className="text-xs text-gray-400">Track your growth</p>
                </div>
              </div>
            </button>
          </div>
        </motion.div>

        {/* Quick Stats */}
        <motion.div 
          className="mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <h2 className="text-lg font-bold mb-3 text-white">Your Progress</h2>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-yellow-500/10 border border-yellow-500/25 rounded-lg p-3 text-center">
              <div className="text-lg font-bold text-yellow-300">{userCoinStats?.profile?.currentBalance || user?.coins || 0}</div>
              <div className="text-xs text-gray-400">Coins</div>
            </div>
            
            <div className="bg-blue-500/10 border border-blue-500/25 rounded-lg p-3 text-center">
              <div className="text-lg font-bold text-white">{userCoinStats?.profile?.streak || 1}</div>
              <div className="text-xs text-gray-400">Day Streak</div>
            </div>
            
            <div className="bg-green-500/10 border border-green-500/25 rounded-lg p-3 text-center">
              <div className="text-lg font-bold text-white">{1}</div>
              <div className="text-xs text-gray-400">Level</div>
            </div>
            
            <div className="bg-purple-500/10 border border-purple-500/25 rounded-lg p-3 text-center">
              <div className="text-lg font-bold text-white">{userCoinStats?.community?.answersGiven || 0}</div>
              <div className="text-xs text-gray-400">Contributions</div>
            </div>
          </div>
        </motion.div>

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
                      <span>📋</span> Confidence Test
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

      {/* Chat Drawer */}
      {user && (
        <ChatDrawer
          isOpen={isChatOpen}
          onClose={() => setIsChatOpen(false)}
          user={{
            id: user.username || user.id,
            username: user.username,
            coach: user.coach,
            age: userAge,
            userType: user.user_type
          }}
          onSendMessage={handleChatMessage}
        />
      )}
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