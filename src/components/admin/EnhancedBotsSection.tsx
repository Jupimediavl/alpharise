'use client'

import { useState, useEffect, useRef } from 'react'
import { 
  Bot, BotIcon, Plus, Edit, Trash2, Play, Pause, Search, 
  Filter, ChevronDown, ChevronUp, Check, X, AlertCircle,
  TrendingUp, MessageSquare, HelpCircle, ThumbsUp, BarChart,
  Settings, RefreshCw, Zap
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  BotManager, 
  PersonalityManager, 
  ScheduleManager,
  Bot as BotType,
  BotPersonality
} from '@/lib/bot-system'
import { BotAutomation } from '@/lib/bot-automation'

export default function EnhancedBotsSection() {
  // State management
  const [bots, setBots] = useState<BotType[]>([])
  const [filteredBots, setFilteredBots] = useState<BotType[]>([])
  const [personalities, setPersonalities] = useState<BotPersonality[]>([])
  const [loading, setLoading] = useState(true)
  const [automationRunning, setAutomationRunning] = useState(false)
  const [automationInterval, setAutomationInterval] = useState(5) // minutes
  const [nextActionCountdown, setNextActionCountdown] = useState(0) // seconds
  
  // Filters & Search
  const [searchTerm, setSearchTerm] = useState('')
  const [typeFilter, setTypeFilter] = useState<'all' | 'questioner' | 'answerer' | 'mixed'>('all')
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'paused'>('all')
  const [activityFilter, setActivityFilter] = useState<'all' | 'low' | 'medium' | 'high'>('all')
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1)
  const [botsPerPage] = useState(20)
  
  // Selection for bulk operations
  const [selectedBots, setSelectedBots] = useState<string[]>([])
  const [bulkAction, setBulkAction] = useState<string>('')
  
  // Modals
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [editingBot, setEditingBot] = useState<BotType | null>(null)
  const [showStatsModal, setShowStatsModal] = useState(false)
  const [showGenerateModal, setShowGenerateModal] = useState(false)
  
  // Edit form state
  const [editFormData, setEditFormData] = useState<any>({})
  
  // Bot generation state
  const [generatingBots, setGeneratingBots] = useState(false)
  const [generateCount, setGenerateCount] = useState(10)
  const [generateType, setGenerateType] = useState<'random' | 'questioner' | 'answerer' | 'mixed'>('random')
  const [generateActivity, setGenerateActivity] = useState(6)
  
  // Load data
  useEffect(() => {
    loadBotData()
    checkAutomationStatus()
    
    // Cleanup is handled by countdown timer useEffect
  }, [])
  
  // Apply filters
  useEffect(() => {
    let filtered = [...bots]
    
    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(bot => 
        bot.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        bot.username.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }
    
    // Type filter
    if (typeFilter !== 'all') {
      filtered = filtered.filter(bot => bot.type === typeFilter)
    }
    
    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(bot => bot.status === statusFilter)
    }
    
    // Activity level filter
    if (activityFilter !== 'all') {
      filtered = filtered.filter(bot => {
        if (activityFilter === 'low') return bot.activity_level <= 3
        if (activityFilter === 'medium') return bot.activity_level >= 4 && bot.activity_level <= 7
        if (activityFilter === 'high') return bot.activity_level >= 8
        return true
      })
    }
    
    setFilteredBots(filtered)
    setCurrentPage(1) // Reset to first page when filters change
  }, [searchTerm, typeFilter, statusFilter, activityFilter, bots])

  // Restore automation state from localStorage on component mount (MUST BE FIRST)
  useEffect(() => {
    // Restore interval setting
    const savedInterval = localStorage.getItem('bot_automation_interval')
    const intervalValue = savedInterval ? parseInt(savedInterval) : 5
    
    console.log('🔄 Restoring automation state:', {
      savedInterval,
      intervalValue,
      isRunning: localStorage.getItem('bot_automation_running') === 'true'
    })
    
    // Restore automation running state
    const isRunning = localStorage.getItem('bot_automation_running') === 'true'
    
    setAutomationInterval(intervalValue)
    setAutomationRunning(isRunning)

    // Restore countdown if automation is running
    if (isRunning) {
      const savedCountdown = localStorage.getItem('bot_automation_countdown')
      const savedTimestamp = localStorage.getItem('bot_automation_timestamp')
      
      if (savedCountdown && savedTimestamp) {
        const timeSinceLastSave = Math.floor((Date.now() - parseInt(savedTimestamp)) / 1000)
        const remainingCountdown = parseInt(savedCountdown) - timeSinceLastSave
        
        console.log('🔄 Restoring countdown:', {
          savedCountdown: parseInt(savedCountdown),
          timeSinceLastSave,
          remainingCountdown
        })
        
        if (remainingCountdown > 0) {
          console.log('✅ Setting restored countdown:', remainingCountdown)
          setNextActionCountdown(remainingCountdown)
        } else {
          // Countdown expired, reset to interval
          console.log('⏰ Countdown expired, resetting to:', intervalValue * 60)
          setNextActionCountdown(intervalValue * 60)
        }
      } else {
        // No saved countdown, use interval
        console.log('🔄 No saved countdown, using interval:', intervalValue * 60)
        setNextActionCountdown(intervalValue * 60)
      }
    } else {
      setNextActionCountdown(0)
    }
  }, [])

  // Countdown timer for next bot action (AFTER RESTORE)
  useEffect(() => {
    console.log('🔄 Countdown timer useEffect triggered:', { automationRunning, nextActionCountdown, automationInterval })
    let interval: NodeJS.Timeout

    if (automationRunning && nextActionCountdown > 0) {
      interval = setInterval(async () => {
        setNextActionCountdown(prev => {
          const willExecute = prev <= 1
          const newValue = willExecute ? automationInterval * 60 : prev - 1
          
          console.log('⏱️ Countdown tick:', {
            prev,
            newValue,
            willExecute,
            automationInterval,
            resetTo: automationInterval * 60
          })
          
          // Execute automation cycle when countdown reaches 0
          if (willExecute) {
            console.log('🚀 Countdown reached 0! Executing automation cycle...')
            // Execute automation cycle asynchronously
            fetch('/api/bots/automation/cycle', { method: 'POST' })
              .then(response => response.json())
              .then(result => {
                console.log('✅ Countdown-triggered automation cycle result:', result)
              })
              .catch(error => {
                console.error('❌ Error in countdown-triggered automation cycle:', error)
              })
          }
          
          // Save countdown and timestamp to localStorage
          localStorage.setItem('bot_automation_countdown', newValue.toString())
          localStorage.setItem('bot_automation_timestamp', Date.now().toString())
          
          return newValue
        })
      }, 1000)
    }

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [automationRunning, nextActionCountdown, automationInterval])
  
  const loadBotData = async () => {
    setLoading(true)
    try {
      const [botsData, personalitiesData] = await Promise.all([
        BotManager.getAllBots(),
        PersonalityManager.getAllPersonalities()
      ])
      setBots(botsData)
      setPersonalities(personalitiesData)
    } catch (error) {
      console.error('Error loading bot data:', error)
    } finally {
      setLoading(false)
    }
  }
  
  const checkAutomationStatus = () => {
    const storedStatus = localStorage.getItem('bot_automation_running')
    const storedInterval = localStorage.getItem('bot_automation_interval')
    
    if (storedStatus === 'true' && storedInterval) {
      const intervalMinutes = parseInt(storedInterval)
      setAutomationRunning(true)
      setAutomationInterval(intervalMinutes)
      
      // Automation will be handled by countdown timer from loadUserSettings
      console.log('🔄 Restoring automation on page load:', intervalMinutes, 'minutes')
      console.log('📖 Loaded interval from localStorage:', storedInterval)
    } else {
      setAutomationRunning(false)
    }
  }
  
  // Pagination logic
  const indexOfLastBot = currentPage * botsPerPage
  const indexOfFirstBot = indexOfLastBot - botsPerPage
  const currentBots = filteredBots.slice(indexOfFirstBot, indexOfLastBot)
  const totalPages = Math.ceil(filteredBots.length / botsPerPage)
  
  // Bulk operations
  const handleSelectAll = () => {
    if (selectedBots.length === currentBots.length) {
      setSelectedBots([])
    } else {
      setSelectedBots(currentBots.map(bot => bot.id))
    }
  }
  
  const handleBulkAction = async () => {
    if (!bulkAction || selectedBots.length === 0) return
    
    const confirmed = confirm(`Apply "${bulkAction}" to ${selectedBots.length} bots?`)
    if (!confirmed) return
    
    try {
      let apiAction: string
      let value: number | string | undefined = undefined

      switch (bulkAction) {
        case 'activate':
          apiAction = 'activate'
          break
        case 'pause':
          apiAction = 'pause'
          break
        case 'delete':
          apiAction = 'delete'
          break
        case 'low-activity':
          apiAction = 'set_activity'
          value = 3
          break
        case 'medium-activity':
          apiAction = 'set_activity'
          value = 6
          break
        case 'high-activity':
          apiAction = 'set_activity'
          value = 9
          break
        default:
          throw new Error('Invalid bulk action')
      }

      // Use bulk API endpoint
      const response = await fetch('/api/bulk-bot-actions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: apiAction,
          botIds: selectedBots,
          value
        })
      })

      const result = await response.json()
      
      if (!result.success) {
        throw new Error(result.error || 'Bulk action failed')
      }
      
      await loadBotData()
      setSelectedBots([])
      setBulkAction('')
      alert(`Bulk action completed successfully! Updated ${result.affected} bots.`)
    } catch (error) {
      console.error('Error performing bulk action:', error)
      alert(`Error performing bulk action: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }
  
  // Handle individual bot update
  const handleUpdateBot = async () => {
    if (!editingBot) return

    try {
      const response = await fetch('/api/bulk-bot-actions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'update_individual',
          botIds: [editingBot.id],
          updateData: {
            name: editFormData.name || editingBot.name,
            username: editFormData.username || editingBot.username,
            type: editFormData.type || editingBot.type,
            status: editFormData.status || editingBot.status,
            activity_level: parseInt(editFormData.activity_level) || editingBot.activity_level,
            expertise_areas: editFormData.expertise_areas ? 
              editFormData.expertise_areas.split(',').map((s: string) => s.trim()) : 
              editingBot.expertise_areas
          }
        })
      })

      const result = await response.json()
      
      if (result.success) {
        alert('Bot updated successfully!')
        await loadBotData()
        setEditingBot(null)
        setEditFormData({})
      } else {
        throw new Error(result.error || 'Update failed')
      }
    } catch (error) {
      console.error('Error updating bot:', error)
      alert(`Error updating bot: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  // Generate bots in bulk
  const handleGenerateBots = async () => {
    if (generateCount < 1 || generateCount > 20) {
      alert('Bot count must be between 1 and 20')
      return
    }
    
    setGeneratingBots(true)
    try {
      const requestBody: any = { count: generateCount }
      
      if (generateType !== 'random') {
        requestBody.type = generateType
      }
      
      if (generateActivity >= 1 && generateActivity <= 10) {
        requestBody.activityLevel = generateActivity
      }
      
      const response = await fetch('/api/generate-bots', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      })
      
      const result = await response.json()
      
      if (result.success) {
        alert(`Successfully generated ${result.count} bots!`)
        await loadBotData()
        setShowGenerateModal(false)
        setGenerateCount(10)
        setGenerateType('random')
        setGenerateActivity(6)
      } else {
        alert(`Failed to generate bots: ${result.error}`)
      }
    } catch (error) {
      console.error('Error generating bots:', error)
      alert('Error generating bots. Please try again.')
    } finally {
      setGeneratingBots(false)
    }
  }

  // Trigger bot action
  const handleTriggerAction = async (botId: string, action: 'question' | 'answer' | 'vote') => {
    try {
      const result = await BotAutomation.triggerBotAction(botId, action)
      if (result.success) {
        alert(`Bot action "${action}" triggered successfully!`)
        await loadBotData()
      } else {
        alert(`Failed: ${result.error}`)
      }
    } catch (error) {
      console.error('Error triggering bot action:', error)
    }
  }

  // Manual trigger - run automation cycle now
  const handleManualTrigger = async () => {
    try {
      console.log('🚀 Manual trigger: Running bot automation cycle...')
      await BotAutomation.runAutomationCycle()
      
      // Reset countdown timer
      setNextActionCountdown(automationInterval * 60)
      
      alert('✅ Bot automation cycle completed!')
      await loadBotData()
    } catch (error) {
      console.error('Error in manual trigger:', error)
      alert('❌ Error running automation cycle')
    }
  }

  // Run all active bots manually (even if automation is stopped)
  const handleRunAllActiveBots = async () => {
    const activeBots = bots.filter(bot => bot.status === 'active')
    if (activeBots.length === 0) {
      alert('No active bots found!')
      return
    }

    if (!confirm(`Run all ${activeBots.length} active bots manually?`)) {
      return
    }

    try {
      console.log(`🤖 Running ${activeBots.length} active bots manually...`)
      await BotAutomation.runAllActiveBotsManually()
      
      alert(`✅ Successfully ran all ${activeBots.length} active bots!`)
      await loadBotData()
    } catch (error) {
      console.error('Error running all bots:', error)
      alert('❌ Error running bots')
    }
  }

  // Format countdown timer
  const formatCountdown = (seconds: number): string => {
    if (seconds <= 0) return '0:00'
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
  }
  
  // Statistics
  const stats = {
    total: bots.length,
    active: bots.filter(b => b.status === 'active').length,
    questioners: bots.filter(b => b.type === 'questioner').length,
    answerers: bots.filter(b => b.type === 'answerer').length,
    mixed: bots.filter(b => b.type === 'mixed').length,
    avgActivity: bots.reduce((sum, b) => sum + b.activity_level, 0) / bots.length || 0,
    totalQuestions: bots.reduce((sum, b) => sum + (b.stats?.questions_posted || 0), 0),
    totalAnswers: bots.reduce((sum, b) => sum + (b.stats?.answers_posted || 0), 0)
  }
  
  return (
    <div className="space-y-6">
      {/* Header with Stats */}
      <div className="bg-gradient-to-r from-emerald-500 to-blue-500 rounded-xl p-6 text-white">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h2 className="text-2xl font-bold mb-2">Bot Management</h2>
            <p className="opacity-90">Manage your community bots and automation</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setShowStatsModal(!showStatsModal)}
              className="px-4 py-2 bg-white/20 rounded-lg hover:bg-white/30 transition-colors flex items-center gap-2"
            >
              <BarChart className="h-4 w-4" />
              Stats
            </button>
            <button
              onClick={() => setShowGenerateModal(true)}
              className="px-4 py-2 bg-blue-500 hover:bg-blue-600 rounded-lg transition-colors flex items-center gap-2"
            >
              <Zap className="h-4 w-4" />
              Generate Bots
            </button>
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-4 py-2 bg-purple-500 hover:bg-purple-600 rounded-lg transition-colors flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Add Bot
            </button>
            <div className="flex items-center gap-2">
              {/* Interval Selector */}
              <select
                value={automationInterval}
                onChange={(e) => {
                  const newInterval = parseInt(e.target.value)
                  console.log('🔄 Changing automation interval:', { 
                    oldInterval: automationInterval, 
                    newInterval, 
                    automationRunning 
                  })
                  
                  setAutomationInterval(newInterval)
                  
                  // Save interval to localStorage
                  localStorage.setItem('bot_automation_interval', newInterval.toString())
                  
                  // If automation is running, restart with new interval
                  if (automationRunning) {
                    console.log('⚡ Restarting automation with new interval:', newInterval * 60, 'seconds')
                    BotAutomation.stop()
                    BotAutomation.start(newInterval)
                    setNextActionCountdown(newInterval * 60)
                    
                    // Save the new countdown immediately
                    localStorage.setItem('bot_automation_countdown', (newInterval * 60).toString())
                    localStorage.setItem('bot_automation_timestamp', Date.now().toString())
                  }
                }}
                className="px-3 py-2 bg-white/20 rounded-lg text-white border-none outline-none"
              >
                <option value={1}>1 min (testing)</option>
                <option value={5}>5 min</option>
                <option value={10}>10 min</option>
                <option value={15}>15 min</option>
                <option value={30}>30 min</option>
                <option value={60}>60 min</option>
              </select>

              <button
                onClick={async () => {
                  if (automationRunning) {
                    // Stop automation
                    setAutomationRunning(false)
                    localStorage.setItem('bot_automation_running', 'false')
                    localStorage.removeItem('bot_automation_countdown')
                    localStorage.removeItem('bot_automation_timestamp')
                    console.log('🛑 Bot automation stopped')
                  } else {
                    // Start automation
                    setAutomationRunning(true)
                    localStorage.setItem('bot_automation_running', 'true')
                    localStorage.setItem('bot_automation_interval', automationInterval.toString())
                    
                    // Initialize countdown timer (do NOT run immediately)
                    console.log('🚀 Starting bot automation...', automationInterval, 'minutes')
                    console.log('📝 Saving interval to localStorage:', automationInterval)
                    console.log('⏰ Setting countdown timer to wait for first execution')
                    
                    // Set countdown to full interval - automation will run AFTER timer expires
                    const initialCountdown = automationInterval * 60
                    setNextActionCountdown(initialCountdown)
                    localStorage.setItem('bot_automation_countdown', initialCountdown.toString())
                    localStorage.setItem('bot_automation_timestamp', Date.now().toString())
                    
                    // The countdown timer will handle automation execution
                    console.log('✅ Automation started successfully - countdown timer will handle execution')
                  }
                }}
                className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${
                  automationRunning 
                    ? 'bg-red-500 hover:bg-red-600' 
                    : 'bg-green-500 hover:bg-green-600'
                }`}
              >
                {automationRunning ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                {automationRunning ? 'Stop' : 'Start'} Automation
              </button>
            </div>
          </div>
        </div>
        
        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white/10 rounded-lg p-3">
            <div className="text-2xl font-bold">{stats.total}</div>
            <div className="text-sm opacity-80">Total Bots</div>
          </div>
          <div className="bg-white/10 rounded-lg p-3">
            <div className="text-2xl font-bold">{stats.active}</div>
            <div className="text-sm opacity-80">Active</div>
          </div>
          <div className="bg-white/10 rounded-lg p-3">
            <div className="text-2xl font-bold">{stats.totalQuestions}</div>
            <div className="text-sm opacity-80">Questions</div>
          </div>
          <div className="bg-white/10 rounded-lg p-3">
            <div className="text-2xl font-bold">{stats.totalAnswers}</div>
            <div className="text-sm opacity-80">Answers</div>
          </div>
        </div>
      </div>

      {/* Bot Automation Controls - Always visible */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {automationRunning && nextActionCountdown > 0 ? (
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                <span className="text-blue-700 font-medium">
                  Next bot action in: <span className="font-mono">{formatCountdown(nextActionCountdown)}</span>
                </span>
              </div>
            ) : (
              <span className="text-gray-600">Automation stopped - Manual controls available</span>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={handleManualTrigger}
              className="px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors flex items-center gap-1 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={nextActionCountdown <= 5 && automationRunning} // Only disable when automation is running and too soon
            >
              <Zap className="w-3 h-3" />
              Trigger Now
            </button>
            
            <button
              onClick={handleRunAllActiveBots}
              className="px-3 py-1 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors flex items-center gap-1 text-sm"
            >
              <RefreshCw className="w-3 h-3" />
              Run All Active ({stats.active})
            </button>
          </div>
        </div>
      </div>
      
      {/* Filters and Search */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <div className="flex flex-wrap gap-4 items-center">
          {/* Search */}
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search bots..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-gray-900 placeholder-gray-500"
              />
            </div>
          </div>
          
          {/* Type Filter */}
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value as any)}
            className="px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 text-gray-900 bg-white"
          >
            <option value="all">All Types</option>
            <option value="questioner">Questioner</option>
            <option value="answerer">Answerer</option>
            <option value="mixed">Mixed</option>
          </select>
          
          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 text-gray-900 bg-white"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="paused">Paused</option>
          </select>
          
          {/* Activity Filter */}
          <select
            value={activityFilter}
            onChange={(e) => setActivityFilter(e.target.value as any)}
            className="px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 text-gray-900 bg-white"
          >
            <option value="all">All Activity</option>
            <option value="low">Low (1-3)</option>
            <option value="medium">Medium (4-7)</option>
            <option value="high">High (8-10)</option>
          </select>
          
          {/* Refresh Button */}
          <button
            onClick={loadBotData}
            className="px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
        </div>
        
        {/* Results count */}
        <div className="mt-3 text-sm text-gray-700">
          Showing {currentBots.length} of {filteredBots.length} bots
          {searchTerm && ` matching "${searchTerm}"`}
        </div>
      </div>
      
      {/* Bulk Operations */}
      {selectedBots.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium text-blue-900">
                {selectedBots.length} bot{selectedBots.length > 1 ? 's' : ''} selected
              </span>
              <select
                value={bulkAction}
                onChange={(e) => setBulkAction(e.target.value)}
                className="px-3 py-1 border border-blue-300 rounded-lg text-sm text-gray-900 bg-white"
              >
                <option value="">Choose action...</option>
                <option value="activate">Activate</option>
                <option value="pause">Pause</option>
                <option value="low-activity">Set Low Activity</option>
                <option value="medium-activity">Set Medium Activity</option>
                <option value="high-activity">Set High Activity</option>
                <option value="delete">Delete</option>
              </select>
              <button
                onClick={handleBulkAction}
                disabled={!bulkAction}
                className="px-4 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
              >
                Apply
              </button>
            </div>
            <button
              onClick={() => setSelectedBots([])}
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              Clear selection
            </button>
          </div>
        </div>
      )}
      
      {/* Bots Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="p-4">
                  <input
                    type="checkbox"
                    checked={selectedBots.length === currentBots.length && currentBots.length > 0}
                    onChange={handleSelectAll}
                    className="rounded border-gray-300"
                  />
                </th>
                <th className="text-left p-4 text-sm font-medium text-gray-700">Bot</th>
                <th className="text-left p-4 text-sm font-medium text-gray-700">Type</th>
                <th className="text-left p-4 text-sm font-medium text-gray-700">Status</th>
                <th className="text-left p-4 text-sm font-medium text-gray-700">Activity</th>
                <th className="text-left p-4 text-sm font-medium text-gray-700">Stats</th>
                <th className="text-left p-4 text-sm font-medium text-gray-700">Quick Actions</th>
                <th className="text-left p-4 text-sm font-medium text-gray-700">Manage</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-gray-500">
                    Loading bots...
                  </td>
                </tr>
              ) : currentBots.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-gray-500">
                    No bots found
                  </td>
                </tr>
              ) : (
                currentBots.map((bot) => (
                  <tr key={bot.id} className="border-b border-gray-50 hover:bg-gray-25">
                    <td className="p-4">
                      <input
                        type="checkbox"
                        checked={selectedBots.includes(bot.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedBots([...selectedBots, bot.id])
                          } else {
                            setSelectedBots(selectedBots.filter(id => id !== bot.id))
                          }
                        }}
                        className="rounded border-gray-300"
                      />
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold ${
                          bot.type === 'questioner' ? 'bg-blue-500' :
                          bot.type === 'answerer' ? 'bg-green-500' :
                          'bg-purple-500'
                        }`}>
                          {bot.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{bot.name}</p>
                          <p className="text-sm text-gray-500">@{bot.username}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        bot.type === 'questioner' ? 'bg-blue-100 text-blue-700' :
                        bot.type === 'answerer' ? 'bg-green-100 text-green-700' :
                        'bg-purple-100 text-purple-700'
                      }`}>
                        {bot.type}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        bot.status === 'active' ? 'bg-green-100 text-green-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {bot.status}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <div className="flex-1">
                          <div className="text-sm font-medium text-gray-900">Level {bot.activity_level}</div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className={`h-2 rounded-full ${
                                bot.activity_level <= 3 ? 'bg-blue-400' :
                                bot.activity_level <= 7 ? 'bg-yellow-400' :
                                'bg-red-400'
                              }`}
                              style={{ width: `${bot.activity_level * 10}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="text-sm space-y-1">
                        <div className="flex items-center gap-2">
                          <MessageSquare className="h-3 w-3 text-gray-400" />
                          <span className="text-gray-900 font-medium">{bot.stats?.questions_posted || 0}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <HelpCircle className="h-3 w-3 text-gray-400" />
                          <span className="text-gray-900 font-medium">{bot.stats?.answers_posted || 0}</span>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex gap-1">
                        {bot.type !== 'answerer' && (
                          <button
                            onClick={() => handleTriggerAction(bot.id, 'question')}
                            className="p-1 hover:bg-blue-50 rounded text-blue-600"
                            title="Ask Question"
                          >
                            <MessageSquare className="h-4 w-4" />
                          </button>
                        )}
                        {bot.type !== 'questioner' && (
                          <button
                            onClick={() => handleTriggerAction(bot.id, 'answer')}
                            className="p-1 hover:bg-green-50 rounded text-green-600"
                            title="Answer Question"
                          >
                            <HelpCircle className="h-4 w-4" />
                          </button>
                        )}
                        <button
                          onClick={() => handleTriggerAction(bot.id, 'vote')}
                          className="p-1 hover:bg-purple-50 rounded text-purple-600"
                          title="Vote"
                        >
                          <ThumbsUp className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex gap-1">
                        <button
                          onClick={() => setEditingBot(bot)}
                          className="p-1 hover:bg-gray-100 rounded"
                        >
                          <Edit className="h-4 w-4 text-gray-600" />
                        </button>
                        <button
                          onClick={async () => {
                            if (confirm(`Delete bot ${bot.name}?`)) {
                              await BotManager.deleteBot(bot.id)
                              await loadBotData()
                            }
                          }}
                          className="p-1 hover:bg-gray-100 rounded"
                        >
                          <Trash2 className="h-4 w-4 text-red-600" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-gray-100 flex items-center justify-between">
            <div className="text-sm text-gray-700">
              Page {currentPage} of {totalPages}
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              {[...Array(Math.min(5, totalPages))].map((_, i) => {
                const page = i + 1
                return (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`px-3 py-1 rounded-lg ${
                      currentPage === page 
                        ? 'bg-emerald-600 text-white' 
                        : 'border border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {page}
                  </button>
                )
              })}
              <button
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-1 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
      
      {/* Generate Bots Modal */}
      {showGenerateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full">
            <h3 className="text-xl font-bold mb-4">Generate Bots in Bulk</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Number of bots (1-20)
                </label>
                <input
                  type="number"
                  min="1"
                  max="20"
                  value={generateCount}
                  onChange={(e) => setGenerateCount(parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Bot Type
                </label>
                <select
                  value={generateType}
                  onChange={(e) => setGenerateType(e.target.value as any)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
                >
                  <option value="random">Random Mix</option>
                  <option value="questioner">Questioner Only</option>
                  <option value="answerer">Answerer Only</option>
                  <option value="mixed">Mixed Only</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Activity Level (1-10)
                </label>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={generateActivity}
                  onChange={(e) => setGenerateActivity(parseInt(e.target.value))}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>Low (1)</span>
                  <span className="font-medium">Current: {generateActivity}</span>
                  <span>High (10)</span>
                </div>
              </div>
            </div>
            
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowGenerateModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                disabled={generatingBots}
              >
                Cancel
              </button>
              <button
                onClick={handleGenerateBots}
                disabled={generatingBots}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {generatingBots ? 'Generating...' : 'Generate'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Stats Modal */}
      {showStatsModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <h3 className="text-xl font-bold mb-4">Bot Statistics</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="text-sm text-gray-600">Total Bots</div>
                <div className="text-2xl font-bold">{stats.total}</div>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="text-sm text-gray-600">Active Bots</div>
                <div className="text-2xl font-bold text-green-600">{stats.active}</div>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="text-sm text-gray-600">Questioners</div>
                <div className="text-2xl font-bold text-blue-600">{stats.questioners}</div>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="text-sm text-gray-600">Answerers</div>
                <div className="text-2xl font-bold text-green-600">{stats.answerers}</div>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="text-sm text-gray-600">Mixed</div>
                <div className="text-2xl font-bold text-purple-600">{stats.mixed}</div>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="text-sm text-gray-600">Avg Activity</div>
                <div className="text-2xl font-bold">{stats.avgActivity.toFixed(1)}</div>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="text-sm text-gray-600">Total Questions</div>
                <div className="text-2xl font-bold">{stats.totalQuestions}</div>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="text-sm text-gray-600">Total Answers</div>
                <div className="text-2xl font-bold">{stats.totalAnswers}</div>
              </div>
            </div>
            <button
              onClick={() => setShowStatsModal(false)}
              className="mt-6 w-full px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Edit Bot Modal */}
      {editingBot && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full">
            <h3 className="text-xl font-bold mb-4 text-gray-900">Edit Bot: {editingBot.name}</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Bot Name
                </label>
                <input
                  type="text"
                  value={editFormData.name !== undefined ? editFormData.name : editingBot.name}
                  onChange={(e) => setEditFormData({...editFormData, name: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Username
                </label>
                <input
                  type="text"
                  value={editFormData.username !== undefined ? editFormData.username : editingBot.username}
                  onChange={(e) => setEditFormData({...editFormData, username: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Bot Type
                </label>
                <select 
                  value={editFormData.type !== undefined ? editFormData.type : editingBot.type}
                  onChange={(e) => setEditFormData({...editFormData, type: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
                >
                  <option value="questioner">Questioner</option>
                  <option value="answerer">Answerer</option>
                  <option value="mixed">Mixed</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Activity Level: {editingBot.activity_level}
                </label>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={editFormData.activity_level !== undefined ? editFormData.activity_level : editingBot.activity_level}
                  onChange={(e) => setEditFormData({...editFormData, activity_level: e.target.value})}
                  className="w-full"
                />
                <div className="text-center text-sm text-gray-600 mt-1">
                  Current: {editFormData.activity_level !== undefined ? editFormData.activity_level : editingBot.activity_level}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select 
                  value={editFormData.status !== undefined ? editFormData.status : editingBot.status}
                  onChange={(e) => setEditFormData({...editFormData, status: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
                >
                  <option value="active">Active</option>
                  <option value="paused">Paused</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Expertise Areas
                </label>
                <input
                  type="text"
                  value={editFormData.expertise_areas !== undefined ? editFormData.expertise_areas : (editingBot.expertise_areas?.join(', ') || '')}
                  onChange={(e) => setEditFormData({...editFormData, expertise_areas: e.target.value})}
                  placeholder="e.g., confidence, social skills, dating"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
                />
                <div className="text-xs text-gray-500 mt-1">Separate multiple areas with commas</div>
              </div>
            </div>
            
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setEditingBot(null)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-700"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateBot}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Update Bot
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Bot Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full">
            <h3 className="text-xl font-bold mb-4 text-gray-900">Add New Bot</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Bot Name
                </label>
                <input
                  type="text"
                  placeholder="e.g., Alex Smith"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Username
                </label>
                <input
                  type="text"
                  placeholder="e.g., alexsmith99"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Bot Type
                </label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900">
                  <option value="questioner">Questioner</option>
                  <option value="answerer">Answerer</option>
                  <option value="mixed">Mixed</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Activity Level (1-10)
                </label>
                <input
                  type="range"
                  min="1"
                  max="10"
                  defaultValue="5"
                  className="w-full"
                />
                <div className="text-center text-sm text-gray-600 mt-1">Level 5</div>
              </div>
            </div>
            
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowCreateModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-700"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  // TODO: Implement bot creation logic
                  alert('Bot creation functionality will be implemented here')
                  setShowCreateModal(false)
                }}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Create Bot
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}