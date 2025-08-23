'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  FaceFrownIcon,
  FaceSmileIcon,
  HandThumbUpIcon,
  SparklesIcon,
  XMarkIcon
} from '@heroicons/react/24/outline'

interface FeedbackOption {
  id: string
  label: string
  icon: any
  color: string
  value: number // 1-4 scale
}

interface LessonFeedbackProps {
  lessonId: string | number
  lessonTitle: string
  onSubmit: (feedback: { value: number, label: string }) => void
  onSkip?: () => void
}

export default function LessonFeedback({ 
  lessonId, 
  lessonTitle,
  onSubmit,
  onSkip
}: LessonFeedbackProps) {
  const [selectedFeedback, setSelectedFeedback] = useState<string | null>(null)
  const [isSubmitted, setIsSubmitted] = useState(false)

  const feedbackOptions: FeedbackOption[] = [
    {
      id: 'not_helpful',
      label: "Didn't work for me",
      icon: FaceFrownIcon,
      color: 'text-red-500',
      value: 1
    },
    {
      id: 'partial',
      label: "Partially helpful",
      icon: FaceSmileIcon,
      color: 'text-yellow-500',
      value: 2
    },
    {
      id: 'good',
      label: "Good lesson",
      icon: HandThumbUpIcon,
      color: 'text-green-500',
      value: 3
    },
    {
      id: 'excellent',
      label: "Extremely helpful!",
      icon: SparklesIcon,
      color: 'text-purple-500',
      value: 4
    }
  ]

  const handleSubmit = () => {
    const selected = feedbackOptions.find(opt => opt.id === selectedFeedback)
    if (selected) {
      setIsSubmitted(true)
      onSubmit({ value: selected.value, label: selected.label })
      
      // Auto close after 2 seconds
      setTimeout(() => {
        if (onSkip) onSkip()
      }, 2000)
    }
  }

  if (isSubmitted) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-gray-900 rounded-xl p-6 border border-gray-800 text-center"
      >
        <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <HandThumbUpIcon className="h-8 w-8 text-white" />
        </div>
        <h3 className="text-xl font-bold text-white mb-2">Thank you!</h3>
        <p className="text-gray-400">Your feedback helps us improve</p>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gray-900 rounded-xl p-6 border border-gray-800"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-bold text-white mb-1">How was this lesson?</h3>
          <p className="text-sm text-gray-400">Your feedback helps improve the program</p>
        </div>
        {onSkip && (
          <button
            onClick={onSkip}
            className="text-gray-500 hover:text-gray-300 transition-colors"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        )}
      </div>

      {/* Feedback Options */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        {feedbackOptions.map((option) => (
          <button
            key={option.id}
            onClick={() => setSelectedFeedback(option.id)}
            className={`p-4 rounded-lg border-2 transition-all ${
              selectedFeedback === option.id
                ? 'bg-gray-800 border-blue-500'
                : 'bg-gray-800/50 border-gray-700 hover:border-gray-600'
            }`}
          >
            <option.icon className={`h-8 w-8 ${option.color} mx-auto mb-2`} />
            <p className={`text-sm font-medium ${
              selectedFeedback === option.id ? 'text-white' : 'text-gray-300'
            }`}>
              {option.label}
            </p>
          </button>
        ))}
      </div>

      {/* Submit Button */}
      <button
        onClick={handleSubmit}
        disabled={!selectedFeedback}
        className={`w-full py-3 rounded-lg font-semibold transition-colors ${
          selectedFeedback
            ? 'bg-blue-600 hover:bg-blue-700 text-white'
            : 'bg-gray-700 text-gray-400 cursor-not-allowed'
        }`}
      >
        Submit Feedback
      </button>

      {/* Optional: Additional Comments */}
      <div className="mt-4">
        <button 
          className="text-sm text-gray-400 hover:text-white transition-colors"
          onClick={() => {/* Could open a text input for detailed feedback */}}
        >
          Want to share more details?
        </button>
      </div>
    </motion.div>
  )
}