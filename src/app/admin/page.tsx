'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  Shield, Users, BookOpen, Trophy, Target, DollarSign, 
  MessageSquare, Settings, Plus, Edit, Trash2, Eye,
  BarChart3, TrendingUp, Calendar, Activity 
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
  DbPricingPlan 
} from '@/lib/supabase'

interface AdminStats {
  totalUsers: number
  totalCoaches: number
  totalProblems: number
  totalExercises: number
  totalMilestones: number
  recentSignups: number
}

type AdminSection = 'overview' | 'users' | 'coaches' | 'learning' | 'milestones' | 'pricing' | 'analytics'

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
  
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Load all data
  useEffect(() => {
    loadAllData()
  }, [])

  // Load learning data when learning section is active
  useEffect(() => {
    if (activeSection === 'learning') {
      loadLearningData()
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

  const navigationItems = [
    { id: 'overview' as AdminSection, label: 'Overview', icon: BarChart3, color: 'text-blue-600' },
    { id: 'users' as AdminSection, label: 'Users', icon: Users, color: 'text-green-600' },
    { id: 'coaches' as AdminSection, label: 'Coaches', icon: Shield, color: 'text-purple-600' },
    { id: 'learning' as AdminSection, label: 'Learning System', icon: BookOpen, color: 'text-orange-600' },
    { id: 'milestones' as AdminSection, label: 'Milestones', icon: Trophy, color: 'text-yellow-600' },
    { id: 'pricing' as AdminSection, label: 'Pricing', icon: DollarSign, color: 'text-red-600' },
    { id: 'analytics' as AdminSection, label: 'Analytics', icon: TrendingUp, color: 'text-indigo-600' },
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

  const OverviewSection = () => (
    <div className="space-y-8">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
      setFormData({ ...item })
      setEditingItem(item)
      setShowCreateModal(true)
    }

    const handleSubmit = async () => {
      setIsSubmitting(true)
      try {
        let success = false
        
        if (activeTab === 'problems') {
          if (editingItem) {
            const result = await SupabaseLearningManager.updateProblem(editingItem.id, formData)
            success = !!result
          } else {
            const result = await SupabaseLearningManager.createProblem(formData)
            success = !!result
          }
        } else {
          if (editingItem) {
            console.log('Editing exercise:', editingItem.id, 'with formData:', formData)
            const result = await SupabaseLearningManager.updateExercise(editingItem.id, formData)
            success = !!result
          } else {
            const result = await SupabaseLearningManager.createExercise(formData)
            success = !!result
          }
        }

        if (success) {
          setShowCreateModal(false)
          setEditingItem(null)
          setFormData({})
          // Reload data
          await loadLearningData()
          await loadAllData() // Update stats
        } else {
          console.error('Failed to save - no result returned')
        }
      } catch (error) {
        console.error('Error saving:', error)
        alert('Error updating exercise: ' + (error as Error).message)
      } finally {
        setIsSubmitting(false)
      }
    }

    const handleDelete = async (item: any) => {
      if (!confirm(`Are you sure you want to delete this ${activeTab.slice(0, -1)}?`)) return
      
      try {
        let success = false
        if (activeTab === 'problems') {
          success = await SupabaseLearningManager.deleteProblem(item.id)
        } else {
          success = await SupabaseLearningManager.deleteExercise(item.id)
        }

        if (success) {
          await loadLearningData()
          await loadAllData()
        }
      } catch (error) {
        console.error('Error deleting:', error)
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
              <div key={userType} className={`px-3 py-2 rounded-lg border ${color} flex flex-col items-center text-center`}>
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
                {problems.map((problem) => (
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
                  {exercises.map((exercise) => (
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