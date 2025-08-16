// /components/SimpleCoinIntegration.tsx
// Components for integrating the simple coin system

'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Coins, ThumbsUp, Award, Star } from 'lucide-react'
import { simpleCoinHelpers, simpleCoinManager } from '@/lib/simple-coin-system'

// Answer Voting Component (replaces DynamicRating)
interface SimpleAnswerVotingProps {
  answerId: string
  authorId: string
  currentUserId: string
  questionAuthorId?: string // NEW: To detect clarifications
  onVoteSuccess?: (coinsEarned: number, totalVotes: number, isBestAnswer: boolean) => void
}

export function SimpleAnswerVoting({ 
  answerId, 
  authorId, 
  currentUserId, 
  questionAuthorId,
  onVoteSuccess 
}: SimpleAnswerVotingProps) {
  const [answerData, setAnswerData] = useState<any>(null)
  const [isVoting, setIsVoting] = useState(false)
  const [hasVoted, setHasVoted] = useState(false)

  // ANTI-FRAUD: Detect if this is a clarification (answer author = question author)
  const isClarification = questionAuthorId && authorId === questionAuthorId

  useEffect(() => {
    // Load answer vote data
    const data = simpleCoinHelpers.getAnswerData(answerId)
    
    if (data) {
      setAnswerData(data)
      setHasVoted(data.voterIds.includes(currentUserId))
    } else {
      // For old answers without vote data, create default structure
      const defaultData = {
        answerId,
        authorId,
        totalVotes: 0,
        voterIds: [],
        coinsEarned: 0,
        isBestAnswer: false
      }
      setAnswerData(defaultData)
      setHasVoted(false)
    }
  }, [answerId, currentUserId, authorId])

  const handleVoteHelpful = async () => {
    if (isVoting || hasVoted || authorId === currentUserId || isClarification) return

    setIsVoting(true)

    try {
      // CRITICAL FIX: Initialize answer in simple coin system if it doesn't exist
      let answerExists = simpleCoinHelpers.getAnswerData(answerId)
      if (!answerExists) {
        console.log('🔧 Initializing answer in coin system:', answerId)
        // Access the manager's answerVotes map directly
        simpleCoinManager.answerVotes.set(answerId, {
          answerId,
          authorId,
          totalVotes: 0,
          voterIds: [],
          coinsEarned: 0,
          isBestAnswer: false
        })
      }

      const result = simpleCoinHelpers.voteHelpful(currentUserId, answerId, questionAuthorId)
      
      if (result.success) {
        // Update local state
        const updatedData = simpleCoinHelpers.getAnswerData(answerId)
        setAnswerData(updatedData)
        setHasVoted(true)
        
        // Notify parent component
        if (onVoteSuccess && updatedData) {
          onVoteSuccess(
            result.coinsEarned, 
            updatedData.totalVotes, 
            updatedData.isBestAnswer
          )
        }

        console.log('✅ Vote successful:', result.message)
      } else {
        alert(result.message)
      }
    } catch (error) {
      console.error('❌ Vote error:', error)
      alert('Error voting. Please try again.')
    } finally {
      setIsVoting(false)
    }
  }

  if (!answerData) {
    return (
      <div className="flex items-center gap-2 text-sm opacity-60">
        <ThumbsUp className="w-4 h-4" />
        <span>Loading...</span>
      </div>
    )
  }

  const canVote = authorId !== currentUserId && !hasVoted && !isClarification
  const needsMoreVotes = answerData.totalVotes < 5
  const isEarningCoins = answerData.totalVotes >= 5

  // CLARIFICATION DISPLAY: Different UI for clarifications
  if (isClarification) {
    return (
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-2 bg-orange-500/10 border border-orange-500/20 rounded-lg">
            <Star className="w-4 h-4 text-orange-400" />
            <span className="text-sm font-medium text-orange-300">Author's Clarification</span>
          </div>
        </div>
        <div className="text-xs opacity-60">
          Clarifications cannot be voted on
        </div>
      </div>
    )
  }

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-4">
        {/* Vote Button */}
        <button
          onClick={handleVoteHelpful}
          disabled={!canVote || isVoting}
          className={`flex items-center gap-2 px-3 py-2 rounded-lg font-semibold text-sm transition-all ${
            hasVoted
              ? 'bg-green-500/20 text-green-400 cursor-default'
              : canVote
              ? 'bg-purple-500/20 text-purple-400 hover:bg-purple-500/30 transform hover:scale-105'
              : 'bg-gray-500/20 text-gray-500 cursor-not-allowed'
          }`}
        >
          <ThumbsUp className={`w-4 h-4 ${isVoting ? 'animate-pulse' : ''}`} />
          <span>
            {hasVoted ? 'Voted Helpful' : isVoting ? 'Voting...' : 'Helpful'}
          </span>
          <span className="font-bold">({answerData.totalVotes})</span>
        </button>

        {/* Best Answer Badge */}
        {answerData.isBestAnswer && (
          <div className="flex items-center gap-1 bg-yellow-500/20 text-yellow-400 px-2 py-1 rounded-full text-xs font-semibold">
            <Award className="w-3 h-3" />
            <span>Best Answer</span>
          </div>
        )}
      </div>

      {/* Coin Info */}
      <div className="flex items-center gap-2 text-xs">
        {authorId === currentUserId && (
          <div className="flex items-center gap-1 text-cyan-400">
            <Coins className="w-3 h-3" />
            <span>{answerData.coinsEarned} earned</span>
          </div>
        )}
        
        {needsMoreVotes && (
          <div className="text-gray-500">
            {5 - answerData.totalVotes} more votes for coins
          </div>
        )}
        
        {isEarningCoins && !answerData.isBestAnswer && answerData.totalVotes < 7 && (
          <div className="text-yellow-400">
            {7 - answerData.totalVotes} more for Best Answer
          </div>
        )}
      </div>
    </div>
  )
}

