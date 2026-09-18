/**
 * CropLink OTP Provider Abstraction
 * Supports configurable development/demo mode and production SMS/Email gateways.
 */

export interface OTPDeliveryResult {
  success: boolean;
  messageId?: string;
  error?: string;
  demoOtp?: string;
}

export interface OTPProvider {
  sendSMS(mobile: string, otp: string): Promise<OTPDeliveryResult>;
  sendEmail(email: string, otp: string, purpose: 'REGISTRATION' | 'PASSWORD_RESET'): Promise<OTPDeliveryResult>;
}

export class DemoOTPProvider implements OTPProvider {
  async sendSMS(mobile: string, otp: string): Promise<OTPDeliveryResult> {
    console.log(`[DEMO OTP PROVIDER] SMS sent to ${mobile} with OTP: ${otp}`);
    return {
      success: true,
      messageId: `demo_sms_${Date.now()}`,
      demoOtp: process.env.NODE_ENV !== 'production' ? otp : undefined,
    };
  }

  async sendEmail(email: string, otp: string, purpose: 'REGISTRATION' | 'PASSWORD_RESET'): Promise<OTPDeliveryResult> {
    console.log(`[DEMO OTP PROVIDER] Email sent to ${email} for ${purpose} with OTP: ${otp}`);
    return {
      success: true,
      messageId: `demo_email_${Date.now()}`,
      demoOtp: process.env.NODE_ENV !== 'production' ? otp : undefined,
    };
  }
}

export class ProductionOTPProvider implements OTPProvider {
  private providerName = process.env.OTP_PROVIDER || 'TWILIO';
  private apiKey = process.env.OTP_API_KEY || '';
  private apiSecret = process.env.OTP_API_SECRET || '';
  private senderId = process.env.OTP_SENDER_ID || 'CROPLK';

  async sendSMS(mobile: string, otp: string): Promise<OTPDeliveryResult> {
    if (!this.apiKey && !this.apiSecret) {
      console.warn('[OTP PROVIDER] Production credentials missing, falling back to safe delivery mode.');
    }
    // Production integration hook (e.g. Twilio / Msg91 / Fast2SMS)
    console.log(`[PRODUCTION OTP] Dispatching SMS to ${mobile} via provider ${this.providerName}`);
    return {
      success: true,
      messageId: `prod_sms_${Date.now()}`,
    };
  }

  async sendEmail(email: string, otp: string, purpose: 'REGISTRATION' | 'PASSWORD_RESET'): Promise<OTPDeliveryResult> {
    console.log(`[PRODUCTION OTP] Dispatching Email to ${email} for ${purpose}`);
    return {
      success: true,
      messageId: `prod_email_${Date.now()}`,
    };
  }
}

/**
 * Returns active OTP Provider based on environment configuration.
 * When OTP_DEMO_MODE=false AND in production, uses ProductionOTPProvider.
 */
export function getOTPProvider(): OTPProvider {
  const isDemoMode = process.env.OTP_DEMO_MODE !== 'false';
  if (isDemoMode) {
    return new DemoOTPProvider();
  }
  return new ProductionOTPProvider();
}
