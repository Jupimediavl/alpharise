'use client'

import { useSearchParams } from 'next/navigation'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { useEffect, useState, Suspense } from 'react'

function ResultsContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [avatarType, setAvatarType] = useState('marcus')
  const [isLoading, setIsLoading] = useState(true)

  const avatarData = {
    marcus: {
      name: 'Marcus "The Overthinker"',
      icon: '🧠',
      description: 'Marcus always thinks 3 steps ahead... sometimes too many steps. You have a brilliant mind that sometimes works against you. Your analytical nature means you see every possible outcome - including the ones that scare you. But Marcus, this same intelligence, when properly channeled, becomes your greatest asset.',
      features: [
        'Mind control techniques to stop overthinking',
        'Confidence-building exercises for anxious moments', 
        'Practical tools for staying present during intimacy',
        'Transforming analytical skills into social advantages'
      ],
      color: 'from-blue-500 to-purple-600'
    },
    jake: {
      name: 'Jake "The Performer"',
      icon: '⚡',
      description: 'Jake wants to be the best at everything he does. You\'re focused on excellence and want to perform at your best. Your drive for results is admirable, but performance pressure sometimes gets in the way. We\'ll help you channel that ambition into lasting confidence, Jake.',
      features: [
        'Proven techniques for lasting longer naturally',
        'Performance anxiety elimination methods',
        'Physical confidence training',
        'Mindset shifts from pressure to pleasure'
      ],
      color: 'from-yellow-500 to-orange-600'
    },
    alex: {
      name: 'Alex "The Student"',
      icon: '📚',
      description: 'Alex knows that knowledge is power. You\'re honest about where you are and ready to learn - that puts you ahead of most guys already, Alex. Your willingness to grow is your biggest strength. We\'ll give you the comprehensive education you never got.',
      features: [
        'Complete intimacy education from basics to advanced',
        'Step-by-step confidence building',
        'Real-world practice scenarios',
        'Knowledge that builds natural competence'
      ],
      color: 'from-green-500 to-emerald-600'
    },
    ryan: {
      name: 'Ryan "The Rising King"',
      icon: '💎',
      description: 'Ryan has that natural charm when he\'s in his element. You have incredible potential that shines through sometimes, but you need consistency. Those moments of natural confidence show what\'s possible. We\'ll help you access that state whenever you want, Ryan.',
      features: [
        'Consistency training for reliable confidence',
        'Social dynamics and attraction mastery',
        'Authentic self-expression techniques',
        'Building magnetic presence'
      ],
      color: 'from-purple-500 to-pink-600'
    },
    ethan: {
      name: 'Ethan "The Connection Master"',
      icon: '❤️',
      description: 'Ethan believes the best relationships start with the heart. You understand that the best intimacy comes from genuine connection. Your emotional intelligence is rare and valuable, Ethan. We\'ll help you combine deep connection with confident physical expression.',
      features: [
        'Emotional intelligence and communication mastery',
        'Building deep intimacy and connection',
        'Balancing emotional and physical confidence',
        'Creating meaningful relationships'
      ],
      color: 'from-red-500 to-rose-600'
    }
  }

  const currentAvatar = avatarData[avatarType as keyof typeof avatarData] || avatarData.marcus

  const handleStartProgram = () => {
    router.push('/signup')
  }

  useEffect(() => {
    // Safely get avatar type on client side
    const avatar = searchParams.get('avatar') || 'marcus'
    setAvatarType(avatar)
    
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
            className="text-3xl font-bold mb-4"
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
              className="h-full bg-gradient-to-r from-red-600 to-red-700 rounded-full"
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
        <div className="text-3xl font-black bg-gradient-to-r from-red-500 to-red-600 bg-clip-text text-transparent">
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
            {currentAvatar.icon}
          </motion.div>

          <motion.div 
            className="mb-4 text-sm uppercase tracking-wider text-red-400 font-semibold"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            Your Alpha Type Is...
          </motion.div>

          <motion.h1 
            className={`text-4xl md:text-5xl font-black mb-8 bg-gradient-to-r ${currentAvatar.color} bg-clip-text text-transparent`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            {currentAvatar.name}
          </motion.h1>

          <motion.p 
            className="text-xl leading-relaxed opacity-90 mb-12 max-w-3xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
          >
            {currentAvatar.description}
          </motion.p>

          {/* Program Features */}
          <motion.div 
            className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 mb-12"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
          >
            <h3 className="text-2xl font-bold mb-6 text-red-400">
              Your Personalized Program Includes:
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
              {currentAvatar.features.map((feature, index) => (
                <motion.div 
                  key={index}
                  className="flex items-start gap-3"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: 1 + (index * 0.1) }}
                >
                  <div className="text-red-400 mt-1">✓</div>
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
              className="px-12 py-6 text-xl font-bold bg-gradient-to-r from-red-600 to-red-700 rounded-full 
                       transition-all duration-300 ease-out
                       shadow-2xl relative overflow-hidden group mb-8"
              whileHover={{ 
                scale: 1.05, 
                y: -2,
                boxShadow: "0 20px 50px rgba(255, 68, 68, 0.4)"
              }}
              whileTap={{ scale: 0.98 }}
            >
              <span className="relative z-10">START MY TRANSFORMATION</span>
              <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 
                            translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-500"></div>
            </motion.button>

            <p className="text-sm opacity-60">
              Join thousands of men who've already transformed their confidence
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
          <h2 className="text-2xl font-bold">Loading your results...</h2>
        </div>
      </div>
    }>
      <ResultsContent />
    </Suspense>
  )
}