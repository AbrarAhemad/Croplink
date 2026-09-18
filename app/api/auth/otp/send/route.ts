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

    // Check duplicate mobile across system
    const uniqueness = checkAccountUniqueness(normMob, undefined);
    if (uniqueness.mobileExists) {
      return NextResponse.json(
        { success: false, error: 'An account with this mobile number already exists.', code: 'DUPLICATE_MOBILE' },
        { status: 400 }
      );
    }

    // Check 30-second resend cooldown
    const cooldown = await checkResendCooldown(normMob, 'MOBILE_REGISTRATION');
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
    await createOTPSession(normMob, 'MOBILE_REGISTRATION', otp);

    // Send via OTP Provider (Demo or SMS mode)
    const provider = getOTPProvider();
    const result = await provider.sendSMS(normMob, otp);

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          mode: result.mode,
          error: result.error || 'Failed to dispatch verification code. Please verify configuration.',
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      mode: result.mode,
      message: result.message,
      demoOtp: result.demoOtp,
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to send OTP. Please try again.' }, { status: 500 });
  }
}
