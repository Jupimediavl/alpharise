'use client';

import React, { useState, useEffect } from 'react';
import { Coins, TrendingUp, Gift, Award, Calendar, Users, MessageCircle, Star, Zap, ShoppingCart } from 'lucide-react';

// Coin Economy System Types
interface CoinTransaction {
  id: string;
  userId: string;
  type: 'earn' | 'spend';
  amount: number;
  reason: string;
  category: 'question' | 'answer' | 'bonus' | 'subscription' | 'daily' | 'achievement';
  timestamp: Date;
  questionId?: string;
  rating?: number;
}

interface UserCoinProfile {
  userId: string;
  username: string;
  currentBalance: number;
  totalEarned: number;
  totalSpent: number;
  monthlyAllocation: number;
  subscriptionType: 'trial' | 'premium';
  streak: number;
  level: number;
  badges: string[];
  lastActivity: Date;
  monthlyEarnings: number;
  discountEarned: number; // Amount earned towards subscription discount
}

interface CoinAction {
  id: string;
  name: string;
  type: 'earn' | 'spend';
  amount: number;
  description: string;
  category: string;
  icon: string;
  conditions?: string[];
}

// Coin Economy Manager Class
class CoinEconomyManager {
  private transactions: CoinTransaction[] = [];
  private userProfiles: Map<string, UserCoinProfile> = new Map();

  // Coin Actions Configuration
  private coinActions: CoinAction[] = [
    // EARNING ACTIONS
    { id: 'daily_login', name: 'Daily Login', type: 'earn', amount: 1, description: 'Log in daily', category: 'daily', icon: '📅' },
    { id: 'streak_7', name: '7-Day Streak', type: 'earn', amount: 10, description: 'Login 7 days in a row', category: 'bonus', icon: '🔥' },
    { id: 'first_answer', name: 'First Answer', type: 'earn', amount: 5, description: 'Answer your first question', category: 'achievement', icon: '🌟' },
    { id: 'helpful_answer', name: 'Helpful Answer', type: 'earn', amount: 5, description: 'Answer rated 4+ stars', category: 'answer', icon: '👍' },
    { id: 'best_answer', name: 'Best Answer', type: 'earn', amount: 8, description: 'Selected as best answer', category: 'answer', icon: '🏆' },
    { id: 'expert_answer', name: 'Expert Answer', type: 'earn', amount: 12, description: '5-star answer with 5+ votes', category: 'answer', icon: '⭐' },
    { id: 'invite_friend', name: 'Invite Friend', type: 'earn', amount: 20, description: 'Friend joins with your referral', category: 'bonus', icon: '👥' },
    { id: 'complete_lesson', name: 'Complete Lesson', type: 'earn', amount: 2, description: 'Finish a learning module', category: 'achievement', icon: '📚' },
    { id: 'weekend_bonus', name: 'Weekend Warrior', type: 'earn', amount: 8, description: 'Answer on weekends (2x multiplier)', category: 'bonus', icon: '⚡' },
    
    // SPENDING ACTIONS
    { id: 'ask_question', name: 'Ask Question', type: 'spend', amount: 2, description: 'Post a new question', category: 'question', icon: '❓' },
    { id: 'urgent_question', name: 'Urgent Question', type: 'spend', amount: 5, description: 'Guaranteed 6h response', category: 'question', icon: '🚨' },
    { id: 'private_question', name: 'Private Question', type: 'spend', amount: 8, description: 'Only experts can see/answer', category: 'question', icon: '🔒' },
    { id: 'vip_question', name: 'VIP Question', type: 'spend', amount: 15, description: 'Direct answer from avatar coaches', category: 'question', icon: '👑' },
    { id: 'boost_question', name: 'Boost Question', type: 'spend', amount: 3, description: 'Pin to top for 24h', category: 'question', icon: '📌' },
  ];

  constructor() {
    this.initializeMockData();
  }

