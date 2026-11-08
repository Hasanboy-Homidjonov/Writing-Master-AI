import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { sounds } from '../utils/audio';
import { User, Mail, ArrowRight, ShieldCheck, Globe, ChevronDown, Check, Sun, Moon } from 'lucide-react';
import { BouncyButton } from './BouncyButton';
import { Language } from '../types';

export const AuthScreen: React.FC = () => {
  const { loginWithGoogleAccount, t, language, setLanguage, theme, toggleTheme } = useApp();

  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [isLangMenuOpen, setIsLangMenuOpen] = useState(false);
  const langMenuRef = useRef<HTMLDivElement>(null);

  // Close language menu on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (langMenuRef.current && !langMenuRef.current.contains(e.target as Node)) {
        setIsLangMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const languages: { code: Language; label: string; flag: string }[] = [
    { code: 'uz', label: "O'zbekcha", flag: '🇺🇿' },
    { code: 'en', label: 'English', flag: '🇬🇧' },
    { code: 'ru', label: 'Русский', flag: '🇷🇺' }
  ];

  const currentLang = languages.find((l) => l.code === language) || languages[0];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    const finalName = name.trim() || email.split('@')[0];
    loginWithGoogleAccount(finalName, email.trim());
    setEmail('');
    setName('');
  };

  return (
    <div className="min-h-screen bg-slate-900 dark:bg-slate-950 text-slate-100 flex flex-col justify-between relative overflow-hidden font-sans selection:bg-blue-500 selection:text-white transition-colors">
      
      {/* Decorative ambient background glows */}
      <div className="absolute top-[-15%] left-[20%] w-[500px] h-[500px] bg-blue-600/15 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-[-15%] right-[20%] w-[500px] h-[500px] bg-purple-600/15 rounded-full blur-[140px] pointer-events-none" />

      {/* Top Navbar */}
      <header className="relative z-20 border-b border-slate-800/80 bg-slate-900/60 backdrop-blur-md px-4 sm:px-8 py-3.5 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/20 text-xl font-black">
            ✍️
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-base tracking-tight text-white">Writing Master</span>
              <span className="bg-gradient-to-r from-blue-600 to-indigo-600 text-[10px] font-black text-white px-2 py-0.5 rounded-full uppercase tracking-wider">
                AI PRO
              </span>
            </div>
            <p className="text-[10px] text-slate-400 font-medium">5D AI Evaluation System</p>
          </div>
        </div>

        {/* Right side: Language Selector & Theme Toggle */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Language dropdown button */}
          <div className="relative" ref={langMenuRef}>
            <button
              onClick={() => {
                sounds.playClick();
                setIsLangMenuOpen(!isLangMenuOpen);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700/80 text-slate-200 border border-slate-700 transition-all font-bold text-xs shadow-xs active:scale-95"
              title="Tilni tanlash / Switch language"
            >
              <Globe className="w-3.5 h-3.5 text-blue-400" />
              <span className="text-sm">{currentLang.flag}</span>
              <span className="hidden sm:inline">{currentLang.label}</span>
              <ChevronDown className={`w-3 h-3 text-slate-400 transition-transform ${isLangMenuOpen ? 'rotate-180' : ''}`} />
            </button>

            {isLangMenuOpen && (
              <div className="absolute right-0 mt-2 w-44 bg-slate-800 border border-slate-700 rounded-2xl p-1.5 shadow-2xl z-50 animate-fadeIn">
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
                          ? 'bg-blue-950/70 text-blue-400 font-black'
                          : 'text-slate-200 hover:bg-slate-700/60'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-base">{l.flag}</span>
                        <span>{l.label}</span>
                      </div>
                      {isSelected && <Check className="w-3.5 h-3.5 text-blue-400" />}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Theme toggle */}
          <button
            onClick={toggleTheme}
            className="flex items-center justify-center w-8 h-8 rounded-xl bg-slate-800 hover:bg-slate-700 text-yellow-300 border border-slate-700 transition-all font-bold text-xs active:scale-95 shadow-xs"
            title={theme === 'dark' ? t.lightMode : t.darkMode}
          >
            {theme === 'dark' ? (
              <Sun className="w-4 h-4 text-yellow-400" />
            ) : (
              <Moon className="w-4 h-4 text-indigo-400" />
            )}
          </button>
        </div>
      </header>

      {/* Main Center Container */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 relative z-10">
        <div className="bg-slate-900/95 border border-slate-800 rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl backdrop-blur-xl relative overflow-hidden">
          
          {/* Google Icon Header */}
          <div className="text-center mb-6">
            <div className="w-14 h-14 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center mx-auto mb-3 shadow-md">
              <svg className="w-7 h-7" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
            </div>

            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              {t.googleSignIn}
            </h1>
            <p className="text-xs text-slate-400 mt-1.5 max-w-xs mx-auto">
              {t.googleAuthSubtitle}
            </p>
          </div>

          {/* Form - Always clean & empty, no hardcoded values */}
          <form onSubmit={handleSubmit} className="space-y-4" autoComplete="off">
            <div>
              <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5 mb-1.5">
                <User className="w-3.5 h-3.5 text-blue-400" />
                <span>{t.fullNameLabel}</span>
              </label>
              <input
                type="text"
                name="entry_fullname"
                required
                autoComplete="off"
                autoCapitalize="words"
                spellCheck="false"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={t.fullNamePlaceholder}
                className="w-full bg-slate-800/90 border border-slate-700 rounded-2xl px-4 py-3 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5 mb-1.5">
                <Mail className="w-3.5 h-3.5 text-blue-400" />
                <span>{t.googleEmailLabel}</span>
              </label>
              <input
                type="email"
                name="entry_email"
                required
                autoComplete="off"
                autoCapitalize="none"
                spellCheck="false"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t.googleEmailPlaceholder}
                className="w-full bg-slate-800/90 border border-slate-700 rounded-2xl px-4 py-3 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
              />
            </div>

            <div className="pt-2">
              <BouncyButton
                type="submit"
                variant="primary"
                size="md"
                pulseGlow={true}
                className="w-full !py-3.5 font-black text-sm"
                icon={<ArrowRight className="w-4 h-4" />}
              >
                {t.signInWithGoogleBtn}
              </BouncyButton>
            </div>
          </form>

          {/* Security badge footer */}
          <div className="mt-5 pt-4 border-t border-slate-800 flex items-center justify-center gap-2 text-[11px] text-slate-400">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>{t.googleAuthSecurity}</span>
          </div>

        </div>
      </main>

      {/* Clean Footer */}
      <footer className="relative z-20 border-t border-slate-800/80 py-4 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>✍️ Writing Master AI • 5D AI Writing Platformasi</span>
          <span>Xavfsiz Full-Screen Anti-Cheat Rejimi</span>
        </div>
      </footer>

    </div>
  );
};
