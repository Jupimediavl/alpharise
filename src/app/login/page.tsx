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
  const [showForgotPassword, setShowForgotPassword] = useState(false)
  const [resetEmail, setResetEmail] = useState('')
  const [resetMessage, setResetMessage] = useState('')

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

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!resetEmail.trim()) {
      setResetMessage('Please enter your email address')
      return
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(resetEmail)) {
      setResetMessage('Please enter a valid email address')
      return
    }

    setIsLoading(true)
    setResetMessage('')

    try {
      // Send password reset - don't check if user exists for security
      const resetResult = await SupabaseAuthManager.resetPassword(resetEmail.trim())
      
      // Always show the same message regardless of whether user exists or not
      setResetMessage('If an account exists with this email address, you will receive a password reset link shortly.')
      setResetEmail('')
    } catch (error) {
      // Generic error message that doesn't reveal information
      setResetMessage('If an account exists with this email address, you will receive a password reset link shortly.')
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
                  onClick={() => setShowForgotPassword(true)}
                  className="text-sm text-gray-400 hover:text-purple-400 transition-colors"
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
                  onClick={() => router.push('/coach-selection')}
                  className="text-transparent bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text font-semibold hover:from-purple-300 hover:to-magenta-300"
                >
                  Sign up now
                </button>
              </p>
            </div>

          </motion.div>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {showForgotPassword && (
        <motion.div
          className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowForgotPassword(false)
              setResetEmail('')
              setResetMessage('')
            }
          }}
        >
          <motion.div
            className="bg-gray-900 border border-purple-500/30 rounded-xl p-8 max-w-md w-full"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
          >
            <h2 className="text-2xl font-bold text-white mb-6 text-center">Reset Your Password</h2>
            
            <form onSubmit={handleForgotPassword} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-purple-400 mb-2">
                  Email Address
                </label>
                <input 
                  type="email"
                  placeholder="Enter your email address"
                  value={resetEmail}
                  onChange={(e) => {
                    setResetEmail(e.target.value)
                    if (resetMessage) setResetMessage('')
                  }}
                  className="w-full p-4 bg-black/60 border border-purple-500/30 rounded-lg text-white placeholder-white/60 focus:border-purple-500 focus:outline-none transition-colors duration-300"
                  required
                  disabled={isLoading}
                />
              </div>

              {resetMessage && (
                <motion.div 
                  className="p-4 bg-blue-900/20 border border-blue-500/30 rounded-lg text-blue-400 text-sm"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                >
                  {resetMessage}
                </motion.div>
              )}

              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowForgotPassword(false)
                    setResetEmail('')
                    setResetMessage('')
                  }}
                  className="flex-1 py-3 px-4 border border-gray-600 rounded-lg text-gray-300 hover:bg-gray-700 transition-colors"
                  disabled={isLoading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 px-4 bg-gradient-to-r from-purple-600 to-magenta-600 rounded-lg text-white font-semibold hover:from-purple-500 hover:to-magenta-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={isLoading || !resetEmail.trim()}
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Sending...
                    </div>
                  ) : (
                    'Send Reset Link'
                  )}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </div>
  )
}