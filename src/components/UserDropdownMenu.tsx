'use client'

import { motion } from 'framer-motion'
import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { User, Settings, BarChart3, CreditCard, LogOut, ChevronDown, Coins } from 'lucide-react'
import { SupabaseAuthManager } from '@/lib/supabase'

interface DbUser {
  id: string
  username: string
  email: string
  coach?: string
  current_plan?: string
  coins?: number
}

interface UserDropdownMenuProps {
  user: DbUser | null
  userCoins?: number
}

export default function UserDropdownMenu({ user, userCoins }: UserDropdownMenuProps) {
  const [showUserDropdown, setShowUserDropdown] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const router = useRouter()

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowUserDropdown(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  const handleSignOut = async () => {
    try {
      await SupabaseAuthManager.signOut()
      router.push('/signin')
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  const menuItems = [
    {
      icon: User,
      label: 'Profile',
      href: '/profile',
      color: 'text-gray-300 hover:text-white'
    },
    {
      icon: Settings,
      label: 'Settings',
      href: '/settings',
      color: 'text-gray-300 hover:text-white'
    },
    {
      icon: BarChart3,
      label: 'Analytics',
      href: '/analytics',
      color: 'text-gray-300 hover:text-white'
    },
    {
      icon: CreditCard,
      label: 'Billing',
      href: '/billing',
      color: 'text-gray-300 hover:text-white'
    }
  ]

  if (!user) return null

  return (
    <div className="flex items-center gap-4">
      {/* Coins Display */}
      <div className="bg-gradient-to-r from-yellow-500/20 to-amber-500/20 text-white px-3 py-1 rounded-full text-sm font-semibold flex items-center gap-1 border border-yellow-500/30">
        <Coins className="w-4 h-4" />
        {userCoins || user?.coins || 0}
      </div>

      {/* User Profile Dropdown */}
      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => setShowUserDropdown(!showUserDropdown)}
          className="flex items-center gap-3 bg-gray-800/50 hover:bg-gray-700/50 px-4 py-2 rounded-xl border border-gray-600/30 hover:border-purple-500/30 transition-all"
        >
          {/* User Avatar */}
          <div className="w-8 h-8 rounded-full overflow-hidden">
            <img
              src={`/avatars/${user?.coach || 'logan'}.png`}
              alt={`Coach ${user?.coach || 'logan'}`}
              className="w-full h-full object-cover"
            />
          </div>
          
          {/* User Info */}
          <div className="text-left hidden md:block">
            <div className="text-sm font-semibold text-white">{user?.username || 'User'}</div>
            <div className={`text-xs font-semibold ${user?.current_plan === 'premium' ? 'text-green-400' : 'text-orange-400'}`}>
              {user?.current_plan === 'premium' ? '💎 Premium' : '⚡ Trial'}
            </div>
          </div>
          
          <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${showUserDropdown ? 'rotate-180' : ''}`} />
        </button>

        {/* Dropdown Menu */}
        {showUserDropdown && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="absolute right-0 mt-2 w-64 bg-gray-800/95 backdrop-blur border border-gray-600/30 rounded-xl shadow-2xl z-50"
          >
            {/* User Info Header */}
            <div className="p-4 border-b border-gray-600/30">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full overflow-hidden">
                  <img
                    src={`/avatars/${user?.coach || 'logan'}.png`}
                    alt={`Coach ${user?.coach || 'logan'}`}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <div className="font-semibold text-white">{user?.username || 'User'}</div>
                  <div className="text-sm text-gray-400">{user?.email || 'member@alpharise.app'}</div>
                  <div className={`text-xs font-semibold ${user?.current_plan === 'premium' ? 'text-green-400' : 'text-orange-400'}`}>
                    {user?.current_plan === 'premium' ? '💎 Premium Plan' : '⚡ Trial Plan'}
                  </div>
                </div>
              </div>
            </div>

            {/* Menu Items */}
            <div className="py-2">
              {menuItems.map((item) => {
                const IconComponent = item.icon
                return (
                  <button
                    key={item.label}
                    onClick={() => {
                      router.push(item.href)
                      setShowUserDropdown(false)
                    }}
                    className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-700/50 transition-all ${item.color}`}
                  >
                    <IconComponent className="w-5 h-5" />
                    <span>{item.label}</span>
                  </button>
                )
              })}
              
              {/* Divider */}
              <div className="mx-4 my-2 border-t border-gray-600/30"></div>
              
              {/* Sign Out */}
              <button
                onClick={() => {
                  handleSignOut()
                  setShowUserDropdown(false)
                }}
                className="w-full flex items-center gap-3 px-4 py-3 text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-all"
              >
                <LogOut className="w-5 h-5" />
                <span>Sign Out</span>
              </button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  )
}