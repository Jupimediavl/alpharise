'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useState, useEffect } from 'react'

interface CoinAnimationProps {
  show: boolean
  amount: number // positive for gain, negative for loss
  onComplete?: () => void
}

export default function CoinAnimation({ show, amount, onComplete }: CoinAnimationProps) {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    if (show && amount !== 0) {
      setIsVisible(true)
      // Auto-hide after animation completes
      const timer = setTimeout(() => {
        setIsVisible(false)
        onComplete?.()
      }, 2500)
      return () => clearTimeout(timer)
    }
  }, [show, amount, onComplete])

  if (!isVisible || amount === 0) return null

  const isGain = amount > 0
  const displayText = `${isGain ? '+' : ''}${amount}`
  const textColor = isGain ? 'text-green-400' : 'text-orange-400'
  const glowColor = isGain ? 'shadow-green-400/50' : 'shadow-orange-400/50'

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className={`absolute left-full ml-2 top-1/2 -translate-y-1/2 pointer-events-none z-50`}
          initial={{ 
            opacity: 0, 
            scale: 0.8, 
            y: 5 
          }}
          animate={{ 
            opacity: [0, 1, 1, 0],
            scale: [0.8, 1.2, 1.0, 1.0],
            y: [5, -5, -10, -15]
          }}
          transition={{
            duration: 2.5,
            times: [0, 0.2, 0.4, 1],
            ease: "easeOut"
          }}
          onAnimationComplete={() => {
            setIsVisible(false)
            onComplete?.()
          }}
        >
          <div 
            className={`
              ${textColor} 
              ${glowColor}
              font-bold text-lg
              drop-shadow-lg
              shadow-lg
              px-2 py-1 rounded-md
              bg-black/20 backdrop-blur-sm
              border border-white/10
            `}
            style={{
              textShadow: isGain ? '0 0 8px rgba(34, 197, 94, 0.6)' : '0 0 8px rgba(251, 146, 60, 0.6)'
            }}
          >
            {displayText}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}