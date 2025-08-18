'use client'

import { useSearchParams } from 'next/navigation'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { useEffect, useState, Suspense } from 'react'
import { SupabasePricingManager } from '@/lib/supabase'

function ResultsContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [userType, setUserType] = useState('overthinker')
  const [coach, setCoach] = useState('logan')
  const [isLoading, setIsLoading] = useState(true)
  const [personalizedAnalysis, setPersonalizedAnalysis] = useState<string>('')
  const [analysisLoading, setAnalysisLoading] = useState(false)
  const [pricingData, setPricingData] = useState<{
    trialPrice: number
    trialDays: number
    mainPrice: number
    currency: string
  }>({
    trialPrice: 1,
    trialDays: 3,
    mainPrice: 9.99,
    currency: 'USD'
  })

  // NEW SYSTEM: Show user their PROBLEM and their assigned COACH who will help
  const userTypeData = {
    overthinker: {
      problem: 'Overthinking',
      problemIcon: '🧠',
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
      icon: '🎯',
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
      // Get user type and coach from URL params (from assessment)
      const urlUserType = searchParams.get('userType') || 'overthinker'
      const urlCoach = searchParams.get('coach') || 'logan'
      const age = searchParams.get('age') || '25'
      const confidenceScore = searchParams.get('confidenceScore') || '25'
      
      setUserType(urlUserType)
      setCoach(urlCoach)
      
      // Load pricing data from database
      try {
        const [trialPricing, mainPricing] = await Promise.all([
          SupabasePricingManager.getTrialPricing(),
          SupabasePricingManager.getMainPricing()
        ])

        if (trialPricing && mainPricing) {
          setPricingData({
            trialPrice: trialPricing.price,
            trialDays: trialPricing.days,
            mainPrice: mainPricing.price,
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
            🎯
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
          {/* Avatar Reveal */}
          <motion.div 
            className="text-8xl mb-8"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.6, type: "spring", bounce: 0.5 }}
          >
            {currentCoach.icon}
          </motion.div>

          <motion.div 
            className="mb-4 text-sm uppercase tracking-wider text-cyan-400 font-semibold"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            Your Problem & Coach Match
          </motion.div>

          <motion.h1 
            className="text-4xl md:text-5xl font-black mb-8 text-white"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            YOUR CONFIDENCE ANALYSIS
          </motion.h1>

          {/* Confidence Score - Big and Prominent */}
          <motion.div 
            className="mb-8 bg-gradient-to-r from-purple-900/50 to-magenta-900/50 border-2 border-purple-500/50 rounded-2xl p-8"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.5 }}
          >
            <div className="text-center">
              <div className="text-purple-400 font-bold text-lg mb-2">YOUR CONFIDENCE SCORE</div>
              <div className="text-8xl md:text-9xl font-black text-purple-500 mb-4">
                {searchParams.get('confidenceScore') || '25'}<span className="text-4xl text-white">/100</span>
              </div>
              <div className="text-2xl md:text-3xl font-bold text-magenta-400 mb-4">
                MASSIVE POTENTIAL!
              </div>
              <div className="text-xl text-white max-w-2xl mx-auto">
                <strong>You're starting at {searchParams.get('confidenceScore') || '25'}, but your potential is 100.</strong> 
                Most successful guys started exactly where you are right now. 
                <span className="text-magenta-400 font-bold"> Your transformation to 100 starts today.</span>
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
                Ready to transform that <span className="text-purple-500 font-bold">{searchParams.get('confidenceScore') || '25'}</span> into <span className="text-magenta-400 font-bold">100</span>?
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
                START FREE TRIAL NOW
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 
                            translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-500"></div>
            </motion.button>
            
            <div className="mt-3 space-y-1">
              <div className="text-sm text-green-400 font-semibold">
                {pricingData.trialDays}-Day Trial for ${pricingData.trialPrice} • Then ${pricingData.mainPrice}/month
              </div>
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
            <div className="text-center mb-6">
              <div className="text-6xl mb-4">{currentCoach.icon}</div>
              <div className="text-2xl md:text-3xl font-bold text-white mb-2">
                You've been assigned Coach {currentCoach.name}
              </div>
              <div className="text-xl text-blue-400 font-semibold">
                "{currentCoach.title}"
              </div>
            </div>
            
            <div className="text-lg text-white text-center mb-6">
              Coach {currentCoach.name} specializes in helping guys with {currentUserType.problem.toLowerCase()}. 
              Here's exactly how he'll transform you:
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-4xl mx-auto">
              {currentCoach.features.map((feature, index) => (
                <motion.div 
                  key={index}
                  className="flex items-start gap-3 text-left"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: 0.9 + (index * 0.1) }}
                >
                  <div className="text-blue-400 mt-1 text-xl">🎯</div>
                  <div className="text-white">{feature}</div>
                </motion.div>
              ))}
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
              <div className="bg-gradient-to-r from-purple-500/15 to-magenta-500/15 border-2 border-purple-500/40 rounded-2xl p-8 text-center">
                <div className="text-3xl md:text-4xl font-black text-magenta-400 mb-6 tracking-wider">
                  PERSONAL ANALYSIS FROM COACH {currentCoach.name.toUpperCase()}
                </div>
                <div className="text-xl md:text-2xl leading-relaxed text-white font-medium max-w-3xl mx-auto">
                  {personalizedAnalysis.split('\n\n').map((paragraph, index) => (
                    <p key={index} className="mb-6">
                      {paragraph.trim()}
                    </p>
                  ))}
                </div>
              </div>
            ) : (
              // Fallback to static content if AI analysis fails
              <div className="bg-gradient-to-r from-purple-500/15 to-magenta-500/15 border-2 border-purple-500/40 rounded-2xl p-8 text-center">
                <div className="text-3xl md:text-4xl font-black text-magenta-400 mb-6 tracking-wider">
                  PERSONAL ANALYSIS FROM COACH {currentCoach.name.toUpperCase()}
                </div>
                <div className="text-xl text-white max-w-2xl mx-auto">
                  You're dealing with {currentUserType.problem.toLowerCase()}, which is exactly my specialty. 
                  At your confidence level, you've got serious potential - we just need to unlock it. 
                  <strong className="text-magenta-400">AlphaRise will transform you into the confident man you're meant to be.</strong>
                </div>
              </div>
            )}
          </motion.div>

          {/* Urgency & FOMO Section */}
          <motion.div 
            className="bg-gradient-to-r from-purple-900/30 to-magenta-900/30 border-2 border-purple-500/50 rounded-2xl p-8 mb-8"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
          >
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-black text-magenta-400 mb-4">
                DON'T WAIT ANOTHER DAY
              </div>
              <div className="text-xl md:text-2xl text-white mb-6">
                Every day you wait is another day of <strong className="text-purple-400">missed opportunities</strong>, 
                <strong className="text-purple-400"> rejected approaches</strong>, and <strong className="text-purple-400">confidence that stays stuck</strong>.
              </div>
            </div>
          </motion.div>


          {/* Final Urgency Push */}
          <motion.div 
            className="bg-gradient-to-r from-purple-900/50 to-magenta-900/50 border-2 border-purple-500/50 rounded-2xl p-8 mb-8"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1.4 }}
          >
            <div className="text-center">
              <div className="text-2xl md:text-3xl font-black text-magenta-400 mb-4">
                THE CHOICE IS YOURS
              </div>
              <div className="text-xl text-white mb-6">
                Right now, you have TWO paths:
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div className="bg-gray-500/20 border border-gray-500/50 rounded-xl p-6">
                  <div className="text-xl font-bold text-gray-400 mb-3">STAY THE SAME</div>
                  <ul className="text-left space-y-2 text-white">
                    <li>• Keep getting rejected</li>
                    <li>• Watch opportunities slip away</li>
                    <li>• Feel like a fraud around confident people</li>
                    <li>• Wonder "what if" for the rest of your life</li>
                  </ul>
                </div>
                <div className="bg-purple-500/20 border border-purple-500/50 rounded-xl p-6">
                  <div className="text-xl font-bold text-magenta-400 mb-3">TRANSFORM WITH ALPHARISE</div>
                  <ul className="text-left space-y-2 text-white">
                    <li>• Command respect wherever you go</li>
                    <li>• Attract the people you actually want</li>
                    <li>• Feel genuinely confident in any situation</li>
                    <li>• Become the man you were meant to be</li>
                  </ul>
                </div>
              </div>
            </div>
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
                Your confidence score of <strong>{searchParams.get('confidenceScore') || '25'}/100</strong> will NOT magically improve.
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
                START YOUR FREE TRIAL
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/30 to-white/0 
                            translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
            </motion.button>

            <div className="space-y-3">
              <p className="text-lg font-bold text-green-400">
                {pricingData.trialDays}-Day Trial for Just ${pricingData.trialPrice}
              </p>
              <p className="text-base text-magenta-400 font-semibold">
                Start Training with Coach {currentCoach.name} Today
              </p>
              <p className="text-sm text-gray-400">
                Then ${pricingData.mainPrice}/month • Cancel anytime before trial ends
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
          <div className="text-6xl mb-4">🎯</div>
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