'use client'

import { motion } from 'framer-motion'
import { Coins, TrendingUp, Gift, Award, Calendar, Users, MessageCircle, Star, Zap, ShoppingCart, Shield, Target, ArrowRight, CheckCircle, XCircle, Info } from 'lucide-react'
import Link from 'next/link'

export default function CoinsGuidePage() {
  const earningActions = [
    { icon: "📅", name: "Daily Login", coins: 1, description: "Log in every day to earn coins", frequency: "Daily" },
    { icon: "🔥", name: "7-Day Streak", coins: 10, description: "Maintain a 7-day login streak", frequency: "Weekly" },
    { icon: "💬", name: "Answer Posted", coins: 1, description: "Post an answer to help someone", frequency: "Per answer" },
    { icon: "👍", name: "Helpful Votes", coins: 1, description: "Earn coins when others find your answer helpful", frequency: "From 5th vote onwards" },
    { icon: "🏆", name: "Best Answer", coins: 5, description: "Automatic bonus when you get 7+ helpful votes", frequency: "Per best answer" },
    { icon: "⭐", name: "Expert Answer", coins: 12, description: "5-star answer with 5+ votes", frequency: "Per expert answer" },
    { icon: "👥", name: "Invite Friend", coins: 20, description: "Friend joins with your referral code", frequency: "Per referral" },
    { icon: "📚", name: "Complete Lesson", coins: 2, description: "Finish a learning module", frequency: "Per lesson" },
    { icon: "⚡", name: "Weekend Warrior", coins: 8, description: "Answer questions on weekends (2x multiplier)", frequency: "Weekend only" }
  ]

  const spendingActions = [
    { icon: "❓", name: "Regular Question", coins: 2, description: "Post a new question to the community" },
    { icon: "🚨", name: "Urgent Question", coins: 5, description: "Guaranteed response within 6 hours" },
    { icon: "🔒", name: "Private Question", coins: 8, description: "Only verified experts can see and answer" },
    { icon: "👑", name: "VIP Question", coins: 15, description: "Direct answer from avatar coaches (Marcus, Ryan, etc.)" },
    { icon: "📌", name: "Boost Question", coins: 3, description: "Pin your question to the top for 24 hours" }
  ]

  const fraudPrevention = [
    { icon: <CheckCircle className="w-5 h-5 text-green-400" />, text: "Coins start flowing from the 5th helpful vote (prevents fake votes)" },
    { icon: <CheckCircle className="w-5 h-5 text-green-400" />, text: "Best Answer becomes automatic at 7+ votes (no favoritism)" },
    { icon: <CheckCircle className="w-5 h-5 text-green-400" />, text: "Can't vote for your own answers (prevents self-voting)" },
    { icon: <XCircle className="w-5 h-5 text-red-400" />, text: "Can't vote twice for the same answer (one vote per user)" },
    { icon: <XCircle className="w-5 h-5 text-red-400" />, text: "Can't vote for clarifications from question author (prevents abuse)" }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900">
      {/* Header */}
      <div className="relative overflow-hidden bg-gradient-to-r from-purple-600 to-pink-600 py-16">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative max-w-6xl mx-auto px-4 text-center">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-center gap-3 mb-6"
          >
            <Coins className="w-12 h-12 text-yellow-400" />
            <h1 className="text-5xl font-bold text-white">AlphaRise Coins</h1>
          </motion.div>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-xl text-purple-100 max-w-3xl mx-auto"
          >
            Earn coins by helping others, spend them on premium features. Build confidence while building your coin balance.
          </motion.p>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mt-8 flex flex-wrap justify-center gap-6 text-purple-100"
          >
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              <span>Community Driven</span>
            </div>
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5" />
              <span>Anti-Fraud Protected</span>
            </div>
            <div className="flex items-center gap-2">
              <Target className="w-5 h-5" />
              <span>Quality Focused</span>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-12 space-y-16">
        {/* How It Works */}
        <motion.section 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <h2 className="text-3xl font-bold text-white mb-4">How It Works</h2>
          <p className="text-gray-300 text-lg mb-12 max-w-3xl mx-auto">
            AlphaRise Coins create a thriving community where knowledge sharing is rewarded and quality content rises to the top.
          </p>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-gray-800/50 backdrop-blur border border-gray-700 rounded-xl p-6">
              <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="w-8 h-8 text-green-400" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Earn Coins</h3>
              <p className="text-gray-300">Help others by answering questions, logging in daily, and being an active community member.</p>
            </div>
            
            <div className="bg-gray-800/50 backdrop-blur border border-gray-700 rounded-xl p-6">
              <div className="w-16 h-16 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <ShoppingCart className="w-8 h-8 text-purple-400" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Spend Coins</h3>
              <p className="text-gray-300">Ask questions, get priority support, access VIP features, and boost your content visibility.</p>
            </div>
            
            <div className="bg-gray-800/50 backdrop-blur border border-gray-700 rounded-xl p-6">
              <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-blue-400" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Build Community</h3>
              <p className="text-gray-300">Quality answers get rewarded, creating a positive feedback loop of helpful content.</p>
            </div>
          </div>
        </motion.section>

        {/* Earning Coins */}
        <motion.section 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-4">💰 Ways to Earn Coins</h2>
            <p className="text-gray-300 text-lg">Be active, be helpful, be rewarded</p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {earningActions.map((action, index) => (
              <motion.div
                key={action.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-500/20 rounded-xl p-6 hover:border-green-500/40 transition-all duration-300"
              >
                <div className="flex items-start gap-4">
                  <div className="text-3xl">{action.icon}</div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-lg font-semibold text-white">{action.name}</h3>
                      <div className="flex items-center gap-1 bg-green-500/20 px-3 py-1 rounded-full">
                        <Coins className="w-4 h-4 text-yellow-400" />
                        <span className="text-green-400 font-semibold">+{action.coins}</span>
                      </div>
                    </div>
                    <p className="text-gray-300 text-sm mb-2">{action.description}</p>
                    <p className="text-green-400 text-xs font-medium">{action.frequency}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* Spending Coins */}
        <motion.section 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-4">💸 Ways to Spend Coins</h2>
            <p className="text-gray-300 text-lg">Unlock premium features and priority support</p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-6">
            {spendingActions.map((action, index) => (
              <motion.div
                key={action.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/20 rounded-xl p-6 hover:border-purple-500/40 transition-all duration-300"
              >
                <div className="flex items-start gap-4">
                  <div className="text-3xl">{action.icon}</div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-lg font-semibold text-white">{action.name}</h3>
                      <div className="flex items-center gap-1 bg-purple-500/20 px-3 py-1 rounded-full">
                        <Coins className="w-4 h-4 text-yellow-400" />
                        <span className="text-purple-400 font-semibold">-{action.coins}</span>
                      </div>
                    </div>
                    <p className="text-gray-300 text-sm">{action.description}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* Anti-Fraud System */}
        <motion.section 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-gray-800/30 backdrop-blur border border-gray-700 rounded-2xl p-8"
        >
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Shield className="w-8 h-8 text-blue-400" />
              <h2 className="text-3xl font-bold text-white">🛡️ Anti-Fraud Protection</h2>
            </div>
            <p className="text-gray-300 text-lg">Fair play rules that keep the community healthy</p>
          </div>
          
          <div className="space-y-4 max-w-4xl mx-auto">
            {fraudPrevention.map((rule, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center gap-4 p-4 bg-gray-700/30 rounded-lg"
              >
                {rule.icon}
                <span className="text-gray-300">{rule.text}</span>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* Subscription Benefits */}
        <motion.section 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-4">🎯 Subscription Tiers</h2>
            <p className="text-gray-300 text-lg">Different monthly coin allocations based on your membership</p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <div className="bg-gradient-to-br from-gray-600/20 to-gray-700/20 border border-gray-600/30 rounded-xl p-8">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-gray-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-2xl font-bold text-white">Trial Member</h3>
                <p className="text-gray-400">Free tier</p>
              </div>
              <div className="space-y-3 mb-6">
                <div className="flex items-center gap-2">
                  <Coins className="w-5 h-5 text-yellow-400" />
                  <span className="text-gray-300"><span className="font-semibold text-white">50 coins</span> monthly allocation</span>
                </div>
                <div className="flex items-center gap-2">
                  <MessageCircle className="w-5 h-5 text-blue-400" />
                  <span className="text-gray-300">Access to community</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-green-400" />
                  <span className="text-gray-300">Daily coin earning</span>
                </div>
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-purple-600/20 to-pink-600/20 border border-purple-500/30 rounded-xl p-8 relative">
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-1 rounded-full text-sm font-semibold">
                Recommended
              </div>
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Star className="w-8 h-8 text-purple-400" />
                </div>
                <h3 className="text-2xl font-bold text-white">Premium Member</h3>
                <p className="text-purple-300">Full access</p>
              </div>
              <div className="space-y-3 mb-6">
                <div className="flex items-center gap-2">
                  <Coins className="w-5 h-5 text-yellow-400" />
                  <span className="text-gray-300"><span className="font-semibold text-purple-300">200 coins</span> monthly allocation</span>
                </div>
                <div className="flex items-center gap-2">
                  <Zap className="w-5 h-5 text-yellow-400" />
                  <span className="text-gray-300">Priority support</span>
                </div>
                <div className="flex items-center gap-2">
                  <Award className="w-5 h-5 text-yellow-400" />
                  <span className="text-gray-300">Exclusive features</span>
                </div>
                <div className="flex items-center gap-2">
                  <Gift className="w-5 h-5 text-pink-400" />
                  <span className="text-gray-300">Weekly bonus coins</span>
                </div>
              </div>
            </div>
          </div>
        </motion.section>

        {/* Call to Action */}
        <motion.section 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center bg-gradient-to-r from-purple-600/20 to-pink-600/20 border border-purple-500/30 rounded-2xl p-12"
        >
          <h2 className="text-3xl font-bold text-white mb-4">Ready to Start Earning?</h2>
          <p className="text-gray-300 text-lg mb-8 max-w-2xl mx-auto">
            Join the AlphaRise community today and start building your confidence while earning coins for helping others.
          </p>
          
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/dashboard" className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-8 py-3 rounded-lg font-semibold hover:from-purple-600 hover:to-pink-600 transition-all duration-300">
              <Coins className="w-5 h-5" />
              Go to Dashboard
              <ArrowRight className="w-4 h-4" />
            </Link>
            
            <Link href="/community" className="inline-flex items-center gap-2 bg-gray-700/50 text-white border border-gray-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-600/50 transition-all duration-300">
              <Users className="w-5 h-5" />
              Join Community
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </motion.section>

        {/* Info Box */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-6"
        >
          <div className="flex items-start gap-4">
            <Info className="w-6 h-6 text-blue-400 flex-shrink-0 mt-1" />
            <div>
              <h3 className="text-lg font-semibold text-white mb-2">Important Note</h3>
              <p className="text-gray-300">
                AlphaRise Coins are currently focused on community engagement and do not have cash conversion. 
                The real value comes from improved answers, better community participation, and the confidence-building journey.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}