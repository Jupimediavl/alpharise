'use client'

import { useState, useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { ArrowRight, Clock, Trophy, Star, CheckCircle, Circle, Lock } from 'lucide-react'
import { SupabaseUserManager, SupabaseLearningManager, DbProblem, DbExercise, DbUserExerciseProgress, DbMilestone } from '@/lib/supabase'

export default function LearningPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [problems, setProblems] = useState<DbProblem[]>([])
  const [userProgress, setUserProgress] = useState<DbUserExerciseProgress[]>([])
  const [milestones, setMilestones] = useState<DbMilestone[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [currentConfidence, setCurrentConfidence] = useState(0)

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true)
        
        const username = searchParams.get('username')
        if (!username) {
          router.push('/signup')
          return
        }

        // Load user data
        const userData = await SupabaseUserManager.getUserByUsername(username)
        if (!userData) {
          router.push('/signup')
          return
        }
        setUser(userData)
        setCurrentConfidence(userData.confidence_score || 0)

        // Load problems for user type or specific module
        const module = searchParams.get('module')
        const userTypeOrModule = module || userData.coach
        const problemsData = await SupabaseLearningManager.getProblemsForUserType(userTypeOrModule)
        setProblems(problemsData)

        // Load user progress
        const progressData = await SupabaseLearningManager.getUserProgress(userData.username)
        setUserProgress(progressData)

        // Load milestones
        const milestonesData = await SupabaseLearningManager.getMilestones()
        setMilestones(milestonesData)

      } catch (error) {
        console.error('Error loading learning data:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [searchParams, router])

  // Calculate progress statistics
  const getProgressStats = () => {
    const completedExercises = userProgress.filter(p => p.status === 'completed')
    const totalPoints = completedExercises.reduce((sum, p) => sum + p.points_earned, 0)
    const totalExercises = problems.reduce((sum, p) => sum + (p.total_exercises || 0), 0)
    const completedCount = completedExercises.length

    return {
      totalPoints: currentConfidence + totalPoints,
      completedExercises: completedCount,
      totalExercises,
      progressPercentage: totalExercises > 0 ? (completedCount / totalExercises) * 100 : 0
    }
  }

  // Get current milestone
  const getCurrentMilestone = (currentPoints: number) => {
    return milestones
      .filter(m => m.points_required <= currentPoints)
      .sort((a, b) => b.points_required - a.points_required)[0]
  }

  // Get next milestone
  const getNextMilestone = (currentPoints: number) => {
    return milestones.find(m => m.points_required > currentPoints)
  }

  // Get problem progress
  const getProblemProgress = (problemId: string) => {
    const problemProgress = userProgress.filter(p => p.problem_id === problemId && p.status === 'completed')
    return problemProgress.length
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🧠</div>
          <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-500 via-magenta-500 to-pink-500 bg-clip-text text-transparent">
            Loading your learning path...
          </h2>
        </div>
      </div>
    )
  }

  if (!user) return null

  const stats = getProgressStats()
  const currentMilestone = getCurrentMilestone(stats.totalPoints)
  const nextMilestone = getNextMilestone(stats.totalPoints)

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white">
      {/* Header */}
      <header className="p-6 flex justify-between items-center border-b border-purple-500/20">
        <button
          onClick={() => router.push(`/dashboard?username=${user.username}`)}
          className="text-2xl font-black text-white hover:text-purple-400 transition-colors"
        >
          ← AlphaRise
        </button>
        <div className="flex items-center gap-4">
          <div className="bg-gradient-to-r from-yellow-500/20 to-amber-500/20 text-white px-3 py-1 rounded-full text-sm font-semibold flex items-center gap-1 border border-yellow-500/30">
            <Trophy className="w-4 h-4" />
            {stats.totalPoints} points
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8 max-w-6xl">
        {/* Progress Overview */}
        <motion.div 
          className="mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-4xl font-bold mb-2">
            {searchParams.get('module') === 'intimacy_boost' ? '💕 Intimacy Boost Module' :
             searchParams.get('module') === 'body_confidence' ? '💪 Body Confidence Module' :
             'Your Learning Journey'}
          </h1>
          <p className="text-gray-400 mb-6">
            {searchParams.get('module') === 'intimacy_boost' ? 'Master deep connections and authentic relationships through vulnerability, emotional intelligence, and meaningful communication.' :
             searchParams.get('module') === 'body_confidence' ? 'Transform your physical presence and energy through body language mastery, posture, and commanding presence.' :
             <>Solve problems designed specifically for <span className="text-purple-400 capitalize">{user.user_type}</span> users</>}
          </p>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className={`bg-gradient-to-r rounded-xl p-4 ${
              searchParams.get('module') === 'intimacy_boost' ? 'from-red-500/10 to-pink-500/10 border border-red-500/20' :
              searchParams.get('module') === 'body_confidence' ? 'from-orange-500/10 to-yellow-500/10 border border-orange-500/20' :
              'from-purple-500/10 to-magenta-500/10 border border-purple-500/20'
            }`}>
              <div className="flex items-center gap-3">
                <CheckCircle className="w-8 h-8 text-green-400" />
                <div>
                  <div className="text-2xl font-bold text-white">{stats.completedExercises}</div>
                  <div className="text-sm text-gray-400">Exercises Completed</div>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-yellow-500/10 to-amber-500/10 border border-yellow-500/20 rounded-xl p-4">
              <div className="flex items-center gap-3">
                <Trophy className="w-8 h-8 text-yellow-400" />
                <div>
                  <div className="text-2xl font-bold text-white">{stats.totalPoints}</div>
                  <div className="text-sm text-gray-400">Confidence Points</div>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20 rounded-xl p-4">
              <div className="flex items-center gap-3">
                <Star className="w-8 h-8 text-blue-400" />
                <div>
                  <div className="text-2xl font-bold text-white">{Math.round(stats.progressPercentage)}%</div>
                  <div className="text-sm text-gray-400">Progress</div>
                </div>
              </div>
            </div>
          </div>

          {/* Milestone Progress */}
          <div className="bg-gradient-to-r from-pink-500/10 to-purple-500/10 border border-pink-500/20 rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-4">
                {/* Current Milestone */}
                {currentMilestone && (
                  <div className="flex items-center gap-2">
                    <div className="text-xl">{currentMilestone.badge_icon}</div>
                    <div>
                      <div className="text-sm text-green-400">Current:</div>
                      <div className="font-semibold text-white text-sm">{currentMilestone.title}</div>
                    </div>
                  </div>
                )}
                
                {/* Arrow */}
                {currentMilestone && nextMilestone && (
                  <ArrowRight className="w-4 h-4 text-gray-400" />
                )}
                
                {/* Next Milestone */}
                {nextMilestone && (
                  <div className="flex items-center gap-2">
                    <div className="text-xl">{nextMilestone.badge_icon}</div>
                    <div>
                      <div className="text-sm text-purple-400">Next:</div>
                      <div className="font-semibold text-white text-sm">{nextMilestone.title}</div>
                    </div>
                  </div>
                )}
              </div>
              
              {nextMilestone && (
                <div className="text-sm text-gray-400">
                  {nextMilestone.points_required - stats.totalPoints} points to go
                </div>
              )}
            </div>
            
            {nextMilestone && (
              <div className="bg-gray-800 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-pink-500 to-purple-500 h-2 rounded-full transition-all duration-500"
                  style={{ 
                    width: `${Math.min(100, (stats.totalPoints / nextMilestone.points_required) * 100)}%` 
                  }}
                />
              </div>
            )}
            
            {!nextMilestone && currentMilestone && (
              <div className="text-center py-2">
                <div className="text-green-400 font-semibold">🎉 Congratulations! You've reached the highest milestone!</div>
              </div>
            )}
          </div>
        </motion.div>

        {/* Problems List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <span>🎯</span> 
            Your Problems to Solve
          </h2>
          
          <div className="grid gap-4">
            {problems.map((problem, index) => {
              const completedExercises = getProblemProgress(problem.id)
              // For now, we'll assume 4 exercises per problem (as per our dummy data)
              const totalExercises = 4
              const isCompleted = completedExercises >= totalExercises
              
              return (
                <motion.div
                  key={problem.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  className={`border rounded-xl p-6 transition-all cursor-pointer hover:scale-[1.02] ${
                    isCompleted 
                      ? 'bg-green-500/10 border-green-500/30 hover:bg-green-500/20' 
                      : 'bg-gradient-to-r from-purple-500/10 to-magenta-500/10 border-purple-500/20 hover:bg-purple-500/20'
                  }`}
                  onClick={() => {
                    const module = searchParams.get('module')
                    const moduleParam = module ? `&module=${module}` : ''
                    router.push(`/learning/problem/${problem.id}?username=${user.username}${moduleParam}`)
                  }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="flex items-center gap-2">
                          {isCompleted ? (
                            <CheckCircle className="w-6 h-6 text-green-400" />
                          ) : (
                            <Circle className="w-6 h-6 text-gray-400" />
                          )}
                          <span className="bg-purple-500/20 text-purple-300 px-2 py-1 rounded-full text-xs">
                            Problem {problem.order_index}
                          </span>
                        </div>
                      </div>
                      
                      <h3 className="text-xl font-bold text-white mb-2">{problem.title}</h3>
                      <p className="text-gray-400 mb-4">{problem.description}</p>
                      
                      <div className="flex items-center gap-4 text-sm">
                        <div className="flex items-center gap-1 text-gray-400">
                          <CheckCircle className="w-4 h-4" />
                          <span>{completedExercises}/{totalExercises} exercises</span>
                        </div>
                        <div className="flex items-center gap-1 text-gray-400">
                          <Clock className="w-4 h-4" />
                          <span>~{totalExercises * 15} min total</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex flex-col items-end gap-2">
                      <ArrowRight className="w-6 h-6 text-gray-400 group-hover:translate-x-1 transition-transform" />
                      <div className="bg-gray-800 rounded-full h-2 w-32">
                        <div 
                          className={`h-2 rounded-full transition-all duration-500 ${
                            isCompleted 
                              ? 'bg-gradient-to-r from-green-500 to-emerald-500' 
                              : 'bg-gradient-to-r from-purple-500 to-magenta-500'
                          }`}
                          style={{ 
                            width: `${(completedExercises / (problem.total_exercises || 1)) * 100}%` 
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </div>
        </motion.div>
      </div>
    </div>
  )
}