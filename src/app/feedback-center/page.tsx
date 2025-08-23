'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import {
  ChatBubbleBottomCenterTextIcon,
  ClockIcon,
  CheckCircleIcon,
  ArrowLeftIcon,
  StarIcon,
  EyeIcon
} from '@heroicons/react/24/outline'
import { createClient } from '@supabase/supabase-js'
import { LessonFeedbackManager } from '@/lib/lesson-feedback-manager'
import LessonFeedback from '@/components/LessonFeedback'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

interface LessonWithFeedback {
  lesson_id: string
  completion_date: Date
  feedback_available_at: Date | null
  can_feedback: boolean
  has_feedback: boolean
  feedback_value?: number
  feedback_label?: string
  notes?: string
}

export default function FeedbackCenter() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [lessons, setLessons] = useState<LessonWithFeedback[]>([])
  const [selectedLesson, setSelectedLesson] = useState<any>(null)
  const [showFeedbackModal, setShowFeedbackModal] = useState(false)

  useEffect(() => {
    loadFeedbackData()
  }, [])

  const loadFeedbackData = async () => {
    try {
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

      // Get completed lessons
      const completedLessons = await LessonFeedbackManager.getCompletedLessons(userData.id)
      
      // Check feedback status for each lesson
      const lessonsWithStatus = await Promise.all(
        completedLessons.map(async (lesson) => {
          const canFeedback = await LessonFeedbackManager.canLeaveFeedback(userData.id, lesson.lesson_id)
          const hasFeedback = await LessonFeedbackManager.hasUserGivenFeedback(userData.id, lesson.lesson_id)
          
          // Get existing feedback if any
          let feedbackData = null
          if (hasFeedback) {
            const { data } = await supabase
              .from('lesson_feedback')
              .select('feedback_value, feedback_label')
              .eq('user_id', userData.id)
              .eq('lesson_id', lesson.lesson_id)
              .single()
            feedbackData = data
          }

          return {
            lesson_id: lesson.lesson_id,
            completion_date: lesson.completion_date,
            feedback_available_at: lesson.feedback_available_at,
            can_feedback: canFeedback,
            has_feedback: hasFeedback,
            feedback_value: feedbackData?.feedback_value,
            feedback_label: feedbackData?.feedback_label,
            notes: lesson.notes
          }
        })
      )

      setLessons(lessonsWithStatus.sort((a, b) => 
        new Date(b.completion_date).getTime() - new Date(a.completion_date).getTime()
      ))
    } catch (error) {
      console.error('Error loading feedback data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleLeaveFeedback = (lesson: LessonWithFeedback) => {
    if (!lesson.can_feedback) return
    setSelectedLesson(lesson)
    setShowFeedbackModal(true)
  }

  const handleFeedbackSubmit = async (feedback: { value: number, label: string }) => {
    if (!selectedLesson || !user) return

    const result = await LessonFeedbackManager.submitFeedback({
      user_id: user.id,
      lesson_id: selectedLesson.lesson_id,
      lesson_title: selectedLesson.notes || selectedLesson.lesson_id,
      feedback_value: feedback.value,
      feedback_label: feedback.label
    })

    if (result.success) {
      setShowFeedbackModal(false)
      setSelectedLesson(null)
      await loadFeedbackData() // Refresh data
    }
  }

  const handleReviewLesson = (lessonId: string) => {
    const stepId = lessonId.replace('step_', '')
    router.push(`/learn/${stepId}`)
  }

  const formatTimeUntilFeedback = (feedbackTime: Date) => {
    const now = new Date()
    const diff = feedbackTime.getTime() - now.getTime()
    
    if (diff <= 0) return 'Available now'
    
    const hours = Math.ceil(diff / (1000 * 60 * 60))
    if (hours < 24) return `${hours} hours`
    
    const days = Math.ceil(hours / 24)
    return `${days} day${days > 1 ? 's' : ''}`
  }

  const availableCount = lessons.filter(l => l.can_feedback && !l.has_feedback).length
  const completedCount = lessons.filter(l => l.has_feedback).length
  const waitingCount = lessons.filter(l => !l.can_feedback && !l.has_feedback).length

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-950">
      {/* Header */}
      <header className="bg-gray-900 border-b border-gray-800">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <button
                onClick={() => router.push('/dashboard')}
                className="flex items-center space-x-2 text-gray-400 hover:text-white transition-colors"
              >
                <ArrowLeftIcon className="h-5 w-5" />
                <span>Dashboard</span>
              </button>
              <div className="w-px h-6 bg-gray-700" />
              <div className="flex items-center space-x-2">
                <ChatBubbleBottomCenterTextIcon className="h-6 w-6 text-blue-400" />
                <h1 className="text-xl font-bold text-white">Feedback Center</h1>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-green-900/20 border border-green-700 rounded-lg p-4"
          >
            <div className="flex items-center space-x-3">
              <div className="bg-green-600 rounded-full p-2">
                <ChatBubbleBottomCenterTextIcon className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold text-green-400">{availableCount}</p>
                <p className="text-sm text-green-300">Ready for feedback</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-blue-900/20 border border-blue-700 rounded-lg p-4"
          >
            <div className="flex items-center space-x-3">
              <div className="bg-blue-600 rounded-full p-2">
                <CheckCircleIcon className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold text-blue-400">{completedCount}</p>
                <p className="text-sm text-blue-300">Feedback given</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-yellow-900/20 border border-yellow-700 rounded-lg p-4"
          >
            <div className="flex items-center space-x-3">
              <div className="bg-yellow-600 rounded-full p-2">
                <ClockIcon className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold text-yellow-400">{waitingCount}</p>
                <p className="text-sm text-yellow-300">Waiting period</p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Lessons List */}
        <div className="space-y-4">
          {lessons.map((lesson, index) => (
            <motion.div
              key={lesson.lesson_id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="bg-gray-900 rounded-xl border border-gray-800 p-6"
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-white mb-2">
                    {lesson.notes || `Lesson ${lesson.lesson_id}`}
                  </h3>
                  <p className="text-gray-400 text-sm mb-2">
                    Completed: {new Date(lesson.completion_date).toLocaleDateString()}
                  </p>
                  
                  {lesson.has_feedback ? (
                    <div className="flex items-center space-x-2">
                      <div className="flex items-center space-x-1">
                        {Array.from({ length: 4 }).map((_, i) => (
                          <StarIcon
                            key={i}
                            className={`h-4 w-4 ${
                              i < (lesson.feedback_value || 0)
                                ? 'text-yellow-500 fill-current'
                                : 'text-gray-600'
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-sm text-gray-300">{lesson.feedback_label}</span>
                    </div>
                  ) : lesson.can_feedback ? (
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                      <span className="text-green-400 text-sm font-medium">Ready for feedback</span>
                    </div>
                  ) : lesson.feedback_available_at ? (
                    <div className="flex items-center space-x-2">
                      <ClockIcon className="h-4 w-4 text-yellow-400" />
                      <span className="text-yellow-400 text-sm">
                        Available in {formatTimeUntilFeedback(new Date(lesson.feedback_available_at))}
                      </span>
                    </div>
                  ) : null}
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleReviewLesson(lesson.lesson_id)}
                    className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center space-x-2"
                  >
                    <EyeIcon className="h-4 w-4" />
                    <span>Review</span>
                  </button>
                  
                  {lesson.can_feedback && !lesson.has_feedback && (
                    <button
                      onClick={() => handleLeaveFeedback(lesson)}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center space-x-2"
                    >
                      <ChatBubbleBottomCenterTextIcon className="h-4 w-4" />
                      <span>Leave Feedback</span>
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {lessons.length === 0 && (
          <div className="text-center py-12">
            <ChatBubbleBottomCenterTextIcon className="h-16 w-16 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400 text-lg mb-2">No lessons completed yet</p>
            <p className="text-gray-500">Complete some lessons to start giving feedback</p>
          </div>
        )}

        {/* Feedback Modal */}
        {showFeedbackModal && selectedLesson && (
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
                lessonId={selectedLesson.lesson_id}
                lessonTitle={selectedLesson.notes || selectedLesson.lesson_id}
                onSubmit={handleFeedbackSubmit}
                onSkip={() => {
                  setShowFeedbackModal(false)
                  setSelectedLesson(null)
                }}
              />
            </motion.div>
          </motion.div>
        )}
      </div>
    </div>
  )
}