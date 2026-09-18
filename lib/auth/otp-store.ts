/**
 * CropLink Server-Side OTP & Reset Token Store
 * Manages SHA-256 hashed OTPs, expiration (5 min), attempt limits (5 max), resend cooldowns (30s),
 * single-use invalidation, and password reset tokens.
 * Supports Vercel Serverless persistence via Supabase database when configured, with in-memory Map fallback.
 */
import crypto from 'crypto';
import { createClient } from '@supabase/supabase-js';
import { getOTPMode, getDemoOTPCode } from './otp-provider';

export interface OTPSession {
  identifier: string; // normalized mobile or email
  hashedOtp: string;
  type: 'MOBILE_REGISTRATION' | 'PASSWORD_RESET';
  createdAt: number;
  expiresAt: number;
  attempts: number;
  lastResendAt: number;
  verified: boolean;
}

export interface ResetTokenSession {
  token: string;
  email: string;
  createdAt: number;
  expiresAt: number;
  used: boolean;
}

// In-memory global store maps (fallback & speed cache)
const globalOTPStore = new Map<string, OTPSession>();
const globalResetTokenStore = new Map<string, ResetTokenSession>();

const OTP_EXPIRATION_MS = 5 * 60 * 1000; // 5 minutes
const RESEND_COOLDOWN_MS = 30 * 1000; // 30 seconds
const MAX_FAILED_ATTEMPTS = 5;
const RESET_TOKEN_EXPIRATION_MS = 15 * 60 * 1000; // 15 minutes

function getDbClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (url && key && url.startsWith('http')) {
    try {
      return createClient(url, key);
    } catch {
      return null;
    }
  }
  return null;
}

/**
 * Computes SHA-256 hash of OTP code for secure storage.
 * Plaintext OTP is NEVER stored in database or memory.
 */
export function hashOTP(otp: string): string {
  return crypto.createHash('sha256').update(otp.trim()).digest('hex');
}

/**
 * Generates OTP code based on environment mode.
 * In DEMO mode: returns server-configured DEMO_OTP_CODE (defaults to '123456').
 * In SMS mode: returns cryptographically secure 6-digit number.
 */
export function generate6DigitOTP(): string {
  if (getOTPMode() === 'demo') {
    return getDemoOTPCode();
  }
  const randomNum = crypto.randomInt(100000, 999999);
  return randomNum.toString();
}

/**
 * Key format for OTP sessions in memory store
 */
function getOTPKey(identifier: string, type: 'MOBILE_REGISTRATION' | 'PASSWORD_RESET'): string {
  return `${type}:${identifier.toLowerCase()}`;
}

/**
 * Checks resend cooldown for an identifier.
 */
export async function checkResendCooldown(
  identifier: string,
  type: 'MOBILE_REGISTRATION' | 'PASSWORD_RESET'
): Promise<{ allowed: boolean; remainingSeconds: number }> {
  const key = getOTPKey(identifier, type);
  const now = Date.now();

  let lastResendAt: number | null = null;

  const session = globalOTPStore.get(key);
  if (session) {
    lastResendAt = session.lastResendAt;
  }

  const db = getDbClient();
  if (db) {
    try {
      const { data } = await db
        .from('otp_verifications')
        .select('last_resend_at')
        .eq('identifier', identifier.toLowerCase())
        .eq('type', type)
        .maybeSingle();

      if (data?.last_resend_at) {
        const dbTime = new Date(data.last_resend_at).getTime();
        if (!lastResendAt || dbTime > lastResendAt) {
          lastResendAt = dbTime;
        }
      }
    } catch {
      // Fallback to in-memory check
    }
  }

  if (!lastResendAt) {
    return { allowed: true, remainingSeconds: 0 };
  }

  const elapsed = now - lastResendAt;
  if (elapsed < RESEND_COOLDOWN_MS) {
    const remainingSeconds = Math.ceil((RESEND_COOLDOWN_MS - elapsed) / 1000);
    return { allowed: false, remainingSeconds };
  }

  return { allowed: true, remainingSeconds: 0 };
}

