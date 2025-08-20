'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  Shield, Users, BookOpen, Trophy, Target, DollarSign, 
  MessageSquare, Settings, Plus, Edit, Trash2, Eye,
  BarChart3, TrendingUp, Calendar, Activity, Bot as BotIcon,
  Play, Pause, Zap, Clock, Brain, AlertTriangle 
} from 'lucide-react'
import RichTextEditor from '@/components/RichTextEditor'
import { 
  SupabaseUserManager, 
  SupabaseCoachManager, 
  SupabaseLearningManager, 
  SupabasePricingManager,
  DbUser, 
  DbCoach, 
  DbProblem, 
  DbExercise, 
  DbMilestone,
  DbPricingPlan,
  supabase
} from '@/lib/supabase'
import { 
  BotManager, 
  PersonalityManager, 
  ScheduleManager,
  Bot, 
  BotPersonality, 
  BotActivity 
} from '@/lib/bot-system'
import { BotAutomation } from '@/lib/bot-automation'

interface AdminStats {
  totalUsers: number
  totalCoaches: number
  totalProblems: number
  totalExercises: number
  totalMilestones: number
  recentSignups: number
}

type AdminSection = 'overview' | 'users' | 'coaches' | 'learning' | 'milestones' | 'pricing' | 'analytics' | 'bots' | 'moderation'

