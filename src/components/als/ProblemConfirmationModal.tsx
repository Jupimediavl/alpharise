'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { XMarkIcon } from '@heroicons/react/24/outline'

interface ProblemConfirmationModalProps {
  isOpen: boolean
  detectedProblem: string
  onConfirm: (primaryProblem: string, additionalProblems: string[]) => void
  onClose: () => void
}

const PROBLEM_OPTIONS = [
  { id: 'premature_ejaculation', label: 'Premature Ejaculation', description: 'Lasting longer in bed' },
  { id: 'performance_anxiety', label: 'Performance Anxiety', description: 'Overcoming bedroom nerves' },
  { id: 'confidence_building', label: 'Confidence Building', description: 'Building sexual confidence' },
  { id: 'erectile_dysfunction', label: 'Erectile Dysfunction', description: 'Stronger, more reliable erections' },
  { id: 'intimacy_communication', label: 'Intimacy & Communication', description: 'Better relationship connection' }
]

export default function ProblemConfirmationModal({
  isOpen,
  detectedProblem,
  onConfirm,
  onClose
}: ProblemConfirmationModalProps) {
  const [selectedPrimary, setSelectedPrimary] = useState(detectedProblem)
  const [selectedAdditional, setSelectedAdditional] = useState<string[]>([])

  const handleSubmit = () => {
    onConfirm(selectedPrimary, selectedAdditional)
  }

  const toggleAdditional = (problemId: string) => {
    if (problemId === selectedPrimary) return // Can't select primary as additional
    
    setSelectedAdditional(prev => 
      prev.includes(problemId) 
        ? prev.filter(id => id !== problemId)
        : [...prev, problemId]
    )
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="bg-gray-900 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-gray-800"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-800">
            <div>
              <h2 className="text-2xl font-bold text-white">Personalize Your Journey</h2>
              <p className="text-gray-400 mt-1">Help us create the perfect program for you</p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>

          <div className="p-6">
            {/* Primary Problem */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-white mb-4">What's your main focus?</h3>
              <div className="space-y-3">
                {PROBLEM_OPTIONS.map((option) => (
                  <button
                    key={option.id}
                    onClick={() => setSelectedPrimary(option.id)}
                    className={`w-full p-4 rounded-lg border-2 transition-all text-left ${
                      selectedPrimary === option.id
                        ? 'bg-blue-600/20 border-blue-500'
                        : 'bg-gray-800/50 border-gray-700 hover:border-gray-600'
                    }`}
                  >
                    <div className="font-semibold text-white">{option.label}</div>
                    <div className="text-sm text-gray-400 mt-1">{option.description}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Additional Problems */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-white mb-4">
                Any additional areas you'd like to work on? (optional)
              </h3>
              <div className="grid grid-cols-1 gap-3">
                {PROBLEM_OPTIONS.filter(opt => opt.id !== selectedPrimary).map((option) => (
                  <button
                    key={option.id}
                    onClick={() => toggleAdditional(option.id)}
                    className={`p-3 rounded-lg border-2 transition-all text-left ${
                      selectedAdditional.includes(option.id)
                        ? 'bg-purple-600/20 border-purple-500'
                        : 'bg-gray-800/50 border-gray-700 hover:border-gray-600'
                    }`}
                  >
                    <div className="text-sm font-medium text-white">{option.label}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Submit */}
            <button
              onClick={handleSubmit}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition-colors"
            >
              Create My Personalized Program
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}