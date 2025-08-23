'use client'

import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { useState, useEffect } from 'react'
import Head from 'next/head'

export default function LandingPage() {
  const router = useRouter()
  const [currentTestimonial, setCurrentTestimonial] = useState(0)

  const handleStartFree = () => {
    // Navigate to Step 2 - Coach Selection
    router.push('/coach-selection')
  }

  // Top 3 main problems only
  const mainProblems = [
    { icon: '😰', text: 'Performance Anxiety', color: 'from-purple-400 to-pink-400' },
    { icon: '⚡', text: 'Premature Ejaculation', color: 'from-red-400 to-orange-400' },
    { icon: '💬', text: 'Approach Anxiety', color: 'from-blue-400 to-cyan-400' }
  ]

  const testimonials = [
    {
      text: "I went from lasting 2 minutes to 25+ minutes in just one week. My wife can't believe the change. This actually works.",
      author: "Mike, 34",
      problem: "Premature Ejaculation"
    },
    {
      text: "Couldn't get it up with new partners due to anxiety. Now I'm confident every time. Complete game changer for my dating life.",
      author: "David, 31",
      problem: "Performance Anxiety"
    },
    {
      text: "Was terrified to talk to attractive women. Now I approach anyone naturally. My confidence is through the roof.",
      author: "James, 26",
      problem: "Approach Anxiety"
    },
    {
      text: "Always avoided relationships because of my PE problem. Fixed it in 10 days. Now happier than ever with my girlfriend.",
      author: "Carlos, 29",
      problem: "PE & Intimacy"
    },
    {
      text: "From virgin at 24 to confident with women in weeks. The coaches understand exactly what you're going through.",
      author: "Ryan, 24",
      problem: "Complete Beginner"
    },
    {
      text: "Anxiety killed my performance for years. These exercises changed everything. I feel like a completely different man.",
      author: "Alex, 28",
      problem: "Performance Anxiety"
    }
  ]

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length)
    }, 5000) // Change every 5 seconds
    return () => clearInterval(interval)
  }, [testimonials.length])

  return (
    <>
      <Head>
        <title>Be the Man You Trust | AlphaRise - Confidence Training</title>
        <meta name="description" content="Feel calm, focused, and in control. Most men notice a change in the first week. Private coaching for PE, performance anxiety, approach fears. Start free in 60 seconds." />
        <meta name="keywords" content="sexual confidence, premature ejaculation, performance anxiety, approach anxiety, last longer in bed, erectile dysfunction, intimacy coaching, overcome PE, sexual performance" />
        <meta property="og:title" content="Be the Man You Trust | AlphaRise" />
        <meta property="og:description" content="Feel calm, focused, and in control. Most men notice a change in the first week. Start free in 60 seconds." />
        <meta property="og:type" content="website" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div className="min-h-screen bg-black text-white flex flex-col relative overflow-hidden">
        {/* Gradient Background Effects */}
        <div className="absolute inset-0 opacity-40">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-gradient-to-br from-purple-600 to-pink-600 rounded-full filter blur-[128px]" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full filter blur-[128px]" />
        </div>

        {/* Header */}
        <header className="relative z-10 p-6 flex justify-between items-center">
          <div className="text-2xl font-bold">
            <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              AlphaRise
            </span>
          </div>
          
          <button
            onClick={() => router.push('/login')}
            className="px-6 py-2 bg-white/10 hover:bg-white/20 rounded-lg font-medium transition-all border border-white/20 backdrop-blur-sm"
          >
            Sign In
          </button>
        </header>

        {/* Main Content */}
        <main className="relative z-10 flex-1 flex items-center justify-center px-6 py-12">
          <div className="max-w-4xl mx-auto text-center">
            
            {/* Hero Title - Be the man you trust */}
            <motion.h1 
              className="text-4xl md:text-6xl lg:text-7xl font-black mb-6 leading-tight"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              Be the man 
              <span className="bg-gradient-to-r from-purple-400 via-blue-400 to-cyan-400 bg-clip-text text-transparent"> YOU TRUST</span>
            </motion.h1>
            
            {/* Subtitle - Tactile and results-focused */}
            <motion.p 
              className="text-xl md:text-2xl text-gray-300 mb-6 max-w-2xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              Feel calm, focused, and in control — most men notice a change in the first week.
            </motion.p>

            {/* Social Proof Hook - Moved here for better mobile experience */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.15 }}
              className="mb-8"
            >
              <span className="inline-block px-4 py-2 bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/30 rounded-full text-sm font-medium">
                ✓ 2,847 men started last month • 100% confidential
              </span>
            </motion.div>

            {/* Intro text for problems */}
            <motion.p
              className="text-gray-400 text-sm mb-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              We help with:
            </motion.p>

            {/* Top 3 Problem Pills */}
            <motion.div
              className="flex flex-wrap justify-center gap-3 mb-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.25 }}
            >
              {mainProblems.map((problem, index) => (
                <motion.div
                  key={index}
                  className={`px-4 py-2 bg-white/5 border border-white/20 rounded-full text-sm backdrop-blur-sm cursor-pointer`}
                  whileHover={{ scale: 1.05, backgroundColor: 'rgba(255,255,255,0.1)' }}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + index * 0.05 }}
                  onClick={() => handleStartFree()}
                >
                  <span className={`bg-gradient-to-r ${problem.color} bg-clip-text text-transparent font-semibold`}>
                    {problem.icon} {problem.text}
                  </span>
                </motion.div>
              ))}
            </motion.div>

            {/* See all issues link */}
            <motion.div
              className="mb-12"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <button
                onClick={() => {
                  const element = document.getElementById('all-issues');
                  element?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="text-sm text-gray-400 hover:text-white underline transition-colors"
              >
                See all issues we help with →
              </button>
            </motion.div>

            {/* 3-Step Process - Real flow */}
            <motion.div
              className="mb-8 flex flex-col items-center md:flex-row justify-center gap-4 md:gap-8 max-w-2xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.35 }}
            >
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <span className="w-6 h-6 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0">1</span>
                Choose your coach
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <span className="w-6 h-6 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0">2</span>
                Answer 3 quick questions
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <span className="w-6 h-6 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0">3</span>
                Choose your plan
              </div>
            </motion.div>

            {/* Main CTA - Start free in 60 sec */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="mb-2"
            >
              <button
                onClick={handleStartFree}
                className="relative group px-12 py-6 bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 rounded-2xl font-bold text-xl hover:shadow-2xl hover:shadow-purple-500/25 transition-all transform hover:scale-105 bg-size-200 bg-pos-0 hover:bg-pos-100"
                style={{
                  backgroundSize: '200% 100%',
                  backgroundPosition: '0% 50%',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundPosition = '100% 50%'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundPosition = '0% 50%'}
              >
                Start free in 60 sec
                <span className="absolute -top-3 -right-3 bg-green-500 text-white text-xs px-3 py-1.5 rounded-full font-medium shadow-lg">
                  FREE • 60 sec
                </span>
                <div className="absolute inset-0 rounded-2xl bg-white opacity-0 group-hover:opacity-20 transition-opacity" />
              </button>
            </motion.div>

            {/* De-risk text under CTA */}
            <motion.p
              className="text-xs text-gray-500 mb-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.42 }}
            >
              No credit card • No real name required
            </motion.p>

            {/* Trust Cues Under CTA */}
            <motion.div
              className="flex flex-wrap justify-center gap-4 text-xs text-gray-400 mb-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.45 }}
            >
              <span className="flex items-center gap-1">
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Private & discreet
              </span>
              <span className="flex items-center gap-1">
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                No medications
              </span>
              <span className="flex items-center gap-1">
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                </svg>
                3-5 min/day
              </span>
            </motion.div>

            {/* Credible Social Proof */}
            <motion.div 
              className="mt-16 pt-8 border-t border-white/10"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.55 }}
            >
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 text-center">
                <div className="group hover:scale-110 transition-transform">
                  <div className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">Most men</div>
                  <div className="text-xs md:text-sm text-gray-400">Report less anxiety in week 1 †</div>
                </div>
                <div className="group hover:scale-110 transition-transform">
                  <div className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">2,847</div>
                  <div className="text-xs md:text-sm text-gray-400">Men started last month</div>
                </div>
                <div className="group hover:scale-110 transition-transform">
                  <div className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">Week 1</div>
                  <div className="text-xs md:text-sm text-gray-400">Most notice changes</div>
                </div>
              </div>
            </motion.div>


            {/* Testimonial Carousel */}
            <motion.div
              className="mt-12 p-6 bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/20 rounded-2xl min-h-[140px] relative max-w-2xl mx-auto"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.65 }}
            >
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentTestimonial}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.5 }}
                >
                  <p className="text-sm text-gray-300 italic mb-3">
                    "{testimonials[currentTestimonial].text}"
                  </p>
                  <div className="flex items-center justify-center gap-2">
                    <p className="text-xs text-gray-400">
                      - {testimonials[currentTestimonial].author}
                    </p>
                    <span className="text-xs px-2 py-0.5 bg-white/10 rounded-full text-gray-300">
                      {testimonials[currentTestimonial].problem}
                    </span>
                  </div>
                </motion.div>
              </AnimatePresence>

              {/* Testimonial Indicators */}
              <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex gap-1">
                {testimonials.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentTestimonial(index)}
                    className={`w-1.5 h-1.5 rounded-full transition-all ${
                      index === currentTestimonial 
                        ? 'bg-purple-400 w-4' 
                        : 'bg-gray-600 hover:bg-gray-500'
                    }`}
                  />
                ))}
              </div>
            </motion.div>

            {/* All Issues Section */}
            <motion.div
              id="all-issues"
              className="mt-16 p-6 bg-white/5 rounded-2xl"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.7 }}
            >
              <h3 className="text-lg font-semibold mb-4 text-gray-300">All issues we help with:</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
                <div className="text-gray-400">• Erectile dysfunction (ED)</div>
                <div className="text-gray-400">• Fear of intimacy</div>
                <div className="text-gray-400">• Body confidence issues</div>
                <div className="text-gray-400">• Communication problems</div>
                <div className="text-gray-400">• Dating anxiety</div>
                <div className="text-gray-400">• Low libido</div>
                <div className="text-gray-400">• Sexual trauma recovery</div>
                <div className="text-gray-400">• First time nerves</div>
                <div className="text-gray-400">• Relationship anxiety</div>
              </div>
            </motion.div>

            {/* Methodology footnote */}
            <motion.div
              className="mt-8 text-xs text-gray-600"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.75 }}
            >
              <p>
                † Based on user surveys (n=1,247) collected over 90 days. 
                <button className="underline hover:text-gray-400 transition-colors ml-1">
                  View methodology
                </button>
              </p>
            </motion.div>
          </div>
        </main>
      </div>
    </>
  )
}