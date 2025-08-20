'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { ArrowLeft, Loader2, Eye, EyeOff } from 'lucide-react'
import { SupabaseAuthManager } from '@/lib/supabase'

export default function ResetPasswordPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isSetup, setIsSetup] = useState(false)

  useEffect(() => {
    // Check if this is initial password setup or password reset
    const flow = searchParams.get('flow')
    setIsSetup(flow === 'setup')
    
    // Check if we have a valid session
    const checkSession = async () => {
      const session = await SupabaseAuthManager.getCurrentSession()
      if (!session) {
        if (flow === 'setup') {
          setError('Session expired. Please sign up again.')
        } else {
          setError('Invalid or expired reset link. Please request a new password reset.')
        }
      }
    }

    checkSession()
  }, [searchParams])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!password.trim()) {
      setError('Please enter a new password')
      return
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters long')
      return
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    setIsLoading(true)
    setError('')

    try {
      const result = await SupabaseAuthManager.updatePassword(password)
      
      if (!result.success) {
        setError(result.error || 'Failed to update password')
        return
      }

      setSuccess(true)
      
      // Redirect based on flow type
      setTimeout(() => {
        if (isSetup) {
          // Initial password setup - go to dashboard
          router.push('/dashboard')
        } else {
          // Password reset - go to login
          router.push('/login?message=password-updated')
        }
      }, 3000)

    } catch (error: any) {
      console.error('Password update error:', error)
      setError(error.message || 'Failed to update password. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white flex items-center justify-center">
        <div className="max-w-md mx-auto text-center px-6">
          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-8"
          >
            <div className="text-6xl mb-4">🎉</div>
            <h1 className="text-3xl font-bold mb-4 bg-gradient-to-r from-green-500 via-emerald-500 to-teal-500 bg-clip-text text-transparent">
              {isSetup ? 'Welcome to AlphaRise!' : 'Password Updated!'}
            </h1>
            <p className="text-gray-400 mb-6">
              {isSetup 
                ? 'Your account setup is complete. Welcome to your confidence journey!' 
                : 'Your password has been successfully updated. You can now sign in with your new password.'
              }
            </p>
            <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
              <span>{isSetup ? 'Redirecting to dashboard' : 'Redirecting to login'}</span>
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce delay-100"></div>
                <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce delay-200"></div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white">
      {/* Header */}
      <header className="p-6 flex items-center justify-between">
        <button
          onClick={() => router.push('/login')}
          className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Login</span>
        </button>
        <div className="text-2xl font-black text-white">
          AlphaRise
        </div>
      </header>

      <div className="container mx-auto px-6 py-12">
        <div className="max-w-md mx-auto">
          {/* Header */}
          <motion.div 
            className="text-center mb-8"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="text-5xl mb-4">🔑</div>
            <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-purple-500 via-magenta-500 to-pink-500 bg-clip-text text-transparent">
              {isSetup ? 'Set Your Password' : 'Set New Password'}
            </h1>
            <p className="text-gray-400">
              {isSetup ? 'Complete your AlphaRise account setup' : 'Choose a strong password for your AlphaRise account'}
            </p>
          </motion.div>

          {/* Reset Form */}
          <motion.div 
            className="bg-black/30 backdrop-blur-sm border border-purple-500/20 rounded-2xl p-8"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* New Password Field */}
              <div>
                <label className="block text-sm font-semibold text-transparent bg-gradient-to-r from-purple-400 to-magenta-400 bg-clip-text mb-2">
                  New Password
                </label>
                <div className="relative">
                  <input 
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter your new password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full p-4 pr-12 bg-black/60 border border-purple-500/30 rounded-lg text-white placeholder-white/60 focus:border-magenta-500 focus:outline-none transition-colors duration-300"
                    required
                    disabled={isLoading}
                    minLength={8}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Must be at least 8 characters long
                </p>
              </div>

              {/* Confirm Password Field */}
              <div>
                <label className="block text-sm font-semibold text-transparent bg-gradient-to-r from-purple-400 to-magenta-400 bg-clip-text mb-2">
                  Confirm Password
                </label>
                <div className="relative">
                  <input 
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="Confirm your new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full p-4 pr-12 bg-black/60 border border-purple-500/30 rounded-lg text-white placeholder-white/60 focus:border-magenta-500 focus:outline-none transition-colors duration-300"
                    required
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                  >
                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
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
                disabled={isLoading || !password.trim() || !confirmPassword.trim()}
                className={`w-full p-4 rounded-lg font-bold text-xl transition-all duration-300 ease-out ${
                  isLoading || !password.trim() || !confirmPassword.trim()
                    ? 'bg-gray-600 cursor-not-allowed opacity-50' 
                    : 'bg-gradient-to-r from-purple-600 via-magenta-600 to-pink-600 hover:from-purple-700 hover:via-magenta-700 hover:to-pink-700'
                }`}
                whileHover={!isLoading && password.trim() && confirmPassword.trim() ? { 
                  scale: 1.02
                } : {}}
                whileTap={{ scale: 0.98 }}
              >
                {isLoading ? (
                  <div className="flex items-center justify-center gap-3">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Updating Password...
                  </div>
                ) : (
                  isSetup ? "SET PASSWORD & CONTINUE" : "UPDATE PASSWORD"
                )}
              </motion.button>
            </form>

            {/* Security Note */}
            <div className="text-center mt-6">
              <p className="text-xs text-gray-500">
                🔒 Your password is encrypted and secure. We never store or share your credentials.
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}