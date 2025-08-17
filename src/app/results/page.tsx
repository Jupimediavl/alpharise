'use client'

import { useSearchParams } from 'next/navigation'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { useEffect, useState, Suspense } from 'react'

function ResultsContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [userType, setUserType] = useState('overthinker')
  const [coach, setCoach] = useState('logan')
  const [isLoading, setIsLoading] = useState(true)
  const [personalizedAnalysis, setPersonalizedAnalysis] = useState<string>('')
  const [analysisLoading, setAnalysisLoading] = useState(false)

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
          username: 'future alpha' // Could get actual username from session if available
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
    // Get user type and coach from URL params (from assessment)
    const urlUserType = searchParams.get('userType') || 'overthinker'
    const urlCoach = searchParams.get('coach') || 'logan'
    const age = searchParams.get('age') || '25'
    const confidenceScore = searchParams.get('confidenceScore') || '25'
    
    setUserType(urlUserType)
    setCoach(urlCoach)
    
    // Fetch personalized analysis
    fetchPersonalizedAnalysis(urlUserType, urlCoach, age, confidenceScore)
    
    // Simulate loading/processing time
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 2000)

    return () => clearTimeout(timer)
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
        <div className="text-3xl font-black text-white">
          AlphaRise
        </div>
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
            className="text-3xl md:text-4xl font-black mb-4 text-white"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            Your Challenge: {currentUserType.problem} {currentUserType.problemIcon}
          </motion.h1>

          {/* Personalized Analysis Section */}
          <motion.div 
            className="text-xl leading-relaxed opacity-90 mb-12 max-w-3xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
          >
            {analysisLoading ? (
              <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-8">
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
              <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/30 rounded-xl p-8">
                <h3 className="text-2xl font-bold text-purple-400 mb-4 flex items-center gap-2">
                  {currentCoach.icon} Personal Analysis from Coach {currentCoach.name}
                </h3>
                <div className="text-lg text-left leading-relaxed whitespace-pre-line">
                  {personalizedAnalysis}
                </div>
              </div>
            ) : (
              // Fallback to static content if AI analysis fails
              <div className="space-y-6">
                <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-6">
                  <h3 className="text-xl font-bold text-red-400 mb-3 flex items-center gap-2">
                    {currentUserType.problemIcon} Your Core Challenge
                  </h3>
                  <p className="text-lg">{currentUserType.description}</p>
                </div>
                
                <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-6">
                  <h3 className="text-xl font-bold text-green-400 mb-3 flex items-center gap-2">
                    {currentCoach.icon} Your Solution Coach
                  </h3>
                  <div className="text-2xl font-bold mb-2">
                    {currentCoach.name} - {currentCoach.title}
                  </div>
                  <p className="text-lg mb-3">Specializes in helping {currentCoach.helpsWith}</p>
                  <p className="text-base opacity-90">{currentCoach.approach}</p>
                </div>
              </div>
            )}
          </motion.div>

          {/* Program Features */}
          <motion.div 
            className="bg-black/30 backdrop-blur-sm border border-purple-500/20 rounded-2xl p-8 mb-12"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
          >
            <h3 className="text-2xl font-bold mb-6 text-cyan-400">
              What {currentCoach.name} Will Teach You:
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
              {currentCoach.features.map((feature, index) => (
                <motion.div 
                  key={index}
                  className="flex items-start gap-3"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: 1 + (index * 0.1) }}
                >
                  <div className="text-purple-400 mt-1">✓</div>
                  <div className="text-lg">{feature}</div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* CTA */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1.2 }}
          >
            <motion.button
              onClick={handleStartProgram}
              className="px-12 py-6 text-xl font-bold bg-gradient-to-r from-purple-600 via-magenta-600 to-pink-600 rounded-full 
                       transition-all duration-300 ease-out
                       shadow-2xl relative overflow-hidden group mb-8"
              whileHover={{ 
                scale: 1.05, 
                y: -2
              }}
              whileTap={{ scale: 0.98 }}
            >
              <span className="relative z-10">START TRAINING WITH {currentCoach.name.toUpperCase()}</span>
              <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 
                            translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-500"></div>
            </motion.button>

            <p className="text-sm opacity-60">
              Join thousands of {currentCoach.helpsWith.toLowerCase()} who've transformed with {currentCoach.name}
            </p>
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