'use client'

import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'

export default function LandingPage() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white">
      {/* Header */}
      <header className="p-6 flex justify-between items-center">
        <div className="text-3xl font-black bg-gradient-to-r from-red-500 to-red-600 bg-clip-text text-transparent">
          AlphaRise
        </div>
        
        {/* Login Button */}
        <button
          onClick={() => router.push('/login')}
          className="px-6 py-2 bg-white/10 hover:bg-white/20 rounded-lg font-semibold transition-all border border-white/20 hover:border-white/40"
        >
          Sign In
        </button>
      </header>

      {/* Hero Section */}
      <div className="container mx-auto px-6 py-16">
        <div className="max-w-4xl mx-auto text-center">
          
          {/* Main Headline */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-5xl md:text-7xl font-black mb-6">
              From
              <span className="bg-gradient-to-r from-red-500 to-red-600 bg-clip-text text-transparent"> Anxious </span>
              to
              <span className="bg-gradient-to-r from-red-500 to-red-600 bg-clip-text text-transparent"> Alpha</span>
            </h1>
            
            <p className="text-xl md:text-2xl text-gray-300 mb-8 leading-relaxed">
              Join thousands of men who transformed their confidence, dating life, and relationships through our proven system
            </p>
          </motion.div>

          {/* CTA Buttons */}
          <motion.div 
            className="flex flex-col sm:flex-row gap-4 justify-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <button
              onClick={() => router.push('/assessment')}
              className="px-8 py-4 bg-gradient-to-r from-red-600 to-red-700 rounded-lg font-bold text-xl hover:from-red-700 hover:to-red-800 transition-all transform hover:scale-105"
            >
              Take Free Assessment
            </button>
            
            <button
              onClick={() => router.push('/login')}
              className="px-8 py-4 bg-white/10 hover:bg-white/20 rounded-lg font-semibold text-lg border border-white/20 hover:border-white/40 transition-all"
            >
              Continue Your Journey
            </button>
          </motion.div>

          {/* Social Proof */}
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            <div className="text-center">
              <div className="text-3xl font-bold text-red-400">2,500+</div>
              <div className="text-gray-400">Men Transformed</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-red-400">94%</div>
              <div className="text-gray-400">Success Rate</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-red-400">30 Days</div>
              <div className="text-gray-400">Average Results</div>
            </div>
          </motion.div>

          {/* Features */}
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
              <div key={index} className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 text-center">
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                <p className="text-sm text-gray-400">{feature.desc}</p>
              </div>
            ))}
          </motion.div>

          {/* Bottom CTA */}
          <motion.div 
            className="mt-16 p-8 bg-gradient-to-r from-red-900/20 to-red-800/20 rounded-2xl border border-red-500/30"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
          >
            <h2 className="text-2xl font-bold mb-4">Ready to Transform Your Life?</h2>
            <p className="text-gray-300 mb-6">
              Join the brotherhood of men who chose growth over comfort
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => router.push('/assessment')}
                className="px-8 py-3 bg-gradient-to-r from-red-600 to-red-700 rounded-lg font-bold hover:from-red-700 hover:to-red-800 transition-all"
              >
                Start Your Journey Today
              </button>
              <button
                onClick={() => router.push('/login')}
                className="px-8 py-3 border border-red-500/50 hover:border-red-500 rounded-lg font-semibold transition-all hover:bg-red-500/10"
              >
                Already a Member? Sign In
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}