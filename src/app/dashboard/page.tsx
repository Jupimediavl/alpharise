'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'
import { 
  PlayIcon,
  CheckCircleIcon,
  LockClosedIcon,
  ArrowRightIcon,
  ChartBarIcon,
  ChatBubbleLeftRightIcon,
  HeartIcon
} from '@heroicons/react/24/outline'
import UserDropdownMenu from '@/components/UserDropdownMenu'
import ProblemConfirmationModal from '@/components/als/ProblemConfirmationModal'
import CoachSection from '@/components/CoachSection'
import { UserProblemsManager, type UserProblem, type ProblemStep } from '@/lib/user-problems-manager'
import { ALSCleanAdapter, type CleanUserProgress, type CleanLearningStep } from '@/lib/als-clean-adapter'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function CleanDashboard() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const [userProblems, setUserProblems] = useState<CleanUserProgress | null>(null)
  const [learningPath, setLearningPath] = useState<CleanLearningStep[]>([])
  const [currentStep, setCurrentStep] = useState<CleanLearningStep | null>(null)
  const [programTitle, setProgramTitle] = useState<string>('')
  const [useALS, setUseALS] = useState(
    true // ALS enabled - database tables are now created
  )
  
  // Modal states
  const [showProblemModal, setShowProblemModal] = useState(false)

  useEffect(() => {
    loadDashboard()
  }, [])

  const loadDashboard = async () => {
    try {
      // Get current user
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.user) {
        router.push('/login')
        return
      }

      // Get user data
      const { data: userData } = await supabase
        .from('users')
        .select('*')
        .eq('email', session.user.email)
        .single()

      if (!userData) {
        router.push('/signup')
        return
      }

      setUser(userData)

      if (useALS) {
        // Check if user has ALS profile
        const alsProgress = await ALSCleanAdapter.getUserProgress(userData.id)
        
        if (!alsProgress) {
          // First time user - show problem confirmation to set up ALS profile
          setShowProblemModal(true)
        } else {
          // Load ALS-powered learning path
          setUserProblems(alsProgress)
          
          // Get coach from user data or profile
          const coachId = userData.coach || 'logan'
          const path = await ALSCleanAdapter.getAdaptiveLearningPath(userData.id, coachId)
          setLearningPath(path)
          
          // Get program title from database
          const title = await getProgramTitle(userData.id, coachId)
          setProgramTitle(title)
          
          // Get AI-recommended current step
          const step = await ALSCleanAdapter.getCurrentStep(userData.id)
          setCurrentStep(step)
        }
      } else {
        // Fallback to original UserProblemsManager
        const problems = await UserProblemsManager.getUserProblems(userData.id)
        
        if (!problems) {
          setShowProblemModal(true)
        } else {
          // Convert to clean format for compatibility
          const cleanProgress: CleanUserProgress = {
            id: problems.id,
            user_id: problems.user_id,
            primary_problem: problems.primary_problem,
            additional_problems: problems.additional_problems,
            current_step: problems.current_step,
            completed_steps: problems.completed_steps,
            total_steps: problems.total_steps,
            created_at: new Date()
          }
          setUserProblems(cleanProgress)
          
          // Set fallback program title for non-ALS
          const fallbackTitles = {
            'premature_ejaculation': 'PE Recovery Program',
            'confidence_building': 'Confidence Building Program',
            'performance_anxiety': 'Performance Anxiety Program',
            'erectile_dysfunction': 'Erectile Function Program',
            'intimacy_communication': 'Intimacy Communication Program'
          }
          setProgramTitle(fallbackTitles[problems.primary_problem as keyof typeof fallbackTitles] || 'Personal Development Program')
          
          const path = UserProblemsManager.getLearningPath(problems.primary_problem).map(step => ({
            id: step.id,
            title: step.title,
            description: step.description,
            content_type: step.content_type as 'lesson' | 'practice' | 'assessment',
            estimated_minutes: step.estimated_minutes,
            required_for_progress: step.required_for_progress
          }))
          setLearningPath(path)
          
          const step = await UserProblemsManager.getCurrentStep(userData.id)
          if (step) {
            setCurrentStep({
              id: step.id,
              title: step.title,
              description: step.description,
              content_type: step.content_type as 'lesson' | 'practice' | 'assessment',
              estimated_minutes: step.estimated_minutes,
              required_for_progress: step.required_for_progress
            })
          }
        }
      }

    } catch (error) {
      console.error('Error loading dashboard:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleProblemConfirmation = async (primaryProblem: string, additionalProblems: string[]) => {
    if (!user) return

    if (useALS) {
      // Initialize ALS profile
      const alsProgress = await ALSCleanAdapter.initializeUserProfile(user.id, primaryProblem, additionalProblems)
      if (alsProgress) {
        setShowProblemModal(false)
        await loadDashboard() // Reload with ALS-powered content
      }
    } else {
      // Fallback to original system
      const success = await UserProblemsManager.saveUserProblems(user.id, primaryProblem, additionalProblems)
      if (success) {
        setShowProblemModal(false)
        await loadDashboard()
      }
    }
  }

  const handleStartStep = async (step: CleanLearningStep) => {
    console.log('Starting step:', step.title, 'ID:', step.id, 'Type:', typeof step.id)
    
    // Prevent default if triggered by a form/button
    if (typeof window !== 'undefined') {
      // Navigate to lesson/practice/assessment based on content_type
      const stepIdString = String(step.id)
      console.log('Navigating to:', `/learn/${stepIdString}`)
      router.push(`/learn/${stepIdString}`)
    }
  }

  const handleCompleteStep = async (stepId: number) => {
    if (!user) return
    
    if (useALS) {
      const success = await ALSCleanAdapter.completeStep(user.id, stepId)
      if (success) {
        await loadDashboard() // Refresh progress with AI insights
      }
    } else {
      const success = await UserProblemsManager.completeStep(user.id, stepId)
      if (success) {
        await loadDashboard() // Refresh progress
      }
    }
  }

  const getProgramTitle = async (userId: string, coachId: string) => {
    try {
      // Get the user's current active module from the database
      const { data: modules } = await supabase
        .from('learning_modules')
        .select('title, description')
        .eq('coach_id', coachId)
        .eq('is_active', true)
        .order('order_priority', { ascending: true })
        .limit(1)

      if (modules && modules.length > 0) {
        return modules[0].title || 'Personal Development Program'
      }
      
      // Fallback titles based on coach
      const fallbackTitles = {
        'chase': 'PE Recovery Program',
        'logan': 'Confidence Building Program', 
        'blake': 'Performance Anxiety Program',
        'mason': 'Erectile Function Program',
        'knox': 'Intimacy Communication Program'
      }
      
      return fallbackTitles[coachId as keyof typeof fallbackTitles] || 'Personal Development Program'
    } catch (error) {
      console.error('Error getting program title:', error)
      return 'Personal Development Program'
    }
  }

  const getDetectedProblem = () => {
    const coach = user?.coach || 'logan'
    
    // Map coach to problem type (simplified - only using coach)
    if (coach === 'chase') {
      return 'premature_ejaculation'
    }
    if (coach === 'blake') {
      return 'performance_anxiety'
    }
    if (coach === 'mason') {
      return 'erectile_dysfunction'
    }
    if (coach === 'knox') {
      return 'intimacy_communication'
    }
    // Logan or default
    return 'confidence_building'
  }

  const getProblemIcon = (problemType: string) => {
    switch (problemType) {
      case 'premature_ejaculation':
        return HeartIcon
      case 'performance_anxiety':
        return ChartBarIcon
      default:
        return ChatBubbleLeftRightIcon
    }
  }

  const getProgressPercentage = () => {
    if (!userProblems) return 0
    if (useALS) {
      return ALSCleanAdapter.getProgressPercentage(userProblems)
    } else {
      return Math.round((userProblems.completed_steps.length / userProblems.total_steps) * 100)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  const ProblemIcon = userProblems ? getProblemIcon(userProblems.primary_problem) : HeartIcon

  return (
    <div className="min-h-screen bg-gray-950">
      {/* Simple Header */}
      <header className="bg-gray-900 border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            <button 
              onClick={() => router.push('/')}
              className="text-xl font-bold text-white hover:text-blue-400 transition-colors"
            >
              AlphaRise
            </button>
            <UserDropdownMenu user={user} userCoins={0} />
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        {userProblems ? (
          <>
            {/* Coach Section */}
            <CoachSection
              primaryProblem={userProblems.primary_problem}
              userName={user?.username || 'Champion'}
              completedSteps={userProblems.completed_steps.length}
              totalSteps={userProblems.total_steps}
            />

            {/* Problem & Progress Header */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gray-900 rounded-xl p-6 mb-8 border border-gray-800"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
                    <ProblemIcon className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold text-white">
                      {programTitle || (userProblems.primary_problem === 'premature_ejaculation' 
                        ? 'PE Recovery Program' 
                        : 'Confidence Building Program')}
                    </h1>
                    <p className="text-gray-400">
                      Your personalized journey to lasting change
                      {useALS && <span className="ml-2 text-xs text-blue-400">• AI-Powered</span>}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-white">{getProgressPercentage()}%</div>
                  <div className="text-sm text-gray-400">Complete</div>
                </div>
              </div>

              {/* Simple Progress Bar */}
              <div className="bg-gray-800 rounded-full h-3">
                <div 
                  className="bg-gradient-to-r from-blue-600 to-blue-400 h-3 rounded-full transition-all duration-500"
                  style={{ width: `${getProgressPercentage()}%` }}
                />
              </div>

              {/* Progress Stats */}
              <div className="flex justify-between mt-4 text-sm">
                <span className="text-gray-400">
                  Step {userProblems.current_step} of {userProblems.total_steps}
                </span>
                <span className="text-gray-400">
                  {userProblems.completed_steps.length} completed
                </span>
              </div>
            </motion.div>

            {/* Current Step - Primary CTA */}
            {currentStep && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 rounded-xl p-6 mb-8 border border-blue-500/30"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm text-blue-400 font-semibold mb-2">NEXT STEP</div>
                    <h2 className="text-xl font-bold text-white mb-2">{currentStep.title}</h2>
                    <p className="text-gray-300 mb-4">{currentStep.description}</p>
                    <div className="flex items-center space-x-4 text-sm text-gray-400">
                      <span>📚 {currentStep.content_type}</span>
                      <span>⏱️ {currentStep.estimated_minutes} min</span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      handleStartStep(currentStep)
                    }}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors flex items-center space-x-2"
                  >
                    <PlayIcon className="h-5 w-5" />
                    <span>Start</span>
                  </button>
                </div>
              </motion.div>
            )}

            {/* Learning Path - Visual Progress */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-gray-900 rounded-xl p-6 border border-gray-800"
            >
              <h3 className="text-lg font-bold text-white mb-6">Your Learning Path</h3>
              
              <div className="space-y-4">
                {learningPath.map((step, index) => {
                  const isCompleted = userProblems.completed_steps.includes(step.id)
                  const isCurrent = step.id === userProblems.current_step
                  const isLocked = step.id > userProblems.current_step

                  return (
                    <div
                      key={step.id}
                      className={`flex items-center space-x-4 p-4 rounded-lg transition-all ${
                        isCurrent 
                          ? 'bg-blue-600/20 border border-blue-500/50 cursor-pointer hover:bg-blue-600/30' 
                          : isCompleted
                          ? 'bg-green-600/10 border border-green-500/30 cursor-pointer hover:bg-green-600/20'
                          : isLocked
                          ? 'bg-gray-800/50 opacity-50'
                          : 'bg-gray-800/50 hover:bg-gray-800 cursor-pointer'
                      }`}
                      onClick={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        if (!isLocked) {
                          handleStartStep(step)
                        }
                      }}
                    >
                      {/* Step Number/Status */}
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                        isCompleted 
                          ? 'bg-green-600 text-white' 
                          : isCurrent
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-700 text-gray-400'
                      }`}>
                        {isCompleted ? (
                          <CheckCircleIcon className="h-6 w-6" />
                        ) : isLocked ? (
                          <LockClosedIcon className="h-5 w-5" />
                        ) : (
                          step.id
                        )}
                      </div>

                      {/* Step Content */}
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className={`font-semibold ${
                              isCompleted ? 'text-green-400' : isCurrent ? 'text-white' : 'text-gray-300'
                            }`}>
                              {step.title}
                            </h4>
                            <p className="text-sm text-gray-400 mt-1">{step.description}</p>
                          </div>
                          <div className="text-right">
                            <div className="text-sm text-gray-400">{step.estimated_minutes} min</div>
                            {step.required_for_progress && (
                              <div className="text-xs text-blue-400">Required</div>
                            )}
                            {isCompleted && (
                              <div className="text-xs text-green-400">Click to review</div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Action */}
                      {isCurrent && (
                        <ArrowRightIcon className="h-5 w-5 text-blue-400" />
                      )}
                    </div>
                  )
                })}
              </div>
            </motion.div>

            {/* Community Section - Emphasized */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="mt-8 bg-gradient-to-r from-purple-600/20 to-pink-600/20 rounded-xl p-6 border border-purple-500/30 hover:border-purple-400/50 transition-all cursor-pointer group"
              onClick={() => router.push('/community')}
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center space-x-3 mb-2">
                    <div className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center">
                      <ChatBubbleLeftRightIcon className="h-5 w-5 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-white">Join the Community</h3>
                  </div>
                  <p className="text-gray-300 mb-3">
                    Connect with others on the same journey. Share experiences, get support, and celebrate wins together.
                  </p>
                  <div className="flex items-center space-x-6 text-sm">
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                      <span className="text-gray-400">247 members online</span>
                    </div>
                    <span className="text-purple-400">• Anonymous & Safe</span>
                    <span className="text-purple-400">• 24/7 Support</span>
                  </div>
                </div>
                <ArrowRightIcon className="h-6 w-6 text-purple-400 group-hover:translate-x-1 transition-transform" />
              </div>
            </motion.div>

            {/* Additional Problems (if any) */}
            {userProblems.additional_problems.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="mt-8 bg-gray-900 rounded-xl p-6 border border-gray-800"
              >
                <h3 className="text-lg font-bold text-white mb-4">Also Working On</h3>
                <div className="space-y-2">
                  {userProblems.additional_problems.map((problem) => (
                    <div key={problem} className="flex items-center space-x-3 text-gray-300">
                      <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                      <span>{problem.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </>
        ) : (
          // Loading state while modal is open
          <div className="text-center py-12">
            <p className="text-gray-400">Setting up your personalized journey...</p>
          </div>
        )}
      </div>

      {/* Problem Confirmation Modal */}
      <ProblemConfirmationModal
        isOpen={showProblemModal}
        detectedProblem={getDetectedProblem()}
        onConfirm={handleProblemConfirmation}
        onClose={() => {
          // Don't allow closing without confirmation for new users
          if (userProblems) {
            setShowProblemModal(false)
          }
        }}
      />
    </div>
  )
}