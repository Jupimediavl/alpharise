'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { 
  PlayIcon,
  PauseIcon,
  CheckCircleIcon,
  ArrowLeftIcon,
  ArrowRightIcon,
  ClockIcon,
  BookOpenIcon
} from '@heroicons/react/24/outline'
import { UserProblemsManager, type ProblemStep } from '@/lib/user-problems-manager'
import { ALSCleanAdapter, type CleanLearningStep } from '@/lib/als-clean-adapter'
import { createClient } from '@supabase/supabase-js'
import LessonFeedback from '@/components/LessonFeedback'
import { LessonFeedbackManager } from '@/lib/lesson-feedback-manager'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function LearnStep() {
  const router = useRouter()
  const params = useParams()
  const rawStepId = params.stepId as string
  const stepId = parseInt(rawStepId)
  
  // Debug logging
  console.log('Learn page loaded with stepId:', rawStepId, 'Parsed:', stepId)
  
  const [user, setUser] = useState<any>(null)
  const [step, setStep] = useState<CleanLearningStep | null>(null)
  const [userProblems, setUserProblems] = useState<any>(null)
  const [useALS, setUseALS] = useState(
    true // ALS enabled - database tables are now created
  )
  const [loading, setLoading] = useState(true)
  const [isPlaying, setIsPlaying] = useState(false)
  const [progress, setProgress] = useState(0)
  const [timeSpent, setTimeSpent] = useState(0)
  const [showFeedback, setShowFeedback] = useState(false)
  const [isReviewMode, setIsReviewMode] = useState(false)
  const [lessonCompleted, setLessonCompleted] = useState(false)

  useEffect(() => {
    loadStepContent()
  }, [stepId])

  useEffect(() => {
    checkLessonStatus()
  }, [user, step, userProblems])

  useEffect(() => {
    // Simple progress simulation when playing
    let interval: NodeJS.Timeout
    if (isPlaying) {
      interval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 100) {
            setIsPlaying(false)
            return 100
          }
          return prev + 2
        })
        setTimeSpent(prev => prev + 1)
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [isPlaying])

  const loadStepContent = async () => {
    try {
      // Check if stepId is valid
      if (isNaN(stepId)) {
        console.error('Invalid stepId:', rawStepId)
        router.push('/dashboard')
        return
      }
      
      // Get user
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.user) {
        router.push('/login')
        return
      }

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

      // Get user problems
      const problems = await UserProblemsManager.getUserProblems(userData.id)
      if (!problems) {
        router.push('/dashboard')
        return
      }
      setUserProblems(problems)

      // Get step from learning path
      const learningPath = UserProblemsManager.getLearningPath(problems.primary_problem)
      const currentStep = learningPath.find(s => s.id === stepId)
      
      if (!currentStep) {
        router.push('/dashboard')
        return
      }

      setStep(currentStep)
    } catch (error) {
      console.error('Error loading step:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleComplete = async () => {
    if (!user || !step) return
    
    // Mark lesson as complete with delayed feedback
    const result = await LessonFeedbackManager.completeLesson(
      user.id,
      `step_${step.id}`,
      step.title
    )
    
    if (result.success) {
      setLessonCompleted(true)
      // Show completion message instead of immediate feedback
      setTimeout(() => {
        router.push('/dashboard')
      }, 2000)
    }
  }

  const handleFeedbackSubmit = async (feedback: { value: number, label: string }) => {
    if (!user || !step) return
    
    // Submit feedback through manager
    const result = await LessonFeedbackManager.submitFeedback({
      user_id: user.id,
      lesson_id: `step_${step.id}`,
      lesson_title: step.title,
      feedback_value: feedback.value,
      feedback_label: feedback.label,
      problem_type: userProblems?.primary_problem,
      step_number: step.id,
      time_to_complete: Math.floor(timeSpent / 60)
    })

    if (result.success) {
      setShowFeedback(false)
      setTimeout(() => {
        router.push('/dashboard')
      }, 1500)
    }
  }

  const checkLessonStatus = async () => {
    if (!user || !step || !userProblems) return
    
    // Check if lesson is already completed using UserProblemsManager
    const isCompleted = userProblems.completed_steps.includes(step.id)
    console.log(`Checking lesson ${step.id}: completed steps:`, userProblems.completed_steps, 'isCompleted:', isCompleted)
    
    if (isCompleted) {
      console.log('Setting review mode for completed lesson')
      setIsReviewMode(true)
      setLessonCompleted(true)
      setProgress(100)
      
      // Check if feedback can be given
      const canFeedback = await LessonFeedbackManager.canLeaveFeedback(user.id, `step_${step.id}`)
      const hasFeedback = await LessonFeedbackManager.hasUserGivenFeedback(user.id, `step_${step.id}`)
      
      if (canFeedback && !hasFeedback) {
        // Can show feedback option
        setShowFeedback(false) // Will be shown via button
      }
    }
  }

  const getContentForStep = (step: ProblemStep) => {
    // This would normally fetch actual content from database
    // For now, return structured content based on step
    
    if (step.id === 1) {
      return {
        sections: [
          {
            title: "What You'll Learn",
            content: "Understanding the root causes and science behind your challenge is the first step to overcoming it."
          },
          {
            title: "Key Concepts",
            content: "• Physiological factors\n• Psychological components\n• Common misconceptions\n• The path forward"
          },
          {
            title: "Practice Exercise",
            content: "Take a moment to reflect on your personal goals and what success looks like for you."
          }
        ]
      }
    }
    
    return {
      sections: [
        {
          title: step.title,
          content: step.description
        }
      ]
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  if (!step) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <p className="text-gray-400">Step not found</p>
      </div>
    )
  }

  const content = getContentForStep(step)

  return (
    <div className="min-h-screen bg-gray-950">
      {/* Header */}
      <header className="bg-gray-900 border-b border-gray-800">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => router.push('/dashboard')}
              className="flex items-center space-x-2 text-gray-400 hover:text-white transition-colors"
            >
              <ArrowLeftIcon className="h-5 w-5" />
              <span>Back to Dashboard</span>
            </button>
            
            <div className="flex items-center space-x-4 text-sm text-gray-400">
              {isReviewMode && (
                <div className="flex items-center space-x-1 bg-green-900/50 px-3 py-1 rounded-full border border-green-600/50">
                  <CheckCircleIcon className="h-4 w-4 text-green-400" />
                  <span className="text-green-400 font-medium">Completed</span>
                </div>
              )}
              <div className="flex items-center space-x-1">
                <ClockIcon className="h-4 w-4" />
                <span>{Math.floor(timeSpent / 60)}:{(timeSpent % 60).toString().padStart(2, '0')}</span>
              </div>
              <div className="flex items-center space-x-1">
                <BookOpenIcon className="h-4 w-4" />
                <span>Step {step.id} of {userProblems?.total_steps}</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        {/* Step Title */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm text-blue-400 font-semibold">
              {step.content_type.toUpperCase()}
            </div>
            {isReviewMode && (
              <div className="flex items-center space-x-2 bg-green-900/30 px-3 py-1 rounded-lg border border-green-600/30">
                <CheckCircleIcon className="h-5 w-5 text-green-400" />
                <span className="text-green-400 font-medium text-sm">Previously Completed</span>
              </div>
            )}
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">{step.title}</h1>
          <p className="text-lg text-gray-300">{step.description}</p>
          {isReviewMode && (
            <div className="mt-3 p-3 bg-blue-900/20 border border-blue-600/30 rounded-lg">
              <p className="text-blue-300 text-sm">
                📚 You're reviewing this lesson. All content is available for reference.
              </p>
            </div>
          )}
        </motion.div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between text-sm text-gray-400 mb-2">
            <span>Progress</span>
            <span>{progress}%</span>
          </div>
          <div className="bg-gray-800 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Content Area */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gray-900 rounded-xl p-6 mb-8 border border-gray-800"
        >
          {/* Video/Content Placeholder */}
          {step.content_type === 'lesson' || step.content_type === 'practice' ? (
            <div className="bg-gray-800 rounded-lg p-8 mb-6 text-center">
              <div className="w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                {isPlaying ? (
                  <PauseIcon className="h-10 w-10 text-white" />
                ) : (
                  <PlayIcon className="h-10 w-10 text-white" />
                )}
              </div>
              <p className="text-gray-400 mb-4">
                {isPlaying ? 'Content is playing...' : 'Click to start the lesson'}
              </p>
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-semibold transition-colors"
              >
                {isPlaying ? 'Pause' : 'Start'}
              </button>
            </div>
          ) : (
            <div className="prose prose-invert max-w-none">
              <p className="text-gray-300 mb-4">Assessment content would appear here</p>
            </div>
          )}

          {/* Content Sections */}
          <div className="space-y-6">
            {content.sections.map((section, index) => (
              <div key={index}>
                <h3 className="text-lg font-bold text-white mb-3">{section.title}</h3>
                <p className="text-gray-300 whitespace-pre-line">{section.content}</p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Action Buttons */}
        <div className="flex justify-between">
          <button
            onClick={() => router.push('/dashboard')}
            className="bg-gray-700 hover:bg-gray-600 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
          >
            {isReviewMode ? 'Back to Dashboard' : 'Save & Exit'}
          </button>
          
          {isReviewMode ? (
            <button
              onClick={async () => {
                const canFeedback = await LessonFeedbackManager.canLeaveFeedback(user.id, `step_${step.id}`)
                const hasFeedback = await LessonFeedbackManager.hasUserGivenFeedback(user.id, `step_${step.id}`)
                
                if (canFeedback && !hasFeedback) {
                  setShowFeedback(true)
                } else if (!canFeedback) {
                  const timeRemaining = await LessonFeedbackManager.getTimeUntilFeedback(user.id, `step_${step.id}`)
                  if (timeRemaining && timeRemaining > 0) {
                    const hours = Math.ceil(timeRemaining / (1000 * 60 * 60))
                    alert(`You can leave feedback in ${hours} hours`)
                  }
                } else {
                  alert('You have already given feedback for this lesson')
                }
              }}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
            >
              Leave Feedback
            </button>
          ) : (
            <button
              onClick={handleComplete}
              disabled={progress < 100 || lessonCompleted}
              className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-semibold transition-colors ${
                progress >= 100 && !lessonCompleted
                  ? 'bg-green-600 hover:bg-green-700 text-white'
                  : 'bg-gray-700 text-gray-400 cursor-not-allowed'
              }`}
            >
              <CheckCircleIcon className="h-5 w-5" />
              <span>{lessonCompleted ? 'Completed' : 'Mark as Complete'}</span>
            </button>
          )}
        </div>

        {/* Completion Message */}
        {lessonCompleted && !isReviewMode && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 bg-green-900/20 border border-green-700 rounded-lg p-4"
          >
            <div className="flex items-center space-x-3">
              <CheckCircleIcon className="h-6 w-6 text-green-500" />
              <div>
                <p className="text-green-400 font-semibold">Lesson Completed!</p>
                <p className="text-sm text-gray-300 mt-1">
                  You can leave feedback after implementing what you learned (in about 2 days).
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Feedback Modal */}
        {showFeedback && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="max-w-md w-full"
            >
              <LessonFeedback
                lessonId={`step_${step.id}`}
                lessonTitle={step.title}
                onSubmit={handleFeedbackSubmit}
                onSkip={() => {
                  setShowFeedback(false)
                  router.push('/dashboard')
                }}
              />
            </motion.div>
          </motion.div>
        )}

        {/* Next Step Preview */}
        {userProblems && step.id < userProblems.total_steps && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mt-8 bg-gray-900/50 rounded-lg p-4 border border-gray-800"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400 mb-1">Next up:</p>
                <p className="text-white font-semibold">
                  {UserProblemsManager.getLearningPath(userProblems.primary_problem)[step.id]?.title}
                </p>
              </div>
              <ArrowRightIcon className="h-5 w-5 text-gray-400" />
            </div>
          </motion.div>
        )}
      </div>
    </div>
  )
}