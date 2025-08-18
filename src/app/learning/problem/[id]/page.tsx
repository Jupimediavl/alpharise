'use client'

import { useState, useEffect } from 'react'
import { useParams, useSearchParams, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { ArrowLeft, Clock, Trophy, CheckCircle, Circle, Play, Star } from 'lucide-react'
import { SupabaseUserManager, SupabaseLearningManager, DbProblem, DbSolution, DbUserSolutionProgress } from '@/lib/supabase'

export default function ProblemPage() {
  const params = useParams()
  const searchParams = useSearchParams()
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [problem, setProblem] = useState<DbProblem | null>(null)
  const [solutions, setSolutions] = useState<DbSolution[]>([])
  const [userProgress, setUserProgress] = useState<DbUserSolutionProgress[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [completingSolution, setCompletingSolution] = useState<string | null>(null)

  const problemId = params.id as string

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

        // Load problem data
        const problemsData = await SupabaseLearningManager.getProblemsForUserType(userData.user_type)
        const currentProblem = problemsData.find(p => p.id === problemId)
        
        if (!currentProblem) {
          router.push(`/learning?username=${username}`)
          return
        }
        setProblem(currentProblem)

        // Load solutions
        const solutionsData = await SupabaseLearningManager.getSolutionsForProblem(problemId)
        setSolutions(solutionsData)

        // Load user progress
        const progressData = await SupabaseLearningManager.getUserProgress(userData.username)
        setUserProgress(progressData.filter(p => p.problem_id === problemId))

      } catch (error) {
        console.error('Error loading problem data:', error)
      } finally {
        setIsLoading(false)
      }
    }

    if (problemId) {
      loadData()
    }
  }, [problemId, searchParams, router])

  // Handle solution completion
  const handleCompleteSolution = async (solutionId: string) => {
    if (!user || completingSolution) return

    setCompletingSolution(solutionId)
    
    try {
      const pointsEarned = await SupabaseLearningManager.completeSolution(
        user.username, 
        user.username, 
        solutionId, 
        problemId
      )

      if (pointsEarned > 0) {
        // Update local progress
        const newProgress = {
          id: `temp-${Date.now()}`,
          user_id: user.username,
          username: user.username,
          solution_id: solutionId,
          problem_id: problemId,
          status: 'completed' as const,
          points_earned: pointsEarned,
          completed_at: new Date().toISOString(),
          started_at: new Date().toISOString(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }

        setUserProgress(prev => {
          const existing = prev.find(p => p.solution_id === solutionId)
          if (existing) {
            return prev.map(p => p.solution_id === solutionId ? { ...p, ...newProgress } : p)
          }
          return [...prev, newProgress]
        })

        // Show success feedback
        console.log(`🎉 Solution completed! +${pointsEarned} confidence points`)
      }
    } catch (error) {
      console.error('Error completing solution:', error)
    } finally {
      setCompletingSolution(null)
    }
  }

  // Get solution progress
  const getSolutionProgress = (solutionId: string) => {
    return userProgress.find(p => p.solution_id === solutionId)
  }

  // Get difficulty info
  const getDifficultyInfo = (difficulty: string) => {
    const info = {
      easy: { color: 'text-green-400', bg: 'bg-green-500/10 border-green-500/20', points: 5 },
      medium: { color: 'text-yellow-400', bg: 'bg-yellow-500/10 border-yellow-500/20', points: 10 },
      hard: { color: 'text-red-400', bg: 'bg-red-500/10 border-red-500/20', points: 15 }
    }
    return info[difficulty as keyof typeof info] || info.easy
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🎯</div>
          <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-500 via-magenta-500 to-pink-500 bg-clip-text text-transparent">
            Loading problem...
          </h2>
        </div>
      </div>
    )
  }

  if (!user || !problem) return null

  const completedSolutions = userProgress.filter(p => p.status === 'completed').length
  const totalPoints = userProgress.filter(p => p.status === 'completed').reduce((sum, p) => sum + p.points_earned, 0)

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white">
      {/* Header */}
      <header className="p-6 flex justify-between items-center border-b border-purple-500/20">
        <button
          onClick={() => router.push(`/learning?username=${user.username}`)}
          className="flex items-center gap-2 text-white hover:text-purple-400 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="text-xl font-bold">Learning</span>
        </button>
        <div className="flex items-center gap-4">
          <div className="bg-gradient-to-r from-yellow-500/20 to-amber-500/20 text-white px-3 py-1 rounded-full text-sm font-semibold flex items-center gap-1 border border-yellow-500/30">
            <Trophy className="w-4 h-4" />
            +{totalPoints} points from this problem
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8 max-w-4xl">
        {/* Problem Header */}
        <motion.div 
          className="mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center gap-3 mb-4">
            <span className="bg-purple-500/20 text-purple-300 px-3 py-1 rounded-full text-sm">
              Problem {problem.order_index}
            </span>
            <span className="bg-gray-700 text-gray-300 px-3 py-1 rounded-full text-sm capitalize">
              {user.user_type}
            </span>
          </div>

          <h1 className="text-4xl font-bold mb-4">{problem.title}</h1>
          <p className="text-xl text-gray-300 mb-6">{problem.description}</p>

          {/* Progress Overview */}
          <div className="bg-gradient-to-r from-purple-500/10 to-magenta-500/10 border border-purple-500/20 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Your Progress</h3>
              <div className="text-sm text-gray-400">
                {completedSolutions}/{solutions.length} solutions completed
              </div>
            </div>
            
            <div className="bg-gray-800 rounded-full h-3 mb-2">
              <div 
                className="bg-gradient-to-r from-purple-500 to-magenta-500 h-3 rounded-full transition-all duration-500"
                style={{ 
                  width: `${solutions.length > 0 ? (completedSolutions / solutions.length) * 100 : 0}%` 
                }}
              />
            </div>
          </div>
        </motion.div>

        {/* Solutions List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <span>💡</span> 
            Solutions to Try
          </h2>
          
          <div className="space-y-4">
            {solutions.map((solution, index) => {
              const progress = getSolutionProgress(solution.id)
              const isCompleted = progress?.status === 'completed'
              const difficultyInfo = getDifficultyInfo(solution.difficulty)
              const isCurrentlyCompleting = completingSolution === solution.id
              
              return (
                <motion.div
                  key={solution.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  className={`border rounded-xl p-6 transition-all ${
                    isCompleted 
                      ? 'bg-green-500/10 border-green-500/30' 
                      : 'bg-gradient-to-r from-purple-500/5 to-magenta-500/5 border-purple-500/20 hover:bg-purple-500/10'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="flex items-center gap-2">
                          {isCompleted ? (
                            <CheckCircle className="w-6 h-6 text-green-400" />
                          ) : (
                            <Circle className="w-6 h-6 text-gray-400" />
                          )}
                          <span className="bg-gray-700 text-gray-300 px-2 py-1 rounded-full text-xs">
                            Solution {solution.order_index}
                          </span>
                        </div>
                        <div className={`px-2 py-1 rounded-full text-xs border ${difficultyInfo.bg} ${difficultyInfo.color}`}>
                          {solution.difficulty.toUpperCase()}
                        </div>
                      </div>
                      
                      <h3 className="text-xl font-bold text-white mb-2">{solution.title}</h3>
                      <p className="text-gray-400 mb-4">{solution.description}</p>
                      
                      <div className="flex items-center gap-4 text-sm text-gray-400 mb-4">
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          <span>~{solution.estimated_minutes} min</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Trophy className="w-4 h-4" />
                          <span>+{solution.points_reward} points</span>
                        </div>
                      </div>

                      {/* Solution Content Preview */}
                      <div className="bg-gray-900/50 rounded-lg p-4 mb-4">
                        <p className="text-gray-300 text-sm">
                          {solution.content || 'Solution content will be available here...'}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Action Button */}
                  <div className="flex justify-end">
                    {isCompleted ? (
                      <div className="flex items-center gap-2 bg-green-500/20 text-green-400 px-4 py-2 rounded-lg">
                        <CheckCircle className="w-5 h-5" />
                        <span>Completed (+{progress?.points_earned} pts)</span>
                      </div>
                    ) : (
                      <button
                        onClick={() => handleCompleteSolution(solution.id)}
                        disabled={isCurrentlyCompleting}
                        className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all ${
                          isCurrentlyCompleting
                            ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                            : 'bg-gradient-to-r from-purple-600 to-magenta-600 hover:from-purple-700 hover:to-magenta-700 text-white hover:scale-105'
                        }`}
                      >
                        {isCurrentlyCompleting ? (
                          <>
                            <div className="w-5 h-5 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
                            <span>Completing...</span>
                          </>
                        ) : (
                          <>
                            <Play className="w-5 h-5" />
                            <span>Mark as Complete</span>
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </motion.div>
              )
            })}
          </div>
        </motion.div>

        {/* Problem Complete Message */}
        {completedSolutions >= solutions.length && solutions.length > 0 && (
          <motion.div 
            className="mt-8 bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/30 rounded-xl p-6 text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
          >
            <div className="text-4xl mb-3">🎉</div>
            <h3 className="text-2xl font-bold text-green-400 mb-2">Problem Solved!</h3>
            <p className="text-gray-300 mb-4">
              You've completed all solutions for this problem. Great work!
            </p>
            <button
              onClick={() => router.push(`/learning?username=${user.username}`)}
              className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-6 py-3 rounded-lg font-semibold transition-all hover:scale-105"
            >
              Continue Learning
            </button>
          </motion.div>
        )}
      </div>
    </div>
  )
}