'use client'

import { motion } from 'framer-motion'
import { useState } from 'react'
import { 
  ChatBubbleLeftRightIcon,
  SparklesIcon,
  TrophyIcon,
  HeartIcon,
  BoltIcon,
  UserGroupIcon
} from '@heroicons/react/24/outline'

interface CoachSectionProps {
  primaryProblem: string
  coachId?: string
  userName?: string
  completedSteps: number
  totalSteps: number
}

// Coach data with avatars, personalities, and messaging
const COACHES = {
  blake: {
    name: 'Blake',
    title: 'Performance Anxiety Expert',
    avatar: '/avatars/blake.png',
    specialty: 'Overcoming Bedroom Nerves',
    color: 'from-purple-500 to-pink-500',
    accent: 'purple',
    personality: 'calm and reassuring',
    greeting: "Hey {name}! Remember, confidence is built one step at a time.",
    motivation: "You're stronger than your anxiety thinks you are.",
    successMessage: "Every small win builds unshakeable confidence.",
    completionMessage: "You've transformed your mindset completely!"
  },
  chase: {
    name: 'Chase',
    title: 'Stamina & Control Master',
    avatar: '/avatars/chase.png',
    specialty: 'Lasting Longer',
    color: 'from-red-500 to-orange-500',
    accent: 'red',
    personality: 'direct and results-focused',
    greeting: "What's up {name}! Ready to take control?",
    motivation: "Every technique you master gets you closer to total control.",
    successMessage: "You're building real, lasting improvements.",
    completionMessage: "You now have complete mastery over your body!"
  },
  logan: {
    name: 'Logan',
    title: 'Social Confidence Coach',
    avatar: '/avatars/logan.png',
    specialty: 'Approaching Women',
    color: 'from-blue-500 to-cyan-500',
    accent: 'blue',
    personality: 'charismatic and encouraging',
    greeting: "Hey {name}! Ready to unlock your natural charisma?",
    motivation: "Every conversation is a chance to grow your confidence.",
    successMessage: "You're becoming the man who approaches with ease.",
    completionMessage: "You're now socially confident in any situation!"
  },
  mason: {
    name: 'Mason',
    title: 'Strength & Vitality Expert',
    avatar: '/avatars/mason.png',
    specialty: 'Stronger Erections',
    color: 'from-green-500 to-emerald-500',
    accent: 'green',
    personality: 'supportive and knowledgeable',
    greeting: "Hello {name}! Let's build your strength from the ground up.",
    motivation: "Your body is capable of incredible improvements.",
    successMessage: "You're developing reliable strength and confidence.",
    completionMessage: "You've achieved the strength and reliability you wanted!"
  },
  knox: {
    name: 'Knox',
    title: 'Intimacy & Connection Guide',
    avatar: '/avatars/knox.png',
    specialty: 'Deeper Relationships',
    color: 'from-yellow-500 to-amber-500',
    accent: 'yellow',
    personality: 'warm and understanding',
    greeting: "Hi {name}! Great relationships start with great communication.",
    motivation: "Every conversation deepens your connection.",
    successMessage: "You're building the relationship skills that last.",
    completionMessage: "You've mastered the art of intimate connection!"
  }
}

// Problem to coach mapping
const PROBLEM_TO_COACH = {
  'performance_anxiety': 'blake',
  'premature_ejaculation': 'chase',
  'approach_anxiety': 'logan',
  'confidence_building': 'logan',
  'social_confidence': 'logan',
  'erectile_dysfunction': 'mason',
  'intimacy_communication': 'knox',
  'relationship_building': 'knox'
}

const PROBLEM_DISPLAY_NAMES = {
  'performance_anxiety': 'Performance Anxiety',
  'premature_ejaculation': 'Premature Ejaculation',
  'approach_anxiety': 'Approach Anxiety',
  'confidence_building': 'Confidence Building',
  'social_confidence': 'Social Confidence',
  'erectile_dysfunction': 'Erectile Dysfunction',
  'intimacy_communication': 'Intimacy & Communication',
  'relationship_building': 'Relationship Building'
}

