'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { createClient } from '@supabase/supabase-js'
import { 
  PlusIcon, 
  PencilIcon, 
  TrashIcon, 
  TrophyIcon,
  XMarkIcon,
  CalendarDaysIcon,
  ClockIcon
} from '@heroicons/react/24/outline'
import type { DailyChallenge } from '@/lib/als-types'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function ChallengeManager() {
  const [challenges, setChallenges] = useState<DailyChallenge[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingChallenge, setEditingChallenge] = useState<DailyChallenge | null>(null)
  const [formData, setFormData] = useState({
    coach_id: 'blake',
    challenge_type: 'mental',
    title: '',
    description: '',
    difficulty: 1,
    xp_reward: 30,
    coins_reward: 15,
    success_criteria: '{}',
    tags: ''
  })

  useEffect(() => {
    loadChallenges()
  }, [])

  const loadChallenges = async () => {
    try {
      const { data, error } = await supabase
        .from('daily_challenges')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false })

      if (error) throw error
      setChallenges(data || [])
    } catch (error) {
      console.error('Error loading challenges:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const challengeData = {
        ...formData,
        tags: formData.tags.split(',').map(tag => tag.trim()).filter(Boolean),
        success_criteria: typeof formData.success_criteria === 'string' 
          ? JSON.parse(formData.success_criteria) 
          : formData.success_criteria
      }

      if (editingChallenge) {
        const { error } = await supabase
          .from('daily_challenges')
          .update(challengeData)
          .eq('id', editingChallenge.id)
        
        if (error) throw error
      } else {
        const { error } = await supabase
          .from('daily_challenges')
          .insert([challengeData])
        
        if (error) throw error
      }

      await loadChallenges()
      resetForm()
    } catch (error) {
      console.error('Error saving challenge:', error)
    }
  }

  const handleEdit = (challenge: DailyChallenge) => {
    setEditingChallenge(challenge)
    setFormData({
      coach_id: challenge.coach_id || 'blake',
      challenge_type: challenge.challenge_type || 'mental',
      title: challenge.title,
      description: challenge.description || '',
      difficulty: challenge.difficulty,
      xp_reward: challenge.xp_reward,
      coins_reward: challenge.coins_reward,
      success_criteria: typeof challenge.success_criteria === 'object' 
        ? JSON.stringify(challenge.success_criteria, null, 2)
        : challenge.success_criteria.toString(),
      tags: Array.isArray(challenge.tags) ? challenge.tags.join(', ') : ''
    })
    setShowForm(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this challenge?')) return
    
    try {
      const { error } = await supabase
        .from('daily_challenges')
        .delete()
        .eq('id', id)
      
      if (error) throw error
      await loadChallenges()
    } catch (error) {
      console.error('Error deleting challenge:', error)
    }
  }

  const resetForm = () => {
    setFormData({
      coach_id: 'blake',
      challenge_type: 'mental',
      title: '',
      description: '',
      difficulty: 1,
      xp_reward: 30,
      coins_reward: 15,
      success_criteria: '{}',
      tags: ''
    })
    setEditingChallenge(null)
    setShowForm(false)
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'mental': return 'bg-purple-600'
      case 'physical': return 'bg-green-600'
      case 'social': return 'bg-blue-600'
      case 'tracking': return 'bg-orange-600'
      case 'habit': return 'bg-indigo-600'
      default: return 'bg-gray-600'
    }
  }

  const getDifficultyText = (difficulty: number) => {
    switch (difficulty) {
      case 1: return 'Easy'
      case 2: return 'Medium'
      case 3: return 'Hard'
      case 4: return 'Expert'
      case 5: return 'Master'
      default: return 'Unknown'
    }
  }

  const coachOptions = [
    { value: 'blake', label: 'Blake' },
    { value: 'chase', label: 'Chase' },
    { value: 'logan', label: 'Logan' },
    { value: 'mason', label: 'Mason' },
    { value: 'knox', label: 'Knox' }
  ]

  const challengeTypes = [
    { value: 'mental', label: 'Mental' },
    { value: 'physical', label: 'Physical' },
    { value: 'social', label: 'Social' },
    { value: 'tracking', label: 'Tracking' },
    { value: 'habit', label: 'Habit Building' }
  ]

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-white">Daily Challenges</h2>
          <p className="text-gray-400 mt-1">Engaging daily tasks to build habits and track progress</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
        >
          <PlusIcon className="h-5 w-5" />
          <span>Add Challenge</span>
        </button>
      </div>

      {/* Challenges Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {challenges.map((challenge) => (
          <motion.div
            key={challenge.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gray-700/50 rounded-lg p-6 border border-gray-600 hover:border-gray-500 transition-colors"
          >
            <div className="flex justify-between items-start mb-4">
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-2">
                  <span className="text-xs bg-indigo-600 text-white px-2 py-1 rounded">
                    {challenge.coach_id?.toUpperCase() || 'GENERAL'}
                  </span>
                  <span className={`text-xs text-white px-2 py-1 rounded ${getTypeColor(challenge.challenge_type || 'mental')}`}>
                    {(challenge.challenge_type || 'mental').toUpperCase()}
                  </span>
                  <span className="text-xs bg-gray-600 text-white px-2 py-1 rounded">
                    {getDifficultyText(challenge.difficulty)}
                  </span>
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">
                  {challenge.title}
                </h3>
                {challenge.description && (
                  <p className="text-sm text-gray-300 mb-3 line-clamp-3">
                    {challenge.description}
                  </p>
                )}
              </div>
              <TrophyIcon className="h-6 w-6 text-orange-400 ml-2" />
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs text-gray-400 mb-4">
              <div>
                <span className="block text-gray-500">XP Reward</span>
                <span className="text-white">{challenge.xp_reward}</span>
              </div>
              <div>
                <span className="block text-gray-500">Coins</span>
                <span className="text-white">{challenge.coins_reward}</span>
              </div>
            </div>

            {/* Success Criteria Preview */}
            {challenge.success_criteria && typeof challenge.success_criteria === 'object' && (
              <div className="mb-4">
                <span className="text-xs text-gray-500 block mb-1">Success Criteria:</span>
                <div className="bg-gray-600/50 rounded p-2 text-xs text-gray-300">
                  {Object.entries(challenge.success_criteria).map(([key, value]) => (
                    <div key={key} className="flex justify-between">
                      <span>{key}:</span>
                      <span>{String(value)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {Array.isArray(challenge.tags) && challenge.tags.length > 0 && (
              <div className="mb-4">
                <div className="flex flex-wrap gap-1">
                  {challenge.tags.slice(0, 3).map((tag, index) => (
                    <span
                      key={index}
                      className="text-xs bg-gray-600 text-gray-300 px-2 py-1 rounded"
                    >
                      {tag}
                    </span>
                  ))}
                  {challenge.tags.length > 3 && (
                    <span className="text-xs text-gray-400">
                      +{challenge.tags.length - 3} more
                    </span>
                  )}
                </div>
              </div>
            )}

            <div className="flex space-x-2">
              <button
                onClick={() => handleEdit(challenge)}
                className="flex-1 bg-gray-600 hover:bg-gray-700 text-white px-3 py-2 rounded text-sm flex items-center justify-center space-x-1 transition-colors"
              >
                <PencilIcon className="h-4 w-4" />
                <span>Edit</span>
              </button>
              <button
                onClick={() => handleDelete(challenge.id)}
                className="bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded text-sm transition-colors"
              >
                <TrashIcon className="h-4 w-4" />
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Form Modal */}
      {showForm && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-gray-800 rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-white">
                {editingChallenge ? 'Edit Challenge' : 'Create New Challenge'}
              </h3>
              <button
                onClick={resetForm}
                className="text-gray-400 hover:text-white"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Coach
                  </label>
                  <select
                    value={formData.coach_id}
                    onChange={(e) => setFormData({ ...formData, coach_id: e.target.value })}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
                  >
                    {coachOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Challenge Type
                  </label>
                  <select
                    value={formData.challenge_type}
                    onChange={(e) => setFormData({ ...formData, challenge_type: e.target.value })}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
                  >
                    {challengeTypes.map(type => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Title
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
                    required
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Difficulty (1-5)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="5"
                    value={formData.difficulty}
                    onChange={(e) => setFormData({ ...formData, difficulty: parseInt(e.target.value) })}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Tags (comma separated)
                  </label>
                  <input
                    type="text"
                    value={formData.tags}
                    onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
                    placeholder="mindfulness, practice, confidence"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    XP Reward
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={formData.xp_reward}
                    onChange={(e) => setFormData({ ...formData, xp_reward: parseInt(e.target.value) })}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Coins Reward
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={formData.coins_reward}
                    onChange={(e) => setFormData({ ...formData, coins_reward: parseInt(e.target.value) })}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
                    required
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Success Criteria (JSON)
                  </label>
                  <textarea
                    value={formData.success_criteria}
                    onChange={(e) => setFormData({ ...formData, success_criteria: e.target.value })}
                    rows={4}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-indigo-500 font-mono text-sm"
                    placeholder='{"duration": 5, "completed": true}'
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Define what constitutes success for this challenge (e.g., duration, quantity, completion status)
                  </p>
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  {editingChallenge ? 'Update Challenge' : 'Create Challenge'}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </div>
  )
}