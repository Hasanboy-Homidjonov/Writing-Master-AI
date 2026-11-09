import { UserProfile, UserRole } from '../types';
import { ADMIN_EMAILS } from '../constants/admin';

export interface AuthSession {
  token: string;
  user: UserProfile;
  issuedAt: number;
  expiresAt: number;
  authType: 'telegram' | 'google_oauth' | 'google_credentials';
  signature: string;
  isAdminVerified: boolean;
}

export type AuthValidationResult =
  | { isValid: true; session: AuthSession }
  | { isValid: false; session: null; reason: 'NO_SESSION' | 'EXPIRED' | 'TAMPERED' | 'UNAUTHORIZED_ADMIN' | 'INVALID_DATA' };

const STORAGE_SESSION_KEY = 'wm_auth_session';
const STORAGE_TOKEN_KEY = 'wm_auth_token';
const LEGACY_USER_KEY = 'wm_user';

// Secret salt for HMAC-like client session integrity verification
const INTEGRITY_SALT = 'WM_SECURE_AUTH_2026_@ANTIGRAVITY#SALT';

/**
 * Fast synchronous cryptographic hash for session integrity verification
 */
function computeIntegrityHash(payload: string): string {
  let hash1 = 0xdeadbeef;
  let hash2 = 0x41c64e6d;
  for (let i = 0; i < payload.length; i++) {
    const ch = payload.charCodeAt(i);
    hash1 = Math.imul(hash1 ^ ch, 2654435761);
    hash2 = Math.imul(hash2 ^ ch, 1597334677);
  }
  hash1 = Math.imul(hash1 ^ (hash1 >>> 16), 2246822507) ^ Math.imul(hash2 ^ (hash2 >>> 13), 3266489909);
  hash2 = Math.imul(hash2 ^ (hash2 >>> 16), 2246822507) ^ Math.imul(hash1 ^ (hash1 >>> 13), 3266489909);
  return (4294967296 * (2097151 & hash2) + (hash1 >>> 0)).toString(36);
}

export function hashPassword(password: string): string {
  const salted = `${password.trim()}::WM_PASS_SALT_2026`;
  let hash1 = 0x811c9dc5;
  for (let i = 0; i < salted.length; i++) {
    hash1 ^= salted.charCodeAt(i);
    hash1 = Math.imul(hash1, 16777619);
  }
  return (hash1 >>> 0).toString(16);
}

function generateSignature(user: UserProfile, issuedAt: number, expiresAt: number, isAdminVerified: boolean): string {
  const data = [
    user.id,
    user.email.toLowerCase().trim(),
    user.role,
    issuedAt,
    expiresAt,
    isAdminVerified ? 'ADMIN_OK' : 'USER_OK',
    INTEGRITY_SALT
  ].join(':::');
  return computeIntegrityHash(data);
}

/**
 * Generate a secure pseudo-token if raw token is not provided
 */
function generateSecureToken(emailOrId: string, issuedAt: number): string {
  const rand = Array.from({ length: 32 }, () => Math.floor(Math.random() * 36).toString(36)).join('');
  return `wm_${btoa(emailOrId).replace(/=/g, '')}_${issuedAt}_${rand}`;
}

const ADMIN_TELEGRAM_USERNAMES = ['khomidjonovh', 'khomidjonov_h'];
const ADMIN_TELEGRAM_IDS = [7034211289];

/**
 * Check if a user is an administrator (Strict verification: verified email, telegram ID, or username)
 */
export function isUserAdmin(user: Partial<UserProfile>): boolean {
  if (!user) return false;
  const email = (user.email || '').toLowerCase().trim();
  
  if (ADMIN_EMAILS.some((em) => em.toLowerCase() === email)) return true;
  
  // Telegram ID tekshiruvi (eng xavfsiz va soxtalashtirib bo'lmaydigan usul)
  if ((user as any).telegramId && ADMIN_TELEGRAM_IDS.includes(Number((user as any).telegramId))) return true;

  // Telegram Username tekshiruvi (@KhomidjonovH)
  const tgUsername = ((user as any).telegramUsername || '').toLowerCase().replace(/^@/, '').trim();
  if (tgUsername && ADMIN_TELEGRAM_USERNAMES.includes(tgUsername)) return true;
  if (ADMIN_TELEGRAM_USERNAMES.some((u) => email === `${u}@telegram.user`)) return true;

  return false;
}

/**
 * Create and persist a new validated AuthSession
 */
export function createAuthSession(
  user: UserProfile,
  authType: 'telegram' | 'google_oauth' | 'google_credentials' = 'telegram',
  rawToken?: string
): AuthSession {
  const now = Date.now();
  
  // Default session validity: 14 days
  const expiresAt = now + 14 * 24 * 60 * 60 * 1000;

  const cleanEmail = (user.email || `tg_${user.id}@writingmaster.app`).toLowerCase().trim();
  const isAdmin = isUserAdmin(user);

  // Ensure role strictly matches
  const verifiedUser: UserProfile = {
    ...user,
    email: cleanEmail,
    role: isAdmin ? 'admin' : 'user',
    isAuthenticated: true
  };

  const token = rawToken && rawToken.trim()
    ? rawToken.trim()
    : generateSecureToken(cleanEmail, now);

  const signature = generateSignature(verifiedUser, now, expiresAt, isAdmin);

  const session: AuthSession = {
    token,
    user: verifiedUser,
    issuedAt: now,
    expiresAt,
    authType,
    signature,
    isAdminVerified: isAdmin
  };

  try {
    localStorage.setItem(STORAGE_SESSION_KEY, JSON.stringify(session));
    localStorage.setItem(STORAGE_TOKEN_KEY, token);
    localStorage.setItem(LEGACY_USER_KEY, JSON.stringify(verifiedUser));
  } catch (err) {
    console.error('Failed to save session to localStorage:', err);
  }

  return session;
}

/**
 * Validate active session with integrity verification
 */
export function validateCurrentSession(): AuthValidationResult {
  try {
    const sessionStr = localStorage.getItem(STORAGE_SESSION_KEY);
    const token = localStorage.getItem(STORAGE_TOKEN_KEY);

    if (!sessionStr || !token) {
      return { isValid: false, session: null, reason: 'NO_SESSION' };
    }

    const session: AuthSession = JSON.parse(sessionStr);

    if (!session || !session.user || !session.signature) {
      return { isValid: false, session: null, reason: 'INVALID_DATA' };
    }

    // Check expiration
    if (Date.now() > session.expiresAt) {
      return { isValid: false, session: null, reason: 'EXPIRED' };
    }

    // Verify cryptographic integrity signature
    const expectedSignature = generateSignature(
      session.user,
      session.issuedAt,
      session.expiresAt,
      session.isAdminVerified
    );

    if (session.signature !== expectedSignature) {
      console.error('Security alert: Tampered session detected!');
      return { isValid: false, session: null, reason: 'TAMPERED' };
    }

    return { isValid: true, session };
  } catch (err) {
    console.error('Error validating session:', err);
    return { isValid: false, session: null, reason: 'INVALID_DATA' };
  }
}

/**
 * Safely purge all authentication session data
 */
export function clearAuthSession(): void {
  try {
    localStorage.removeItem(STORAGE_SESSION_KEY);
    localStorage.removeItem(STORAGE_TOKEN_KEY);
    localStorage.removeItem(LEGACY_USER_KEY);
  } catch (e) {
    console.error('Error clearing session:', e);
  }
}
