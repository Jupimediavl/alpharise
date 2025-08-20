'use client'

import { useSearchParams } from 'next/navigation'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { useState, useEffect, Suspense } from 'react'
import { supabaseHelpers, SupabaseUserManager, SupabaseCoachManager, supabase, SupabasePricingManager, DbCoach, SupabaseAuthManager } from '@/lib/supabase'
import { ArrowRight, Sparkles, Crown } from 'lucide-react'
import Image from 'next/image'

// Temporary mapping from new coach names to valid database values
const getValidAvatarType = (coach: string): string => {
  const mapping: Record<string, string> = {
    'logan': 'marcus',   // Logan helps overthinkers -> maps to Marcus
    'chase': 'jake',     // Chase helps nervous guys -> maps to Jake  
    'mason': 'alex',     // Mason helps rookies -> maps to Alex
    'blake': 'ryan',     // Blake helps up&down guys -> maps to Ryan
    'knox': 'marcus'     // Knox helps surface guys -> maps to Marcus (or any valid value)
  }
  
  return mapping[coach] || 'marcus' // Default to marcus if not found
}

function SignupContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [userType, setUserType] = useState('overthinker')
  const [coach, setCoach] = useState('logan')
  const [coachData, setCoachData] = useState<DbCoach | null>(null)
  const [age, setAge] = useState(25) // Will be set from URL params
  const [confidenceScore, setConfidenceScore] = useState(25) // Will be set from URL params
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
  const [pricingData, setPricingData] = useState<{
    trialPrice: number
    trialDays: number
    originalPrice: number
    discountedPrice: number
    currentPrice: number
    discountPercentage: number
    hasDiscount: boolean
    currency: string
  }>({
    trialPrice: 0,
    trialDays: 3,
    originalPrice: 19.99,
    discountedPrice: 9.99,
    currentPrice: 9.99,
    discountPercentage: 50,
    hasDiscount: true,
    currency: 'USD'
  })

  // NEW COACH SYSTEM - Coaches are the SOLUTION to user problems (FALLBACK DATA)
  const coachDataLocal = {
    logan: {
      name: 'Logan',
      title: 'The Straight Shooter',
      icon: '🎯',
      avatar: '/avatars/logan.png',
      helpsWith: 'Overthinkers',
      userTypeProblem: 'overthinking every interaction',
      personalMessage: "Logan here! I help Overthinkers like you get out of their heads and into action. I used to coach guys who'd analyze conversations for hours afterward - sound familiar? I'll teach you to trust your instincts and make confident decisions instantly.",
      urgentBenefit: "Stop the mental loops and start enjoying natural, effortless conversations",
      specificPain: "No more replaying conversations for hours wondering what you should have said differently",
      coachStyle: "Direct, no-nonsense approach that cuts through mental fog"
    },
    chase: {
      name: 'Chase', 
      title: 'The Cool Cat',
      icon: '😎',
      avatar: '/avatars/chase.png',
      helpsWith: 'Nervous Guys',
      userTypeProblem: 'performance anxiety in intimate situations',
      personalMessage: "Chase here! I specialize in helping Nervous Guys like you transform anxiety into magnetic confidence. Performance pressure used to control my life too - now I'll show you how to stay calm and confident no matter what.",
      urgentBenefit: "Transform performance anxiety into unshakeable confidence and lasting power",
      specificPain: "No more avoiding intimacy because you're worried about disappointing her",
      coachStyle: "Calm, reassuring presence that builds unshakeable confidence"
    },
    mason: {
      name: 'Mason',
      title: 'The Patient Pro', 
      icon: '🧑‍🏫',
      avatar: '/avatars/mason.png',
      helpsWith: 'Rookies',
      userTypeProblem: 'feeling behind and inexperienced',
      personalMessage: "Mason here! I work exclusively with Rookies like you who are starting their confidence journey. Everyone was a beginner once - but most guys are too proud to admit it. That honesty is exactly why you'll succeed faster than everyone else.",
      urgentBenefit: "Get the comprehensive education you never received, step by step",
      specificPain: "No more feeling clueless and hoping you're doing things right",
      coachStyle: "Patient, thorough teacher who builds skills from the ground up"
    },
    blake: {
      name: 'Blake',
      title: 'The Reliable Guy',
      icon: '⚡',
      avatar: '/avatars/blake.png',
      helpsWith: 'Up & Down Guys',
      userTypeProblem: 'inconsistent confidence that comes and goes',
      personalMessage: "Blake here! I help Up & Down guys like you turn potential into consistent results. I see you have those moments when your natural charm shines through - the problem isn't that you lack confidence, it's that you can't access it reliably.",
      urgentBenefit: "Unlock that magnetic confidence on demand, whenever you need it",
      specificPain: "No more good days and bad days - just consistent, reliable confidence",
      coachStyle: "Systematic approach that builds unshakeable consistency"
    },
    knox: {
      name: 'Knox',
      title: 'The Authentic One',
      icon: '❤️',
      avatar: '/avatars/knox.png',
      helpsWith: 'Surface Guys', 
      userTypeProblem: 'struggling to form deep, meaningful connections',
      personalMessage: "Knox here! I help Surface Guys like you create authentic, deep connections. Your emotional intelligence is actually rare and valuable - most guys think it's all about technique, but you understand that real intimacy starts with genuine connection.",
      urgentBenefit: "Combine your natural empathy with confident physical expression", 
      specificPain: "No more choosing between meaningful connection and passionate attraction",
      coachStyle: "Emotionally intelligent approach that creates deep, lasting bonds"
    }
  }

  // User type descriptions for context
  const userTypeDescriptions = {
    overthinker: "You analyze every interaction and get stuck in mental loops",
    nervous: "Performance anxiety makes you avoid physical intimacy", 
    rookie: "You feel behind and inexperienced compared to other guys",
    updown: "Your confidence is inconsistent - great days followed by bad days",
    surface: "You struggle to move beyond surface-level connections"
  }

  // Convert database coach data to expected format
  const formatCoachData = (dbCoach: DbCoach | null) => {
    if (!dbCoach) return null
    
    return {
      name: dbCoach.name,
      title: dbCoach.title || dbCoach.description, // Use title if available, otherwise description
      icon: dbCoach.icon,
      avatar: `/avatars/${dbCoach.id}.png`, // Construct avatar path from ID
      helpsWith: dbCoach.helpsWith || extractHelpsWithFromName(dbCoach.name),
      personalMessage: dbCoach.personalMessage || dbCoach.description,
      coachStyle: dbCoach.coachStyle || "Professional coaching approach",
      urgentBenefit: dbCoach.urgentBenefit || "Transform your confidence and unlock your potential",
      userTypeProblem: dbCoach.userTypeProblem || "confidence challenges",
      specificPain: dbCoach.specificPain || "overcome your limitations"
    }
  }

  // Helper function to extract "helps with" from coach name
  const extractHelpsWithFromName = (name: string) => {
    const mapping: Record<string, string> = {
      'Logan': 'Overthinkers',
      'Chase': 'Nervous Guys', 
      'Mason': 'Rookies',
      'Blake': 'Up & Down Guys',
      'Knox': 'Surface Guys'
    }
    return mapping[name] || 'Men seeking confidence'
  }

  // Use coach data from database if available, otherwise fallback to local data
  const currentCoach = formatCoachData(coachData) || coachDataLocal[coach as keyof typeof coachDataLocal] || coachDataLocal.logan

  useEffect(() => {
    // Get user type, coach, age, and confidence score from URL params (from confidence test results)
    const urlUserType = searchParams.get('userType') || 'overthinker'
    const urlCoach = searchParams.get('coach') || 'logan'
    const urlAge = parseInt(searchParams.get('age') || '25')
    const urlConfidenceScore = parseInt(searchParams.get('confidenceScore') || '25')
    
    setUserType(urlUserType)
    setCoach(urlCoach)
    setAge(urlAge)
    setConfidenceScore(urlConfidenceScore)

    // Load coach data from database
    const loadCoachData = async () => {
      try {
        const coach = await SupabaseCoachManager.getCoachById(urlCoach)
        if (coach) {
          setCoachData(coach)
        }
      } catch (error) {
        console.error('Error loading coach data:', error)
      }
    }
    loadCoachData()

    // Load pricing data from database
    const loadPricingData = async () => {
      try {
        const [trialPricing, mainPricingWithDiscount] = await Promise.all([
          SupabasePricingManager.getTrialPricing(),
          SupabasePricingManager.getPricingWithDiscount()
        ])

        if (trialPricing && mainPricingWithDiscount) {
          setPricingData({
            trialPrice: trialPricing.price,
            trialDays: trialPricing.days,
            originalPrice: mainPricingWithDiscount.originalPrice,
            discountedPrice: mainPricingWithDiscount.discountedPrice,
            currentPrice: mainPricingWithDiscount.currentPrice,
            discountPercentage: mainPricingWithDiscount.discountPercentage,
            hasDiscount: mainPricingWithDiscount.hasDiscount,
            currency: trialPricing.currency
          })
        }
      } catch (error) {
        console.error('Error loading pricing:', error)
        // Keep default values if error
      }
    }

    loadPricingData()

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
          setErrors(prev => ({ ...prev, userName: 'Username already taken. Try another one! Already registered? Sign in here.' }))
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
          setErrors(prev => ({ ...prev, email: 'Email already registered. Already have an account? Sign in here.' }))
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

  const renderErrorWithLink = (errorMessage: string) => {
    if (!errorMessage) return null
    
    if (errorMessage.includes('Sign in here')) {
      const parts = errorMessage.split('Sign in here')
      return (
        <span>
          {parts[0]}
          <span 
            onClick={() => router.push('/login')} 
            className="underline cursor-pointer hover:text-red-300"
          >
            Sign in here
          </span>
          {parts[1]}
        </span>
      )
    }
    return errorMessage
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
      console.log('🚀 Starting Supabase Auth signup process...')
      console.log('Data:', { userName: userName.trim(), email: email.trim(), coach })
      
      // Generate temporary password
      const temporaryPassword = SupabaseAuthManager.generateTemporaryPassword()
      console.log('🔑 Generated temporary password:', temporaryPassword.substring(0, 3) + '...')
      
      // Create user with Supabase Auth
      const authResult = await SupabaseAuthManager.signUpUser(
        email.trim(),
        temporaryPassword,
        {
          username: userName.trim(),
          user_type: userType,
          coach: coach,
          age: age,
          confidence_score: confidenceScore
        }
      )
      
      if (!authResult.success) {
        throw new Error(authResult.error || 'Failed to create account')
      }

      console.log('✅ User created with Supabase Auth successfully!')
      
      // Check if user is automatically signed in (email confirmation disabled)
      const session = await SupabaseAuthManager.getCurrentSession()
      
      if (session && session.user) {
        console.log('✅ User automatically logged in (email confirmation disabled)')
        console.log('🔑 Redirecting to password setup...')
        
        // Auto-login successful, but user needs to set password first
        router.push('/auth/reset-password?flow=setup')
        return
      }
      
      // Email confirmation required - show message and redirect to login
      console.log('📧 Email confirmation required')
      setErrors({
        general: `🎉 Account created! Check your email (${email}) for confirmation instructions. You'll receive a temporary password and can set a new one.`
      })
      
      // Redirect to login page with email pre-filled
      setTimeout(() => {
        router.push(`/login?message=check-email&email=${encodeURIComponent(email)}`)
      }, 3000)
      
    } catch (error: any) {
      console.error('❌ Signup error:', error)
      
      if (error.message?.includes('User already registered')) {
        setErrors(prev => ({ ...prev, email: 'Email already registered. Already have an account? Sign in here.' }))
      } else if (error.message?.includes('duplicate') || error.message?.includes('already exists')) {
        if (error.message.includes('username')) {
          setErrors(prev => ({ ...prev, userName: 'Username already taken. Try another one! Already registered? Sign in here.' }))
        } else {
          setErrors(prev => ({ ...prev, email: 'Email already registered. Already have an account? Sign in here.' }))
        }
      } else {
        setErrors(prev => ({ 
          ...prev, 
          general: error.message || 'Something went wrong. Please try again.' 
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
        <div className="text-3xl font-black text-white">
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
          
          {/* Coach Introduction - COACH talking TO user type */}
          <motion.div 
            className="text-center mb-12"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <motion.div 
              className="mb-6 flex justify-center"
              animate={{ 
                scale: [1, 1.05, 1, 1.02, 1]
              }}
              transition={{ 
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              <div className="w-48 h-48 relative">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 to-magenta-500/20 rounded-full blur-lg"></div>
                <Image
                  src={currentCoach.avatar}
                  alt={`Coach ${currentCoach.name} - ${currentCoach.title}`}
                  width={192}
                  height={192}
                  className="relative z-10 w-full h-full object-contain"
                  priority
                />
              </div>
            </motion.div>
            
            {/* Coach talking TO the user about THEIR problem */}
            <h1 className="text-3xl md:text-4xl font-bold mb-6">
              Meet {currentCoach.name} - {currentCoach.title}
            </h1>
            
            <div className="bg-black/30 rounded-xl p-6 mb-6 border border-purple-500/20">
              <div className="text-sm text-purple-400 mb-2 font-semibold">
                🎯 I Help: {currentCoach.helpsWith} (That's You!)
              </div>
              <div className="text-xs text-cyan-400 mb-3 opacity-80">
                {currentCoach.name} has been specifically assigned to you based on your personality profile and confidence assessment results.
              </div>
              <div className="text-sm text-gray-400 mb-4">
                Your Problem: {userTypeDescriptions[userType as keyof typeof userTypeDescriptions]}
              </div>
              <p className="text-lg leading-relaxed opacity-90">
                {currentCoach.personalMessage}
              </p>
            </div>
            
            <div className="bg-gradient-to-r from-green-500/10 to-cyan-500/10 border border-green-500/30 rounded-lg p-4">
              <div className="text-green-400 font-semibold text-sm mb-2">✨ {currentCoach.coachStyle}</div>
              <div className="text-white font-medium">{currentCoach.urgentBenefit}</div>
            </div>
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
                  Start Training with {currentCoach.name}
                  <Sparkles className="w-6 h-6 inline-block ml-2 text-magenta-400" />
                </motion.h2>
                <p className="text-lg opacity-80">
                  Join {currentCoach.name}'s program designed specifically for {currentCoach.helpsWith}
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
                    What should {currentCoach.name} call you?
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
                      {renderErrorWithLink(errors.userName)}
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
                      Perfect! {currentCoach.name} is ready to start your training!
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
                      {renderErrorWithLink(errors.email)}
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
                      Ready to receive your personalized training updates!
                    </motion.p>
                  )}
                </div>

                
                <button 
                  type="submit"
                  disabled={isLoading || !isFormValid()}
                  className={`w-full p-5 rounded-xl font-bold text-xl transition-all duration-300 relative overflow-hidden ${
                    isLoading || !isFormValid()
                      ? 'bg-gray-600/50 cursor-not-allowed opacity-50 border border-gray-500/30' 
                      : 'bg-gradient-to-r from-purple-600 via-magenta-600 to-pink-600 hover:from-purple-700 hover:via-magenta-700 hover:to-pink-700 border border-purple-500/50 hover:scale-[1.02] active:scale-[0.98] shadow-xl'
                  }`}
                >
                  <span className="relative z-10">
                    {isLoading ? (
                      <div className="flex items-center justify-center gap-3">
                        <div 
                          className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"
                        />
                        Setting up your transformation...
                      </div>
                    ) : (
                      <div>
                        <div className="text-2xl">CLAIM YOUR SPOT NOW</div>
                        <div className="text-sm font-normal mt-1 opacity-90">
                          Limited spots available at this price
                        </div>
                      </div>
                    )}
                  </span>
                </button>
              </form>

              <div className="text-center mt-6 space-y-3">
                <p className="text-sm opacity-60">
                  ✅ {pricingData.trialDays}-day trial for {pricingData.trialPrice === 0 ? 'FREE' : `$${pricingData.trialPrice}`} • ✅ Cancel anytime • ✅ Secure payment
                </p>
                <div className="bg-gradient-to-r from-green-500/10 to-cyan-500/10 border border-green-500/30 rounded-lg p-4">
                  <p className="text-lg font-bold mb-2">
                    After trial: <span className="text-xl text-gray-400 line-through">${pricingData.originalPrice}</span> <span className="text-2xl text-green-400 font-bold">${pricingData.currentPrice}/month</span>
                  </p>
                  
                  {/* Calculate and show discount percentage dynamically */}
                  {pricingData.originalPrice > pricingData.currentPrice && (
                    <div className="flex justify-center mb-3">
                      <div className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-4 py-2 rounded-full text-lg font-bold shadow-lg">
                        Save {Math.round(((pricingData.originalPrice - pricingData.currentPrice) / pricingData.originalPrice) * 100)}%
                      </div>
                    </div>
                  )}
                  
                  <p className="text-sm text-green-400">
                    Over 2,000 men have transformed with <span className="font-bold text-white">Coach {currentCoach.name}</span>
                  </p>
                </div>
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
              className="bg-purple-900/20 border border-purple-500/30 rounded-xl p-6 text-center backdrop-blur-sm"
              whileHover={{ scale: 1.05 }}
            >
              <div className="text-purple-400 font-bold text-lg mb-2">🟢 Live Now</div>
              <motion.div 
                className="text-2xl font-black text-white mb-1"
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                {liveCount}
              </motion.div>
              <div className="text-sm opacity-70">{currentCoach.helpsWith} started today</div>
            </motion.div>

            {/* Coach Success Rate */}
            <motion.div 
              className="bg-green-900/20 border border-green-500/30 rounded-xl p-6 text-center backdrop-blur-sm"
              whileHover={{ scale: 1.05 }}
            >
              <div className="text-green-400 font-bold text-lg mb-2">{currentCoach.icon} {currentCoach.name}</div>
              <motion.div 
                className="text-2xl font-black text-white mb-1"
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                94% success
              </motion.div>
              <div className="text-sm opacity-70">rate with {currentCoach.helpsWith}</div>
            </motion.div>
          </motion.div>


          {/* Trust Signals */}
          <motion.div 
            className="text-center mt-8 opacity-60"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.6 }}
            transition={{ duration: 0.6, delay: 0.8 }}
          >
            <p className="text-sm">
              🔒 Your data is secure • 📧 Don't worry, we hate spam too!
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
          <h2 className="text-2xl font-bold">Matching you with your perfect coach...</h2>
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