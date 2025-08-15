// components/DynamicRating.tsx
// Dynamic Rating System with Web 3.0 animations and real-time updates

'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Star, Sparkles, Coins } from 'lucide-react'
import { SupabaseAnswerManager, SupabaseCoinManager } from '@/lib/supabase'

interface DynamicRatingProps {
  answerId: string
  authorId: string
  currentRating: number
  ratedBy: string[]
  coinEarnings: number
  currentUser: string
  onRatingUpdate: (newRating: number, newCoinEarnings: number, newRatedBy: string[]) => void
  onCoinsEarned?: (amount: number) => void
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
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [hoveredStar, setHoveredStar] = useState(0)
  const [showSuccess, setShowSuccess] = useState(false)
  const [lastEarnedCoins, setLastEarnedCoins] = useState(0)

  // Check if user can rate
  const canRate = authorId !== currentUser && !ratedBy.includes(currentUser)

  const handleStarClick = async (rating: number) => {
    if (!canRate || isSubmitting) return

    setIsSubmitting(true)

    try {
      // Call Supabase rating function
      const result = await SupabaseAnswerManager.rateAnswer(answerId, rating, currentUser)

      if (result.success) {
        // Update local state immediately (optimistic update)
        const newRatedBy = [...ratedBy, currentUser]
        onRatingUpdate(result.newRating, coinEarnings + result.coinEarnings, newRatedBy)

        // Show success animation
        setLastEarnedCoins(result.coinEarnings)
        setShowSuccess(true)

        // Process coin reward for answer author if coins earned
        if (result.coinEarnings > 0) {
          await SupabaseCoinManager.processAnswerReward(
            authorId,
            '', // question ID not needed here
            answerId,
            result.coinEarnings,
            rating
          )

          // Notify parent about coins earned (for current user balance update if needed)
          if (authorId === currentUser && onCoinsEarned) {
            onCoinsEarned(result.coinEarnings)
          }
        }

        // Hide success message after animation
        setTimeout(() => setShowSuccess(false), 3000)
      } else {
        // Show error with modern toast instead of alert
        setShowSuccess(true)
        setLastEarnedCoins(0)
        setTimeout(() => setShowSuccess(false), 3000)
      }
    } catch (error) {
      console.error('Error submitting rating:', error)
      // Show error animation
      setShowSuccess(true)
      setLastEarnedCoins(-1) // Use -1 to indicate error
      setTimeout(() => setShowSuccess(false), 3000)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="relative">
      {/* Rating Display */}
      <div className="flex items-center gap-3 mb-3">
        {currentRating > 0 && (
          <motion.div 
            className="flex items-center gap-2 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 px-3 py-1 rounded-full border border-yellow-500/30"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: "spring", bounce: 0.4 }}
          >
            <Star className="h-4 w-4 text-yellow-400 fill-current" />
            <span className="text-sm font-bold text-yellow-400">{currentRating.toFixed(1)}</span>
            <span className="text-xs opacity-70">({ratedBy.length})</span>
          </motion.div>
        )}
        
        {coinEarnings > 0 && (
          <motion.div 
            className="flex items-center gap-1 bg-gradient-to-r from-green-500/20 to-emerald-500/20 px-3 py-1 rounded-full border border-green-500/30"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Coins className="w-4 h-4 text-green-400" />
            <span className="text-xs font-bold text-green-400">+{coinEarnings}</span>
          </motion.div>
        )}
      </div>

      {/* Interactive Rating Stars */}
      {canRate && (
        <div className="space-y-2">
          <div className="text-xs text-gray-400 font-medium">Rate this answer:</div>
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <motion.button
                key={star}
                onClick={() => handleStarClick(star)}
                onMouseEnter={() => setHoveredStar(star)}
                onMouseLeave={() => setHoveredStar(0)}
                disabled={isSubmitting}
                className={`relative p-2 rounded-xl transition-all duration-300 touch-manipulation ${
                  isSubmitting 
                    ? 'cursor-not-allowed opacity-50' 
                    : 'cursor-pointer hover:bg-gradient-to-r hover:from-yellow-500/10 hover:to-orange-500/10'
                }`}
                style={{ WebkitTapHighlightColor: 'transparent' }}
                whileHover={{ scale: 1.15 }}
                whileTap={{ scale: 0.9 }}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: star * 0.1 }}
              >
                <motion.div
                  animate={{
                    scale: hoveredStar >= star ? 1.2 : 1,
                    rotate: hoveredStar >= star ? 10 : 0
                  }}
                  transition={{ duration: 0.3, type: "tween" }}
                >
                  <Star 
                    className={`h-8 w-8 md:h-7 md:w-7 transition-all duration-300 ${
                      hoveredStar >= star 
                        ? 'text-yellow-400 fill-yellow-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.6)]' 
                        : 'text-gray-500 hover:text-yellow-300'
                    }`}
                  />
                </motion.div>

