// /lib/simple-coin-system.ts
// AlphaRise Simple Coin Economy System

export interface CoinTransaction {
  id: string;
  userId: string;
  type: 'earn' | 'spend';
  amount: number;
  reason: string;
  category: 'question' | 'answer' | 'daily' | 'helpful_votes' | 'best_answer';
  timestamp: Date;
  questionId?: string;
  answerId?: string;
}

export interface UserCoinProfile {
  userId: string;
  username: string;
  currentBalance: number;
  totalEarned: number;
  totalSpent: number;
  subscriptionType: 'trial' | 'premium';
  streak: number;
  lastActivity: Date;
  monthlyEarnings: number;
}

export interface AnswerVoteData {
  answerId: string;
  authorId: string;
  totalVotes: number;
  voterIds: string[];
  coinsEarned: number;
  isBestAnswer: boolean;
}

// Simple Coin Economy Manager
export class SimpleCoinEconomyManager {
  private transactions: CoinTransaction[] = [];
  public userProfiles: Map<string, UserCoinProfile> = new Map();
  public answerVotes: Map<string, AnswerVoteData> = new Map();

  constructor() {
    this.initializeMockData();
  }

  private initializeMockData() {
    // Create mock user profiles
    const mockUsers = [
      { userId: 'testuser1', username: 'testuser1', subscriptionType: 'trial' as const },
      { userId: 'coach_rodriguez', username: 'coach_rodriguez', subscriptionType: 'premium' as const },
      { userId: 'expert_dan', username: 'expert_dan', subscriptionType: 'premium' as const },
      { userId: 'anxiety_slayer', username: 'anxiety_slayer', subscriptionType: 'premium' as const },
    ];

    mockUsers.forEach(user => {
      const profile: UserCoinProfile = {
        userId: user.userId,
        username: user.username,
        currentBalance: Math.floor(Math.random() * 100) + 50,
        totalEarned: Math.floor(Math.random() * 200) + 50,
        totalSpent: Math.floor(Math.random() * 100) + 20,
        subscriptionType: user.subscriptionType,
        streak: Math.floor(Math.random() * 10) + 1,
        lastActivity: new Date(),
        monthlyEarnings: Math.floor(Math.random() * 50) + 10,
      };
      this.userProfiles.set(user.userId, profile);
    });
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

  // CORE FEATURES

  // 1. Daily Login (1 coin)
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

    return this.addTransaction({
      userId,
      type: 'earn',
      amount: 1,
      reason: 'Daily login reward',
      category: 'daily',
    });
  }

  // 2. Answer Posted (1 coin basic reward)
  answerPosted(userId: string, questionId: string, answerId: string): CoinTransaction {
    // Initialize answer vote data
    this.answerVotes.set(answerId, {
      answerId,
      authorId: userId,
      totalVotes: 0,
      voterIds: [],
      coinsEarned: 0,
      isBestAnswer: false
    });

    return this.addTransaction({
      userId,
      type: 'earn',
      amount: 1,
      reason: 'Answer posted - basic reward',
      category: 'answer',
      questionId,
      answerId,
    });
  }

  // 3. Helpful Vote System (1 coin from 5th vote onwards)
  voteAnswerHelpful(voterId: string, answerId: string, questionAuthorId?: string): { success: boolean; coinsEarned: number; message: string } {
    const answerData = this.answerVotes.get(answerId);
    if (!answerData) {
      return { success: false, coinsEarned: 0, message: 'Answer not found' };
    }

    // Anti-fraud: Can't vote for own answer
    if (answerData.authorId === voterId) {
      return { success: false, coinsEarned: 0, message: 'Cannot vote for your own answer' };
    }

    // Anti-fraud: Can't vote for clarifications (answer author = question author)
    if (questionAuthorId && answerData.authorId === questionAuthorId) {
      return { success: false, coinsEarned: 0, message: 'Cannot vote for author clarifications' };
    }

    // Anti-fraud: Can't vote twice
    if (answerData.voterIds.includes(voterId)) {
      return { success: false, coinsEarned: 0, message: 'Already voted for this answer' };
    }

    // Add vote
    answerData.voterIds.push(voterId);
    answerData.totalVotes += 1;

    // Coin reward: 1 coin from 5th vote onwards
    let coinsEarned = 0;
    if (answerData.totalVotes >= 5) {
      coinsEarned = 1;
      answerData.coinsEarned += 1;

      this.addTransaction({
        userId: answerData.authorId,
        type: 'earn',
        amount: 1,
        reason: `Helpful vote #${answerData.totalVotes} on answer`,
        category: 'helpful_votes',
        answerId,
      });
    }

    // Auto Best Answer at 7+ votes
    if (answerData.totalVotes >= 7 && !answerData.isBestAnswer) {
      answerData.isBestAnswer = true;
      
      const bestAnswerBonus = this.addTransaction({
        userId: answerData.authorId,
        type: 'earn',
        amount: 5,
        reason: 'Auto Best Answer (7+ helpful votes)',
        category: 'best_answer',
        answerId,
      });

      coinsEarned += 5;
    }

    this.answerVotes.set(answerId, answerData);

    return { 
      success: true, 
      coinsEarned, 
      message: `Vote recorded! ${coinsEarned > 0 ? `Author earned ${coinsEarned} coins.` : `${5 - answerData.totalVotes} more votes needed for coin rewards.`}`
    };
  }