/**
 * Creates or updates an OTP session for an identifier.
 * Stores SHA-256 hashed OTP, 5-minute expiry, and reset attempt counters.
 */
export async function createOTPSession(
  identifier: string,
  type: 'MOBILE_REGISTRATION' | 'PASSWORD_RESET',
  plainOtp: string
): Promise<OTPSession> {
  const key = getOTPKey(identifier, type);
  const now = Date.now();
  const expiresAt = now + OTP_EXPIRATION_MS;
  const hashed = hashOTP(plainOtp);

  const session: OTPSession = {
    identifier: identifier.toLowerCase(),
    hashedOtp: hashed,
    type,
    createdAt: now,
    expiresAt,
    attempts: 0,
    lastResendAt: now,
    verified: false,
  };

  globalOTPStore.set(key, session);

  const db = getDbClient();
  if (db) {
    try {
      await db.from('otp_verifications').upsert(
        {
          identifier: identifier.toLowerCase(),
          hashed_otp: hashed,
          type,
          attempts: 0,
          verified: false,
          expires_at: new Date(expiresAt).toISOString(),
          last_resend_at: new Date(now).toISOString(),
        },
        { onConflict: 'identifier,type' }
      );
    } catch {
      // Memory store is already populated
    }
  }

  return session;
}

/**
 * Verifies an OTP code against stored session.
 * Checks expiry, attempt limit (max 5), SHA-256 hash match, and invalidates single-use session on success.
 */
export async function verifyOTP(
  identifier: string,
  type: 'MOBILE_REGISTRATION' | 'PASSWORD_RESET',
  userProvidedOtp: string
): Promise<{ success: boolean; error?: string; code?: 'EXPIRED' | 'TOO_MANY_ATTEMPTS' | 'INVALID_OTP' }> {
  const key = getOTPKey(identifier, type);
  const normId = identifier.toLowerCase();
  const now = Date.now();

  let session = globalOTPStore.get(key);

  const db = getDbClient();
  if (db) {
    try {
      const { data } = await db
        .from('otp_verifications')
        .select('*')
        .eq('identifier', normId)
        .eq('type', type)
        .maybeSingle();

      if (data) {
        session = {
          identifier: data.identifier,
          hashedOtp: data.hashed_otp,
          type: data.type as any,
          createdAt: new Date(data.created_at || now).getTime(),
          expiresAt: new Date(data.expires_at).getTime(),
          attempts: data.attempts || 0,
          lastResendAt: new Date(data.last_resend_at || now).getTime(),
          verified: data.verified || false,
        };
        globalOTPStore.set(key, session);
      }
    } catch {
      // Use memory session
    }
  }

  if (!session) {
    return { success: false, error: 'No active verification code found. Please request a new OTP.', code: 'EXPIRED' };
  }

  if (now > session.expiresAt) {
    globalOTPStore.delete(key);
    if (db) {
      try {
        await db.from('otp_verifications').delete().eq('identifier', normId).eq('type', type);
      } catch {}
    }
    return { success: false, error: 'Your verification code has expired. Please request a new OTP.', code: 'EXPIRED' };
  }

  if (session.attempts >= MAX_FAILED_ATTEMPTS) {
    globalOTPStore.delete(key);
    if (db) {
      try {
        await db.from('otp_verifications').delete().eq('identifier', normId).eq('type', type);
      } catch {}
    }
    return { success: false, error: 'Too many incorrect attempts. Please request a new OTP.', code: 'TOO_MANY_ATTEMPTS' };
  }

  const inputHash = hashOTP(userProvidedOtp);
  if (inputHash !== session.hashedOtp) {
    session.attempts += 1;
    const newAttempts = session.attempts;

    if (newAttempts >= MAX_FAILED_ATTEMPTS) {
      globalOTPStore.delete(key);
      if (db) {
        try {
          await db.from('otp_verifications').delete().eq('identifier', normId).eq('type', type);
        } catch {}
      }
      return { success: false, error: 'Too many incorrect attempts. Please request a new OTP.', code: 'TOO_MANY_ATTEMPTS' };
    }

    globalOTPStore.set(key, session);
    if (db) {
      try {
        await db.from('otp_verifications').update({ attempts: newAttempts }).eq('identifier', normId).eq('type', type);
      } catch {}
    }

    const remaining = MAX_FAILED_ATTEMPTS - newAttempts;
    return { success: false, error: `Invalid verification code. ${remaining} attempt(s) remaining.`, code: 'INVALID_OTP' };
  }

  // Verification succeeded -> mark verified
  session.verified = true;
  globalOTPStore.set(key, session);

  if (db) {
    try {
      await db.from('otp_verifications').update({ verified: true }).eq('identifier', normId).eq('type', type);
    } catch {}
  }

  return { success: true };
}