export default function CoachSection({ 
  primaryProblem, 
  coachId, 
  userName = 'Champion',
  completedSteps,
  totalSteps
}: CoachSectionProps) {
  const [showEncouragement, setShowEncouragement] = useState(false)
  
  // Determine coach based on problem or provided coachId
  const determinedCoachId = coachId || PROBLEM_TO_COACH[primaryProblem as keyof typeof PROBLEM_TO_COACH] || 'logan'
  const coach = COACHES[determinedCoachId as keyof typeof COACHES]
  const problemDisplayName = PROBLEM_DISPLAY_NAMES[primaryProblem as keyof typeof PROBLEM_DISPLAY_NAMES] || 'Personal Growth'

  // Dynamic messaging based on progress
  const getCoachMessage = () => {
    const progressPercentage = totalSteps > 0 ? Math.round((completedSteps / totalSteps) * 100) : 0
    
    if (progressPercentage === 0) {
      return coach.greeting.replace('{name}', userName)
    } else if (progressPercentage < 30) {
      return coach.motivation
    } else if (progressPercentage < 80) {
      return coach.successMessage
    } else if (progressPercentage === 100) {
      return coach.completionMessage
    } else {
      return coach.successMessage
    }
  }

  const getProgressIcon = () => {
    const progressPercentage = totalSteps > 0 ? Math.round((completedSteps / totalSteps) * 100) : 0
    if (progressPercentage < 25) return SparklesIcon
    if (progressPercentage < 50) return BoltIcon
    if (progressPercentage < 75) return TrophyIcon
    return HeartIcon
  }

  const ProgressIcon = getProgressIcon()

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gray-900 rounded-xl p-6 border border-gray-800 mb-8 overflow-hidden relative"
    >
      {/* Background gradient */}
      <div className={`absolute inset-0 bg-gradient-to-br ${coach.color} opacity-5`} />
      
      <div className="relative">
        {/* Header with Coach Info */}
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center space-x-4">
            {/* Coach Avatar */}
            <div className="w-16 h-16 shadow-lg">
              <img 
                src={coach.avatar} 
                alt={`${coach.name} - Your Coach`}
                className="w-16 h-16 object-cover rounded-lg"
                onError={(e) => {
                  // Fallback to gradient circle with initial if image fails to load
                  const target = e.target as HTMLImageElement
                  target.style.display = 'none'
                  const fallback = target.nextElementSibling as HTMLElement
                  if (fallback) fallback.style.display = 'flex'
                }}
              />
              <div className={`w-16 h-16 rounded-full bg-gradient-to-br ${coach.color} flex items-center justify-center text-2xl shadow-lg hidden`}>
                {coach.name[0]}
              </div>
            </div>
            
            {/* Coach Details */}
            <div>
              <div className="flex items-center space-x-2 mb-1">
                <h3 className="text-lg font-bold text-white">{coach.name}</h3>
                <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                  coach.accent === 'purple' ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30' :
                  coach.accent === 'red' ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
                  coach.accent === 'blue' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' :
                  coach.accent === 'green' ? 'bg-green-500/20 text-green-400 border border-green-500/30' :
                  'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                }`}>
                  Your Coach
                </span>
              </div>
              <p className="text-sm text-gray-400 mb-1">{coach.title}</p>
              <div className="flex items-center space-x-2">
                <div className={`w-2 h-2 rounded-full animate-pulse ${
                  coach.accent === 'purple' ? 'bg-purple-500' :
                  coach.accent === 'red' ? 'bg-red-500' :
                  coach.accent === 'blue' ? 'bg-blue-500' :
                  coach.accent === 'green' ? 'bg-green-500' :
                  'bg-yellow-500'
                }`} />
                <span className="text-xs text-gray-500">Specializing in {coach.specialty}</span>
              </div>
            </div>
          </div>

        </div>

        {/* Problem Focus */}
        <div className="bg-gray-800/50 rounded-lg p-4 mb-4">
          <div className="flex items-center space-x-3 mb-2">
            <div className={`w-3 h-3 rounded-full ${
              coach.accent === 'purple' ? 'bg-purple-500' :
              coach.accent === 'red' ? 'bg-red-500' :
              coach.accent === 'blue' ? 'bg-blue-500' :
              coach.accent === 'green' ? 'bg-green-500' :
              'bg-yellow-500'
            }`} />
            <span className="text-sm font-medium text-gray-300">Working on</span>
          </div>
          <h4 className="text-lg font-semibold text-white mb-1">{problemDisplayName}</h4>
          <p className="text-sm text-gray-400">
            {coach.name}'s proven methods for lasting change
          </p>
        </div>

        {/* Coach Message */}
        <motion.div 
          className={`bg-gray-800/30 rounded-lg p-4 border-l-4 ${
            coach.accent === 'purple' ? 'border-l-purple-500' :
            coach.accent === 'red' ? 'border-l-red-500' :
            coach.accent === 'blue' ? 'border-l-blue-500' :
            coach.accent === 'green' ? 'border-l-green-500' :
            'border-l-yellow-500'
          }`}
        >
          <div className="flex items-start space-x-3">
            <ChatBubbleLeftRightIcon className={`h-5 w-5 mt-0.5 flex-shrink-0 ${
              coach.accent === 'purple' ? 'text-purple-400' :
              coach.accent === 'red' ? 'text-red-400' :
              coach.accent === 'blue' ? 'text-blue-400' :
              coach.accent === 'green' ? 'text-green-400' :
              'text-yellow-400'
            }`} />
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-300 mb-1">
                {coach.name} says:
              </p>
              <p className="text-white leading-relaxed">
                "{getCoachMessage()}"
              </p>
            </div>
          </div>
        </motion.div>


        {/* Success Stories Teaser */}
        {completedSteps > 2 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="mt-4 pt-4 border-t border-gray-800"
          >
            <div className="flex items-center space-x-2 text-sm text-gray-400">
              <UserGroupIcon className="h-4 w-4" />
              <span>
                Join {Math.floor(Math.random() * 500 + 1000)}+ men who've transformed with {coach.name}
              </span>
            </div>
          </motion.div>
        )}
      </div>
    </motion.div>
  )
}