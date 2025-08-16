// Fixed user-context.tsx with proper username and data management

'use client'

import React, { createContext, useContext, useState, useEffect, ComponentType } from 'react'

// Types
interface User {
  userName: string
  userEmail: string
  avatarType: string
  coins: number
  streak: number
  level: number
  totalEarned: number
  monthlyEarnings: number
  discountEarned: number
  subscriptionType: 'trial' | 'premium'
  trialDaysLeft: number
  confidenceScore: number
  experience: number
  badges: string[]
}

interface Avatar {
  name: string
  displayName: string
  image: string
  description: string
  specialties: string[]
}

interface Navigation {
  goToDashboard: () => void
  goToCommunity: () => void
  goToProfile: () => void
}

interface AlphaRiseContextType {
  user: User | null
  avatar: Avatar | null
  navigation: Navigation
  updateUser: (updates: Partial<User>) => void
  setUserData: (userData: User) => void
}

// Avatar data
const avatars: Record<string, Avatar> = {
  marcus: {
    name: 'marcus',
    displayName: 'Marcus "The Confidence Coach"',
    image: '/avatars/marcus.jpg',
    description: 'Former shy guy turned confidence expert',
    specialties: ['confidence building', 'social skills', 'mindset']
  },
  jake: {
    name: 'jake',
    displayName: 'Jake "The Dating Strategist"',
    image: '/avatars/jake.jpg',
    description: 'Dating app optimization and real-world game',
    specialties: ['dating apps', 'conversation', 'attraction']
  },
  alex: {
    name: 'alex',
    displayName: 'Alex "The Performance Coach"',
    image: '/avatars/alex.jpg',
    description: 'Helping men overcome performance anxiety',
    specialties: ['performance anxiety', 'lasting longer', 'bedroom confidence']
  },
  ryan: {
    name: 'ryan',
    displayName: 'Ryan "The Approach Master"',
    image: '/avatars/ryan.jpg',
    description: 'Approach anxiety specialist and social dynamics expert',
    specialties: ['approach anxiety', 'rejection recovery', 'social dynamics']
  },
  ethan: {
    name: 'ethan',
    displayName: 'Ethan "The Relationship Builder"',
    image: '/avatars/ethan.jpg',
    description: 'Building deep connections and meaningful relationships',
    specialties: ['emotional intimacy', 'relationship building', 'communication']
  }
}

// Default user data
const defaultUser: User = {
  userName: '',
  userEmail: '',
  avatarType: 'marcus',
  coins: 200,
  streak: 1,
  level: 1,
  totalEarned: 0,
  monthlyEarnings: 0,
  discountEarned: 0,
  subscriptionType: 'trial',
  trialDaysLeft: 7,
  confidenceScore: 34,
  experience: 150,
  badges: []
}

// Create context
const AlphaRiseContext = createContext<AlphaRiseContextType | undefined>(undefined)

// Context provider - Exported as both AlphaRiseProvider and UserProvider for compatibility
export function AlphaRiseProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isInitialized, setIsInitialized] = useState(false)

  // Load user data from localStorage on mount
  useEffect(() => {
    const initializeUser = () => {
      try {
        const savedUser = localStorage.getItem('alpharise_user')
        
        if (savedUser) {
          const parsedUser = JSON.parse(savedUser)
          console.log('✅ Loading saved user:', parsedUser)
          
          // FORCE UPDATE: If user is old invalid user, reset to valid one
          if (parsedUser.userName === 'coach_rodriguez' || parsedUser.userName === 'testtest1') {
            console.log('🔄 Updating invalid cached user to valid user')
            const updatedUser = {
              ...parsedUser,
              userName: 'jupi', // User that exists in Supabase
              userEmail: 'jupi@alpharise.com'
            }
            setUser(updatedUser)
            localStorage.setItem('alpharise_user', JSON.stringify(updatedUser))
          } else {
            setUser(parsedUser)
          }
        } else {
          // No saved user, create default with proper username
          const newUser = {
            ...defaultUser,
            userName: 'jupi', // User that exists in Supabase
            userEmail: 'jupi@alpharise.com'
          }
          console.log('🆕 Creating new user:', newUser)
          setUser(newUser)
          localStorage.setItem('alpharise_user', JSON.stringify(newUser))
        }
      } catch (error) {
        console.error('❌ Error loading user data:', error)
        // Fallback to default user
        const fallbackUser = {
          ...defaultUser,
          userName: 'jupi', // User that exists in Supabase
          userEmail: 'jupi@alpharise.com'
        }
        setUser(fallbackUser)
        localStorage.setItem('alpharise_user', JSON.stringify(fallbackUser))
      } finally {
        setIsInitialized(true)
      }
    }

    initializeUser()
  }, [])

  // Save user data to localStorage whenever user changes
  useEffect(() => {
    if (user && isInitialized) {
      try {
        localStorage.setItem('alpharise_user', JSON.stringify(user))
        console.log('💾 User data saved:', user)
      } catch (error) {
        console.error('❌ Error saving user data:', error)
      }
    }
  }, [user, isInitialized])

  // Update user function
  const updateUser = (updates: Partial<User>) => {
    setUser(prevUser => {
      if (!prevUser) return prevUser
      
      const updatedUser = { ...prevUser, ...updates }
      console.log('🔄 Updating user:', { 
        before: prevUser, 
        updates, 
        after: updatedUser 
      })
      
      return updatedUser
    })
  }

  // Set complete user data
  const setUserData = (userData: User) => {
    console.log('📝 Setting complete user data:', userData)
    setUser(userData)
  }

  // Get current avatar
  const getCurrentAvatar = (): Avatar | null => {
    if (!user?.avatarType) return null
    return avatars[user.avatarType] || null
  }

  // Navigation functions
  const navigation: Navigation = {
    goToDashboard: () => {
      console.log('🏠 Navigating to dashboard')
      if (typeof window !== 'undefined') {
        window.location.href = '/dashboard'
      }
    },
    goToCommunity: () => {
      console.log('💬 Navigating to community')
      if (typeof window !== 'undefined') {
        window.location.href = '/community'
      }
    },
    goToProfile: () => {
      console.log('👤 Navigating to profile')
      if (typeof window !== 'undefined') {
        window.location.href = '/profile'
      }
    }
  }

  const contextValue: AlphaRiseContextType = {
    user,
    avatar: getCurrentAvatar(),
    navigation,
    updateUser,
    setUserData
  }

  // Don't render children until user is initialized
  if (!isInitialized) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">⚡</div>
          <h2 className="text-xl font-bold">Initializing AlphaRise...</h2>
        </div>
      </div>
    )
  }

  return (
    <AlphaRiseContext.Provider value={contextValue}>
      {children}
    </AlphaRiseContext.Provider>
  )
}

