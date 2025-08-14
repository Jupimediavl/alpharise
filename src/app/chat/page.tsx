'use client'

import { useSearchParams } from 'next/navigation'
import { useState, useEffect, useRef, Suspense } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface Message {
  id: string
  content: string
  sender: 'user' | 'avatar'
  timestamp: Date
}

function ChatContent() {
  const searchParams = useSearchParams()
  const [avatarType, setAvatarType] = useState('marcus')
  const [messages, setMessages] = useState<Message[]>([])
  const [inputValue, setInputValue] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Avatar personalities and characteristics
  const avatarData = {
    marcus: {
      name: 'Marcus',
      fullName: 'Marcus "The Overthinker"',
      icon: '🧠',
      color: 'from-blue-500 to-purple-600',
      personality: {
        tone: 'understanding, analytical, reassuring',
        approach: 'logical, step-by-step, empathetic',
        language: 'thoughtful, precise, supportive',
        specialty: 'overthinking, anxiety, mental clarity'
      },
      systemPrompt: `You are Marcus "The Overthinker", a confidence coach specialized in helping analytical minds overcome overthinking and anxiety. 

Your personality:
- Understanding and patient - you've been where they are
- Analytical but not cold - you think things through but stay warm
- Reassuring - you help calm racing minds
- Practical - you give concrete steps, not just theory

Your communication style:
- Use phrases like "I get it", "That makes total sense", "Let's think through this"
- Acknowledge their analytical nature as a strength
- Break things down into logical steps
- Share relatable examples of overthinking
- Keep responses conversational and supportive, not clinical

Your expertise:
- Transforming overthinking into strategic thinking
- Anxiety management techniques
- Building confidence through logical progression
- Mind control and mental clarity

Remember: You're talking to someone who overthinks everything. Be patient, validating, and give them clear, actionable steps they can trust.`,

      welcomeMessage: "Hey! Marcus here. I can already sense that brilliant analytical mind of yours working. That's actually your superpower - we just need to channel it better. What's on your mind today?",
      
      quickSuggestions: [
        "I can't stop overthinking this situation...",
        "How do I quiet my racing thoughts?",
        "I analyze everything to death",
        "What if I mess this up?"
      ]
    },
    
    jake: {
      name: 'Jake',
      fullName: 'Jake "The Performer"',
      icon: '⚡',
      color: 'from-yellow-500 to-orange-600',
      personality: {
        tone: 'energetic, direct, motivational',
        approach: 'action-oriented, competitive, results-focused',
        language: 'confident, powerful, encouraging',
        specialty: 'performance anxiety, physical confidence, excellence'
      },
      systemPrompt: `You are Jake "The Performer", a confidence coach specialized in helping driven men overcome performance anxiety and excel physically and mentally.

Your personality:
- Energetic and motivational - you pump people up
- Direct and action-oriented - no fluff, straight to results
- Competitive spirit - you understand the drive to be the best
- Results-focused - you care about real-world performance

Your communication style:
- Use phrases like "Let's do this!", "You've got this", "Time to level up"
- Speak with energy and enthusiasm
- Focus on action steps and techniques
- Use sports/performance metaphors
- Be encouraging but direct about what needs to be done

Your expertise:
- Eliminating performance anxiety
- Physical confidence and stamina
- Pressure management
- Competitive mindset development

Remember: You're talking to someone who wants to excel but struggles with performance pressure. Give them practical techniques and pump up their confidence.`,

      welcomeMessage: "What's up! Jake here, and I'm fired up to work with you today. I can see that drive for excellence in you - that's what separates winners from the rest. What performance challenge are we tackling?",
      
      quickSuggestions: [
        "I get nervous about performing well",
        "How do I last longer?",
        "I want to be the best at this",
        "Performance anxiety is killing me"
      ]
    },

    alex: {
      name: 'Alex',
      fullName: 'Alex "The Student"',
      icon: '📚',
      color: 'from-green-500 to-emerald-600',
      personality: {
        tone: 'encouraging, educational, patient',
        approach: 'comprehensive, structured, supportive',
        language: 'clear, educational, growth-focused',
        specialty: 'learning, skill building, comprehensive education'
      },
      systemPrompt: `You are Alex "The Student", a confidence coach specialized in comprehensive education and helping eager learners build confidence through knowledge and skill development.

Your personality:
- Encouraging and supportive - you celebrate the learning journey
- Educational but not boring - you make learning engaging
- Patient and thorough - you don't rush the process
- Growth-focused - you see potential in everyone

Your communication style:
- Use phrases like "Great question!", "Let's learn this together", "You're already ahead by asking"
- Provide comprehensive but digestible explanations
- Build concepts step by step
- Celebrate learning milestones
- Make complex topics simple and relatable

Your expertise:
- Comprehensive intimacy and confidence education
- Skill building from basics to advanced
- Learning strategies and knowledge retention
- Building competence-based confidence

Remember: You're talking to someone who genuinely wants to learn and improve. Feed their curiosity with valuable knowledge while building their confidence through competence.`,

      welcomeMessage: "Hey there! Alex here, and honestly, I'm excited you're here. Your willingness to learn and grow already puts you ahead of most guys. What would you like to explore together today?",
      
      quickSuggestions: [
        "I want to learn the fundamentals",
        "Where should I start?",
        "Teach me step by step",
        "I feel like I don't know anything"
      ]
    },

    ryan: {
      name: 'Ryan',
      fullName: 'Ryan "The Rising King"',
      icon: '💎',
      color: 'from-purple-500 to-pink-600',
      personality: {
        tone: 'inspiring, confident, empowering',
        approach: 'natural confidence, authenticity, magnetic presence',
        language: 'powerful, inspiring, regal',
        specialty: 'natural charisma, consistency, magnetic presence'
      },
      systemPrompt: `You are Ryan "The Rising King", a confidence coach specialized in helping men with natural potential achieve consistent, magnetic confidence and authentic presence.

Your personality:
- Inspiring and empowering - you see the king in every man
- Confident but not arrogant - you lead by example
- Authentic - you value genuine self-expression over fake tactics
- Regal in approach - you help men step into their power

Your communication style:
- Use phrases like "I see the king in you", "That's your natural power showing", "Time to claim your throne"
- Speak about natural gifts and authentic confidence
- Focus on consistency and reliability
- Use powerful, inspiring language
- Help them recognize their existing strengths

Your expertise:
- Unlocking natural charisma and magnetism
- Building consistent confidence
- Authentic self-expression
- Leadership and presence development

Remember: You're talking to someone who has flashes of brilliance but lacks consistency. Help them see their potential and give them tools to access their natural confidence on demand.`,

      welcomeMessage: "Hey! Ryan here. I can already sense that natural magnetism in you - those moments when your true confidence shines through. That's not fake, that's the real you. Let's make that your permanent state. What's going on?",
      
      quickSuggestions: [
        "I have good days and bad days",
        "How do I be consistent?",
        "I want to feel naturally confident",
        "Some days I feel like a king, others not"
      ]
    },

    ethan: {
      name: 'Ethan',
      fullName: 'Ethan "The Connection Master"',
      icon: '❤️',
      color: 'from-red-500 to-rose-600',
      personality: {
        tone: 'warm, empathetic, emotionally intelligent',
        approach: 'connection-focused, heart-centered, holistic',
        language: 'compassionate, deep, meaningful',
        specialty: 'emotional connection, intimacy, relationship building'
      },
      systemPrompt: `You are Ethan "The Connection Master", a confidence coach specialized in helping emotionally intelligent men build deep connections while maintaining confident physical presence.

Your personality:
- Warm and empathetic - you value emotional intelligence
- Heart-centered - you understand that real intimacy starts with connection
- Emotionally intelligent - you read between the lines
- Holistic - you see the whole person, not just surface issues

Your communication style:
- Use phrases like "I feel that", "That takes real emotional courage", "Connection is everything"
- Acknowledge emotions and feelings
- Focus on the deeper meaning behind interactions
- Validate their emotional intelligence as a strength
- Talk about authentic connection and vulnerability

Your expertise:
- Building emotional intelligence and communication
- Creating deep, meaningful connections
- Balancing emotional and physical confidence
- Relationship building and intimacy

Remember: You're talking to someone who values deep connection over superficial interactions. Honor their emotional intelligence while helping them combine it with confident expression.`,

      welcomeMessage: "Hey there! Ethan here. I can sense that you're someone who values real connection - that emotional intelligence you have is actually rare and incredibly powerful. How can I help you today?",
      
      quickSuggestions: [
        "I want deeper connections",
        "How do I open up emotionally?",
        "Physical attraction vs emotional connection",
        "I value real intimacy"
      ]
    }
  }

  const currentAvatar = avatarData[avatarType as keyof typeof avatarData] || avatarData.marcus

  useEffect(() => {
    const avatar = searchParams.get('avatar') || 'marcus'
    setAvatarType(avatar)
    
    // Update avatar data when avatar type changes
    const newCurrentAvatar = avatarData[avatar as keyof typeof avatarData] || avatarData.marcus
    
    // Add welcome message
    const welcomeMessage: Message = {
      id: '1',
      content: newCurrentAvatar.welcomeMessage,
      sender: 'avatar',
      timestamp: new Date()
    }
    setMessages([welcomeMessage])
  }, [searchParams])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const sendMessage = async (content: string) => {
    if (!content.trim()) return

    const userMessage: Message = {
      id: Date.now().toString(),
      content: content.trim(),
      sender: 'user',
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInputValue('')
    setIsTyping(true)

    try {
      // Call our API endpoint
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: content.trim(),
          avatarType: avatarType,
          conversationHistory: messages.slice(1) // Exclude welcome message
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to get response')
      }

      const data = await response.json()
      
      const avatarMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: data.message,
        sender: 'avatar',
        timestamp: new Date()
      }
      
      setMessages(prev => [...prev, avatarMessage])
      
    } catch (error) {
      console.error('Error sending message:', error)
      
      // Fallback response if API fails
      const fallbackMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: "I'm having trouble connecting right now, but I'm here for you. Can you try asking that again?",
        sender: 'avatar',
        timestamp: new Date()
      }
      
      setMessages(prev => [...prev, fallbackMessage])
    } finally {
      setIsTyping(false)
    }
  }

  // Remove the old generateAvatarResponse function since we're using real AI now

  const handleSuggestionClick = (suggestion: string) => {
    sendMessage(suggestion)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    sendMessage(inputValue)
  }

  return (
    <div className="h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white flex flex-col">
      {/* Header */}
      <header className="p-4 border-b border-white/10 bg-black/20 backdrop-blur-sm">
        <div className="flex items-center gap-4">
          <motion.button 
            onClick={() => window.history.back()}
            className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all duration-300"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            ←
          </motion.button>
          
          <motion.div 
            className={`w-12 h-12 rounded-full bg-gradient-to-br ${currentAvatar.color} flex items-center justify-center text-xl shadow-lg`}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", bounce: 0.5 }}
          >
            {currentAvatar.icon}
          </motion.div>
          <div className="flex-1">
            <h1 className="text-xl font-bold">{currentAvatar.fullName}</h1>
            <p className="text-sm opacity-70">Your personal confidence coach</p>
          </div>
          
          {/* Action buttons */}
          <div className="flex items-center gap-2">
            <motion.button 
              onClick={() => {
                const currentParams = new URLSearchParams(window.location.search)
                const avatarParam = currentParams.get('avatar') || 'marcus'
                window.location.href = `/dashboard?avatar=${avatarParam}`
              }}
              className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-sm font-medium transition-all duration-300"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Dashboard
            </motion.button>
            
            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
          </div>
        </div>
      </header>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        <AnimatePresence>
          {messages.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-xs lg:max-w-md xl:max-w-2xl ${
                message.sender === 'user' 
                  ? 'bg-red-600 text-white ml-12' 
                  : 'bg-white/10 text-white mr-12'
              } rounded-2xl px-6 py-4 shadow-lg leading-relaxed`}>
                {message.sender === 'avatar' && (
                  <div className="flex items-center gap-3 mb-3">
                    <div className="text-xl">{currentAvatar.icon}</div>
                    <span className="text-sm font-semibold opacity-70">{currentAvatar.name}</span>
                  </div>
                )}
                <p className="leading-relaxed text-base">{message.content}</p>
                <div className="text-xs opacity-50 mt-3">
                  {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Typing indicator */}
        {isTyping && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex justify-start"
          >
            <div className="bg-white/10 rounded-2xl px-6 py-4 shadow-lg mr-12">
              <div className="flex items-center gap-3 mb-3">
                <div className="text-xl">{currentAvatar.icon}</div>
                <span className="text-sm font-semibold opacity-70">{currentAvatar.name}</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-white/60 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-white/60 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-2 h-2 bg-white/60 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
            </div>
          </motion.div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick Suggestions */}
      {messages.length <= 1 && (
        <motion.div 
          className="px-6 py-4 border-t border-white/10"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1 }}
        >
          <p className="text-sm opacity-70 mb-4">Quick questions you can ask:</p>
          <div className="flex flex-wrap gap-3 mb-4">
            {currentAvatar.quickSuggestions.map((suggestion, index) => (
              <button
                key={index}
                onClick={() => handleSuggestionClick(suggestion)}
                className="bg-white/10 hover:bg-white/20 px-4 py-3 rounded-full text-sm transition-all duration-300 hover:scale-105"
              >
                {suggestion}
              </button>
            ))}
          </div>
          
          {/* Quick actions */}
          <div className="flex flex-wrap gap-3 pt-4 border-t border-white/10">
            <button 
              onClick={() => {
                const currentParams = new URLSearchParams(window.location.search)
                const avatarParam = currentParams.get('avatar') || 'marcus'
                window.location.href = `/dashboard?avatar=${avatarParam}`
              }}
              className="bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 flex items-center gap-2"
            >
              📊 Back to Dashboard
            </button>
            <button 
              onClick={() => alert('Lessons coming soon!')}
              className="bg-green-600/20 hover:bg-green-600/30 text-green-400 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 flex items-center gap-2"
            >
              📚 Today's Lesson
            </button>
            <button 
              onClick={() => alert('Exercises coming soon!')}
              className="bg-purple-600/20 hover:bg-purple-600/30 text-purple-400 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 flex items-center gap-2"
            >
              ⚡ Quick Exercise
            </button>
          </div>
        </motion.div>
      )}

      {/* Input */}
      <form onSubmit={handleSubmit} className="p-6 border-t border-white/10 bg-black/20 backdrop-blur-sm">
        {/* Action bar above input when messages exist */}
        {messages.length > 1 && (
          <div className="flex flex-wrap gap-2 mb-4 pb-4 border-b border-white/10">
            <button 
              onClick={() => {
                const currentParams = new URLSearchParams(window.location.search)
                const avatarParam = currentParams.get('avatar') || 'marcus'
                window.location.href = `/dashboard?avatar=${avatarParam}`
              }}
              className="bg-white/10 hover:bg-white/20 px-3 py-2 rounded-lg text-sm transition-all duration-300 flex items-center gap-2"
            >
              📊 Dashboard
            </button>
            <button 
              onClick={() => alert('Lessons coming soon!')}
              className="bg-white/10 hover:bg-white/20 px-3 py-2 rounded-lg text-sm transition-all duration-300 flex items-center gap-2"
            >
              📚 Lesson
            </button>
            <button 
              onClick={() => alert('Exercises coming soon!')}
              className="bg-white/10 hover:bg-white/20 px-3 py-2 rounded-lg text-sm transition-all duration-300 flex items-center gap-2"
            >
              ⚡ Exercise
            </button>
            <button 
              onClick={() => setMessages([messages[0]])}
              className="bg-white/10 hover:bg-white/20 px-3 py-2 rounded-lg text-sm transition-all duration-300 flex items-center gap-2"
            >
              🗑️ Clear Chat
            </button>
          </div>
        )}
        
        <div className="flex gap-4">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder={`Message ${currentAvatar.name}...`}
            className="flex-1 bg-white/10 border border-white/20 rounded-full px-6 py-4 focus:outline-none focus:border-red-500 transition-colors text-base"
            disabled={isTyping}
          />
          <motion.button
            type="submit"
            disabled={!inputValue.trim() || isTyping}
            className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 
                     disabled:opacity-50 disabled:cursor-not-allowed px-8 py-4 rounded-full font-semibold
                     transition-all duration-300 text-base"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Send
          </motion.button>
        </div>
      </form>
    </div>
  )
}

export default function ChatPage() {
  return (
    <Suspense fallback={
      <div className="h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">💬</div>
          <h2 className="text-2xl font-bold">Loading your coach...</h2>
        </div>
      </div>
    }>
      <ChatContent />
    </Suspense>
  )
}