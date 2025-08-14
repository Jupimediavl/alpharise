'use client'

import { useSearchParams } from 'next/navigation'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { useState, useEffect, Suspense } from 'react'

function SignupContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [avatarType, setAvatarType] = useState('marcus')
  const [email, setEmail] = useState('')
  const [userName, setUserName] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [liveCount, setLiveCount] = useState(47)

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !userName) return

    setIsLoading(true)

    // Simulate API call
    setTimeout(() => {
      // In real app: save to database, send welcome email
      console.log('User signed up:', { email, userName, avatarType })
      
      // Redirect to dashboard with trial active and username
      router.push(`/dashboard?avatar=${avatarType}&trial=true&email=${encodeURIComponent(email)}&name=${encodeURIComponent(userName)}`)
    }, 2000)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white">
      {/* Header */}
      <header className="p-6 text-center">
        <div className="text-3xl font-black bg-gradient-to-r from-red-500 to-red-600 bg-clip-text text-transparent">
          AlphaRise
        </div>
      </header>

      <div className="container mx-auto px-6 py-8">
        <div className="max-w-2xl mx-auto">
          
          {/* Personal Message */}
          <motion.div 
            className="text-center mb-12"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="text-5xl mb-6">{currentAvatar.icon}</div>
            <h1 className="text-3xl md:text-4xl font-bold mb-6">
              Ready to start your transformation?
            </h1>
            <p className="text-lg leading-relaxed opacity-90 mb-8">
              {currentAvatar.personalMessage}
            </p>
          </motion.div>

          {/* Main Signup Form */}
          <motion.div 
            className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 mb-8"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold mb-4 text-red-400">
                Start Your Free 7-Day Trial
              </h2>
              <p className="text-lg opacity-80">
                {currentAvatar.urgentBenefit}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-red-400 mb-2">
                  What should we call you, future alpha?
                </label>
                <input 
                  type="text" 
                  placeholder="John, Johnny, J-Money... whatever feels right"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  className="w-full p-4 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/60 focus:border-red-500 focus:outline-none transition-colors duration-300"
                  required
                />
              </div>
              <div>
                <input 
                  type="email" 
                  placeholder="Enter your email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full p-4 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/60 focus:border-red-500 focus:outline-none transition-colors duration-300"
                  required
                />
              </div>
              
              <motion.button 
                type="submit"
                disabled={isLoading || !email || !userName}
                className={`w-full p-4 rounded-lg font-bold text-xl transition-all duration-300 ease-out ${
                  isLoading || !email || !userName
                    ? 'bg-gray-600 cursor-not-allowed opacity-50' 
                    : 'bg-gradient-to-r from-red-600 to-red-700'
                }`}
                whileHover={!isLoading && email && userName ? { 
                  scale: 1.02, 
                  boxShadow: "0 10px 30px rgba(255, 68, 68, 0.4)" 
                } : {}}
                whileTap={{ scale: 0.98 }}
              >
                {isLoading ? (
                  <div className="flex items-center justify-center gap-3">
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Creating Your Alpha Account...
                  </div>
                ) : (
                  "START MY ALPHA JOURNEY"
                )}
              </motion.button>
            </form>

            <div className="text-center mt-6 space-y-2">
              <p className="text-sm opacity-60">
                ✓ Free for 7 days • ✓ Cancel anytime • ✓ No credit card required
              </p>
              <p className="text-xs opacity-40">
                After trial: $27/month • Over 2,000 alphas have transformed their confidence
              </p>
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
            <div className="bg-red-900/20 border border-red-500/30 rounded-xl p-6 text-center">
              <div className="text-red-400 font-bold text-lg mb-2">🔴 Live Now</div>
              <div className="text-2xl font-black text-white mb-1">{liveCount}</div>
              <div className="text-sm opacity-70">future alphas started today</div>
            </div>

            {/* Limited Spots */}
            <div className="bg-yellow-900/20 border border-yellow-500/30 rounded-xl p-6 text-center">
              <div className="text-yellow-400 font-bold text-lg mb-2">⚡ Limited</div>
              <div className="text-2xl font-black text-white mb-1">23 spots</div>
              <div className="text-sm opacity-70">remaining for today</div>
            </div>
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
              <div className="flex items-start gap-3">
                <div className="text-red-400 mt-1">✓</div>
                <div>Your personalized {currentAvatar.name} confidence blueprint</div>
              </div>
              <div className="flex items-start gap-3">
                <div className="text-red-400 mt-1">✓</div>
                <div>Access to your exclusive alpha brotherhood community</div>
              </div>
              <div className="flex items-start gap-3">
                <div className="text-red-400 mt-1">✓</div>
                <div>{currentAvatar.specificPain}</div>
              </div>
              <div className="flex items-start gap-3">
                <div className="text-red-400 mt-1">✓</div>
                <div>Daily confidence challenges designed for your personality type</div>
              </div>
              <div className="flex items-start gap-3">
                <div className="text-red-400 mt-1">✓</div>
                <div>Coin rewards system - earn money back on your subscription</div>
              </div>
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
          <div className="text-6xl mb-4">🚀</div>
          <h2 className="text-2xl font-bold">Preparing your alpha program...</h2>
        </div>
      </div>
    }>
      <SignupContent />
    </Suspense>
  )
}