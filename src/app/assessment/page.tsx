'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'

export default function AssessmentPage() {
  const router = useRouter()
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null)

  // Simple demo question for now
  const question = {
    title: "What's going through your head when you're about to be intimate?",
    subtitle: "No judgment here - just trying to understand where you're at",
    answers: [
      { text: "I'm worried I'll disappoint her", description: "My mind races with all the ways I might mess up" },
      { text: "I'm stressed about lasting long enough", description: "Physical stuff is what I worry about most" },
      { text: "I honestly don't know what I'm doing", description: "I feel like I'm missing some manual everyone else got" },
      { text: "I want to be confident but I'm nervous", description: "I know what I want but doubt holds me back" },
      { text: "I want us to really connect first", description: "The emotional stuff matters more to me" }
    ]
  }

  const handleAnswerSelect = (index: number) => {
    setSelectedAnswer(index)
    
    // Auto-advance to next question after 500ms
    setTimeout(() => {
      handleNext()
    }, 500)
  }

  const handleNext = () => {
    if (currentQuestion < 9) {
      setCurrentQuestion(prev => prev + 1)
      setSelectedAnswer(null)
    } else {
      // Last question - go to results
      alert('Assessment complete! Redirecting to your personalized avatar results...')
    }
  }

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(prev => prev - 1)
      setSelectedAnswer(null)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white">
      {/* Header */}
      <header className="p-6 text-center">
        <div className="text-3xl font-black bg-gradient-to-r from-red-500 to-red-600 bg-clip-text text-transparent">
          AlphaRise
        </div>
      </header>

      {/* Progress Bar */}
      <div className="max-w-2xl mx-auto px-6 mb-8">
        <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-red-600 to-red-700 rounded-full transition-all duration-500"
            style={{ width: `${((currentQuestion + 1) / 10) * 100}%` }}
          ></div>
        </div>
        <div className="text-center mt-3 text-sm opacity-70">
          Building your profile... Step {currentQuestion + 1} of 10
        </div>
      </div>

      {/* Question Container */}
      <div className="max-w-4xl mx-auto px-6">
        <motion.div 
          className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 text-center"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="text-red-400 font-semibold text-sm uppercase tracking-wide mb-6">
            Discovering Your Type • Step {currentQuestion + 1} of 10
          </div>
          
          <h2 className="text-3xl md:text-4xl font-bold mb-6 leading-tight">
            {question.title}
          </h2>
          
          <p className="text-lg opacity-70 mb-12 leading-relaxed">
            {question.subtitle}
          </p>

          <div className="space-y-4 mb-12">
            {question.answers.map((answer, index) => (
              <motion.div
                key={index}
                onClick={() => handleAnswerSelect(index)}
                className={`p-6 border-2 rounded-xl cursor-pointer transition-all duration-300 text-left
                  ${selectedAnswer === index 
                    ? 'border-red-500 bg-red-500/20 shadow-lg shadow-red-500/25' 
                    : 'border-white/10 bg-white/5 hover:border-red-500/50 hover:bg-red-500/10'
                  }`}
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="font-semibold text-lg mb-2">{answer.text}</div>
                <div className="text-sm opacity-70">{answer.description}</div>
              </motion.div>
            ))}
          </div>

          <div className="flex justify-between items-center mt-8">
            {currentQuestion > 0 ? (
              <motion.button
                onClick={handlePrevious}
                className="px-6 py-3 border border-white/20 rounded-full font-medium hover:bg-white/10 transition-all duration-300"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                ← Previous
              </motion.button>
            ) : (
              <div></div>
            )}

            <div className="text-sm opacity-60">
              {selectedAnswer !== null && currentQuestion < 9 && "Moving to next question..."}
              {currentQuestion === 9 && selectedAnswer !== null && "Completing assessment..."}
            </div>

            <div className="text-sm opacity-40">
              Auto-advance in 0.5s
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}