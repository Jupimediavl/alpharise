// Personalized Problem-Solution Oriented Dashboard

'use client'

import { motion } from 'framer-motion'
import { useState, useEffect, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { SupabaseUserManager, DbUser, SupabaseCoachManager, DbCoach, SupabaseLearningManager, supabaseHelpers } from '@/lib/supabase'
import { simpleCoinHelpers } from '@/lib/simple-coin-system'
import { ChevronRight, Zap, Target, AlertCircle, CheckCircle, Play, Book, Users, TrendingUp, Search, Send, MessageCircle, Coins, User, Settings, BarChart3, CreditCard, ChevronDown, LogOut, Trophy } from 'lucide-react'
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

// AI Response Generator with Conversation Context
const generateAIResponseWithContext = async (
  query: string, 
  avatarType: string, 
  userAge: number, 
  username: string,
  conversationHistory: Array<{role: string, content: string}> = [],
  userData: any = null
) => {
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
        username,
        conversationHistory,
        userData
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
      marcus: `Hey ${username}, Logan here! I'm having some technical issues right now, but I hear you. Try asking me again in a moment?`,
      alex: `Hey ${username}! Mason here - I'm just having a small technical hiccup. Try asking me again in a second.`,
      ryan: `${username}, Blake here! I'm just having a quick system restart, try asking me again in a moment.`,
      jake: `${username}, Chase here! I'm optimizing my systems right now, try reaching out again in just a second.`,
      ethan: `${username}, Knox here! I'm having a small technical moment, try reaching out again in just a second.`
    }
    
    return {
      response: fallbackMessages[avatarType as keyof typeof fallbackMessages] || fallbackMessages.marcus,
      source: 'local' as const
    }
  }
}

// Legacy AI Response Generator (keeping for compatibility)
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

