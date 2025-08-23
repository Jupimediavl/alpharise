'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { Clock } from 'lucide-react'
import { createClient } from '@supabase/supabase-js'
import { useOnboardingProtection } from '@/hooks/useOnboardingProtection'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

// UI styling data (colors, avatars etc - these stay hardcoded for design consistency)
const coachStyling = {
  blake: {
    avatar: '/avatars/blake.png',
    color: 'from-purple-400 to-pink-400',
    borderColor: 'border-purple-400',
    bgColor: 'bg-purple-500',
    pillColor: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
    duration: '3-5 min/day'
  },
  chase: {
    avatar: '/avatars/chase.png',
    color: 'from-red-400 to-orange-400',
    borderColor: 'border-orange-400',
    bgColor: 'bg-orange-500',
    pillColor: 'bg-orange-500/20 text-orange-300 border-orange-500/30',
    duration: '5-7 min/day'
  },
  logan: {
    avatar: '/avatars/logan.png',
    color: 'from-blue-400 to-cyan-400',
    borderColor: 'border-blue-400',
    bgColor: 'bg-blue-500',
    pillColor: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
    duration: '3-5 min/day'
  },
  mason: {
    avatar: '/avatars/mason.png',
    color: 'from-green-400 to-emerald-400',
    borderColor: 'border-green-400',
    bgColor: 'bg-green-500',
    pillColor: 'bg-green-500/20 text-green-300 border-green-500/30',
    duration: '5-10 min/day'
  },
  knox: {
    avatar: '/avatars/knox.png',
    color: 'from-yellow-400 to-amber-400',
    borderColor: 'border-yellow-400',
    bgColor: 'bg-yellow-500',
    pillColor: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
    duration: '3-5 min/day'
  }
}

export default function CoachSelection() {
  const router = useRouter()
  
  // Protect onboarding pages from users who already completed onboarding
  const { isLoading: isCheckingOnboarding, shouldRedirect } = useOnboardingProtection()
  
  const [selectedCoach, setSelectedCoach] = useState<string | null>(null)
  const [coaches, setCoaches] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Load coaches from database on component mount
  useEffect(() => {
    async function loadCoaches() {
      try {
        const { data: coachesData, error } = await supabase
          .from('coaches')
          .select('id, name, description, expertise, icon, features, created_at')
          .order('id')

        if (error) {
          console.error('Error loading coaches:', error)
          return
        }

        if (coachesData && coachesData.length > 0) {
          // Merge database content with UI styling
          const mergedCoaches = coachesData.map(dbCoach => {
            // Use expertise from database if available, otherwise fallback to mapping
            let expertise = dbCoach.expertise
            
            if (!expertise) {
              // Fallback mapping if expertise column doesn't exist yet
              const expertiseMapping: { [key: string]: string } = {
                'chase': 'Premature Ejaculation',
                'blake': 'Performance Anxiety',
                'knox': 'Intimacy & Communication',  
                'logan': 'Approach Anxiety',
                'mason': 'Erectile Dysfunction'
              }
              expertise = expertiseMapping[dbCoach.id] || 'Personal Development'
            }
            
            return {
              id: dbCoach.id,
              name: dbCoach.name,
              problem: expertise,
              description: dbCoach.description,
              // Use styling data based on coach ID
              ...coachStyling[dbCoach.id as keyof typeof coachStyling],
              avatar: coachStyling[dbCoach.id as keyof typeof coachStyling]?.avatar || '/avatars/default.png',
              color: coachStyling[dbCoach.id as keyof typeof coachStyling]?.color || 'from-gray-400 to-gray-600',
              borderColor: coachStyling[dbCoach.id as keyof typeof coachStyling]?.borderColor || 'border-gray-400',
              bgColor: coachStyling[dbCoach.id as keyof typeof coachStyling]?.bgColor || 'bg-gray-500',
              pillColor: coachStyling[dbCoach.id as keyof typeof coachStyling]?.pillColor || 'bg-gray-500/20 text-gray-300 border-gray-500/30',
              duration: coachStyling[dbCoach.id as keyof typeof coachStyling]?.duration || '5 min/day'
            }
          })
          
          setCoaches(mergedCoaches)
        }
      } catch (error) {
        console.error('Error loading coaches:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadCoaches()
  }, [])

  const handleContinue = () => {
    if (!selectedCoach) return
    
    // Store selected coach in localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem('selected_coach', selectedCoach)
    }
    
    // Navigate to onboarding
    router.push('/onboarding')
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900/20 via-black to-blue-900/20">
      {/* Header */}
      <div className="p-6">
        <h1 className="text-3xl md:text-4xl font-bold text-white text-center mb-2">
          Choose Your Coach
        </h1>
        <p className="text-gray-400 text-center">
          Select the coach that matches your primary concern
        </p>
      </div>

      {/* Coach Grid */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {isLoading ? (
          <div className="text-center py-12">
            <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-400">Loading coaches...</p>
          </div>
        ) : coaches.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-400">No coaches available at the moment.</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {coaches.map((coach, index) => (
            <motion.div
              key={coach.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
              onClick={() => setSelectedCoach(coach.id)}
              className={`relative cursor-pointer group ${
                selectedCoach === coach.id ? 'transform scale-105' : ''
              }`}
            >
              <div className={`
                bg-gray-900/80 backdrop-blur-sm rounded-2xl p-6 
                border-2 transition-all duration-300
                ${selectedCoach === coach.id 
                  ? `${coach.borderColor} shadow-2xl shadow-${coach.bgColor}/20` 
                  : 'border-gray-800 hover:border-gray-700'
                }
              `}>
                {/* Avatar with colored ring */}
                <div className="flex justify-center mb-4">
                  <div className={`
                    relative w-24 h-24 rounded-full 
                    bg-gradient-to-br ${coach.color} p-1
                  `}>
                    <img 
                      src={coach.avatar} 
                      alt={coach.name}
                      className="w-full h-full rounded-full object-cover bg-gray-900"
                    />
                    {selectedCoach === coach.id && (
                      <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                        <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                    )}
                  </div>
                </div>

                {/* Coach Name */}
                <h3 className="text-xl font-bold text-white text-center mb-3">
                  {coach.name}
                </h3>

                {/* Problem Badge */}
                <div className="flex justify-center mb-4">
                  <span className={`
                    px-4 py-1.5 rounded-full text-sm font-medium
                    border ${coach.pillColor}
                  `}>
                    {coach.problem}
                  </span>
                </div>

                {/* Description */}
                <p className="text-gray-300 text-center text-sm mb-4 leading-relaxed">
                  "{coach.description}"
                </p>

                {/* Duration */}
                <div className="flex items-center justify-center text-gray-500 text-sm">
                  <Clock className="w-4 h-4 mr-1" />
                  <span>{coach.duration}</span>
                </div>
              </div>
            </motion.div>
          ))}
          </div>
        )}

        {/* Continue Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mt-12 text-center"
        >
          <button
            onClick={handleContinue}
            disabled={!selectedCoach}
            className={`
              px-12 py-4 rounded-full font-semibold text-lg
              transition-all duration-300 transform
              ${selectedCoach
                ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:scale-105 shadow-xl'
                : 'bg-gray-800 text-gray-500 cursor-not-allowed'
              }
            `}
          >
            Continue with {selectedCoach ? coaches.find(c => c.id === selectedCoach)?.name : 'Selected Coach'}
          </button>
          
          {!selectedCoach && (
            <p className="text-gray-500 text-sm mt-4">
              Please select a coach to continue
            </p>
          )}
        </motion.div>
      </div>
    </div>
  )
}