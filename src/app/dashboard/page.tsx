// Dashboard with Direct Solutions - 10 Main Categories with Subcategories

'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useState, useEffect, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { SupabaseUserManager, DbUser } from '@/lib/supabase'
import { ChevronDown, ChevronRight, X } from 'lucide-react'

// Solution Categories Structure
const solutionCategories = [
  {
    id: 'sexual-performance',
    title: '🕐 Sexual Performance',
    description: 'Last longer and perform with confidence',
    subcategories: [
      'Premature ejaculation solutions',
      'Lasting longer in bed',
      'Performance anxiety fixes',
      'Maintaining erection',
      'Better control techniques',
      'Delaying orgasm naturally'
    ]
  },
  {
    id: 'approach-conversation',
    title: '💬 Approach & Conversation', 
    description: 'Start conversations that lead somewhere',
    subcategories: [
      'How to approach a girl',
      'What to say first',
      'Overcoming approach anxiety',
      'Avoiding conversation blocks',
      'Handling rejection fear',
      'Keeping conversations flowing'
    ]
  },
  {
    id: 'digital-dating',
    title: '📱 Digital Dating',
    description: 'Master dating apps and online game',
    subcategories: [
      'Perfect Tinder/Bumble profile',
      'Best photos that get matches',
      'Opening messages that work',
      'From chat to real date',
      'Why girls ghost you',
      'Red flags to avoid online'
    ]
  },
  {
    id: 'physical-intimacy',
    title: '💋 Physical & Intimacy',
    description: 'From first kiss to satisfying her',
    subcategories: [
      'First kiss timing & technique',
      'Reading her signals',
      'From kissing to more',
      'Foreplay for beginners',
      'Best positions for first time',
      'How to satisfy her'
    ]
  },
  {
    id: 'first-dates',
    title: '🍷 First Dates',
    description: 'Plan, execute, and close successfully',
    subcategories: [
      'Where to take her (ideas)',
      'How to dress for dates',
      'Conversation topics that work',
      'Who pays the bill',
      'Avoiding awkward moments',
      'How to end the date'
    ]
  },
  {
    id: 'confidence-mindset',
    title: '🧠 Confidence & Mindset',
    description: 'Build unshakeable inner confidence',
    subcategories: [
      'Impostor syndrome with women',
      'Stop being too available',
      'Not good enough thoughts',
      'Comparing to other men',
      'Fear of emotional intimacy',
      'Self-sabotage in relationships'
    ]
  },
  {
    id: 'presence-attitude',
    title: '💪 Presence & Attitude',
    description: 'Attract through masculine energy',
    subcategories: [
      'Attractive body language',
      'Confident voice and tone',
      'Not appearing desperate',
      'Masculine vs feminine energy',
      'Presence in groups',
      'Bad boy without being toxic'
    ]
  },
  {
    id: 'social-situations',
    title: '🎭 Social Situations',
    description: 'Navigate any social scenario smoothly',
    subcategories: [
      'Conversations at parties',
      'Joining groups naturally',
      'When she has friends with her',
      'Escaping awkward situations',
      'When and how to get her number',
      'Following up after meeting'
    ]
  },
  {
    id: 'emotional-psychological',
    title: '❤️ Emotional & Psychological',
    description: 'Handle emotions and attachment healthily',
    subcategories: [
      'Fear of rejection',
      'Not getting attached too fast',
      'Managing jealousy',
      'Avoiding neediness',
      'Setting healthy boundaries',
      'When to pursue vs when to back off'
    ]
  },
  {
    id: 'zero-experience',
    title: '🔥 Zero Experience',
    description: 'From virgin to confident - complete guide',
    subcategories: [
      'Virgin at 25+ - where to start',
      'First sexual experience',
      'Not appearing inexperienced',
      'What to do when you know nothing',
      'Learning without embarrassment',
      'Reality vs myths about sex'
    ]
  }
]

function DashboardContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [user, setUser] = useState<DbUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [currentTime, setCurrentTime] = useState('')
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null)
  const [selectedSolution, setSelectedSolution] = useState<{category: string, subcategory: string} | null>(null)

  // Coach data focused on real help
  const coachData: {
    [key: string]: {
      name: string
      icon: string
      color: string
      expertise: string
      todayAction: string
      quickWin: string
    }
  } = {
    marcus: {
      name: 'Marcus',
      icon: '🧠',
      color: 'from-blue-500 to-purple-600',
      expertise: 'Confidence & Mindset Coach',
      todayAction: 'Practice confident posture for 2 minutes',
      quickWin: 'Make eye contact with 3 people today'
    },
    alex: {
      name: 'Alex',
      icon: '💪',
      color: 'from-red-500 to-orange-600',
      expertise: 'Performance & Intimacy Coach',
      todayAction: 'Practice the 4-7-8 breathing technique',
      quickWin: 'Do 10 kegel exercises right now'
    },
    ryan: {
      name: 'Ryan',
      icon: '🗣️',
      color: 'from-green-500 to-emerald-600',
      expertise: 'Social Skills & Dating Coach',
      todayAction: 'Start one conversation with a stranger',
      quickWin: 'Smile and say "hi" to someone new'
    },
    jake: {
      name: 'Jake',
      icon: '⚡',
      color: 'from-yellow-500 to-orange-600',
      expertise: 'Dating & Approach Coach',
      todayAction: 'Practice your introduction in the mirror',
      quickWin: 'Write down 3 conversation starters'
    },
    ethan: {
      name: 'Ethan',
      icon: '❤️',
      color: 'from-purple-500 to-pink-600',
      expertise: 'Relationship & Connection Coach',
      todayAction: 'Practice active listening with someone',
      quickWin: 'Ask someone "How are you feeling?" instead of "How are you?"'
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

  // Handle category expansion
  const toggleCategory = (categoryId: string) => {
    setExpandedCategory(expandedCategory === categoryId ? null : categoryId)
    setSelectedSolution(null)
  }

  // Handle solution selection
  const selectSolution = (categoryId: string, subcategory: string) => {
    setSelectedSolution({ category: categoryId, subcategory })
  }

  // Close solution view
  const closeSolution = () => {
    setSelectedSolution(null)
  }

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
              <h1 className="text-3xl font-bold">
                Hey {user.username}! 👋
              </h1>
              <p className="text-lg opacity-70">Your coach {coach.name} • {coach.expertise}</p>
            </div>
          </div>

          {/* Today's Action */}
          <div className="bg-gradient-to-r from-red-500/20 to-orange-500/20 border border-red-500/30 rounded-2xl p-6 mb-6">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-2xl">🎯</span>
              <h2 className="text-xl font-bold">Today's Action</h2>
            </div>
            <p className="text-lg mb-4 opacity-90">{coach.todayAction}</p>
            <div className="flex gap-3">
              <button className="px-6 py-3 bg-red-600 hover:bg-red-700 rounded-lg font-semibold transition-colors">
                Start Now
              </button>
              <button className="px-6 py-3 bg-white/10 hover:bg-white/20 rounded-lg font-semibold transition-colors">
                Mark Complete ✓
              </button>
            </div>
          </div>

          {/* Quick Win */}
          <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-4">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-xl">⚡</span>
              <h3 className="text-lg font-semibold text-green-400">Quick Win</h3>
            </div>
            <p className="opacity-90">{coach.quickWin}</p>
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
            <span>📚</span> Instant Solutions
          </h2>
          <p className="text-lg opacity-70 mb-6">Click any category to see step-by-step guides that actually work:</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
            {solutionCategories.map((category, index) => (
              <motion.div
                key={category.id}
                className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl overflow-hidden"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
              >
                {/* Category Header */}
                <button
                  onClick={() => toggleCategory(category.id)}
                  className="w-full p-6 text-left hover:bg-white/5 transition-colors flex items-center justify-between"
                >
                  <div className="flex-1">
                    <h3 className="text-lg font-bold mb-2">{category.title}</h3>
                    <p className="text-sm opacity-70">{category.description}</p>
                  </div>
                  <div className="ml-4">
                    {expandedCategory === category.id ? (
                      <ChevronDown className="w-5 h-5" />
                    ) : (
                      <ChevronRight className="w-5 h-5" />
                    )}
                  </div>
                </button>

                {/* Subcategories */}
                <AnimatePresence>
                  {expandedCategory === category.id && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="border-t border-white/10"
                    >
                      <div className="p-4 space-y-2">
                        {category.subcategories.map((subcategory, subIndex) => (
                          <button
                            key={subIndex}
                            onClick={() => selectSolution(category.id, subcategory)}
                            className="w-full text-left p-3 bg-white/5 hover:bg-white/10 rounded-lg transition-colors flex items-center justify-between group"
                          >
                            <span className="text-sm">{subcategory}</span>
                            <ChevronRight className="w-4 h-4 opacity-50 group-hover:opacity-100 transition-opacity" />
                          </button>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <motion.div 
            className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6"
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
              <span>💬</span> Get Help
            </h3>
            <p className="mb-4 opacity-80">Ask questions and learn from men who've solved these problems.</p>
            <button
              onClick={goToCommunity}
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold transition-colors"
            >
              Join Community
            </button>
          </motion.div>

          <motion.div 
            className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6"
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
              <span>📈</span> Your Progress
            </h3>
            
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-xl font-bold text-green-400">{user.streak}</div>
                <div className="text-xs opacity-70">Days Active</div>
              </div>
              <div>
                <div className="text-xl font-bold text-blue-400">{user.total_earned}</div>
                <div className="text-xs opacity-70">Coins Earned</div>
              </div>
              <div>
                <div className="text-xl font-bold text-purple-400">{user.confidence_score}%</div>
                <div className="text-xs opacity-70">Confidence</div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Solution Detail Modal */}
      <AnimatePresence>
        {selectedSolution && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div 
              className="bg-gray-900 border border-white/20 rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold">{selectedSolution.subcategory}</h3>
                <button 
                  onClick={closeSolution}
                  className="text-gray-400 hover:text-white"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              <div className="space-y-4">
                <div className="bg-blue-500/20 border border-blue-500/30 rounded-lg p-4">
                  <p className="text-blue-400 font-semibold">💡 Solution Content Coming Soon</p>
                  <p className="text-sm opacity-70 mt-2">
                    Step-by-step guide for "{selectedSolution.subcategory}" will be available here.
                    This will include practical, actionable advice you can use immediately.
                  </p>
                </div>
                
                <button 
                  onClick={closeSolution}
                  className="w-full py-3 bg-red-600 hover:bg-red-700 rounded-lg font-semibold transition-colors"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
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