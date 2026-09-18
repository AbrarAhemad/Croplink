import { NextResponse } from 'next/server';
import { validateIndianMobile } from '@/lib/auth/validation';
import { checkAccountUniqueness } from '@/lib/auth/user-store';
import { checkResendCooldown, createOTPSession, generate6DigitOTP } from '@/lib/auth/otp-store';
import { getOTPProvider } from '@/lib/auth/otp-provider';

export async function POST(req: Request) {
  try {
    const { mobile } = await req.json();

    const mobVal = validateIndianMobile(mobile);
    if (!mobVal.valid) {
      return NextResponse.json({ success: false, error: mobVal.error }, { status: 400 });
    }

    const normMob = mobVal.normalized;

    // Check duplicate mobile
    const uniqueness = checkAccountUniqueness(normMob, undefined);
    if (uniqueness.mobileExists) {
      return NextResponse.json(
        { success: false, error: 'An account with this mobile number already exists.', code: 'DUPLICATE_MOBILE' },
        { status: 400 }
      );
    }

    // Check resend cooldown
    const cooldown = checkResendCooldown(normMob, 'MOBILE_REGISTRATION');
    if (!cooldown.allowed) {
      return NextResponse.json(
        {
          success: false,
          error: `Please wait ${cooldown.remainingSeconds} seconds before requesting a new OTP.`,
          remainingSeconds: cooldown.remainingSeconds,
          code: 'RESEND_COOLDOWN',
        },
        { status: 429 }
      );
    }

    // Generate secure 6-digit OTP
    const otp = generate6DigitOTP();
    createOTPSession(normMob, 'MOBILE_REGISTRATION', otp);

    // Send via OTP Provider
    const provider = getOTPProvider();
    const result = await provider.sendSMS(normMob, otp);

    return NextResponse.json({
      success: true,
      message: 'OTP sent successfully to ' + normMob,
      demoOtp: result.demoOtp,
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to send OTP. Please try again.' }, { status: 500 });
  }
}
