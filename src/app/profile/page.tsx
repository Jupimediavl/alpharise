'use client'

import { motion } from 'framer-motion'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { SupabaseUserManager, DbUser } from '@/lib/supabase'
import { User, Mail, Calendar, Award, TrendingUp, Coins, Edit3, Save, X, ArrowLeft, Camera } from 'lucide-react'
import Link from 'next/link'

export default function ProfilePage() {
  const router = useRouter()
  const [user, setUser] = useState<DbUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [editForm, setEditForm] = useState({
    username: '',
    email: '',
    avatar_type: 'marcus' as 'marcus' | 'jake' | 'alex' | 'ryan' | 'ethan'
  })

  useEffect(() => {
    const loadUser = async () => {
      try {
        // Get username from localStorage or URL params
        const username = localStorage.getItem('username') || 'testuser1'
        const userData = await SupabaseUserManager.getUserByUsername(username)
        
        if (userData) {
          setUser(userData)
          setEditForm({
            username: userData.username,
            email: userData.email,
            avatar_type: userData.avatar_type
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
        avatar_type: editForm.avatar_type
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

  const avatarOptions = {
    marcus: { name: 'Marcus', emoji: '🧠', description: 'The Analytical Strategist' },
    alex: { name: 'Alex', emoji: '📚', description: 'The Learning Mentor' },
    ryan: { name: 'Ryan', emoji: '💎', description: 'The Motivational Coach' },
    jake: { name: 'Jake', emoji: '⚡', description: 'The Performance Expert' },
    ethan: { name: 'Ethan', emoji: '❤️', description: 'The Connection Specialist' }
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
            <button
              onClick={() => setIsEditing(true)}
              className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded-lg transition-colors"
            >
              <Edit3 className="w-4 h-4" />
              Edit Profile
            </button>
          ) : (
            <div className="flex gap-2">
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
                    avatar_type: user.avatar_type
                  })
                }}
                className="flex items-center gap-2 bg-gray-600 hover:bg-gray-700 px-4 py-2 rounded-lg transition-colors"
              >
                <X className="w-4 h-4" />
                Cancel
              </button>
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
                {avatarOptions[user.avatar_type]?.emoji || '👤'}
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
                      Level {user.level}
                    </div>
                    <div className="bg-yellow-500/20 px-3 py-1 rounded-full text-yellow-300 text-sm">
                      {user.subscription_type} Member
                    </div>
                    <div className="bg-green-500/20 px-3 py-1 rounded-full text-green-300 text-sm">
                      {user.streak} Day Streak
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
            <h3 className="text-xl font-semibold text-white mb-4">Choose Your Avatar Coach</h3>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              {Object.entries(avatarOptions).map(([key, avatar]) => (
                <button
                  key={key}
                  onClick={() => setEditForm({...editForm, avatar_type: key as any})}
                  className={`p-4 rounded-xl border-2 transition-all ${
                    editForm.avatar_type === key
                      ? 'border-purple-500 bg-purple-500/20'
                      : 'border-gray-600 hover:border-gray-500'
                  }`}
                >
                  <div className="text-3xl mb-2">{avatar.emoji}</div>
                  <div className="text-sm font-semibold text-white">{avatar.name}</div>
                  <div className="text-xs text-gray-400">{avatar.description}</div>
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
                <span className="text-yellow-400 font-semibold">{user.coins}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-300">Total Earned</span>
                <span className="text-green-400">{user.total_earned}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-300">Monthly Earnings</span>
                <span className="text-blue-400">{user.monthly_earnings}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-300">Discount Earned</span>
                <span className="text-purple-400">{user.discount_earned}%</span>
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
              <TrendingUp className="w-6 h-6 text-purple-400" />
              <h3 className="text-lg font-semibold text-white">Progress</h3>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-300">Level</span>
                <span className="text-purple-400 font-semibold">{user.level}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-300">Experience</span>
                <span className="text-blue-400">{user.experience}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-300">Confidence Score</span>
                <span className="text-green-400">{user.confidence_score}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-300">Streak</span>
                <span className="text-orange-400">{user.streak} days</span>
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
              <User className="w-6 h-6 text-blue-400" />
              <h3 className="text-lg font-semibold text-white">Account</h3>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-300">Member Since</span>
                <span className="text-blue-400">{new Date(user.created_at).toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-300">Subscription</span>
                <span className="text-purple-400 capitalize">{user.subscription_type}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-300">Trial Days Left</span>
                <span className="text-yellow-400">{user.trial_days_left}</span>
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
            <Award className="w-6 h-6 text-yellow-400" />
            <h3 className="text-lg font-semibold text-white">Badges & Achievements</h3>
          </div>
          <div className="flex flex-wrap gap-3">
            {user.badges && user.badges.length > 0 ? (
              user.badges.map((badge, index) => (
                <div key={index} className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-500/30 px-4 py-2 rounded-lg">
                  <span className="text-yellow-400 font-medium">{badge}</span>
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