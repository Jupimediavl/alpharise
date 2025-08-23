'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { Calendar, ChevronRight, AlertCircle } from 'lucide-react'
import { useOnboardingProtection } from '@/hooks/useOnboardingProtection'

// Questions personalized for each coach/problem type
const coachQuestions = {
  blake: {
    coach: 'Blake',
    problem: 'Performance Anxiety',
    questions: [
      {
        id: 'frequency',
        question: 'How often do you experience performance anxiety?',
        options: [
          { value: 'always', label: 'Every time', score: 1 },
          { value: 'often', label: 'Most of the time', score: 2 },
          { value: 'sometimes', label: 'Sometimes', score: 3 },
          { value: 'rarely', label: 'Rarely', score: 4 }
        ]
      },
      {
        id: 'trigger',
        question: 'What triggers your anxiety the most?',
        options: [
          { value: 'new_partner', label: 'With new partners', score: 1 },
          { value: 'pressure', label: 'Feeling pressured to perform', score: 2 },
          { value: 'past_failure', label: 'Fear of past failures repeating', score: 3 },
          { value: 'comparison', label: 'Comparing myself to others', score: 4 }
        ]
      }
    ]
  },
  chase: {
    coach: 'Chase',
    problem: 'Premature Ejaculation',
    questions: [
      {
        id: 'duration',
        question: 'How long can you typically last?',
        options: [
          { value: 'under_1', label: 'Less than 1 minute', score: 1 },
          { value: '1_3', label: '1-3 minutes', score: 2 },
          { value: '3_5', label: '3-5 minutes', score: 3 },
          { value: 'over_5', label: '5+ minutes but want more control', score: 4 }
        ]
      },
      {
        id: 'history',
        question: 'How long have you been experiencing this?',
        options: [
          { value: 'always', label: 'Since I became sexually active', score: 1 },
          { value: 'years', label: 'Several years', score: 2 },
          { value: 'months', label: 'A few months', score: 3 },
          { value: 'recent', label: 'Recently started', score: 4 }
        ]
      }
    ]
  },
  logan: {
    coach: 'Logan',
    problem: 'Approach Anxiety',
    questions: [
      {
        id: 'experience',
        question: 'How experienced are you with approaching women?',
        options: [
          { value: 'never', label: "I've never approached anyone", score: 1 },
          { value: 'tried_few', label: "Tried a few times, didn't go well", score: 2 },
          { value: 'sometimes', label: 'I can do it sometimes', score: 3 },
          { value: 'comfortable', label: "I'm okay but want to improve", score: 4 }
        ]
      },
      {
        id: 'goal',
        question: 'What is your main dating goal?',
        options: [
          { value: 'confidence', label: 'Build basic confidence', score: 1 },
          { value: 'casual', label: 'Meet women casually', score: 2 },
          { value: 'relationship', label: 'Find a meaningful relationship', score: 3 },
          { value: 'mastery', label: 'Master social dynamics', score: 4 }
        ]
      }
    ]
  },
  mason: {
    coach: 'Mason',
    problem: 'Erectile Dysfunction',
    questions: [
      {
        id: 'severity',
        question: 'How would you describe your situation?',
        options: [
          { value: 'complete', label: 'Unable to get erections', score: 1 },
          { value: 'partial', label: 'Can get them but they don\'t last', score: 2 },
          { value: 'inconsistent', label: 'Sometimes works, sometimes doesn\'t', score: 3 },
          { value: 'mild', label: 'Mild issues, want prevention', score: 4 }
        ]
      },
      {
        id: 'cause',
        question: 'What do you think is the main cause?',
        options: [
          { value: 'physical', label: 'Physical health issues', score: 1 },
          { value: 'stress', label: 'Stress and anxiety', score: 2 },
          { value: 'age', label: 'Age-related changes', score: 3 },
          { value: 'unsure', label: "I'm not sure", score: 4 }
        ]
      }
    ]
  },
  knox: {
    coach: 'Knox',
    problem: 'Intimacy & Communication',
    questions: [
      {
        id: 'relationship',
        question: 'What is your current relationship status?',
        options: [
          { value: 'single', label: 'Single and dating', score: 1 },
          { value: 'new', label: 'New relationship (< 6 months)', score: 2 },
          { value: 'committed', label: 'Long-term relationship', score: 3 },
          { value: 'married', label: 'Married', score: 4 }
        ]
      },
      {
        id: 'challenge',
        question: 'What is your biggest intimacy challenge?',
        options: [
          { value: 'expression', label: 'Expressing my feelings', score: 1 },
          { value: 'vulnerability', label: 'Being vulnerable', score: 2 },
          { value: 'communication', label: 'Communicating needs', score: 3 },
          { value: 'connection', label: 'Deepening emotional connection', score: 4 }
        ]
      }
    ]
  }
}

