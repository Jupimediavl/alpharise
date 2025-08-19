'use client'

import { useSearchParams } from 'next/navigation'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { useEffect, useState, Suspense } from 'react'
import { SupabasePricingManager, SupabaseLearningManager } from '@/lib/supabase'
import Image from 'next/image'

function ResultsContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [userType, setUserType] = useState('overthinker')
  const [coach, setCoach] = useState('logan')
  const [isLoading, setIsLoading] = useState(true)
  const [personalizedAnalysis, setPersonalizedAnalysis] = useState<string>('')
  const [analysisLoading, setAnalysisLoading] = useState(false)
  const [milestones, setMilestones] = useState<any[]>([])
  const [learningStats, setLearningStats] = useState({
    totalProblems: 0,
    totalExercises: 0,
    nextMilestone: null as any,
    currentMilestone: null as any
  })
  const [pricingData, setPricingData] = useState<{
    trialPrice: number
    trialDays: number
    originalPrice: number
    discountedPrice: number
    currentPrice: number
    discountPercentage: number
    hasDiscount: boolean
    currency: string
  }>({
    trialPrice: 1,
    trialDays: 3,
    originalPrice: 19.99,
    discountedPrice: 9.99,
    currentPrice: 9.99,
    discountPercentage: 50,
    hasDiscount: true,
    currency: 'USD'
  })

  // NEW SYSTEM: Show user their PROBLEM and their assigned COACH who will help
  const userTypeData = {
    overthinker: {
      problem: 'Overthinking',
      problemIcon: '',
      description: 'You have a brilliant analytical mind, but it sometimes works against you in social situations. You see every possible outcome - including the scary ones.',
      color: 'from-purple-500 to-pink-500'
    },
    nervous: {
      problem: 'Performance Anxiety',
      problemIcon: '⚡',
      description: 'You want to excel and perform your best, but performance pressure sometimes gets in the way of natural confidence.',
      color: 'from-blue-500 to-purple-500'
    },
    rookie: {
      problem: 'Feeling Behind',
      problemIcon: '📚',
      description: 'You\'re honest about where you are and ready to learn. This self-awareness actually puts you ahead of most guys.',
      color: 'from-green-500 to-blue-500'
    },
    updown: {
      problem: 'Inconsistent Confidence',
      problemIcon: '💎',
      description: 'You have incredible potential that shines through sometimes, but you need consistency to access that confidence reliably.',
      color: 'from-yellow-500 to-orange-500'
    },
    surface: {
      problem: 'Shallow Connections',
      problemIcon: '❤️',
      description: 'You understand that real intimacy comes from genuine connection. Your emotional intelligence is rare and valuable.',
      color: 'from-pink-500 to-purple-500'
    }
  }

  const coachData = {
    logan: {
      name: 'Logan',
      title: 'The Straight Shooter',
      icon: '',
      avatar: '/avatars/logan.png',
      helpsWith: 'Overthinkers',
      approach: 'Gets you out of your head and into action with direct, no-nonsense techniques',
      features: [
        'Instant decision-making techniques to stop analysis paralysis',
        'Mind control methods to cut through mental fog',
        'Confidence-building exercises for anxious moments',
        'Transforming analytical skills into social advantages'
      ],
      color: 'from-purple-500 to-pink-500'
    },
    chase: {
      name: 'Chase',
      title: 'The Cool Cat',
      icon: '😎',
      avatar: '/avatars/chase.png',
      helpsWith: 'Nervous Guys',
      approach: 'Transforms performance anxiety into unshakeable confidence with calm, steady techniques',
      features: [
        'Performance anxiety elimination methods',
        'Staying cool under pressure techniques',
        'Physical confidence training',
        'Mindset shifts from pressure to natural flow'
      ],
      color: 'from-blue-500 to-purple-500'
    },
    mason: {
      name: 'Mason',
      title: 'The Patient Pro',
      icon: '🧑‍🏫',
      avatar: '/avatars/mason.png',
      helpsWith: 'Rookies',
      approach: 'Builds comprehensive skills step-by-step with patient, thorough education',
      features: [
        'Complete confidence education from basics to advanced',
        'Step-by-step skill building without judgment',
        'Real-world practice scenarios',
        'Knowledge that builds natural competence'
      ],
      color: 'from-green-500 to-blue-500'
    },
    blake: {
      name: 'Blake',
      title: 'The Reliable Guy',
      icon: '⚡',
      avatar: '/avatars/blake.png',
      helpsWith: 'Up & Down Guys',
      approach: 'Creates systems and habits that turn potential into consistent, reliable results',
      features: [
        'Consistency training for reliable confidence',
        'System building for sustained success',
        'Momentum management techniques',
        'Making your good days your normal days'
      ],
      color: 'from-yellow-500 to-orange-500'
    },
    knox: {
      name: 'Knox',
      title: 'The Authentic One',
      icon: '❤️',
      avatar: '/avatars/knox.png',
      helpsWith: 'Surface Guys',
      approach: 'Combines emotional intelligence with confident expression for authentic connections',
      features: [
        'Emotional intelligence and communication mastery',
        'Building deep, meaningful connections',
        'Authentic confidence without losing empathy',
        'Creating relationships that actually matter'
      ],
      color: 'from-pink-500 to-purple-500'
    }
  }

  const currentUserType = userTypeData[userType as keyof typeof userTypeData] || userTypeData.overthinker
  const currentCoach = coachData[coach as keyof typeof coachData] || coachData.logan

  const handleStartProgram = () => {
    const age = searchParams.get('age') || '25'
    const confidenceScore = searchParams.get('confidenceScore') || '25'
    router.push(`/signup?userType=${userType}&coach=${coach}&age=${age}&confidenceScore=${confidenceScore}`)
  }

  // Fetch personalized analysis from OpenAI
  const fetchPersonalizedAnalysis = async (userType: string, coach: string, age: string, confidenceScore: string) => {
    setAnalysisLoading(true)
    try {
      const response = await fetch('/api/personalized-analysis', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userType,
          coach,
          age: parseInt(age),
          confidenceScore: parseInt(confidenceScore),
          username: 'future Alpha' // Could get actual username from session if available
        })
      })

      const data = await response.json()
      if (data.success && data.analysis) {
        setPersonalizedAnalysis(data.analysis)
      } else {
        // Fallback to static content
        setPersonalizedAnalysis('')
      }
    } catch (error) {
      console.error('Error fetching personalized analysis:', error)
      setPersonalizedAnalysis('')
    } finally {
      setAnalysisLoading(false)
    }
  }

  useEffect(() => {
    const loadPageData = async () => {
      // Get user type and coach from URL params (from confidence test)
      const urlUserType = searchParams.get('userType') || 'overthinker'
      const urlCoach = searchParams.get('coach') || 'logan'
      const age = searchParams.get('age') || '25'
      const confidenceScore = searchParams.get('confidenceScore') || '25'
      
      setUserType(urlUserType)
      setCoach(urlCoach)
      
      // Load learning system data
      try {
        const milestonesData = await SupabaseLearningManager.getMilestones()
        setMilestones(milestonesData)
        
        const currentPoints = parseInt(confidenceScore)
        const currentMilestone = milestonesData
          .filter(m => currentPoints >= m.points_required)
          .sort((a, b) => b.points_required - a.points_required)[0]
        
        const nextMilestone = milestonesData.find(m => currentPoints < m.points_required)
        
        // Load problems and exercises count for the user type
        const problems = await SupabaseLearningManager.getProblemsForUserType(urlUserType)
        let totalExercises = 0
        for (const problem of problems) {
          const exercises = await SupabaseLearningManager.getExercisesForProblem(problem.id)
          totalExercises += exercises.length
        }
        
        setLearningStats({
          totalProblems: problems.length,
          totalExercises,
          currentMilestone,
          nextMilestone
        })
      } catch (error) {
        console.error('Error loading learning system data:', error)
      }

      // Load pricing data with discount information
      try {
        const [trialPricing, mainPricingWithDiscount] = await Promise.all([
          SupabasePricingManager.getTrialPricing(),
          SupabasePricingManager.getPricingWithDiscount()
        ])

        if (trialPricing && mainPricingWithDiscount) {
          setPricingData({
            trialPrice: trialPricing.price,
            trialDays: trialPricing.days,
            originalPrice: mainPricingWithDiscount.originalPrice,
            discountedPrice: mainPricingWithDiscount.discountedPrice,
            currentPrice: mainPricingWithDiscount.currentPrice,
            discountPercentage: mainPricingWithDiscount.discountPercentage,
            hasDiscount: mainPricingWithDiscount.hasDiscount,
            currency: trialPricing.currency
          })
        }
      } catch (error) {
        console.error('Error loading pricing:', error)
        // Keep default values if error
      }
      
      // Fetch personalized analysis
      fetchPersonalizedAnalysis(urlUserType, urlCoach, age, confidenceScore)
      
      // Simulate loading/processing time
      const timer = setTimeout(() => {
        setIsLoading(false)
      }, 2000)

      return () => clearTimeout(timer)
    }

    loadPageData()
  }, [searchParams])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white flex items-center justify-center">
        <div className="text-center">
          <motion.div
            className="text-6xl mb-8"
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          >
          </motion.div>
          <motion.h2 
            className="text-3xl font-bold mb-4 bg-gradient-to-r from-purple-500 via-magenta-500 to-pink-500 bg-clip-text text-transparent"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
          >
            Analyzing Your Responses...
          </motion.h2>
          <motion.p 
            className="text-lg opacity-70"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.7 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            Creating your personalized confidence profile
          </motion.p>
          <motion.div 
            className="mt-8 w-64 h-2 bg-white/10 rounded-full overflow-hidden mx-auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.6 }}
          >
            <motion.div 
              className="h-full bg-gradient-to-r from-purple-600 via-magenta-600 to-pink-600 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: '100%' }}
              transition={{ duration: 1.5, ease: "easeInOut" }}
            />
          </motion.div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white">
      {/* Header */}
      <header className="p-6 text-center">
        <button
          onClick={() => router.push('/')}
          className="text-3xl font-black text-white hover:text-magenta-400 transition-colors cursor-pointer"
        >
          AlphaRise
        </button>
      </header>

      <div className="container mx-auto px-6 py-12">
        <motion.div 
          className="max-w-4xl mx-auto text-center"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >

          <motion.div 
            className="mb-4 text-sm uppercase tracking-wider text-cyan-400 font-semibold"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            Your Problem & Coach Match
          </motion.div>

          <motion.h1 
            className="text-4xl md:text-5xl font-black mb-4 text-white"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            YOUR CONFIDENCE ANALYSIS
          </motion.h1>


          {/* Enhanced Confidence Score with Milestone System */}
          <motion.div 
            className="mb-8 bg-gradient-to-r from-purple-900/50 to-magenta-900/50 border-2 border-purple-500/50 rounded-2xl p-8"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.5 }}
          >
            <div className="text-center">
              <div className="text-purple-400 font-bold text-lg mb-2">YOUR CONFIDENCE SCORE</div>
              <div className="text-8xl md:text-9xl font-black text-purple-500 mb-4 flex items-center justify-center gap-4">
                {searchParams.get('confidenceScore') || '25'}
                <span className="text-4xl text-white">points</span>
                {learningStats.currentMilestone && (
                  <span className="text-6xl">{learningStats.currentMilestone.badge_icon}</span>
                )}
              </div>
              
              {/* Current Milestone */}
              {learningStats.currentMilestone && (
                <div className="text-2xl font-bold text-green-400 mb-2">
                  {learningStats.currentMilestone.title}
                </div>
              )}
              
              {/* Next Milestone Progress */}
              {learningStats.nextMilestone && (
                <div className="mb-4">
                  <div className="text-lg text-magenta-400 mb-2">
                    Next: {learningStats.nextMilestone.badge_icon} {learningStats.nextMilestone.title}
                  </div>
                  <div className="bg-gray-800 rounded-full h-3 max-w-md mx-auto">
                    <div 
                      className="bg-gradient-to-r from-purple-500 to-magenta-500 h-3 rounded-full transition-all duration-500"
                      style={{ 
                        width: `${Math.min(100, ((parseInt(searchParams.get('confidenceScore') || '25')) / learningStats.nextMilestone.points_required) * 100)}%` 
                      }}
                    />
                  </div>
                  <div className="text-sm text-gray-400 mt-1">
                    {learningStats.nextMilestone.points_required - parseInt(searchParams.get('confidenceScore') || '25')} points to go
                  </div>
                </div>
              )}
              
              <div className="text-xl text-white max-w-2xl mx-auto">
                {learningStats.currentMilestone 
                  ? <><strong>You've reached {learningStats.currentMilestone.title}!</strong> Keep building momentum to reach the next level.</>
                  : <><strong>You're just getting started at {searchParams.get('confidenceScore') || '25'} points.</strong> Every journey begins with a single step.</>
                }
                <br /><br />
                Most successful people started exactly where you are right now. 
                <span className="text-magenta-400 font-bold"> Your transformation starts today.</span>
              </div>
            </div>
          </motion.div>

          {/* Learning System Preview */}
          <motion.div 
            className="mb-12 bg-gradient-to-r from-blue-900/30 to-purple-900/30 border border-blue-500/30 rounded-xl p-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
          >
            <div className="text-center mb-6">
              <div className="text-2xl font-bold text-blue-400 mb-2">🎯 Your Personalized Learning Path</div>
              <div className="text-lg text-white">Based on your {searchParams.get('confidenceScore') || '25'} point score</div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-4 text-center">
                <div className="text-3xl mb-2">🧠</div>
                <div className="text-xl font-bold text-white mb-2">{learningStats.totalProblems} Problems</div>
                <div className="text-sm text-gray-400">Specifically designed for your personality type</div>
              </div>
              
              <div className="bg-magenta-500/10 border border-magenta-500/30 rounded-lg p-4 text-center">
                <div className="text-3xl mb-2">💪</div>
                <div className="text-xl font-bold text-white mb-2">{learningStats.totalExercises}+ Exercises</div>
                <div className="text-sm text-gray-400">Practical steps to build real confidence</div>
              </div>
              
              <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4 text-center">
                <div className="text-3xl mb-2">
                  {learningStats.nextMilestone ? learningStats.nextMilestone.badge_icon : '🏆'}
                </div>
                <div className="text-xl font-bold text-white mb-2">
                  {learningStats.nextMilestone ? learningStats.nextMilestone.title : 'Master Level'}
                </div>
                <div className="text-sm text-gray-400">
                  {learningStats.nextMilestone 
                    ? `${learningStats.nextMilestone.points_required - parseInt(searchParams.get('confidenceScore') || '25')} points away`
                    : 'You\'ve reached the top!'
                  }
                </div>
              </div>
            </div>
            
            <div className="text-center mt-6">
              <div className="text-lg text-white">
                🚀 <strong>Your first milestone:</strong> {' '}
                {learningStats.nextMilestone 
                  ? `Reach ${learningStats.nextMilestone.points_required} points to unlock "${learningStats.nextMilestone.title}"`
                  : 'You\'re already at the highest level!'
                }
              </div>
            </div>
          </motion.div>

          {/* Early CTA - For Immediate Action */}
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
          >
            <div className="mb-4">
              <div className="text-xl text-white mb-2">
                {(() => {
                  const score = parseInt(searchParams.get('confidenceScore') || '25')
                  if (score <= 4) {
                    return <>Ready to <span className="text-purple-500 font-bold">start your confidence journey</span>?</>
                  } else if (score <= 24) {
                    return <>You're <span className="text-green-400 font-bold">building momentum</span> - let's keep growing!</>
                  } else if (score <= 49) {
                    return <>You're <span className="text-blue-400 font-bold">making real progress</span> - time to level up!</>
                  } else if (score <= 99) {
                    return <>You're <span className="text-yellow-400 font-bold">getting confident</span> - let's reach mastery!</>
                  } else {
                    return <>You're at <span className="text-gold-400 font-bold">master level</span> - maintain your peak!</>
                  }
                })()}
              </div>
            </div>
            
            <motion.button
              onClick={handleStartProgram}
              className="px-12 py-4 text-xl font-bold bg-gradient-to-r from-purple-600 via-magenta-600 to-pink-600 rounded-xl 
                       transition-all duration-300 ease-out shadow-xl relative overflow-hidden group border border-magenta-400/50
                       hover:scale-105 active:scale-95"
              whileHover={{ 
                scale: 1.05,
                boxShadow: "0 0 30px rgba(236, 72, 153, 0.4)"
              }}
              whileTap={{ scale: 0.95 }}
            >
              <span className="relative z-10 text-white">
                START YOUR TRANSFORMATION
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 
                            translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-500"></div>
            </motion.button>
            
            <div className="mt-3 space-y-2">
              <div className="text-lg text-green-400 font-bold mb-3">
                {pricingData.trialDays}-Day Trial for Just ${pricingData.trialPrice}
              </div>
              {pricingData.hasDiscount ? (
                <div className="bg-gradient-to-r from-gray-800/50 to-gray-900/50 border border-gray-600/30 rounded-lg p-3 mb-2">
                  <div className="flex items-center justify-center gap-3">
                    <div className="text-center">
                      <div className="text-xs text-gray-400">Usually</div>
                      <span className="text-sm text-gray-400 line-through">${pricingData.originalPrice}/mo</span>
                    </div>
                    <div className="text-purple-400 text-2xl">→</div>
                    <div className="text-center">
                      <div className="text-xs text-green-400">Your Price</div>
                      <span className="text-xl text-green-400 font-bold">${pricingData.currentPrice}/mo</span>
                    </div>
                    <div className="bg-green-500/20 text-green-400 px-2 py-1 rounded text-xs font-medium border border-green-500/30">
                      Save $10
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-lg text-green-400 font-semibold">
                  Then ${pricingData.currentPrice}/month
                </div>
              )}
              <div className="text-xs text-gray-400">
                Or continue reading to learn more about your personalized plan
              </div>
            </div>
          </motion.div>

          {/* Problem Statement */}
          <motion.div 
            className="text-2xl md:text-3xl font-bold mb-8 text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.7 }}
          >
            <span className="text-purple-400">Your Problem:</span>{' '}
            <span className="text-white">{currentUserType.problem} {currentUserType.problemIcon}</span>
          </motion.div>

          {/* Coach Assignment */}
          <motion.div 
            className="bg-gradient-to-r from-blue-900/30 to-cyan-900/30 border-2 border-blue-500/50 rounded-2xl p-8 mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
          >
            {/* Header */}
            <div className="text-center mb-8">
              <div className="text-2xl md:text-3xl font-bold text-white mb-2">
                You've been assigned Coach {currentCoach.name}
              </div>
              <div className="text-xl text-blue-400 font-semibold">
                "{currentCoach.title}"
              </div>
            </div>

            {/* Two Column Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
              
              {/* Left Column - Content */}
              <div className="space-y-6">
                <div className="text-lg text-white">
                  Coach {currentCoach.name} specializes in helping guys with <span className="text-blue-400 font-semibold">{currentUserType.problem.toLowerCase()}</span>. 
                  Here's exactly how he'll transform you:
                </div>
                
                <div className="space-y-4">
                  {currentCoach.features.map((feature, index) => (
                    <motion.div 
                      key={index}
                      className="flex items-start gap-3 text-left"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.4, delay: 0.9 + (index * 0.1) }}
                    >
                      <div className="text-blue-400 mt-1 text-lg">•</div>
                      <div className="text-white">{feature}</div>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Right Column - Avatar */}
              <div className="flex justify-center lg:justify-end">
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.6, delay: 1.0 }}
                  className="relative"
                >
                  <div className="w-64 h-64 lg:w-80 lg:h-80 relative">
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-full blur-xl"></div>
                    <Image
                      src={currentCoach.avatar}
                      alt={`Coach ${currentCoach.name} - ${currentCoach.title}`}
                      width={320}
                      height={320}
                      className="relative z-10 w-full h-full object-contain"
                      priority
                    />
                  </div>
                </motion.div>
              </div>

            </div>
          </motion.div>

          {/* Personalized Analysis Section - Emphasized */}
          <motion.div 
            className="mb-12 max-w-4xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1.0 }}
          >
            {analysisLoading ? (
              <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-8 text-center">
                <div className="flex items-center justify-center gap-3 mb-4">
                  <motion.div
                    className="w-6 h-6 border-2 border-blue-400 border-t-transparent rounded-full"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  />
                  <span className="text-blue-400 font-semibold">Coach {currentCoach.name} is analyzing your results...</span>
                </div>
                <p className="text-base opacity-70">Creating your personalized confidence profile</p>
              </div>
            ) : personalizedAnalysis ? (
              <div className="relative bg-gradient-to-br from-purple-600/20 via-magenta-600/25 to-pink-600/20 border-2 border-magenta-400/60 rounded-3xl p-10 text-center overflow-hidden shadow-2xl">
                {/* Background glow effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-purple-600/10 via-magenta-600/15 to-pink-600/10 blur-xl"></div>
                
                {/* Animated border glow */}
                <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-purple-500 via-magenta-500 to-pink-500 opacity-20 animate-pulse"></div>
                
                <div className="relative z-10">
                  {/* Header with enhanced styling */}
                  <motion.div 
                    className="mb-8"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                  >
                    <div className="inline-block bg-gradient-to-r from-magenta-500 to-pink-500 text-white px-6 py-2 rounded-full text-sm font-bold uppercase tracking-wider mb-4">
                      🔥 Exclusive Analysis
                    </div>
                    <div className="text-2xl md:text-3xl font-black bg-gradient-to-r from-white via-magenta-200 to-pink-200 bg-clip-text text-transparent mb-4 leading-tight">
                      PERSONAL ANALYSIS FROM COACH {currentCoach.name.toUpperCase()}
                    </div>
                  </motion.div>
                  
                  {/* Content with enhanced typography */}
                  <motion.div 
                    className="text-xl md:text-2xl leading-relaxed text-white font-medium max-w-4xl mx-auto"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.8, delay: 0.3 }}
                  >
                    {personalizedAnalysis.split('\n\n').map((paragraph, index) => (
                      <p key={index} className="mb-6 text-shadow-sm">
                        {paragraph.trim()}
                      </p>
                    ))}
                  </motion.div>
                  
                  {/* Decorative elements */}
                  <div className="absolute top-6 left-6 w-3 h-3 bg-magenta-400 rounded-full animate-ping"></div>
                  <div className="absolute top-8 right-8 w-2 h-2 bg-pink-400 rounded-full animate-pulse"></div>
                  <div className="absolute bottom-8 left-8 w-2 h-2 bg-purple-400 rounded-full animate-bounce"></div>
                </div>
              </div>
            ) : (
              // Fallback to static content if AI analysis fails
              <div className="relative bg-gradient-to-br from-purple-600/20 via-magenta-600/25 to-pink-600/20 border-2 border-magenta-400/60 rounded-3xl p-10 text-center overflow-hidden shadow-2xl">
                {/* Background glow effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-purple-600/10 via-magenta-600/15 to-pink-600/10 blur-xl"></div>
                
                {/* Animated border glow */}
                <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-purple-500 via-magenta-500 to-pink-500 opacity-20 animate-pulse"></div>
                
                <div className="relative z-10">
                  {/* Header with enhanced styling */}
                  <motion.div 
                    className="mb-8"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                  >
                    <div className="inline-block bg-gradient-to-r from-magenta-500 to-pink-500 text-white px-6 py-2 rounded-full text-sm font-bold uppercase tracking-wider mb-4">
                      🔥 Exclusive Analysis
                    </div>
                    <div className="text-2xl md:text-3xl font-black bg-gradient-to-r from-white via-magenta-200 to-pink-200 bg-clip-text text-transparent mb-4 leading-tight">
                      PERSONAL ANALYSIS FROM COACH {currentCoach.name.toUpperCase()}
                    </div>
                  </motion.div>
                  
                  {/* Content with enhanced typography */}
                  <motion.div 
                    className="text-xl md:text-2xl leading-relaxed text-white font-medium max-w-4xl mx-auto"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.8, delay: 0.3 }}
                  >
                    <p className="mb-6 text-shadow-sm">
                      You're dealing with {currentUserType.problem.toLowerCase()}, which is exactly my specialty. 
                      At your confidence level, you've got serious potential - we just need to unlock it. 
                      <strong className="text-magenta-200">AlphaRise will transform you into the confident man you're meant to be.</strong>
                    </p>
                  </motion.div>
                  
                  {/* Decorative elements */}
                  <div className="absolute top-6 left-6 w-3 h-3 bg-magenta-400 rounded-full animate-ping"></div>
                  <div className="absolute top-8 right-8 w-2 h-2 bg-pink-400 rounded-full animate-pulse"></div>
                  <div className="absolute bottom-8 left-8 w-2 h-2 bg-purple-400 rounded-full animate-bounce"></div>
                </div>
              </div>
            )}
          </motion.div>



          {/* Powerful CTA */}
          <motion.div
            className="text-center"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1.6 }}
          >
            <div className="mb-6">
              <div className="text-3xl font-black text-white mb-2">
                The time for excuses is OVER.
              </div>
              <div className="text-xl text-purple-400">
                Your confidence score of <strong>{searchParams.get('confidenceScore') || '25'} points</strong> will NOT magically improve.
              </div>
            </div>

            <motion.button
              onClick={handleStartProgram}
              className="px-16 py-8 text-2xl md:text-3xl font-black bg-gradient-to-r from-purple-600 via-magenta-600 to-pink-600 rounded-2xl 
                       transition-all duration-300 ease-out
                       shadow-2xl relative overflow-hidden group mb-8 border-2 border-magenta-400
                       hover:scale-105 active:scale-95"
              whileHover={{ 
                scale: 1.08,
                boxShadow: "0 0 50px rgba(236, 72, 153, 0.6)"
              }}
              whileTap={{ scale: 0.95 }}
            >
              <span className="relative z-10 text-white drop-shadow-lg">
                START YOUR TRANSFORMATION
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/30 to-white/0 
                            translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
            </motion.button>

            <div className="space-y-4">
              <p className="text-xl font-bold text-green-400 mb-3">
                {pricingData.trialDays}-Day Trial for Just ${pricingData.trialPrice}
              </p>
              {pricingData.hasDiscount && (
                <div className="bg-gradient-to-r from-purple-900/30 to-blue-900/30 border border-purple-500/30 rounded-xl p-6 mb-4">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-transparent bg-gradient-to-r from-purple-300 via-blue-300 to-green-300 bg-clip-text mb-4">
                      Early Access Pricing
                    </p>
                    <div className="flex items-center justify-center gap-4 mb-3">
                      <div className="text-center">
                        <div className="text-sm text-gray-400 mb-1">Regular Price</div>
                        <span className="text-xl text-gray-400 line-through">${pricingData.originalPrice}</span>
                      </div>
                      <div className="text-2xl text-purple-400">→</div>
                      <div className="text-center">
                        <div className="text-sm text-green-400 mb-1">Your Price</div>
                        <span className="text-3xl text-green-400 font-bold">${pricingData.currentPrice}</span>
                      </div>
                      <div className="bg-gradient-to-r from-green-500 to-blue-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                        50% Off
                      </div>
                    </div>
                    <p className="text-sm text-purple-200">
                      Special launch pricing • Save $10/month
                    </p>
                  </div>
                </div>
              )}
              <p className="text-base text-magenta-400 font-semibold">
                Start Training with Coach {currentCoach.name} Today
              </p>
              <p className="text-sm text-gray-400">
                Cancel anytime before trial ends • No commitments
              </p>
              <div className="flex items-center justify-center gap-4 text-sm text-green-400">
                <span>✓ Full Program Access</span>
                <span>✓ Cancel Anytime</span>
                <span>✓ Results in {pricingData.trialDays} Days</span>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  )
}

export default function ResultsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">⚡</div>
          <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-500 via-magenta-500 to-pink-500 bg-clip-text text-transparent">
            Loading your results...
          </h2>
        </div>
      </div>
    }>
      <ResultsContent />
    </Suspense>
  )
}