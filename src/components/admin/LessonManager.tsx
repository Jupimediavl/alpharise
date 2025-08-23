'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { createClient } from '@supabase/supabase-js'
import { 
  PlusIcon, 
  PencilIcon, 
  TrashIcon, 
  PlayIcon,
  DocumentTextIcon,
  SpeakerWaveIcon,
  PuzzlePieceIcon,
  XMarkIcon
} from '@heroicons/react/24/outline'
import type { Lesson, LearningModule } from '@/lib/als-types'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function LessonManager() {
  const [lessons, setLessons] = useState<(Lesson & { module?: LearningModule })[]>([])
  const [modules, setModules] = useState<LearningModule[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingLesson, setEditingLesson] = useState<Lesson | null>(null)
  const [selectedModule, setSelectedModule] = useState<string>('')
  const [formData, setFormData] = useState({
    module_id: '',
    lesson_number: 1,
    title: '',
    description: '',
    content_type: 'video' as 'video' | 'text' | 'audio' | 'interactive' | 'mixed',
    content_data: {},
    duration_minutes: 15,
    xp_reward: 20,
    coins_reward: 10,
    thumbnail_url: ''
  })

  useEffect(() => {
    loadModules()
    loadLessons()
  }, [])

  const loadModules = async () => {
    try {
      const { data, error } = await supabase
        .from('learning_modules')
        .select('*')
        .eq('is_active', true)
        .order('coach_id', { ascending: true })
        .order('order_priority', { ascending: true })

      if (error) throw error
      setModules(data || [])
    } catch (error) {
      console.error('Error loading modules:', error)
    }
  }

  const loadLessons = async () => {
    try {
      const { data, error } = await supabase
        .from('lessons')
        .select(`
          *,
          module:learning_modules(*)
        `)
        .eq('is_active', true)
        .order('lesson_number', { ascending: true })

      if (error) throw error
      setLessons(data || [])
    } catch (error) {
      console.error('Error loading lessons:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const lessonData = {
        ...formData,
        content_data: typeof formData.content_data === 'string' 
          ? JSON.parse(formData.content_data) 
          : formData.content_data
      }

      if (editingLesson) {
        const { error } = await supabase
          .from('lessons')
          .update(lessonData)
          .eq('id', editingLesson.id)
        
        if (error) throw error
      } else {
        const { error } = await supabase
          .from('lessons')
          .insert([lessonData])
        
        if (error) throw error
      }

      await loadLessons()
      resetForm()
    } catch (error) {
      console.error('Error saving lesson:', error)
    }
  }

  const handleEdit = (lesson: Lesson) => {
    setEditingLesson(lesson)
    setFormData({
      module_id: lesson.module_id,
      lesson_number: lesson.lesson_number,
      title: lesson.title,
      description: lesson.description || '',
      content_type: lesson.content_type,
      content_data: lesson.content_data,
      duration_minutes: lesson.duration_minutes || 15,
      xp_reward: lesson.xp_reward,
      coins_reward: lesson.coins_reward,
      thumbnail_url: lesson.thumbnail_url || ''
    })
    setShowForm(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this lesson?')) return
    
    try {
      const { error } = await supabase
        .from('lessons')
        .delete()
        .eq('id', id)
      
      if (error) throw error
      await loadLessons()
    } catch (error) {
      console.error('Error deleting lesson:', error)
    }
  }

  const resetForm = () => {
    setFormData({
      module_id: '',
      lesson_number: 1,
      title: '',
      description: '',
      content_type: 'video',
      content_data: {},
      duration_minutes: 15,
      xp_reward: 20,
      coins_reward: 10,
      thumbnail_url: ''
    })
    setEditingLesson(null)
    setShowForm(false)
  }

  const getContentIcon = (type: string) => {
    switch (type) {
      case 'video': return PlayIcon
      case 'text': return DocumentTextIcon
      case 'audio': return SpeakerWaveIcon
      case 'interactive': return PuzzlePieceIcon
      default: return DocumentTextIcon
    }
  }

  const getContentTypeColor = (type: string) => {
    switch (type) {
      case 'video': return 'bg-red-600'
      case 'text': return 'bg-blue-600'
      case 'audio': return 'bg-purple-600'
      case 'interactive': return 'bg-green-600'
      case 'mixed': return 'bg-orange-600'
      default: return 'bg-gray-600'
    }
  }

  const filteredLessons = selectedModule 
    ? lessons.filter(lesson => lesson.module_id === selectedModule)
    : lessons

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
        <h2 className="text-2xl font-bold text-white">Lessons</h2>
        <button
          onClick={() => setShowForm(true)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
        >
          <PlusIcon className="h-5 w-5" />
          <span>Add Lesson</span>
        </button>
      </div>

      {/* Filter */}
      <div className="bg-gray-700/50 rounded-lg p-4">
        <div className="flex items-center space-x-4">
          <label className="text-sm font-medium text-gray-300">Filter by Module:</label>
          <select
            value={selectedModule}
            onChange={(e) => setSelectedModule(e.target.value)}
            className="bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
          >
            <option value="">All Modules</option>
            {modules.map((module) => (
              <option key={module.id} value={module.id}>
                {module.coach_id.toUpperCase()} - {module.title}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Lessons Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredLessons.map((lesson) => {
          const ContentIcon = getContentIcon(lesson.content_type)
          return (
            <motion.div
              key={lesson.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gray-700/50 rounded-lg p-6 border border-gray-600 hover:border-gray-500 transition-colors"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <span className="text-xs bg-gray-600 text-white px-2 py-1 rounded">
                      Lesson {lesson.lesson_number}
                    </span>
                    <span className={`text-xs text-white px-2 py-1 rounded ${getContentTypeColor(lesson.content_type)}`}>
                      {lesson.content_type.toUpperCase()}
                    </span>
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-1">
                    {lesson.title}
                  </h3>
                  {lesson.description && (
                    <p className="text-sm text-gray-400 mb-2 line-clamp-2">
                      {lesson.description}
                    </p>
                  )}
                  {lesson.module && (
                    <p className="text-xs text-gray-500 mb-3">
                      Module: {lesson.module.title}
                    </p>
                  )}
                </div>
                <ContentIcon className="h-6 w-6 text-gray-400" />
              </div>

              <div className="grid grid-cols-3 gap-4 text-xs text-gray-400 mb-4">
                <div>
                  <span className="block text-gray-500">Duration</span>
                  <span className="text-white">{lesson.duration_minutes}min</span>
                </div>
                <div>
                  <span className="block text-gray-500">XP</span>
                  <span className="text-white">{lesson.xp_reward}</span>
                </div>
                <div>
                  <span className="block text-gray-500">Coins</span>
                  <span className="text-white">{lesson.coins_reward}</span>
                </div>
              </div>

              <div className="flex space-x-2">
                <button
                  onClick={() => handleEdit(lesson)}
                  className="flex-1 bg-gray-600 hover:bg-gray-700 text-white px-3 py-2 rounded text-sm flex items-center justify-center space-x-1 transition-colors"
                >
                  <PencilIcon className="h-4 w-4" />
                  <span>Edit</span>
                </button>
                <button
                  onClick={() => handleDelete(lesson.id)}
                  className="bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded text-sm transition-colors"
                >
                  <TrashIcon className="h-4 w-4" />
                </button>
              </div>
            </motion.div>
          )
        })}
      </div>

      {/* Lesson Form Modal */}
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
                {editingLesson ? 'Edit Lesson' : 'Create New Lesson'}
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
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Module
                  </label>
                  <select
                    value={formData.module_id}
                    onChange={(e) => setFormData({ ...formData, module_id: e.target.value })}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
                    required
                  >
                    <option value="">Select a module</option>
                    {modules.map((module) => (
                      <option key={module.id} value={module.id}>
                        {module.coach_id.toUpperCase()} - {module.title}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Lesson Number
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={formData.lesson_number}
                    onChange={(e) => setFormData({ ...formData, lesson_number: parseInt(e.target.value) })}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Content Type
                  </label>
                  <select
                    value={formData.content_type}
                    onChange={(e) => setFormData({ ...formData, content_type: e.target.value as any })}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
                    required
                  >
                    <option value="video">Video</option>
                    <option value="text">Text</option>
                    <option value="audio">Audio</option>
                    <option value="interactive">Interactive</option>
                    <option value="mixed">Mixed</option>
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
                    Duration (minutes)
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={formData.duration_minutes}
                    onChange={(e) => setFormData({ ...formData, duration_minutes: parseInt(e.target.value) })}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Thumbnail URL
                  </label>
                  <input
                    type="url"
                    value={formData.thumbnail_url}
                    onChange={(e) => setFormData({ ...formData, thumbnail_url: e.target.value })}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    XP Reward
                  </label>
                  <input
                    type="number"
                    min="0"
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
                    min="0"
                    value={formData.coins_reward}
                    onChange={(e) => setFormData({ ...formData, coins_reward: parseInt(e.target.value) })}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
                    required
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Content Data (JSON)
                  </label>
                  <textarea
                    value={typeof formData.content_data === 'string' ? formData.content_data : JSON.stringify(formData.content_data, null, 2)}
                    onChange={(e) => setFormData({ ...formData, content_data: e.target.value })}
                    rows={4}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-indigo-500 font-mono text-sm"
                    placeholder='{"video_url": "https://example.com/video.mp4", "transcript": "..."}'
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
                  {editingLesson ? 'Update Lesson' : 'Create Lesson'}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </div>
  )
}