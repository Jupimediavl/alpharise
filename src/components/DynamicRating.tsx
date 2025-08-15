// Fixed DynamicRating component with proper user validation and coin system

'use client'

import { useState } from 'react'
import { Star, Coins } from 'lucide-react'
import { SupabaseAnswerManager, SupabaseCoinManager } from '@/lib/supabase'

interface DynamicRatingProps {
  answerId: string
  authorId: string
  currentRating: number
  ratedBy: string[]
  coinEarnings: number
  currentUser: string
  onRatingUpdate: (newRating: number, newCoinEarnings: number, newRatedBy: string[]) => void
  onCoinsEarned: (earnedCoins: number) => void
}

export default function DynamicRating({
  answerId,
  authorId,
  currentRating,
  ratedBy,
  coinEarnings,
  currentUser,
  onRatingUpdate,
  onCoinsEarned
}: DynamicRatingProps) {
  const [hoveredStar, setHoveredStar] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Check if current user can rate this answer
  const canRate = () => {
    // User cannot rate their own answer
    if (authorId === currentUser) {
      return { canRate: false, reason: 'This is your own answer' }
    }
    
    // User has already rated this answer
    if (ratedBy.includes(currentUser)) {
      return { canRate: false, reason: 'You have already rated this answer' }
    }

    return { canRate: true, reason: '' }
  }

  const { canRate: userCanRate, reason } = canRate()

  // Handle star click
  const handleStarClick = async (rating: number) => {
    if (!userCanRate || isSubmitting) return

    setIsSubmitting(true)

    try {
      console.log('🌟 Submitting rating:', {
        answerId,
        authorId,
        currentUser,
        rating,
        currentRating
      })

      const result = await SupabaseAnswerManager.rateAnswer(
        answerId,
        rating,
        currentUser
      )

      if (result.success) {
        // Update the UI with new values
        onRatingUpdate(
          result.newRating,
          result.coinEarnings + coinEarnings, // Add new earnings to existing
          [...ratedBy, currentUser]
        )

        // If coins were earned, record the transaction and update user
        if (result.coinEarnings > 0) {
          await SupabaseCoinManager.processAnswerReward(
            authorId,
            answerId.split('-')[0], // Extract question ID if needed
            answerId,
            result.coinEarnings,
            rating
          )

          // Notify parent about coins earned (for answer author)
          if (authorId === currentUser) {
            onCoinsEarned(result.coinEarnings)
          }
        }

        // Show success message
        console.log('✅ Rating submitted successfully:', result.message)
        
        // Optional: Show a toast notification instead of alert
        // showToast(result.message)
        
      } else {
        console.warn('⚠️ Rating failed:', result.message)
        alert(result.message)
      }

    } catch (error) {
      console.error('❌ Error submitting rating:', error)
      alert('Error submitting rating. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Render stars
  const renderStars = () => {
    const stars = []
    const displayRating = hoveredStar || Math.round(currentRating)

    for (let i = 1; i <= 5; i++) {
      const isActive = i <= displayRating
      const isHovered = hoveredStar > 0 && i <= hoveredStar
      
      stars.push(
        <button
          key={i}
          className={`transition-all duration-200 ${
            userCanRate && !isSubmitting
              ? 'hover:scale-110 cursor-pointer'
              : 'cursor-default'
          } ${
            isHovered
              ? 'text-yellow-400 transform scale-110'
              : isActive
              ? 'text-yellow-400'
              : 'text-gray-600'
          }`}
          onMouseEnter={() => userCanRate && setHoveredStar(i)}
          onMouseLeave={() => userCanRate && setHoveredStar(0)}
          onClick={() => handleStarClick(i)}
          disabled={!userCanRate || isSubmitting}
          title={
            userCanRate 
              ? `Rate ${i} star${i !== 1 ? 's' : ''}` 
              : reason
          }
        >
          <Star
            className={`w-4 h-4 ${
              isActive || isHovered ? 'fill-current' : ''
            }`}
          />
        </button>
      )
    }

    return stars
  }

  return (
    <div className="flex items-center justify-between">
      {/* Left side: Stars and rating info */}
      <div className="flex items-center gap-3">
        {/* Stars */}
        <div className="flex items-center gap-1">
          {renderStars()}
        </div>

        {/* Rating details */}
        <div className="flex items-center gap-2 text-xs">
          {currentRating > 0 ? (
            <>
              <span className="text-yellow-400 font-semibold">
                {currentRating.toFixed(1)}
              </span>
              <span className="text-gray-400">
                ({ratedBy.length} rating{ratedBy.length !== 1 ? 's' : ''})
              </span>
            </>
          ) : (
            <span className="text-gray-400">No ratings yet</span>
          )}
        </div>

        {/* User status message */}
        {!userCanRate && (
          <div className="text-xs text-gray-400 italic">
            {reason}
          </div>
        )}

        {/* Loading indicator */}
        {isSubmitting && (
          <div className="text-xs text-blue-400">
            Submitting...
          </div>
        )}
      </div>

      {/* Right side: Coin earnings */}
      {coinEarnings > 0 && (
        <div className="flex items-center gap-1 text-yellow-400 text-xs font-semibold">
          <Coins className="w-3 h-3" />
          <span>+{coinEarnings}</span>
        </div>
      )}
    </div>
  )
}