                {/* Sparkle effect on hover */}
                <AnimatePresence>
                  {hoveredStar >= star && (
                    <>
                      <motion.div
                        className="absolute -top-1 -right-1 text-yellow-300"
                        initial={{ opacity: 0, scale: 0, rotate: 0 }}
                        animate={{ opacity: 1, scale: 1, rotate: 360 }}
                        exit={{ opacity: 0, scale: 0 }}
                        transition={{ duration: 0.4 }}
                      >
                        <Sparkles className="h-3 w-3" />
                      </motion.div>
                      <motion.div
                        className="absolute -bottom-1 -left-1 text-yellow-400"
                        initial={{ opacity: 0, scale: 0, rotate: 0 }}
                        animate={{ opacity: 0.8, scale: 0.8, rotate: -360 }}
                        exit={{ opacity: 0, scale: 0 }}
                        transition={{ duration: 0.4, delay: 0.1 }}
                      >
                        <Sparkles className="h-2 w-2" />
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>

                {/* Glow effect */}
                {hoveredStar >= star && (
                  <motion.div
                    className="absolute inset-0 bg-yellow-400/20 rounded-xl blur-sm"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  />
                )}
              </motion.button>
            ))}
          </div>

          {/* Loading indicator */}
          {isSubmitting && (
            <motion.div 
              className="flex items-center gap-2 text-sm text-blue-400"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full"
              />
              <span className="font-medium">Submitting rating...</span>
            </motion.div>
          )}
        </div>
      )}

      {/* Already rated message */}
      {!canRate && ratedBy.includes(currentUser) && (
        <motion.div 
          className="flex items-center gap-2 text-xs text-green-400 bg-green-500/10 px-3 py-2 rounded-lg border border-green-500/20"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <motion.span
            animate={{ scale: 1.2 }}
            transition={{ duration: 0.6, repeat: Infinity, repeatType: "reverse" }}
          >
            ✓
          </motion.span>
          <span>You have rated this answer</span>
        </motion.div>
      )}

      {/* Cannot rate own answer */}
      {authorId === currentUser && (
        <div className="text-xs text-gray-500 opacity-80 bg-gray-700/20 px-3 py-2 rounded-lg">
          This is your answer
        </div>
      )}

      {/* Success/Error Animation */}
      <AnimatePresence>
        {showSuccess && (
          <motion.div
            className="absolute -top-16 left-1/2 transform -translate-x-1/2 z-50"
            initial={{ opacity: 0, y: 20, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.8 }}
            transition={{ type: "spring", bounce: 0.5 }}
          >
            <motion.div 
              className={`px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2 ${
                lastEarnedCoins === -1 
                  ? 'bg-red-500 text-white' 
                  : 'bg-gradient-to-r from-green-500 to-emerald-500 text-white'
              }`}
              animate={{ 
                boxShadow: "0 20px 40px rgba(34,197,94,0.4)"
              }}
              transition={{ duration: 2, repeat: Infinity, repeatType: "reverse" }}
            >
              <motion.div
                animate={{ 
                  rotate: lastEarnedCoins === -1 ? 0 : 360,
                  scale: 1.2
                }}
                transition={{ duration: 0.8, type: "tween" }}
              >
                {lastEarnedCoins === -1 ? '❌' : '🎉'}
              </motion.div>
              <span className="text-sm font-bold">
                {lastEarnedCoins === -1 
                  ? 'Rating failed!' 
                  : lastEarnedCoins > 0 
                  ? `+${lastEarnedCoins} AlphaCoins earned!` 
                  : 'Rating submitted!'
                }
              </span>
              {lastEarnedCoins > 0 && (
                <motion.div
                  animate={{ rotate: [0, 360] }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                >
                  <Coins className="w-4 h-4" />
                </motion.div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hover hint with coin rewards */}
      <AnimatePresence>
        {canRate && hoveredStar > 0 && (
          <motion.div 
            className="mt-2 text-xs font-medium bg-gradient-to-r from-gray-800 to-gray-700 px-3 py-2 rounded-lg border border-gray-600"
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 5 }}
          >
            <div className="flex items-center justify-between">
              <span className="text-gray-300">
                {hoveredStar === 1 && "Poor answer"}
                {hoveredStar === 2 && "Below average"}
                {hoveredStar === 3 && "Average answer"}
                {hoveredStar === 4 && "Good answer"}
                {hoveredStar === 5 && "Excellent answer"}
              </span>
              <span className="flex items-center gap-1 text-yellow-400 font-bold">
                <Coins className="w-3 h-3" />
                {hoveredStar >= 3 && hoveredStar <= 3 && "+3"}
                {hoveredStar >= 4 && hoveredStar <= 4 && "+5"}
                {hoveredStar === 5 && "+8"}
                {hoveredStar < 3 && "+3"}
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}