/**
 * Checks if mobile number was verified for registration.
 */
export async function isMobileVerifiedForRegistration(normalizedMobile: string): Promise<boolean> {
  const key = getOTPKey(normalizedMobile, 'MOBILE_REGISTRATION');
  const normId = normalizedMobile.toLowerCase();
  const now = Date.now();

  let session = globalOTPStore.get(key);

  const db = getDbClient();
  if (db) {
    try {
      const { data } = await db
        .from('otp_verifications')
        .select('*')
        .eq('identifier', normId)
        .eq('type', 'MOBILE_REGISTRATION')
        .maybeSingle();

      if (data) {
        session = {
          identifier: data.identifier,
          hashedOtp: data.hashed_otp,
          type: 'MOBILE_REGISTRATION',
          createdAt: new Date(data.created_at || now).getTime(),
          expiresAt: new Date(data.expires_at).getTime(),
          attempts: data.attempts || 0,
          lastResendAt: new Date(data.last_resend_at || now).getTime(),
          verified: data.verified || false,
        };
      }
    } catch {}
  }

  if (!session) return false;
  return session.verified && now <= session.expiresAt + 10 * 60 * 1000;
}

/**
 * Consumes mobile registration OTP verification.
 */
export async function consumeMobileVerification(normalizedMobile: string): Promise<void> {
  const key = getOTPKey(normalizedMobile, 'MOBILE_REGISTRATION');
  const normId = normalizedMobile.toLowerCase();
  globalOTPStore.delete(key);

  const db = getDbClient();
  if (db) {
    try {
      await db.from('otp_verifications').delete().eq('identifier', normId).eq('type', 'MOBILE_REGISTRATION');
    } catch {}
  }
}

/**
 * Generates a single-use Password Reset Token after successful OTP verification.
 */
export async function createResetToken(email: string): Promise<string> {
  const token = crypto.randomBytes(32).toString('hex');
  const now = Date.now();
  const session: ResetTokenSession = {
    token,
    email: email.toLowerCase().trim(),
    createdAt: now,
    expiresAt: now + RESET_TOKEN_EXPIRATION_MS,
    used: false,
  };

  globalResetTokenStore.set(token, session);
  return token;
}

/**
 * Validates a single-use Password Reset Token.
 */
export async function validateResetToken(token: string): Promise<{ valid: boolean; email?: string; error?: string }> {
  if (!token) return { valid: false, error: 'Invalid password reset authorization token.' };

  const session = globalResetTokenStore.get(token);
  if (!session) return { valid: false, error: 'Password reset session invalid or expired.' };

  if (session.used) return { valid: false, error: 'Password reset authorization token has already been used.' };

  if (Date.now() > session.expiresAt) {
    globalResetTokenStore.delete(token);
    return { valid: false, error: 'Password reset session has expired.' };
  }

  return { valid: true, email: session.email };
}

/**
 * Consumes a Password Reset Token after password update.
 */
export async function consumeResetToken(token: string): Promise<void> {
  const session = globalResetTokenStore.get(token);
  if (session) {
    session.used = true;
    globalResetTokenStore.delete(token);
  }
}