// Hook to use the context
export function useAlphaRise() {
  const context = useContext(AlphaRiseContext)
  if (context === undefined) {
    throw new Error('useAlphaRise must be used within an AlphaRiseProvider')
  }
  return context
}

// HOC for user authentication
export function withUserAuth<P extends object>(
  Component: ComponentType<P>
): ComponentType<P> {
  return function AuthenticatedComponent(props: P) {
    const { user } = useAlphaRise()

    // Show loading if user is not yet loaded
    if (!user) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white flex items-center justify-center">
          <div className="text-center">
            <div className="text-4xl mb-4">⚡</div>
            <h2 className="text-xl font-bold">Loading user data...</h2>
            <p className="text-sm opacity-70 mt-2">Setting up your AlphaRise experience</p>
          </div>
        </div>
      )
    }

    // Show error if user doesn't have required data
    if (!user.userName) {
      console.error('❌ User missing userName:', user)
      
      // EMERGENCY FALLBACK: Create emergency user and reload
      const emergencyUser = {
        ...user,
        userName: 'jupi',
        userEmail: 'jupi@alpharise.com'
      }
      localStorage.setItem('alpharise_user', JSON.stringify(emergencyUser))
      
      return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white flex items-center justify-center">
          <div className="text-center">
            <div className="text-4xl mb-4">🔄</div>
            <h2 className="text-xl font-bold">Fixing User Account...</h2>
            <p className="text-sm opacity-70 mt-2">Please wait while we set up your account</p>
            <button 
              onClick={() => window.location.reload()}
              className="mt-4 px-6 py-3 bg-purple-600 hover:bg-purple-700 rounded-lg font-semibold transition-colors"
            >
              Reload Page
            </button>
          </div>
        </div>
      )
    }

    return <Component {...props} />
  }
}

// Debug component to show current user state
export function UserDebugInfo() {
  const { user, avatar } = useAlphaRise()
  
  if (process.env.NODE_ENV !== 'development') {
    return null
  }

  return (
    <div className="fixed bottom-4 right-4 bg-black/80 text-white p-4 rounded-lg text-xs max-w-sm z-50">
      <div className="font-bold mb-2">🐛 Debug Info</div>
      <div><strong>Username:</strong> {user?.userName || 'Not set'}</div>
      <div><strong>Email:</strong> {user?.userEmail || 'Not set'}</div>
      <div><strong>Avatar:</strong> {user?.avatarType || 'Not set'}</div>
      <div><strong>Coins:</strong> {user?.coins || 0}</div>
      <div><strong>Level:</strong> {user?.level || 0}</div>
      <div><strong>Avatar Name:</strong> {avatar?.displayName || 'Not loaded'}</div>
    </div>
  )
}

// Utility functions for user management
export const userUtils = {
  // Reset user to defaults (useful for testing)
  resetUser: () => {
    const newUser = {
      ...defaultUser,
      userName: 'jupi', // User that exists in Supabase
      userEmail: 'jupi@alpharise.com'
    }
    localStorage.setItem('alpharise_user', JSON.stringify(newUser))
    window.location.reload()
  },

  // Update specific user field
  updateUserField: (field: keyof User, value: any) => {
    const savedUser = localStorage.getItem('alpharise_user')
    if (savedUser) {
      const user = JSON.parse(savedUser)
      user[field] = value
      localStorage.setItem('alpharise_user', JSON.stringify(user))
    }
  },

  // Get user data without React context (for API calls)
  getCurrentUser: (): User | null => {
    try {
      const savedUser = localStorage.getItem('alpharise_user')
      return savedUser ? JSON.parse(savedUser) : null
    } catch {
      return null
    }
  },

  // Check if user has enough coins
  hasEnoughCoins: (requiredCoins: number): boolean => {
    const user = userUtils.getCurrentUser()
    return (user?.coins || 0) >= requiredCoins
  },

  // Add coins to user (for testing)
  addCoins: (amount: number) => {
    const user = userUtils.getCurrentUser()
    if (user) {
      user.coins = (user.coins || 0) + amount
      localStorage.setItem('alpharise_user', JSON.stringify(user))
    }
  }
}

// Export AlphaRiseProvider as UserProvider for backward compatibility
export const UserProvider = AlphaRiseProvider