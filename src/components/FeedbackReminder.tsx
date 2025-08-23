'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChatBubbleBottomCenterTextIcon, ClockIcon, XMarkIcon } from '@heroicons/react/24/outline'
import { LessonFeedbackManager } from '@/lib/lesson-feedback-manager'
import { useRouter } from 'next/navigation'

interface FeedbackReminderProps {
  userId: string
}

interface PendingFeedback {
  lesson_id: string
  lesson_title?: string
  completed_at: Date
  feedback_available_at: Date
  time_until_feedback_hours: number
}

export default function FeedbackReminder({ userId }: FeedbackReminderProps) {
  const router = useRouter()
  const [pendingFeedback, setPendingFeedback] = useState<PendingFeedback[]>([])
  const [availableFeedback, setAvailableFeedback] = useState<any[]>([])
  const [isExpanded, setIsExpanded] = useState(false)
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    loadPendingFeedback()
    // Check every minute for updates
    const interval = setInterval(loadPendingFeedback, 60000)
    return () => clearInterval(interval)
  }, [userId])

  const loadPendingFeedback = async () => {
    const lessons = await LessonFeedbackManager.getLessonsAwaitingFeedback(userId)
    
    // Separate available now vs waiting
    const available = lessons.filter(l => {
      const feedbackTime = new Date(l.feedback_available_at || l.completion_date)
      return feedbackTime <= new Date()
    })
    
    setAvailableFeedback(available)
    setPendingFeedback(lessons)
  }

  const formatTimeRemaining = (hours: number) => {
    if (hours < 1) return 'Available now'
    if (hours < 24) return `${Math.ceil(hours)} hours`
    const days = Math.ceil(hours / 24)
    return `${days} day${days > 1 ? 's' : ''}`
  }

  const handleLeaveFeedback = (lessonId: string) => {
    // Navigate to lesson in review mode with feedback prompt
    const stepId = lessonId.replace('step_', '')
    router.push(`/learn/${stepId}?feedback=true`)
  }

  if (dismissed || (availableFeedback.length === 0 && pendingFeedback.length === 0)) {
    return null
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        className="fixed bottom-4 right-4 z-40 max-w-sm"
      >
        <div className="bg-gray-900 rounded-xl border border-gray-800 shadow-xl overflow-hidden">
          {/* Header */}
          <div className="bg-gray-800 px-4 py-3 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <ChatBubbleBottomCenterTextIcon className="h-5 w-5 text-blue-400" />
              <span className="text-sm font-semibold text-white">Feedback Available</span>
              {availableFeedback.length > 0 && (
                <span className="bg-blue-600 text-white text-xs px-2 py-0.5 rounded-full">
                  {availableFeedback.length}
                </span>
              )}
            </div>
            <button
              onClick={() => setDismissed(true)}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <XMarkIcon className="h-4 w-4" />
            </button>
          </div>

          {/* Content */}
          <div className="p-4">
            {availableFeedback.length > 0 ? (
              <>
                <p className="text-sm text-gray-300 mb-3">
                  You can now share feedback on {availableFeedback.length} completed lesson{availableFeedback.length > 1 ? 's' : ''}
                </p>
                
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {availableFeedback.slice(0, isExpanded ? undefined : 2).map((lesson) => (
                    <motion.div
                      key={lesson.lesson_id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="bg-gray-800 rounded-lg p-3 hover:bg-gray-700 transition-colors cursor-pointer"
                      onClick={() => handleLeaveFeedback(lesson.lesson_id)}
                    >
                      <p className="text-sm font-medium text-white truncate">
                        {`Lesson ${lesson.lesson_id}`}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        Completed {new Date(lesson.completion_date).toLocaleDateString()}
                      </p>
                    </motion.div>
                  ))}
                </div>

                {availableFeedback.length > 2 && !isExpanded && (
                  <button
                    onClick={() => setIsExpanded(true)}
                    className="text-sm text-blue-400 hover:text-blue-300 mt-2"
                  >
                    Show {availableFeedback.length - 2} more
                  </button>
                )}

                <button
                  onClick={() => router.push('/feedback-center')}
                  className="w-full mt-3 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold py-2 rounded-lg transition-colors"
                >
                  View All Feedback
                </button>
              </>
            ) : pendingFeedback.length > 0 ? (
              <>
                <p className="text-sm text-gray-300 mb-3">
                  Feedback will be available soon for your completed lessons
                </p>
                
                <div className="space-y-2">
                  {pendingFeedback.slice(0, 2).map((lesson) => {
                    const hoursRemaining = Math.max(0, 
                      (new Date(lesson.feedback_available_at).getTime() - Date.now()) / (1000 * 60 * 60)
                    )
                    
                    return (
                      <div
                        key={lesson.lesson_id}
                        className="bg-gray-800 rounded-lg p-3 opacity-60"
                      >
                        <p className="text-sm font-medium text-gray-300 truncate">
                          {`Lesson ${lesson.lesson_id}`}
                        </p>
                        <div className="flex items-center space-x-1 mt-1">
                          <ClockIcon className="h-3 w-3 text-gray-400" />
                          <p className="text-xs text-gray-400">
                            Available in {formatTimeRemaining(hoursRemaining)}
                          </p>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </>
            ) : null}
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}