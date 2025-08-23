'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { SupabaseAuthManager, SupabaseUserManager } from '@/lib/supabase'
import { Loader2 } from 'lucide-react'

export default function AuthCallbackPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [status, setStatus] = useState('processing')
  const [message, setMessage] = useState('Processing authentication...')

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // Get the current session
        const session = await SupabaseAuthManager.getCurrentSession()
        
        if (!session) {
          setStatus('error')
          setMessage('No authentication session found. Please try logging in again.')
          setTimeout(() => router.push('/login'), 3000)
          return
        }

        const authUser = session.user
        console.log('🎉 Auth callback successful:', authUser.email)

        // Check if this is a new user (from Google OAuth or email confirmation)
        let userProfile = await SupabaseUserManager.getUserByEmail(authUser.email!)
        
        if (!userProfile) {
          // New Google user - create profile with default values
          if (authUser.app_metadata?.provider === 'google') {
            console.log('🆕 Creating new Google user profile')
            
            // Extract name from Google data
            const fullName = authUser.user_metadata?.full_name || authUser.user_metadata?.name || 'User'
            const firstName = fullName.split(' ')[0] || 'User'
            
            userProfile = await SupabaseUserManager.upsertUser({
              id: authUser.id,
              username: firstName.toLowerCase() + Math.random().toString(36).substr(2, 4), // Generate unique username
              email: authUser.email,
              coach: 'logan', // Default coach
              age: 25, // Default age
              confidence_score: 50, // Default score
              coins: 200, // Starting coins
              current_plan: 'trial',
              subscription_status: 'trial'
            })
            
            if (!userProfile) {
              throw new Error('Failed to create user profile')
            }
          } else {
            setStatus('error')
            setMessage('User profile not found. Please complete the signup process first.')
            setTimeout(() => router.push('/assessment'), 3000)
            return
          }
        }

        // Store user info in sessionStorage (for compatibility)
        if (typeof window !== 'undefined') {
          sessionStorage.setItem('alpharise_user', JSON.stringify({
            username: userProfile.username,
            email: userProfile.email,
            coach: userProfile.coach,
            age: userProfile.age,
            coins: userProfile.coins,
            created_at: userProfile.created_at,
            confidence_score: userProfile.confidence_score
          }))
        }

        setStatus('success')
        setMessage('Authentication successful! Redirecting to dashboard...')
        
        // Redirect to dashboard
        setTimeout(() => {
          router.push(`/dashboard?welcome=back&username=${encodeURIComponent(userProfile.username)}`)
        }, 1500)

      } catch (error: any) {
        console.error('❌ Auth callback error:', error)
        setStatus('error')
        setMessage(error.message || 'Authentication failed. Please try again.')
        setTimeout(() => router.push('/login'), 3000)
      }
    }

    handleAuthCallback()
  }, [router, searchParams])

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white flex items-center justify-center">
      <div className="text-center max-w-md mx-auto px-6">
        <div className="mb-8">
          {status === 'processing' && (
            <div className="text-6xl mb-4">
              <Loader2 className="w-16 h-16 animate-spin mx-auto text-purple-400" />
            </div>
          )}
          {status === 'success' && (
            <div className="text-6xl mb-4">✅</div>
          )}
          {status === 'error' && (
            <div className="text-6xl mb-4">❌</div>
          )}
        </div>

        <h1 className="text-2xl font-bold mb-4 bg-gradient-to-r from-purple-500 via-magenta-500 to-pink-500 bg-clip-text text-transparent">
          {status === 'processing' && 'Completing Authentication'}
          {status === 'success' && 'Welcome to AlphaRise!'}
          {status === 'error' && 'Authentication Failed'}
        </h1>

        <p className="text-gray-400 mb-6">
          {message}
        </p>

        {status === 'processing' && (
          <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
            <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce"></div>
            <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce delay-100"></div>
            <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce delay-200"></div>
          </div>
        )}

        {status === 'error' && (
          <button
            onClick={() => router.push('/login')}
            className="px-6 py-3 bg-purple-600 hover:bg-purple-700 rounded-lg font-semibold transition-colors"
          >
            Back to Login
          </button>
        )}
      </div>
    </div>
  )
}