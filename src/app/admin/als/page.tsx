'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'
import { motion } from 'framer-motion'
import { 
  PlusIcon, 
  BookOpenIcon, 
  AcademicCapIcon,
  TrophyIcon,
  ChartBarIcon,
  Cog6ToothIcon,
  SparklesIcon,
  UserGroupIcon,
  DocumentTextIcon,
  LightBulbIcon
} from '@heroicons/react/24/outline'
import ModuleManager from '@/components/admin/ModuleManager'
import LessonManager from '@/components/admin/LessonManager'
import MicroLearningManager from '@/components/admin/MicroLearningManager'
import ChallengeManager from '@/components/admin/ChallengeManager'
import type { LearningModule } from '@/lib/als-types'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

interface AdminStats {
  totalModules: number
  totalLessons: number
  totalMicroLearnings: number
  totalChallenges: number
  totalUsers: number
  activeUsers: number
  completionRate: number
  avgConfidenceIncrease: number
  coachStats: {
    [key: string]: {
      modules: number
      lessons: number
      microLearnings: number
      challenges: number
    }
  }
}

export default function ALSAdminPage() {
  const [activeTab, setActiveTab] = useState('overview')
  const [selectedModule, setSelectedModule] = useState<LearningModule | null>(null)
  const [showModuleDetails, setShowModuleDetails] = useState(false)
  const [stats, setStats] = useState<AdminStats>({
    totalModules: 0,
    totalLessons: 0,
    totalMicroLearnings: 0,
    totalChallenges: 0,
    totalUsers: 0,
    activeUsers: 0,
    completionRate: 0,
    avgConfidenceIncrease: 0,
    coachStats: {}
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadStats()
  }, [])

  const loadStats = async () => {
    try {
      const coaches = ['blake', 'chase', 'logan', 'mason', 'knox']
      
      // Get modules count by coach
      const { data: modulesData, error: modulesError } = await supabase
        .from('learning_modules')
        .select('coach_id, id')
        .eq('is_active', true)
      
      // Get lessons count by coach (via module)
      const { data: lessonsData, error: lessonsError } = await supabase
        .from('lessons')
        .select('id, module_id')
        .eq('is_active', true)
      
      // Get micro learnings count by coach
      const { data: microLearningsData, error: microError } = await supabase
        .from('micro_learnings')
        .select('coach_id, id')
        .eq('is_active', true)
      
      // Get challenges count by coach
      const { data: challengesData, error: challengesError } = await supabase
        .from('daily_challenges')
        .select('coach_id, id')
        .eq('is_active', true)

      // Get users count
      const { count: usersCount } = await supabase
        .from('user_learning_profiles')
        .select('*', { count: 'exact', head: true })

      // Calculate stats by coach
      const coachStats: any = {}
      coaches.forEach(coach => {
        coachStats[coach] = {
          modules: modulesData?.filter(m => m.coach_id === coach).length || 0,
          lessons: 0,
          microLearnings: microLearningsData?.filter(ml => ml.coach_id === coach).length || 0,
          challenges: challengesData?.filter(c => c.coach_id === coach).length || 0
        }
      })

      // Calculate lessons per coach
      if (modulesData && lessonsData) {
        coaches.forEach(coach => {
          const coachModules = modulesData.filter(m => m.coach_id === coach)
          const moduleIds = coachModules.map(m => m.id)
          coachStats[coach].lessons = lessonsData.filter(l => moduleIds.includes(l.module_id)).length
        })
      }

      // Set the stats
      setStats({
        totalModules: modulesData?.length || 0,
        totalLessons: lessonsData?.length || 0,
        totalMicroLearnings: microLearningsData?.length || 0,
        totalChallenges: challengesData?.length || 0,
        totalUsers: usersCount || 0,
        activeUsers: 0, // We'll calculate this later
        completionRate: 0, // We'll calculate this later
        avgConfidenceIncrease: 0, // We'll calculate this later
        coachStats
      })
      
    } catch (error) {
      console.error('Error loading stats:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleModuleSelect = (module: LearningModule) => {
    setSelectedModule(module)
    setShowModuleDetails(true)
  }

  const adminTabs = [
    { id: 'overview', name: 'Overview', icon: ChartBarIcon },
    { id: 'modules', name: 'Learning Modules', icon: BookOpenIcon },
    { id: 'lessons', name: 'Lessons', icon: AcademicCapIcon },
    { id: 'micro', name: 'Micro-Learning', icon: LightBulbIcon },
    { id: 'challenges', name: 'Daily Challenges', icon: TrophyIcon },
    { id: 'achievements', name: 'Achievements', icon: SparklesIcon },
    { id: 'users', name: 'User Analytics', icon: UserGroupIcon },
    { id: 'ai', name: 'AI Paths', icon: Cog6ToothIcon }
  ]

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-900 to-purple-900 border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center space-x-4"
          >
            <div className="p-3 bg-white/10 rounded-xl">
              <SparklesIcon className="h-8 w-8 text-indigo-400" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">
                Adaptive Learning System
              </h1>
              <p className="text-indigo-200 mt-1">
                Manage content, track performance, and optimize learning experiences
              </p>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Stats Overview */}
        {activeTab === 'overview' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-6 mb-8">
              <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">Total Modules</p>
                    <p className="text-2xl font-bold text-white">{stats.totalModules}</p>
                  </div>
                  <BookOpenIcon className="h-8 w-8 text-blue-400" />
                </div>
              </div>

              <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">Total Lessons</p>
                    <p className="text-2xl font-bold text-white">{stats.totalLessons}</p>
                  </div>
                  <AcademicCapIcon className="h-8 w-8 text-green-400" />
                </div>
              </div>

              <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">Micro-Learnings</p>
                    <p className="text-2xl font-bold text-white">{stats.totalMicroLearnings}</p>
                  </div>
                  <LightBulbIcon className="h-8 w-8 text-yellow-400" />
                </div>
              </div>

              <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">Daily Challenges</p>
                    <p className="text-2xl font-bold text-white">{stats.totalChallenges}</p>
                  </div>
                  <TrophyIcon className="h-8 w-8 text-orange-400" />
                </div>
              </div>

              <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">Total Users</p>
                    <p className="text-2xl font-bold text-white">{stats.totalUsers}</p>
                  </div>
                  <UserGroupIcon className="h-8 w-8 text-purple-400" />
                </div>
              </div>

              <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">Active Users</p>
                    <p className="text-2xl font-bold text-white">{stats.activeUsers}</p>
                  </div>
                  <UserGroupIcon className="h-8 w-8 text-emerald-400" />
                </div>
              </div>

              <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">Completion Rate</p>
                    <p className="text-2xl font-bold text-white">{stats.completionRate}%</p>
                  </div>
                  <TrophyIcon className="h-8 w-8 text-orange-400" />
                </div>
              </div>

              <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">Avg Confidence +</p>
                    <p className="text-2xl font-bold text-white">+{stats.avgConfidenceIncrease}</p>
                  </div>
                  <ChartBarIcon className="h-8 w-8 text-yellow-400" />
                </div>
              </div>
            </div>

            {/* Coach Statistics */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="mt-8"
            >
              <h3 className="text-xl font-semibold text-white mb-6">Coach Content Statistics</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                {Object.entries(stats.coachStats).map(([coach, coachStat]) => {
                  const getCoachColor = (coachId: string) => {
                    const colorMap: { [key: string]: string } = {
                      'blake': 'from-purple-500 to-pink-500',
                      'chase': 'from-red-500 to-orange-500', 
                      'logan': 'from-blue-500 to-cyan-500',
                      'mason': 'from-green-500 to-emerald-500',
                      'knox': 'from-yellow-500 to-amber-500'
                    }
                    return colorMap[coachId] || 'from-gray-500 to-gray-600'
                  }

                  return (
                    <div key={coach} className="bg-gray-800 rounded-xl p-4 border border-gray-700">
                      <div className="flex items-center mb-3">
                        <div className={`w-8 h-8 bg-gradient-to-r ${getCoachColor(coach)} rounded-full flex items-center justify-center mr-3`}>
                          <span className="text-white text-sm font-bold">
                            {coach.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <h4 className="font-semibold text-white capitalize">{coach}</h4>
                      </div>
                      
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-400">Modules:</span>
                          <span className="text-white font-semibold">{coachStat.modules}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Lessons:</span>
                          <span className="text-white font-semibold">{coachStat.lessons}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Micro:</span>
                          <span className="text-white font-semibold">{coachStat.microLearnings}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Challenges:</span>
                          <span className="text-white font-semibold">{coachStat.challenges}</span>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* Navigation Tabs */}
        <div className="border-b border-gray-700 mb-8">
          <nav className="-mb-px flex space-x-8">
            {adminTabs.map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`${
                    activeTab === tab.id
                      ? 'border-indigo-500 text-indigo-400'
                      : 'border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-300'
                  } whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 transition-colors`}
                >
                  <Icon className="h-5 w-5" />
                  <span>{tab.name}</span>
                </button>
              )
            })}
          </nav>
        </div>

        {/* Content Area */}
        <div className="bg-gray-800 rounded-xl border border-gray-700 p-8">
          {activeTab === 'overview' && (
            <div className="space-y-8">
              <h2 className="text-2xl font-bold text-white mb-6">System Overview</h2>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-gray-700/50 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-white mb-4">Quick Actions</h3>
                  <div className="space-y-3">
                    <button 
                      onClick={() => setActiveTab('modules')}
                      className="w-full flex items-center space-x-3 p-3 bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors"
                    >
                      <PlusIcon className="h-5 w-5" />
                      <span>Create New Module</span>
                    </button>
                    <button 
                      onClick={() => setActiveTab('lessons')}
                      className="w-full flex items-center space-x-3 p-3 bg-green-600 hover:bg-green-700 rounded-lg transition-colors"
                    >
                      <PlusIcon className="h-5 w-5" />
                      <span>Add New Lesson</span>
                    </button>
                    <button 
                      onClick={() => setActiveTab('challenges')}
                      className="w-full flex items-center space-x-3 p-3 bg-orange-600 hover:bg-orange-700 rounded-lg transition-colors"
                    >
                      <PlusIcon className="h-5 w-5" />
                      <span>Create Challenge</span>
                    </button>
                  </div>
                </div>

                <div className="bg-gray-700/50 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-white mb-4">Recent Activity</h3>
                  <div className="space-y-3 text-sm text-gray-300">
                    <div className="flex justify-between">
                      <span>New users today</span>
                      <span className="text-green-400">+12</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Lessons completed</span>
                      <span className="text-blue-400">156</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Achievements unlocked</span>
                      <span className="text-yellow-400">23</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Average session time</span>
                      <span className="text-purple-400">18 min</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'modules' && <ModuleManager onModuleSelect={handleModuleSelect} />}
          {activeTab === 'lessons' && <LessonManager />}
          {activeTab === 'micro' && <MicroLearningManager />}
          {activeTab === 'challenges' && <ChallengeManager />}
          
          {!['overview', 'modules', 'lessons', 'micro', 'challenges'].includes(activeTab) && (
            <div className="text-center py-12">
              <div className="bg-gray-700/50 rounded-lg p-8 max-w-md mx-auto">
                <DocumentTextIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">
                  {adminTabs.find(tab => tab.id === activeTab)?.name} Management
                </h3>
                <p className="text-gray-400 mb-6">
                  Content management interface coming soon...
                </p>
                <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg transition-colors">
                  Build Interface
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Module Details Modal */}
      {showModuleDetails && selectedModule && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowModuleDetails(false)
              setSelectedModule(null)
            }
          }}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-gray-800 rounded-lg p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-gray-600"
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-white">Module Details</h2>
              <button
                onClick={() => {
                  setShowModuleDetails(false)
                  setSelectedModule(null)
                }}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-6">
              {/* Module Header */}
              <div className="bg-gray-700/50 rounded-lg p-4">
                <div className="flex items-center space-x-3 mb-3">
                  <span className="bg-indigo-600 text-white px-3 py-1 rounded text-sm font-semibold">
                    {selectedModule.coach_id?.toUpperCase()}
                  </span>
                  <span className="bg-gray-600 text-white px-3 py-1 rounded text-sm">
                    {selectedModule.module_code}
                  </span>
                  {selectedModule.is_premium && (
                    <span className="bg-yellow-600 text-white px-3 py-1 rounded text-sm">
                      PREMIUM
                    </span>
                  )}
                </div>
                <h3 className="text-xl font-bold text-white mb-2">{selectedModule.title}</h3>
                {selectedModule.subtitle && (
                  <p className="text-lg text-gray-300 mb-3">{selectedModule.subtitle}</p>
                )}
                <p className="text-gray-400">{selectedModule.description}</p>
              </div>

              {/* Module Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-gray-700/50 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-blue-400">{selectedModule.difficulty_level}</div>
                  <div className="text-sm text-gray-400">Difficulty Level</div>
                </div>
                <div className="bg-gray-700/50 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-green-400">{selectedModule.estimated_duration}</div>
                  <div className="text-sm text-gray-400">Duration (min)</div>
                </div>
                <div className="bg-gray-700/50 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-yellow-400">{selectedModule.unlock_at_score}</div>
                  <div className="text-sm text-gray-400">Unlock Score</div>
                </div>
                <div className="bg-gray-700/50 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-purple-400">{selectedModule.order_priority}</div>
                  <div className="text-sm text-gray-400">Priority</div>
                </div>
              </div>

              {/* Tags */}
              {selectedModule.tags && selectedModule.tags.length > 0 && (
                <div className="bg-gray-700/50 rounded-lg p-4">
                  <h4 className="text-lg font-semibold text-white mb-3">Tags</h4>
                  <div className="flex flex-wrap gap-2">
                    {(Array.isArray(selectedModule.tags) ? selectedModule.tags : []).map((tag: string, index: number) => (
                      <span key={index} className="bg-gray-600 text-gray-200 px-3 py-1 rounded-full text-sm">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Module Status */}
              <div className="bg-gray-700/50 rounded-lg p-4">
                <h4 className="text-lg font-semibold text-white mb-3">Status</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <span className="text-gray-400">Status: </span>
                    <span className={`font-semibold ${selectedModule.is_active ? 'text-green-400' : 'text-red-400'}`}>
                      {selectedModule.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-400">Created: </span>
                    <span className="text-white">
                      {selectedModule.created_at ? new Date(selectedModule.created_at).toLocaleDateString() : 'N/A'}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-400">Updated: </span>
                    <span className="text-white">
                      {selectedModule.updated_at ? new Date(selectedModule.updated_at).toLocaleDateString() : 'N/A'}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-400">Module ID: </span>
                    <span className="text-white font-mono text-sm">{selectedModule.id}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => {
                  setShowModuleDetails(false)
                  setSelectedModule(null)
                }}
                className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-2 rounded-lg transition-colors"
              >
                Close
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  )
}