// Generate welcome message based on user's milestone progress
const getWelcomeMessage = (currentPoints: number, milestones: any[]) => {
  if (!milestones || !milestones.length) {
    return "Welcome! Let's start building your confidence."
  }
  
  const achievedMilestones = milestones
    .filter(m => m && m.points_required && currentPoints >= m.points_required)
    .sort((a, b) => b.points_required - a.points_required)
  
  // If no milestone achieved or no welcome_message, use default
  if (!achievedMilestones.length || !achievedMilestones[0]?.welcome_message) {
    return "Welcome! Let's start building your confidence."
  }
  
  return achievedMilestones[0].welcome_message
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
  const [coinData, setCoinData] = useState<any>(null)
  const [userAge, setUserAge] = useState<number>(25) // Default age
  const [problemsData, setProblemsData] = useState<any>(null)
  const [milestones, setMilestones] = useState<any[]>([])
  const [welcomeMessage, setWelcomeMessage] = useState<string>('')
  const [learningStats, setLearningStats] = useState({
    totalProblems: 0,
    totalExercises: 0,
    completedExercises: 0,
    remainingToNextLevel: 0
  })
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

  // Load coin data function
  const loadCoinData = async (username: string) => {
    try {
      // Validate username to prevent URL issues
      if (!username || typeof username !== 'string' || username.trim() === '') {
        console.warn('Invalid username for loadCoinData:', username)
        return
      }
      
      const cleanUsername = encodeURIComponent(username.trim())
      const response = await fetch(`/api/coins/user/${cleanUsername}`)
      const result = await response.json()
      
      if (result.success) {
        setCoinData(result.coinData)
      } else {
        console.error('Failed to load coin data:', result.error)
      }
    } catch (error) {
      console.error('Error loading coin data:', error)
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
        
        // Load coin data for this user
        await loadCoinData(username)

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

        // Load milestones and learning system statistics
        try {
          const milestonesData = await SupabaseLearningManager.getMilestones()
          setMilestones(milestonesData)
          
          const currentPoints = userData.confidence_score || 0
          const welcomeMsg = getWelcomeMessage(currentPoints, milestonesData)
          setWelcomeMessage(welcomeMsg)

          // Load learning system statistics
          const problems = await SupabaseLearningManager.getProblemsForUserType(userData.user_type)
          const totalProblems = problems.length
          
          // Calculate total exercises across all problems
          let totalExercises = 0
          for (const problem of problems) {
            const exercises = await SupabaseLearningManager.getExercisesForProblem(problem.id)
            totalExercises += exercises.length
          }
          
          // Get user progress
          const userProgress = await SupabaseLearningManager.getUserProgress(userData.username)
          const completedExercises = userProgress.filter(p => p.status === 'completed').length
          
          // Calculate remaining exercises to next milestone
          const nextMilestone = milestonesData.find(m => currentPoints < m.points_required)
          const remainingPoints = nextMilestone ? nextMilestone.points_required - currentPoints : 0
          const avgPointsPerExercise = 10 // Average points per exercise
          const remainingToNextLevel = Math.ceil(remainingPoints / avgPointsPerExercise)
          
          setLearningStats({
            totalProblems,
            totalExercises,
            completedExercises,
            remainingToNextLevel: Math.max(0, remainingToNextLevel)
          })
        } catch (error) {
          console.error('Error loading milestones and learning statistics:', error)
          // Set default welcome message if loading fails
          setWelcomeMessage("Welcome! Let's start building your confidence.")
          // Keep default values for learning stats
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

  // Handle chat message sending with conversation context
  const handleChatMessage = async (message: string, conversationHistory?: any[]): Promise<string | null> => {
    if (!user) return null

    try {
      const mappedCoachForAI = user.coach ? coachMapping[user.coach] || 'marcus' : 'marcus'
      
      // Build conversation context for AI
      const conversationContext = conversationHistory ? conversationHistory.map(msg => ({
        role: msg.type === 'user' ? 'user' : 'assistant',
        content: msg.content
      })) : []

      // Get user data from Supabase for full profile
      let userData = null
      try {
        userData = await SupabaseUserManager.getUserByUsername(user.username)
      } catch (error) {
        console.log('Could not fetch user data from Supabase:', error)
      }
      
      const result = await generateAIResponseWithContext(
        message, 
        mappedCoachForAI, 
        userAge, 
        user.username, 
        conversationContext,
        userData // Pass full user profile
      )
      
      console.log('🤖 Chat Response with Context & Profile:', {
        query: message,
        coach: user.coach,
        userType: userData?.user_type,
        confidenceScore: userData?.confidence_score,
        contextLength: conversationContext.length,
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
        
        {/* Welcome Section */}
        <motion.div 
          className="mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="bg-gradient-to-r from-purple-500/10 to-magenta-500/10 border border-purple-500/20 rounded-xl p-6 backdrop-blur-sm">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-white mb-3">
                Welcome, {user?.username}! 🎉
              </h2>
              <p className="text-lg text-gray-300 mb-4">
                {welcomeMessage}
              </p>
              <div className="flex items-center justify-center gap-4 text-sm text-gray-400">
                <div className="flex items-center gap-1">
                  <Trophy className="w-4 h-4 text-yellow-400" />
                  <span>{user?.confidence_score || 0} confidence points</span>
                </div>
                {user?.confidence_score > 0 && (
                  <div className="flex items-center gap-1">
                    <TrendingUp className="w-4 h-4 text-green-400" />
                    <span>Building momentum</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </motion.div>
        
        {/* Learning System Preview */}
        <motion.div 
          className="mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <span>🧠</span> 
              Your Learning Path
            </h2>
            <button
              onClick={() => router.push(`/learning?username=${user?.username}`)}
              className="text-purple-400 hover:text-purple-300 text-sm font-semibold transition-colors"
            >
              View All →
            </button>
          </div>
          
          <button
            onClick={() => router.push(`/learning?username=${user?.username}`)}
            className="w-full bg-gradient-to-r from-purple-500/15 to-magenta-500/15 border border-purple-500/25 hover:border-purple-400/40 rounded-xl p-6 transition-all hover:scale-[1.02] text-left group"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-gradient-to-r from-purple-500/20 to-magenta-500/20 rounded-xl flex items-center justify-center">
                  <span className="text-2xl">🎯</span>
                </div>
                <div>
                  <h3 className="font-bold text-white text-lg mb-1">
                    Most common problems for {problemsData?.primaryProblem ? 'your type' : 'you'}
                  </h3>
                  <p className="text-gray-300 text-sm mb-2">
                    {problemsData?.primaryProblem || 'Solve step-by-step solutions to build confidence'}
                  </p>
                  <div className="flex items-center gap-4 text-xs text-gray-400">
                    <span>• {learningStats.totalProblems} core problems</span>
                    <span>• {learningStats.totalExercises}+ exercises</span>
                    <span>• Earn confidence points</span>
                  </div>
                </div>
              </div>
              <div className="text-purple-400 group-hover:translate-x-1 transition-transform">
                <ChevronRight className="w-6 h-6" />
              </div>
            </div>
            
            {/* Progress Bar Preview */}
            <div className="mt-4 bg-gray-800 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-purple-500 to-magenta-500 h-2 rounded-full transition-all duration-500" 
                style={{ 
                  width: `${learningStats.totalExercises > 0 
                    ? Math.min(100, (learningStats.completedExercises / learningStats.totalExercises) * 100)
                    : 0}%` 
                }}
              />
            </div>
            <div className="mt-1 text-xs text-gray-400">
              {learningStats.completedExercises > 0 
                ? `${learningStats.completedExercises} exercises completed` 
                : 'Getting started'} • {learningStats.remainingToNextLevel > 0 
                  ? `${learningStats.remainingToNextLevel} more exercises to unlock next level`
                  : 'All levels unlocked!'}
            </div>
          </button>
        </motion.div>
        
        {/* Chat with Coach */}
        <motion.div 
          className="mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
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

        {/* Bonus Modules */}
        <motion.div 
          className="mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <span>🔥</span> 
            <span className="text-white">Bonus Modules</span>
            <span className="text-sm text-gray-400 font-normal">Essential skills for every Alpha</span>
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Intimacy Boost Module */}
            <motion.button
              className="text-left border border-red-500/30 bg-red-500/8 hover:bg-red-500/12 rounded-xl p-6 transition-all duration-200 hover:scale-[1.02] group"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: 0.1 }}
              onClick={() => {
                router.push(`/learning?module=intimacy_boost&username=${user?.username}`)
              }}
            >
              <div className="flex items-center gap-3 mb-3">
                <span className="text-2xl">💕</span>
                <h3 className="font-bold text-white text-lg">Intimacy Boost</h3>
              </div>
              
              <p className="text-sm text-gray-300 mb-4 leading-relaxed">
                Master deep connections and authentic relationships. Learn vulnerability, emotional intelligence, and meaningful communication.
              </p>
              
              <div className="flex items-center justify-between">
                <div className="text-xs text-red-300">
                  <span className="font-semibold">5 Problems</span> • <span className="font-semibold">20+ Exercises</span>
                </div>
                <div className="flex items-center gap-2 text-xs font-semibold text-red-400 group-hover:translate-x-1 transition-transform">
                  <Play className="w-3 h-3" />
                  <span>Start Module</span>
                  <ChevronRight className="w-3 h-3" />
                </div>
              </div>
            </motion.button>

            {/* Body Confidence Module */}
            <motion.button
              className="text-left border border-orange-500/30 bg-orange-500/8 hover:bg-orange-500/12 rounded-xl p-6 transition-all duration-200 hover:scale-[1.02] group"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: 0.2 }}
              onClick={() => {
                router.push(`/learning?module=body_confidence&username=${user?.username}`)
              }}
            >
              <div className="flex items-center gap-3 mb-3">
                <span className="text-2xl">💪</span>
                <h3 className="font-bold text-white text-lg">Body Confidence</h3>
              </div>
              
              <p className="text-sm text-gray-300 mb-4 leading-relaxed">
                Transform your physical presence and energy. Master body language, posture, movement, and commanding presence.
              </p>
              
              <div className="flex items-center justify-between">
                <div className="text-xs text-orange-300">
                  <span className="font-semibold">5 Problems</span> • <span className="font-semibold">20+ Exercises</span>
                </div>
                <div className="flex items-center gap-2 text-xs font-semibold text-orange-400 group-hover:translate-x-1 transition-transform">
                  <Play className="w-3 h-3" />
                  <span>Start Module</span>
                  <ChevronRight className="w-3 h-3" />
                </div>
              </div>
            </motion.button>
          </div>
          
          <div className="mt-4 text-center">
            <p className="text-xs text-gray-500">
              💡 These modules work alongside your personalized coach program
            </p>
          </div>
        </motion.div>


        {/* Main Action Buttons */}
        <motion.div 
          className="mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Community Card - Enhanced */}
            <button
              onClick={goToCommunity}
              className="group relative bg-gradient-to-br from-blue-500/20 to-purple-600/25 border border-blue-400/30 hover:border-blue-300/50 rounded-xl p-6 transition-all hover:scale-[1.02] text-left overflow-hidden"
            >
              {/* Sparkle Effects */}
              <div className="absolute top-2 right-2 text-blue-300 animate-pulse">🌟</div>
              <div className="absolute bottom-2 left-2 text-purple-400 animate-pulse delay-500">💬</div>
              
              <div className="flex items-center gap-4 mb-6">
                <div className="w-14 h-14 bg-gradient-to-r from-blue-400/20 to-purple-400/20 rounded-full flex items-center justify-center border border-blue-400/30">
                  <span className="text-3xl">🤝</span>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">Join Community</h3>
                  <p className="text-sm text-blue-200/80">🔥 Connect with fellow Alphas</p>
                </div>
              </div>

              {/* Stats Section */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="text-center">
                  <div className="text-2xl font-black text-blue-300 mb-1">1,247</div>
                  <div className="text-xs text-blue-200/70 uppercase tracking-wide">Active Members</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-black text-purple-300 mb-1">24/7</div>
                  <div className="text-xs text-purple-200/70 uppercase tracking-wide">Support Available</div>
                </div>
              </div>

              {/* Motivational Section */}
              <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-400/20 rounded-lg p-4 mb-4">
                <div className="text-center">
                  <div className="text-blue-300 font-semibold text-sm mb-1">💪 Level Up Together!</div>
                  <div className="text-blue-200/80 text-xs">
                    Share experiences, get support, earn coins
                  </div>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-blue-300 font-semibold text-sm">
                  🚀 Join the conversation
                </span>
                <span className="text-white/70 group-hover:translate-x-1 transition-transform">→</span>
              </div>
            </button>

            {/* Coins Card - Enhanced */}
            <div className="relative bg-gradient-to-br from-yellow-500/20 to-orange-600/25 border border-yellow-400/30 rounded-xl p-6 overflow-hidden">
              {/* Sparkle Effects */}
              <div className="absolute top-2 right-2 text-yellow-300 animate-pulse">✨</div>
              <div className="absolute bottom-2 left-2 text-yellow-400 animate-pulse delay-700">💫</div>
              
              <div className="flex items-center gap-4 mb-6">
                <div className="w-14 h-14 bg-gradient-to-r from-yellow-400/20 to-orange-400/20 rounded-full flex items-center justify-center border border-yellow-400/30">
                  <span className="text-3xl">🪙</span>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">Your Coins</h3>
                  <p className="text-sm text-yellow-200/80">💎 Premium rewards earned</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-6 mb-6">
                <div className="text-center">
                  <div className="text-3xl font-black text-yellow-300 mb-1">
                    {coinData?.totalCoins || user?.coins || 0}
                  </div>
                  <div className="text-xs text-yellow-200/70 uppercase tracking-wide">Total Coins</div>
                </div>
                <div className="text-center">
                  <div className="text-4xl font-black text-green-400 mb-1">
                    ${coinData?.dollarValue || ((user?.coins || 0) / 100).toFixed(2)}
                  </div>
                  <div className="text-sm text-green-300 font-semibold uppercase tracking-wide">
                    💳 Discount Value
                  </div>
                  <div className="text-xs text-green-200/80 mt-1">
                    Save on your subscription!
                  </div>
                </div>
              </div>
              
              {/* Motivational Section */}
              <div className="bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border border-yellow-400/20 rounded-lg p-4 mb-4">
                <div className="text-center">
                  <div className="text-yellow-300 font-semibold text-sm mb-1">🎯 Keep Growing!</div>
                  <div className="text-yellow-200/80 text-xs">
                    Every coin brings you closer to premium benefits
                  </div>
                </div>
              </div>
              
              <div className="flex justify-center">
                <span className="text-white/70 bg-gradient-to-r from-yellow-500/15 to-orange-500/15 border border-yellow-400/20 px-4 py-2 rounded-full text-xs font-medium">
                  🏆 {coinData?.coinSettings?.coins_per_dollar || 100} coins = $1 discount
                </span>
              </div>
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