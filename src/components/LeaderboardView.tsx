import React from 'react';
import { useApp } from '../context/AppContext';
import {
  Trophy,
  Coins,
  Medal,
  Sparkles,
  Award,
  Crown
} from 'lucide-react';
import { AnimatedSticker } from './AnimatedSticker';

export const LeaderboardView: React.FC = () => {
  const { leaderboard, user, t } = useApp();

  const getRankBadge = (index: number) => {
    if (index === 0) {
      return (
        <div className="w-8 h-8 rounded-full bg-amber-400 text-amber-950 font-black flex items-center justify-center text-sm shadow-md shadow-amber-400/40 animate-bounce">
          <Crown className="w-5 h-5 text-amber-900" />
        </div>
      );
    }
    if (index === 1) {
      return (
        <div className="w-8 h-8 rounded-full bg-slate-300 text-slate-900 font-black flex items-center justify-center text-sm shadow-md">
          <Medal className="w-4 h-4 text-slate-700" />
        </div>
      );
    }
    if (index === 2) {
      return (
        <div className="w-8 h-8 rounded-full bg-amber-700 text-amber-100 font-black flex items-center justify-center text-sm shadow-md">
          <Award className="w-4 h-4 text-amber-200" />
        </div>
      );
    }
    return (
      <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-bold flex items-center justify-center text-xs">
        #{index + 1}
      </div>
    );
  };

  return (
    <div className="max-w-4xl mx-auto py-6 px-4">
      {/* Top Banner (Streak removed) */}
      <div className="bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-600 rounded-3xl p-6 text-slate-900 mb-8 shadow-xl shadow-yellow-500/20 relative overflow-hidden flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="relative z-10">
          <div className="inline-flex items-center gap-1.5 bg-black/10 backdrop-blur-md px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider mb-2">
            <Trophy className="w-3.5 h-3.5 text-amber-950" />
            <span>Global Reyting & Coin Tizimi</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 leading-tight">
            {t.leaderboardTitle}
          </h2>

          <p className="text-xs sm:text-sm text-slate-800 font-medium max-w-md mt-1">
            {t.leaderboardSub}
          </p>
        </div>

        {/* User Quick Standing */}
        <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-md p-4 rounded-2xl shadow-lg border border-white/50 text-center shrink-0 w-full sm:w-auto">
          <div className="text-xs font-bold text-slate-500 dark:text-slate-400 mb-1">{t.currentBalance}</div>
          <div className="text-2xl font-black text-amber-600 dark:text-amber-400 flex items-center justify-center gap-1.5">
            <Coins className="w-6 h-6 animate-spin" style={{ animationDuration: '8s' }} />
            <span>{user.coins} Coin</span>
          </div>
          <div className="text-[11px] font-extrabold text-slate-700 dark:text-slate-300 mt-1">
            {user.completedEssays} {t.totalEssays}
          </div>
        </div>

        <div className="absolute -right-4 -bottom-4 opacity-30 pointer-events-none">
          <AnimatedSticker type="trophy" size="xl" />
        </div>
      </div>

      {/* Leaderboard Table Card */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-xl border border-slate-100 dark:border-slate-800 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-800/60">
          <h3 className="font-extrabold text-slate-800 dark:text-white text-sm flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span>Eng Yaxshi Natijalar Ro'yxati</span>
          </h3>
          <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold">
            Jami: {leaderboard.length} nafar foydalanuvchi
          </span>
        </div>

        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          {leaderboard.map((item, index) => {
            const isMe = item.isCurrentUser;
            return (
              <div
                key={item.id}
                className={`px-6 py-4 flex items-center justify-between transition-colors ${
                  isMe
                    ? 'bg-blue-50/70 dark:bg-blue-950/40 border-l-4 border-blue-600'
                    : 'hover:bg-slate-50 dark:hover:bg-slate-800/40'
                }`}
              >
                {/* Left: Rank & Avatar & Name */}
                <div className="flex items-center gap-4">
                  {getRankBadge(index)}

                  <img
                    src={item.avatar}
                    alt={item.name}
                    className="w-11 h-11 rounded-2xl object-cover border-2 border-white dark:border-slate-700 shadow-sm"
                  />

                  <div>
                    <div className="flex items-center gap-2">
                      <span className={`text-sm font-bold ${isMe ? 'text-blue-900 dark:text-blue-300 font-extrabold' : 'text-slate-800 dark:text-slate-100'}`}>
                        {item.name}
                      </span>
                      {isMe && (
                        <span className="bg-blue-600 text-white text-[10px] font-black px-2 py-0.5 rounded-full">
                          SIZ
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      <span className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-2 py-0.5 rounded-md font-bold text-[10px]">
                        {item.level}
                      </span>
                      <span>•</span>
                      <span>{item.essaysCount} ta writing yozgan</span>
                    </div>
                  </div>
                </div>

                {/* Right: Coins total */}
                <div className="text-right">
                  <div className="text-base font-black text-amber-600 dark:text-amber-400 flex items-center justify-end gap-1.5">
                    <Coins className="w-4 h-4 text-amber-500" />
                    <span>{item.coins}</span>
                  </div>
                  <span className="text-[10px] font-semibold text-slate-400">Coins</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
