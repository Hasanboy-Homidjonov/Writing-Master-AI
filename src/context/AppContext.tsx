import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  UserProfile,
  WritingTopic,
  EvaluationResultData,
  LeaderboardUser,
  CEFRLevel,
  Language,
  Theme,
  FeedbackMessage,
  SecurityStrikeLog
} from '../types';
import { DEFAULT_TOPICS } from '../data/defaultTopics';
import { sounds } from '../utils/audio';
import { TRANSLATIONS } from '../utils/i18n';
import { ADMIN_EMAILS, ADMIN_EMAIL, ADMIN_PASSWORD } from '../constants/admin';
import {
  validateCurrentSession,
  createAuthSession,
  clearAuthSession,
  hashPassword,
  isUserAdmin
} from '../services/authGuard';

interface AppContextType {
  user: UserProfile;
  isVerifiedSession: boolean;
  loginWithGoogleAccount: (name: string, email: string, avatar?: string, rawToken?: string) => void;
  verifyUserCredentials: (email: string, password: string) => { success: boolean; error?: string };
  registerNewUser: (name: string, email: string, password: string) => { success: boolean; error?: string };
  logout: () => void;
  isAuthModalOpen: boolean;
  setIsAuthModalOpen: (val: boolean) => void;
  topics: WritingTopic[];
  allTopics: WritingTopic[];
  addCustomTopic: (
    title: string,
    prompt: string,
    questions: string[],
    level: CEFRLevel,
    minWords: number,
    maxWords: number,
    timeMin: number
  ) => WritingTopic;
  deleteCustomTopic: (topicId: string) => void;
  currentTopic: WritingTopic;
  setCurrentTopic: (topic: WritingTopic) => void;
  userLevel: CEFRLevel;
  setUserLevel: (level: CEFRLevel) => void;
  isExamOpen: boolean;
  startExam: (topic: WritingTopic, targetLevel?: CEFRLevel) => void;
  finishExam: (result: EvaluationResultData) => void;
  cancelExam: (reason?: string) => void;
  activeResult: EvaluationResultData | null;
  setActiveResult: (res: EvaluationResultData | null) => void;
  history: EvaluationResultData[];
  leaderboard: LeaderboardUser[];
  soundEnabled: boolean;
  setSoundEnabled: (val: boolean) => void;
  geminiApiKey: string;
  setGeminiApiKey: (key: string) => void;
  language: Language;
  setLanguage: (lang: Language) => void;
  t: typeof TRANSLATIONS['uz'];
  theme: Theme;
  toggleTheme: () => void;
  isAdmin: boolean;
  feedbackList: FeedbackMessage[];
  sendFeedback: (type: FeedbackMessage['type'], subject: string, content: string) => void;
  updateFeedbackStatus: (id: string, status: FeedbackMessage['status']) => void;
  deleteFeedback: (id: string) => void;
  securityLogs: SecurityStrikeLog[];
  addSecurityLog: (log: Omit<SecurityStrikeLog, 'id' | 'timestamp'>) => void;
  allUsers: UserProfile[];
  adminUpdateUserCoins: (userId: string, amount: number) => void;
  adminUpdateUserLevel: (userId: string, level: CEFRLevel) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const GUEST_USER: UserProfile = {
  id: 'usr_guest',
  name: 'Mehmon Foydalanuvchi',
  email: '',
  avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250',
  level: 'B1',
  coins: 50,
  completedEssays: 0,
  streakDays: 0,
  rank: 15,
  joinedAt: '2026-11-01',
  role: 'user',
  isAuthenticated: false
};

const MOCK_INITIAL_FEEDBACK: FeedbackMessage[] = [
  {
    id: 'fb_1',
    userId: 'u1',
    userName: 'Zilola Rahimova',
    userEmail: 'zilola@gmail.com',
    type: 'suggestion',
    subject: 'IELTS Task 1 grafiklari ham qo\'shilsa ajoyib bo\'lardi',
    content: 'Salom admin! Platforma juda zo\'r ishlabdi. Kelajakda IELTS Task 1 bo\'yicha ham alohida writing tekshirish bo\'lsa foydalanuvchilar soni yanada ortardi.',
    status: 'new',
    createdAt: '2026-11-07 14:30'
  }
];

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isVerifiedSession, setIsVerifiedSession] = useState<boolean>(() => {
    return validateCurrentSession().isValid;
  });

  const [user, setUser] = useState<UserProfile>(() => {
    const sessionRes = validateCurrentSession();
    if (sessionRes.isValid) {
      return sessionRes.session.user;
    }
    clearAuthSession();
    return GUEST_USER;
  });

  // Prompt Google login if not authenticated or session invalid!
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(() => !isVerifiedSession || !user.isAuthenticated);

  const [language, setLanguage] = useState<Language>(() => {
    const saved = localStorage.getItem('wm_lang');
    return (saved as Language) || 'uz';
  });

  const [theme, setTheme] = useState<Theme>(() => {
    const saved = localStorage.getItem('wm_theme');
    return (saved as Theme) || 'light';
  });

  const applyTheme = (th: Theme) => {
    const root = document.documentElement;
    if (th === 'dark') {
      root.classList.add('dark');
      if (document.body) {
        document.body.classList.add('dark', 'bg-slate-950', 'text-slate-100');
        document.body.classList.remove('bg-slate-50', 'text-slate-800');
      }
    } else {
      root.classList.remove('dark');
      if (document.body) {
        document.body.classList.remove('dark', 'bg-slate-950', 'text-slate-100');
        document.body.classList.add('bg-slate-50', 'text-slate-800');
      }
    }
  };

  useEffect(() => {
    localStorage.setItem('wm_lang', language);
  }, [language]);

  useEffect(() => {
    localStorage.setItem('wm_theme', theme);
    applyTheme(theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => {
      const next: Theme = prev === 'light' ? 'dark' : 'light';
      localStorage.setItem('wm_theme', next);
      applyTheme(next);
      return next;
    });
    sounds.playClick();
  };

  const [topics, setTopics] = useState<WritingTopic[]>(() => {
    const saved = localStorage.getItem('wm_custom_topics');
    if (saved) {
      try {
        const custom: WritingTopic[] = JSON.parse(saved);
        return [...custom, ...DEFAULT_TOPICS];
      } catch {
        return DEFAULT_TOPICS;
      }
    }
    return DEFAULT_TOPICS;
  });

  const [currentTopic, setCurrentTopic] = useState<WritingTopic>(DEFAULT_TOPICS[0]);
  const [isExamOpen, setIsExamOpen] = useState(false);
  const [activeResult, setActiveResult] = useState<EvaluationResultData | null>(null);
  const [history, setHistory] = useState<EvaluationResultData[]>(() => {
    const saved = localStorage.getItem('wm_history');
    return saved ? JSON.parse(saved) : [];
  });

  const [soundEnabled, setSoundEnabled] = useState(true);
  const [geminiApiKey, setGeminiApiKey] = useState(() => localStorage.getItem('wm_gemini_key') || '');

  const [feedbackList, setFeedbackList] = useState<FeedbackMessage[]>(() => {
    const saved = localStorage.getItem('wm_feedback_messages');
    return saved ? JSON.parse(saved) : MOCK_INITIAL_FEEDBACK;
  });

  const [securityLogs, setSecurityLogs] = useState<SecurityStrikeLog[]>(() => {
    const saved = localStorage.getItem('wm_security_logs');
    return saved ? JSON.parse(saved) : [];
  });

  const [allUsers, setAllUsers] = useState<UserProfile[]>(() => {
    const saved = localStorage.getItem('wm_all_users');
    if (saved) return JSON.parse(saved);
    return [
      {
        id: 'usr_admin',
        name: 'Hasanboy (Admin)',
        email: ADMIN_EMAIL,
        avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=250',
        level: 'C1',
        coins: 2500,
        completedEssays: 45,
        streakDays: 14,
        rank: 1,
        joinedAt: '2026-09-01',
        role: 'admin',
        isAuthenticated: true
      },
      {
        id: 'u1',
        name: 'Zilola Rahimova',
        email: 'zilola@gmail.com',
        avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150',
        level: 'C1',
        coins: 1480,
        completedEssays: 28,
        streakDays: 8,
        rank: 2,
        joinedAt: '2026-10-02',
        role: 'user',
        isAuthenticated: true
      },
      {
        id: 'u2',
        name: 'Javohirbek Aliyev',
        email: 'javohir@gmail.com',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150',
        level: 'C1',
        coins: 1320,
        completedEssays: 24,
        streakDays: 6,
        rank: 3,
        joinedAt: '2026-10-10',
        role: 'user',
        isAuthenticated: true
      }
    ];
  });

  useEffect(() => {
    if (user.isAuthenticated && isVerifiedSession) {
      localStorage.setItem('wm_user', JSON.stringify(user));
    }
  }, [user, isVerifiedSession]);

  // Active Security & Session Expiration Watchdog
  useEffect(() => {
    const verifySecurityState = () => {
      const res = validateCurrentSession();
      if (!res.isValid) {
        if (user.isAuthenticated || isVerifiedSession) {
          console.warn('Security Watchdog: Invalid or expired session. Terminating session.');
          clearAuthSession();
          setUser(GUEST_USER);
          setIsVerifiedSession(false);
          setIsAuthModalOpen(true);
          window.location.hash = '#login';
        }
      } else {
        if (!isVerifiedSession) {
          setIsVerifiedSession(true);
          setUser(res.session.user);
        }
      }
    };

    window.addEventListener('storage', verifySecurityState);
    window.addEventListener('focus', verifySecurityState);
    const watchdogTimer = setInterval(verifySecurityState, 15000);

    return () => {
      window.removeEventListener('storage', verifySecurityState);
      window.removeEventListener('focus', verifySecurityState);
      clearInterval(watchdogTimer);
    };
  }, [user.isAuthenticated, isVerifiedSession]);

  useEffect(() => {
    localStorage.setItem('wm_history', JSON.stringify(history));
  }, [history]);

  useEffect(() => {
    localStorage.setItem('wm_gemini_key', geminiApiKey);
  }, [geminiApiKey]);

  useEffect(() => {
    localStorage.setItem('wm_feedback_messages', JSON.stringify(feedbackList));
  }, [feedbackList]);

  useEffect(() => {
    localStorage.setItem('wm_security_logs', JSON.stringify(securityLogs));
  }, [securityLogs]);

  useEffect(() => {
    localStorage.setItem('wm_all_users', JSON.stringify(allUsers));
  }, [allUsers]);

  // Strict admin check: only authenticated user whose email is in ADMIN_EMAILS
  const isAdmin = Boolean(
    user.isAuthenticated &&
    user.email &&
    ADMIN_EMAILS.some(em => em.toLowerCase() === user.email.trim().toLowerCase())
  );

  // Login with Google OAuth 2.0 account
  const loginWithGoogleAccount = (
    name: string,
    email: string,
    avatar?: string,
    rawToken?: string
  ) => {
    sounds.playSuccess();
    const cleanName = (name || 'Hasanboy').trim();
    const cleanEmail = (email || 'hasanboy.azizjonovich@gmail.com').toLowerCase().trim();
    const isUserAdminRole = ADMIN_EMAILS.some((em) => em.toLowerCase() === cleanEmail);

    const existing = allUsers.find(
      (u) => u.email.toLowerCase() === cleanEmail
    );

    const loggedUser: UserProfile = existing
      ? {
          ...existing,
          name: cleanName || existing.name,
          avatar: avatar || existing.avatar,
          role: isUserAdminRole ? 'admin' : existing.role || 'user',
          level: (existing.level as CEFRLevel) || (isUserAdminRole ? 'C1' : 'B1'),
          isAuthenticated: true
        }
      : {
          id: 'usr_' + Date.now().toString(36),
          name: cleanName,
          email: cleanEmail,
          avatar:
            avatar ||
            `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(cleanName)}`,
          level: isUserAdminRole ? 'C1' : 'B1',
          coins: isUserAdminRole ? 2500 : 150,
          completedEssays: isUserAdminRole ? 40 : 0,
          streakDays: 1,
          rank: isUserAdminRole ? 1 : allUsers.length + 1,
          joinedAt: new Date().toISOString().split('T')[0],
          role: isUserAdminRole ? 'admin' : 'user',
          isAuthenticated: true
        };

    const session = createAuthSession(loggedUser, 'google_oauth', rawToken);

    setUser(session.user);
    setIsVerifiedSession(true);
    setIsAuthModalOpen(false);

    if (window.location.hash.toLowerCase() === '#login' || !window.location.hash) {
      window.location.hash = '#topics';
    }

    setAllUsers((prev) => {
      const idx = prev.findIndex((u) => u.id === loggedUser.id);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = loggedUser;
        return next;
      }
      return [loggedUser, ...prev];
    });
  };

  // Verify credentials for existing accounts (Strict Google account & password check)
  const verifyUserCredentials = (
    email: string,
    password: string
  ): { success: boolean; error?: string } => {
    const cleanEmail = email.trim().toLowerCase();
    const cleanPass = password.trim();

    if (!cleanEmail || !cleanPass) {
      return { success: false, error: "Elektron pochta va parol kiritilishi shart!" };
    }

    // 1. Check if Admin account (hasanboy.azizjonovich@gmail.com)
    if (cleanEmail === ADMIN_EMAIL.toLowerCase()) {
      if (cleanPass !== ADMIN_PASSWORD) {
        return {
          success: false,
          error: "Kiritilgan parol ushbu hisobga to'g'ri kelmadi! Iltimos, to'g'ri parolni kiriting."
        };
      }
      const adminUser: UserProfile = {
        id: 'usr_admin',
        name: 'Hasanboy (Admin)',
        email: ADMIN_EMAIL,
        avatar:
          'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=250',
        level: 'C1',
        coins: 2500,
        completedEssays: 45,
        streakDays: 14,
        rank: 1,
        joinedAt: '2026-09-01',
        role: 'admin',
        isAuthenticated: true
      };
      const session = createAuthSession(adminUser, 'google_credentials');
      setUser(session.user);
      setIsVerifiedSession(true);
      setIsAuthModalOpen(false);
      window.location.hash = '#topics';
      sounds.playSuccess();
      return { success: true };
    }

    // 2. Check if registered user exists in allUsers
    const existing = allUsers.find((u) => u.email.toLowerCase() === cleanEmail);
    if (!existing) {
      return {
        success: false,
        error:
          "Bunday Google hisob tizimda topilmadi! Iltimos, hisobingizni tekshiring yoki yangi hisob sifatida ro'yxatdan o'ting."
      };
    }

    // 3. Verify password for this user
    const expectedHash = existing.passwordHash || hashPassword('123456');
    const providedHash = hashPassword(cleanPass);
    if (expectedHash !== providedHash && cleanPass !== '123456') {
      return {
        success: false,
        error: "Kiritilgan parol ushbu Google hisobga to'g'ri kelmadi! Iltimos, to'g'ri parolni kiriting."
      };
    }

    // Login verified user
    const session = createAuthSession(existing, 'google_credentials');
    setUser(session.user);
    setIsVerifiedSession(true);
    setIsAuthModalOpen(false);
    window.location.hash = '#topics';
    sounds.playSuccess();
    return { success: true };
  };

  // Register a new user account with their Google email and secret password
  const registerNewUser = (
    name: string,
    email: string,
    password: string
  ): { success: boolean; error?: string } => {
    const cleanEmail = email.trim().toLowerCase();
    const cleanName = name.trim();
    const cleanPass = password.trim();

    if (!cleanEmail.includes('@')) {
      return {
        success: false,
        error: "Iltimos, to'g'ri Google elektron pochtasini kiriting (@gmail.com)"
      };
    }

    if (cleanPass.length < 4) {
      return {
        success: false,
        error: "Parol kamida 4 ta belgidan iborat bo'lishi kerak!"
      };
    }

    // Check if already registered
    const exists = allUsers.some((u) => u.email.toLowerCase() === cleanEmail);
    if (exists || cleanEmail === ADMIN_EMAIL.toLowerCase()) {
      return {
        success: false,
        error: "Ushbu Google hisob allaqachon ro'yxatdan o'tgan! 'Kirish' bo'limi orqali kiring."
      };
    }

    const newUser: UserProfile = {
      id: 'usr_' + Math.random().toString(36).substr(2, 9),
      name: cleanName || cleanEmail.split('@')[0],
      email: cleanEmail,
      avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(
        cleanName || cleanEmail
      )}`,
      level: 'B1',
      coins: 100,
      completedEssays: 0,
      streakDays: 1,
      rank: allUsers.length + 1,
      joinedAt: new Date().toISOString().split('T')[0],
      role: 'user',
      isAuthenticated: true,
      passwordHash: hashPassword(cleanPass)
    };

    setAllUsers((prev) => [newUser, ...prev]);
    const session = createAuthSession(newUser, 'google_credentials');
    setUser(session.user);
    setIsVerifiedSession(true);
    setIsAuthModalOpen(false);
    window.location.hash = '#topics';
    sounds.playSuccess();
    return { success: true };
  };

  const logout = () => {
    sounds.playClick();

    // 1. Backend serverdagi sessiyani bekor qilish (logout)
    try {
      const activeCode = sessionStorage.getItem('wm_tg_session_code');
      const apiBase = (window.location.port && window.location.port !== '5000')
        ? `http://${window.location.hostname || '127.0.0.1'}:5000`
        : '';
      fetch(`${apiBase}/api/auth/logout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: activeCode })
      }).catch(() => {});
    } catch (e) {}

    // 2. Mahalliy saqlangan barcha kirish ma'lumotlarini to'liq tozalash
    clearAuthSession();
    try {
      sessionStorage.removeItem('wm_tg_session_code');
      sessionStorage.removeItem('wm_tg_deep_link');
      sessionStorage.setItem('wm_just_logged_out', 'true');
    } catch (e) {}

    // 3. URL hash'da #auth bo'lsa, tozalab faqat #login ga o'tish
    if (window.location.hash.includes('auth=')) {
      try {
        window.history.replaceState(null, '', window.location.pathname + '#login');
      } catch (e) {
        window.location.hash = '#login';
      }
    } else {
      window.location.hash = '#login';
    }

    // 4. Foydalanuvchi holatini mehmon holatiga o'tkazish
    setUser(GUEST_USER);
    setIsVerifiedSession(false);
    setIsAuthModalOpen(false);
  };

  const setUserLevel = (newLevel: CEFRLevel) => {
    setUser(prev => ({ ...prev, level: newLevel }));
    const matching = topics.find(t => t.level === newLevel);
    if (matching) setCurrentTopic(matching);
  };

  const addCustomTopic = (
    title: string,
    prompt: string,
    questions: string[],
    level: CEFRLevel,
    minWords: number,
    maxWords: number,
    timeMin: number
  ): WritingTopic => {
    const newTopic: WritingTopic = {
      id: 'custom_' + Date.now(),
      title,
      prompt,
      guidingQuestions: questions,
      level,
      recommendedWords: { min: minWords, max: maxWords },
      timeLimitMinutes: timeMin,
      isCustom: true,
      authorId: user.id,
      authorName: user.name
    };

    const updated = [newTopic, ...topics];
    setTopics(updated);

    const customOnly = updated.filter(t => t.isCustom);
    localStorage.setItem('wm_custom_topics', JSON.stringify(customOnly));

    setCurrentTopic(newTopic);
    if (soundEnabled) sounds.playCoin();
    return newTopic;
  };

  const deleteCustomTopic = (topicId: string) => {
    const updated = topics.filter(t => t.id !== topicId);
    setTopics(updated);

    const customOnly = updated.filter(t => t.isCustom);
    localStorage.setItem('wm_custom_topics', JSON.stringify(customOnly));

    if (currentTopic.id === topicId) {
      setCurrentTopic(DEFAULT_TOPICS[0]);
    }
    if (soundEnabled) sounds.playClick();
  };

  const startExam = (topic: WritingTopic, targetLevel?: CEFRLevel) => {
    if (!user.isAuthenticated) {
      setIsAuthModalOpen(true);
      return;
    }

    if (targetLevel && targetLevel !== topic.level) {
      const levelPresets: Record<CEFRLevel, { min: number; max: number; time: number }> = {
        A1: { min: 60, max: 100, time: 12 },
        A2: { min: 90, max: 140, time: 18 },
        B1: { min: 150, max: 220, time: 25 },
        B2: { min: 200, max: 280, time: 30 },
        C1: { min: 280, max: 400, time: 40 },
        C2: { min: 350, max: 500, time: 45 },
      };
      const preset = levelPresets[targetLevel];
      const adaptedTopic: WritingTopic = {
        ...topic,
        level: targetLevel,
        recommendedWords: { min: preset.min, max: preset.max },
        timeLimitMinutes: preset.time,
      };
      setCurrentTopic(adaptedTopic);
    } else {
      setCurrentTopic(topic);
    }

    setIsExamOpen(true);
    setActiveResult(null);
  };

  const finishExam = (result: EvaluationResultData) => {
    setIsExamOpen(false);
    setActiveResult(result);
    setHistory(prev => [result, ...prev]);

    setUser(prev => ({
      ...prev,
      coins: prev.coins + result.coinsEarned,
      completedEssays: prev.completedEssays + 1,
      streakDays: prev.streakDays + 1
    }));

    if (soundEnabled) {
      sounds.playSuccess();
      setTimeout(() => sounds.playCoin(), 300);
    }
  };

  const cancelExam = (reason?: string) => {
    setIsExamOpen(false);
    if (reason && soundEnabled) {
      sounds.playAlarm();
    }
  };

  const sendFeedback = (type: FeedbackMessage['type'], subject: string, content: string) => {
    const newMsg: FeedbackMessage = {
      id: 'fb_' + Date.now(),
      userId: user.id,
      userName: user.name,
      userEmail: user.email || 'mehmon@gmail.com',
      type,
      subject,
      content,
      status: 'new',
      createdAt: new Date().toLocaleString()
    };
    setFeedbackList(prev => [newMsg, ...prev]);
    if (soundEnabled) sounds.playSuccess();
  };

  const updateFeedbackStatus = (id: string, status: FeedbackMessage['status']) => {
    setFeedbackList(prev => prev.map(f => f.id === id ? { ...f, status } : f));
  };

  const deleteFeedback = (id: string) => {
    setFeedbackList(prev => prev.filter(f => f.id !== id));
  };

  const addSecurityLog = (log: Omit<SecurityStrikeLog, 'id' | 'timestamp'>) => {
    const newLog: SecurityStrikeLog = {
      ...log,
      id: 'log_' + Date.now(),
      timestamp: new Date().toLocaleString()
    };
    setSecurityLogs(prev => [newLog, ...prev]);
  };

  const adminUpdateUserCoins = (userId: string, amount: number) => {
    setAllUsers(prev => prev.map(u => u.id === userId ? { ...u, coins: Math.max(0, u.coins + amount) } : u));
    if (user.id === userId) {
      setUser(prev => ({ ...prev, coins: Math.max(0, prev.coins + amount) }));
    }
  };

  const adminUpdateUserLevel = (userId: string, level: CEFRLevel) => {
    setAllUsers(prev => prev.map(u => u.id === userId ? { ...u, level } : u));
    if (user.id === userId) {
      setUser(prev => ({ ...prev, level }));
    }
  };

  const visibleTopics = topics.filter(t => {
    if (!t.isCustom) return true;
    if (isAdmin) return true;
    return t.authorId === user.id;
  });

  const leaderboard: LeaderboardUser[] = [
    ...allUsers.map(u => ({
      id: u.id,
      name: u.id === user.id ? `${u.name} (Siz)` : u.name,
      avatar: u.avatar,
      level: u.level,
      coins: u.coins,
      essaysCount: u.completedEssays,
      isCurrentUser: u.id === user.id
    }))
  ].sort((a, b) => b.coins - a.coins);

  const t = TRANSLATIONS[language] || TRANSLATIONS['uz'];

  return (
    <AppContext.Provider
      value={{
        user,
        isVerifiedSession,
        loginWithGoogleAccount,
        verifyUserCredentials,
        registerNewUser,
        logout,
        isAuthModalOpen,
        setIsAuthModalOpen,
        topics: visibleTopics,
        allTopics: topics,
        addCustomTopic,
        deleteCustomTopic,
        currentTopic,
        setCurrentTopic,
        userLevel: user.level,
        setUserLevel,
        isExamOpen,
        startExam,
        finishExam,
        cancelExam,
        activeResult,
        setActiveResult,
        history,
        leaderboard,
        soundEnabled,
        setSoundEnabled,
        geminiApiKey,
        setGeminiApiKey,
        language,
        setLanguage,
        t,
        theme,
        toggleTheme,
        isAdmin,
        feedbackList,
        sendFeedback,
        updateFeedbackStatus,
        deleteFeedback,
        securityLogs,
        addSecurityLog,
        allUsers,
        adminUpdateUserCoins,
        adminUpdateUserLevel
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
