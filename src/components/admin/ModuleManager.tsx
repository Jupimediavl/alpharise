'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { createClient } from '@supabase/supabase-js'
import { 
  PlusIcon, 
  PencilIcon, 
  TrashIcon, 
  EyeIcon,
  XMarkIcon
} from '@heroicons/react/24/outline'
import type { LearningModule } from '@/lib/als-types'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

interface ModuleManagerProps {
  onModuleSelect?: (module: LearningModule) => void
}

export default function ModuleManager({ onModuleSelect }: ModuleManagerProps) {
  const [modules, setModules] = useState<LearningModule[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingModule, setEditingModule] = useState<LearningModule | null>(null)
  const [formData, setFormData] = useState({
    coach_id: 'blake',
    module_code: '',
    title: '',
    subtitle: '',
    description: '',
    difficulty_level: 1,
    estimated_duration: 60,
    unlock_at_score: 0,
    order_priority: 1,
    tags: '',
    is_premium: false
  })

  useEffect(() => {
    loadModules()
  }, [])

  const loadModules = async () => {
    try {
      const { data, error } = await supabase
        .from('learning_modules')
        .select('*')
        .order('coach_id', { ascending: true })
        .order('order_priority', { ascending: true })

      if (error) throw error
      setModules(data || [])
    } catch (error) {
      console.error('Error loading modules:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const moduleData = {
        ...formData,
        tags: formData.tags.split(',').map(tag => tag.trim()).filter(Boolean),
        module_code: formData.module_code.toUpperCase()
      }

      if (editingModule) {
        const { error } = await supabase
          .from('learning_modules')
          .update(moduleData)
          .eq('id', editingModule.id)
        
        if (error) throw error
      } else {
        const { error } = await supabase
          .from('learning_modules')
          .insert([moduleData])
        
        if (error) throw error
      }

      await loadModules()
      resetForm()
    } catch (error) {
      console.error('Error saving module:', error)
    }
  }

  const handleEdit = (module: LearningModule) => {
    setEditingModule(module)
    setFormData({
      coach_id: module.coach_id,
      module_code: module.module_code,
      title: module.title,
      subtitle: module.subtitle || '',
      description: module.description || '',
      difficulty_level: module.difficulty_level,
      estimated_duration: module.estimated_duration || 60,
      unlock_at_score: module.unlock_at_score,
      order_priority: module.order_priority,
      tags: Array.isArray(module.tags) ? module.tags.join(', ') : '',
      is_premium: module.is_premium
    })
    setShowForm(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this module?')) return
    
    try {
      const { error } = await supabase
        .from('learning_modules')
        .delete()
        .eq('id', id)
      
      if (error) throw error
      await loadModules()
    } catch (error) {
      console.error('Error deleting module:', error)
    }
  }

  const resetForm = () => {
    setFormData({
      coach_id: 'blake',
      module_code: '',
      title: '',
      subtitle: '',
      description: '',
      difficulty_level: 1,
      estimated_duration: 60,
      unlock_at_score: 0,
      order_priority: 1,
      tags: '',
      is_premium: false
    })
    setEditingModule(null)
    setShowForm(false)
  }

  const coachOptions = [
    { value: 'blake', label: 'Blake (Performance Anxiety)' },
    { value: 'chase', label: 'Chase (Stamina & Control)' },
    { value: 'logan', label: 'Logan (Social Confidence)' },
    { value: 'mason', label: 'Mason (General Confidence)' },
    { value: 'knox', label: 'Knox (Advanced Performance)' }
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
        <h2 className="text-2xl font-bold text-white">Learning Modules</h2>
        <button
          onClick={() => setShowForm(true)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
        >
          <PlusIcon className="h-5 w-5" />
          <span>Add Module</span>
        </button>
      </div>

      {/* Modules Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {modules.map((module) => (
          <motion.div
            key={module.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gray-700/50 rounded-lg p-6 border border-gray-600 hover:border-gray-500 transition-colors"
          >
            <div className="flex justify-between items-start mb-4">
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-2">
                  <span className="text-xs bg-indigo-600 text-white px-2 py-1 rounded">
                    {module.coach_id.toUpperCase()}
                  </span>
                  {module.is_premium && (
                    <span className="text-xs bg-yellow-600 text-white px-2 py-1 rounded">
                      PREMIUM
                    </span>
                  )}
                </div>
                <h3 className="text-lg font-semibold text-white mb-1">
                  {module.title}
                </h3>
                {module.subtitle && (
                  <p className="text-sm text-gray-400 mb-2">{module.subtitle}</p>
                )}
                <p className="text-xs text-gray-500 mb-3 line-clamp-2">
                  {module.description}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs text-gray-400 mb-4">
              <div>
                <span className="block text-gray-500">Difficulty</span>
                <span className="text-white">{module.difficulty_level}/5</span>
              </div>
              <div>
                <span className="block text-gray-500">Duration</span>
                <span className="text-white">{module.estimated_duration}min</span>
              </div>
              <div>
                <span className="block text-gray-500">Unlock Score</span>
                <span className="text-white">{module.unlock_at_score}</span>
              </div>
              <div>
                <span className="block text-gray-500">Priority</span>
                <span className="text-white">{module.order_priority}</span>
              </div>
            </div>

            <div className="flex space-x-2">
              <button
                onClick={() => onModuleSelect?.(module)}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded text-sm flex items-center justify-center space-x-1 transition-colors"
              >
                <EyeIcon className="h-4 w-4" />
                <span>View</span>
              </button>
              <button
                onClick={() => handleEdit(module)}
                className="flex-1 bg-gray-600 hover:bg-gray-700 text-white px-3 py-2 rounded text-sm flex items-center justify-center space-x-1 transition-colors"
              >
                <PencilIcon className="h-4 w-4" />
                <span>Edit</span>
              </button>
              <button
                onClick={() => handleDelete(module.id)}
                className="bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded text-sm transition-colors"
              >
                <TrashIcon className="h-4 w-4" />
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Module Form Modal */}
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
                {editingModule ? 'Edit Module' : 'Create New Module'}
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
                    required
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
                    Module Code
                  </label>
                  <input
                    type="text"
                    value={formData.module_code}
                    onChange={(e) => setFormData({ ...formData, module_code: e.target.value })}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
                    placeholder="BLAKE_CONFIDENCE_101"
                    required
                  />
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
                    Subtitle
                  </label>
                  <input
                    type="text"
                    value={formData.subtitle}
                    onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
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
                    Difficulty Level (1-5)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="5"
                    value={formData.difficulty_level}
                    onChange={(e) => setFormData({ ...formData, difficulty_level: parseInt(e.target.value) })}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Duration (minutes)
                  </label>
                  <input
                    type="number"
                    value={formData.estimated_duration}
                    onChange={(e) => setFormData({ ...formData, estimated_duration: parseInt(e.target.value) })}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Unlock at Score
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={formData.unlock_at_score}
                    onChange={(e) => setFormData({ ...formData, unlock_at_score: parseInt(e.target.value) })}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Order Priority
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={formData.order_priority}
                    onChange={(e) => setFormData({ ...formData, order_priority: parseInt(e.target.value) })}
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
                    placeholder="confidence, anxiety, breathing"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={formData.is_premium}
                      onChange={(e) => setFormData({ ...formData, is_premium: e.target.checked })}
                      className="rounded border-gray-600 bg-gray-700 text-indigo-600 focus:ring-indigo-500"
                    />
                    <span className="text-sm text-gray-300">Premium Content</span>
                  </label>
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
                  {editingModule ? 'Update Module' : 'Create Module'}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </div>
  )
}