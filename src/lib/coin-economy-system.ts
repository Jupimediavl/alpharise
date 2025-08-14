// /lib/coin-economy-system.ts
// AlphaRise Coin Economy System - Business Logic Only

export interface CoinTransaction {
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

export interface UserCoinProfile {
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

export interface CoinAction {
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
export class CoinEconomyManager {
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

  // Utility Methods
  canAfford(userId: string, amount: number): boolean {
    const profile = this.getUserProfile(userId);
    return profile ? profile.currentBalance >= amount : false;
  }

  getQuestionCost(questionType: string): number {
    const costs = {
      'regular': 2,
      'urgent': 5,
      'private': 8,
      'vip': 15,
      'boost': 3,
    };
    return costs[questionType as keyof typeof costs] || 2;
  }

  calculateAnswerReward(rating: number, isBestAnswer: boolean = false): number {
    let amount = 3; // Base reward

    if (rating >= 4) amount = 5;
    if (isBestAnswer) amount += 3;
    if (rating === 5) amount += 2;

    // Weekend bonus
    const isWeekend = [0, 6].includes(new Date().getDay());
    if (isWeekend) amount *= 2;

    return amount;
  }

  // Statistics
  getUserStats(userId: string) {
    const profile = this.getUserProfile(userId);
    const transactions = this.getUserTransactions(userId, 100);

    if (!profile) return null;

    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const weeklyTransactions = transactions.filter(tx => tx.timestamp > weekAgo);

    return {
      profile,
      weekly: {
        earned: weeklyTransactions.filter(tx => tx.type === 'earn').reduce((sum, tx) => sum + tx.amount, 0),
        spent: weeklyTransactions.filter(tx => tx.type === 'spend').reduce((sum, tx) => sum + tx.amount, 0),
        transactions: weeklyTransactions.length,
      },
      monthly: {
        earned: profile.monthlyEarnings,
        discountProgress: profile.discountEarned,
        nextDiscountAt: Math.ceil(((Math.floor(profile.monthlyEarnings / 100) + 1) * 100)),
      }
    };
  }
}

// Create singleton instance
export const coinEconomyManager = new CoinEconomyManager();

// Helper functions for easy integration
export const coinHelpers = {
  getUserCoins: (userId: string) => coinEconomyManager.getUserProfile(userId)?.currentBalance || 0,
  canAffordQuestion: (userId: string, questionType: string = 'regular') => {
    const cost = coinEconomyManager.getQuestionCost(questionType);
    return coinEconomyManager.canAfford(userId, cost);
  },
  askQuestion: (userId: string, questionType: string = 'regular') => {
    return coinEconomyManager.askQuestion(userId, questionType);
  },
  rewardAnswer: (userId: string, questionId: string, rating: number, isBestAnswer?: boolean) => {
    return coinEconomyManager.rewardAnswer(userId, questionId, rating, isBestAnswer);
  },
  dailyLogin: (userId: string) => coinEconomyManager.dailyLogin(userId),
  getUserStats: (userId: string) => coinEconomyManager.getUserStats(userId),
};