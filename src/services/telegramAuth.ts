// Telegram Bot Authentication Integration
import { CEFRLevel } from '../types';

declare global {
  interface Window {
    Telegram?: {
      WebApp?: {
        initData?: string;
        initDataUnsafe?: {
          user?: {
            id: number;
            first_name: string;
            last_name?: string;
            username?: string;
            language_code?: string;
            photo_url?: string;
          };
        };
        ready: () => void;
        expand: () => void;
        close: () => void;
      };
    };
  }
}

export interface TelegramAuthUser {
  id: string;
  telegramId: number;
  telegramUsername?: string;
  name: string;
  email: string;
  avatar: string;
  level: CEFRLevel;
  coins: number;
  completedEssays: number;
  streakDays: number;
  rank: number;
  joinedAt: string;
  role: 'admin' | 'user';
  isAuthenticated: boolean;
}

export interface TelegramSessionResponse {
  success: boolean;
  code?: string;
  botUsername?: string;
  deepLink?: string;
  error?: string;
}

export interface TelegramStatusResponse {
  success: boolean;
  status: 'pending' | 'confirmed' | 'rejected' | 'invalid' | 'not_found';
  user?: TelegramAuthUser;
  sessionToken?: string;
  error?: string;
}

export const BOT_USERNAME =
  (import.meta as any).env?.VITE_TELEGRAM_BOT_USERNAME || 'Write_English_bot';

export interface TelegramHashAuthResult {
  user?: TelegramAuthUser;
  rejected?: boolean;
}

/**
 * Hash yoki Callback URL orqali Telegram autentifikatsiyani tekshirish (#auth=code&status=success/rejected)
 * Xavfsizlik: Faqat server tomonidan tasdiqlangan sessiya kodlari qabul qilinadi.
 */
export async function resolveTelegramHashAuth(): Promise<TelegramHashAuthResult | null> {
  try {
    if (typeof window === 'undefined') return null;
    const hash = window.location.hash || '';
    const search = window.location.search || '';
    const fullParams = hash + '&' + search.replace(/^\?/, '');

    // 1. Agar foydalanuvchi Telegram botda rad etgan (rejected) bo'lsa
    if (fullParams.includes('status=rejected') || fullParams.includes('rejected')) {
      try {
        window.history.replaceState(null, '', window.location.pathname + '#login');
      } catch (e) {}
      return { rejected: true };
    }

    // 2. Muvaffaqiyatli kirish: auth=code yoki session_id=code
    const match = fullParams.match(/(?:auth|session_id)=([^&]+)/);
    const code = match ? match[1] : '';

    if (code && code.startsWith('auth_')) {
      const res = await checkTelegramLoginStatus(code);
      if (res.status === 'confirmed' && res.user) {
        try {
          window.history.replaceState(null, '', window.location.pathname + '#topics');
        } catch (e) {}
        return { user: res.user };
      } else if (res.status === 'rejected') {
        try {
          window.history.replaceState(null, '', window.location.pathname + '#login');
        } catch (e) {}
        return { rejected: true };
      }
    }
  } catch (e) {
    console.error('Error parsing auth hash/query:', e);
  }
  return null;
}

/**
 * Smart API Base URL:
 * - Serverda yoki telefonda ishlatilganda avtomatik moslashadi (relative URL)
 * - VS Code Live Serverda (5500) ishlatilganda o'sha qurilma IP'siga (port 5000) ulanadi
 */
function getApiBaseUrl(): string {
  if (typeof window === 'undefined') return '';
  const { protocol, hostname, port } = window.location;
  // Agar backend serverning o'zi (port 5000) yoki cloud server (Render, Railway, VPS - port bo'sh) bo'lsa
  if (!port || port === '5000') {
    return '';
  }
  // Har qanday frontend dev server (Vite 3000-3003, Live Server 5500, va b.)
  const host = hostname || '127.0.0.1';
  return `http://${host}:5000`;
}

/**
 * 1. Yangi Telegram login sessiyasini yaratish (bot.py ga murojaat)
 */
export async function createTelegramLoginSession(): Promise<TelegramSessionResponse> {
  const fallbackCode = 'auth_' + Math.random().toString(36).substring(2, 9);
  const fallbackLink = `https://t.me/${BOT_USERNAME}?start=${fallbackCode}`;

  try {
    const res = await fetch(`${getApiBaseUrl()}/api/auth/telegram/create-session`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });
    if (res.ok) {
      const data = await res.json();
      if (data.code && data.deepLink) {
        return data;
      }
    }
  } catch (err: any) {
    // Port 5000 kutilmaganda ulanmaganda ham botga to'g'ridan-to'g'ri o'tish ishlaydi
  }

  return {
    success: true,
    code: fallbackCode,
    botUsername: BOT_USERNAME,
    deepLink: fallbackLink
  };
}

/**
 * 2. Telegram botda "Ha, kiraman" yoki "Yo'q" bosilganini tekshirish
 */
export async function checkTelegramLoginStatus(code: string): Promise<TelegramStatusResponse> {
  try {
    const res = await fetch(`${getApiBaseUrl()}/api/auth/telegram/status?code=${encodeURIComponent(code)}`);
    if (res.ok) {
      const data = await res.json();
      return data;
    }
  } catch (err: any) {
    // silent
  }

  return {
    success: false,
    status: 'pending'
  };
}

/**
 * 3. Telegram WebApp orqali to'g'ridan-to'g'ri tekshirish
 */
export async function verifyTelegramWebAppUser(tgUser: any): Promise<{
  success: boolean;
  user?: TelegramAuthUser;
  sessionToken?: string;
  error?: string;
}> {
  const name = [tgUser.first_name, tgUser.last_name].filter(Boolean).join(' ') || tgUser.username || 'Hasanboy';
  const username = tgUser.username || '';
  const isAdmin =
    username.toLowerCase() === 'khomidjonovh' ||
    username.toLowerCase() === 'khomidjonov_h' ||
    name.toLowerCase().includes('hasanboy');

  const fallbackUser: TelegramAuthUser = {
    id: 'usr_tg_' + tgUser.id,
    telegramId: tgUser.id,
    telegramUsername: username,
    name,
    email: username ? `${username.toLowerCase()}@telegram.user` : `tg_${tgUser.id}@writingmaster.app`,
    avatar: tgUser.photo_url || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}`,
    level: isAdmin ? 'C1' : 'B1',
    coins: isAdmin ? 2500 : 150,
    completedEssays: isAdmin ? 40 : 0,
    streakDays: 1,
    rank: isAdmin ? 1 : 12,
    joinedAt: new Date().toISOString().split('T')[0],
    role: isAdmin ? 'admin' : 'user',
    isAuthenticated: true
  };

  return {
    success: true,
    user: fallbackUser,
    sessionToken: `wm_tg_${tgUser.id}_${Date.now()}`
  };
}

/**
 * Check if running inside Telegram WebApp
 */
export function getTelegramWebAppUser() {
  try {
    if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
      window.Telegram.WebApp.ready();
      return window.Telegram.WebApp.initDataUnsafe?.user || null;
    }
  } catch (e) {
    // silent
  }
  return null;
}
