// Sexual Performance Solutions Page - Personalized by Avatar

'use client'

import { motion } from 'framer-motion'
import { useState, useEffect, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { SupabaseUserManager, DbUser } from '@/lib/supabase'
import { CheckCircle, Circle, ArrowLeft, Clock, Target, Zap } from 'lucide-react'

// Solution content for Sexual Performance
const sexualPerformanceSolutions = {
  'premature-ejaculation': {
    title: 'Stop Premature Ejaculation',
    difficulty: 'Beginner',
    duration: '2-4 weeks',
    icon: '🕐',
    intro: "Let's be real - finishing too quickly kills confidence and ruins the moment. But here's the thing: this is one of the most fixable problems guys face.",
    content: `
**The Stop-Start Method (Most Effective)**

When you feel yourself getting to 7/10 on the excitement scale, completely stop all movement. Don't think about baseball or your grandmother - that's amateur hour. Instead:

1. **Breathe deeply** - 4 seconds in, 7 seconds hold, 8 seconds out
2. **Count to 10** while maintaining this breathing
3. **Start again** when you're back to 4/5 excitement level
4. **Repeat 3-4 times** before allowing yourself to finish

The magic happens because you're training your body to recognize the point of no return and build control around it.

**Why This Works:**
Your body learns to distinguish between arousal levels. Most guys go from 1 to 10 in seconds. This technique teaches you to surf the waves between 5-8, which is where all the fun happens anyway.

**Pro Tips:**
- Practice during solo sessions first - never try new techniques with a partner
- Use a high-quality lubricant to reduce sensitivity during practice
- The first week will feel frustrating, but week 2-3 is where you'll see real progress

**Common Mistakes:**
- Stopping too late (once you hit 8/10, it's often too late)
- Not breathing properly (holding your breath makes everything worse)
- Giving up after a few tries (consistency is everything)
    `,
    nextStep: 'breathing-control'
  },
  'breathing-control': {
    title: 'Master Breathing for Control',
    difficulty: 'Beginner',
    duration: '1-2 weeks',
    icon: '🫁',
    intro: "Most guys breathe like they're running a marathon during sex. Learn to breathe like a champion and last like one too.",
    content: `
**The 4-7-8 Power Breathing**

This isn't just about lasting longer - it's about staying present and enjoying every moment instead of racing to the finish line.

**The Technique:**
1. **Inhale for 4 counts** through your nose (slow and controlled)
2. **Hold for 7 counts** (this is where the magic happens)
3. **Exhale for 8 counts** through your mouth (release all tension)
4. **Repeat 3-4 cycles** whenever you feel yourself getting too excited

**When to Use It:**
- Before things get started (sets the right pace)
- During foreplay (keeps you calm and focused)
- Right before penetration (prevents that "oh shit" moment)
- Anytime you feel yourself approaching the point of no return

**The Science:**
Deep breathing activates your parasympathetic nervous system - basically tells your body to chill out. It also increases blood flow to your brain, helping you stay in control instead of letting your body run the show.

**Advanced Move:**
Sync your breathing with hers. When she breathes in, you breathe in. This creates an incredible connection and naturally slows everything down.

**Reality Check:**
The first few times will feel weird and mechanical. That's normal. By week 2, it becomes second nature and she'll think you're just naturally good at taking your time.
    `,
    nextStep: 'kegel-exercises'
  },
  'kegel-exercises': {
    title: 'Build Your Control Muscles',
    difficulty: 'Intermediate',
    duration: '3-6 weeks',
    icon: '💪',
    intro: "Think of kegels as gym workouts for your most important muscle. Stronger PC muscle = better control, stronger orgasms, and rock-solid confidence.",
    content: `
**Find Your PC Muscle First**

Stop mid-stream while peeing. That muscle you just used? That's your PC (pubococcygeus) muscle. Master this bad boy and you master your timing.

**The Daily Routine:**

**Week 1-2: Basic Training**
- 10 quick squeezes (1 second hold each)
- 10 medium holds (3 seconds each)
- 5 long holds (10 seconds each)
- Do this 3 times throughout the day

**Week 3-4: Intermediate Level**
- 15 quick squeezes
- 15 medium holds (5 seconds each)
- 10 long holds (15 seconds each)
- 3 times daily

**Week 5-6: Advanced Control**
- 20 quick squeezes
- 20 medium holds (7 seconds each)
- 15 long holds (20 seconds each)
- 3 times daily

**Pro Tips:**
- Don't hold your breath while doing kegels (defeats the purpose)
- Don't squeeze your abs, thighs, or butt - isolate that PC muscle
- You can do these anywhere - driving, at work, watching TV

**The Real-World Application:**
During sex, when you feel yourself getting close, give your PC muscle a firm squeeze and hold for 5-10 seconds. It's like hitting the brakes without stopping the car.

**Results Timeline:**
- Week 2: You'll notice the muscle getting stronger
- Week 4: You can actually use it for control during sex
- Week 6: You're a control master
    `,
    nextStep: 'mental-control'
  },
  'mental-control': {
    title: 'Mental Control Techniques',
    difficulty: 'Advanced',
    duration: '2-3 weeks',
    icon: '🧠',
    intro: "Your brain is your most powerful sexual organ. Learn to use it for control instead of letting it run wild with excitement.",
    content: `
**The Focus Shift Method**

Instead of thinking about random things (which kills the mood), learn to focus on things that keep you present but calm.

**What to Focus On:**
1. **Her pleasure** - Pay attention to her breathing, sounds, body language
2. **Your breathing** - Keep returning to that 4-7-8 rhythm
3. **Physical sensations** - Feel your feet on the bed, your hands on her body
4. **The connection** - Eye contact, synchronized movement

**The Mental Thermostat**

Imagine your arousal as a thermostat from 1-10:
- 1-3: Getting started
- 4-6: Sweet spot (stay here as long as possible)
- 7-8: Warning zone (time to slow down or shift focus)
- 9-10: Point of no return

Your job is to consciously keep yourself between 6-8, riding the wave instead of crashing over it.

**Advanced Techniques:**

**The Body Scan:**
When you feel yourself getting too excited, quickly scan your body from head to toe. Notice where you're holding tension and consciously relax those areas.

**The Pleasure Sharing:**
Instead of focusing on your own sensations, become fascinated by hers. This isn't just nice-guy behavior - it literally reduces your own arousal while making you a better lover.

**Emergency Brake:**
If you're about to lose control:
1. Stop all movement
2. Take 3 deep breaths
3. Shift to focusing entirely on her
4. Don't resume until you're back to 6/10

**Mindset Shift:**
Stop thinking of sex as a race to the finish line. Think of it as a dance where the goal is to stay in rhythm as long as possible.
    `,
    nextStep: 'performance-confidence'
  },
  'performance-confidence': {
    title: 'Build Performance Confidence',
    difficulty: 'Intermediate',
    duration: '1-2 weeks',
    icon: '🔥',
    intro: "Confidence in bed isn't about being perfect - it's about being present, adaptable, and focused on the experience rather than your performance.",
    content: `
**Confidence vs. Pressure**

The biggest mistake guys make is putting pressure on themselves to perform like a porn star. Real confidence comes from being comfortable with yourself and focused on the connection.

**The Confidence Building Framework:**

**1. Preparation Confidence**
- Know your body and your patterns
- Have practiced the techniques above
- Understand that good sex is about communication, not perfection

**2. Moment-to-Moment Confidence**
- Stay present instead of overthinking
- Communicate what feels good
- Ask what she likes (confidence is asking, not guessing)

**3. Recovery Confidence**
- If things don't go as planned, laugh it off and continue
- Remember that most women care more about effort than performance
- Have backup plans (hands, mouth, toys)

**Practical Confidence Builders:**

**Before You Start:**
"I want to take my time with you" - sets the expectation that slow is intentional

**During:**
"Tell me what feels good" - shows you care about her experience

**If You Need a Break:**
"I want to focus on you for a while" - turns a pause into an opportunity

**The Reality Check:**
- 75% of women need more than penetration to orgasm anyway
- Most women prefer longer foreplay over longer penetration
- Enthusiasm and attention beat stamina every time

**Building Long-Term Confidence:**
1. Track your progress with the techniques above
2. Celebrate small wins (lasting 30 seconds longer is progress)
3. Focus on her satisfaction as much as your own
4. Remember that great lovers are made, not born

**Emergency Confidence Boost:**
If anxiety creeps in, remember: You're here, she's here, and you both want to feel good. That's literally all that matters.
    `
  }
}

// Avatar-specific introductions and recommendations
const avatarPersonalization = {
  alex: {
    name: 'Alex',
    intro: "Hey there! Alex here, your Performance Coach. I see performance anxiety and lasting longer are on your mind - totally normal and completely fixable.",
    specialty: "I've helped hundreds of guys go from 30-second rookies to confident lovers who can last as long as they want.",
    encouragement: "The fact that you're here shows you're ready to level up. Let's get to work."
  },
  marcus: {
    name: 'Marcus',
    intro: "What's up! Marcus here. I know the mental game around performance can be tough - your confidence takes a hit every time things don't go as planned.",
    specialty: "My approach combines physical techniques with mindset work because lasting longer starts in your head.",
    encouragement: "You've got this, brother. Every guy who's mastered this started exactly where you are now."
  },
  ryan: {
    name: 'Ryan',
    intro: "Hey man! Ryan here. I get it - nothing kills your confidence with women faster than performance issues.",
    specialty: "We're going to fix this step by step so you can focus on connecting with her instead of worrying about your timing.",
    encouragement: "Trust the process. In a few weeks, this won't even be a concern anymore."
  }
}

function SexualPerformancePage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [user, setUser] = useState<DbUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [completedSolutions, setCompletedSolutions] = useState<string[]>([])
  const [expandedSolution, setExpandedSolution] = useState<string | null>(null)

  // Load user data
  useEffect(() => {
    const loadUserData = async () => {
      try {
        setIsLoading(true)
        
        let username = searchParams.get('username')
        if (!username) {
          const sessionData = sessionStorage.getItem('alpharise_user')
          if (sessionData) {
            const parsedData = JSON.parse(sessionData)
            username = parsedData.username
          }
        }

        if (!username) {
          router.push('/signup')
          return
        }

        const userData = await SupabaseUserManager.getUserByUsername(username)
        if (!userData) {
          router.push('/signup')
          return
        }

        setUser(userData)

        // Load completed solutions from localStorage for now
        // In production, this would come from Supabase
        const completed = localStorage.getItem(`completed_solutions_${username}`)
        if (completed) {
          setCompletedSolutions(JSON.parse(completed))
        }

      } catch (error) {
        console.error('Error loading user data:', error)
        router.push('/signup')
      } finally {
        setIsLoading(false)
      }
    }

    loadUserData()
  }, [searchParams, router])

  // Toggle solution completion
  const toggleSolutionCompletion = (solutionId: string) => {
    const newCompleted = completedSolutions.includes(solutionId)
      ? completedSolutions.filter(id => id !== solutionId)
      : [...completedSolutions, solutionId]
    
    setCompletedSolutions(newCompleted)
    
    // Save to localStorage (in production, save to Supabase)
    if (user) {
      localStorage.setItem(`completed_solutions_${user.username}`, JSON.stringify(newCompleted))
    }
  }

  // Toggle solution expansion
  const toggleSolution = (solutionId: string) => {
    setExpandedSolution(expandedSolution === solutionId ? null : solutionId)
  }

  if (isLoading || !user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🕐</div>
          <h2 className="text-2xl font-bold">Loading your personalized solutions...</h2>
        </div>
      </div>
    )
  }

  const avatarInfo = avatarPersonalization[user.avatar_type as keyof typeof avatarPersonalization] || avatarPersonalization.alex
  const solutionsList = Object.entries(sexualPerformanceSolutions)

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white">
      {/* Header */}
      <header className="p-6 flex justify-between items-center border-b border-white/10">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => router.back()}
            className="flex items-center gap-2 px-3 py-2 bg-gray-700/50 hover:bg-gray-600/50 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm font-medium">Back to Dashboard</span>
          </button>
          <div className="text-2xl font-black bg-gradient-to-r from-red-500 to-red-600 bg-clip-text text-transparent">
            AlphaRise
          </div>
        </div>
        <div className="bg-yellow-500/20 text-yellow-400 px-3 py-1 rounded-full text-sm font-semibold flex items-center gap-1">
          <span>🪙</span>
          {user.coins}
        </div>
      </header>

      <div className="container mx-auto px-6 py-8 max-w-4xl">
        
        {/* Personalized Welcome */}
        <motion.div 
          className="mb-8"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="bg-gradient-to-r from-red-500/20 to-orange-500/20 border border-red-500/30 rounded-2xl p-8">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-red-500 to-orange-600 flex items-center justify-center text-2xl shadow-xl">
                🕐
              </div>
              <div>
                <h1 className="text-3xl font-bold">Sexual Performance Mastery</h1>
                <p className="text-lg opacity-70">Personalized by Coach {avatarInfo.name}</p>
              </div>
            </div>
            
            <div className="space-y-4">
              <p className="text-lg">{avatarInfo.intro}</p>
              <p className="opacity-90">{avatarInfo.specialty}</p>
              <p className="font-semibold text-orange-400">{avatarInfo.encouragement}</p>
            </div>
          </div>
        </motion.div>

        {/* Progress Overview */}
        <motion.div 
          className="mb-8 bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Target className="w-5 h-5" />
            Your Progress
          </h2>
          <div className="flex items-center gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-400">{completedSolutions.length}</div>
              <div className="text-sm opacity-70">Completed</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-400">{solutionsList.length - completedSolutions.length}</div>
              <div className="text-sm opacity-70">Remaining</div>
            </div>
            <div className="flex-1 bg-gray-700 rounded-full h-3">
              <div 
                className="h-full bg-gradient-to-r from-green-500 to-green-600 rounded-full transition-all duration-500"
                style={{ width: `${(completedSolutions.length / solutionsList.length) * 100}%` }}
              ></div>
            </div>
          </div>
        </motion.div>

        {/* Solutions List */}
        <div className="space-y-6">
          {solutionsList.map(([solutionId, solution], index) => {
            const isCompleted = completedSolutions.includes(solutionId)
            const isExpanded = expandedSolution === solutionId

            return (
              <motion.div
                key={solutionId}
                className={`bg-white/5 backdrop-blur-sm border rounded-2xl overflow-hidden ${
                  isCompleted ? 'border-green-500/30' : 'border-white/10'
                }`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
              >
                {/* Solution Header */}
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-4">
                      <div className="text-3xl">{solution.icon}</div>
                      <div>
                        <h3 className="text-xl font-bold">{solution.title}</h3>
                        <div className="flex items-center gap-4 text-sm opacity-70">
                          <span className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            {solution.duration}
                          </span>
                          <span className="flex items-center gap-1">
                            <Zap className="w-4 h-4" />
                            {solution.difficulty}
                          </span>
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => toggleSolutionCompletion(solutionId)}
                      className={`p-2 rounded-full transition-colors ${
                        isCompleted 
                          ? 'text-green-400 hover:text-green-300' 
                          : 'text-gray-400 hover:text-white'
                      }`}
                    >
                      {isCompleted ? <CheckCircle className="w-6 h-6" /> : <Circle className="w-6 h-6" />}
                    </button>
                  </div>
                  
                  <p className="text-lg mb-4 opacity-90">{solution.intro}</p>
                  
                  <button
                    onClick={() => toggleSolution(solutionId)}
                    className="w-full py-3 bg-red-600 hover:bg-red-700 rounded-lg font-semibold transition-colors"
                  >
                    {isExpanded ? 'Hide Solution' : 'Read Full Solution'}
                  </button>
                </div>

                {/* Solution Content */}
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="border-t border-white/10 p-6 bg-white/5"
                  >
                    <div className="prose prose-invert max-w-none">
                      {solution.content.split('\n\n').map((paragraph, idx) => {
                        if (paragraph.startsWith('**') && paragraph.endsWith('**')) {
                          return <h4 key={idx} className="text-lg font-bold text-orange-400 mt-6 mb-3">{paragraph.slice(2, -2)}</h4>
                        }
                        return <p key={idx} className="mb-4 leading-relaxed">{paragraph}</p>
                      })}
                    </div>
                    
                    {solution.nextStep && (
                      <div className="mt-6 p-4 bg-blue-500/20 border border-blue-500/30 rounded-lg">
                        <p className="text-blue-400 font-semibold mb-2">🎯 Next Recommended:</p>
                        <p className="text-sm">
                          After mastering this, move on to "{sexualPerformanceSolutions[solution.nextStep as keyof typeof sexualPerformanceSolutions]?.title}"
                        </p>
                      </div>
                    )}
                  </motion.div>
                )}
              </motion.div>
            )
          })}
        </div>

        {/* Bottom CTA */}
        <motion.div 
          className="mt-12 text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
        >
          <div className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/30 rounded-2xl p-8">
            <h3 className="text-2xl font-bold mb-4">Questions or Need Support?</h3>
            <p className="text-lg opacity-90 mb-6">
              Join our community of men who are all working on the same journey. 
              Share wins, ask questions, and learn from guys who've mastered these techniques.
            </p>
            <button
              onClick={() => router.push('/community')}
              className="px-8 py-4 bg-green-600 hover:bg-green-700 rounded-lg font-semibold transition-colors"
            >
              Join the Community
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default function SexualPerformanceSolutionsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🕐</div>
          <h2 className="text-2xl font-bold">Loading your solutions...</h2>
        </div>
      </div>
    }>
      <SexualPerformancePage />
    </Suspense>
  )
}