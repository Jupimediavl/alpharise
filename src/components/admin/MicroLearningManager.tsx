'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { createClient } from '@supabase/supabase-js'
import { 
  PlusIcon, 
  PencilIcon, 
  TrashIcon, 
  LightBulbIcon,
  XMarkIcon,
  StarIcon
} from '@heroicons/react/24/outline'
import type { MicroLearning } from '@/lib/als-types'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function MicroLearningManager() {
  const [microLearnings, setMicroLearnings] = useState<MicroLearning[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingItem, setEditingItem] = useState<MicroLearning | null>(null)
  const [formData, setFormData] = useState({
    coach_id: 'blake',
    title: '',
    content: '',
    content_type: 'tip',
    difficulty: 1,
    xp_reward: 5,
    tags: ''
  })

  useEffect(() => {
    loadMicroLearnings()
  }, [])

  const loadMicroLearnings = async () => {
    try {
      const { data, error } = await supabase
        .from('micro_learnings')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false })

      if (error) throw error
      setMicroLearnings(data || [])
    } catch (error) {
      console.error('Error loading micro-learnings:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const itemData = {
        ...formData,
        tags: formData.tags.split(',').map(tag => tag.trim()).filter(Boolean)
      }

      if (editingItem) {
        const { error } = await supabase
          .from('micro_learnings')
          .update(itemData)
          .eq('id', editingItem.id)
        
        if (error) throw error
      } else {
        const { error } = await supabase
          .from('micro_learnings')
          .insert([itemData])
        
        if (error) throw error
      }

      await loadMicroLearnings()
      resetForm()
    } catch (error) {
      console.error('Error saving micro-learning:', error)
    }
  }

  const handleEdit = (item: MicroLearning) => {
    setEditingItem(item)
    setFormData({
      coach_id: item.coach_id || 'blake',
      title: item.title,
      content: item.content,
      content_type: item.content_type,
      difficulty: item.difficulty,
      xp_reward: item.xp_reward,
      tags: Array.isArray(item.tags) ? item.tags.join(', ') : ''
    })
    setShowForm(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this micro-learning?')) return
    
    try {
      const { error } = await supabase
        .from('micro_learnings')
        .delete()
        .eq('id', id)
      
      if (error) throw error
      await loadMicroLearnings()
    } catch (error) {
      console.error('Error deleting micro-learning:', error)
    }
  }

  const resetForm = () => {
    setFormData({
      coach_id: 'blake',
      title: '',
      content: '',
      content_type: 'tip',
      difficulty: 1,
      xp_reward: 5,
      tags: ''
    })
    setEditingItem(null)
    setShowForm(false)
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'tip': return 'bg-blue-600'
      case 'quote': return 'bg-purple-600'
      case 'challenge': return 'bg-orange-600'
      case 'fact': return 'bg-green-600'
      default: return 'bg-gray-600'
    }
  }

  const coachOptions = [
    { value: 'blake', label: 'Blake' },
    { value: 'chase', label: 'Chase' },
    { value: 'logan', label: 'Logan' },
    { value: 'mason', label: 'Mason' },
    { value: 'knox', label: 'Knox' }
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
          <h2 className="text-2xl font-bold text-white">Micro-Learning</h2>
          <p className="text-gray-400 mt-1">Bite-sized learning content for quick engagement</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
        >
          <PlusIcon className="h-5 w-5" />
          <span>Add Content</span>
        </button>
      </div>

      {/* Micro-Learning Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {microLearnings.map((item) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gray-700/50 rounded-lg p-6 border border-gray-600 hover:border-gray-500 transition-colors"
          >
            <div className="flex justify-between items-start mb-4">
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-2">
                  <span className="text-xs bg-indigo-600 text-white px-2 py-1 rounded">
                    {item.coach_id?.toUpperCase() || 'GENERAL'}
                  </span>
                  <span className={`text-xs text-white px-2 py-1 rounded ${getTypeColor(item.content_type)}`}>
                    {item.content_type.toUpperCase()}
                  </span>
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">
                  {item.title}
                </h3>
                <p className="text-sm text-gray-300 mb-3 line-clamp-3">
                  {item.content}
                </p>
              </div>
              <LightBulbIcon className="h-6 w-6 text-yellow-400 ml-2" />
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs text-gray-400 mb-4">
              <div>
                <span className="block text-gray-500">Difficulty</span>
                <div className="flex items-center space-x-1">
                  {[...Array(5)].map((_, i) => (
                    <StarIcon
                      key={i}
                      className={`h-3 w-3 ${
                        i < item.difficulty ? 'text-yellow-400 fill-current' : 'text-gray-600'
                      }`}
                    />
                  ))}
                </div>
              </div>
              <div>
                <span className="block text-gray-500">XP Reward</span>
                <span className="text-white">{item.xp_reward}</span>
              </div>
            </div>

            {Array.isArray(item.tags) && item.tags.length > 0 && (
              <div className="mb-4">
                <div className="flex flex-wrap gap-1">
                  {item.tags.slice(0, 3).map((tag, index) => (
                    <span
                      key={index}
                      className="text-xs bg-gray-600 text-gray-300 px-2 py-1 rounded"
                    >
                      {tag}
                    </span>
                  ))}
                  {item.tags.length > 3 && (
                    <span className="text-xs text-gray-400">
                      +{item.tags.length - 3} more
                    </span>
                  )}
                </div>
              </div>
            )}

            <div className="flex space-x-2">
              <button
                onClick={() => handleEdit(item)}
                className="flex-1 bg-gray-600 hover:bg-gray-700 text-white px-3 py-2 rounded text-sm flex items-center justify-center space-x-1 transition-colors"
              >
                <PencilIcon className="h-4 w-4" />
                <span>Edit</span>
              </button>
              <button
                onClick={() => handleDelete(item.id)}
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
                {editingItem ? 'Edit Micro-Learning' : 'Create New Micro-Learning'}
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
                    Content Type
                  </label>
                  <select
                    value={formData.content_type}
                    onChange={(e) => setFormData({ ...formData, content_type: e.target.value })}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value="tip">Tip</option>
                    <option value="quote">Quote</option>
                    <option value="challenge">Challenge</option>
                    <option value="fact">Fact</option>
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
                    Content
                  </label>
                  <textarea
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    rows={4}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
                    required
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

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Tags (comma separated)
                  </label>
                  <input
                    type="text"
                    value={formData.tags}
                    onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
                    placeholder="breathing, quick, anxiety"
                  />
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
                  {editingItem ? 'Update Content' : 'Create Content'}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </div>
  )
}