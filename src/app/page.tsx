'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'

export default function LandingPage() {
  const router = useRouter()
  const [userCount, setUserCount] = useState(2847)
  const [liveUsers, setLiveUsers] = useState(23)

  useEffect(() => {
    // Animate user count
    const interval = setInterval(() => {
      setUserCount(prev => prev + Math.floor(Math.random() * 3))
    }, 5000)

    // Animate live users
    const liveInterval = setInterval(() => {
      setLiveUsers(15 + Math.floor(Math.random() * 25))
    }, 3000 + Math.random() * 2000)

    return () => {
      clearInterval(interval)
      clearInterval(liveInterval)
    }
  }, [])

  const handleStartTransformation = () => {
    router.push('/prepare')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white overflow-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 bg-gradient-to-br from-gray-900 via-black to-gray-900 animate-gradient-shift"></div>
      
      {/* Floating Particles */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {[...Array(30)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-red-500 rounded-full opacity-30"
            initial={{
              x: Math.random() * window.innerWidth,
              y: window.innerHeight + 100,
            }}
            animate={{
              y: -100,
              x: Math.random() * window.innerWidth,
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

      {/* Header */}
      <header className="fixed top-0 w-full z-50 transition-all duration-300">
        <nav className="max-w-7xl mx-auto px-6 py-6">
          <motion.div 
            className="text-3xl font-black bg-gradient-to-r from-red-500 to-red-600 bg-clip-text text-transparent"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            AlphaRise
          </motion.div>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="min-h-screen flex items-center justify-center px-6">
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <motion.h1 
            className="text-5xl md:text-7xl font-black mb-8 leading-tight"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            Stop Being The Guy She Settles For
          </motion.h1>
          
          <motion.p 
            className="text-xl md:text-2xl mb-12 opacity-90 leading-relaxed max-w-3xl mx-auto"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            Transform from anxious and uncertain to the confident, magnetic man 
            who commands respect and attracts success in every area of life.
          </motion.p>

          <motion.button
            onClick={handleStartTransformation}
            className="px-12 py-6 text-xl font-bold bg-gradient-to-r from-red-600 to-red-700 rounded-full 
                     transition-all duration-300 ease-out
                     shadow-2xl relative overflow-hidden group"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            whileHover={{ 
              scale: 1.05, 
              y: -2,
              boxShadow: "0 20px 50px rgba(255, 68, 68, 0.4)",
              background: "linear-gradient(135deg, #ff5555, #dd0000)"
            }}
            whileTap={{ scale: 0.98 }}
          >
            <span className="relative z-10">START YOUR TRANSFORMATION</span>
            <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 
                          translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-500"></div>
          </motion.button>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 px-6 relative z-10">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { number: userCount.toLocaleString(), text: "Men Transformed" },
              { number: "94%", text: "Confidence Increase" },
              { number: "21", text: "Days Average Results" }
            ].map((stat, index) => (
              <motion.div 
                key={index}
                className="text-center p-8 bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl"
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <div className="text-4xl md:text-5xl font-black mb-4 bg-gradient-to-r from-red-500 to-red-600 bg-clip-text text-transparent">
                  {stat.number}
                </div>
                <div className="text-lg opacity-80">{stat.text}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Problem Section */}
      <section className="py-20 px-6 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          <motion.h2 
            className="text-4xl md:text-5xl font-black mb-12 text-red-500"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            You're Tired Of Being Invisible
          </motion.h2>
          
          {[
            "Every night you lie awake replaying conversations, wondering \"what if I had been more confident?\"",
            "You see other guys effortlessly command attention while you fade into the background.",
            "The worst part? You KNOW you have so much more to offer... if only you could unlock it."
          ].map((text, index) => (
            <motion.p 
              key={index}
              className="text-xl mb-8 opacity-90 leading-relaxed"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
            >
              {text}
            </motion.p>
          ))}
        </div>
      </section>

      {/* Social Proof */}
      <section className="py-16 px-6 bg-black/20 relative z-10">
        <div className="max-w-3xl mx-auto text-center">
          <motion.div 
            className="mb-6"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <span className="text-red-500 font-bold text-xl">{liveUsers}</span>
            <span className="ml-2 opacity-70">men are taking the assessment right now</span>
          </motion.div>
          
          <motion.div 
            className="space-y-2 text-sm opacity-70"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
          >
            <p>⚡ Marcus from Austin increased his confidence by 78% in 18 days</p>
            <p>⚡ Jake from NYC went from 0 dates to 3 this month</p>
            <p>⚡ Alex from Miami finally asked for that promotion... and got it</p>
          </motion.div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 px-6 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          <motion.h2 
            className="text-4xl md:text-5xl font-black mb-12"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            Ready To Finally Become The Man You Were Meant To Be?
          </motion.h2>
          
          <motion.button
            onClick={handleStartTransformation}
            className="px-12 py-6 text-xl font-bold bg-gradient-to-r from-red-600 to-red-700 rounded-full 
                     transition-all duration-300 ease-out
                     shadow-2xl relative overflow-hidden group"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
            whileHover={{ 
              scale: 1.05, 
              y: -2,
              boxShadow: "0 20px 50px rgba(255, 68, 68, 0.4)"
            }}
            whileTap={{ scale: 0.98 }}
          >
            <span className="relative z-10">TAKE THE CONFIDENCE ASSESSMENT</span>
            <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 
                          translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-500"></div>
          </motion.button>
          
          <motion.div 
            className="text-sm opacity-60 space-y-1"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            viewport={{ once: true }}
          >
            <p>✓ Free 2-minute assessment</p>
            <p>✓ Personalized confidence profile</p>
            <p>✓ Instant results & action plan</p>
          </motion.div>
        </div>
      </section>
    </div>
  )
}