  // 4. Question Posting (costs coins)
  askQuestion(userId: string, questionType: string = 'regular'): { success: boolean; transaction?: CoinTransaction; message: string } {
    const profile = this.getUserProfile(userId);
    if (!profile) {
      return { success: false, message: 'User not found' };
    }

    const costs = {
      'regular': 2,
      'urgent': 5,
    };

    const cost = costs[questionType as keyof typeof costs] || 2;

    if (profile.currentBalance < cost) {
      return { 
        success: false, 
        message: `Insufficient coins! Need ${cost}, have ${profile.currentBalance}. Answer questions to earn more.`
      };
    }

    const transaction = this.addTransaction({
      userId,
      type: 'spend',
      amount: cost,
      reason: `Asked ${questionType} question`,
      category: 'question',
    });

    return { 
      success: true, 
      transaction, 
      message: `Question posted! Cost: ${cost} coins.`
    };
  }

  // Get answer vote data
  getAnswerVoteData(answerId: string): AnswerVoteData | undefined {
    return this.answerVotes.get(answerId);
  }

  // Check if user can vote for answer
  canVoteForAnswer(userId: string, answerId: string): boolean {
    const answerData = this.answerVotes.get(answerId);
    if (!answerData) return false;
    
    // Can't vote for own answer
    if (answerData.authorId === userId) return false;
    
    // Can't vote twice
    if (answerData.voterIds.includes(userId)) return false;
    
    return true;
  }

  // Utility Methods
  canAfford(userId: string, amount: number): boolean {
    const profile = this.getUserProfile(userId);
    return profile ? profile.currentBalance >= amount : false;
  }

  getQuestionCost(questionType: string): number {
    const costs = { 'regular': 2, 'urgent': 5 };
    return costs[questionType as keyof typeof costs] || 2;
  }

  // Statistics
  getUserStats(userId: string) {
    const profile = this.getUserProfile(userId);
    const transactions = this.getUserTransactions(userId, 100);

    if (!profile) return null;

    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const weeklyTransactions = transactions.filter(tx => tx.timestamp > weekAgo);

    // Count answers authored by user
    const authoredAnswers = Array.from(this.answerVotes.values())
      .filter(answer => answer.authorId === userId);

    const totalVotesReceived = authoredAnswers.reduce((sum, answer) => sum + answer.totalVotes, 0);
    const bestAnswersCount = authoredAnswers.filter(answer => answer.isBestAnswer).length;

    return {
      profile,
      weekly: {
        earned: weeklyTransactions.filter(tx => tx.type === 'earn').reduce((sum, tx) => sum + tx.amount, 0),
        spent: weeklyTransactions.filter(tx => tx.type === 'spend').reduce((sum, tx) => sum + tx.amount, 0),
        transactions: weeklyTransactions.length,
      },
      community: {
        answersGiven: authoredAnswers.length,
        totalVotesReceived,
        bestAnswersCount,
        helpfulnessRatio: authoredAnswers.length > 0 ? (totalVotesReceived / authoredAnswers.length) : 0
      }
    };
  }

  // Get leaderboard
  getLeaderboard(): UserCoinProfile[] {
    return Array.from(this.userProfiles.values())
      .sort((a, b) => b.monthlyEarnings - a.monthlyEarnings)
      .slice(0, 10);
  }
}

// Create singleton instance
export const simpleCoinManager = new SimpleCoinEconomyManager();

// Helper functions for easy integration
export const simpleCoinHelpers = {
  getUserCoins: (userId: string) => simpleCoinManager.getUserProfile(userId)?.currentBalance || 0,
  
  canAffordQuestion: (userId: string, questionType: string = 'regular') => {
    const cost = simpleCoinManager.getQuestionCost(questionType);
    return simpleCoinManager.canAfford(userId, cost);
  },
  
  askQuestion: (userId: string, questionType: string = 'regular') => {
    return simpleCoinManager.askQuestion(userId, questionType);
  },
  
  answerPosted: (userId: string, questionId: string, answerId: string) => {
    return simpleCoinManager.answerPosted(userId, questionId, answerId);
  },
  
  voteHelpful: (voterId: string, answerId: string, questionAuthorId?: string) => {
    return simpleCoinManager.voteAnswerHelpful(voterId, answerId, questionAuthorId);
  },
  
  canVote: (userId: string, answerId: string) => {
    return simpleCoinManager.canVoteForAnswer(userId, answerId);
  },
  
  getAnswerData: (answerId: string) => {
    return simpleCoinManager.getAnswerVoteData(answerId);
  },
  
  dailyLogin: (userId: string) => simpleCoinManager.dailyLogin(userId),
  
  getUserStats: (userId: string) => simpleCoinManager.getUserStats(userId),
  
  getLeaderboard: () => simpleCoinManager.getLeaderboard(),
};

// Summary of the Simple System:
/*
🪙 EARNING COINS:
1. Daily login = 1 coin
2. Answer posted = 1 coin 
3. Helpful votes = 1 coin per vote (starting from 5th vote)
4. Auto Best Answer = 5 coins bonus (at 7+ votes)

💸 SPENDING COINS:
1. Regular question = 2 coins
2. Urgent question = 5 coins (6h response guarantee)

🛡️ ANTI-FRAUD:
- Can't vote for own answers
- Can't vote twice for same answer
- Need 5+ votes before coins start flowing
- Best Answer automatic at 7+ votes

📊 NO CASH CONVERSION (for now):
- Focus on engagement and community building
- Real value through better answers and community participation
*/