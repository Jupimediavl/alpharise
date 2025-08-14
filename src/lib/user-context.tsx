// /lib/user-context.tsx
// AlphaRise Global User Context for data flow between pages

'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

// User Data Interface
export interface AlphaRiseUser {
  avatarType: 'marcus' | 'jake' | 'alex' | 'ryan' | 'ethan';
  userName: string;
  userEmail: string;
  coins: number;
  streak: number;
  level: number;
  totalEarned: number;
  monthlyEarnings: number;
  discountEarned: number;
  subscriptionType: 'trial' | 'premium';
  joinDate: Date;
  lastActive: Date;
  trialDaysLeft: number;
  badges: string[];
  confidenceScore: number;
  experience: number;
}

// Avatar Data
export const avatarData = {
  marcus: {
    name: 'Marcus',
    fullName: 'Marcus "The Overthinker"',
    icon: '🧠',
    color: 'from-blue-500 to-purple-600',
    communityName: 'Overthinker\'s Circle',
    todayChallenge: 'Make one decision in under 10 seconds',
    quickTip: 'The 3-Second Rule: Count 3-2-1 and ACT before your mind sabotages you'
  },
  jake: {
    name: 'Jake',
    fullName: 'Jake "The Performer"',
    icon: '⚡',
    color: 'from-yellow-500 to-orange-600',
    communityName: 'Performance Squad',
    todayChallenge: 'Practice confident posture for 5 minutes',
    quickTip: 'Champion\'s Breathing: 4 counts in, 7 hold, 8 out - instant confidence'
  },
  alex: {
    name: 'Alex',
    fullName: 'Alex "The Student"',
    icon: '📚',
    color: 'from-green-500 to-emerald-600',
    communityName: 'Learning Brotherhood',
    todayChallenge: 'Ask one question in the community',
    quickTip: 'Knowledge builds confidence: Every expert was once a beginner'
  },
  ryan: {
    name: 'Ryan',
    fullName: 'Ryan "The Rising King"',
    icon: '💎',
    color: 'from-purple-500 to-pink-600',
    communityName: 'Rising Kings Court',
    todayChallenge: 'Approach one new person today',
    quickTip: 'King\'s Posture: Shoulders back, chest out, chin up - instant authority'
  },
  ethan: {
    name: 'Ethan',
    fullName: 'Ethan "The Connection Master"',
    icon: '❤️',
    color: 'from-red-500 to-rose-600',
    communityName: 'Connection Masters',
    todayChallenge: 'Have one meaningful conversation',
    quickTip: 'Heart-to-Heart: Ask "How are you feeling?" instead of "How are you?"'
  }
};

// Navigation Functions
export interface NavigationHelpers {
  goToLanding: () => void;
  goToAssessment: () => void;
  goToResults: (avatarType: string) => void;
  goToSignup: (avatarType: string) => void;
  goToDashboard: () => void;
  goToCommunity: () => void;
  goToCoins: () => void;
  goToAdmin: () => void;
  updateUserData: (updates: Partial<AlphaRiseUser>) => void;
}

// Context Interface
interface UserContextType {
  user: AlphaRiseUser | null;
  avatar: typeof avatarData.marcus | null;
  navigation: NavigationHelpers;
  isLoading: boolean;
  updateUser: (updates: Partial<AlphaRiseUser>) => void;
  initializeUser: (userData: Partial<AlphaRiseUser>) => void;
}

// Create Context
const UserContext = createContext<UserContextType | undefined>(undefined);

// Default User Data
const createDefaultUser = (overrides: Partial<AlphaRiseUser> = {}): AlphaRiseUser => ({
  avatarType: 'marcus',
  userName: '', // Empty by default, will be set during signup
  userEmail: '',
  coins: 200,
  streak: 1,
  level: 1,
  totalEarned: 0,
  monthlyEarnings: 0,
  discountEarned: 0,
  subscriptionType: 'trial',
  joinDate: new Date(),
  lastActive: new Date(),
  trialDaysLeft: 7,
  badges: [],
  confidenceScore: 34,
  experience: 150,
  ...overrides
});

