'use client'

import { motion } from 'framer-motion'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { SupabaseUserManager, DbUser } from '@/lib/supabase'
import { Settings, ArrowLeft, Bell, Shield, Palette, Moon, Sun, Volume2, VolumeX, Save, Eye, EyeOff, Globe, Smartphone } from 'lucide-react'
import Link from 'next/link'

export default function SettingsPage() {
  const router = useRouter()
  const [user, setUser] = useState<DbUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  
  // Settings state
  const [settings, setSettings] = useState({
    // Notifications
    notifications: {
      email: true,
      push: true,
      sms: false,
      marketing: false,
      weeklyDigest: true,
      newAnswers: true,
      coinRewards: true
    },
    
    // Privacy
    privacy: {
      profileVisible: true,
      showCoins: true,
      showLevel: true,
      showStreak: false,
      allowDirectMessages: true,
      showOnlineStatus: false
    },
    
    // Appearance
    appearance: {
      theme: 'dark' as 'light' | 'dark' | 'auto',
      fontSize: 'medium' as 'small' | 'medium' | 'large',
      animations: true,
      compactMode: false
    },
    
    // Accessibility
    accessibility: {
      soundEffects: true,
      reducedMotion: false,
      highContrast: false,
      screenReader: false
    },
    
    // Language & Region
    language: {
      locale: 'en-US',
      timezone: 'auto',
      dateFormat: 'MM/DD/YYYY',
      numberFormat: 'US'
    }
  })

  useEffect(() => {
    const loadUser = async () => {
      try {
        const username = localStorage.getItem('username') || 'testuser1'
        const userData = await SupabaseUserManager.getUserByUsername(username)
        
        if (userData) {
          setUser(userData)
          // Load saved settings from localStorage
          const savedSettings = localStorage.getItem('userSettings')
          if (savedSettings) {
            setSettings({...settings, ...JSON.parse(savedSettings)})
          }
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

  const handleSave = () => {
    // Save settings to localStorage
    localStorage.setItem('userSettings', JSON.stringify(settings))
    
    // You could also save to database here
    alert('Settings saved successfully!')
  }

  const SettingToggle = ({ 
    label, 
    description, 
    checked, 
    onChange 
  }: { 
    label: string
    description: string
    checked: boolean
    onChange: (checked: boolean) => void 
  }) => (
    <div className="flex items-center justify-between p-4 bg-gray-700/30 rounded-lg hover:bg-gray-700/50 transition-colors">
      <div>
        <div className="font-medium text-white">{label}</div>
        <div className="text-sm text-gray-400">{description}</div>
      </div>
      <button
        onClick={() => onChange(!checked)}
        className={`w-12 h-6 rounded-full transition-colors ${
          checked ? 'bg-purple-600' : 'bg-gray-600'
        }`}
      >
        <div className={`w-5 h-5 bg-white rounded-full transition-transform ${
          checked ? 'translate-x-6' : 'translate-x-0.5'
        }`} />
      </button>
    </div>
  )

  const SettingSelect = ({ 
    label, 
    description, 
    value, 
    options, 
    onChange 
  }: { 
    label: string
    description: string
    value: string
    options: { value: string; label: string }[]
    onChange: (value: string) => void 
  }) => (
    <div className="p-4 bg-gray-700/30 rounded-lg">
      <div className="mb-3">
        <div className="font-medium text-white">{label}</div>
        <div className="text-sm text-gray-400">{description}</div>
      </div>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-3 py-2 bg-gray-600/50 border border-gray-500 rounded-lg text-white focus:border-purple-500 focus:outline-none"
      >
        {options.map(option => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  )

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">⚙️</div>
          <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-500 via-magenta-500 to-pink-500 bg-clip-text text-transparent">
            Loading settings...
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
              <h1 className="text-2xl font-bold text-white">Settings</h1>
              <p className="text-gray-400">Customize your AlphaRise experience</p>
            </div>
          </div>
          
          <button
            onClick={handleSave}
            className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded-lg transition-colors"
          >
            <Save className="w-4 h-4" />
            Save Changes
          </button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-6 space-y-8">
        {/* Notifications */}
        <motion.section 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gray-800/50 backdrop-blur border border-gray-700 rounded-2xl p-6"
        >
          <div className="flex items-center gap-3 mb-6">
            <Bell className="w-6 h-6 text-purple-400" />
            <h2 className="text-xl font-semibold text-white">Notifications</h2>
          </div>
          
          <div className="space-y-4">
            <SettingToggle
              label="Email Notifications"
              description="Receive updates via email"
              checked={settings.notifications.email}
              onChange={(checked) => setSettings({
                ...settings,
                notifications: { ...settings.notifications, email: checked }
              })}
            />
            
            <SettingToggle
              label="Push Notifications"
              description="Browser and mobile push notifications"
              checked={settings.notifications.push}
              onChange={(checked) => setSettings({
                ...settings,
                notifications: { ...settings.notifications, push: checked }
              })}
            />
            
            <SettingToggle
              label="New Answer Alerts"
              description="Get notified when someone answers your questions"
              checked={settings.notifications.newAnswers}
              onChange={(checked) => setSettings({
                ...settings,
                notifications: { ...settings.notifications, newAnswers: checked }
              })}
            />
            
            <SettingToggle
              label="Coin Reward Notifications"
              description="Alerts when you earn or spend coins"
              checked={settings.notifications.coinRewards}
              onChange={(checked) => setSettings({
                ...settings,
                notifications: { ...settings.notifications, coinRewards: checked }
              })}
            />
            
            <SettingToggle
              label="Weekly Digest"
              description="Summary of your weekly activity and progress"
              checked={settings.notifications.weeklyDigest}
              onChange={(checked) => setSettings({
                ...settings,
                notifications: { ...settings.notifications, weeklyDigest: checked }
              })}
            />
          </div>
        </motion.section>

        {/* Privacy */}
        <motion.section 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gray-800/50 backdrop-blur border border-gray-700 rounded-2xl p-6"
        >
          <div className="flex items-center gap-3 mb-6">
            <Shield className="w-6 h-6 text-purple-400" />
            <h2 className="text-xl font-semibold text-white">Privacy & Visibility</h2>
          </div>
          
          <div className="space-y-4">
            <SettingToggle
              label="Profile Visibility"
              description="Allow others to view your profile"
              checked={settings.privacy.profileVisible}
              onChange={(checked) => setSettings({
                ...settings,
                privacy: { ...settings.privacy, profileVisible: checked }
              })}
            />
            
            <SettingToggle
              label="Show Coin Balance"
              description="Display your coins on your public profile"
              checked={settings.privacy.showCoins}
              onChange={(checked) => setSettings({
                ...settings,
                privacy: { ...settings.privacy, showCoins: checked }
              })}
            />
            
            <SettingToggle
              label="Show Level & Progress"
              description="Display your level and progress to others"
              checked={settings.privacy.showLevel}
              onChange={(checked) => setSettings({
                ...settings,
                privacy: { ...settings.privacy, showLevel: checked }
              })}
            />
            
            <SettingToggle
              label="Allow Direct Messages"
              description="Let other users send you private messages"
              checked={settings.privacy.allowDirectMessages}
              onChange={(checked) => setSettings({
                ...settings,
                privacy: { ...settings.privacy, allowDirectMessages: checked }
              })}
            />
          </div>
        </motion.section>

        {/* Appearance */}
        <motion.section 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gray-800/50 backdrop-blur border border-gray-700 rounded-2xl p-6"
        >
          <div className="flex items-center gap-3 mb-6">
            <Palette className="w-6 h-6 text-purple-400" />
            <h2 className="text-xl font-semibold text-white">Appearance & Display</h2>
          </div>
          
          <div className="space-y-4">
            <SettingSelect
              label="Theme"
              description="Choose your preferred color scheme"
              value={settings.appearance.theme}
              options={[
                { value: 'dark', label: 'Dark' },
                { value: 'light', label: 'Light' },
                { value: 'auto', label: 'Auto (System)' }
              ]}
              onChange={(value) => setSettings({
                ...settings,
                appearance: { ...settings.appearance, theme: value as any }
              })}
            />
            
            <SettingSelect
              label="Font Size"
              description="Adjust text size for better readability"
              value={settings.appearance.fontSize}
              options={[
                { value: 'small', label: 'Small' },
                { value: 'medium', label: 'Medium' },
                { value: 'large', label: 'Large' }
              ]}
              onChange={(value) => setSettings({
                ...settings,
                appearance: { ...settings.appearance, fontSize: value as any }
              })}
            />
            
            <SettingToggle
              label="Animations"
              description="Enable smooth animations and transitions"
              checked={settings.appearance.animations}
              onChange={(checked) => setSettings({
                ...settings,
                appearance: { ...settings.appearance, animations: checked }
              })}
            />
            
            <SettingToggle
              label="Compact Mode"
              description="Use less spacing for a denser layout"
              checked={settings.appearance.compactMode}
              onChange={(checked) => setSettings({
                ...settings,
                appearance: { ...settings.appearance, compactMode: checked }
              })}
            />
          </div>
        </motion.section>

        {/* Accessibility */}
        <motion.section 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-gray-800/50 backdrop-blur border border-gray-700 rounded-2xl p-6"
        >
          <div className="flex items-center gap-3 mb-6">
            <Eye className="w-6 h-6 text-purple-400" />
            <h2 className="text-xl font-semibold text-white">Accessibility</h2>
          </div>
          
          <div className="space-y-4">
            <SettingToggle
              label="Sound Effects"
              description="Play sounds for interactions and notifications"
              checked={settings.accessibility.soundEffects}
              onChange={(checked) => setSettings({
                ...settings,
                accessibility: { ...settings.accessibility, soundEffects: checked }
              })}
            />
            
            <SettingToggle
              label="Reduced Motion"
              description="Minimize animations for motion sensitivity"
              checked={settings.accessibility.reducedMotion}
              onChange={(checked) => setSettings({
                ...settings,
                accessibility: { ...settings.accessibility, reducedMotion: checked }
              })}
            />
            
            <SettingToggle
              label="High Contrast"
              description="Increase contrast for better visibility"
              checked={settings.accessibility.highContrast}
              onChange={(checked) => setSettings({
                ...settings,
                accessibility: { ...settings.accessibility, highContrast: checked }
              })}
            />
          </div>
        </motion.section>

        {/* Language & Region */}
        <motion.section 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-gray-800/50 backdrop-blur border border-gray-700 rounded-2xl p-6"
        >
          <div className="flex items-center gap-3 mb-6">
            <Globe className="w-6 h-6 text-purple-400" />
            <h2 className="text-xl font-semibold text-white">Language & Region</h2>
          </div>
          
          <div className="space-y-4">
            <SettingSelect
              label="Language"
              description="Choose your preferred language"
              value={settings.language.locale}
              options={[
                { value: 'en-US', label: 'English (US)' },
                { value: 'en-GB', label: 'English (UK)' },
                { value: 'es-ES', label: 'Español' },
                { value: 'fr-FR', label: 'Français' },
                { value: 'de-DE', label: 'Deutsch' },
                { value: 'ro-RO', label: 'Română' }
              ]}
              onChange={(value) => setSettings({
                ...settings,
                language: { ...settings.language, locale: value }
              })}
            />
            
            <SettingSelect
              label="Date Format"
              description="How dates are displayed"
              value={settings.language.dateFormat}
              options={[
                { value: 'MM/DD/YYYY', label: 'MM/DD/YYYY (US)' },
                { value: 'DD/MM/YYYY', label: 'DD/MM/YYYY (UK)' },
                { value: 'YYYY-MM-DD', label: 'YYYY-MM-DD (ISO)' }
              ]}
              onChange={(value) => setSettings({
                ...settings,
                language: { ...settings.language, dateFormat: value }
              })}
            />
          </div>
        </motion.section>

        {/* Danger Zone */}
        <motion.section 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-red-500/10 border border-red-500/30 rounded-2xl p-6"
        >
          <h2 className="text-xl font-semibold text-red-400 mb-4">Danger Zone</h2>
          <div className="space-y-4">
            <button className="w-full p-4 bg-red-500/20 hover:bg-red-500/30 border border-red-500/50 rounded-lg text-red-300 transition-colors">
              Reset All Settings to Default
            </button>
            <button className="w-full p-4 bg-red-600/20 hover:bg-red-600/30 border border-red-600/50 rounded-lg text-red-300 transition-colors">
              Delete Account
            </button>
          </div>
        </motion.section>
      </div>
    </div>
  )
}