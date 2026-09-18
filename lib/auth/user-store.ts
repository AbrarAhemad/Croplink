/**
 * CropLink Global User Accounts Store
 * Maintains global accounts across Farmer, Industry, and Admin roles.
 * Enforces strict UNIQUE constraints on normalized mobile (+91XXXXXXXXXX) and normalized Gmail (user@gmail.com).
 */
import { UserProfile } from '@/types';
import { DEMO_PROFILES } from '@/lib/store/demo-store';
import { normalizeMobile } from './validation';
import crypto from 'crypto';

export interface ExtendedUserProfile extends UserProfile {
  passwordHash?: string;
  normalizedMobile: string;
  normalizedEmail: string;
}

// In-memory global user accounts initialized with demo profiles
const globalUsers: ExtendedUserProfile[] = DEMO_PROFILES.map(p => ({
  ...p,
  normalizedMobile: normalizeMobile(p.mobile || ''),
  normalizedEmail: p.email.trim().toLowerCase(),
  // Default hashed password for demo accounts ("CropLink@2026")
  passwordHash: hashPassword('CropLink@2026'),
}));

/**
 * SHA-256 password hashing helper for stored passwords.
 */
export function hashPassword(plainPassword: string): string {
  return crypto.createHash('sha256').update(`croplink_salt_${plainPassword}`).digest('hex');
}

/**
 * Checks if a mobile number or email is already registered across ANY role.
 */
export function checkAccountUniqueness(mobile?: string, email?: string): {
  mobileExists: boolean;
  emailExists: boolean;
  mobileError?: string;
  emailError?: string;
} {
  let mobileExists = false;
  let emailExists = false;

  if (mobile) {
    const normMob = normalizeMobile(mobile);
    mobileExists = globalUsers.some(u => u.normalizedMobile === normMob);
  }

  if (email) {
    const normEmail = email.trim().toLowerCase();
    emailExists = globalUsers.some(u => u.normalizedEmail === normEmail);
  }

  return {
    mobileExists,
    emailExists,
    mobileError: mobileExists ? 'An account with this mobile number already exists.' : undefined,
    emailError: emailExists ? 'This Gmail address is already registered.' : undefined,
  };
}

/**
 * Finds user profile by normalized email.
 */
export function findUserByEmail(email: string): ExtendedUserProfile | undefined {
  const normEmail = email.trim().toLowerCase();
  return globalUsers.find(u => u.normalizedEmail === normEmail);
}

/**
 * Finds user profile by normalized mobile.
 */
export function findUserByMobile(mobile: string): ExtendedUserProfile | undefined {
  const normMob = normalizeMobile(mobile);
  return globalUsers.find(u => u.normalizedMobile === normMob);
}

/**
 * Registers a new user with global uniqueness check and hashed password.
 */
export function registerNewUser(data: {
  fullName: string;
  mobile: string;
  email: string;
  role: 'FARMER' | 'INDUSTRY';
  password?: string;
}): { success: boolean; user?: ExtendedUserProfile; error?: string } {
  const normMob = normalizeMobile(data.mobile);
  const normEmail = data.email.trim().toLowerCase();

  const uniqueness = checkAccountUniqueness(data.mobile, data.email);
  if (uniqueness.mobileExists) {
    return { success: false, error: 'An account with this mobile number already exists.' };
  }
  if (uniqueness.emailExists) {
    return { success: false, error: 'This Gmail address is already registered.' };
  }

  const userId = `usr_${data.role.toLowerCase()}_${Date.now()}`;
  const newUser: ExtendedUserProfile = {
    id: userId,
    email: normEmail,
    role: data.role,
    status: 'PENDING_APPROVAL',
    fullName: data.fullName,
    mobile: normMob,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    normalizedMobile: normMob,
    normalizedEmail: normEmail,
    passwordHash: hashPassword(data.password || 'CropLink@2026'),
  };

  globalUsers.push(newUser);
  return { success: true, user: newUser };
}

/**
 * Updates a user account's status (APPROVED, REJECTED, SUSPENDED, PENDING_APPROVAL).
 */
export function updateUserAccountStatus(userId: string, status: UserProfile['status']): { success: boolean; user?: ExtendedUserProfile; error?: string } {
  const user = globalUsers.find(u => u.id === userId);
  if (!user) {
    return { success: false, error: 'User account record not found.' };
  }

  user.status = status;
  user.updatedAt = new Date().toISOString();
  return { success: true, user };
}

/**
 * Updates a user's password.
 */
export function updateUserPassword(email: string, newPassword: string): { success: boolean; error?: string } {
  const user = findUserByEmail(email);
  if (!user) {
    return { success: false, error: 'Account not found.' };
  }

  user.passwordHash = hashPassword(newPassword);
  user.updatedAt = new Date().toISOString();
  return { success: true };
}

/**
 * Validates user credentials for login.
 */
export function validateCredentials(email: string, password?: string): ExtendedUserProfile | null {
  const user = findUserByEmail(email);
  if (!user) return null;

  if (password && user.passwordHash) {
    const inputHash = hashPassword(password);
    if (inputHash !== user.passwordHash) {
      return null;
    }
  }

  return user;
}
