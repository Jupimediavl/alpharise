'use client'

import { motion } from 'framer-motion'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { SupabaseUserManager, DbUser, SupabaseAuthManager } from '@/lib/supabase'
import { User, Mail, Calendar, Award, TrendingUp, Coins, Edit3, Save, X, ArrowLeft, Camera } from 'lucide-react'
import Link from 'next/link'
import UserDropdownMenu from '@/components/UserDropdownMenu'

export default function ProfilePage() {
  const router = useRouter()
  const [user, setUser] = useState<DbUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [editForm, setEditForm] = useState({
    username: '',
    email: '',
    coach: 'logan' as 'logan' | 'chase' | 'mason' | 'blake' | 'knox'
  })

  useEffect(() => {
    const loadUser = async () => {
      try {
        // Get current session from Supabase Auth
        const session = await SupabaseAuthManager.getCurrentSession()
        if (!session || !session.user) {
          console.log('No valid session, redirecting to login...')
          router.push('/login')
          return
        }
        
        // Get user profile from our users table using the email
        const userData = await SupabaseUserManager.getUserByEmail(session.user.email!)
        if (!userData) {
          console.error('User profile not found for:', session.user.email)
          router.push('/signup')
          return
        }
        
        if (userData) {
          setUser(userData)
          setEditForm({
            username: userData.username,
            email: userData.email,
            coach: userData.coach || 'logan' // Use coach field instead
          })
        } else {
          router.push('/login')
        }
      } catch (error) {
        console.error('Error loading user:', error)
        router.push('/login')
      } finally {
        setIsLoading(false)
      }
    }

    loadUser()
  }, [router])

  const handleSave = async () => {
    if (!user) return
    
    try {
      const updated = await SupabaseUserManager.upsertUser({
        ...user,
        username: editForm.username,
        email: editForm.email,
        coach: editForm.coach
      })
      
      if (updated) {
        setUser(updated)
        setIsEditing(false)
        // Update localStorage if username changed
        if (editForm.username !== user.username) {
          localStorage.setItem('username', editForm.username)
        }
      }
    } catch (error) {
      console.error('Error updating profile:', error)
    }
  }

  // NEW COACH SYSTEM - Coaches who are the SOLUTION to user problems
  const coachOptions = {
    logan: { name: 'Logan', emoji: '🎯', description: 'The Straight Shooter', helpsWith: 'Overthinkers' },
    chase: { name: 'Chase', emoji: '😎', description: 'The Cool Cat', helpsWith: 'Nervous Guys' },
    mason: { name: 'Mason', emoji: '🧑‍🏫', description: 'The Patient Pro', helpsWith: 'Rookies' },
    blake: { name: 'Blake', emoji: '⚡', description: 'The Reliable Guy', helpsWith: 'Up & Down Guys' },
    knox: { name: 'Knox', emoji: '❤️', description: 'The Authentic One', helpsWith: 'Surface Guys' }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">👤</div>
          <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-500 via-magenta-500 to-pink-500 bg-clip-text text-transparent">
            Loading profile...
          </h2>
        </div>
      </div>
    )
  }

  if (!user) return null

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white">
      {/* Header */}
      <div className="border-b border-purple-500/20 p-6">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link 
              href="/dashboard"
              className="p-2 hover:bg-gray-800/50 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-white">Profile</h1>
              <p className="text-gray-400">Manage your account settings</p>
            </div>
          </div>
          
          {!isEditing ? (
            <div className="flex items-center gap-4">
              <button
                onClick={() => setIsEditing(true)}
                className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded-lg transition-colors"
              >
                <Edit3 className="w-4 h-4" />
                Edit Profile
              </button>
              
              <UserDropdownMenu user={user} userCoins={user?.coins || 0} />
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={handleSave}
                className="flex items-center gap-2 bg-green-600 hover:bg-green-700 px-4 py-2 rounded-lg transition-colors"
              >
                <Save className="w-4 h-4" />
                Save
              </button>
              <button
                onClick={() => {
                  setIsEditing(false)
                  setEditForm({
                    username: user.username,
                    email: user.email,
                    coach: user.coach || 'logan'
                  })
                }}
                className="flex items-center gap-2 bg-gray-600 hover:bg-gray-700 px-4 py-2 rounded-lg transition-colors"
              >
                <X className="w-4 h-4" />
                Cancel
              </button>
              
              <UserDropdownMenu user={user} userCoins={user?.coins || 0} />
            </div>
          )}
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-6 space-y-8">
        {/* Profile Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gray-800/50 backdrop-blur border border-gray-700 rounded-2xl p-8"
        >
          <div className="flex flex-col md:flex-row items-center gap-6">
            {/* Avatar */}
            <div className="relative">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-3xl">
                {coachOptions[user.coach || 'logan']?.emoji || '👤'}
              </div>
              {isEditing && (
                <button className="absolute -bottom-2 -right-2 w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center hover:bg-purple-700 transition-colors">
                  <Camera className="w-4 h-4" />
                </button>
              )}
            </div>
            
            {/* User Info */}
            <div className="flex-1 text-center md:text-left">
              {isEditing ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Username</label>
                    <input
                      type="text"
                      value={editForm.username}
                      onChange={(e) => setEditForm({...editForm, username: e.target.value})}
                      className="w-full px-4 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white focus:border-purple-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Email</label>
                    <input
                      type="email"
                      value={editForm.email}
                      onChange={(e) => setEditForm({...editForm, email: e.target.value})}
                      className="w-full px-4 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white focus:border-purple-500 focus:outline-none"
                    />
                  </div>
                </div>
              ) : (
                <>
                  <h2 className="text-3xl font-bold text-white mb-2">{user.username}</h2>
                  <p className="text-gray-400 mb-4">{user.email}</p>
                  <div className="flex flex-wrap justify-center md:justify-start gap-3">
                    <div className="bg-purple-500/20 px-3 py-1 rounded-full text-purple-300 text-sm">
                      Level {1}
                    </div>
                    <div className="bg-yellow-500/20 px-3 py-1 rounded-full text-yellow-300 text-sm">
                      {user.current_plan} Member
                    </div>
                    <div className="bg-green-500/20 px-3 py-1 rounded-full text-green-300 text-sm">
                      {1} Day Streak
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </motion.div>

        {/* Avatar Selection */}
        {isEditing && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gray-800/50 backdrop-blur border border-gray-700 rounded-2xl p-6"
          >
            <h3 className="text-xl font-semibold text-white mb-4">Choose Your Personal Coach</h3>
            <p className="text-gray-400 mb-6">Your coach is designed to help solve your specific challenges</p>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              {Object.entries(coachOptions).map(([key, coach]) => (
                <button
                  key={key}
                  onClick={() => setEditForm({...editForm, coach: key as any})}
                  className={`p-4 rounded-xl border-2 transition-all ${
                    editForm.coach === key
                      ? 'border-purple-500 bg-purple-500/20'
                      : 'border-gray-600 hover:border-gray-500'
                  }`}
                >
                  <div className="text-3xl mb-2">{coach.emoji}</div>
                  <div className="text-sm font-semibold text-white">{coach.name}</div>
                  <div className="text-xs text-gray-400 mb-1">{coach.description}</div>
                  <div className="text-xs text-purple-300">Helps: {coach.helpsWith}</div>
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Coins & Economy */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-gray-800/50 backdrop-blur border border-gray-700 rounded-2xl p-6"
          >
            <div className="flex items-center gap-3 mb-4">
              <Coins className="w-6 h-6 text-yellow-400" />
              <h3 className="text-lg font-semibold text-white">Coins & Economy</h3>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-300">Current Balance</span>
                <span className="text-yellow-400 font-bold">{user.coins}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-300">Total Earned</span>
                <span className="text-yellow-400 font-bold">0</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-300">Monthly Earnings</span>
                <span className="text-yellow-400 font-bold">0</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-300">Discount Earned</span>
                <span className="text-white font-bold">0%</span>
              </div>
            </div>
          </motion.div>

          {/* Progress & Level */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-gray-800/50 backdrop-blur border border-gray-700 rounded-2xl p-6"
          >
            <div className="flex items-center gap-3 mb-4">
              <TrendingUp className="w-6 h-6 text-green-400" />
              <h3 className="text-lg font-semibold text-white">Progress</h3>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-300">Level</span>
                <span className="text-green-400 font-bold">{1}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-300">Experience</span>
                <span className="text-green-400 font-bold">{150}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-300">Confidence Score</span>
                <span className="text-green-400 font-bold">{user.confidence_score}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-300">Streak</span>
                <span className="text-blue-400 font-bold">{1} days</span>
              </div>
            </div>
          </motion.div>

          {/* Account Info */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-gray-800/50 backdrop-blur border border-gray-700 rounded-2xl p-6"
          >
            <div className="flex items-center gap-3 mb-4">
              <User className="w-6 h-6 text-purple-400" />
              <h3 className="text-lg font-semibold text-white">Account</h3>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-300">Member Since</span>
                <span className="text-white font-bold">{new Date(user.created_at).toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-300">Subscription</span>
                <span className="text-purple-400 capitalize">{user.current_plan}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-300">Trial Days Left</span>
                <span className="text-white font-bold">{3}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-300">Last Active</span>
                <span className="text-gray-400">{new Date(user.last_active).toLocaleDateString()}</span>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Badges */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-gray-800/50 backdrop-blur border border-gray-700 rounded-2xl p-6"
        >
          <div className="flex items-center gap-3 mb-4">
            <Award className="w-6 h-6 text-purple-400" />
            <h3 className="text-lg font-semibold text-white">Badges & Achievements</h3>
          </div>
          <div className="flex flex-wrap gap-3">
            {false ? (
              [].map((badge, index) => (
                <div key={index} className="bg-gradient-to-r from-purple-500/15 to-purple-600/20 border border-purple-500/25 px-4 py-2 rounded-lg">
                  <span className="text-purple-300 font-medium">{badge}</span>
                </div>
              ))
            ) : (
              <p className="text-gray-400">No badges yet. Keep participating to earn your first badge!</p>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  )
}