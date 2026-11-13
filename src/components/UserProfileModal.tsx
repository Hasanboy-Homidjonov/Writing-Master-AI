import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  User,
  Coins,
  Award,
  BookOpen,
  Volume2,
  VolumeX,
  CheckCircle,
  Key,
  ShieldCheck,
  MessageSquarePlus
} from 'lucide-react';
import { BouncyButton } from './BouncyButton';

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenLevelTest: () => void;
  onRequestAdmin?: () => void;
  onOpenFeedback?: () => void;
}

export const UserProfileModal: React.FC<UserProfileModalProps> = ({
  isOpen,
  onClose,
  onOpenLevelTest,
  onRequestAdmin,
  onOpenFeedback
}) => {
  const {
    user,
    setIsAuthModalOpen,
    logout,
    history,
    soundEnabled,
    setSoundEnabled,
    geminiApiKey,
    setGeminiApiKey,
    setActiveResult,
    isAdmin,
    t
  } = useApp();

  const [keyInput, setKeyInput] = useState(geminiApiKey);
  const [keySaved, setKeySaved] = useState(false);

  if (!isOpen) return null;

  const handleSaveKey = () => {
    setGeminiApiKey(keyInput.trim());
    setKeySaved(true);
    setTimeout(() => setKeySaved(false), 2000);
  };

  const isGoogleUser = Boolean(user.isAuthenticated);

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 dark:border-slate-800 max-h-[90vh] overflow-y-auto transition-colors">

        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <User className="w-5 h-5 text-blue-600" />
            <h2 className="text-base font-extrabold text-slate-900 dark:text-white">Foydalanuvchi Profili</h2>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 flex items-center justify-center text-sm font-bold transition-all"
          >
            ✕
          </button>
        </div>

        {/* Profile Card (Streak removed completely) */}
        <div className="py-4">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-3xl p-5 text-white flex items-center gap-4 shadow-lg shadow-blue-500/25 mb-5 relative overflow-hidden">
            <img
              src={user.avatar}
              alt={user.name}
              className="w-16 h-16 rounded-2xl object-cover border-2 border-white/60 shadow-md shrink-0"
            />

            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-lg leading-tight">{user.name}</h3>
                <span className="bg-white/20 backdrop-blur-sm px-2 py-0.5 rounded-full text-[10px] font-black uppercase">
                  {user.level}
                </span>
                {isAdmin && (
                  <span className="bg-amber-400 text-slate-950 px-2 py-0.5 rounded-full text-[10px] font-black uppercase">
                    Admin
                  </span>
                )}
              </div>
              <p className="text-xs text-blue-100 opacity-90 mt-0.5">{user.email}</p>

              <div className="flex items-center gap-3 mt-3 text-xs font-bold">
                <span className="bg-amber-400 text-slate-950 px-3 py-1 rounded-full flex items-center gap-1 shadow-sm">
                  <Coins className="w-3.5 h-3.5 text-amber-900" />
                  <span>{user.coins} Coin</span>
                </span>

                <span className="bg-white/20 text-white px-3 py-1 rounded-full text-xs">
                  {user.completedEssays} ta yozilgan
                </span>
              </div>
            </div>
          </div>

          {/* Admin Access Button (ONLY rendered for Hasanboy!) */}
          {isAdmin && onRequestAdmin && (
            <div className="mb-5">
              <button
                onClick={() => {
                  onClose();
                  onRequestAdmin();
                }}
                className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 hover:from-amber-300 hover:to-yellow-300 text-slate-950 font-black text-xs py-3 px-4 rounded-2xl shadow-lg shadow-amber-500/20 transition-all active:scale-98"
              >
                <span className="text-base">👑</span>
                <span>Boshqaruv (Admin) Paneliga Kirish</span>
              </button>
            </div>
          )}

          {/* Google Auth Status / Actions */}
          <div className="mb-5">
            {!isGoogleUser ? (
              <button
                onClick={() => {
                  onClose();
                  setIsAuthModalOpen(true);
                }}
                className="w-full flex items-center justify-center gap-3 bg-white dark:bg-slate-850 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-800 dark:text-white border border-slate-200 dark:border-slate-700 rounded-2xl py-3 px-4 font-bold text-sm shadow-md transition-all active:scale-[0.98]"
              >
                <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
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
                <span>Google orqali kirish</span>
              </button>
            ) : (
              <div className="flex items-center justify-between bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-2xl p-3 text-xs text-emerald-800 dark:text-emerald-300 font-bold">
                <span className="flex items-center gap-1.5 truncate max-w-[220px]">
                  <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span className="truncate">{user.name || user.email || 'Google Hisob'}</span>
                </span>
                <button
                  onClick={() => {
                    logout();
                    onClose();
                  }}
                  className="bg-rose-100 hover:bg-rose-200 text-rose-700 dark:bg-rose-950/70 dark:text-rose-300 dark:hover:bg-rose-900 px-3 py-1.5 rounded-xl text-xs font-black transition-colors shrink-0 flex items-center gap-1 active:scale-95"
                >
                  <span>🚪</span>
                  <span>Chiqish (Exit)</span>
                </button>
              </div>
            )}
          </div>

          {/* Level Placement Trigger */}
          <div className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 mb-4 flex items-center justify-between">
            <div>
              <div className="text-xs font-bold text-slate-800 dark:text-slate-100 flex items-center gap-1.5">
                <Award className="w-4 h-4 text-amber-500" />
                <span>CEFR Daraja: {user.level}</span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                Darajangizni aniqlash uchun test topshiring
              </p>
            </div>
            <BouncyButton
              variant="outline"
              size="sm"
              className="dark:bg-slate-700 dark:text-slate-200 dark:border-slate-600"
              onClick={() => {
                onClose();
                onOpenLevelTest();
              }}
            >
              Testni boshlash
            </BouncyButton>
          </div>

          {/* Feedback & Suggestions Trigger */}
          {onOpenFeedback && (
            <div className="bg-blue-50/60 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800/60 rounded-2xl p-4 mb-4 flex items-center justify-between">
              <div>
                <div className="text-xs font-bold text-slate-800 dark:text-slate-100 flex items-center gap-1.5">
                  <MessageSquarePlus className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  <span>Taklif va Murojaat</span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                  Fikr-mulohazalaringizni adminga yuboring
                </p>
              </div>
              <BouncyButton
                variant="outline"
                size="sm"
                className="!text-blue-600 dark:!text-blue-400 !border-blue-300 dark:!border-blue-700 hover:!bg-blue-100/50"
                onClick={() => {
                  onClose();
                  onOpenFeedback();
                }}
              >
                Taklif bildirish
              </BouncyButton>
            </div>
          )}

          {/* Sound Toggle */}
          <div className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-3.5 mb-5 flex items-center justify-between">
            <span className="text-xs font-bold text-slate-700 dark:text-slate-200 flex items-center gap-2">
              {soundEnabled ? <Volume2 className="w-4 h-4 text-emerald-600" /> : <VolumeX className="w-4 h-4 text-slate-400" />}
              <span>Ovoz effektlari</span>
            </span>
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className={`w-11 h-6 rounded-full transition-colors relative ${
                soundEnabled ? 'bg-emerald-500' : 'bg-slate-300'
              }`}
            >
              <div
                className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-transform ${
                  soundEnabled ? 'right-1' : 'left-1'
                }`}
              />
            </button>
          </div>

          {/* Gemini AI API Key (Optional) */}
          <div className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 mb-5">
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Key className="w-3.5 h-3.5 text-blue-600" />
                <span>Google Gemini API Key (Ixtiyoriy):</span>
              </label>
              {keySaved && (
                <span className="text-[11px] font-bold text-emerald-600 flex items-center gap-1">
                  <CheckCircle className="w-3 h-3" /> Saqlandi!
                </span>
              )}
            </div>
            <div className="flex gap-2">
              <input
                type="password"
                value={keyInput}
                onChange={(e) => setKeyInput(e.target.value)}
                placeholder="AIzaSy..."
                className="flex-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="button"
                onClick={handleSaveKey}
                className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-3 py-1.5 rounded-xl transition-all"
              >
                Saqlash
              </button>
            </div>
          </div>

          {/* Writing History */}
          <div>
            <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5 mb-2">
              <BookOpen className="w-3.5 h-3.5 text-blue-600" />
              <span>Oldingi Topshirilgan Writinglar ({history.length}):</span>
            </h4>

            {history.length === 0 ? (
              <div className="text-center py-6 text-slate-400 text-xs bg-slate-50 dark:bg-slate-800 rounded-2xl border border-dashed border-slate-200 dark:border-slate-700">
                Hali birorta ham writing topshirilmagan.
              </div>
            ) : (
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {history.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => {
                      setActiveResult(item);
                      onClose();
                    }}
                    className="p-3 bg-slate-50 dark:bg-slate-800 hover:bg-blue-50/70 border border-slate-200 dark:border-slate-700 rounded-2xl cursor-pointer transition-all flex items-center justify-between"
                  >
                    <div>
                      <h5 className="font-bold text-xs text-slate-800 dark:text-slate-100 line-clamp-1">{item.topicTitle}</h5>
                      <div className="flex items-center gap-2 text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
                        <span>{item.wordCount} so'z</span>
                        <span>•</span>
                        <span>Ball: {item.overallScore}/5</span>
                      </div>
                    </div>
                    <span className="bg-amber-100 text-amber-800 text-[10px] font-black px-2 py-0.5 rounded-full flex items-center gap-1">
                      <Coins className="w-3 h-3" />+{item.coinsEarned}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

      </div>
    </div>
  );
};