// User Context Provider
export const UserProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const router = useRouter();
  const [user, setUser] = useState<AlphaRiseUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize user from URL params or localStorage
  useEffect(() => {
    const initializeFromStorage = () => {
      try {
        const stored = localStorage.getItem('alpharise_user');
        if (stored) {
          const userData = JSON.parse(stored);
          setUser({
            ...createDefaultUser(),
            ...userData,
            joinDate: new Date(userData.joinDate),
            lastActive: new Date(userData.lastActive)
          });
        }
      } catch (error) {
        console.error('Error loading user data:', error);
      }
    };

    const initializeFromURL = () => {
      if (typeof window !== 'undefined') {
        const urlParams = new URLSearchParams(window.location.search);
        const avatar = urlParams.get('avatar') as AlphaRiseUser['avatarType'];
        const name = urlParams.get('name') || urlParams.get('username'); 
        const email = urlParams.get('email');
        const trial = urlParams.get('trial') === 'true';

        console.log('UserContext - Raw URL:', window.location.search);
        console.log('UserContext - URL params extracted:', { avatar, name, email, trial });
        console.log('UserContext - Name specifically:', name);

        if (avatar || name || email) {
          const userData: Partial<AlphaRiseUser> = {};
          if (avatar && avatar in avatarData) userData.avatarType = avatar;
          if (name) {
            userData.userName = decodeURIComponent(name);
            console.log('UserContext - Setting userName to:', userData.userName);
          }
          if (email) userData.userEmail = email;
          if (trial) userData.subscriptionType = 'trial';

          console.log('UserContext - Final userData:', userData);

          const newUser = {
            ...createDefaultUser(),
            ...userData
          };
          
          console.log('UserContext - Creating user with:', newUser);
          setUser(newUser);
          localStorage.setItem('alpharise_user', JSON.stringify(newUser));
        } else {
          console.log('UserContext - No URL params found, checking localStorage');
        }
      }
    };

    // Try URL first, then localStorage
    initializeFromURL();
    
    // Only use localStorage if no URL params were found
    if (typeof window !== 'undefined' && !window.location.search) {
      initializeFromStorage();
    }

    // If still no user, create default
    setTimeout(() => {
      if (!user) {
        console.log('UserContext - Creating default user');
        setUser(createDefaultUser());
      }
      setIsLoading(false);
    }, 100);
  }, []);

  // Save to localStorage whenever user changes
  useEffect(() => {
    if (user && !isLoading) {
      try {
        localStorage.setItem('alpharise_user', JSON.stringify(user));
      } catch (error) {
        console.error('Error saving user data:', error);
      }
    }
  }, [user, isLoading]);

  // Update user data
  const updateUser = (updates: Partial<AlphaRiseUser>) => {
    setUser(prevUser => {
      if (!prevUser) return createDefaultUser(updates);
      return {
        ...prevUser,
        ...updates,
        lastActive: new Date()
      };
    });
  };

  // Initialize user (for signup/onboarding)
  const initializeUser = (userData: Partial<AlphaRiseUser>) => {
    const newUser = createDefaultUser(userData);
    setUser(newUser);
    
    // Save immediately
    try {
      localStorage.setItem('alpharise_user', JSON.stringify(newUser));
    } catch (error) {
      console.error('Error saving new user:', error);
    }
  };

  // Navigation helpers with user data persistence
  const navigation: NavigationHelpers = {
    goToLanding: () => {
      router.push('/');
    },

    goToAssessment: () => {
      router.push('/assessment');
    },

    goToResults: (avatarType: string) => {
      const params = new URLSearchParams();
      params.set('avatar', avatarType);
      router.push(`/results?${params.toString()}`);
    },

    goToSignup: (avatarType: string) => {
      const params = new URLSearchParams();
      params.set('avatar', avatarType);
      router.push(`/signup?${params.toString()}`);
    },

    goToDashboard: () => {
      if (!user) {
        router.push('/assessment');
        return;
      }

      const params = new URLSearchParams();
      params.set('avatar', user.avatarType);
      params.set('name', encodeURIComponent(user.userName));
      if (user.userEmail) params.set('email', user.userEmail);
      if (user.subscriptionType === 'trial') params.set('trial', 'true');
      
      router.push(`/dashboard?${params.toString()}`);
    },

    goToCommunity: () => {
      if (!user) {
        router.push('/assessment');
        return;
      }

      const params = new URLSearchParams();
      params.set('avatar', user.avatarType);
      params.set('name', user.userName);
      
      router.push(`/community?${params.toString()}`);
    },

    goToCoins: () => {
      if (!user) {
        router.push('/assessment');
        return;
      }

      const params = new URLSearchParams();
      params.set('avatar', user.avatarType);
      params.set('name', user.userName);
      
      router.push(`/coins?${params.toString()}`);
    },

    goToAdmin: () => {
      router.push('/admin');
    },

    updateUserData: (updates: Partial<AlphaRiseUser>) => {
      updateUser(updates);
    }
  };

  // Get current avatar data
  const avatar = user ? avatarData[user.avatarType] : null;

  const contextValue: UserContextType = {
    user,
    avatar,
    navigation,
    isLoading,
    updateUser,
    initializeUser
  };

  return (
    <UserContext.Provider value={contextValue}>
      {children}
    </UserContext.Provider>
  );
};

// Hook to use user context
export const useAlphaRise = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useAlphaRise must be used within a UserProvider');
  }
  return context;
};

// Utility functions for easy imports
export const alphaRiseHelpers = {
  formatCoins: (coins: number) => coins.toLocaleString(),
  calculateLevel: (experience: number) => Math.floor(experience / 250) + 1,
  calculateDiscount: (monthlyEarnings: number) => Math.min(15, Math.floor(monthlyEarnings / 100) * 3),
  getTrialStatus: (user: AlphaRiseUser) => ({
    isTrialActive: user.subscriptionType === 'trial' && user.trialDaysLeft > 0,
    daysLeft: user.trialDaysLeft,
    shouldUpgrade: user.trialDaysLeft <= 3
  }),
  getAvatarColor: (avatarType: AlphaRiseUser['avatarType']) => avatarData[avatarType].color
};

// HOC for pages that require authentication
export const withUserAuth = <P extends object>(Component: React.ComponentType<P>) => {
  return function AuthenticatedComponent(props: P) {
    const { user, navigation, isLoading } = useAlphaRise();

    useEffect(() => {
      if (!isLoading && !user) {
        navigation.goToAssessment();
      }
    }, [user, isLoading, navigation]);

    if (isLoading) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white flex items-center justify-center">
          <div className="text-center">
            <div className="text-6xl mb-4">🚀</div>
            <h2 className="text-2xl font-bold">Loading AlphaRise...</h2>
          </div>
        </div>
      );
    }

    if (!user) {
      return null; // Will redirect
    }

    return <Component {...props} />;
  };
};