'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { ArrowLeft, Eye, EyeOff } from 'lucide-react'
import { SupabaseAuthManager } from '@/lib/supabase'
import Head from 'next/head'

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

  const getPasswordStrength = (password: string) => {
    let strength = 0
    if (password.length >= 8) strength += 1
    if (/[A-Z]/.test(password)) strength += 1
    if (/[a-z]/.test(password)) strength += 1
    if (/[0-9]/.test(password)) strength += 1
    if (/[^A-Za-z0-9]/.test(password)) strength += 1
    return strength
  }

  const passwordStrength = getPasswordStrength(password)
  const getStrengthColor = () => {
    if (passwordStrength <= 1) return '#ef4444'
    if (passwordStrength <= 2) return '#f59e0b'
    if (passwordStrength <= 3) return '#eab308'
    if (passwordStrength <= 4) return '#22c55e'
    return '#10b981'
  }

  const getStrengthLabel = () => {
    if (passwordStrength <= 1) return 'Weak'
    if (passwordStrength <= 2) return 'Fair'
    if (passwordStrength <= 3) return 'Good'
    if (passwordStrength <= 4) return 'Strong'
    return 'Very Strong'
  }

  if (success) {
    return (
      <>
        <Head>
          <title>Password Updated | AlphaRise</title>
        </Head>
        <div className="min-h-screen bg-black text-white flex items-center justify-center relative overflow-hidden">
          {/* Background Effects */}
          <div className="absolute inset-0 opacity-40">
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full filter blur-[128px]" />
            <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-gradient-to-br from-blue-600 to-green-500 rounded-full filter blur-[128px]" />
          </div>

          <div className="max-w-md mx-auto px-6 relative z-10">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6 }}
              className="text-center"
            >
              <div className="text-6xl mb-6">🎉</div>
              <h1 className="text-3xl font-bold mb-4 bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
                {isSetup ? 'Welcome to AlphaRise!' : 'Password Updated!'}
              </h1>
              <p className="text-gray-300 mb-8 text-lg">
                {isSetup 
                  ? 'Your account setup is complete. Welcome to your confidence journey!' 
                  : 'Your password has been successfully updated. You can now sign in with your new password.'
                }
              </p>
              <div className="flex items-center justify-center gap-2 text-sm text-gray-400">
                <span>{isSetup ? 'Redirecting to dashboard' : 'Redirecting to login'}</span>
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-bounce delay-100"></div>
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-bounce delay-200"></div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      <Head>
        <title>{isSetup ? 'Set Your Password' : 'Reset Password'} | AlphaRise</title>
      </Head>
      <div className="min-h-screen bg-black text-white relative overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0 opacity-40">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-gradient-to-br from-purple-600 to-pink-600 rounded-full filter blur-[128px]" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full filter blur-[128px]" />
        </div>

        {/* Header */}
        <header className="relative z-10 p-6 flex justify-between items-center">
          <button
            onClick={() => router.push('/login')}
            className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Login</span>
          </button>
          
          <div className="text-2xl font-bold">
            <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              AlphaRise
            </span>
          </div>

          <div className="w-24"></div> {/* Spacer for center alignment */}
        </header>

        <div className="relative z-10 px-6 py-12">
          <div className="max-w-md mx-auto">
            
            {/* Header */}
            <motion.div 
              className="text-center mb-12"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="text-5xl mb-6">🔑</div>
              <h1 className="text-3xl font-bold mb-4">
                <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                  {isSetup ? 'Set Your Password' : 'Create New Password'}
                </span>
              </h1>
              <p className="text-gray-300 text-lg">
                {isSetup ? 'Complete your AlphaRise account setup' : 'Choose a strong password for your account'}
              </p>
            </motion.div>

            {/* Reset Form */}
            <motion.div 
              className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <form onSubmit={handleSubmit} className="space-y-6">
                
                {/* New Password Field */}
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">
                    New Password
                  </label>
                  <div className="relative">
                    <input 
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Enter your new password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full px-4 py-3 pr-12 bg-black/60 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 transition-colors"
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
                  
                  {/* Password Strength Indicator */}
                  {password && (
                    <div className="mt-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-medium text-gray-400">Password Strength</span>
                        <span className="text-xs font-semibold" style={{ color: getStrengthColor() }}>
                          {getStrengthLabel()}
                        </span>
                      </div>
                      <div className="w-full bg-gray-700 rounded-full h-2">
                        <div
                          className="h-2 rounded-full transition-all duration-300"
                          style={{
                            width: `${(passwordStrength / 5) * 100}%`,
                            backgroundColor: getStrengthColor()
                          }}
                        ></div>
                      </div>
                      <div className="mt-3 text-xs text-gray-400 space-y-1">
                        <div className="grid grid-cols-2 gap-2">
                          <div className={`flex items-center gap-1 ${password.length >= 8 ? 'text-green-400' : 'text-gray-500'}`}>
                            <div className={`w-2 h-2 rounded-full ${password.length >= 8 ? 'bg-green-400' : 'bg-gray-600'}`}></div>
                            <span>8+ characters</span>
                          </div>
                          <div className={`flex items-center gap-1 ${/[A-Z]/.test(password) ? 'text-green-400' : 'text-gray-500'}`}>
                            <div className={`w-2 h-2 rounded-full ${/[A-Z]/.test(password) ? 'bg-green-400' : 'bg-gray-600'}`}></div>
                            <span>Uppercase</span>
                          </div>
                          <div className={`flex items-center gap-1 ${/[0-9]/.test(password) ? 'text-green-400' : 'text-gray-500'}`}>
                            <div className={`w-2 h-2 rounded-full ${/[0-9]/.test(password) ? 'bg-green-400' : 'bg-gray-600'}`}></div>
                            <span>Number</span>
                          </div>
                          <div className={`flex items-center gap-1 ${/[^A-Za-z0-9]/.test(password) ? 'text-green-400' : 'text-gray-500'}`}>
                            <div className={`w-2 h-2 rounded-full ${/[^A-Za-z0-9]/.test(password) ? 'bg-green-400' : 'bg-gray-600'}`}></div>
                            <span>Symbol</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Confirm Password Field */}
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <input 
                      type={showConfirmPassword ? 'text' : 'password'}
                      placeholder="Confirm your new password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className={`w-full px-4 py-3 pr-12 bg-black/60 border rounded-xl text-white placeholder-gray-400 focus:outline-none transition-colors ${
                        confirmPassword && password !== confirmPassword
                          ? 'border-red-500 focus:border-red-400'
                          : confirmPassword && password === confirmPassword
                          ? 'border-green-500 focus:border-green-400'
                          : 'border-white/20 focus:border-purple-500'
                      }`}
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
                  {confirmPassword && password !== confirmPassword && (
                    <p className="text-xs text-red-400 mt-2">Passwords do not match</p>
                  )}
                  {confirmPassword && password === confirmPassword && (
                    <p className="text-xs text-green-400 mt-2">✓ Passwords match</p>
                  )}
                </div>

                {/* Error Message */}
                {error && (
                  <motion.div 
                    className={`p-4 border rounded-lg text-center ${
                      error.includes('🎉') 
                        ? 'bg-green-500/20 border-green-500/30 text-green-400'
                        : 'bg-red-500/20 border-red-500/30 text-red-400'
                    }`}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                  >
                    {error}
                  </motion.div>
                )}

                {/* Submit Button */}
                <button 
                  type="submit"
                  disabled={isLoading || !password.trim() || !confirmPassword.trim() || password !== confirmPassword}
                  className={`w-full p-4 rounded-xl font-semibold text-lg transition-all ${
                    isLoading || !password.trim() || !confirmPassword.trim() || password !== confirmPassword
                      ? 'bg-gray-600 cursor-not-allowed opacity-50' 
                      : 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 transform hover:scale-105'
                  }`}
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Updating Password...
                    </div>
                  ) : (
                    isSetup ? "Set Password & Continue" : "Update Password"
                  )}
                </button>
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
    </>
  )
}