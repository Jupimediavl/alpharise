'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { ArrowLeft, Loader2 } from 'lucide-react'
import { SupabaseUserManager, supabase, SupabaseAuthManager } from '@/lib/supabase' // FIXED: Added supabase import

export default function LoginPage() {
  const router = useRouter()
  const [loginMethod, setLoginMethod] = useState<'username' | 'email'>('username')
  const [formData, setFormData] = useState({
    identifier: '', // username or email
    password: ''
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.identifier.trim()) {
      setError('Please enter your username or email')
      return
    }

    if (!formData.password.trim()) {
      setError('Please enter your password')
      return
    }

    setIsLoading(true)
    setError('')

    try {
      let email = formData.identifier.trim()
      
      // If identifier is not an email, look up email by username
      if (!email.includes('@')) {
        console.log('🔍 Looking up email for username:', email)
        const user = await SupabaseUserManager.getUserByUsername(email)
        if (!user) {
          setError('Username not found. Please check your username or create a new account.')
          return
        }
        email = user.email
      }
      
      console.log('🔐 Attempting login with email:', email)
      
      // Use Supabase Auth to sign in
      const authResult = await SupabaseAuthManager.signInUser(email, formData.password)
      
      if (!authResult.success) {
        if (authResult.error?.includes('Invalid login credentials')) {
          setError('Invalid password. Please check your password or reset it.')
        } else {
          setError(authResult.error || 'Login failed. Please try again.')
        }
        return
      }

      console.log('✅ Login successful!')
      const user = authResult.user
      
      // Store user info in sessionStorage (for compatibility with existing code)
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('alpharise_user', JSON.stringify({
          username: user.username,
          email: user.email,
          user_type: user.user_type,
          coach: user.coach,
          age: user.age,
          coins: user.coins,
          created_at: user.created_at,
          level: user.level,
          streak: user.streak,
          confidence_score: user.confidence_score
        }))
      }

      // Redirect to dashboard
      router.push('/dashboard')
      
    } catch (error: any) {
      console.error('Login error:', error)
      setError(error.message || 'Login failed. Please try again.')
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
        <div className="text-2xl font-black text-white">
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
            <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-purple-500 via-magenta-500 to-pink-500 bg-clip-text text-transparent">
              Welcome Back, Alpha!
            </h1>
            <p className="text-gray-400">
              Continue your journey to confidence and success
            </p>
          </motion.div>

          {/* Login Form */}
          <motion.div 
            className="bg-black/30 backdrop-blur-sm border border-purple-500/20 rounded-2xl p-8"
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
                      ? 'bg-gradient-to-r from-purple-600 to-magenta-600 text-white'
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
                      ? 'bg-gradient-to-r from-purple-600 to-magenta-600 text-white'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  Email
                </button>
              </div>

              {/* Input Field */}
              <div>
                <label className="block text-sm font-semibold text-transparent bg-gradient-to-r from-purple-400 to-magenta-400 bg-clip-text mb-2">
                  {loginMethod === 'username' ? 'Username' : 'Email Address'}
                </label>
                <input 
                  type={loginMethod === 'email' ? 'email' : 'text'}
                  placeholder={loginMethod === 'username' ? 'Enter your username' : 'Enter your email'}
                  value={formData.identifier}
                  onChange={(e) => {
                    setFormData(prev => ({ ...prev, identifier: e.target.value }))
                    if (error) setError('') // Clear error when user types
                  }}
                  className="w-full p-4 bg-black/60 border border-purple-500/30 rounded-lg text-white placeholder-white/60 focus:border-magenta-500 focus:outline-none transition-colors duration-300"
                  required
                  disabled={isLoading}
                />
              </div>

              {/* Password Field */}
              <div>
                <label className="block text-sm font-semibold text-transparent bg-gradient-to-r from-purple-400 to-magenta-400 bg-clip-text mb-2">
                  Password
                </label>
                <input 
                  type="password"
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={(e) => {
                    setFormData(prev => ({ ...prev, password: e.target.value }))
                    if (error) setError('') // Clear error when user types
                  }}
                  className="w-full p-4 bg-black/60 border border-purple-500/30 rounded-lg text-white placeholder-white/60 focus:border-magenta-500 focus:outline-none transition-colors duration-300"
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
              {/* Forgot Password Link */}
              <div className="text-center">
                <button
                  type="button"
                  onClick={async () => {
                    if (!formData.identifier.trim()) {
                      setError('Please enter your email address first')
                      return
                    }
                    
                    let email = formData.identifier.trim()
                    
                    // If identifier is username, look up email
                    if (!email.includes('@')) {
                      try {
                        const user = await SupabaseUserManager.getUserByUsername(email)
                        if (!user) {
                          setError('Username not found. Please check your username.')
                          return
                        }
                        email = user.email
                      } catch (error) {
                        setError('Error looking up account. Please try again.')
                        return
                      }
                    }
                    
                    // Send password reset
                    const resetResult = await SupabaseAuthManager.resetPassword(email)
                    if (resetResult.success) {
                      setError(`Password reset email sent to ${email}`)
                    } else {
                      setError(resetResult.error || 'Failed to send password reset email')
                    }
                  }}
                  className="text-sm text-gray-400 hover:text-purple-400 transition-colors"
                  disabled={isLoading}
                >
                  Forgot your password?
                </button>
              </div>

              {/* Submit Button */}
              <motion.button 
                type="submit"
                disabled={isLoading || !formData.identifier.trim() || !formData.password.trim()}
                className={`w-full p-4 rounded-lg font-bold text-xl transition-all duration-300 ease-out ${
                  isLoading || !formData.identifier.trim() || !formData.password.trim()
                    ? 'bg-gray-600 cursor-not-allowed opacity-50' 
                    : 'bg-gradient-to-r from-purple-600 via-magenta-600 to-pink-600 hover:from-purple-700 hover:via-magenta-700 hover:to-pink-700'
                }`}
                whileHover={!isLoading && formData.identifier.trim() && formData.password.trim() ? { 
                  scale: 1.02
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
                  className="text-transparent bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text font-semibold hover:from-purple-300 hover:to-magenta-300"
                >
                  Take the confidence test
                </button>
              </p>
            </div>

          </motion.div>
        </div>
      </div>
    </div>
  )
}