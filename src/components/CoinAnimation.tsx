'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'

interface CoinAnimationProps {
  show: boolean
  amount: number // positive for gain, negative for loss
  position: { x: number; y: number } // absolute position on screen
  onComplete?: () => void
}

export default function CoinAnimation({ show, amount, position, onComplete }: CoinAnimationProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [mounted, setMounted] = useState(false)

  // Handle client-side mounting
  useEffect(() => {
    setMounted(true)
  }, [])

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

  if (!mounted || !isVisible || amount === 0) return null

  const isGain = amount > 0
  const displayText = `${isGain ? '+' : ''}${amount}`
  const textColor = isGain ? 'text-green-400' : 'text-orange-400'
  const glowColor = isGain ? 'shadow-green-400/50' : 'shadow-orange-400/50'

  const animationContent = (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className="fixed pointer-events-none z-[9999]"
          style={{
            left: position.x,
            top: position.y,
            transform: 'translate(-50%, -50%)'
          }}
          initial={{ 
            opacity: 0, 
            scale: 0.8, 
            y: 0 
          }}
          animate={{ 
            opacity: [0, 1, 1, 0],
            scale: [0.8, 1.2, 1.0, 1.0],
            y: [0, -10, -20, -30]
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
              px-3 py-2 rounded-md
              bg-black/80 backdrop-blur-sm
              border border-white/20
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

  return createPortal(animationContent, document.body)
}