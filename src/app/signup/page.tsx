'use client'

import { useSearchParams } from 'next/navigation'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { useState, useEffect, Suspense } from 'react'
import { supabaseHelpers, SupabaseUserManager, supabase } from '@/lib/supabase'
import { ArrowRight, Sparkles, Crown } from 'lucide-react'

function SignupContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [avatarType, setAvatarType] = useState('marcus')
  const [email, setEmail] = useState('')
  const [userName, setUserName] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [liveCount, setLiveCount] = useState(47)
  const [errors, setErrors] = useState<{
    userName?: string | null
    email?: string | null
    general?: string | null
  }>({})
  const [validationLoading, setValidationLoading] = useState<{
    userName?: boolean
    email?: boolean
  }>({})

  const avatarData = {
    marcus: {
      name: 'Marcus',
      icon: '🧠',
      personalMessage: "Marcus, your analytical mind is your superpower - but it's also what's holding you back. I've helped thousands of overthinkers like you transform their mental loops into magnetic confidence.",
      urgentBenefit: "Stop overthinking every interaction and start enjoying natural, effortless conversations",
      specificPain: "No more replaying conversations for hours wondering what you should have said differently"
    },
    jake: {
      name: 'Jake',
      icon: '⚡',
      personalMessage: "Jake, your drive for excellence is admirable - but performance pressure is killing your confidence. I'll show you how to channel that competitive energy into bedroom mastery.",
      urgentBenefit: "Transform performance anxiety into unshakeable confidence and lasting power",
      specificPain: "No more avoiding intimacy because you're worried about disappointing her"
    },
    alex: {
      name: 'Alex',
      icon: '📚',
      personalMessage: "Alex, your willingness to learn puts you ahead of 90% of guys. Most men are too proud to admit they need help - but that's exactly why you'll succeed.",
      urgentBenefit: "Get the comprehensive education you never received, step by step",
      specificPain: "No more feeling clueless and hoping you're doing things right"
    },
    ryan: {
      name: 'Ryan',
      icon: '💎',
      personalMessage: "Ryan, I see your potential - those moments when your natural charm shines through. The problem isn't that you lack confidence, it's that you can't access it consistently.",
      urgentBenefit: "Unlock that magnetic confidence on demand, whenever you need it",
      specificPain: "No more good days and bad days - just consistent, reliable confidence"
    },
    ethan: {
      name: 'Ethan',
      icon: '❤️',
      personalMessage: "Ethan, your emotional intelligence is rare and valuable. Most guys think it's all about physical techniques - but you understand that real intimacy starts with genuine connection.",
      urgentBenefit: "Combine your natural empathy with confident physical expression",
      specificPain: "No more choosing between meaningful connection and passionate attraction"
    }
  }

  const currentAvatar = avatarData[avatarType as keyof typeof avatarData] || avatarData.marcus

  useEffect(() => {
    const avatar = searchParams.get('avatar') || 'marcus'
    setAvatarType(avatar)

    // Update live counter every few seconds
    const interval = setInterval(() => {
      setLiveCount(prev => {
        const change = Math.random() > 0.5 ? 1 : -1
        const newCount = prev + change
        return Math.max(30, Math.min(75, newCount))
      })
    }, 3000 + Math.random() * 2000)

    return () => clearInterval(interval)
  }, [searchParams])

  // Validate username availability (debounced)
  useEffect(() => {
    if (!userName || userName.length < 3) {
      setErrors(prev => ({ ...prev, userName: null }))
      return
    }

    const timeoutId = setTimeout(async () => {
      setValidationLoading(prev => ({ ...prev, userName: true }))
      
      try {
        const { data, error } = await supabase
          .from('users')
          .select('username')
          .eq('username', userName.trim())
          .maybeSingle()
        
        if (data) {
          setErrors(prev => ({ ...prev, userName: 'Username already taken. Try another one!' }))
        } else {
          setErrors(prev => ({ ...prev, userName: null }))
        }
      } catch (error) {
        console.error('Error checking username availability:', error)
        setErrors(prev => ({ ...prev, userName: null }))
      } finally {
        setValidationLoading(prev => ({ ...prev, userName: false }))
      }
    }, 800)

    return () => clearTimeout(timeoutId)
  }, [userName])

  // Validate email format and availability (debounced)
  useEffect(() => {
    if (!email || !isValidEmail(email)) {
      setErrors(prev => ({ ...prev, email: null }))
      return
    }

    const timeoutId = setTimeout(async () => {
      setValidationLoading(prev => ({ ...prev, email: true }))
      
      try {
        const { data, error } = await supabase
          .from('users')
          .select('email')
          .eq('email', email.trim())
          .maybeSingle()
        
        if (data) {
          setErrors(prev => ({ ...prev, email: 'Email already registered. Try signing in instead!' }))
        } else {
          setErrors(prev => ({ ...prev, email: null }))
        }
      } catch (error) {
        console.error('Error checking email availability:', error)
        setErrors(prev => ({ ...prev, email: null }))
      } finally {
        setValidationLoading(prev => ({ ...prev, email: false }))
      }
    }, 800)

    return () => clearTimeout(timeoutId)
  }, [email])

  const isValidEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Basic validation
    if (!email || !userName) {
      setErrors({
        email: !email ? 'Email is required' : null,
        userName: !userName ? 'Username is required' : null
      })
      return
    }

    if (!isValidEmail(email)) {
      setErrors(prev => ({ ...prev, email: 'Please enter a valid email address' }))
      return
    }

    if (userName.length < 3) {
      setErrors(prev => ({ ...prev, userName: 'Username must be at least 3 characters long' }))
      return
    }

    // Check for existing errors
    if (errors.email || errors.userName) {
      return
    }

    setIsLoading(true)

    try {
      const newUser = await supabaseHelpers.initializeUser(
        userName.trim(),
        email.trim(), 
        avatarType
      )

      if (newUser) {
        console.log('✅ User created successfully:', newUser)
        
        if (typeof window !== 'undefined') {
          sessionStorage.setItem('alpharise_user', JSON.stringify({
            username: newUser.username,
            email: newUser.email,
            avatar_type: newUser.avatar_type,
            coins: newUser.coins,
            created_at: newUser.created_at
          }))
        }
        
        router.push(`/dashboard?welcome=true&username=${encodeURIComponent(newUser.username)}`)
      } else {
        throw new Error('Failed to create user account')
      }
    } catch (error: any) {
      console.error('❌ Signup error:', error)
      
      if (error.message?.includes('duplicate key')) {
        if (error.message.includes('username')) {
          setErrors(prev => ({ ...prev, userName: 'Username already taken' }))
        } else if (error.message.includes('email')) {
          setErrors(prev => ({ ...prev, email: 'Email already registered' }))
        }
      } else {
        setErrors(prev => ({ 
          ...prev, 
          general: 'Something went wrong. Please try again.' 
        }))
      }
    } finally {
      setIsLoading(false)
    }
  }

  const isFormValid = () => {
    return userName && 
           email && 
           userName.length >= 3 && 
           isValidEmail(email) && 
           !errors.userName && 
           !errors.email &&
           !validationLoading.userName &&
           !validationLoading.email
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white relative overflow-hidden">
      {/* Animated Background Effects */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div 
          className="absolute top-20 left-20 w-96 h-96 bg-gradient-to-r from-purple-600/20 to-magenta-600/20 rounded-full blur-3xl"
          animate={{ 
            x: [0, 100, 0],
            y: [0, -50, 0],
            scale: [1, 1.1, 1]
          }}
          transition={{ 
            duration: 20,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div 
          className="absolute bottom-20 right-20 w-80 h-80 bg-gradient-to-r from-pink-600/20 to-purple-600/20 rounded-full blur-3xl"
          animate={{ 
            x: [0, -80, 0],
            y: [0, 60, 0],
            scale: [1, 0.8, 1]
          }}
          transition={{ 
            duration: 15,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div 
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-r from-cyan-600/10 to-blue-600/10 rounded-full blur-2xl"
          animate={{ 
            rotate: [0, 360],
            scale: [1, 1.2, 1]
          }}
          transition={{ 
            duration: 25,
            repeat: Infinity,
            ease: "linear"
          }}
        />
      </div>

      {/* Header */}
      <header className="relative z-10 p-6 flex items-center justify-between">
        <div className="text-3xl font-black bg-gradient-to-r from-red-500 to-red-600 bg-clip-text text-transparent">
          AlphaRise
        </div>
        
        {/* Login Link */}
        <motion.button
          onClick={() => router.push('/login')}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-all duration-300 group"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Crown className="w-4 h-4 text-purple-400" />
          <span className="text-sm font-medium">Already an <span className="font-bold" style={{background: 'linear-gradient(to right, rgb(196 181 253), rgb(244 114 182))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'}}>AlphaLegend?</span></span>
          <ArrowRight className="w-4 h-4 text-purple-400 group-hover:translate-x-1 transition-transform" />
        </motion.button>
      </header>

      <div className="relative z-10 container mx-auto px-6 py-8">
        <div className="max-w-2xl mx-auto">
          
          {/* Personal Message */}
          <motion.div 
            className="text-center mb-12"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <motion.div 
              className="text-5xl mb-6"
              animate={{ 
                rotate: [0, 5, -5, 0],
                scale: [1, 1.1, 1, 1.05, 1]
              }}
              transition={{ 
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              {currentAvatar.icon}
            </motion.div>
            <h1 className="text-3xl md:text-4xl font-bold mb-6">
              Ready to start your transformation?
            </h1>
            <p className="text-lg leading-relaxed opacity-90 mb-8">
              {currentAvatar.personalMessage}
            </p>
          </motion.div>

          {/* Main Signup Form */}
          <motion.div 
            className="bg-black/40 backdrop-blur-lg border border-purple-500/20 rounded-2xl p-8 mb-8 relative overflow-hidden"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            style={{
              boxShadow: '0 0 40px rgba(147, 51, 234, 0.1), 0 0 80px rgba(219, 39, 119, 0.05)'
            }}
          >
            {/* Inner Glow Effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-purple-600/5 via-transparent to-magenta-600/5 rounded-2xl" />
            
            <div className="relative z-10">
              <div className="text-center mb-6">
                <motion.h2 
                  className="text-2xl font-bold mb-4 text-transparent bg-gradient-to-r from-purple-400 via-magenta-400 to-pink-400 bg-clip-text"
                  animate={{ 
                    backgroundPosition: ['0% 50%', '100% 50%', '0% 50%']
                  }}
                  transition={{ 
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                >
                  <Sparkles className="w-6 h-6 inline-block mr-2 text-purple-400" />
                  Start Your Free 7-Day Trial
                  <Sparkles className="w-6 h-6 inline-block ml-2 text-magenta-400" />
                </motion.h2>
                <p className="text-lg opacity-80">
                  {currentAvatar.urgentBenefit}
                </p>
              </div>

              {/* General Error */}
              {errors.general && (
                <motion.div 
                  className="mb-6 p-4 bg-red-900/20 border border-red-500/30 rounded-lg text-red-400 text-center"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                >
                  {errors.general}
                </motion.div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Username Field */}
                <div>
                  <label className="block text-sm font-semibold text-transparent bg-gradient-to-r from-purple-400 to-magenta-400 bg-clip-text mb-2">
                    What should we call you, future alpha?
                  </label>
                  <div className="relative group">
                    <motion.input 
                      type="text" 
                      placeholder="John, Johnny, J-Money... whatever feels right"
                      value={userName}
                      onChange={(e) => setUserName(e.target.value)}
                      className={`w-full p-4 bg-black/60 backdrop-blur-sm border-2 rounded-xl text-white placeholder-white/40 focus:outline-none transition-all duration-500 ${
                        errors.userName 
                          ? 'border-red-500/50 focus:border-red-400 shadow-lg shadow-red-500/20' 
                          : validationLoading.userName
                          ? 'border-yellow-500/50 focus:border-yellow-400 shadow-lg shadow-yellow-500/20'
                          : userName && !errors.userName && userName.length >= 3
                          ? 'border-green-500/50 focus:border-green-400 shadow-lg shadow-green-500/20'
                          : 'border-purple-500/30 focus:border-magenta-500/60 focus:shadow-xl focus:shadow-magenta-500/20'
                      }`}
                      required
                      minLength={3}
                      disabled={isLoading}
                      whileFocus={{ scale: 1.02 }}
                      style={{
                        background: errors.userName 
                          ? 'linear-gradient(135deg, rgba(0,0,0,0.7) 0%, rgba(239,68,68,0.1) 100%)'
                          : userName && !errors.userName && userName.length >= 3
                          ? 'linear-gradient(135deg, rgba(0,0,0,0.7) 0%, rgba(34,197,94,0.1) 100%)'
                          : 'linear-gradient(135deg, rgba(0,0,0,0.7) 0%, rgba(147,51,234,0.1) 50%, rgba(219,39,119,0.1) 100%)'
                      }}
                    />
                    
                    {/* Animated Border Glow */}
                    {userName && !errors.userName && (
                      <motion.div 
                        className="absolute inset-0 rounded-xl"
                        style={{
                          background: 'linear-gradient(90deg, transparent, rgba(147,51,234,0.3), rgba(219,39,119,0.3), transparent)',
                          zIndex: -1
                        }}
                        animate={{ 
                          x: [-100, 400],
                        }}
                        transition={{ 
                          duration: 2,
                          repeat: Infinity,
                          ease: "easeInOut"
                        }}
                      />
                    )}
                    
                    {validationLoading.userName && (
                      <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                        <motion.div 
                          className="w-5 h-5 border-2 border-purple-400/30 border-t-purple-400 rounded-full"
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        />
                      </div>
                    )}
                  </div>
                  {errors.userName && (
                    <motion.p 
                      className="mt-2 text-sm text-red-400"
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                    >
                      {errors.userName}
                    </motion.p>
                  )}
                  {userName && userName.length >= 3 && !errors.userName && !validationLoading.userName && (
                    <motion.p 
                      className="mt-2 text-sm text-green-400 flex items-center gap-1"
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                    >
                      <motion.span
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ duration: 0.5 }}
                      >
                        ✨
                      </motion.span>
                      Username available! Looking good, alpha!
                    </motion.p>
                  )}
                </div>

                {/* Email Field */}
                <div>
                  <label className="block text-sm font-semibold text-transparent bg-gradient-to-r from-purple-400 to-magenta-400 bg-clip-text mb-2">
                    Email Address
                  </label>
                  <div className="relative group">
                    <motion.input 
                      type="email" 
                      placeholder="Enter your email address"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className={`w-full p-4 bg-black/60 backdrop-blur-sm border-2 rounded-xl text-white placeholder-white/40 focus:outline-none transition-all duration-500 ${
                        errors.email 
                          ? 'border-red-500/50 focus:border-red-400 shadow-lg shadow-red-500/20' 
                          : validationLoading.email
                          ? 'border-yellow-500/50 focus:border-yellow-400 shadow-lg shadow-yellow-500/20'
                          : email && isValidEmail(email) && !errors.email
                          ? 'border-green-500/50 focus:border-green-400 shadow-lg shadow-green-500/20'
                          : 'border-magenta-500/30 focus:border-purple-500/60 focus:shadow-xl focus:shadow-purple-500/20'
                      }`}
                      required
                      disabled={isLoading}
                      whileFocus={{ scale: 1.02 }}
                      style={{
                        background: errors.email 
                          ? 'linear-gradient(135deg, rgba(0,0,0,0.7) 0%, rgba(239,68,68,0.1) 100%)'
                          : email && isValidEmail(email) && !errors.email
                          ? 'linear-gradient(135deg, rgba(0,0,0,0.7) 0%, rgba(34,197,94,0.1) 100%)'
                          : 'linear-gradient(135deg, rgba(0,0,0,0.7) 0%, rgba(219,39,119,0.1) 50%, rgba(147,51,234,0.1) 100%)'
                      }}
                    />
                    
                    {validationLoading.email && (
                      <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                        <motion.div 
                          className="w-5 h-5 border-2 border-magenta-400/30 border-t-magenta-400 rounded-full"
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        />
                      </div>
                    )}
                  </div>
                  {errors.email && (
                    <motion.p 
                      className="mt-2 text-sm text-red-400"
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                    >
                      {errors.email}
                    </motion.p>
                  )}
                  {email && isValidEmail(email) && !errors.email && !validationLoading.email && (
                    <motion.p 
                      className="mt-2 text-sm text-green-400 flex items-center gap-1"
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                    >
                      <motion.span
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ duration: 0.5 }}
                      >
                        🎯
                      </motion.span>
                      Perfect! Ready to receive your alpha updates!
                    </motion.p>
                  )}
                </div>
                
                <motion.button 
                  type="submit"
                  disabled={isLoading || !isFormValid()}
                  className={`w-full p-4 rounded-xl font-bold text-xl transition-all duration-500 ease-out relative overflow-hidden group ${
                    isLoading || !isFormValid()
                      ? 'bg-gray-600/50 cursor-not-allowed opacity-50 border border-gray-500/30' 
                      : 'bg-gradient-to-r from-purple-600 via-magenta-600 to-pink-600 hover:from-purple-700 hover:via-magenta-700 hover:to-pink-700 border border-purple-500/50'
                  }`}
                  whileHover={!isLoading && isFormValid() ? { 
                    scale: 1.02,
                    boxShadow: "0 20px 40px rgba(147, 51, 234, 0.4)"
                  } : {}}
                  whileTap={{ scale: 0.98 }}
                  style={{
                    boxShadow: !isLoading && isFormValid() 
                      ? '0 10px 30px rgba(147, 51, 234, 0.3), 0 0 60px rgba(219, 39, 119, 0.2)'
                      : 'none'
                  }}
                >
                  {/* Button Shimmer Effect */}
                  {!isLoading && isFormValid() && (
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                      animate={{ x: [-100, 400] }}
                      transition={{ 
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeInOut"
                      }}
                    />
                  )}
                  
                  <span className="relative z-10">
                    {isLoading ? (
                      <div className="flex items-center justify-center gap-3">
                        <motion.div 
                          className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        />
                        Creating Your Alpha Account...
                      </div>
                    ) : (
                      <div className="flex items-center justify-center gap-2">
                        <Sparkles className="w-5 h-5" />
                        START MY ALPHA JOURNEY
                        <motion.div
                          animate={{ x: [0, 5, 0] }}
                          transition={{ duration: 1, repeat: Infinity }}
                        >
                          🚀
                        </motion.div>
                      </div>
                    )}
                  </span>
                </motion.button>
              </form>

              <div className="text-center mt-6 space-y-2">
                <p className="text-sm opacity-60">
                  ✅ Free for 7 days • ✅ Cancel anytime • ✅ No credit card required
                </p>
                <p className="text-xs opacity-40">
                  After trial: $27/month • Over 2,000 alphas have transformed their confidence
                </p>
              </div>
            </div>
          </motion.div>

          {/* Urgency & Social Proof */}
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            {/* Live Counter */}
            <motion.div 
              className="bg-red-900/20 border border-red-500/30 rounded-xl p-6 text-center backdrop-blur-sm"
              whileHover={{ scale: 1.05 }}
              style={{ boxShadow: '0 0 20px rgba(239, 68, 68, 0.1)' }}
            >
              <div className="text-red-400 font-bold text-lg mb-2">🔴 Live Now</div>
              <motion.div 
                className="text-2xl font-black text-white mb-1"
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                {liveCount}
              </motion.div>
              <div className="text-sm opacity-70">future alphas started today</div>
            </motion.div>

            {/* Limited Spots */}
            <motion.div 
              className="bg-yellow-900/20 border border-yellow-500/30 rounded-xl p-6 text-center backdrop-blur-sm"
              whileHover={{ scale: 1.05 }}
              style={{ boxShadow: '0 0 20px rgba(245, 158, 11, 0.1)' }}
            >
              <div className="text-yellow-400 font-bold text-lg mb-2">⚡ Limited</div>
              <motion.div 
                className="text-2xl font-black text-white mb-1"
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                23 spots
              </motion.div>
              <div className="text-sm opacity-70">remaining for today</div>
            </motion.div>
          </motion.div>

          {/* Benefits Specific to Avatar */}
          <motion.div 
            className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
          >
            <h3 className="text-xl font-bold mb-4 text-center">
              What you'll get in your first week:
            </h3>
            <div className="space-y-3">
              <motion.div 
                className="flex items-start gap-3"
                whileHover={{ x: 5 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <div className="text-purple-400 mt-1">✨</div>
                <div>Your personalized {currentAvatar.name} confidence blueprint</div>
              </motion.div>
              <motion.div 
                className="flex items-start gap-3"
                whileHover={{ x: 5 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <div className="text-magenta-400 mt-1">🚀</div>
                <div>Access to your exclusive alpha brotherhood community</div>
              </motion.div>
              <motion.div 
                className="flex items-start gap-3"
                whileHover={{ x: 5 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <div className="text-pink-400 mt-1">🎯</div>
                <div>{currentAvatar.specificPain}</div>
              </motion.div>
              <motion.div 
                className="flex items-start gap-3"
                whileHover={{ x: 5 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <div className="text-purple-400 mt-1">⚡</div>
                <div>Daily confidence challenges designed for your personality type</div>
              </motion.div>
              <motion.div 
                className="flex items-start gap-3"
                whileHover={{ x: 5 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <div className="text-magenta-400 mt-1">💰</div>
                <div>Coin rewards system - earn money back on your subscription</div>
              </motion.div>
            </div>
          </motion.div>

          {/* Trust Signals */}
          <motion.div 
            className="text-center mt-8 opacity-60"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.6 }}
            transition={{ duration: 0.6, delay: 0.8 }}
          >
            <p className="text-sm">
              🔒 Your data is secure • 📧 No spam, ever • 🎯 Results in 7 days or it's free
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  )
}

export default function SignupPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white flex items-center justify-center">
        <div className="text-center">
          <motion.div 
            className="text-6xl mb-4"
            animate={{ 
              rotate: [0, 10, -10, 0],
              scale: [1, 1.1, 1]
            }}
            transition={{ 
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            🚀
          </motion.div>
          <h2 className="text-2xl font-bold">Preparing your alpha program...</h2>
          <motion.div 
            className="mt-4 w-64 h-1 bg-gray-700 rounded-full mx-auto overflow-hidden"
          >
            <motion.div 
              className="h-full bg-gradient-to-r from-purple-500 to-magenta-500 rounded-full"
              animate={{ x: [-100, 300] }}
              transition={{ 
                duration: 1.5,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
          </motion.div>
        </div>
      </div>
    }>
      <SignupContent />
    </Suspense>
  )
}