import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { sounds } from '../utils/audio';
import { Globe, ChevronDown, Check, Sun, Moon } from 'lucide-react';
import { Language } from '../types';
import { TelegramSignInCard } from './TelegramSignInCard';

export const AuthScreen: React.FC = () => {
  const { t, language, setLanguage, theme, toggleTheme } = useApp();

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
        <TelegramSignInCard isModal={false} />
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
