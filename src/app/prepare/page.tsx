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

  const handleStartConfidenceTest = () => {
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
              x: Math.random() * 1920,
              y: 1000,
            }}
            animate={{
              y: -100,
              x: Math.random() * 1920,
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
            className="flex flex-col gap-16 mb-16"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
          >
            {steps.map((step, index) => (
              <motion.div 
                key={index} 
                className="flex flex-col md:flex-row items-center gap-8 max-w-md mx-auto"
                initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.8 + (index * 0.3) }}
              >
                {/* Premium Web 3.0 Icon */}
                <motion.div 
                  className="relative flex-shrink-0"
                  whileHover={{ scale: 1.1 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  {/* Outer animated ring */}
                  <div className="w-24 h-24 rounded-full absolute inset-0 bg-gradient-to-r from-red-500 via-pink-500 to-purple-500 animate-spin opacity-75" 
                       style={{ animationDuration: '8s' }}></div>
                  
                  {/* Main icon container */}
                  <div className="w-20 h-20 m-2 rounded-full relative bg-gradient-to-br from-red-400 to-red-600 
                                flex items-center justify-center shadow-2xl border-2 border-white/30
                                backdrop-blur-xl overflow-hidden">
                    
                    {/* Glass reflection effect */}
                    <div className="absolute inset-0 bg-gradient-to-br from-white/40 via-transparent to-black/20"></div>
                    
                    {/* Moving light effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent 
                                  transform -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                    
                    {/* Number */}
                    <span className="relative z-10 text-2xl font-black text-white drop-shadow-lg">
                      {step.number}
                    </span>
                  </div>
                </motion.div>
                
                {/* Text content */}
                <motion.div 
                  className="flex-1 text-center md:text-left"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 1.2 + (index * 0.1) }}
                >
                  <h3 className="text-2xl font-bold text-white leading-tight">
                    {step.text}
                  </h3>
                </motion.div>
              </motion.div>
            ))}
          </motion.div>

          {/* Warning Box */}
          <motion.div 
            className="bg-gradient-to-br from-purple-900/40 via-blue-900/30 to-indigo-900/40 
                       border border-purple-400/30 rounded-2xl p-8 mb-12 max-w-2xl mx-auto
                       backdrop-blur-sm shadow-2xl relative overflow-hidden text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 via-blue-500/10 to-indigo-500/10 
                          animate-pulse"></div>
            <div className="relative z-10">
              <div className="text-purple-300 font-bold text-xl mb-4">
                Honest conversation ahead
              </div>
              <div className="text-lg opacity-90 leading-relaxed">
                These questions might hit close to home. That's the point. 
                The more real you get with yourself, the faster we can help you change things.
              </div>
            </div>
          </motion.div>

          {/* Start Button */}
          <motion.button
            onClick={handleStartConfidenceTest}
            className="px-12 py-6 text-xl font-bold bg-gradient-to-r from-red-600 to-red-700 rounded-full 
                     transition-all duration-300 ease-out
                     shadow-2xl relative overflow-hidden group mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1.0 }}
            whileHover={{ 
              scale: 1.05, 
              y: -2,
              boxShadow: "0 20px 50px rgba(255, 68, 68, 0.4)"
            }}
            whileTap={{ scale: 0.98 }}
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