// Question Cost Display Component
interface QuestionCostProps {
  questionType: string
  userCoins: number
  onChange?: (type: string) => void
}

export function QuestionCostDisplay({ questionType, userCoins, onChange }: QuestionCostProps) {
  const questionTypes = [
    { 
      id: 'regular', 
      name: 'Regular Question', 
      cost: 2, 
      description: 'Standard community question with normal visibility',
      icon: '❓' 
    },
    { 
      id: 'urgent', 
      name: 'Urgent Question', 
      cost: 5, 
      description: 'Guaranteed response within 6 hours, higher visibility',
      icon: '🚨' 
    }
  ]

  return (
    <div className="space-y-3">
      <label className="block text-sm font-semibold text-purple-400 mb-3">Question Type & Cost</label>
      
      {questionTypes.map((type) => {
        const canAfford = userCoins >= type.cost
        const isSelected = questionType === type.id

        return (
          <button
            key={type.id}
            type="button"
            onClick={() => onChange?.(type.id)}
            disabled={!canAfford}
            className={`w-full p-4 rounded-lg border-2 transition-all text-left ${
              isSelected
                ? 'border-purple-500 bg-purple-500/20'
                : canAfford
                ? 'border-purple-500/30 bg-black/20 hover:border-purple-500/50'
                : 'border-gray-600 bg-gray-800 opacity-50 cursor-not-allowed'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="text-lg">{type.icon}</span>
                <span className="font-semibold">{type.name}</span>
              </div>
              <div className={`flex items-center gap-1 font-bold ${
                canAfford ? 'text-cyan-400' : 'text-gray-500'
              }`}>
                <Coins className="w-4 h-4" />
                <span>{type.cost}</span>
              </div>
            </div>
            <div className="text-sm opacity-70 mb-2">{type.description}</div>
            
            {!canAfford && (
              <div className="text-xs text-red-400">
                Need {type.cost - userCoins} more coins
              </div>
            )}
            
            {isSelected && canAfford && (
              <div className="text-xs text-green-400 mt-1">
                ✅ Selected - Will cost {type.cost} coins
              </div>
            )}
          </button>
        )
      })}

      {/* Current Balance */}
      <div className="bg-purple-900/20 border border-purple-500/30 rounded-lg p-3">
        <div className="flex items-center justify-between">
          <span className="text-sm text-purple-400">Your current balance:</span>
          <div className="flex items-center gap-1 font-bold text-white">
            <Coins className="w-4 h-4" />
            <span>{userCoins}</span>
          </div>
        </div>
      </div>
    </div>
  )
}

// Coin Earning Summary Component
export function CoinEarningSummary() {
  return (
    <div className="bg-gradient-to-r from-purple-900/20 to-magenta-900/20 border border-purple-500/30 rounded-xl p-4">
      <h3 className="text-lg font-bold text-purple-400 mb-3 flex items-center gap-2">
        <Coins className="w-5 h-5" />
        How to Earn AlphaCoins
      </h3>
      
      <div className="space-y-2 text-sm">
        <div className="flex items-center justify-between">
          <span className="opacity-90">📅 Daily login</span>
          <span className="font-bold text-cyan-400">+1 coin</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="opacity-90">✍️ Answer questions</span>
          <span className="font-bold text-cyan-400">+1 coin</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="opacity-90">👍 Helpful votes (5+)</span>
          <span className="font-bold text-cyan-400">+1 coin each</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="opacity-90">🏆 Best Answer (7+ votes)</span>
          <span className="font-bold text-yellow-400">+5 coins bonus</span>
        </div>
      </div>
      
      <div className="mt-3 pt-3 border-t border-purple-500/20 text-xs opacity-70">
        💡 Answer questions to earn coins, then ask your own questions!
      </div>
    </div>
  )
}

// User Coin Stats Component
interface UserCoinStatsProps {
  userId: string
}

export function UserCoinStats({ userId }: UserCoinStatsProps) {
  const [stats, setStats] = useState<any>(null)

  useEffect(() => {
    const userStats = simpleCoinHelpers.getUserStats(userId)
    setStats(userStats)
  }, [userId])

  if (!stats) return null

  return (
    <div className="bg-black/30 border border-purple-500/20 rounded-xl p-4">
      <h3 className="text-lg font-bold text-white mb-3">Your Coin Activity</h3>
      
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="text-center">
          <div className="text-xl font-bold text-purple-400">{stats.profile.currentBalance}</div>
          <div className="text-xs opacity-70">Current Balance</div>
        </div>
        <div className="text-center">
          <div className="text-xl font-bold text-magenta-400">{stats.profile.totalEarned}</div>
          <div className="text-xs opacity-70">Total Earned</div>
        </div>
      </div>
      
      <div className="grid grid-cols-3 gap-3 text-center text-sm">
        <div>
          <div className="font-bold text-cyan-400">{stats.community.answersGiven}</div>
          <div className="text-xs opacity-70">Answers</div>
        </div>
        <div>
          <div className="font-bold text-green-400">{stats.community.totalVotesReceived}</div>
          <div className="text-xs opacity-70">Helpful Votes</div>
        </div>
        <div>
          <div className="font-bold text-yellow-400">{stats.community.bestAnswersCount}</div>
          <div className="text-xs opacity-70">Best Answers</div>
        </div>
      </div>
      
      {stats.weekly && (
        <div className="mt-3 pt-3 border-t border-white/10 text-xs opacity-70">
          This week: +{stats.weekly.earned} earned, -{stats.weekly.spent} spent
        </div>
      )}
    </div>
  )
}