  private initializeMockData() {
    // Create mock user profiles
    const mockUsers = [
      { userId: 'user_1', username: 'AlphaSeeker', subscriptionType: 'premium' as const, level: 3 },
      { userId: 'user_2', username: 'ConfidentRise', subscriptionType: 'trial' as const, level: 1 },
      { userId: 'user_3', username: 'BetaToAlpha', subscriptionType: 'premium' as const, level: 5 },
    ];

    mockUsers.forEach(user => {
      const monthlyAllocation = user.subscriptionType === 'premium' ? 200 : 50;
      const profile: UserCoinProfile = {
        userId: user.userId,
        username: user.username,
        currentBalance: Math.floor(Math.random() * 150) + 50,
        totalEarned: Math.floor(Math.random() * 500) + 100,
        totalSpent: Math.floor(Math.random() * 300) + 50,
        monthlyAllocation,
        subscriptionType: user.subscriptionType,
        streak: Math.floor(Math.random() * 20) + 1,
        level: user.level,
        badges: ['First Answer', 'Helpful Helper', 'Community Star'],
        lastActivity: new Date(),
        monthlyEarnings: Math.floor(Math.random() * 80) + 20,
        discountEarned: Math.floor(Math.random() * 15) + 2,
      };
      this.userProfiles.set(user.userId, profile);
    });

    // Create mock transactions
    this.generateMockTransactions();
  }

  private generateMockTransactions() {
    const userIds = Array.from(this.userProfiles.keys());
    const mockTransactions: CoinTransaction[] = [];

    for (let i = 0; i < 50; i++) {
      const userId = userIds[Math.floor(Math.random() * userIds.length)];
      const action = this.coinActions[Math.floor(Math.random() * this.coinActions.length)];
      
      mockTransactions.push({
        id: `tx_${i}`,
        userId,
        type: action.type,
        amount: action.amount,
        reason: action.description,
        category: action.category as any,
        timestamp: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000),
        rating: action.type === 'earn' && action.category === 'answer' ? Math.floor(Math.random() * 2) + 4 : undefined,
      });
    }

