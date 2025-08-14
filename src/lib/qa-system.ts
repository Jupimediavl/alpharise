// /lib/qa-system.ts
// Live Q&A System with Real Data Management

export interface Answer {
  id: string;
  questionId: string;
  authorId: string;
  authorName: string;
  content: string;
  rating: number; // 1-5 stars
  ratedBy: string[]; // User IDs who rated
  coinEarnings: number;
  isBestAnswer: boolean;
  isHelpful: boolean;
  timestamp: Date;
  votes: number;
  votedBy: string[];
}

export interface Question {
  id: string;
  title: string;
  body: string;
  authorId: string;
  authorName: string;
  category: string;
  questionType: 'regular' | 'urgent' | 'private' | 'vip';
  coinCost: number;
  coinBounty: number;
  tags: string[];
  timestamp: Date;
  lastActivity: Date;
  views: number;
  answers: Answer[];
  isAnswered: boolean;
  isSolved: boolean;
  bestAnswerId?: string;
  urgentDeadline?: Date;
  isPrivate: boolean;
  allowedResponders?: string[]; // For private questions
}

export interface QAStats {
  totalQuestions: number;
  totalAnswers: number;
  solvedQuestions: number;
  avgResponseTime: number; // in minutes
  topContributors: { userId: string; userName: string; points: number }[];
  categoryStats: { [category: string]: number };
  coinsDistributed: number;
}

export class LiveQAManager {
  private questions: Map<string, Question> = new Map();
  private answers: Map<string, Answer> = new Map();
  private userStats: Map<string, any> = new Map();

  constructor() {
    this.initializeMockData();
  }

  private initializeMockData() {
    // Create some initial questions for demo
    const mockQuestions: Question[] = [
      {
        id: 'q1',
        title: "I finish in under 2 minutes - need practical solutions",
        body: "I've tried breathing techniques but nothing seems to work. My girlfriend is understanding but I can see she's frustrated. What actually works? I'm willing to put in the work but need real techniques that have worked for other guys.",
        authorId: 'user_struggling',
        authorName: 'StrugglingGuy_25',
        category: 'premature-ejaculation',
        questionType: 'urgent',
        coinCost: 5,
        coinBounty: 3,
        tags: ['performance', 'techniques', 'relationship'],
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
        lastActivity: new Date(Date.now() - 30 * 60 * 1000), // 30 min ago
        views: 47,
        answers: [],
        isAnswered: true,
        isSolved: true,
        urgentDeadline: new Date(Date.now() + 4 * 60 * 60 * 1000), // 4 hours from now
        isPrivate: false
      },
      {
        id: 'q2',
        title: "How do I approach women without my heart racing?",
        body: "Every time I see an attractive woman I want to talk to, my heart starts pounding and I freeze up. This happens even in normal social situations. How do you guys overcome this approach anxiety?",
        authorId: 'user_nervous',
        authorName: 'NervousNate',
        category: 'approach-anxiety',
        questionType: 'regular',
        coinCost: 2,
        coinBounty: 0,
        tags: ['anxiety', 'confidence', 'social'],
        timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
        lastActivity: new Date(Date.now() - 1 * 60 * 60 * 1000), // 1 hour ago
        views: 32,
        answers: [],
        isAnswered: true,
        isSolved: false,
        isPrivate: false
      },
      {
        id: 'q3',
        title: "Complete virgin at 24 - where do I even start?",
        body: "Never been with a woman. I'm embarrassed and don't know the basics. How do I gain experience without making it obvious I'm inexperienced? Should I tell her or pretend I know what I'm doing?",
        authorId: 'user_latestarter',
        authorName: 'LateStarter_24',
        category: 'first-time',
        questionType: 'private',
        coinCost: 8,
        coinBounty: 5,
        tags: ['virgin', 'experience', 'confidence'],
        timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 hours ago
        lastActivity: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
        views: 18,
        answers: [],
        isAnswered: false,
        isSolved: false,
        isPrivate: true,
        allowedResponders: ['expert_1', 'expert_2', 'coach_1']
      }
    ];

    // Create mock answers
    const mockAnswers: Answer[] = [
      {
        id: 'a1',
        questionId: 'q1',
        authorId: 'expert_coach',
        authorName: 'Coach_Rodriguez',
        content: "Bro, I've been there. The stop-start technique combined with kegel exercises changed my life completely. Start with 3-second holds and build up to 10 seconds. Also, practice deep breathing - 4 counts in, 7 hold, 8 out. This isn't just about lasting longer, it's about being present with her. The mental game is 70% of it. You got this! 💪",
        rating: 5,
        ratedBy: ['user_struggling'],
        coinEarnings: 12,
        isBestAnswer: true,
        isHelpful: true,
        timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000),
        votes: 8,
        votedBy: ['user_1', 'user_2', 'user_3']
      },
      {
        id: 'a2',
        questionId: 'q2',
        authorName: 'AnxietySlayer_K',
        authorId: 'expert_anxiety',
        content: "I totally get that feeling man. Start with low-stakes interactions - ask for directions, compliment something non-physical. Build your comfort level gradually. I used to have panic attacks just talking to cashiers. Now I can approach anyone confidently. The key is exposure therapy - start small and work your way up.",
        rating: 4,
        ratedBy: ['user_nervous'],
        coinEarnings: 8,
        isBestAnswer: true,
        isHelpful: true,
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
        votes: 6,
        votedBy: ['user_4', 'user_5']
      }
    ];

