import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import {
  createTelegramLoginSession,
  checkTelegramLoginStatus,
  resolveTelegramHashAuth,
  BOT_USERNAME,
  TelegramAuthUser
} from '../services/telegramAuth';
import {
  ShieldCheck,
  CheckCircle2,
  XCircle,
  ExternalLink,
  Loader2,
  Send,
  RefreshCw
} from 'lucide-react';

interface TelegramSignInCardProps {
  onSuccess?: () => void;
  canCancel?: boolean;
  onCancel?: () => void;
  isModal?: boolean;
}

export const TelegramSignInCard: React.FC<TelegramSignInCardProps> = ({
  onSuccess,
  canCancel = false,
  onCancel,
  isModal = false
}) => {
  const { loginWithTelegramAccount, t } = useApp();

  const [sessionCode, setSessionCode] = useState<string>('');
  const [deepLink, setDeepLink] = useState<string>(`https://t.me/${BOT_USERNAME}`);
  const [authStatus, setAuthStatus] = useState<'waiting' | 'confirmed' | 'rejected'>('waiting');
  const [confirmedUser, setConfirmedUser] = useState<TelegramAuthUser | null>(null);

  const pollTimerRef = useRef<any>(null);

  // 1. Initial Session Creation & URL Hash Check
  const initSession = async (forceNew = false) => {
    // Agar hozirgina Chiqish (Logout) qilingan bo'lsa, eski sessiyalarni bekor qilib yangi sessiya ochish
    const justLoggedOut = sessionStorage.getItem('wm_just_logged_out');
    if (justLoggedOut === 'true') {
      sessionStorage.removeItem('wm_just_logged_out');
      forceNew = true;
    }

    // A) URL Hash tekshirish
    if (!forceNew) {
      const hashResult = await resolveTelegramHashAuth();
      if (hashResult?.user) {
        handleCompleteAuth(hashResult.user);
        return;
      }
      if (hashResult?.rejected) {
        setAuthStatus('rejected');
        return;
      }
    }

    // B) Mavjud sessiyani qayta ishlatish (Live Server qayta yuklanishini oldini olish)
    if (!forceNew) {
      const existingCode = sessionStorage.getItem('wm_tg_session_code');
      const existingLink = sessionStorage.getItem('wm_tg_deep_link');
      if (existingCode && existingLink) {
        setSessionCode(existingCode);
        setDeepLink(existingLink);
        setAuthStatus('waiting');
        return;
      }
    }

    setAuthStatus('waiting');
    setConfirmedUser(null);
    const sessionData = await createTelegramLoginSession();
    if (sessionData.code) {
      setSessionCode(sessionData.code);
      sessionStorage.setItem('wm_tg_session_code', sessionData.code);
    }
    if (sessionData.deepLink) {
      setDeepLink(sessionData.deepLink);
      sessionStorage.setItem('wm_tg_deep_link', sessionData.deepLink);
    }
  };

  const handleCompleteAuth = (user: TelegramAuthUser) => {
    if (pollTimerRef.current) {
      clearInterval(pollTimerRef.current);
      pollTimerRef.current = null;
    }
    setConfirmedUser(user);
    setAuthStatus('confirmed');

    // Muvaffaqiyatli kirilgach, vaqtinchalik kirish kodini tozalaymiz
    // Bu 'Chiqish' qilinganda eski kod bo'yicha yana avtomatik kirib ketishni 100% to'xtatadi
    try {
      sessionStorage.removeItem('wm_tg_session_code');
      sessionStorage.removeItem('wm_tg_deep_link');
      sessionStorage.removeItem('wm_just_logged_out');
    } catch (e) {}

    // Orqa fondagi sayt oynasini darhol mavzular bo'limiga kiritish
    loginWithTelegramAccount(user);
    if (onSuccess) {
      onSuccess();
    }
  };

  useEffect(() => {
    initSession();

    // URL hash o'zgarishini kuzatish
    const handleHashChange = async () => {
      const hashResult = await resolveTelegramHashAuth();
      if (hashResult?.user) {
        handleCompleteAuth(hashResult.user);
      } else if (hashResult?.rejected) {
        setAuthStatus('rejected');
      }
    };
    window.addEventListener('hashchange', handleHashChange);

    return () => {
      window.removeEventListener('hashchange', handleHashChange);
      if (pollTimerRef.current) {
        clearInterval(pollTimerRef.current);
        pollTimerRef.current = null;
      }
    };
  }, []);

  // 2. Telegram Botdan tasdiq kutilishi (Real-time polling va Tabga qaytish hodisalari)
  useEffect(() => {
    if (!sessionCode || authStatus !== 'waiting') return;

    if (pollTimerRef.current) {
      clearInterval(pollTimerRef.current);
      pollTimerRef.current = null;
    }

    const checkNow = async () => {
      const res = await checkTelegramLoginStatus(sessionCode);

      if (res.status === 'confirmed' && res.user) {
        if (pollTimerRef.current) {
          clearInterval(pollTimerRef.current);
          pollTimerRef.current = null;
        }
        handleCompleteAuth(res.user);
      } else if (res.status === 'rejected') {
        if (pollTimerRef.current) {
          clearInterval(pollTimerRef.current);
          pollTimerRef.current = null;
        }
        setAuthStatus('rejected');
      }
    };

    // Har 1 soniyada orqa fonda tekshirish
    pollTimerRef.current = setInterval(checkNow, 1000);

    // Foydalanuvchi Telegramdan brauzer tabiga qaytganida DARHOL tekshirish
    const onWindowFocus = () => {
      checkNow();
    };
    const onVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        checkNow();
      }
    };

    window.addEventListener('focus', onWindowFocus);
    document.addEventListener('visibilitychange', onVisibilityChange);

    return () => {
      if (pollTimerRef.current) {
        clearInterval(pollTimerRef.current);
        pollTimerRef.current = null;
      }
      window.removeEventListener('focus', onWindowFocus);
      document.removeEventListener('visibilitychange', onVisibilityChange);
    };
  }, [sessionCode, authStatus]);

  return (
    <div
      className={`w-full max-w-md mx-auto ${
        isModal
          ? 'bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-100 dark:border-slate-800'
          : 'bg-slate-900/95 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl'
      } relative overflow-hidden transition-all`}
    >
      {/* Top Telegram Header */}
      <div className="text-center mb-6">
        <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-[#2AABEE] to-[#229ED9] flex items-center justify-center mx-auto mb-3 shadow-lg shadow-[#229ED9]/30 text-white">
          <svg className="w-9 h-9 fill-current -ml-0.5" viewBox="0 0 24 24">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 00-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.74-.55 2.92-1.27 4.86-2.11 5.83-2.51 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .38z" />
          </svg>
        </div>

        <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
          Telegram orqali xavfsiz kirish
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed">
          Writing Master platformasiga rasmiy <span className="text-[#2AABEE] font-bold">@{BOT_USERNAME}</span> orqali kiring
        </p>
      </div>

      {/* Main Interactive State */}
      <div className="py-2">
        {authStatus === 'confirmed' ? (
          <div className="flex flex-col items-center justify-center py-6 space-y-3 animate-fadeIn text-emerald-500">
            <CheckCircle2 className="w-14 h-14 animate-bounce" />
            <p className="text-base font-black text-slate-800 dark:text-slate-100 text-center">
              Kirish muvaffaqiyatli tasdiqlandi!
            </p>
            <p className="text-xs text-slate-400 text-center font-medium">
              Xush kelibsiz, <span className="font-bold text-emerald-400">{confirmedUser?.name}</span>{' '}
              ({confirmedUser?.role === 'admin' ? 'Admin Hasanboy' : 'Talaba'})
            </p>
            <span className="text-[11px] text-slate-500">Platformaga yo'naltirilmoqda...</span>
          </div>
        ) : authStatus === 'rejected' ? (
          <div className="space-y-4 animate-fadeIn">
            <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-center space-y-2">
              <div className="flex items-center justify-center gap-2 text-xs font-bold text-rose-500">
                <XCircle className="w-5 h-5" />
                <span>Kirish so'rovi bekor qilindi</span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Siz Telegram botda «❌ Yo'q, bekor qilish» tugmasini bosdingiz. Platformaga kirish uchun qaytadan botga o'ting.
              </p>
            </div>

            <button
              type="button"
              onClick={() => initSession(true)}
              className="w-full h-[46px] flex items-center justify-center gap-2 bg-[#229ED9] hover:bg-[#1E88C7] text-white font-bold rounded-2xl text-xs transition-all active:scale-[0.98] shadow-md shadow-[#229ED9]/20"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Qaytadan urinish</span>
            </button>
          </div>
        ) : (
          <div className="space-y-4 animate-fadeIn">
            {/* Step 1: Open Bot Button */}
            <a
              href={deepLink}
              target="_blank"
              rel="noreferrer"
              className="w-full h-[52px] flex items-center justify-center gap-2.5 px-6 bg-gradient-to-r from-[#2AABEE] to-[#229ED9] hover:from-[#229ED9] hover:to-[#1E88C7] active:scale-[0.98] text-white font-black rounded-2xl shadow-xl shadow-[#229ED9]/25 transition-all text-sm group"
            >
              <Send className="w-4 h-4 shrink-0 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              <span>Telegram botni ochish (@{BOT_USERNAME})</span>
              <ExternalLink className="w-3.5 h-3.5 opacity-80" />
            </a>

            {/* Step 2: Waiting For Bot Confirmation */}
            <div className="p-4 rounded-2xl bg-blue-500/5 dark:bg-blue-500/10 border border-blue-500/20 text-center space-y-2.5">
              <div className="flex items-center justify-center gap-2 text-xs font-bold text-blue-500 dark:text-blue-400">
                <Loader2 className="w-4 h-4 animate-spin shrink-0 text-[#2AABEE]" />
                <span>Telegram botdan tasdiqlash kutilmoqda...</span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                Yuqoridagi tugma orqali botga o'ting va bot ichida{' '}
                <strong className="text-emerald-500 dark:text-emerald-400">«✅ Ha, kiraman»</strong> tugmasini bosing.
              </p>
              <p className="text-[11px] text-slate-400 dark:text-slate-500 italic">
                Telegram hisobingiz profilingizga aylanadi va ushbu sahifa avtomatik ravishda ochiladi.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Security Footer Notice */}
      <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-col items-center gap-1 text-center">
        <div className="flex items-center gap-1.5 text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Telegram Rasmiy Autentifikatsiyasi (@{BOT_USERNAME})</span>
        </div>
        <p className="text-[10px] text-slate-400 dark:text-slate-500 max-w-xs">
          Parolingiz so'ralmaydi va saqlanmaydi. Autentifikatsiya faqat sizning rasmiy Telegram profilingiz orqali amalga oshiriladi.
        </p>
      </div>

      {canCancel && onCancel && (
        <button
          type="button"
          onClick={onCancel}
          className="w-full mt-4 text-center text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 font-semibold transition-colors"
        >
          {t.cancel}
        </button>
      )}
    </div>
  );
};