    this.transactions = mockTransactions.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  // Public Methods
  addTransaction(transaction: Omit<CoinTransaction, 'id' | 'timestamp'>): CoinTransaction {
    const newTransaction: CoinTransaction = {
      ...transaction,
      id: `tx_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
    };

    this.transactions.unshift(newTransaction);
    this.updateUserBalance(transaction.userId, transaction.type, transaction.amount);
    
    return newTransaction;
  }

  private updateUserBalance(userId: string, type: 'earn' | 'spend', amount: number) {
    const profile = this.userProfiles.get(userId);
    if (!profile) return;

    if (type === 'earn') {
      profile.currentBalance += amount;
      profile.totalEarned += amount;
      profile.monthlyEarnings += amount;
      
      // Update discount earned (100 coins = $3 discount, max $15/month)
      const newDiscount = Math.min(15, Math.floor(profile.monthlyEarnings / 100) * 3);
      profile.discountEarned = newDiscount;
    } else {
      profile.currentBalance -= amount;
      profile.totalSpent += amount;
    }

    profile.lastActivity = new Date();
    this.userProfiles.set(userId, profile);
  }

  getUserProfile(userId: string): UserCoinProfile | undefined {
    return this.userProfiles.get(userId);
  }

  getUserTransactions(userId: string, limit: number = 20): CoinTransaction[] {
    return this.transactions
      .filter(tx => tx.userId === userId)
      .slice(0, limit);
  }

  getAllTransactions(limit: number = 50): CoinTransaction[] {
    return this.transactions.slice(0, limit);
  }

  getCoinActions(): CoinAction[] {
    return this.coinActions;
  }

  getLeaderboard(): UserCoinProfile[] {
    return Array.from(this.userProfiles.values())
      .sort((a, b) => b.monthlyEarnings - a.monthlyEarnings)
      .slice(0, 10);
  }

  // Coin Actions
  askQuestion(userId: string, questionType: string = 'regular', bounty: number = 0): CoinTransaction | null {
    const profile = this.getUserProfile(userId);
    if (!profile) return null;

    const costs = {
      'regular': 2,
      'urgent': 5,
      'private': 8,
      'vip': 15,
      'boost': 3,
    };

    const cost = costs[questionType as keyof typeof costs] || 2;
    const totalCost = cost + bounty;

    if (profile.currentBalance < totalCost) {
      throw new Error(`Insufficient coins. Need ${totalCost}, have ${profile.currentBalance}`);
    }

    return this.addTransaction({
      userId,
      type: 'spend',
      amount: totalCost,
      reason: `Asked ${questionType} question${bounty ? ` with ${bounty} coin bounty` : ''}`,
      category: 'question',
    });
  }

  rewardAnswer(userId: string, questionId: string, rating: number, isBestAnswer: boolean = false): CoinTransaction {
    let amount = 3; // Base reward
    let reason = 'Answer provided';

    if (rating >= 4) {
      amount = 5;
      reason = 'Helpful answer (4+ stars)';
    }
    
    if (isBestAnswer) {
      amount += 3;
      reason = 'Best answer selected';
    }

    if (rating === 5) {
      amount += 2;
      reason = 'Expert answer (5 stars)';
    }

    // Weekend bonus (2x)
    const isWeekend = [0, 6].includes(new Date().getDay());
    if (isWeekend) {
      amount *= 2;
      reason += ' + Weekend bonus';
    }

    return this.addTransaction({
      userId,
      type: 'earn',
      amount,
      reason,
      category: 'answer',
      questionId,
      rating,
    });
  }

  dailyLogin(userId: string): CoinTransaction | null {
    const profile = this.getUserProfile(userId);
    if (!profile) return null;

    // Check if already logged in today
    const today = new Date().toDateString();
    const lastActivity = profile.lastActivity.toDateString();
    
    if (today === lastActivity) {
      return null; // Already logged in today
    }

    // Update streak
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (lastActivity === yesterday.toDateString()) {
      profile.streak += 1;
    } else {
      profile.streak = 1;
    }

    let amount = 1;
    let reason = 'Daily login';

    // Streak bonuses
    if (profile.streak === 7) {
      amount += 10;
      reason += ' + 7-day streak bonus!';
    } else if (profile.streak === 30) {
      amount += 25;
      reason += ' + 30-day streak bonus!';
    }

    return this.addTransaction({
      userId,
      type: 'earn',
      amount,
      reason,
      category: 'daily',
    });
  }

  monthlyAllocation(userId: string): void {
    const profile = this.getUserProfile(userId);
    if (!profile) return;

    const amount = profile.subscriptionType === 'premium' ? 200 : 50;
    
    this.addTransaction({
      userId,
      type: 'earn',
      amount,
      reason: `Monthly ${profile.subscriptionType} allocation`,
      category: 'subscription',
    });

    // Reset monthly earnings for discount calculation
    profile.monthlyEarnings = 0;
    profile.discountEarned = 0;
  }
}

// Main Component
const CoinEconomyDashboard: React.FC = () => {
  const [coinManager] = useState(() => new CoinEconomyManager());
  const [currentUser] = useState('user_1'); // Mock current user
  const [activeTab, setActiveTab] = useState<'overview' | 'transactions' | 'actions' | 'leaderboard'>('overview');
  const [userProfile, setUserProfile] = useState<UserCoinProfile | null>(null);
  const [transactions, setTransactions] = useState<CoinTransaction[]>([]);
  const [leaderboard, setLeaderboard] = useState<UserCoinProfile[]>([]);
  
  // Navigation functions
  const goToDashboard = () => {
    if (typeof window !== 'undefined') {
      window.location.href = '/dashboard';
    }
  };

  const goToCommunity = () => {
    if (typeof window !== 'undefined') {
      window.location.href = '/community';
    }
  };

  useEffect(() => {
    refreshData();
  }, []);

  const refreshData = () => {
    const profile = coinManager.getUserProfile(currentUser);
    setUserProfile(profile || null);
    setTransactions(coinManager.getUserTransactions(currentUser));
    setLeaderboard(coinManager.getLeaderboard());
  };

  const handleAskQuestion = (type: string) => {
    try {
      coinManager.askQuestion(currentUser, type);
      refreshData();
      alert(`Question posted! Cost: ${type === 'urgent' ? 5 : type === 'private' ? 8 : type === 'vip' ? 15 : 2} coins`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An error occurred';
      alert(errorMessage);
    }
  };

  const handleDailyLogin = () => {
    const transaction = coinManager.dailyLogin(currentUser);
    if (transaction) {
      refreshData();
      alert(`Daily login bonus: +${transaction.amount} coins!`);
    } else {
      alert('Already logged in today!');
    }
  };

  const simulateAnswer = () => {
    const rating = Math.floor(Math.random() * 2) + 4; // 4 or 5 stars
    const isBest = Math.random() > 0.7;
    coinManager.rewardAnswer(currentUser, 'mock_question', rating, isBest);
    refreshData();
    alert(`Answer rewarded! Rating: ${rating} stars${isBest ? ' (Best Answer!)' : ''}`);
  };

  if (!userProfile) {
    return <div className="p-8 text-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white p-6">
      <div className="max-w-7xl mx-auto">
        
        {/* Header with Navigation */}
        <header className="mb-8 bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button 
                onClick={goToDashboard}
                className="text-2xl font-black bg-gradient-to-r from-red-500 to-red-600 bg-clip-text text-transparent hover:opacity-80 transition-opacity"
              >
                AlphaRise
              </button>
              <span className="text-white/40">•</span>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-yellow-400 to-yellow-600 bg-clip-text text-transparent">
                Coin Economy
              </h1>
            </div>
            
            {/* Navigation Buttons */}
            <div className="flex items-center gap-3">
              <button 
                onClick={goToDashboard}
                className="px-4 py-2 bg-blue-600/20 hover:bg-blue-600/30 rounded-lg transition-colors text-sm font-semibold flex items-center gap-2"
              >
                <span>🏠</span>
                Dashboard
              </button>
              <button 
                onClick={goToCommunity}
                className="px-4 py-2 bg-green-600/20 hover:bg-green-600/30 rounded-lg transition-colors text-sm font-semibold flex items-center gap-2"
              >
                <span>💬</span>
                Community
              </button>
            </div>
          </div>
          
          {/* Breadcrumb */}
          <div className="mt-4 text-sm text-gray-400">
            <span className="hover:text-white cursor-pointer" onClick={goToDashboard}>Dashboard</span>
            <span className="mx-2">/</span>
            <span className="text-yellow-400">Coin Economy</span>
          </div>
        </header>

        {/* User Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-gradient-to-br from-yellow-900/40 to-yellow-800/40 border border-yellow-500/30 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-3">
              <Coins className="h-8 w-8 text-yellow-400" />
              <div>
                <div className="text-2xl font-bold">{userProfile.currentBalance}</div>
                <div className="text-sm text-yellow-400">Current Balance</div>
              </div>
            </div>
            <div className="text-xs text-gray-400">
              Monthly allowance: {userProfile.monthlyAllocation} coins
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-900/40 to-green-800/40 border border-green-500/30 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-3">
              <TrendingUp className="h-8 w-8 text-green-400" />
              <div>
                <div className="text-2xl font-bold">{userProfile.monthlyEarnings}</div>
                <div className="text-sm text-green-400">Monthly Earned</div>
              </div>
            </div>
            <div className="text-xs text-gray-400">
              Subscription discount: ${userProfile.discountEarned}
            </div>
          </div>

          <div className="bg-gradient-to-br from-red-900/40 to-red-800/40 border border-red-500/30 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-3">
              <Zap className="h-8 w-8 text-red-400" />
              <div>
                <div className="text-2xl font-bold">{userProfile.streak}</div>
                <div className="text-sm text-red-400">Day Streak</div>
              </div>
            </div>
            <div className="text-xs text-gray-400">
              Level {userProfile.level} • {userProfile.subscriptionType}
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-900/40 to-purple-800/40 border border-purple-500/30 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-3">
              <Award className="h-8 w-8 text-purple-400" />
              <div>
                <div className="text-2xl font-bold">{userProfile.badges.length}</div>
                <div className="text-sm text-purple-400">Badges Earned</div>
              </div>
            </div>
            <div className="text-xs text-gray-400">
              Total earned: {userProfile.totalEarned} coins
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex gap-2 mb-8 bg-white/5 p-2 rounded-xl">
          {[
            { id: 'overview', label: 'Overview', icon: Gift },
            { id: 'transactions', label: 'Transactions', icon: Calendar },
            { id: 'actions', label: 'Actions', icon: Zap },
            { id: 'leaderboard', label: 'Leaderboard', icon: Award },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                activeTab === tab.id
                  ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                  : 'text-gray-400 hover:text-white hover:bg-white/10'
              }`}
            >
              <tab.icon className="h-4 w-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Quick Navigation to Community */}
        <div className="mb-8 bg-gradient-to-r from-blue-900/40 to-purple-900/40 border border-blue-500/30 rounded-2xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold mb-2">Ready to Earn Coins?</h3>
              <p className="text-sm text-gray-300">Answer questions in the community to earn 3-12 coins per helpful response!</p>
            </div>
            <button 
              onClick={goToCommunity}
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-300"
            >
              Go to Community →
            </button>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Quick Actions */}
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
              <h3 className="text-xl font-bold mb-4">Quick Actions</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <button
                  onClick={() => handleAskQuestion('regular')}
                  className="p-4 bg-blue-600/20 hover:bg-blue-600/30 rounded-lg transition-colors text-left"
                >
                  <div className="text-2xl mb-2">❓</div>
                  <div className="font-semibold">Ask Question</div>
                  <div className="text-xs text-gray-400">Cost: 2 coins</div>
                </button>
                
