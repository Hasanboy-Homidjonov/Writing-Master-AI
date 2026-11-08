import React, { useState } from 'react';
import { KeyRound, AlertTriangle, ArrowRight } from 'lucide-react';
import { BouncyButton } from './BouncyButton';
import { sounds } from '../utils/audio';
import { VALID_ADMIN_PASSWORDS } from '../constants/admin';
import { useApp } from '../context/AppContext';

interface AdminPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const AdminPasswordModal: React.FC<AdminPasswordModalProps> = ({
  isOpen,
  onClose,
  onSuccess
}) => {
  const { t } = useApp();
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (VALID_ADMIN_PASSWORDS.includes(password.trim())) {
      sounds.playSuccess();
      setError(false);
      setPassword('');
      onSuccess();
    } else {
      sounds.playAlarm();
      setError(true);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-sm w-full p-6 sm:p-7 shadow-2xl border-2 border-amber-400/50 text-center relative overflow-hidden transition-colors">

        {/* Crown Icon */}
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-400 to-yellow-500 text-slate-950 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-yellow-500/30 text-2xl animate-bounce">
          👑
        </div>

        <h3 className="text-xl font-black text-slate-900 dark:text-white mb-1">
          {t.adminUnlockTitle}
        </h3>

        <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
          {t.adminUnlockDesc}
        </p>

        {error && (
          <div className="mb-4 bg-rose-50 dark:bg-rose-950/40 border border-rose-300 dark:border-rose-900 text-rose-700 dark:text-rose-300 p-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 animate-shake">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{t.adminUnlockError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <KeyRound className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="password"
              autoFocus
              required
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (error) setError(false);
              }}
              placeholder={t.adminPasswordPlaceholder}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl pl-10 pr-4 py-2.5 text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

          <div className="flex gap-2.5 pt-1">
            <BouncyButton
              type="button"
              variant="outline"
              size="md"
              className="flex-1 dark:bg-slate-800 dark:text-slate-200 dark:border-slate-700"
              onClick={onClose}
            >
              {t.cancel}
            </BouncyButton>

            <BouncyButton
              type="submit"
              variant="gold"
              size="md"
              pulseGlow={true}
              className="flex-1"
              icon={<ArrowRight className="w-4 h-4" />}
            >
              {t.enter}
            </BouncyButton>
          </div>
        </form>

      </div>
    </div>
  );
};