export default function Onboarding() {
  const router = useRouter()
  
  // Protect onboarding pages from users who already completed onboarding
  const { isLoading: isCheckingOnboarding, shouldRedirect } = useOnboardingProtection()
  
  const [selectedCoach, setSelectedCoach] = useState<string>('')
  const [age, setAge] = useState('')
  const [ageError, setAgeError] = useState('')
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [currentStep, setCurrentStep] = useState(0) // 0: age, 1: question1, 2: question2
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    // Get selected coach from localStorage
    const coach = localStorage.getItem('selected_coach')
    if (!coach) {
      router.push('/coach-selection')
      return
    }
    setSelectedCoach(coach)
  }, [router])

  const validateAge = () => {
    const ageNum = parseInt(age)
    if (!age) {
      setAgeError('Please enter your age')
      return false
    }
    if (isNaN(ageNum)) {
      setAgeError('Please enter a valid number')
      return false
    }
    if (ageNum < 18) {
      setAgeError('You must be at least 18 years old')
      return false
    }
    if (ageNum > 100) {
      setAgeError('Please enter a valid age')
      return false
    }
    setAgeError('')
    return true
  }

  const handleNext = () => {
    if (currentStep === 0) {
      if (!validateAge()) return
      setCurrentStep(1)
    } else if (currentStep === 1) {
      const question = coachQuestions[selectedCoach as keyof typeof coachQuestions]?.questions[0]
      if (!answers[question.id]) {
        alert('Please select an answer')
        return
      }
      setCurrentStep(2)
    } else if (currentStep === 2) {
      handleComplete()
    }
  }

  const handleComplete = async () => {
    const question1 = coachQuestions[selectedCoach as keyof typeof coachQuestions]?.questions[0]
    const question2 = coachQuestions[selectedCoach as keyof typeof coachQuestions]?.questions[1]
    
    if (!answers[question1.id] || !answers[question2.id]) {
      alert('Please answer all questions')
      return
    }

    setIsLoading(true)

    // Store onboarding data for signup
    const onboardingData = {
      coach: selectedCoach,
      age: parseInt(age),
      answers: answers,
      problem_type: coachQuestions[selectedCoach as keyof typeof coachQuestions]?.problem,
      profile_data: {
        age_group: parseInt(age) < 25 ? 'young' : parseInt(age) < 35 ? 'adult' : parseInt(age) < 50 ? 'mature' : 'senior',
        severity: answers[question1.id],
        context: answers[question2.id]
      }
    }

    localStorage.setItem('onboarding_data', JSON.stringify(onboardingData))

    // Navigate to signup
    router.push('/signup')
  }

  // Show loading while checking onboarding status
  if (isCheckingOnboarding || shouldRedirect) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900/20 via-black to-blue-900/20 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white">{shouldRedirect ? 'Redirecting to dashboard...' : 'Loading...'}</p>
        </div>
      </div>
    )
  }

  const currentCoachData = coachQuestions[selectedCoach as keyof typeof coachQuestions]

  if (!currentCoachData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900/20 via-black to-blue-900/20 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  const currentQuestion = currentStep > 0 ? currentCoachData.questions[currentStep - 1] : null

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900/20 via-black to-blue-900/20">
      {/* Progress Bar */}
      <div className="fixed top-0 left-0 right-0 h-1 bg-gray-800">
        <div 
          className="h-full bg-gradient-to-r from-blue-600 to-purple-600 transition-all duration-500"
          style={{ width: `${((currentStep + 1) / 3) * 100}%` }}
        />
      </div>

      {/* Header */}
      <div className="p-6 pt-8">
        <div className="text-center mb-2">
          <img 
            src={`/avatars/${selectedCoach}.png`}
            alt={currentCoachData.coach}
            className="w-20 h-20 rounded-full mx-auto mb-4 border-4 border-gray-800"
          />
          <h2 className="text-2xl font-bold text-white">
            {currentCoachData.coach} needs to know more about you
          </h2>
          <p className="text-gray-400 mt-2">
            This helps personalize your journey
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-2xl mx-auto px-6 py-8">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
          className="bg-gray-900/80 backdrop-blur-sm rounded-2xl p-8 border border-gray-800"
        >
          {currentStep === 0 ? (
            // Age Input
            <div>
              <h3 className="text-xl font-semibold text-white mb-6 flex items-center">
                <Calendar className="w-6 h-6 mr-3 text-blue-400" />
                How old are you?
              </h3>
              
              <div className="space-y-4">
                <input
                  type="number"
                  value={age}
                  onChange={(e) => {
                    setAge(e.target.value)
                    setAgeError('')
                  }}
                  placeholder="Enter your age"
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
                  min="18"
                  max="100"
                />
                
                {ageError && (
                  <div className="flex items-center text-red-400 text-sm">
                    <AlertCircle className="w-4 h-4 mr-2" />
                    {ageError}
                  </div>
                )}

                <div className="text-sm text-gray-500">
                  You must be at least 18 years old to use AlphaRise
                </div>
              </div>
            </div>
          ) : (
            // Questions
            <div>
              <h3 className="text-xl font-semibold text-white mb-6">
                {currentQuestion?.question}
              </h3>
              
              <div className="space-y-3">
                {currentQuestion?.options.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setAnswers({ ...answers, [currentQuestion.id]: option.value })}
                    className={`
                      w-full text-left px-4 py-3 rounded-lg border transition-all
                      ${answers[currentQuestion.id] === option.value
                        ? 'bg-blue-600/20 border-blue-500 text-white'
                        : 'bg-gray-800/50 border-gray-700 text-gray-300 hover:bg-gray-800 hover:border-gray-600'
                      }
                    `}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="mt-8 flex justify-between">
            {currentStep > 0 && (
              <button
                onClick={() => setCurrentStep(currentStep - 1)}
                className="px-6 py-3 text-gray-400 hover:text-white transition-colors"
              >
                Back
              </button>
            )}
            
            <button
              onClick={handleNext}
              disabled={isLoading}
              className={`
                px-8 py-3 rounded-full font-semibold flex items-center ml-auto
                ${isLoading 
                  ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700'
                }
              `}
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2" />
                  Loading...
                </>
              ) : (
                <>
                  {currentStep === 2 ? 'Complete Setup' : 'Continue'}
                  <ChevronRight className="w-5 h-5 ml-2" />
                </>
              )}
            </button>
          </div>
        </motion.div>

        {/* Step Indicator */}
        <div className="flex justify-center mt-8 space-x-2">
          {[0, 1, 2].map((step) => (
            <div
              key={step}
              className={`
                h-2 rounded-full transition-all duration-300
                ${step === currentStep
                  ? 'w-8 bg-blue-500'
                  : step < currentStep
                  ? 'w-2 bg-blue-500/50'
                  : 'w-2 bg-gray-700'
                }
              `}
            />
          ))}
        </div>
      </div>
    </div>
  )
}