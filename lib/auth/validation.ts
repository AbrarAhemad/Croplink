/**
 * CropLink Authentication & Validation Utilities
 */

/**
 * Normalizes Indian mobile numbers into standard +91XXXXXXXXXX format.
 * Strips all spaces, hyphens, parentheses, and extra characters.
 */
export function normalizeMobile(input: string): string {
  if (!input) return '';
  // Remove all non-digits except initial '+'
  let cleaned = input.trim().replace(/[^\d+]/g, '');

  if (cleaned.startsWith('+91')) {
    const digitsOnly = cleaned.slice(3).replace(/\D/g, '');
    return `+91${digitsOnly}`;
  }

  if (cleaned.startsWith('91') && cleaned.length === 12) {
    return `+91${cleaned.slice(2)}`;
  }

  const digitsOnly = cleaned.replace(/\D/g, '');
  if (digitsOnly.length === 10) {
    return `+91${digitsOnly}`;
  }

  return cleaned.startsWith('+') ? cleaned : `+91${digitsOnly}`;
}

/**
 * Safely masks an Indian mobile number for display/logging.
 * Format: +91 98******10 or +91 96******40
 * Never exposes middle 6 digits.
 */
export function maskMobile(mobile: string): string {
  if (!mobile) return '';
  const cleaned = mobile.replace(/[^\d]/g, '');
  if (cleaned.length < 10) return mobile;
  const last10 = cleaned.slice(-10);
  return `+91 ${last10.slice(0, 2)}******${last10.slice(-2)}`;
}

/**
 * Validates Indian Mobile Number format.
 * Requirements:
 * - Must be +91 followed by exactly 10 digits
 * - First digit after +91 must be 6, 7, 8, or 9
 */
export function validateIndianMobile(mobile: string): { valid: boolean; normalized: string; error?: string } {
  const normalized = normalizeMobile(mobile);

  // Check structure: +91 followed by 10 digits
  const regex = /^\+91[6-9]\d{9}$/;
  if (!regex.test(normalized)) {
    return {
      valid: false,
      normalized,
      error: 'Please enter a valid 10-digit Indian mobile number starting with 6, 7, 8, or 9.',
    };
  }

  return { valid: true, normalized };
}

/**
 * Validates Gmail email address.
 * Requirements:
 * - Must be a valid email format
 * - Domain must strictly be gmail.com
 * - Normalizes to lowercase and trims whitespace
 */
export function validateGmail(email: string): { valid: boolean; normalized: string; error?: string } {
  if (!email || typeof email !== 'string') {
    return { valid: false, normalized: '', error: 'Please enter a valid Gmail address ending with @gmail.com.' };
  }

  const trimmed = email.trim().toLowerCase();
  const parts = trimmed.split('@');

  if (parts.length !== 2 || !parts[0] || !parts[1]) {
    return { valid: false, normalized: trimmed, error: 'Please enter a valid Gmail address ending with @gmail.com.' };
  }

  const [username, domain] = parts;

  if (domain !== 'gmail.com') {
    return { valid: false, normalized: trimmed, error: 'Please enter a valid Gmail address ending with @gmail.com.' };
  }

  // Basic username structure check
  if (!/^[a-z0-9._%+-]+$/.test(username)) {
    return { valid: false, normalized: trimmed, error: 'Please enter a valid Gmail address ending with @gmail.com.' };
  }

  return { valid: true, normalized: trimmed };
}

/**
 * Validates password strength:
 * - Minimum 8 characters
 * - At least one uppercase letter
 * - At least one lowercase letter
 * - At least one number
 */
export function validatePassword(password: string): {
  valid: boolean;
  hasMinLength: boolean;
  hasUppercase: boolean;
  hasLowercase: boolean;
  hasNumber: boolean;
  errors: string[];
} {
  const hasMinLength = password.length >= 8;
  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);

  const errors: string[] = [];
  if (!hasMinLength) errors.push('Password must be at least 8 characters long.');
  if (!hasUppercase) errors.push('Password must contain at least one uppercase letter.');
  if (!hasLowercase) errors.push('Password must contain at least one lowercase letter.');
  if (!hasNumber) errors.push('Password must contain at least one number.');

  const valid = hasMinLength && hasUppercase && hasLowercase && hasNumber;
  return { valid, hasMinLength, hasUppercase, hasLowercase, hasNumber, errors };
}
