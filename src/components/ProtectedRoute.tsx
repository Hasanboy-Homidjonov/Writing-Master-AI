import React from 'react';
import { useApp } from '../context/AppContext';
import { validateCurrentSession } from '../services/authGuard';
import { AuthScreen } from './AuthScreen';
import { ShieldAlert, ArrowLeft } from 'lucide-react';
import { BouncyButton } from './BouncyButton';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'admin' | 'user';
  onAccessDenied?: () => void;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredRole = 'user',
  onAccessDenied
}) => {
  const { user, isAdmin } = useApp();

  // 1. Verify session validity and token integrity
  const sessionResult = validateCurrentSession();

  // If not authenticated or session is invalid/expired
  if (!sessionResult.isValid || !user.isAuthenticated) {
    return <AuthScreen />;
  }

  // 2. If admin role is required, enforce strict authorization
  if (requiredRole === 'admin' && !isAdmin) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white dark:bg-slate-900 border border-rose-200 dark:border-rose-900/50 rounded-3xl p-6 sm:p-8 text-center shadow-2xl">
          <div className="w-16 h-16 rounded-2xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 flex items-center justify-center text-rose-600 mx-auto mb-4">
            <ShieldAlert className="w-8 h-8" />
          </div>

          <h2 className="text-xl font-extrabold text-slate-900 dark:text-white mb-2">
            Ruxsat berilmadi (403 Forbidden)
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-6 leading-relaxed">
            Ushbu bo'lim faqat Writing Master rasmiy administratori (Hasanboy) uchun ajratilgan. Sizning hisobingiz ushbu sahifaga kirish huquqiga ega emas.
          </p>

          <BouncyButton
            variant="primary"
            size="md"
            onClick={onAccessDenied}
            icon={<ArrowLeft className="w-4 h-4" />}
            className="w-full !py-3 text-xs font-bold"
          >
            Bosh sahifaga qaytish
          </BouncyButton>
        </div>
      </div>
    );
  }

  // Session is completely valid & authorized
  return <>{children}</>;
};
