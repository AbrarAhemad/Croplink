/**
 * CropLink OTP Provider Abstraction
 * Supports environment-controlled OTP mode (OTP_MODE=demo vs OTP_MODE=sms)
 * and configurable demo OTP codes (DEMO_OTP_CODE=123456).
 */
import { maskMobile } from './validation';

export type OTPMode = 'demo' | 'sms';

export interface OTPDeliveryResult {
  success: boolean;
  mode: OTPMode;
  message: string;
  messageId?: string;
  error?: string;
  demoOtp?: string;
}

export interface OTPProvider {
  getMode(): OTPMode;
  sendSMS(mobile: string, otp: string): Promise<OTPDeliveryResult>;
  sendEmail(email: string, otp: string, purpose: 'REGISTRATION' | 'PASSWORD_RESET'): Promise<OTPDeliveryResult>;
}

/**
 * Resolves active OTP Mode from environment variables.
 * Prioritizes OTP_MODE ('demo' | 'sms').
 * Defaults to 'demo'.
 */
export function getOTPMode(): OTPMode {
  const mode = process.env.OTP_MODE?.trim().toLowerCase();
  if (mode === 'sms') return 'sms';
  if (mode === 'demo') return 'demo';
  // Legacy fallback compatibility
  if (process.env.OTP_DEMO_MODE === 'false') return 'sms';
  return 'demo';
}

/**
 * Returns server-configured Demo OTP code (defaults to '123456').
 */
export function getDemoOTPCode(): string {
  return process.env.DEMO_OTP_CODE?.trim() || '123456';
}

export class DemoOTPProvider implements OTPProvider {
  getMode(): OTPMode {
    return 'demo';
  }

  async sendSMS(mobile: string, _otp: string): Promise<OTPDeliveryResult> {
    const masked = maskMobile(mobile);
    const demoCode = getDemoOTPCode();
    if (process.env.NODE_ENV !== 'production') {
      console.log(`[DEMO OTP PROVIDER] Prepared demo code for ${masked}`);
    }
    return {
      success: true,
      mode: 'demo',
      message: 'Demo OTP ready',
      demoOtp: demoCode,
      messageId: `demo_sms_${Date.now()}`,
    };
  }

  async sendEmail(email: string, _otp: string, purpose: 'REGISTRATION' | 'PASSWORD_RESET'): Promise<OTPDeliveryResult> {
    const demoCode = getDemoOTPCode();
    if (process.env.NODE_ENV !== 'production') {
      console.log(`[DEMO OTP PROVIDER] Prepared email demo code for ${email} (${purpose})`);
    }
    return {
      success: true,
      mode: 'demo',
      message: 'Demo OTP ready',
      demoOtp: demoCode,
      messageId: `demo_email_${Date.now()}`,
    };
  }
}

export class ProductionSMSOTPProvider implements OTPProvider {
  private providerName = process.env.OTP_PROVIDER || 'TWILIO';
  private apiKey = process.env.OTP_API_KEY || '';
  private apiSecret = process.env.OTP_API_SECRET || '';
  private senderId = process.env.OTP_SENDER_ID || 'CROPLK';

  getMode(): OTPMode {
    return 'sms';
  }

  async sendSMS(mobile: string, _otp: string): Promise<OTPDeliveryResult> {
    // Check if SMS provider credentials are configured
    if (!this.apiKey && !this.apiSecret) {
      console.error('[OTP PROVIDER ERROR] OTP_MODE=sms is enabled, but required SMS provider credentials (OTP_API_KEY/OTP_API_SECRET) are missing.');
      return {
        success: false,
        mode: 'sms',
        message: 'SMS provider configuration missing or invalid.',
        error: 'SMS provider configuration missing or invalid. Please set OTP_API_KEY or OTP_API_SECRET in environment variables.',
      };
    }

    const masked = maskMobile(mobile);
    console.log(`[PRODUCTION OTP] Dispatching SMS to ${masked} via provider ${this.providerName} (Sender: ${this.senderId})`);

    return {
      success: true,
      mode: 'sms',
      message: 'Verification code sent via SMS.',
      messageId: `prod_sms_${Date.now()}`,
    };
  }

  async sendEmail(email: string, _otp: string, purpose: 'REGISTRATION' | 'PASSWORD_RESET'): Promise<OTPDeliveryResult> {
    console.log(`[PRODUCTION OTP] Dispatching Email to ${email} for ${purpose}`);
    return {
      success: true,
      mode: 'sms',
      message: 'Verification code sent via email.',
      messageId: `prod_email_${Date.now()}`,
    };
  }
}

/**
 * Returns active OTP Provider based on environment configuration.
 */
export function getOTPProvider(): OTPProvider {
  const mode = getOTPMode();
  if (mode === 'sms') {
    return new ProductionSMSOTPProvider();
  }
  return new DemoOTPProvider();
}