    // Initialize data
    mockQuestions.forEach(q => {
      this.questions.set(q.id, q);
    });

    mockAnswers.forEach(a => {
      this.answers.set(a.id, a);
      // Add answers to questions
      const question = this.questions.get(a.questionId);
      if (question) {
        question.answers.push(a);
        if (a.isBestAnswer) {
          question.bestAnswerId = a.id;
        }
      }
    });
  }

  // Question Management
  createQuestion(questionData: {
    title: string;
    body: string;
    authorId: string;
    authorName: string;
    category: string;
    questionType: 'regular' | 'urgent' | 'private' | 'vip';
    coinBounty?: number;
    tags?: string[];
  }): Question {
    const questionCosts = {
      regular: 2,
      urgent: 5,
      private: 8,
      vip: 15
    };

    const newQuestion: Question = {
      id: `q_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      title: questionData.title,
      body: questionData.body,
      authorId: questionData.authorId,
      authorName: questionData.authorName,
      category: questionData.category,
      questionType: questionData.questionType,
      coinCost: questionCosts[questionData.questionType],
      coinBounty: questionData.coinBounty || 0,
      tags: questionData.tags || [],
      timestamp: new Date(),
      lastActivity: new Date(),
      views: 0,
      answers: [],
      isAnswered: false,
      isSolved: false,
      isPrivate: questionData.questionType === 'private',
      urgentDeadline: questionData.questionType === 'urgent' 
        ? new Date(Date.now() + 6 * 60 * 60 * 1000) // 6 hours from now
        : undefined
    };

    this.questions.set(newQuestion.id, newQuestion);
    return newQuestion;
  }

  getQuestions(filters?: {
    category?: string;
    questionType?: string;
    isAnswered?: boolean;
    authorId?: string;
    limit?: number;
    sortBy?: 'newest' | 'oldest' | 'popular' | 'urgent';
  }): Question[] {
    let questions = Array.from(this.questions.values());

    // Apply filters
    if (filters) {
      if (filters.category && filters.category !== 'all') {
        questions = questions.filter(q => q.category === filters.category);
      }
      if (filters.questionType) {
        questions = questions.filter(q => q.questionType === filters.questionType);
      }
      if (filters.isAnswered !== undefined) {
        questions = questions.filter(q => q.isAnswered === filters.isAnswered);
      }
      if (filters.authorId) {
        questions = questions.filter(q => q.authorId === filters.authorId);
      }

      // Apply sorting
      switch (filters.sortBy) {
        case 'newest':
          questions.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
          break;
        case 'oldest':
          questions.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
          break;
        case 'popular':
          questions.sort((a, b) => (b.views + b.answers.length * 2) - (a.views + a.answers.length * 2));
          break;
        case 'urgent':
          questions.sort((a, b) => {
            if (a.questionType === 'urgent' && b.questionType !== 'urgent') return -1;
            if (b.questionType === 'urgent' && a.questionType !== 'urgent') return 1;
            return b.timestamp.getTime() - a.timestamp.getTime();
          });
          break;
        default:
          questions.sort((a, b) => b.lastActivity.getTime() - a.lastActivity.getTime());
      }

      if (filters.limit) {
        questions = questions.slice(0, filters.limit);
      }
    }

    return questions;
  }

  getQuestion(questionId: string): Question | undefined {
    const question = this.questions.get(questionId);
    if (question) {
      // Increment view count
      question.views += 1;
      this.questions.set(questionId, question);
    }
    return question;
  }

  // Answer Management
  createAnswer(answerData: {
    questionId: string;
    authorId: string;
    authorName: string;
    content: string;
  }): Answer | null {
    const question = this.questions.get(answerData.questionId);
    if (!question) return null;

    const newAnswer: Answer = {
      id: `a_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      questionId: answerData.questionId,
      authorId: answerData.authorId,
      authorName: answerData.authorName,
      content: answerData.content,
      rating: 0,
      ratedBy: [],
      coinEarnings: 0,
      isBestAnswer: false,
      isHelpful: false,
      timestamp: new Date(),
      votes: 0,
      votedBy: []
    };

    this.answers.set(newAnswer.id, newAnswer);
    
    // Add to question
    question.answers.push(newAnswer);
    question.isAnswered = true;
    question.lastActivity = new Date();
    this.questions.set(question.id, question);

    return newAnswer;
  }

  rateAnswer(answerId: string, rating: number, ratedBy: string): { coinEarnings: number; newRating: number } {
    const answer = this.answers.get(answerId);
    if (!answer || answer.ratedBy.includes(ratedBy)) {
      return { coinEarnings: 0, newRating: answer?.rating || 0 };
    }

    // Add rating
    answer.ratedBy.push(ratedBy);
    const totalRatings = answer.ratedBy.length;
    answer.rating = ((answer.rating * (totalRatings - 1)) + rating) / totalRatings;

    // Calculate coin earnings based on rating
    let coinEarnings = 3; // Base earning

    if (answer.rating >= 4) {
      coinEarnings = 5; // Good answer
    }
    if (answer.rating >= 4.5) {
      coinEarnings = 8; // Great answer
    }
    if (answer.rating === 5) {
      coinEarnings = 12; // Perfect answer
    }

    // Weekend bonus
    const isWeekend = [0, 6].includes(new Date().getDay());
    if (isWeekend) {
      coinEarnings *= 2;
    }

    answer.coinEarnings = coinEarnings;
    answer.isHelpful = answer.rating >= 4;

    this.answers.set(answerId, answer);

    // Update question
    const question = this.questions.get(answer.questionId);
    if (question) {
      question.lastActivity = new Date();
      // Update answer in question
      const answerIndex = question.answers.findIndex(a => a.id === answerId);
      if (answerIndex !== -1) {
        question.answers[answerIndex] = answer;
      }
      this.questions.set(question.id, question);
    }

    return { coinEarnings, newRating: answer.rating };
  }

  markBestAnswer(questionId: string, answerId: string, markedBy: string): boolean {
    const question = this.questions.get(questionId);
    const answer = this.answers.get(answerId);

    if (!question || !answer || question.authorId !== markedBy) {
      return false;
    }

    // Remove previous best answer
    if (question.bestAnswerId) {
      const prevBestAnswer = this.answers.get(question.bestAnswerId);
      if (prevBestAnswer) {
        prevBestAnswer.isBestAnswer = false;
        this.answers.set(prevBestAnswer.id, prevBestAnswer);
      }
    }

    // Set new best answer
    answer.isBestAnswer = true;
    answer.coinEarnings += 5; // Bonus for best answer
    question.bestAnswerId = answerId;
    question.isSolved = true;
    question.lastActivity = new Date();

    this.answers.set(answerId, answer);
    this.questions.set(questionId, question);

    return true;
  }

  voteAnswer(answerId: string, userId: string): boolean {
    const answer = this.answers.get(answerId);
    if (!answer || answer.votedBy.includes(userId)) {
      return false;
    }

    answer.votes += 1;
    answer.votedBy.push(userId);
    this.answers.set(answerId, answer);

    return true;
  }

  // Search and Filter
  searchQuestions(query: string, category?: string): Question[] {
    const questions = this.getQuestions({ category });
    const searchTerms = query.toLowerCase().split(' ');

    return questions.filter(question => {
      const searchableText = (
        question.title + ' ' + 
        question.body + ' ' + 
        question.tags.join(' ')
      ).toLowerCase();

      return searchTerms.every(term => searchableText.includes(term));
    });
  }

  // Statistics
  getStats(): QAStats {
    const questions = Array.from(this.questions.values());
    const answers = Array.from(this.answers.values());

    const categoryStats: { [key: string]: number } = {};
    questions.forEach(q => {
      categoryStats[q.category] = (categoryStats[q.category] || 0) + 1;
    });

    const userContributions: { [key: string]: { name: string; points: number } } = {};
    answers.forEach(a => {
      if (!userContributions[a.authorId]) {
        userContributions[a.authorId] = { name: a.authorName, points: 0 };
      }
      userContributions[a.authorId].points += a.coinEarnings;
    });

    const topContributors = Object.entries(userContributions)
      .map(([userId, data]) => ({ userId, userName: data.name, points: data.points }))
      .sort((a, b) => b.points - a.points)
      .slice(0, 10);

    const avgResponseTime = questions.length > 0 
      ? questions.reduce((sum, q) => {
          if (q.answers.length > 0) {
            const firstAnswer = q.answers.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime())[0];
            return sum + (firstAnswer.timestamp.getTime() - q.timestamp.getTime()) / (1000 * 60); // minutes
          }
          return sum;
        }, 0) / questions.filter(q => q.answers.length > 0).length
      : 0;

    return {
      totalQuestions: questions.length,
      totalAnswers: answers.length,
      solvedQuestions: questions.filter(q => q.isSolved).length,
      avgResponseTime: Math.round(avgResponseTime),
      topContributors,
      categoryStats,
      coinsDistributed: answers.reduce((sum, a) => sum + a.coinEarnings, 0)
    };
  }

  // Urgent Questions Management
  getUrgentQuestions(): Question[] {
    return this.getQuestions({ questionType: 'urgent' })
      .filter(q => q.urgentDeadline && q.urgentDeadline > new Date() && !q.isAnswered);
  }

  getExpiredUrgentQuestions(): Question[] {
    return this.getQuestions({ questionType: 'urgent' })
      .filter(q => q.urgentDeadline && q.urgentDeadline <= new Date() && !q.isAnswered);
  }

  // User-specific methods
  getUserQuestions(userId: string): Question[] {
    return this.getQuestions({ authorId: userId });
  }

  getUserAnswers(userId: string): Answer[] {
    return Array.from(this.answers.values()).filter(a => a.authorId === userId);
  }

  getUserStats(userId: string) {
    const questions = this.getUserQuestions(userId);
    const answers = this.getUserAnswers(userId);

    return {
      questionsAsked: questions.length,
      answersGiven: answers.length,
      bestAnswers: answers.filter(a => a.isBestAnswer).length,
      totalCoinsEarned: answers.reduce((sum, a) => sum + a.coinEarnings, 0),
      totalCoinsSpent: questions.reduce((sum, q) => sum + q.coinCost + q.coinBounty, 0),
      avgRating: answers.length > 0 
        ? answers.reduce((sum, a) => sum + a.rating, 0) / answers.length 
        : 0,
      helpfulAnswers: answers.filter(a => a.isHelpful).length
    };
  }
}

// Create singleton instance
export const liveQAManager = new LiveQAManager();

// Helper functions for easy integration
export const qaHelpers = {
  askQuestion: (questionData: any) => liveQAManager.createQuestion(questionData),
  answerQuestion: (answerData: any) => liveQAManager.createAnswer(answerData),
  getQuestions: (filters?: any) => liveQAManager.getQuestions(filters),
  getQuestion: (id: string) => liveQAManager.getQuestion(id),
  rateAnswer: (answerId: string, rating: number, userId: string) => liveQAManager.rateAnswer(answerId, rating, userId),
  markBestAnswer: (questionId: string, answerId: string, userId: string) => liveQAManager.markBestAnswer(questionId, answerId, userId),
  searchQuestions: (query: string, category?: string) => liveQAManager.searchQuestions(query, category),
  getStats: () => liveQAManager.getStats(),
  getUserStats: (userId: string) => liveQAManager.getUserStats(userId)
};