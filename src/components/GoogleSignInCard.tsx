import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import {
  GOOGLE_CLIENT_ID,
  verifyGoogleCredentialOnServer,
  waitForGoogleScript
} from '../services/googleAuth';
import {
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Sparkles,
  Lock,
  X
} from 'lucide-react';
import { sounds } from '../utils/audio';

interface GoogleSignInCardProps {
  onSuccess?: () => void;
  canCancel?: boolean;
  onCancel?: () => void;
  isModal?: boolean;
}

export const GoogleSignInCard: React.FC<GoogleSignInCardProps> = ({
  onSuccess,
  canCancel = false,
  onCancel,
  isModal = false
}) => {
  const { loginWithGoogleAccount, t, theme } = useApp();

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isVerifying, setIsVerifying] = useState<boolean>(false);
  const [isSdkReady, setIsSdkReady] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  const [userName, setUserName] = useState<string>('');

  const googleBtnContainerRef = useRef<HTMLDivElement>(null);
  const isInitializedRef = useRef<boolean>(false);

  // 1. Google Credential (ID Token) qaytganda ishlovchi funksiya
  const handleCredentialResponse = async (response: { credential?: string }) => {
    if (!response || !response.credential) {
      setErrorMessage("Google'dan kirish tokeni olinmadi. Iltimos, qaytadan urining.");
      return;
    }

    setIsVerifying(true);
    setErrorMessage(null);

    try {
      const result = await verifyGoogleCredentialOnServer(response.credential);

      if (result.success && result.user) {
        setIsSuccess(true);
        setUserName(result.user.name);
        sounds.playSuccess();

        // 1 soniyadan so'ng foydalanuvchini platformaga kiritish
        setTimeout(() => {
          loginWithGoogleAccount(
            result.user!.name,
            result.user!.email,
            result.user!.avatar,
            result.sessionToken
          );
          if (onSuccess) onSuccess();
        }, 800);
      } else {
        setErrorMessage(
          result.error || "Google autentifikatsiyasida xatolik yuz berdi. Qayta urinib ko'ring."
        );
        sounds.playClick();
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Server bilan bog\'lanishda xatolik yuz berdi.');
    } finally {
      setIsVerifying(false);
    }
  };

  // 2. Google Identity Services (GIS) kutubxonasini ishga tushirish
  useEffect(() => {
    let mounted = true;

    const setupGoogle = async () => {
      setIsLoading(true);
      const isReady = await waitForGoogleScript(4000);

      if (!mounted) return;

      if (isReady && window.google?.accounts?.id) {
        try {
          window.google.accounts.id.initialize({
            client_id: GOOGLE_CLIENT_ID,
            callback: handleCredentialResponse,
            auto_select: false,
            cancel_on_tap_outside: true
          });
          isInitializedRef.current = true;

          // Rasmiy Google tugmasini render qilish
          if (googleBtnContainerRef.current) {
            googleBtnContainerRef.current.innerHTML = '';
            window.google.accounts.id.renderButton(googleBtnContainerRef.current, {
              theme: theme === 'dark' ? 'filled_black' : 'outline',
              size: 'large',
              text: 'continue_with',
              shape: 'pill',
              width: 320,
              logo_alignment: 'left'
            });
            setIsSdkReady(true);
          }

          // One-tap prompt taklif qilish
          window.google.accounts.id.prompt();
        } catch (e) {
          console.error('Error rendering Google button:', e);
          setIsSdkReady(false);
        }
      } else {
        console.warn('Google Identity Services SDK yuklanmadi');
        setIsSdkReady(false);
      }

      setIsLoading(false);
    };

    setupGoogle();

    return () => {
      mounted = false;
    };
  }, [theme]);

  // Maxsus tugma bosilganda Google oynasini chaqirish
  const triggerGooglePrompt = () => {
    sounds.playClick();
    setErrorMessage(null);

    if (window.google?.accounts?.id && isInitializedRef.current) {
      window.google.accounts.id.prompt((notification: any) => {
        if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
          // Agar OneTap bloklangan bo'lsa, rasmiy renderButton tugmasi orqali bosish
          const btn = googleBtnContainerRef.current?.querySelector('div[role="button"]') as HTMLElement;
          if (btn) btn.click();
        }
      });
    } else {
      // Agar SDK hali tayyor bo'lmasa, qayta urinish
      window.location.reload();
    }
  };

  return (
    <div
      className={`relative w-full max-w-md mx-auto rounded-3xl bg-white/95 dark:bg-slate-900/95 border border-slate-200 dark:border-slate-800 shadow-2xl backdrop-blur-xl p-6 sm:p-8 transition-all animate-fadeIn ${
        isModal ? 'max-h-[90vh] overflow-y-auto' : ''
      }`}
    >
      {/* Modal Close Button */}
      {canCancel && onCancel && (
        <button
          onClick={() => {
            sounds.playClick();
            onCancel();
          }}
          className="absolute top-5 right-5 p-2 rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100 transition-colors"
          title="Yopish"
        >
          <X className="w-5 h-5" />
        </button>
      )}

      {/* Brand Header */}
      <div className="text-center mb-6">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-3xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 text-white shadow-xl shadow-blue-500/25 text-3xl font-black mb-4 animate-bounce-subtle">
          ✍️
        </div>
        <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
          Writing Master <span className="text-blue-600 dark:text-blue-400">AI</span>
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 font-medium">
          {t.googleAuthSubtitle || 'Ingliz tili insho tekshirish va CEFR darajangizni oshirish tizimi'}
        </p>
      </div>

      {/* Muvaffaqiyatli kirish holati */}
      {isSuccess ? (
        <div className="py-8 text-center space-y-4 animate-scaleUp">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-700">
            <CheckCircle2 className="w-10 h-10 animate-pulse" />
          </div>
          <div>
            <h3 className="text-lg font-black text-slate-900 dark:text-white">
              Xush kelibsiz, {userName}! 🎉
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">
              Google orqali muvaffaqiyatli kirdingiz. Sahifa ochilmoqda...
            </p>
          </div>
        </div>
      ) : (
        /* Asosiy Kirish Bo'limi */
        <div className="space-y-5">
          {/* Xatolik xabari */}
          {errorMessage && (
            <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-xs text-rose-700 dark:text-rose-300 flex items-start gap-2.5 animate-shake">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-500 mt-0.5" />
              <div className="flex-1">
                <span className="font-bold">{errorMessage}</span>
              </div>
            </div>
          )}

          {/* Rasmiy Google Identity Services Tugmasi Kontayneri */}
          <div className="flex flex-col items-center justify-center min-h-[50px] w-full">
            {isVerifying ? (
              <div className="flex items-center justify-center gap-3 w-full py-3.5 px-6 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold text-sm">
                <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
                <span>Google hisobingiz tekshirilmoqda...</span>
              </div>
            ) : (
              <div className="w-full flex items-center justify-center">
                {/* 1. Rasmiy Google Identity Services tugmasi (SDK yuklanganda faqat shu ko'rinadi) */}
                <div
                  ref={googleBtnContainerRef}
                  className={`flex items-center justify-center w-full min-h-[44px] ${!isSdkReady ? 'hidden' : ''}`}
                />

                {/* 2. Zaxira tugma (Faqat SDK hali yuklanmagan yoki bloklangan bo'lsa bitta qilib ko'rinadi) */}
                {!isSdkReady && (
                  <button
                    type="button"
                    onClick={triggerGooglePrompt}
                    disabled={isLoading || isVerifying}
                    className="w-full flex items-center justify-center gap-3 py-3.5 px-5 rounded-2xl bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-750 text-slate-800 dark:text-white font-bold text-sm border-2 border-slate-200 dark:border-slate-700 shadow-md hover:shadow-lg transition-all active:scale-[0.98] group"
                  >
                    {/* Google Rasmiy Multi-color SVG Icon */}
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
                    <span>{t.signInWithGoogleBtn || 'Google orqali davom etish'}</span>
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Xavfsizlik va Ma'lumot Qutisi */}
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 space-y-2">
            <div className="flex items-center justify-center gap-1.5 text-[11px] font-bold text-slate-500 dark:text-slate-400">
              <ShieldCheck className="w-3.5 h-3.5 text-blue-500" />
              <span>Google Identity Services 2.0 • 256-bit SSL</span>
            </div>
            <p className="text-[10px] text-center text-slate-400 dark:text-slate-500 leading-relaxed">
              Parolingiz so'ralmaydi va serverda saqlanmaydi. Autentifikatsiya faqat rasmiy Google xizmati orqali xavfsiz amalga oshiriladi.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
