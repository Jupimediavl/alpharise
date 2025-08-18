'use client'

import React, { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence, PanInfo } from 'framer-motion'
import { X, Send, MoreVertical, Trash2, MessageCircle } from 'lucide-react'
import Image from 'next/image'
import { DbChatMessage, SupabaseChatManager } from '@/lib/supabase'

interface ChatDrawerProps {
  isOpen: boolean
  onClose: () => void
  user: {
    id: string
    username: string
    coach: string
    age?: number
    userType?: string
  }
  onSendMessage?: (message: string) => Promise<string | null>
}

interface Message {
  id: string
  type: 'user' | 'coach'
  content: string
  timestamp: Date
  isLoading?: boolean
}

const ChatDrawer: React.FC<ChatDrawerProps> = ({ 
  isOpen, 
  onClose, 
  user, 
  onSendMessage 
}) => {
  const [messages, setMessages] = useState<Message[]>([])
  const [inputValue, setInputValue] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null)
  const [isLoadingHistory, setIsLoadingHistory] = useState(false)
  const [showMenu, setShowMenu] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const drawerRef = useRef<HTMLDivElement>(null)

  // Get coach data
  const coachData = {
    logan: { name: 'Logan', title: 'The Straight Shooter', color: 'from-purple-500 to-pink-500' },
    chase: { name: 'Chase', title: 'The Cool Cat', color: 'from-purple-500 to-magenta-600' },
    mason: { name: 'Mason', title: 'The Patient Pro', color: 'from-blue-500 to-purple-500' },
    blake: { name: 'Blake', title: 'The Reliable Guy', color: 'from-magenta-500 to-pink-500' },
    knox: { name: 'Knox', title: 'The Authentic One', color: 'from-pink-500 to-purple-600' }
  }

  const currentCoach = coachData[user.coach as keyof typeof coachData] || coachData.logan

  // Load chat history when drawer opens
  useEffect(() => {
    if (isOpen && user.id && user.coach) {
      loadChatHistory()
    }
  }, [isOpen, user.id, user.coach])

  // Auto scroll to bottom when new messages arrive
  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Focus input when drawer opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 300)
    }
  }, [isOpen])

  const loadChatHistory = async () => {
    setIsLoadingHistory(true)
    try {
      const history = await SupabaseChatManager.getChatHistory(
        user.id, 
        user.coach as any, 
        50
      )
      
      const formattedMessages: Message[] = history.map(msg => ({
        id: msg.id,
        type: msg.message_type,
        content: msg.content,
        timestamp: new Date(msg.timestamp)
      }))
      
      setMessages(formattedMessages)
      
      // Set current session ID from last message
      if (history.length > 0) {
        setCurrentSessionId(history[history.length - 1].session_id)
      }
    } catch (error) {
      console.error('Error loading chat history:', error)
    } finally {
      setIsLoadingHistory(false)
    }
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isTyping) return

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: inputValue.trim(),
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInputValue('')
    setIsTyping(true)

    try {
      // Save user message to database
      let sessionId = currentSessionId
      if (!sessionId) {
        sessionId = await SupabaseChatManager.createNewSession(
          user.id,
          user.username,
          user.coach as any,
          userMessage.content,
          user.age,
          user.userType
        )
        setCurrentSessionId(sessionId)
      } else {
        await SupabaseChatManager.saveMessage({
          user_id: user.id,
          username: user.username,
          coach_type: user.coach as any,
          message_type: 'user',
          content: userMessage.content,
          session_id: sessionId,
          user_age: user.age,
          user_type: user.userType
        })
      }

      // Add loading message
      const loadingMessage: Message = {
        id: 'loading',
        type: 'coach',
        content: '',
        timestamp: new Date(),
        isLoading: true
      }
      setMessages(prev => [...prev, loadingMessage])

      // Get AI response
      const response = onSendMessage ? await onSendMessage(userMessage.content) : null
      
      // Remove loading message and add real response
      setMessages(prev => prev.filter(msg => msg.id !== 'loading'))
      
      if (response) {
        const coachMessage: Message = {
          id: (Date.now() + 1).toString(),
          type: 'coach',
          content: response,
          timestamp: new Date()
        }
        setMessages(prev => [...prev, coachMessage])

        // Save coach response to database
        if (sessionId) {
          await SupabaseChatManager.saveMessage({
            user_id: user.id,
            username: user.username,
            coach_type: user.coach as any,
            message_type: 'coach',
            content: response,
            session_id: sessionId,
            ai_model: 'gpt-4'
          })
        }
      }
    } catch (error) {
      console.error('Error sending message:', error)
      // Remove loading message on error
      setMessages(prev => prev.filter(msg => msg.id !== 'loading'))
      
      // Add error message
      const errorMessage: Message = {
        id: 'error',
        type: 'coach',
        content: 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date()
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsTyping(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const clearChat = async () => {
    if (currentSessionId && user.id) {
      await SupabaseChatManager.deleteSession(user.id, currentSessionId)
    }
    setMessages([])
    setCurrentSessionId(null)
    setShowMenu(false)
  }

  const handleDragEnd = (event: any, info: PanInfo) => {
    if (info.offset.y > 100 && info.velocity.y > 0) {
      onClose()
    }
  }

  const formatTime = (date: Date) => {
    // Handle SSR by checking if window is available
    if (typeof window === 'undefined') {
      return '--:--'
    }
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
          />

          {/* Drawer */}
          <motion.div
            ref={drawerRef}
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            drag="y"
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={0.1}
            onDragEnd={handleDragEnd}
            className="fixed bottom-0 left-0 right-0 z-50 bg-gray-900 rounded-t-3xl shadow-2xl max-h-[85vh] md:max-h-[70vh] flex flex-col"
            style={{
              background: 'linear-gradient(to bottom, rgb(17 24 39), rgb(31 41 55))'
            }}
          >
            {/* Drag Handle */}
            <div className="flex justify-center pt-2 pb-1">
              <div className="w-10 h-1 bg-gray-600 rounded-full cursor-grab active:cursor-grabbing" />
            </div>

            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-700/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full overflow-hidden">
                  <Image
                    src={`/avatars/${user.coach}.png`}
                    alt={currentCoach.name}
                    width={40}
                    height={40}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <h3 className="font-semibold text-white">{currentCoach.name}</h3>
                  <p className="text-xs text-gray-400">
                    {isTyping ? 'Typing...' : 'Your personal coach'}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowMenu(!showMenu)}
                  className="p-2 hover:bg-gray-700/50 rounded-lg transition-colors"
                >
                  <MoreVertical className="w-5 h-5 text-gray-400" />
                </button>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-gray-700/50 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-400" />
                </button>
              </div>

              {/* Menu Dropdown */}
              {showMenu && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="absolute top-16 right-4 bg-gray-800 rounded-lg shadow-xl border border-gray-700 z-10"
                >
                  <button
                    onClick={clearChat}
                    className="flex items-center gap-2 w-full px-4 py-3 text-sm text-red-400 hover:bg-gray-700/50 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                    Clear Chat
                  </button>
                </motion.div>
              )}
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {isLoadingHistory ? (
                <div className="flex justify-center py-8">
                  <div className="text-gray-400 text-sm">Loading chat history...</div>
                </div>
              ) : messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <MessageCircle className="w-12 h-12 text-gray-600 mb-4" />
                  <h4 className="text-lg font-semibold text-white mb-2">
                    Start a conversation with {currentCoach.name}
                  </h4>
                  <p className="text-gray-400 text-sm max-w-sm">
                    Ask anything about confidence, relationships, or personal growth. 
                    Your coach is here to help!
                  </p>
                </div>
              ) : (
                messages.map((message) => (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[80%] p-3 rounded-2xl ${
                        message.type === 'user'
                          ? 'bg-gradient-to-r from-purple-600 to-magenta-600 text-white ml-12'
                          : `bg-gradient-to-r ${currentCoach.color} text-white mr-12`
                      }`}
                    >
                      {message.isLoading ? (
                        <div className="flex items-center gap-2">
                          <div className="flex space-x-1">
                            <div className="w-2 h-2 bg-white/60 rounded-full animate-bounce" />
                            <div className="w-2 h-2 bg-white/60 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                            <div className="w-2 h-2 bg-white/60 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                          </div>
                          <span className="text-sm text-white/80">Thinking...</span>
                        </div>
                      ) : (
                        <>
                          <p className="text-sm leading-relaxed whitespace-pre-wrap">
                            {message.content}
                          </p>
                          <p className="text-xs text-white/60 mt-1">
                            {formatTime(message.timestamp)}
                          </p>
                        </>
                      )}
                    </div>
                  </motion.div>
                ))
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 border-t border-gray-700/50 bg-gray-900/50">
              <div className="flex items-end gap-2">
                <textarea
                  ref={inputRef}
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder={`Message ${currentCoach.name}...`}
                  className="flex-1 bg-gray-800 border border-gray-600 rounded-2xl px-4 py-3 text-white placeholder-gray-400 resize-none focus:outline-none focus:border-purple-500 transition-colors max-h-32"
                  rows={1}
                  style={{
                    minHeight: '44px',
                    maxHeight: '120px'
                  }}
                  disabled={isTyping}
                />
                <button
                  onClick={handleSendMessage}
                  disabled={!inputValue.trim() || isTyping}
                  className={`p-3 rounded-full transition-all ${
                    inputValue.trim() && !isTyping
                      ? 'bg-gradient-to-r from-purple-600 to-magenta-600 hover:from-purple-700 hover:to-magenta-700 text-white shadow-lg'
                      : 'bg-gray-700 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

export default ChatDrawer