                <button
                  onClick={() => handleAskQuestion('urgent')}
                  className="p-4 bg-red-600/20 hover:bg-red-600/30 rounded-lg transition-colors text-left"
                >
                  <div className="text-2xl mb-2">🚨</div>
                  <div className="font-semibold">Urgent Question</div>
                  <div className="text-xs text-gray-400">Cost: 5 coins • 6h response</div>
                </button>
                
                <button
                  onClick={simulateAnswer}
                  className="p-4 bg-green-600/20 hover:bg-green-600/30 rounded-lg transition-colors text-left"
                >
                  <div className="text-2xl mb-2">💡</div>
                  <div className="font-semibold">Answer Question</div>
                  <div className="text-xs text-gray-400">Earn: 3-12 coins</div>
                </button>
                
                <button
                  onClick={goToCommunity}
                  className="p-4 bg-purple-600/20 hover:bg-purple-600/30 rounded-lg transition-colors text-left"
                >
                  <div className="text-2xl mb-2">💬</div>
                  <div className="font-semibold">Go to Community</div>
                  <div className="text-xs text-gray-400">Start earning now!</div>
                </button>
              </div>
            </div>

            {/* Discount Progress */}
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
              <h3 className="text-xl font-bold mb-4">Subscription Discount Progress</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span>This month's earnings</span>
                  <span className="font-bold">{userProfile.monthlyEarnings} coins</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-3">
                  <div 
                    className="bg-gradient-to-r from-green-500 to-green-600 h-3 rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(100, (userProfile.monthlyEarnings / 500) * 100)}%` }}
                  />
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-400">${userProfile.discountEarned}</div>
                  <div className="text-sm text-gray-400">earned towards next month's subscription</div>
                  <div className="text-xs text-gray-500 mt-1">
                    100 coins = $3 discount • Maximum $15/month
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'transactions' && (
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
            <h3 className="text-xl font-bold mb-6">Recent Transactions</h3>
            <div className="space-y-3">
              {transactions.slice(0, 20).map(tx => (
                <div key={tx.id} className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      tx.type === 'earn' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                    }`}>
                      {tx.type === 'earn' ? '+' : '-'}
                    </div>
                    <div>
                      <div className="font-semibold">{tx.reason}</div>
                      <div className="text-xs text-gray-400">
                        {tx.timestamp.toLocaleDateString()} • {tx.category}
                        {tx.rating && ` • ${tx.rating} stars`}
                      </div>
                    </div>
                  </div>
                  <div className={`font-bold ${
                    tx.type === 'earn' ? 'text-green-400' : 'text-red-400'
                  }`}>
                    {tx.type === 'earn' ? '+' : '-'}{tx.amount}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'actions' && (
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
            <h3 className="text-xl font-bold mb-6">All Coin Actions</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {coinManager.getCoinActions().map(action => (
                <div key={action.id} className="p-4 bg-white/5 rounded-lg border border-white/10">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{action.icon}</span>
                      <div>
                        <div className="font-semibold">{action.name}</div>
                        <div className="text-sm text-gray-400">{action.description}</div>
                      </div>
                    </div>
                    <div className={`font-bold text-lg ${
                      action.type === 'earn' ? 'text-green-400' : 'text-red-400'
                    }`}>
                      {action.type === 'earn' ? '+' : '-'}{action.amount}
                    </div>
                  </div>
                  {action.conditions && (
                    <div className="text-xs text-gray-500 mt-2">
                      Conditions: {action.conditions.join(', ')}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'leaderboard' && (
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
            <h3 className="text-xl font-bold mb-6">Monthly Earnings Leaderboard</h3>
            <div className="space-y-3">
              {leaderboard.map((user, index) => (
                <div key={user.userId} className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                      index === 0 ? 'bg-yellow-500 text-black' :
                      index === 1 ? 'bg-gray-400 text-black' :
                      index === 2 ? 'bg-orange-600 text-white' :
                      'bg-gray-600 text-white'
                    }`}>
                      {index + 1}
                    </div>
                    <div>
                      <div className="font-semibold">{user.username}</div>
                      <div className="text-sm text-gray-400">
                        Level {user.level} • {user.streak} day streak
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-green-400">{user.monthlyEarnings} coins</div>
                    <div className="text-xs text-gray-400">${user.discountEarned} discount</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CoinEconomyDashboard;