export default function AdminPage() {
  const [activeSection, setActiveSection] = useState<AdminSection>('overview')
  const [stats, setStats] = useState<AdminStats>({
    totalUsers: 0,
    totalCoaches: 0,
    totalProblems: 0,
    totalExercises: 0,
    totalMilestones: 0,
    recentSignups: 0
  })
  
  // Data states
  const [users, setUsers] = useState<DbUser[]>([])
  const [coaches, setCoaches] = useState<DbCoach[]>([])
  const [problems, setProblems] = useState<DbProblem[]>([])
  const [exercises, setExercises] = useState<DbExercise[]>([])
  const [milestones, setMilestones] = useState<DbMilestone[]>([])
  const [pricingPlans, setPricingPlans] = useState<DbPricingPlan[]>([])
  const [bots, setBots] = useState<Bot[]>([])
  const [personalities, setPersonalities] = useState<BotPersonality[]>([])
  const [botActivities, setBotActivities] = useState<BotActivity[]>([])
  const [botAnalytics, setBotAnalytics] = useState<any>({})
  const [automationRunning, setAutomationRunning] = useState(false)

  // Check automation status on component mount
  useEffect(() => {
    const checkAutomationStatus = () => {
      // Check if automation is running in localStorage
      const storedStatus = localStorage.getItem('bot_automation_running')
      if (storedStatus === 'true') {
        setAutomationRunning(true)
        // Restart automation if it was running
        BotAutomation.start(5)
      }
    }
    
    if (activeSection === 'bots') {
      checkAutomationStatus()
    }
  }, [activeSection])
  
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // Filter state
  const [selectedUserType, setSelectedUserType] = useState<string | null>(null)

  // Load all data
  useEffect(() => {
    loadAllData()
  }, [])

  // Load learning data when learning section is active
  useEffect(() => {
    if (activeSection === 'learning') {
      loadLearningData()
    }
    if (activeSection === 'bots') {
      loadBotData()
    }
  }, [activeSection])

  const loadAllData = async () => {
    setLoading(true)
    setError(null)
    
    try {
      // Load all data in parallel
      const [
        usersData,
        coachesData, 
        milestonesData,
        pricingData
      ] = await Promise.all([
        SupabaseUserManager.getAllUsers(),
        SupabaseCoachManager.getAllCoaches(),
        SupabaseLearningManager.getMilestones(),
        SupabasePricingManager.getAllPricingPlans()
      ])

      setUsers(usersData || [])
      setCoaches(coachesData || [])
      setMilestones(milestonesData || [])
      setPricingPlans(pricingData || [])

      // Load learning data to get counts
      const [problemsData, exercisesData] = await Promise.all([
        SupabaseLearningManager.getAllProblems(),
        SupabaseLearningManager.getAllExercises()
      ])

      setProblems(problemsData || [])
      setExercises(exercisesData || [])

      // Calculate stats
      setStats({
        totalUsers: usersData?.length || 0,
        totalCoaches: coachesData?.length || 0,
        totalProblems: problemsData?.length || 0,
        totalExercises: exercisesData?.length || 0,
        totalMilestones: milestonesData?.length || 0,
        recentSignups: usersData?.filter(u => {
          const createdDate = new Date(u.created_at)
          const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
          return createdDate > weekAgo
        }).length || 0
      })

    } catch (err) {
      console.error('Error loading admin data:', err)
      setError('Failed to load admin data')
    } finally {
      setLoading(false)
    }
  }

  const loadLearningData = async () => {
    try {
      const [problemsData, exercisesData] = await Promise.all([
        SupabaseLearningManager.getAllProblems(),
        SupabaseLearningManager.getAllExercises()
      ])

      setProblems(problemsData || [])
      setExercises(exercisesData || [])
    } catch (error) {
      console.error('Error loading learning data:', error)
    }
  }

  const loadBotData = async () => {
    try {
      // Try to load each component separately to handle missing tables gracefully
      try {
        const botsData = await BotManager.getAllBots()
        setBots(botsData || [])
      } catch (error) {
        console.warn('Bot tables not yet deployed - this is expected on first setup')
        setBots([])
      }

      try {
        const personalitiesData = await PersonalityManager.getAllPersonalities()
        setPersonalities(personalitiesData || [])
      } catch (error) {
        console.warn('Personality tables not yet deployed')
        setPersonalities([])
      }

      try {
        const analyticsData = await BotManager.getBotAnalytics()
        setBotAnalytics(analyticsData || {})
      } catch (error) {
        console.warn('Analytics not available - tables may not be deployed yet')
        setBotAnalytics({
          totalBots: 0,
          activeBots: 0,
          totalQuestions: 0,
          totalAnswers: 0,
          totalInteractions: 0
        })
      }
    } catch (error) {
      console.error('Error loading bot data:', error)
      // Set empty state if there's a general error
      setBots([])
      setPersonalities([])
      setBotAnalytics({
        totalBots: 0,
        activeBots: 0,
        totalQuestions: 0,
        totalAnswers: 0,
        totalInteractions: 0
      })
    }
  }

  const navigationItems = [
    { id: 'overview' as AdminSection, label: 'Overview', icon: BarChart3, color: 'text-blue-600' },
    { id: 'users' as AdminSection, label: 'Users', icon: Users, color: 'text-green-600' },
    { id: 'coaches' as AdminSection, label: 'Coaches', icon: Shield, color: 'text-purple-600' },
    { id: 'learning' as AdminSection, label: 'Learning System', icon: BookOpen, color: 'text-orange-600' },
    { id: 'milestones' as AdminSection, label: 'Milestones', icon: Trophy, color: 'text-yellow-600' },
    { id: 'pricing' as AdminSection, label: 'Pricing', icon: DollarSign, color: 'text-red-600' },
    { id: 'analytics' as AdminSection, label: 'Analytics', icon: TrendingUp, color: 'text-indigo-600' },
    { id: 'bots' as AdminSection, label: 'Bot Management', icon: BotIcon, color: 'text-emerald-600' },
    { id: 'moderation' as AdminSection, label: 'Content Moderation', icon: Shield, color: 'text-red-500' },
  ]

  const StatCard = ({ title, value, icon: Icon, color, subtitle }: {
    title: string
    value: number | string
    icon: any
    color: string
    subtitle?: string
  }) => (
    <motion.div 
      className="bg-white rounded-xl p-6 shadow-sm border border-gray-100"
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.2 }}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-3xl font-bold text-gray-900 mt-1">{value}</p>
          {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
        </div>
        <div className={`p-3 rounded-lg bg-gray-50`}>
          <Icon className={`h-6 w-6 ${color}`} />
        </div>
      </div>
    </motion.div>
  )

  const OverviewSection = () => {
    // Calculate stats
    const stats = {
      totalUsers: users.length,
      totalCoaches: coaches.length, 
      totalProblems: problems.length,
      totalExercises: exercises.length,
      totalMilestones: milestones.length,
      recentSignups: users.filter(u => {
        const weekAgo = new Date()
        weekAgo.setDate(weekAgo.getDate() - 7)
        return new Date(u.created_at) > weekAgo
      }).length
    }
    
    // Calculate maximum points a user can earn
    const maxExercisePoints = exercises.reduce((total, exercise) => total + exercise.points_reward, 0)
    const maxAssessmentPoints = 40 // Maximum points from assessment
    const maxTotalPoints = maxExercisePoints + maxAssessmentPoints
    
    return (
      <div className="space-y-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <StatCard 
          title="Total Users" 
          value={stats.totalUsers} 
          icon={Users} 
          color="text-blue-600"
          subtitle={`+${stats.recentSignups} this week`}
        />
        <StatCard 
          title="Active Coaches" 
          value={stats.totalCoaches} 
          icon={Shield} 
          color="text-purple-600" 
        />
        <StatCard 
          title="Learning Content" 
          value={`${stats.totalProblems}/${stats.totalExercises}`} 
          icon={BookOpen} 
          color="text-orange-600"
          subtitle="Problems/Exercises"
        />
        <StatCard 
          title="Milestones" 
          value={stats.totalMilestones} 
          icon={Trophy} 
          color="text-yellow-600" 
        />
        <StatCard 
          title="Max Points" 
          value={maxTotalPoints} 
          icon={Target} 
          color="text-emerald-600"
          subtitle={`${maxExercisePoints} exercises + ${maxAssessmentPoints} assessment`}
        />
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-6 border-b border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Recent Activity
          </h3>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            {users.slice(0, 5).map((user, index) => (
              <div key={user.id} className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
                  <span className="text-white font-semibold text-sm">
                    {user.username?.charAt(0).toUpperCase() || 'U'}
                  </span>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">
                    {user.username || 'New User'} joined
                  </p>
                  <p className="text-xs text-gray-500">
                    {user.user_type} • {new Date(user.created_at).toLocaleDateString()}
                  </p>
                </div>
                <div className="text-xs text-gray-400">
                  {user.confidence_score} pts
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
  }

  const UsersSection = () => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100">
      <div className="p-6 border-b border-gray-100 flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-900">User Management</h3>
        <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
          <Plus className="h-4 w-4" />
          Add User
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="text-left p-4 text-sm font-medium text-gray-600">User</th>
              <th className="text-left p-4 text-sm font-medium text-gray-600">Type</th>
              <th className="text-left p-4 text-sm font-medium text-gray-600">Confidence</th>
              <th className="text-left p-4 text-sm font-medium text-gray-600">Joined</th>
              <th className="text-left p-4 text-sm font-medium text-gray-600">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id} className="border-b border-gray-50 hover:bg-gray-25">
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center">
                      <span className="text-white font-medium text-xs">
                        {user.username?.charAt(0).toUpperCase() || 'U'}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{user.username || 'No username'}</p>
                      <p className="text-sm text-gray-500">{user.email || 'No email'}</p>
                    </div>
                  </div>
                </td>
                <td className="p-4">
                  <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium capitalize">
                    {user.user_type}
                  </span>
                </td>
                <td className="p-4">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">{user.confidence_score}</span>
                    <span className="text-xs text-gray-500">points</span>
                  </div>
                </td>
                <td className="p-4">
                  <span className="text-sm text-gray-600">
                    {new Date(user.created_at).toLocaleDateString()}
                  </span>
                </td>
                <td className="p-4">
                  <div className="flex items-center gap-2">
                    <button className="p-1 hover:bg-gray-100 rounded">
                      <Eye className="h-4 w-4 text-gray-600" />
                    </button>
                    <button className="p-1 hover:bg-gray-100 rounded">
                      <Edit className="h-4 w-4 text-gray-600" />
                    </button>
                    <button className="p-1 hover:bg-gray-100 rounded">
                      <Trash2 className="h-4 w-4 text-red-600" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )

  const CoachesSection = () => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100">
      <div className="p-6 border-b border-gray-100 flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-900">Coach Management</h3>
        <button className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
          <Plus className="h-4 w-4" />
          Add Coach
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
        {coaches.map((coach) => (
          <motion.div 
            key={coach.id} 
            className="border border-gray-200 rounded-lg p-6 hover:border-purple-300 transition-colors"
            whileHover={{ scale: 1.02 }}
          >
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
                <span className="text-xl">{coach.icon}</span>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900">{coach.name}</h4>
                <p className="text-sm text-gray-600">{coach.title}</p>
              </div>
            </div>
            <p className="text-sm text-gray-700 mb-4">{coach.description}</p>
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-500">
                {coach.features?.length || 0} features
              </span>
              <div className="flex gap-2">
                <button className="p-1 hover:bg-gray-100 rounded">
                  <Edit className="h-4 w-4 text-gray-600" />
                </button>
                <button className="p-1 hover:bg-gray-100 rounded">
                  <Trash2 className="h-4 w-4 text-red-600" />
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )

  const LearningSystemSection = () => {
    const [activeTab, setActiveTab] = useState<'problems' | 'exercises'>('problems')
    const [showCreateModal, setShowCreateModal] = useState(false)
    const [editingItem, setEditingItem] = useState<any>(null)
    const [formData, setFormData] = useState<any>({})
    const [isSubmitting, setIsSubmitting] = useState(false)

    const userTypes = ['overthinker', 'nervous', 'rookie', 'updown', 'surface', 'intimacy_boost', 'body_confidence']
    const difficulties = ['easy', 'medium', 'hard']

    const getDifficultyColor = (difficulty: string) => {
      switch (difficulty) {
        case 'easy': return 'bg-green-100 text-green-800'
        case 'medium': return 'bg-yellow-100 text-yellow-800'
        case 'hard': return 'bg-red-100 text-red-800'
        default: return 'bg-gray-100 text-gray-800'
      }
    }

    const getUserTypeColor = (userType: string) => {
      const colors = {
        overthinker: 'bg-purple-100 text-purple-800',
        nervous: 'bg-blue-100 text-blue-800', 
        rookie: 'bg-green-100 text-green-800',
        updown: 'bg-yellow-100 text-yellow-800',
        surface: 'bg-pink-100 text-pink-800',
        intimacy_boost: 'bg-red-100 text-red-800',
        body_confidence: 'bg-orange-100 text-orange-800'
      }
      return colors[userType as keyof typeof colors] || 'bg-gray-100 text-gray-800'
    }

    // Handler functions
    const handleCreateNew = () => {
      const newFormData = activeTab === 'problems' 
        ? { title: '', description: '', user_type: 'overthinker', order_index: problems.length + 1 }
        : { 
            title: '', description: '', content: '', problem_id: '', 
            difficulty: 'easy', points_reward: 5, estimated_minutes: 10, 
            order_index: exercises.length + 1 
          }
      setFormData(newFormData)
      setEditingItem(null)
      setShowCreateModal(true)
    }

    const handleEdit = (item: any) => {
      console.log('handleEdit called with item:', item.title)
      setFormData({ ...item })
      setEditingItem(item)
      setShowCreateModal(true)
    }

    const handleSubmit = async () => {
      setIsSubmitting(true)
      try {
        console.log('handleSubmit called with activeTab:', activeTab)
        console.log('editingItem:', editingItem)
        console.log('formData:', formData)
        
        if (activeTab === 'problems') {
          if (editingItem) {
            console.log('Updating problem...')
            await SupabaseLearningManager.updateProblem(editingItem.id, formData)
          } else {
            console.log('Creating problem...')
            await SupabaseLearningManager.createProblem(formData)
          }
        } else {
          if (editingItem) {
            console.log('Updating exercise...')
            await SupabaseLearningManager.updateExercise(editingItem.id, formData)
          } else {
            console.log('Creating exercise...')
            await SupabaseLearningManager.createExercise(formData)
          }
        }

        // Success - close modal and reload data
        setShowCreateModal(false)
        setEditingItem(null)
        setFormData({})
        
        console.log('Operation successful, reloading data...')
        await loadLearningData()
        await loadAllData()
        
      } catch (error) {
        console.error('Error saving:', error)
        const errorMessage = error instanceof Error ? error.message : 'Unknown error'
        alert(`Error ${editingItem ? 'updating' : 'creating'} ${activeTab.slice(0, -1)}: ${errorMessage}`)
      } finally {
        setIsSubmitting(false)
      }
    }

    const handleDelete = async (item: any) => {
      if (!confirm(`Are you sure you want to delete this ${activeTab.slice(0, -1)}?`)) return
      
      try {
        if (activeTab === 'problems') {
          await SupabaseLearningManager.deleteProblem(item.id)
        } else {
          await SupabaseLearningManager.deleteExercise(item.id)
        }

        // Reload data after successful deletion
        await loadLearningData()
        await loadAllData()
        
        console.log(`Successfully deleted ${activeTab.slice(0, -1)}:`, item.id)
      } catch (error) {
        console.error('Error deleting:', error)
        alert(`Error deleting ${activeTab.slice(0, -1)}: ${error instanceof Error ? error.message : 'Unknown error'}`)
      }
    }

    const coachMapping = {
      overthinker: { coach: 'Logan', title: 'The Straight Shooter', color: 'bg-purple-100 text-purple-800 border-purple-200' },
      nervous: { coach: 'Chase', title: 'The Cool Cat', color: 'bg-blue-100 text-blue-800 border-blue-200' },
      rookie: { coach: 'Mason', title: 'The Patient Pro', color: 'bg-green-100 text-green-800 border-green-200' },
      updown: { coach: 'Blake', title: 'The Reliable Guy', color: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
      surface: { coach: 'Knox', title: 'The Authentic One', color: 'bg-pink-100 text-pink-800 border-pink-200' },
      intimacy_boost: { coach: 'Bonus', title: 'Intimacy Boost', color: 'bg-red-100 text-red-800 border-red-200' },
      body_confidence: { coach: 'Bonus', title: 'Body Confidence', color: 'bg-orange-100 text-orange-800 border-orange-200' }
    }

    return (
      <div className="space-y-6">
        {/* Coach Assignment Legend */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h4 className="text-sm font-semibold text-gray-900 mb-4">Coach Assignments - User Type Mapping</h4>
          <div className="grid grid-cols-1 md:grid-cols-7 gap-3">
            {Object.entries(coachMapping).map(([userType, { coach, title, color }]) => (
              <div 
                key={userType} 
                className={`px-3 py-2 rounded-lg border ${color} flex flex-col items-center text-center cursor-pointer transition-all duration-200 ${
                  selectedUserType === userType 
                    ? 'ring-2 ring-orange-500 bg-orange-50' 
                    : 'hover:bg-gray-50 hover:scale-105'
                }`}
                onClick={() => setSelectedUserType(selectedUserType === userType ? null : userType)}
              >
                <div className="font-semibold text-sm capitalize">{userType}</div>
                <div className="text-xs opacity-75">{coach}</div>
                <div className="text-xs opacity-60">"{title}"</div>
                <div className="text-xs mt-1 font-medium">
                  {problems.filter(p => p.user_type === userType).length} problems
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Filter Status */}
        {selectedUserType && (
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-orange-800 font-medium">
                Filtering by: <span className="capitalize">{selectedUserType}</span>
              </span>
              <span className="bg-orange-200 text-orange-800 px-2 py-1 rounded text-xs">
                {activeTab === 'problems' 
                  ? problems.filter(p => p.user_type === selectedUserType).length + ' problems'
                  : exercises.filter(e => {
                      const problem = problems.find(p => p.id === e.problem_id);
                      return problem?.user_type === selectedUserType;
                    }).length + ' exercises'
                }
              </span>
            </div>
            <button 
              onClick={() => setSelectedUserType(null)}
              className="text-orange-600 hover:text-orange-800 font-medium text-sm"
            >
              Clear filter
            </button>
          </div>
        )}

        {/* Header with tabs */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="p-6 border-b border-gray-100">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-900">Learning System Management</h3>
              <button 
                onClick={handleCreateNew}
                className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
              >
                <Plus className="h-4 w-4" />
                Add {activeTab === 'problems' ? 'Problem' : 'Exercise'}
              </button>
            </div>
            
            {/* Tabs */}
            <div className="flex gap-4 mt-4">
              <button
                onClick={() => setActiveTab('problems')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  activeTab === 'problems' 
                    ? 'bg-orange-100 text-orange-700 border border-orange-200' 
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                Problems ({stats.totalProblems})
              </button>
              <button
                onClick={() => setActiveTab('exercises')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  activeTab === 'exercises' 
                    ? 'bg-orange-100 text-orange-700 border border-orange-200' 
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                Exercises ({stats.totalExercises})
              </button>
            </div>
          </div>

          {/* Problems Tab */}
          {activeTab === 'problems' && (
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {problems
                  .filter(problem => !selectedUserType || problem.user_type === selectedUserType)
                  .map((problem) => (
                  <motion.div 
                    key={problem.id} 
                    className="border border-gray-200 rounded-lg p-4 hover:border-orange-300 transition-colors"
                    whileHover={{ scale: 1.02 }}
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getUserTypeColor(problem.user_type)}`}>
                          {problem.user_type}
                        </span>
                        <span className="text-xs text-gray-500">#{problem.order_index}</span>
                      </div>
                      <div className="flex gap-1">
                        <button 
                          onClick={() => handleEdit(problem)}
                          className="p-1 hover:bg-gray-100 rounded"
                        >
                          <Edit className="h-4 w-4 text-gray-600" />
                        </button>
                        <button 
                          onClick={() => handleDelete(problem)}
                          className="p-1 hover:bg-gray-100 rounded"
                        >
                          <Trash2 className="h-4 w-4 text-red-600" />
                        </button>
                      </div>
                    </div>
                    
                    <h4 className="font-semibold text-gray-900 mb-2">{problem.title}</h4>
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">{problem.description}</p>
                    
                    <div className="flex justify-between items-center text-xs text-gray-500">
                      <span>Created: {new Date(problem.created_at).toLocaleDateString()}</span>
                      <span>{exercises.filter(e => e.problem_id === problem.id).length} exercises</span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {/* Exercises Tab */}
          {activeTab === 'exercises' && (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    <th className="text-left p-4 text-sm font-medium text-gray-600">Exercise</th>
                    <th className="text-left p-4 text-sm font-medium text-gray-600">Problem</th>
                    <th className="text-left p-4 text-sm font-medium text-gray-600">Difficulty</th>
                    <th className="text-left p-4 text-sm font-medium text-gray-600">Reward</th>
                    <th className="text-left p-4 text-sm font-medium text-gray-600">Time</th>
                    <th className="text-left p-4 text-sm font-medium text-gray-600">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {exercises
                    .filter(exercise => {
                      if (!selectedUserType) return true;
                      const problem = problems.find(p => p.id === exercise.problem_id);
                      return problem?.user_type === selectedUserType;
                    })
                    .map((exercise) => (
                    <tr key={exercise.id} className="border-b border-gray-50 hover:bg-gray-25">
                      <td className="p-4">
                        <div>
                          <div className="font-medium text-gray-900">{exercise.title}</div>
                          <div className="text-sm text-gray-500 truncate max-w-xs">
                            {exercise.description}
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="text-sm">
                          <div className="font-medium text-gray-900">
                            {problems.find(p => p.id === exercise.problem_id)?.title || 'Unknown'}
                          </div>
                          <div className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                            getUserTypeColor(problems.find(p => p.id === exercise.problem_id)?.user_type || '')
                          }`}>
                            {problems.find(p => p.id === exercise.problem_id)?.user_type}
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(exercise.difficulty)}`}>
                          {exercise.difficulty}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-1">
                          <span className="font-semibold text-yellow-600">{exercise.points_reward}</span>
                          <span className="text-xs text-gray-500">pts</span>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className="text-sm text-gray-600">~{exercise.estimated_minutes}min</span>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <button 
                            onClick={() => handleEdit(exercise)}
                            className="p-1 hover:bg-gray-100 rounded"
                          >
                            <Edit className="h-4 w-4 text-gray-600" />
                          </button>
                          <button 
                            onClick={() => handleDelete(exercise)}
                            className="p-1 hover:bg-gray-100 rounded"
                          >
                            <Trash2 className="h-4 w-4 text-red-600" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <div className="text-2xl font-bold text-orange-600">{stats.totalProblems}</div>
            <div className="text-sm text-gray-600">Total Problems</div>
          </div>
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <div className="text-2xl font-bold text-blue-600">{stats.totalExercises}</div>
            <div className="text-sm text-gray-600">Total Exercises</div>
          </div>
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <div className="text-2xl font-bold text-green-600">
              {problems.reduce((sum, p) => sum + exercises.filter(e => e.problem_id === p.id).length, 0) / problems.length || 0}
            </div>
            <div className="text-sm text-gray-600">Avg Exercises/Problem</div>
          </div>
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <div className="text-2xl font-bold text-purple-600">
              {Math.round(exercises.reduce((sum, e) => sum + e.points_reward, 0) / exercises.length) || 0}
            </div>
            <div className="text-sm text-gray-600">Avg Points/Exercise</div>
          </div>
        </div>

        {/* Create/Edit Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <motion.div 
              className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.2 }}
            >
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">
                  {editingItem ? 'Edit' : 'Create'} {activeTab === 'problems' ? 'Problem' : 'Exercise'}
                </h3>
              </div>

              <div className="p-6 space-y-4">
                {/* Common Fields */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                  <input
                    type="text"
                    value={formData.title || ''}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-gray-900"
                    placeholder="Enter title..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <RichTextEditor
                    value={formData.description || ''}
                    onChange={(content) => setFormData({ ...formData, description: content })}
                    placeholder="Enter description..."
                    height={150}
                    minimal={true}
                  />
                </div>

                {/* Problem-specific fields */}
                {activeTab === 'problems' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">User Type</label>
                      <select
                        value={formData.user_type || 'overthinker'}
                        onChange={(e) => setFormData({ ...formData, user_type: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-gray-900"
                      >
                        {userTypes.map(type => (
                          <option key={type} value={type}>
                            {type.charAt(0).toUpperCase() + type.slice(1)} - {coachMapping[type as keyof typeof coachMapping]?.coach}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Order Index</label>
                      <input
                        type="number"
                        value={formData.order_index || 1}
                        onChange={(e) => setFormData({ ...formData, order_index: parseInt(e.target.value) })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-gray-900"
                        min="1"
                      />
                    </div>
                  </>
                )}

                {/* Exercise-specific fields */}
                {activeTab === 'exercises' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Problem</label>
                      <select
                        value={formData.problem_id || ''}
                        onChange={(e) => setFormData({ ...formData, problem_id: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-gray-900"
                      >
                        <option value="">Select a problem...</option>
                        {problems.map(problem => (
                          <option key={problem.id} value={problem.id}>
                            [{problem.user_type}] {problem.title}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Difficulty</label>
                        <select
                          value={formData.difficulty || 'easy'}
                          onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-gray-900"
                        >
                          {difficulties.map(diff => (
                            <option key={diff} value={diff}>{diff.charAt(0).toUpperCase() + diff.slice(1)}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Order Index</label>
                        <input
                          type="number"
                          value={formData.order_index || 1}
                          onChange={(e) => setFormData({ ...formData, order_index: parseInt(e.target.value) })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-gray-900"
                          min="1"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Points Reward</label>
                        <input
                          type="number"
                          value={formData.points_reward || 5}
                          onChange={(e) => setFormData({ ...formData, points_reward: parseInt(e.target.value) })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-gray-900"
                          min="1"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Estimated Minutes</label>
                        <input
                          type="number"
                          value={formData.estimated_minutes || 10}
                          onChange={(e) => setFormData({ ...formData, estimated_minutes: parseInt(e.target.value) })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-gray-900"
                          min="1"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Content (Optional)</label>
                      <RichTextEditor
                        value={formData.content || ''}
                        onChange={(content) => setFormData({ ...formData, content: content })}
                        placeholder="Enter detailed exercise content, instructions, or steps..."
                        height={300}
                        minimal={false}
                      />
                    </div>
                  </>
                )}
              </div>

              <div className="p-6 border-t border-gray-200 flex gap-3 justify-end">
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={isSubmitting || !formData.title}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    isSubmitting || !formData.title
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-orange-600 text-white hover:bg-orange-700'
                  }`}
                >
                  {isSubmitting ? 'Saving...' : editingItem ? 'Update' : 'Create'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    )
  }

  const MilestonesSection = () => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100">
      <div className="p-6 border-b border-gray-100 flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-900">Milestones Management</h3>
        <button className="flex items-center gap-2 px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors">
          <Plus className="h-4 w-4" />
          Add Milestone
        </button>
      </div>
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {milestones.map((milestone) => (
            <div key={milestone.id} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{milestone.badge_icon}</span>
                  <div>
                    <h4 className="font-semibold text-gray-900">{milestone.title}</h4>
                    <p className="text-sm text-yellow-600 font-medium">{milestone.points_required} points</p>
                  </div>
                </div>
                <div className="flex gap-1">
                  <button className="p-1 hover:bg-gray-100 rounded">
                    <Edit className="h-4 w-4 text-gray-600" />
                  </button>
                  <button className="p-1 hover:bg-gray-100 rounded">
                    <Trash2 className="h-4 w-4 text-red-600" />
                  </button>
                </div>
              </div>
              <p className="text-sm text-gray-600">{milestone.description}</p>
              {milestone.welcome_message && (
                <p className="text-xs text-gray-500 mt-2 italic">"{milestone.welcome_message}"</p>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )

  const ModerationSection = () => {
    const [pendingContent, setPendingContent] = useState<any[]>([])
    const [moderationLoading, setModerationLoading] = useState(true)
    const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set())

    useEffect(() => {
      if (activeSection === 'moderation') {
        loadPendingContent()
      }
    }, [activeSection])

    const loadPendingContent = async () => {
      setModerationLoading(true)
      try {
        // Get pending questions
        const { data: pendingQuestions, error: questionsError } = await supabase
          .from('questions')
          .select('*')
          .eq('moderation_status', 'pending')
          .eq('is_bot_generated', true)
          .order('created_at', { ascending: false })

        // Get pending answers  
        const { data: pendingAnswers, error: answersError } = await supabase
          .from('answers')
          .select('*, questions(title)')
          .eq('moderation_status', 'pending')
          .eq('is_bot_generated', true)
          .order('created_at', { ascending: false })

        const allPending = [
          ...(pendingQuestions || []).map(q => ({ ...q, content_type: 'question' })),
          ...(pendingAnswers || []).map(a => ({ ...a, content_type: 'answer' }))
        ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())

        setPendingContent(allPending)
      } catch (error) {
        console.error('Error loading pending content:', error)
      } finally {
        setModerationLoading(false)
      }
    }

    const moderateContent = async (contentId: string, contentType: 'question' | 'answer', action: 'approved' | 'rejected') => {
      try {
        const table = contentType === 'question' ? 'questions' : 'answers'
        
        if (action === 'rejected') {
          // Delete rejected content
          await supabase.from(table).delete().eq('id', contentId)
        } else {
          // Approve content
          await supabase
            .from(table)
            .update({ 
              moderation_status: 'approved',
              moderated_by: 'admin',
              moderated_at: new Date().toISOString()
            })
            .eq('id', contentId)
        }

        // Reload pending content
        await loadPendingContent()
        
        // Log the moderation action
        await supabase.from('moderation_log').insert({
          content_type: contentType,
          content_id: contentId,
          action: action,
          moderator: 'admin',
          new_status: action
        })

      } catch (error) {
        console.error('Error moderating content:', error)
        alert('Error moderating content')
      }
    }

    const bulkModerate = async (action: 'approved' | 'rejected') => {
      if (selectedItems.size === 0) return
      
      try {
        for (const itemId of selectedItems) {
          const item = pendingContent.find(c => c.id === itemId)
          if (item) {
            await moderateContent(item.id, item.content_type, action)
          }
        }
        setSelectedItems(new Set())
      } catch (error) {
        console.error('Error in bulk moderation:', error)
      }
    }

    const toggleSelection = (itemId: string) => {
      const newSelection = new Set(selectedItems)
      if (newSelection.has(itemId)) {
        newSelection.delete(itemId)
      } else {
        newSelection.add(itemId)
      }
      setSelectedItems(newSelection)
    }

    return (
      <div className="space-y-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="p-6 border-b border-gray-100 flex justify-between items-center">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Content Moderation</h3>
              <p className="text-sm text-gray-600 mt-1">Review and moderate bot-generated content</p>
            </div>
            <div className="flex gap-2">
              {selectedItems.size > 0 && (
                <>
                  <button
                    onClick={() => bulkModerate('approved')}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    Approve Selected ({selectedItems.size})
                  </button>
                  <button
                    onClick={() => bulkModerate('rejected')}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                  >
                    Reject Selected ({selectedItems.size})
                  </button>
                </>
              )}
              <button
                onClick={loadPendingContent}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Refresh
              </button>
            </div>
          </div>

          {moderationLoading ? (
            <div className="p-8 text-center text-gray-500">Loading pending content...</div>
          ) : pendingContent.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <Shield className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>No pending content to moderate</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {pendingContent.map((item) => (
                <div key={item.id} className="p-6">
                  <div className="flex items-start gap-4">
                    <input
                      type="checkbox"
                      checked={selectedItems.has(item.id)}
                      onChange={() => toggleSelection(item.id)}
                      className="mt-1"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          item.content_type === 'question' 
                            ? 'bg-blue-100 text-blue-800' 
                            : 'bg-green-100 text-green-800'
                        }`}>
                          {item.content_type}
                        </span>
                        <span className="text-sm text-gray-500">by {item.author_name}</span>
                        <span className="text-sm text-gray-400">
                          {new Date(item.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      
                      {item.content_type === 'question' ? (
                        <div>
                          <h4 className="font-medium text-gray-900 mb-1">{item.title}</h4>
                          <p className="text-gray-700 text-sm">{item.body}</p>
                          <span className="inline-block mt-2 px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                            {item.category}
                          </span>
                        </div>
                      ) : (
                        <div>
                          <p className="text-gray-700 text-sm mb-1">
                            <span className="font-medium">Answer to:</span> {item.questions?.title}
                          </p>
                          <p className="text-gray-900">{item.content}</p>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex gap-2">
                      <button
                        onClick={() => moderateContent(item.id, item.content_type, 'approved')}
                        className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700 transition-colors"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => moderateContent(item.id, item.content_type, 'rejected')}
                        className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700 transition-colors"
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    )
  }

  const BotsSection = () => {
    const [showCreateModal, setShowCreateModal] = useState(false)
    const [editingBot, setEditingBot] = useState<Bot | null>(null)
    const [showBotDetails, setShowBotDetails] = useState<Bot | null>(null)
    const [botFormData, setBotFormData] = useState<any>({})
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [selectedBot, setSelectedBot] = useState<string | null>(null)
    const [customExpertise, setCustomExpertise] = useState('')

    // Predefined expertise areas based on community categories + bot-specific
    const predefinedExpertise = [
      // Community categories
      'confidence-building',
      'sexual-performance', 
      'dating-apps',
      'relationships',
      // Bot-specific extras
      'social-anxiety',
      'career-confidence',
      'body-confidence',
      'communication-skills',
      'self-esteem',
      'public-speaking',
      'intimacy',
      'mindset'
    ]

    const addExpertiseArea = (area: string) => {
      if (!area.trim()) return
      
      const currentAreas = botFormData.expertise_areas || []
      if (currentAreas.length >= 5) {
        alert('Maximum 5 expertise areas allowed')
        return
      }
      
      if (currentAreas.includes(area)) {
        alert('This expertise area is already added')
        return
      }
      
      setBotFormData({
        ...botFormData,
        expertise_areas: [...currentAreas, area]
      })
      setCustomExpertise('')
    }

    const removeExpertiseArea = (areaToRemove: string) => {
      const currentAreas = botFormData.expertise_areas || []
      setBotFormData({
        ...botFormData,
        expertise_areas: currentAreas.filter((area: string) => area !== areaToRemove)
      })
    }

    const handleCreateBot = () => {
      const newBotData = {
        name: '',
        username: '',
        type: 'mixed' as const,
        personality: {},
        personality_id: '',
        status: 'active' as const,
        activity_level: 5,
        openai_model: 'gpt-3.5-turbo',
        avatar_url: '',
        bio: '',
        expertise_areas: []
      }
      setBotFormData(newBotData)
      setEditingBot(null)
      setCustomExpertise('')
      setShowCreateModal(true)
    }

    const handleEditBot = (bot: Bot) => {
      const editData = { 
        ...bot, 
        personality_id: bot.personality?.id || '' 
      }
      setBotFormData(editData)
      setEditingBot(bot)
      setCustomExpertise('')
      setShowCreateModal(true)
    }

    const handleSubmitBot = async () => {
      setIsSubmitting(true)
      try {
        // Prepare bot data with personality reference
        const botData = { ...botFormData }
        
        // Store personality ID in the personality field for easy access
        if (botData.personality_id) {
          botData.personality = { id: botData.personality_id }
        }
        
        // Remove the temporary personality_id field
        delete botData.personality_id
        
        if (editingBot) {
          await BotManager.updateBot(editingBot.id, botData)
        } else {
          await BotManager.createBot(botData)
        }
        
        setShowCreateModal(false)
        setEditingBot(null)
        setBotFormData({})
        await loadBotData()
      } catch (error) {
        console.error('Error saving bot:', error)
        alert(`Error ${editingBot ? 'updating' : 'creating'} bot: ${error instanceof Error ? error.message : 'Unknown error'}`)
      } finally {
        setIsSubmitting(false)
      }
    }

    const handleToggleBotStatus = async (bot: Bot) => {
      try {
        await BotManager.toggleBotStatus(bot.id)
        await loadBotData()
      } catch (error) {
        console.error('Error toggling bot status:', error)
        alert('Error updating bot status')
      }
    }

    const handleDeleteBot = async (bot: Bot) => {
      if (!confirm(`Are you sure you want to delete bot "${bot.name}"? This action cannot be undone.`)) return
      
      try {
        await BotManager.deleteBot(bot.id)
        await loadBotData()
      } catch (error) {
        console.error('Error deleting bot:', error)
        alert('Error deleting bot')
      }
    }

    const handleTriggerBotAction = async (botId: string, action: 'question' | 'answer' | 'vote') => {
      try {
        const result = await BotAutomation.triggerBotAction(botId, action)
        if (result.success) {
          alert(`Bot action "${action}" triggered successfully!`)
          await loadBotData()
        } else {
          alert(`Failed to trigger bot action: ${result.error}`)
        }
      } catch (error) {
        console.error('Error triggering bot action:', error)
        alert('Error triggering bot action')
      }
    }

    const getStatusColor = (status: string) => {
      switch (status) {
        case 'active': return 'bg-green-100 text-green-800'
        case 'paused': return 'bg-yellow-100 text-yellow-800'
        case 'archived': return 'bg-gray-100 text-gray-800'
        default: return 'bg-gray-100 text-gray-800'
      }
    }

    const getTypeColor = (type: string) => {
      switch (type) {
        case 'questioner': return 'bg-blue-100 text-blue-800'
        case 'answerer': return 'bg-green-100 text-green-800'
        case 'mixed': return 'bg-purple-100 text-purple-800'
        default: return 'bg-gray-100 text-gray-800'
      }
    }

    return (
      <div className="space-y-6">
        {/* Setup Notice */}
        {bots.length === 0 && personalities.length === 0 && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-6">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-6 w-6 text-amber-600" />
              <div>
                <h3 className="text-lg font-semibold text-amber-900">Bot System Setup Required</h3>
                <p className="text-amber-800 mt-1">
                  The bot management tables haven't been deployed yet. Please run the SQL schema from <code>supabase_bot_system.sql</code> in your Supabase SQL editor to enable bot management.
                </p>
                <p className="text-amber-700 text-sm mt-2">
                  📖 See <code>BOT_SYSTEM_DEPLOYMENT_GUIDE.md</code> for complete setup instructions.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Bot Analytics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <StatCard 
            title="Total Bots" 
            value={botAnalytics.totalBots || 0} 
            icon={BotIcon} 
            color="text-emerald-600"
            subtitle={`${botAnalytics.activeBots || 0} active`}
          />
          <StatCard 
            title="Questions Posted" 
            value={botAnalytics.totalQuestions || 0} 
            icon={MessageSquare} 
            color="text-blue-600" 
          />
          <StatCard 
            title="Answers Posted" 
            value={botAnalytics.totalAnswers || 0} 
            icon={MessageSquare} 
            color="text-green-600" 
          />
          <StatCard 
            title="Interactions" 
            value={botAnalytics.totalInteractions || 0} 
            icon={Activity} 
            color="text-purple-600"
            subtitle="Votes & reactions"
          />
        </div>

        {/* Automation Control */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Zap className="h-6 w-6 text-orange-600" />
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Bot Automation Engine</h3>
                <p className="text-sm text-gray-600">Control automated bot behaviors and scheduling</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                automationRunning ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
              }`}>
                {automationRunning ? 'Running' : 'Stopped'}
              </span>
              <button
                onClick={() => {
                  if (automationRunning) {
                    BotAutomation.stop()
                    setAutomationRunning(false)
                    localStorage.setItem('bot_automation_running', 'false')
                  } else {
                    BotAutomation.start(5) // 5 minute intervals
                    setAutomationRunning(true)
                    localStorage.setItem('bot_automation_running', 'true')
                  }
                }}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  automationRunning 
                    ? 'bg-red-600 text-white hover:bg-red-700' 
                    : 'bg-green-600 text-white hover:bg-green-700'
                }`}
              >
                {automationRunning ? 'Stop' : 'Start'} Automation
              </button>
            </div>
          </div>
        </div>

        {/* Bot Management */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="p-6 border-b border-gray-100 flex justify-between items-center">
            <h3 className="text-lg font-semibold text-gray-900">Bot Management</h3>
            <button 
              onClick={handleCreateBot}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
            >
              <Plus className="h-4 w-4" />
              Create Bot
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="text-left p-4 text-sm font-medium text-gray-600">Bot</th>
                  <th className="text-left p-4 text-sm font-medium text-gray-600">Type</th>
                  <th className="text-left p-4 text-sm font-medium text-gray-600">Status</th>
                  <th className="text-left p-4 text-sm font-medium text-gray-600">Activity</th>
                  <th className="text-left p-4 text-sm font-medium text-gray-600">Stats</th>
                  <th className="text-left p-4 text-sm font-medium text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody>
                {bots.map((bot) => (
                  <tr key={bot.id} className="border-b border-gray-50 hover:bg-gray-25">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-r from-emerald-500 to-blue-500 flex items-center justify-center">
                          <span className="text-white font-medium text-xs">
                            {bot.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{bot.name}</p>
                          <p className="text-sm text-gray-500">@{bot.username}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(bot.type)}`}>
                        {bot.type}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(bot.status)}`}>
                        {bot.status}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="text-sm">
                        <div className="font-medium text-gray-900">Level {bot.activity_level}/10</div>
                        <div className="text-xs text-gray-500">
                          {bot.stats.last_active ? 
                            `Last: ${new Date(bot.stats.last_active).toLocaleDateString()}` : 
                            'Never active'
                          }
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="text-sm">
                        <div className="text-gray-900">{bot.stats.questions_posted}Q / {bot.stats.answers_posted}A</div>
                        <div className="text-xs text-gray-500">{bot.stats.helpful_votes_received} helpful votes</div>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleToggleBotStatus(bot)}
                          className={`p-1 rounded hover:bg-gray-100 ${
                            bot.status === 'active' ? 'text-red-600' : 'text-green-600'
                          }`}
                          title={bot.status === 'active' ? 'Pause Bot' : 'Activate Bot'}
                        >
                          {bot.status === 'active' ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                        </button>
                        <button
                          onClick={() => setShowBotDetails(bot)}
                          className="p-1 rounded hover:bg-gray-100 text-blue-600"
                          title="View Details"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleEditBot(bot)}
                          className="p-1 rounded hover:bg-gray-100 text-gray-600"
                          title="Edit Bot"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteBot(bot)}
                          className="p-1 rounded hover:bg-gray-100 text-red-600"
                          title="Delete Bot"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Personalities */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="p-6 border-b border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900">Bot Personalities</h3>
            <p className="text-sm text-gray-600 mt-1">Predefined personality templates for bot behavior</p>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {personalities.map((personality) => (
                <div key={personality.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold text-gray-900">{personality.name}</h4>
                    <Brain className="h-4 w-4 text-purple-600" />
                  </div>
                  <p className="text-sm text-gray-600 mb-3">{personality.description}</p>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500">Traits:</span>
                    {Object.entries(personality.traits || {}).slice(0, 3).map(([key, value]) => (
                      <span key={key} className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded">
                        {key}: {value}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Create/Edit Bot Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <motion.div 
              className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.2 }}
            >
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">
                  {editingBot ? 'Edit Bot' : 'Create New Bot'}
                </h3>
              </div>

              <div className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                    <input
                      type="text"
                      value={botFormData.name || ''}
                      onChange={(e) => setBotFormData({ ...botFormData, name: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-gray-900"
                      placeholder="Bot display name..."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
                    <input
                      type="text"
                      value={botFormData.username || ''}
                      onChange={(e) => setBotFormData({ ...botFormData, username: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-gray-900"
                      placeholder="@username for community..."
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                    <select
                      value={botFormData.type || 'mixed'}
                      onChange={(e) => setBotFormData({ ...botFormData, type: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-gray-900"
                    >
                      <option value="questioner">Questioner (Pune doar întrebări)</option>
                      <option value="answerer">Answerer (Răspunde doar la întrebări)</option>
                      <option value="mixed">Mixed (Întrebări + Răspunsuri)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Activity Level (1-10)</label>
                    <input
                      type="number"
                      min="1"
                      max="10"
                      value={botFormData.activity_level || 5}
                      onChange={(e) => setBotFormData({ ...botFormData, activity_level: parseInt(e.target.value) })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-gray-900"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Personality</label>
                  <select
                    value={botFormData.personality_id || ''}
                    onChange={(e) => setBotFormData({ ...botFormData, personality_id: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-gray-900"
                  >
                    <option value="">Select personality...</option>
                    {personalities.map((personality) => (
                      <option key={personality.id} value={personality.id}>
                        {personality.name} - {personality.description}
                      </option>
                    ))}
                  </select>
                  {botFormData.personality_id && (
                    <div className="mt-2 p-3 bg-purple-50 rounded-lg border border-purple-200">
                      {(() => {
                        const selectedPersonality = personalities.find(p => p.id === botFormData.personality_id)
                        if (!selectedPersonality) return null
                        return (
                          <div>
                            <p className="text-sm text-purple-800 font-medium">{selectedPersonality.name}</p>
                            <p className="text-xs text-purple-700 mt-1">{selectedPersonality.description}</p>
                            <div className="flex flex-wrap gap-1 mt-2">
                              {Object.entries(selectedPersonality.traits || {}).slice(0, 3).map(([key, value]) => (
                                <span key={key} className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded">
                                  {key}: {value}
                                </span>
                              ))}
                            </div>
                          </div>
                        )
                      })()}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
                  <textarea
                    value={botFormData.bio || ''}
                    onChange={(e) => setBotFormData({ ...botFormData, bio: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-gray-900"
                    placeholder="Bot biography and personality description..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Expertise Areas (max 5)
                  </label>
                  
                  {/* Custom Input */}
                  <div className="flex gap-2 mb-3">
                    <input
                      type="text"
                      value={customExpertise}
                      onChange={(e) => setCustomExpertise(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault()
                          addExpertiseArea(customExpertise.trim())
                        }
                      }}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-gray-900"
                      placeholder="Type custom expertise area..."
                    />
                    <button
                      type="button"
                      onClick={() => addExpertiseArea(customExpertise.trim())}
                      disabled={!customExpertise.trim() || (botFormData.expertise_areas?.length || 0) >= 5}
                      className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-sm"
                    >
                      Add
                    </button>
                  </div>

                  {/* Quick Tags */}
                  <div className="mb-3">
                    <p className="text-xs text-gray-600 mb-2">Quick select:</p>
                    <div className="flex flex-wrap gap-2">
                      {predefinedExpertise.map((area) => (
                        <button
                          key={area}
                          type="button"
                          onClick={() => addExpertiseArea(area)}
                          disabled={(botFormData.expertise_areas?.length || 0) >= 5 || 
                                   (botFormData.expertise_areas || []).includes(area)}
                          className={`px-3 py-1 text-xs rounded-full border transition-colors ${
                            (botFormData.expertise_areas || []).includes(area)
                              ? 'bg-emerald-100 text-emerald-800 border-emerald-300 cursor-not-allowed'
                              : (botFormData.expertise_areas?.length || 0) >= 5
                              ? 'bg-gray-100 text-gray-400 border-gray-300 cursor-not-allowed'
                              : 'bg-white text-gray-700 border-gray-300 hover:bg-emerald-50 hover:border-emerald-300 cursor-pointer'
                          }`}
                        >
                          {area}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Selected Areas */}
                  {(botFormData.expertise_areas?.length || 0) > 0 && (
                    <div>
                      <p className="text-xs text-gray-600 mb-2">Selected ({botFormData.expertise_areas?.length || 0}/5):</p>
                      <div className="flex flex-wrap gap-2">
                        {(botFormData.expertise_areas || []).map((area: string, index: number) => (
                          <span
                            key={index}
                            className="inline-flex items-center gap-1 px-3 py-1 bg-emerald-100 text-emerald-800 text-sm rounded-full"
                          >
                            {area}
                            <button
                              type="button"
                              onClick={() => removeExpertiseArea(area)}
                              className="text-emerald-600 hover:text-emerald-800 ml-1"
                            >
                              ×
                            </button>
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">OpenAI Model</label>
                    <select
                      value={botFormData.openai_model || 'gpt-3.5-turbo'}
                      onChange={(e) => setBotFormData({ ...botFormData, openai_model: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-gray-900"
                    >
                      <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
                      <option value="gpt-4">GPT-4</option>
                      <option value="gpt-4-turbo">GPT-4 Turbo</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                    <select
                      value={botFormData.status || 'active'}
                      onChange={(e) => setBotFormData({ ...botFormData, status: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-gray-900"
                    >
                      <option value="active">Active</option>
                      <option value="paused">Paused</option>
                      <option value="archived">Archived</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="p-6 border-t border-gray-200 flex gap-3 justify-end">
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmitBot}
                  disabled={isSubmitting || !botFormData.name || !botFormData.username}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    isSubmitting || !botFormData.name || !botFormData.username
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-emerald-600 text-white hover:bg-emerald-700'
                  }`}
                >
                  {isSubmitting ? 'Saving...' : editingBot ? 'Update Bot' : 'Create Bot'}
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {/* Bot Details Modal */}
        {showBotDetails && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <motion.div 
              className="bg-white rounded-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">{showBotDetails.name}</h3>
                    <p className="text-gray-600">@{showBotDetails.username}</p>
                  </div>
                  <button 
                    onClick={() => setShowBotDetails(null)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    ✕
                  </button>
                </div>
              </div>

              <div className="p-6 space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3">Bot Information</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Type:</span>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${getTypeColor(showBotDetails.type)}`}>
                          {showBotDetails.type}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Status:</span>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(showBotDetails.status)}`}>
                          {showBotDetails.status}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Activity Level:</span>
                        <span className="font-medium">{showBotDetails.activity_level}/10</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Model:</span>
                        <span className="font-medium">{showBotDetails.openai_model}</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3">Performance Stats</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Questions Posted:</span>
                        <span className="font-medium text-blue-600">{showBotDetails.stats.questions_posted}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Answers Posted:</span>
                        <span className="font-medium text-green-600">{showBotDetails.stats.answers_posted}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Helpful Votes:</span>
                        <span className="font-medium text-purple-600">{showBotDetails.stats.helpful_votes_received}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Coins Earned:</span>
                        <span className="font-medium text-yellow-600">{showBotDetails.stats.coins_earned}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">Bio</h4>
                  <p className="text-gray-700 bg-gray-50 p-3 rounded">{showBotDetails.bio || 'No bio provided'}</p>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">Expertise Areas</h4>
                  <div className="flex flex-wrap gap-2">
                    {showBotDetails.expertise_areas.length > 0 ? (
                      showBotDetails.expertise_areas.map((area: string, idx: number) => (
                        <span key={idx} className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">
                          {area}
                        </span>
                      ))
                    ) : (
                      <span className="text-gray-500 italic">No expertise areas defined</span>
                    )}
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">Manual Actions</h4>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleTriggerBotAction(showBotDetails.id, 'question')}
                      className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
                    >
                      Trigger Question
                    </button>
                    <button
                      onClick={() => handleTriggerBotAction(showBotDetails.id, 'answer')}
                      className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm"
                    >
                      Trigger Answer
                    </button>
                    <button
                      onClick={() => handleTriggerBotAction(showBotDetails.id, 'vote')}
                      className="px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 text-sm"
                    >
                      Trigger Vote
                    </button>
                  </div>
                </div>
              </div>

              <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
                <button
                  onClick={() => {
                    setShowBotDetails(null)
                    handleEditBot(showBotDetails)
                  }}
                  className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                >
                  Edit Bot
                </button>
                <button
                  onClick={() => setShowBotDetails(null)}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    )
  }

  const renderActiveSection = () => {
    switch (activeSection) {
      case 'overview':
        return <OverviewSection />
      case 'users':
        return <UsersSection />
      case 'coaches':
        return <CoachesSection />
      case 'milestones':
        return <MilestonesSection />
      case 'learning':
        return <LearningSystemSection />
      case 'pricing':
        return <div className="bg-white rounded-xl p-8 text-center">
          <DollarSign className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Pricing Management</h3>
          <p className="text-gray-600">Pricing plans and billing management coming soon...</p>
        </div>
      case 'analytics':
        return <div className="bg-white rounded-xl p-8 text-center">
          <TrendingUp className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Analytics Dashboard</h3>
          <p className="text-gray-600">Advanced analytics and reporting coming soon...</p>
        </div>
      case 'bots':
        return <BotsSection />
      case 'moderation':
        return <ModerationSection />
      default:
        return <OverviewSection />
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading admin dashboard...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 text-xl mb-4">⚠️ Error</div>
          <p className="text-gray-600 mb-4">{error}</p>
          <button 
            onClick={loadAllData}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="px-6 py-4">
          <div className="flex items-center gap-3">
            <Shield className="h-8 w-8 text-blue-600" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">AlphaRise Admin</h1>
              <p className="text-sm text-gray-600">Complete System Management</p>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <nav className="w-64 bg-white border-r border-gray-200 min-h-screen">
          <div className="p-6">
            <div className="space-y-2">
              {navigationItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveSection(item.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    activeSection === item.id
                      ? 'bg-blue-50 text-blue-700 border border-blue-200'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <item.icon className={`h-4 w-4 ${activeSection === item.id ? 'text-blue-600' : 'text-gray-500'}`} />
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        </nav>

        {/* Main Content */}
        <main className="flex-1 p-8">
          {renderActiveSection()}
        </main>
      </div>
    </div>
  )
}