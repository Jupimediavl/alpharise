'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'

export default function AssessmentPage() {
  const router = useRouter()
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null)

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

  const currentQuestionData = questions[currentQuestion]

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
            {currentQuestionData.title}
          </h2>
          
          <p className="text-lg opacity-70 mb-12 leading-relaxed">
            {currentQuestionData.subtitle}
          </p>

          <div className="space-y-4 mb-12">
            {currentQuestionData.answers.map((answer, index) => (
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