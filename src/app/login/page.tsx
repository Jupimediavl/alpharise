'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { ArrowLeft, Loader2 } from 'lucide-react'
import { SupabaseUserManager, supabase } from '@/lib/supabase' // FIXED: Added supabase import

export default function LoginPage() {
  const router = useRouter()
  const [loginMethod, setLoginMethod] = useState<'username' | 'email'>('username')
  const [formData, setFormData] = useState({
    identifier: '', // username or email
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.identifier.trim()) {
      setError('Please enter your username or email')
      return
    }

    setIsLoading(true)
    setError('')

    try {
      // Try to find user by username or email
      let user = null
      
      if (formData.identifier.includes('@')) {
        // Email login - FIXED: Use proper method
        const { data, error } = await supabase
          .from('users')
          .select('*')
          .eq('email', formData.identifier.trim())
          .single()
        
        if (error && error.code !== 'PGRST116') {
          console.error('Email lookup error:', error)
          throw new Error('Database error')
        }
        
        user = data
      } else {
        // Username login - FIXED: Already correct
        user = await SupabaseUserManager.getUserByUsername(formData.identifier.trim())
      }

      if (user) {
        // Update last active time
        await SupabaseUserManager.updateUserStats(user.username, {})

        // Store user info in sessionStorage
        if (typeof window !== 'undefined') {
          sessionStorage.setItem('alpharise_user', JSON.stringify({
            username: user.username,
            email: user.email,
            avatar_type: user.avatar_type,
            coins: user.coins,
            created_at: user.created_at,
            level: user.level,
            streak: user.streak,
            confidence_score: user.confidence_score
          }))
        }

        // Redirect to dashboard
        router.push(`/dashboard?welcome=true&username=${encodeURIComponent(user.username)}`)
      } else {
        setError('User not found. Please check your username/email or create a new account.')
      }
    } catch (error) {
      console.error('Login error:', error)
      setError('Login failed. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white">
      {/* Header */}
      <header className="p-6 flex items-center justify-between">
        <button
          onClick={() => router.push('/')}
          className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Home</span>
        </button>
        <div className="text-2xl font-black bg-gradient-to-r from-red-500 to-red-600 bg-clip-text text-transparent">
          AlphaRise
        </div>
      </header>

      <div className="container mx-auto px-6 py-12">
        <div className="max-w-md mx-auto">
          {/* Welcome Back */}
          <motion.div 
            className="text-center mb-8"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="text-5xl mb-4">🚀</div>
            <h1 className="text-3xl font-bold mb-2">Welcome Back, Alpha!</h1>
            <p className="text-gray-400">
              Continue your journey to confidence and success
            </p>
          </motion.div>

          {/* Login Form */}
          <motion.div 
            className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Login Method Toggle */}
              <div className="flex bg-gray-700/30 rounded-lg p-1">
                <button
                  type="button"
                  onClick={() => setLoginMethod('username')}
                  className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${
                    loginMethod === 'username'
                      ? 'bg-red-600 text-white'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  Username
                </button>
                <button
                  type="button"
                  onClick={() => setLoginMethod('email')}
                  className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${
                    loginMethod === 'email'
                      ? 'bg-red-600 text-white'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  Email
                </button>
              </div>

              {/* Input Field */}
              <div>
                <label className="block text-sm font-semibold text-red-400 mb-2">
                  {loginMethod === 'username' ? 'Username' : 'Email Address'}
                </label>
                <input 
                  type={loginMethod === 'email' ? 'email' : 'text'}
                  placeholder={loginMethod === 'username' ? 'Enter your username' : 'Enter your email'}
                  value={formData.identifier}
                  onChange={(e) => setFormData({ identifier: e.target.value })}
                  className="w-full p-4 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/60 focus:border-red-500 focus:outline-none transition-colors duration-300"
                  required
                  disabled={isLoading}
                />
              </div>

              {/* Error Message */}
              {error && (
                <motion.div 
                  className="p-4 bg-red-900/20 border border-red-500/30 rounded-lg text-red-400 text-sm"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                >
                  {error}
                </motion.div>
              )}

              {/* Submit Button */}
              <motion.button 
                type="submit"
                disabled={isLoading || !formData.identifier.trim()}
                className={`w-full p-4 rounded-lg font-bold text-xl transition-all duration-300 ease-out ${
                  isLoading || !formData.identifier.trim()
                    ? 'bg-gray-600 cursor-not-allowed opacity-50' 
                    : 'bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800'
                }`}
                whileHover={!isLoading && formData.identifier.trim() ? { 
                  scale: 1.02, 
                  boxShadow: "0 10px 30px rgba(255, 68, 68, 0.4)" 
                } : {}}
                whileTap={{ scale: 0.98 }}
              >
                {isLoading ? (
                  <div className="flex items-center justify-center gap-3">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Signing In...
                  </div>
                ) : (
                  "CONTINUE MY ALPHA JOURNEY"
                )}
              </motion.button>
            </form>

            {/* Signup Link */}
            <div className="text-center mt-6">
              <p className="text-gray-400">
                New to AlphaRise?{' '}
                <button
                  onClick={() => router.push('/assessment')}
                  className="text-red-400 hover:text-red-300 font-semibold"
                >
                  Take the assessment
                </button>
              </p>
            </div>

            {/* Demo Accounts */}
            <div className="mt-8 p-4 bg-gray-700/30 rounded-lg border border-gray-600">
              <h3 className="text-sm font-semibold mb-3 text-center text-yellow-400">
                🎮 Try Demo Accounts
              </h3>
              <div className="grid grid-cols-1 gap-2">
                {[
                  { username: 'testuser1', type: 'Regular User', coins: 200 },
                  { username: 'coach_rodriguez', type: 'Expert Coach', coins: 500 },
                  { username: 'expert_dan', type: 'Community Expert', coins: 350 }
                ].map((demo) => (
                  <button
                    key={demo.username}
                    onClick={() => setFormData({ identifier: demo.username })}
                    className="p-3 bg-gray-600/50 hover:bg-gray-600 rounded-lg transition-colors text-left"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-sm font-semibold text-blue-400">{demo.username}</div>
                        <div className="text-xs text-gray-400">{demo.type}</div>
                      </div>
                      <div className="text-xs text-yellow-400 font-semibold">
                        {demo.coins} AlphaCoins
                      </div>
                    </div>
                  </button>
                ))}
              </div>
              <p className="text-xs text-gray-500 text-center mt-3">
                Click any demo account to auto-fill the login form
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}