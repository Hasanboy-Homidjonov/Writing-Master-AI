import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Trophy,
  Sparkles,
  Sun,
  Moon,
  Globe2,
  ChevronDown,
  Check
} from 'lucide-react';
import { AnimatedSticker } from './AnimatedSticker';
import { Language } from '../types';
import { sounds } from '../utils/audio';

interface HeaderProps {
  onOpenProfile: () => void;
  onOpenAddTopic?: () => void;
  onRequestAdmin: () => void;
  activeView: 'topics' | 'leaderboard' | 'admin';
  setActiveView: (view: 'topics' | 'leaderboard' | 'admin') => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenProfile,
  onRequestAdmin,
  activeView,
  setActiveView
}) => {
  const {
    user,
    language,
    setLanguage,
    theme,
    toggleTheme,
    isAdmin,
    t
  } = useApp();

  const [isLangMenuOpen, setIsLangMenuOpen] = useState(false);

  const languages: { code: Language; label: string; flag: string }[] = [
    { code: 'uz', label: 'O\'zbek', flag: '🇺🇿' },
    { code: 'en', label: 'English', flag: '🇬🇧' },
    { code: 'ru', label: 'Русский', flag: '🇷🇺' }
  ];

  const currentLangObj = languages.find(l => l.code === language) || languages[0];

  return (
    <header className="sticky top-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800 transition-colors shadow-xs">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-16 sm:h-18 flex items-center justify-between gap-2 sm:gap-4">

        {/* Left: Brand Logo & Title */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <div
            onClick={() => setActiveView('topics')}
            className="cursor-pointer flex items-center gap-2 sm:gap-2.5 group"
          >
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-md shadow-blue-500/25 group-hover:scale-110 transition-transform">
              <AnimatedSticker type="feather" size="sm" className="!w-5 !h-5 sm:!w-6 sm:!h-6 !text-lg sm:!text-xl" />
            </div>

            <div>
              <div className="flex items-center gap-1 sm:gap-1.5">
                <span className="font-black text-base sm:text-lg tracking-tight bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  Writing Master
                </span>
                <span className="bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 font-black text-[9px] px-1.5 py-0.5 rounded-md uppercase tracking-wider">
                  PRO
                </span>
              </div>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium hidden sm:block">
                {t.appSubtitle}
              </p>
            </div>
          </div>
        </div>

        {/* Center: Standard Navigation (ONLY Topics & Leaderboard — Admin is NOT in the public bar!) */}
        <div className="hidden md:flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl border border-slate-200/60 dark:border-slate-700/60">
          <button
            onClick={() => setActiveView('topics')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeView === 'topics'
                ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
            }`}
          >
            <Sparkles className="w-4 h-4 text-blue-500" />
            <span>{t.topics}</span>
          </button>

          <button
            onClick={() => setActiveView('leaderboard')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeView === 'leaderboard'
                ? 'bg-white dark:bg-slate-700 text-amber-600 dark:text-amber-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
            }`}
          >
            <Trophy className="w-4 h-4 text-amber-500" />
            <span>{t.leaderboard}</span>
          </button>
        </div>

        {/* Right: Clean, Ordered Controls */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">

          {/* 1. COMPACT Language Dropdown Button (Kichkina va qulay) */}
          <div className="relative">
            <button
              onClick={() => setIsLangMenuOpen(!isLangMenuOpen)}
              className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-2.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-slate-700 font-extrabold text-xs transition-all shadow-xs active:scale-95"
              title="Tilni tanlash (O'zbek / English / Русский)"
            >
              <Globe2 className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
              <span>{currentLangObj.flag}</span>
              <span className="text-[11px] font-black hidden sm:inline">{currentLangObj.label}</span>
              <ChevronDown className={`w-3 h-3 text-slate-400 transition-transform ${isLangMenuOpen ? 'rotate-180' : ''}`} />
            </button>

            {isLangMenuOpen && (
              <>
                {/* Backdrop to close on outside click */}
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setIsLangMenuOpen(false)}
                />

                {/* Compact, clean dropdown menu */}
                <div className="absolute right-0 mt-1.5 w-40 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 p-1.5 z-50 animate-fadeIn">
                  {languages.map((l) => {
                    const isSelected = language === l.code;
                    return (
                      <button
                        key={l.code}
                        onClick={() => {
                          sounds.playClick();
                          setLanguage(l.code);
                          setIsLangMenuOpen(false);
                        }}
                        className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition-colors ${
                          isSelected
                            ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 font-black'
                            : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-base">{l.flag}</span>
                          <span>{l.label}</span>
                        </div>
                        {isSelected && <Check className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />}
                      </button>
                    );
                  })}
                </div>
              </>
            )}
          </div>

          {/* 2. Theme Toggle (Oq / Qora fon) */}
          <button
            onClick={toggleTheme}
            className="flex items-center justify-center w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-yellow-300 border border-slate-200 dark:border-slate-700 transition-all font-bold text-xs active:scale-95 shadow-xs"
            title={theme === 'dark' ? t.lightMode : t.darkMode}
          >
            {theme === 'dark' ? (
              <Sun className="w-4 h-4 text-yellow-400 animate-spin" style={{ animationDuration: '15s' }} />
            ) : (
              <Moon className="w-4 h-4 text-indigo-600" />
            )}
          </button>

          {/* 3. ADMIN BUTTON: ONLY VISIBLE IF LOGGED IN WITH HASANBOY'S ACCOUNT */}
          {isAdmin && (
            <button
              onClick={onRequestAdmin}
              className="flex items-center gap-1 sm:gap-1.5 bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-300 hover:to-yellow-400 text-slate-950 font-black text-xs px-2.5 sm:px-3 py-1.5 rounded-xl shadow-sm transition-all hover:scale-105 active:scale-95 animate-pulse shrink-0"
              title="Admin Boshqaruvi (Parol so'raladi)"
            >
              <span>👑</span>
              <span className="hidden sm:inline">Admin Panel</span>
            </button>
          )}

          {/* 4. User Profile Avatar */}
          <div
            onClick={onOpenProfile}
            className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 p-1 rounded-xl cursor-pointer transition-all hover:scale-105 shrink-0"
            title="Profil"
          >
            <img
              src={user.avatar}
              alt={user.name}
              className="w-7 h-7 rounded-lg object-cover border border-white dark:border-slate-700 shadow-xs"
            />
          </div>

        </div>

      </div>

      {/* Mobile Nav Pills */}
      <div className="flex md:hidden items-center justify-around border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 px-3 py-2 gap-2">
        <button
          onClick={() => setActiveView('topics')}
          className={`flex-1 text-center text-xs font-bold py-1.5 px-3 rounded-xl transition-all ${
            activeView === 'topics' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 dark:text-slate-300'
          }`}
        >
          {t.topics}
        </button>
        <button
          onClick={() => setActiveView('leaderboard')}
          className={`flex-1 text-center text-xs font-bold py-1.5 px-3 rounded-xl transition-all ${
            activeView === 'leaderboard' ? 'bg-amber-500 text-white shadow-xs' : 'text-slate-600 dark:text-slate-300'
          }`}
        >
          {t.leaderboard}
        </button>
        {isAdmin && (
          <button
            onClick={onRequestAdmin}
            className={`flex-1 text-center text-xs font-bold py-1.5 px-3 rounded-xl flex items-center justify-center gap-1 transition-all ${
              activeView === 'admin'
                ? 'bg-amber-500 text-slate-950 font-black'
                : 'bg-amber-100 text-amber-900 dark:bg-amber-900/40 dark:text-amber-200'
            }`}
          >
            <span>👑</span>
            <span>Admin</span>
          </button>
        )}
      </div>
    </header>
  );
};
