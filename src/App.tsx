import React, { useState, useEffect } from 'react';
import { useApp } from './context/AppContext';
import { Header } from './components/Header';
import { TopicsView } from './components/TopicsView';
import { LeaderboardView } from './components/LeaderboardView';
import { AdminDashboard } from './components/AdminDashboard';
import { EvaluationResult } from './components/EvaluationResult';
import { FullExamModal } from './components/FullExamModal';
import { LevelTestModal } from './components/LevelTestModal';
import { AddTopicModal } from './components/AddTopicModal';
import { UserProfileModal } from './components/UserProfileModal';
import { FeedbackModal } from './components/FeedbackModal';
import { GoogleAuthModal } from './components/GoogleAuthModal';
import { AdminPasswordModal } from './components/AdminPasswordModal';
import { AuthScreen } from './components/AuthScreen';
import { ProtectedRoute } from './components/ProtectedRoute';
import { WritingTopic, CEFRLevel } from './types';

export const AppContent: React.FC = () => {
  const {
    currentTopic,
    startExam,
    finishExam,
    cancelExam,
    activeResult,
    setActiveResult,
    addCustomTopic,
    setUserLevel,
    userLevel,
    isAdmin,
    isExamOpen,
    isAuthModalOpen,
    setIsAuthModalOpen,
    user,
    isVerifiedSession
  } = useApp();

  const [activeView, setActiveView] = useState<'topics' | 'leaderboard' | 'admin'>('topics');
  const [isAdminPasswordModalOpen, setIsAdminPasswordModalOpen] = useState(false);
  const [isAdminUnlocked, setIsAdminUnlocked] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isAddTopicOpen, setIsAddTopicOpen] = useState(false);
  const [isLevelTestOpen, setIsLevelTestOpen] = useState(false);
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  // URL Hash Route Guard (Intercepts direct URL navigation like #admin, #leaderboard, #topics)
  useEffect(() => {
    const handleHashRouting = () => {
      const hash = (window.location.hash || '').toLowerCase().replace(/^#/, '');

      // 1. If unauthenticated, redirect all protected hashes to #login immediately
      if (!user.isAuthenticated || !isVerifiedSession) {
        if (hash && hash !== 'login') {
          window.location.hash = '#login';
        }
        return;
      }

      // 2. If authenticated, handle protected views
      if (hash === 'admin') {
        if (!isAdmin) {
          showToast("Ruxsat yo'q: Faqat Admin Hasanboy boshqaruv paneliga kira oladi!", "error");
          setActiveView('topics');
          window.location.hash = '#topics';
          return;
        }
        if (!isAdminUnlocked) {
          setIsAdminPasswordModalOpen(true);
        } else {
          setActiveView('admin');
        }
      } else if (hash === 'leaderboard') {
        setActiveView('leaderboard');
      } else if (hash === 'topics') {
        setActiveView('topics');
      }
    };

    handleHashRouting();
    window.addEventListener('hashchange', handleHashRouting);
    return () => window.removeEventListener('hashchange', handleHashRouting);
  }, [user.isAuthenticated, isVerifiedSession, isAdmin, isAdminUnlocked]);

  // Sync active view changes to URL hash
  const handleViewChange = (view: 'topics' | 'leaderboard' | 'admin') => {
    if (view === 'admin' && !isAdmin) {
      showToast("Faqat Hasanboy admin sifatida kira oladi!", "error");
      return;
    }
    setActiveView(view);
    window.location.hash = '#' + view;
  };

  const handleOpenAdmin = () => {
    if (!isAdmin) {
      showToast("Faqat Hasanboy admin sifatida kira oladi!", "error");
      return;
    }
    if (isAdminUnlocked) {
      handleViewChange('admin');
    } else {
      setIsAdminPasswordModalOpen(true);
    }
  };

  const handleStartExam = (topic: WritingTopic, level?: CEFRLevel) => {
    if (!user.isAuthenticated || !isVerifiedSession) {
      setIsAuthModalOpen(true);
      return;
    }
    startExam(topic, level);
  };

  const handleAbortExam = (reason: string) => {
    cancelExam(reason);
    showToast(reason, "error");
  };

  // If unauthenticated or session invalid, purge all open views and enforce login
  useEffect(() => {
    if (!user.isAuthenticated || !isVerifiedSession) {
      setActiveView('topics');
      setIsAdminUnlocked(false);
      setIsProfileOpen(false);
      window.location.hash = '#login';
    }
  }, [user.isAuthenticated, isVerifiedSession]);

  // STRICT GLOBAL ROUTE GUARD:
  // If not authenticated or session not verified, show login screen immediately.
  if (!user.isAuthenticated || !isVerifiedSession) {
    return <AuthScreen />;
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col selection:bg-blue-600 selection:text-white font-['Plus_Jakarta_Sans',sans-serif] transition-colors">

      {/* Dynamic Toast Alert (Success in bright green, errors in red) */}
      {toast && (
        <div className={`fixed top-6 right-6 z-50 px-5 py-3 rounded-2xl shadow-2xl font-bold text-xs flex items-center gap-2.5 animate-bounce transition-all ${
          toast.type === 'success'
            ? 'bg-emerald-600 text-white shadow-emerald-600/30'
            : toast.type === 'error'
            ? 'bg-rose-600 text-white shadow-rose-600/30'
            : 'bg-blue-600 text-white shadow-blue-600/30'
        }`}>
          <span className="text-sm">
            {toast.type === 'success' ? '✅' : toast.type === 'error' ? '⚠️' : 'ℹ️'}
          </span>
          <span>{toast.message}</span>
        </div>
      )}

      {/* Main Header */}
      <Header
        onOpenProfile={() => {
          if (!user.isAuthenticated) {
            setIsAuthModalOpen(true);
          } else {
            setIsProfileOpen(true);
          }
        }}
        onRequestAdmin={handleOpenAdmin}
        activeView={activeView}
        setActiveView={handleViewChange}
      />

      {/* Main Content Area Protected by Route Guard */}
      <ProtectedRoute>
        <main className="flex-1 pb-16">
          {activeResult ? (
            <EvaluationResult
              data={activeResult}
              onBack={() => setActiveResult(null)}
              onRetry={() => {
                const topic = currentTopic;
                setActiveResult(null);
                startExam(topic);
              }}
            />
          ) : activeView === 'admin' ? (
            <ProtectedRoute
              requiredRole="admin"
              onAccessDenied={() => handleViewChange('topics')}
            >
              <AdminDashboard onBack={() => handleViewChange('topics')} />
            </ProtectedRoute>
          ) : activeView === 'topics' ? (
            <TopicsView
              onStartExam={handleStartExam}
              onOpenAddTopic={() => {
                if (!user.isAuthenticated) {
                  setIsAuthModalOpen(true);
                } else {
                  setIsAddTopicOpen(true);
                }
              }}
              onOpenLevelTest={() => setIsLevelTestOpen(true)}
            />
          ) : (
            <LeaderboardView />
          )}
        </main>
      </ProtectedRoute>

      {/* Footer */}
      <footer className="bg-white dark:bg-slate-900 border-t border-slate-200/80 dark:border-slate-800 py-6 text-center text-xs text-slate-500 dark:text-slate-400 transition-colors">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 font-bold text-slate-700 dark:text-slate-200">
            <span>✍️ Writing Master AI</span>
            <span className="text-slate-300 dark:text-slate-700">•</span>
            <span className="text-slate-500 dark:text-slate-400 font-normal">5D AI Writing Platformasi</span>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsFeedbackOpen(true)}
              className="text-blue-600 dark:text-blue-400 font-bold hover:underline"
            >
              Taklif bildirish
            </button>
            {isAdmin && (
              <button
                onClick={handleOpenAdmin}
                className="text-amber-600 dark:text-amber-400 font-bold hover:underline"
              >
                Admin boshqaruvi
              </button>
            )}
            <span>Xavfsiz Full-Screen Anti-Cheat Rejimi</span>
          </div>
        </div>
      </footer>

      {/* Admin Password Authentication Modal */}
      <AdminPasswordModal
        isOpen={isAdminPasswordModalOpen}
        onClose={() => setIsAdminPasswordModalOpen(false)}
        onSuccess={() => {
          setIsAdminUnlocked(true);
          setIsAdminPasswordModalOpen(false);
          setActiveView('admin');
          showToast("Xush kelibsiz, Admin Hasanboy! Boshqaruv paneli ochildi.", "success");
        }}
      />

      {/* GOOGLE AUTH MODAL (Allows entering custom Google account on entry or anytime) */}
      <GoogleAuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        canClose={true}
      />

      {/* FULL EXAM MODAL (Fullscreen Anti-Cheat Mode) */}
      {isExamOpen && (
        <FullExamModal
          topic={currentTopic}
          onFinish={finishExam}
          onAbort={handleAbortExam}
        />
      )}

      {/* CEFR Placement Diagnostic Test Modal */}
      <LevelTestModal
        isOpen={isLevelTestOpen}
        onClose={() => setIsLevelTestOpen(false)}
        onComplete={(newLevel) => {
          setUserLevel(newLevel);
          showToast(`Sizning darajangiz: CEFR ${newLevel} deb belgilandi!`);
        }}
      />

      {/* Add Custom Topic Modal */}
      <AddTopicModal
        isOpen={isAddTopicOpen}
        onClose={() => setIsAddTopicOpen(false)}
        defaultLevel={userLevel}
        onAdd={(title, prompt, questions, level, min, max, time) => {
          addCustomTopic(title, prompt, questions, level, min, max, time);
          showToast(`"${title}" mavzusi muvaffaqiyatli qo'shildi!`);
        }}
      />

      {/* User Profile Modal */}
      <UserProfileModal
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        onOpenLevelTest={() => setIsLevelTestOpen(true)}
        onRequestAdmin={handleOpenAdmin}
        onOpenFeedback={() => setIsFeedbackOpen(true)}
      />

      {/* Feedback Submission Modal */}
      <FeedbackModal
        isOpen={isFeedbackOpen}
        onClose={() => setIsFeedbackOpen(false)}
      />

    </div>
  );
};

export default function App() {
  return <AppContent />;
}
