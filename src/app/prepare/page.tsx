'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'

export default function PreparePage() {
  const router = useRouter()
  const [isReady, setIsReady] = useState(false)

  useEffect(() => {
    // Small delay to make the page feel more intentional
    const timer = setTimeout(() => {
      setIsReady(true)
    }, 1000)

    return () => clearTimeout(timer)
  }, [])

  const handleStartAssessment = () => {
    router.push('/assessment')
  }

  const steps = [
    { number: 1, text: "10 honest questions" },
    { number: 2, text: "We'll show you your type" },
    { number: 3, text: "Your personal roadmap" }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white overflow-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 bg-gradient-to-br from-gray-900 via-black to-gray-900"></div>
      
      {/* Floating Particles */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
  <motion.div
    key={i}
    className="absolute w-1 h-1 bg-red-500/60 rounded-full"
    initial={{
      x: (i * 96) % 1920,
      y: 1000,
    }}
    animate={{
      y: -100,
      x: ((i * 96) + 500) % 1920,
    }}
            transition={{
              duration: Math.random() * 10 + 10,
              repeat: Infinity,
              ease: "linear",
              delay: Math.random() * 5,
            }}
          />
        ))}
      </div>

      {/* Main Container */}
      <div className="min-h-screen flex items-center justify-center px-6 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          {/* Logo */}
          <motion.div 
            className="text-5xl font-black bg-gradient-to-r from-red-500 to-red-600 bg-clip-text text-transparent mb-12"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
          >
            AlphaRise
          </motion.div>
          
          {/* Main Title */}
          <motion.h1 
            className="text-4xl md:text-6xl font-black mb-8 leading-tight"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            Hey, let's figure out what's really holding you back
          </motion.h1>
          
          {/* Subtitle */}
          <motion.p 
            className="text-xl md:text-2xl mb-16 opacity-90 leading-relaxed max-w-3xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            Look, we get it. Dating and confidence isn't something they teach you in school. 
            But here's the thing - every guy who's now confident with women started exactly where you are right now.
          </motion.p>

          {/* Progress Steps */}
          <motion.div 
            className="flex flex-col md:flex-row justify-center items-center gap-8 mb-16"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
          >
            {steps.map((step, index) => (
              <div key={index} className="flex flex-row md:flex-col items-center gap-4">
                <motion.div 
                  className="w-16 h-16 rounded-full bg-gradient-to-r from-red-600 to-red-700 
                           flex items-center justify-center text-2xl font-bold shadow-lg"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.4, delay: 0.8 + (index * 0.1) }}
                >
                  {step.number}
                </motion.div>
                <div className="text-lg font-medium max-w-32 text-center md:text-center">
                  {step.text}
                </div>
              </div>
            ))}
          </motion.div>

          {/* Warning Box */}
          <motion.div 
            className="bg-red-900/20 border border-red-500/30 rounded-2xl p-8 mb-12 max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
          >
            <div className="text-red-400 font-bold text-xl mb-4">🤝 Just between us</div>
            <div className="text-lg opacity-90 leading-relaxed">
              These questions might hit close to home. That's the point. 
              The more real you get with yourself, the faster we can help you change things.
            </div>
          </motion.div>

          {/* Start Button */}
          <motion.button
            onClick={handleStartAssessment}
            className="px-12 py-6 text-xl font-bold bg-gradient-to-r from-red-600 to-red-700 rounded-full 
                     hover:from-red-500 hover:to-red-600 transition-all duration-300 
                     shadow-2xl hover:shadow-red-500/25 hover:-translate-y-1 
                     relative overflow-hidden group mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1.0 }}
          >
            <span className="relative z-10">Let's do this</span>
            <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 
                          translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-500"></div>
          </motion.button>

          {/* Bottom Text */}
          <motion.div 
            className="text-lg opacity-60"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.6 }}
            transition={{ duration: 0.6, delay: 1.2 }}
          >
            Take your time - no pressure at all
          </motion.div>
        </div>
      </div>
    </div>
  )
}