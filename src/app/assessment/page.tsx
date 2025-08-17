'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'

export default function AssessmentPage() {
  const router = useRouter()
  const [currentQuestion, setCurrentQuestion] = useState(-1) // Start with age verification
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null)
  const [answers, setAnswers] = useState<number[]>([])
  const [userAge, setUserAge] = useState<number | null>(null)
  const [inputAge, setInputAge] = useState<string>('')
  const [showAgeError, setShowAgeError] = useState(false)

  // Scoring rules for each question/answer combination
  const scoring = [
    // Question 1: What's going through your head when you're about to be intimate?
    [
      { marcus: 3, alex: 1 }, // I'm worried I'll disappoint her
      { jake: 3 }, // I'm stressed about lasting long enough  
      { alex: 3, ryan: 1 }, // I honestly don't know what I'm doing
      { ryan: 3, marcus: 1 }, // I want to be confident but I'm nervous
      { ethan: 3, ryan: 1 } // I want us to really connect first
    ],
    // Question 2: A woman you're attracted to is clearly interested in you
    [
      { marcus: 3, alex: 1 }, // I start overthinking everything
      { jake: 3 }, // I worry about performing well
      { alex: 2, ryan: 2 }, // I second-guess if she's really interested
      { ryan: 3, marcus: 1 }, // I get excited but then freeze up
      { ethan: 3, ryan: 1 } // I want to get to know her better first
    ],
    // Question 3: How would your friends describe your dating life?
    [
      { marcus: 3, alex: 1 }, // He gets in his own head too much
      { jake: 3 }, // He avoids taking things physical
      { alex: 3 }, // He's still figuring it out
      { ryan: 3, marcus: 1 }, // He has potential but holds back
      { ethan: 3 } // He takes relationships seriously
    ],
    // Question 4: Think about your biggest regret
    [
      { marcus: 3 }, // I was too nervous to be myself
      { jake: 3, alex: 1 }, // I avoided physical intimacy
      { alex: 3 }, // I had no clue what I was doing
      { ryan: 3 }, // I played it way too safe
      { ethan: 3, alex: 1 } // We never really connected deeply
    ],
    // Question 5: When someone criticizes or rejects you
    [
      { marcus: 3, alex: 1 }, // I replay it in my head for days
      { jake: 3 }, // I assume it's about my performance
      { alex: 2, ryan: 1 }, // I know I probably did something obviously wrong
      { ryan: 3, ethan: 1 }, // It stings but I try to learn from it
      { ethan: 3, ryan: 1 } // I figure we just weren't compatible
    ],
    // Question 6: What would success look like for you in the next month?
    [
      { marcus: 3 }, // I'd feel relaxed and natural around women
      { jake: 3, ryan: 1 }, // I'd feel confident about physical intimacy
      { alex: 3, ryan: 1 }, // I'd actually know what to do and say
      { ryan: 3, marcus: 1 }, // I'd approach women without second-guessing
      { ethan: 3, ryan: 2 } // I'd build deeper, real connections
    ],
    // Question 7: How much time could you realistically spend on this per day?
    [
      { marcus: 2, ryan: 1 }, // 10-15 minutes of focused effort
      { jake: 2, alex: 2 }, // 20-30 minutes of practice
      { alex: 2, ryan: 2 }, // 30-45 minutes when I'm motivated
      { jake: 1, ethan: 2 }, // An hour or more on good days
      { ethan: 1, ryan: 1 } // Whatever it takes to see change
    ],
    // Question 8: How do you prefer to learn new things?
    [
      { marcus: 3, alex: 1 }, // Step-by-step guides I can follow
      { jake: 3, ryan: 1 }, // Practical exercises and real techniques
      { alex: 3, ryan: 1 }, // Start from the basics and build up
      { ryan: 3, ethan: 1 }, // Real situations and examples
      { ethan: 3, alex: 1 } // Understanding people and emotions
    ],
    // Question 9: What's your biggest frustration right now?
    [
      { marcus: 3, alex: 1 }, // I get in my own way constantly
      { jake: 3, ryan: 1 }, // I avoid intimacy because I'm worried
      { alex: 3, ryan: 1 }, // I feel behind compared to other guys
      { ryan: 3, ethan: 1 }, // I have good moments but can't stay consistent
      { ethan: 3, alex: 1 } // Dating feels superficial and meaningless
    ],
    // Question 10: On a scale of readiness, where are you right now?
    [
      { marcus: 2, jake: 2, alex: 1 }, // I'm really struggling and need help
      { jake: 3, alex: 2, ryan: 2 }, // I'm motivated and ready to put in work
      { ryan: 3, ethan: 2, marcus: 1 }, // I'm hopeful and open to trying new things
      { marcus: 2, ryan: 2 }, // I'm cautious but willing to commit
      { ethan: 3, alex: 2 } // I'm patient and focused on real growth
    ]
  ]

  const calculateUserTypeAndCoach = () => {
    // First calculate scores using the existing logic but renamed
    const problemScores: Record<string, number> = { marcus: 0, jake: 0, alex: 0, ryan: 0, ethan: 0 }
    
    answers.forEach((answerIndex, questionIndex) => {
      const questionScoring = scoring[questionIndex]
      if (questionScoring && questionScoring[answerIndex]) {
        const answerScoring = questionScoring[answerIndex]
        
        // Safely iterate through the scoring object
        for (const [problemType, points] of Object.entries(answerScoring)) {
          if (problemScores[problemType] !== undefined) {
            problemScores[problemType] += points
          }
        }
      }
    })

    // AGE-BASED PROFILING: Adjust scores based on age
    if (userAge !== null) {
      if (userAge >= 18 && userAge <= 22) {
        // Young adults - boost Alex (inexperienced) and Ryan (nervous energy)
        problemScores.alex += 2
        problemScores.ryan += 1
        console.log('🎯 Young adult bonus: +2 Rookie, +1 Up&Down')
      } else if (userAge >= 23 && userAge <= 27) {
        // Mid twenties - boost Ryan (building confidence) and Marcus (overthinking)
        problemScores.ryan += 2
        problemScores.marcus += 1
        console.log('🎯 Mid-twenties bonus: +2 Up&Down, +1 Overthinker')
      } else if (userAge >= 28 && userAge <= 35) {
        // Late twenties/early thirties - boost Marcus (performance anxiety) and Ethan (serious)
        problemScores.marcus += 2
        problemScores.ethan += 1
        console.log('🎯 Late twenties bonus: +2 Overthinker, +1 Surface Guy')
      } else if (userAge >= 36) {
        // Mature men - boost Ethan (relationship-focused) and Jake (physical concerns)
        problemScores.ethan += 2
        problemScores.jake += 1
        console.log('🎯 Mature adult bonus: +2 Surface Guy, +1 Nervous Guy')
      }
    }

    // Map old avatar scores to new user types
    const userTypeScores = {
      overthinker: problemScores.marcus,    // Marcus → Overthinker
      nervous: problemScores.jake,          // Jake → Nervous Guy  
      rookie: problemScores.alex,           // Alex → Rookie
      updown: problemScores.ryan,           // Ryan → Up & Down
      surface: problemScores.ethan          // Ethan → Surface Guy
    }

    // Find the user type with highest score
    let userType = 'overthinker'
    let highestScore = 0
    
    for (const [type, score] of Object.entries(userTypeScores)) {
      if (score > highestScore) {
        highestScore = score
        userType = type
      }
    }

    // Map user types to their appropriate coaches (opposites)
    const userTypeToCoach = {
      overthinker: 'logan',    // Overthinker gets Logan (Straight Shooter)
      nervous: 'chase',        // Nervous Guy gets Chase (Cool Cat)
      rookie: 'mason',         // Rookie gets Mason (Patient Pro) 
      updown: 'blake',         // Up & Down gets Blake (Reliable Guy)
      surface: 'knox'          // Surface Guy gets Knox (Authentic One)
    }

    const assignedCoach = userTypeToCoach[userType as keyof typeof userTypeToCoach]

    // Calculate initial confidence score (for users who need our help)
    // Base score starts at 25 (indicating room for growth)
    let confidenceScore = 25
    
    // Add points based on user type strength, but capped low
    confidenceScore += Math.min(highestScore, 8) // Max 8 bonus points from answers
    
    // Age-based confidence adjustments (smaller ranges)
    if (userAge !== null) {
      if (userAge >= 18 && userAge <= 22) {
        confidenceScore -= 5 // Young adults need more support
      } else if (userAge >= 23 && userAge <= 27) {
        confidenceScore -= 2 // Mid twenties still developing
      } else if (userAge >= 28 && userAge <= 35) {
        confidenceScore += 2 // Some life experience
      } else if (userAge >= 36) {
        confidenceScore += 4 // More mature but still learning
      }
    }
    
    // Small adjustments based on readiness/commitment
    answers.forEach((answerIndex, questionIndex) => {
      // Questions about readiness and commitment (last 3 questions)
      if (questionIndex >= 7) {
        if (answerIndex >= 3) confidenceScore += 2 // High readiness
        else if (answerIndex >= 1) confidenceScore += 1 // Medium readiness
        // Low readiness gets no bonus
      }
    })
    
    // Ensure score stays within beginner bounds (15-40)
    // Everyone who takes this assessment needs improvement!
    confidenceScore = Math.max(15, Math.min(40, confidenceScore))
    
    console.log('Problem scores:', problemScores)
    console.log('User type scores:', userTypeScores)
    console.log('User age:', userAge)
    console.log('Calculated confidence score:', confidenceScore)
    console.log('Detected user type:', userType)
    console.log('Assigned coach:', assignedCoach)

    return {
      userType,
      coach: assignedCoach,
      confidenceScore,
      scores: userTypeScores
    }
  }

  // All 10 questions
  const questions = [
    {
      title: "What's going through your head when you're about to be intimate?",
      subtitle: "No judgment here - just trying to understand where you're at",
      answers: [
        { text: "I'm worried I'll disappoint her", description: "My mind races with all the ways I might mess up" },
        { text: "I'm stressed about lasting long enough", description: "Physical stuff is what I worry about most" },
        { text: "I honestly don't know what I'm doing", description: "I feel like I'm missing some manual everyone else got" },
        { text: "I want to be confident but I'm nervous", description: "I know what I want but doubt holds me back" },
        { text: "I want us to really connect first", description: "The emotional stuff matters more to me" }
      ]
    },
    {
      title: "A woman you're attracted to is clearly interested in you. What happens next?",
      subtitle: "Just being real about how these situations actually go",
      answers: [
        { text: "I start overthinking everything", description: "What if I say the wrong thing? What if she changes her mind?" },
        { text: "I worry about performing well", description: "My mind jumps straight to bedroom performance anxiety" },
        { text: "I second-guess if she's really interested", description: "Maybe I'm reading the signals wrong?" },
        { text: "I get excited but then freeze up", description: "I know I should make a move but something stops me" },
        { text: "I want to get to know her better first", description: "Physical attraction is just the starting point for me" }
      ]
    },
    {
      title: "How would your friends describe your dating life?",
      subtitle: "The people who know you best - what would they say?",
      answers: [
        { text: "He gets in his own head too much", description: "They see me sabotage good situations by overthinking" },
        { text: "He avoids taking things physical", description: "They notice I keep things surface-level" },
        { text: "He's still figuring it out", description: "They're supportive but know I'm learning" },
        { text: "He has potential but holds back", description: "They see glimpses of confidence but inconsistency" },
        { text: "He takes relationships seriously", description: "They know I'm looking for something real" }
      ]
    },
    {
      title: "Think about your biggest regret with someone you were interested in.",
      subtitle: "We all have that one situation we wish we'd handled differently",
      answers: [
        { text: "I was too nervous to be myself", description: "Anxiety made me act weird instead of being natural" },
        { text: "I avoided physical intimacy", description: "I was too scared of not performing well" },
        { text: "I had no clue what I was doing", description: "I felt completely out of my depth" },
        { text: "I played it way too safe", description: "I held back when I should have been bold" },
        { text: "We never really connected deeply", description: "It felt shallow when I wanted something meaningful" }
      ]
    },
    {
      title: "When someone criticizes or rejects you, what's your typical reaction?",
      subtitle: "How we handle setbacks says a lot about where we're at",
      answers: [
        { text: "I replay it in my head for days", description: "I analyze every detail of what went wrong" },
        { text: "I assume it's about my performance", description: "I figure they weren't satisfied with what I could offer" },
        { text: "I know I probably did something obviously wrong", description: "I'm aware I'm still learning the basics" },
        { text: "It stings but I try to learn from it", description: "I want to improve even though rejection hurts" },
        { text: "I figure we just weren't compatible", description: "Not everyone is meant to connect deeply" }
      ]
    },
    {
      title: "What would success look like for you in the next month?",
      subtitle: "If things went really well, what would actually change?",
      answers: [
        { text: "I'd feel relaxed and natural around women", description: "No more anxiety killing the vibe" },
        { text: "I'd feel confident about physical intimacy", description: "Not worried about performance anymore" },
        { text: "I'd actually know what to do and say", description: "Feel competent instead of clueless" },
        { text: "I'd approach women without second-guessing", description: "Natural confidence instead of hesitation" },
        { text: "I'd build deeper, real connections", description: "Quality over quantity in relationships" }
      ]
    },
    {
      title: "How much time could you realistically spend on this per day?",
      subtitle: "Being honest about your schedule and commitment",
      answers: [
        { text: "10-15 minutes of focused effort", description: "Consistent but manageable daily practice" },
        { text: "20-30 minutes of practice", description: "Solid daily commitment to improvement" },
        { text: "30-45 minutes when I'm motivated", description: "Serious about getting results quickly" },
        { text: "An hour or more on good days", description: "All-in approach when I'm feeling it" },
        { text: "Whatever it takes to see change", description: "Flexible but committed to transformation" }
      ]
    },
    {
      title: "How do you prefer to learn new things?",
      subtitle: "Everyone's different - what works best for you?",
      answers: [
        { text: "Step-by-step guides I can follow", description: "I like clear structure and knowing what comes next" },
        { text: "Practical exercises and real techniques", description: "Show me exactly what to do and I'll practice it" },
        { text: "Start from the basics and build up", description: "I want to understand everything properly" },
        { text: "Real situations and examples", description: "I learn best by seeing how it works in practice" },
        { text: "Understanding people and emotions", description: "The psychology behind it all interests me" }
      ]
    },
    {
      title: "What's your biggest frustration right now?",
      subtitle: "What's the thing that bothers you most about your current situation?",
      answers: [
        { text: "I get in my own way constantly", description: "My mind works against me when I want to be confident" },
        { text: "I avoid intimacy because I'm worried", description: "Fear of underperforming keeps me from trying" },
        { text: "I feel behind compared to other guys", description: "Like everyone else got a head start somehow" },
        { text: "I have good moments but can't stay consistent", description: "My confidence comes and goes unpredictably" },
        { text: "Dating feels superficial and meaningless", description: "I want real connection but struggle to find it" }
      ]
    },
    {
      title: "On a scale of readiness, where are you right now?",
      subtitle: "How committed are you to actually making changes?",
      answers: [
        { text: "I'm really struggling and need help", description: "This is affecting my life and I'm ready to change" },
        { text: "I'm motivated and ready to put in work", description: "I'm serious about transformation" },
        { text: "I'm hopeful and open to trying new things", description: "Optimistic about what's possible" },
        { text: "I'm cautious but willing to commit", description: "Show me it works and I'll stick with it" },
        { text: "I'm patient and focused on real growth", description: "Quality change over quick fixes" }
      ]
    }
  ]

  // Handle age verification
  const handleAgeSubmit = () => {
    const age = parseInt(inputAge)
    if (!age || age < 18) {
      setShowAgeError(true)
      return
    }
    setUserAge(age)
    
    // Save age to localStorage for dashboard personalization
    const existingUser = localStorage.getItem('alpharise_user')
    if (existingUser) {
      const userData = JSON.parse(existingUser)
      userData.age = age
      localStorage.setItem('alpharise_user', JSON.stringify(userData))
    } else {
      localStorage.setItem('alpharise_user', JSON.stringify({ age }))
    }
    
    setCurrentQuestion(0) // Move to first actual question
    setShowAgeError(false)
  }

  const currentQuestionData = currentQuestion >= 0 ? questions[currentQuestion] : null

  const handleAnswerSelect = (index: number) => {
    setSelectedAnswer(index)
    
    // Save the answer
    const newAnswers = [...answers]
    newAnswers[currentQuestion] = index
    setAnswers(newAnswers)
    
    // Auto-advance to next question after 500ms
    setTimeout(() => {
      handleNext()
    }, 500)
  }

  const handleNext = () => {
    if (currentQuestion < 9) {
      setCurrentQuestion(prev => prev + 1)
      setSelectedAnswer(answers[currentQuestion + 1] ?? null)
    } else {
      // Last question - calculate user type and coach, then redirect
      const result = calculateUserTypeAndCoach()
      router.push(`/results?userType=${result.userType}&coach=${result.coach}&age=${userAge}&confidenceScore=${result.confidenceScore}`)
    }
  }

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(prev => prev - 1)
      setSelectedAnswer(answers[currentQuestion - 1] ?? null)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white">
      {/* Header */}
      <header className="p-6 flex items-center justify-between">
        <button
          onClick={() => router.push('/')}
          className="px-4 py-2 bg-black/30 border border-purple-500/30 rounded-lg text-purple-400 hover:bg-purple-500/10 hover:border-purple-500/50 transition-all font-medium"
        >
          ← Home
        </button>
        
        <div className="text-3xl font-black text-white">
          AlphaRise
        </div>
        
        <div className="w-20"></div> {/* Spacer for centering */}
      </header>

      {/* Progress Bar */}
      {currentQuestion >= 0 && (
        <div className="max-w-2xl mx-auto px-6 mb-8">
          <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-purple-600 via-magenta-600 to-pink-600 rounded-full transition-all duration-500"
              style={{ width: `${((currentQuestion + 1) / 10) * 100}%` }}
            ></div>
          </div>
          <div className="text-center mt-3 text-sm opacity-70">
            Building your profile... Step {currentQuestion + 1} of 10
          </div>
        </div>
      )}

      {/* Question Container */}
      <div className="max-w-4xl mx-auto px-6">
        {currentQuestion === -1 ? (
          /* Age Verification */
          <motion.div 
            className="bg-black/30 backdrop-blur-sm border border-purple-500/20 rounded-2xl p-8 text-center"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="text-orange-400 font-semibold text-sm uppercase tracking-wide mb-6">
              🔒 Age Verification Required
            </div>
            
            <h2 className="text-3xl md:text-4xl font-bold mb-6 leading-tight bg-gradient-to-r from-purple-500 via-magenta-500 to-pink-500 bg-clip-text text-transparent">
              What's your age?
            </h2>
            
            <p className="text-lg opacity-70 mb-8 leading-relaxed">
              This assessment contains mature content and is designed for adults only. We also use your age to match you with the right coach for your specific challenges.
            </p>

            {showAgeError && (
              <div className="mb-6 p-4 bg-red-500/20 border border-red-500/30 rounded-lg">
                <div className="text-red-400 font-semibold mb-2">⚠️ Access Restricted</div>
                <p className="text-sm">You must be 18 or older to use AlphaRise. This service contains mature content and adult-oriented guidance.</p>
              </div>
            )}

            <div className="mb-8 space-y-4">
              <input
                type="number"
                placeholder="Enter your age"
                min="16"
                max="100"
                value={inputAge}
                className="w-full max-w-xs mx-auto p-4 bg-black/60 border border-purple-500/30 rounded-lg text-white text-center text-xl font-semibold focus:border-purple-500 focus:outline-none"
                onChange={(e) => {
                  setInputAge(e.target.value)
                  setShowAgeError(false)
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleAgeSubmit()
                  }
                }}
              />
              
              <button
                onClick={handleAgeSubmit}
                disabled={!inputAge}
                className="block mx-auto px-8 py-3 bg-gradient-to-r from-purple-600 to-magenta-600 hover:from-purple-700 hover:to-magenta-700 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed rounded-lg font-semibold transition-all transform hover:scale-105 disabled:scale-100"
              >
                Continue to Assessment
              </button>
            </div>

            <div className="text-xs opacity-60 max-w-lg mx-auto">
              🛡️ <strong>Privacy:</strong> Your age is used solely for personalization and legal compliance. We never share personal information with third parties.
            </div>
          </motion.div>
        ) : (
          /* Regular Assessment Questions */
          <motion.div 
            className="bg-black/30 backdrop-blur-sm border border-purple-500/20 rounded-2xl p-8 text-center"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="text-cyan-400 font-semibold text-sm uppercase tracking-wide mb-6">
              Discovering Your Type • Step {currentQuestion + 1} of 10
            </div>
            
            <h2 className="text-3xl md:text-4xl font-bold mb-6 leading-tight bg-gradient-to-r from-purple-500 via-magenta-500 to-pink-500 bg-clip-text text-transparent">
              {currentQuestionData?.title}
            </h2>
            
            <p className="text-lg opacity-70 mb-12 leading-relaxed">
              {currentQuestionData?.subtitle}
            </p>

          <div className="space-y-4 mb-12">
            {currentQuestionData?.answers.map((answer, index) => (
              <motion.div
                key={index}
                onClick={() => handleAnswerSelect(index)}
                className={`p-6 border-2 rounded-xl cursor-pointer transition-all duration-300 text-left
                  ${selectedAnswer === index 
                    ? 'border-purple-500 bg-purple-500/20 shadow-lg shadow-purple-500/25' 
                    : 'border-purple-500/20 bg-black/20 hover:border-magenta-500/50 hover:bg-purple-500/10'
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
                className="px-6 py-3 border border-purple-500/30 rounded-full font-medium hover:bg-purple-500/10 transition-all duration-300"
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
        )}
      </div>
    </div>
  )
}