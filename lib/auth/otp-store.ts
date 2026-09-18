/**
 * CropLink Server-Side OTP & Reset Token Store
 * Manages hashed OTPs, expiration, attempt limits, resend cooldowns, and reset tokens.
 */
import crypto from 'crypto';

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

// In-memory global store maps (persisted across requests during server runtime)
const globalOTPStore = new Map<string, OTPSession>();
const globalResetTokenStore = new Map<string, ResetTokenSession>();

const OTP_EXPIRATION_MS = 5 * 60 * 1000; // 5 minutes
const RESEND_COOLDOWN_MS = 30 * 1000; // 30 seconds
const MAX_FAILED_ATTEMPTS = 5;
const RESET_TOKEN_EXPIRATION_MS = 15 * 60 * 1000; // 15 minutes

/**
 * Computes SHA-256 hash of OTP code for secure storage.
 */
export function hashOTP(otp: string): string {
  return crypto.createHash('sha256').update(otp).digest('hex');
}

/**
 * Generates a cryptographically secure 6-digit OTP code.
 */
export function generate6DigitOTP(): string {
  // Static demo OTP fallback if OTP_DEMO_MODE=true for quick testing, otherwise crypto random
  if (process.env.OTP_DEMO_MODE === 'true' && process.env.NODE_ENV !== 'production') {
    return '123456';
  }
  const buffer = crypto.randomBytes(4);
  const number = buffer.readUInt32BE(0) % 1000000;
  return number.toString().padStart(6, '0');
}

/**
 * Key format for OTP sessions
 */
function getOTPKey(identifier: string, type: 'MOBILE_REGISTRATION' | 'PASSWORD_RESET'): string {
  return `${type}:${identifier.toLowerCase()}`;
}

/**
 * Checks resend cooldown for an identifier.
 */
export function checkResendCooldown(identifier: string, type: 'MOBILE_REGISTRATION' | 'PASSWORD_RESET'): { allowed: boolean; remainingSeconds: number } {
  const key = getOTPKey(identifier, type);
  const session = globalOTPStore.get(key);
  if (!session) return { allowed: true, remainingSeconds: 0 };

  const now = Date.now();
  const elapsed = now - session.lastResendAt;
  if (elapsed < RESEND_COOLDOWN_MS) {
    const remainingSeconds = Math.ceil((RESEND_COOLDOWN_MS - elapsed) / 1000);
    return { allowed: false, remainingSeconds };
  }

  return { allowed: true, remainingSeconds: 0 };
}

/**
 * Creates or updates an OTP session for an identifier.
 */
export function createOTPSession(identifier: string, type: 'MOBILE_REGISTRATION' | 'PASSWORD_RESET', plainOtp: string): OTPSession {
  const key = getOTPKey(identifier, type);
  const now = Date.now();
  const session: OTPSession = {
    identifier,
    hashedOtp: hashOTP(plainOtp),
    type,
    createdAt: now,
    expiresAt: now + OTP_EXPIRATION_MS,
    attempts: 0,
    lastResendAt: now,
    verified: false,
  };

  globalOTPStore.set(key, session);
  return session;
}

/**
 * Verifies an OTP code against stored session.
 */
export function verifyOTP(
  identifier: string,
  type: 'MOBILE_REGISTRATION' | 'PASSWORD_RESET',
  userProvidedOtp: string
): { success: boolean; error?: string; code?: 'EXPIRED' | 'TOO_MANY_ATTEMPTS' | 'INVALID_OTP' } {
  const key = getOTPKey(identifier, type);
  const session = globalOTPStore.get(key);

  if (!session) {
    return { success: false, error: 'No active OTP verification code found. Please request a new OTP.', code: 'EXPIRED' };
  }

  const now = Date.now();
  if (now > session.expiresAt) {
    globalOTPStore.delete(key);
    return { success: false, error: 'Your verification code has expired. Please request a new OTP.', code: 'EXPIRED' };
  }

  if (session.attempts >= MAX_FAILED_ATTEMPTS) {
    globalOTPStore.delete(key);
    return { success: false, error: 'Too many incorrect attempts. Please request a new OTP.', code: 'TOO_MANY_ATTEMPTS' };
  }

  const inputHash = hashOTP(userProvidedOtp.trim());
  if (inputHash !== session.hashedOtp) {
    session.attempts += 1;
    if (session.attempts >= MAX_FAILED_ATTEMPTS) {
      globalOTPStore.delete(key);
      return { success: false, error: 'Too many incorrect attempts. Please request a new OTP.', code: 'TOO_MANY_ATTEMPTS' };
    }
    const remaining = MAX_FAILED_ATTEMPTS - session.attempts;
    return { success: false, error: `Invalid verification code. ${remaining} attempt(s) remaining.`, code: 'INVALID_OTP' };
  }

  // Verification succeeded
  session.verified = true;
  return { success: true };
}

/**
 * Checks if mobile number was verified for registration.
 */
export function isMobileVerifiedForRegistration(normalizedMobile: string): boolean {
  const key = getOTPKey(normalizedMobile, 'MOBILE_REGISTRATION');
  const session = globalOTPStore.get(key);
  if (!session) return false;
  return session.verified && Date.now() <= session.expiresAt + 10 * 60 * 1000; // Allow 15-min registration window after verification
}

/**
 * Consumes mobile registration OTP verification.
 */
export function consumeMobileVerification(normalizedMobile: string): void {
  const key = getOTPKey(normalizedMobile, 'MOBILE_REGISTRATION');
  globalOTPStore.delete(key);
}

/**
 * Generates a single-use Password Reset Token after successful OTP verification.
 */
export function createResetToken(email: string): string {
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
export function validateResetToken(token: string): { valid: boolean; email?: string; error?: string } {
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
export function consumeResetToken(token: string): void {
  const session = globalResetTokenStore.get(token);
  if (session) {
    session.used = true;
    globalResetTokenStore.delete(token);
  }
}
