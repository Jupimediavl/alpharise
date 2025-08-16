'use client'

import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { useState, useEffect } from 'react'

export default function LandingPage() {
  const router = useRouter()
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    // Delay scurt pentru a permite încărcarea completă
    const timer = setTimeout(() => {
      setIsLoaded(true)
    }, 100)
    
    return () => clearTimeout(timer)
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white relative overflow-hidden">
      {/* Animated Background Effects - doar după încărcare */}
      {isLoaded && (
        <div className="absolute inset-0 overflow-hidden">
        <motion.div 
          className="absolute top-20 left-20 w-80 h-80 bg-purple-600/15 rounded-full blur-3xl"
          animate={{ 
            x: [0, 50, 0],
            y: [0, -30, 0]
          }}
          transition={{ 
            duration: 15,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div 
          className="absolute bottom-20 right-20 w-64 h-64 bg-magenta-600/15 rounded-full blur-3xl"
          animate={{ 
            x: [0, -40, 0],
            y: [0, 40, 0]
          }}
          transition={{ 
            duration: 12,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      </div>
      )}

      {/* Header */}
      <header className="relative z-10 p-6 flex justify-between items-center">
        <div className="text-3xl font-black text-white">
          AlphaRise
        </div>
        
        {/* Login Button */}
        <motion.button
          onClick={() => router.push('/login')}
          className="px-6 py-2 bg-white/10 hover:bg-purple-500/20 rounded-lg font-semibold transition-all border border-purple-500/30 hover:border-purple-400/60"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          Sign In
        </motion.button>
      </header>

      {/* Hero Section */}
      <div className="relative z-10 container mx-auto px-6 py-16">
        <div className="max-w-4xl mx-auto text-center">
          
          {/* Main Headline */}
          {isLoaded && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.1 }}
            >
            <h1 className="text-5xl md:text-7xl font-black mb-6">
              From
              <span className="bg-gradient-to-r from-purple-500 via-magenta-500 to-pink-500 bg-clip-text text-transparent"> Anxious </span>
              to
              <span className="bg-gradient-to-r from-purple-500 via-magenta-500 to-pink-500 bg-clip-text text-transparent"> Alpha</span>
            </h1>
            
            <p className="text-xl md:text-2xl text-gray-300 mb-8 leading-relaxed">
              Join thousands of men who transformed their confidence, dating life, and relationships through our proven system
            </p>
          </motion.div>
          )}

          {/* CTA Buttons */}
          {isLoaded && (
            <motion.div 
            className="flex flex-col sm:flex-row gap-4 justify-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <motion.button
              onClick={() => router.push('/assessment')}
              className="px-8 py-4 bg-gradient-to-r from-purple-600 via-magenta-600 to-pink-600 rounded-lg font-bold text-xl hover:from-purple-700 hover:via-magenta-700 hover:to-pink-700 transition-all transform hover:scale-105"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
            >
              Take Free Assessment
            </motion.button>
            
            <motion.button
              onClick={() => router.push('/login')}
              className="px-8 py-4 bg-white/10 hover:bg-purple-500/20 rounded-lg font-semibold text-lg border border-purple-500/30 hover:border-purple-400/60 transition-all"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Continue Your Journey
            </motion.button>
          </motion.div>
          )}

          {/* Social Proof */}
          {isLoaded && (
            <motion.div 
            className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            <motion.div 
              className="text-center"
              whileHover={{ scale: 1.05 }}
            >
              <div className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-magenta-400 bg-clip-text text-transparent">2,500+</div>
              <div className="text-gray-400">Men Transformed</div>
            </motion.div>
            <motion.div 
              className="text-center"
              whileHover={{ scale: 1.05 }}
            >
              <div className="text-3xl font-bold bg-gradient-to-r from-magenta-400 to-pink-400 bg-clip-text text-transparent">94%</div>
              <div className="text-gray-400">Success Rate</div>
            </motion.div>
            <motion.div 
              className="text-center"
              whileHover={{ scale: 1.05 }}
            >
              <div className="text-3xl font-bold bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent">30 Days</div>
              <div className="text-gray-400">Average Results</div>
            </motion.div>
          </motion.div>
          )}

          {/* Features */}
          {isLoaded && (
            <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            {[
              { icon: '🧠', title: 'Personalized Coaching', desc: 'AI-powered advice tailored to your personality' },
              { icon: '💬', title: 'Expert Community', desc: 'Learn from coaches and successful men' },
              { icon: '🎯', title: 'Practical Challenges', desc: 'Daily tasks to build real confidence' },
              { icon: '🏆', title: 'Proven Results', desc: 'Step-by-step system that actually works' }
            ].map((feature, index) => (
              <motion.div 
                key={index} 
                className="bg-black/30 backdrop-blur-sm border border-purple-500/20 rounded-xl p-6 text-center"
                whileHover={{ scale: 1.05 }}
              >
                <motion.div 
                  className="text-4xl mb-4"
                  animate={{ 
                    rotate: [0, 5, -5, 0]
                  }}
                  transition={{ 
                    duration: 4 + index,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                >
                  {feature.icon}
                </motion.div>
                <h3 className="text-lg font-semibold mb-2 bg-gradient-to-r from-purple-400 to-magenta-400 bg-clip-text text-transparent">
                  {feature.title}
                </h3>
                <p className="text-sm text-gray-400">{feature.desc}</p>
              </motion.div>
            ))}
          </motion.div>
          )}

          {/* Bottom CTA */}
          {isLoaded && (
            <motion.div 
            className="mt-16 p-8 bg-black/40 backdrop-blur-lg border border-purple-500/20 rounded-2xl relative overflow-hidden"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            style={{
              boxShadow: '0 0 40px rgba(147, 51, 234, 0.1), 0 0 80px rgba(219, 39, 119, 0.05)'
            }}
          >
            {/* Inner Glow Effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-purple-600/5 via-transparent to-magenta-600/5 rounded-2xl" />
            
            <div className="relative z-10">
              <motion.h2 
                className="text-2xl font-bold mb-4 bg-gradient-to-r from-purple-400 via-magenta-400 to-pink-400 bg-clip-text text-transparent"
                animate={{ 
                  backgroundPosition: ['0% 50%', '100% 50%', '0% 50%']
                }}
                transition={{ 
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              >
                Ready to Transform Your Life?
              </motion.h2>
              <p className="text-gray-300 mb-6">
                Join the brotherhood of men who chose growth over comfort
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <motion.button
                  onClick={() => router.push('/assessment')}
                  className="px-8 py-3 bg-gradient-to-r from-purple-600 via-magenta-600 to-pink-600 rounded-lg font-bold hover:from-purple-700 hover:via-magenta-700 hover:to-pink-700 transition-all relative overflow-hidden"
                  whileHover={{ 
                    scale: 1.05,
                    boxShadow: "0 20px 40px rgba(147, 51, 234, 0.4)"
                  }}
                  whileTap={{ scale: 0.98 }}
                  style={{
                    boxShadow: '0 10px 30px rgba(147, 51, 234, 0.3)'
                  }}
                >
                  {/* Button Shimmer Effect */}
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                    animate={{ x: [-100, 400] }}
                    transition={{ 
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  />
                  <span className="relative z-10">Start Your Journey Today</span>
                </motion.button>
                <motion.button
                  onClick={() => router.push('/login')}
                  className="px-8 py-3 border border-purple-500/50 hover:border-purple-400 rounded-lg font-semibold transition-all hover:bg-purple-500/10"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Already a Member? Sign In
                </motion.button>
              </div>
            </div>
          </motion.div>
          )}
        </div>
      </div>
    </div>
  )
}