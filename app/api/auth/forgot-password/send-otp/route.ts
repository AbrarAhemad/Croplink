import { NextResponse } from 'next/server';
import { validateGmail } from '@/lib/auth/validation';
import { findUserByEmail } from '@/lib/auth/user-store';
import { checkResendCooldown, createOTPSession, generate6DigitOTP } from '@/lib/auth/otp-store';
import { getOTPProvider } from '@/lib/auth/otp-provider';

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    const gmailVal = validateGmail(email);
    if (!gmailVal.valid) {
      return NextResponse.json({ success: false, error: gmailVal.error }, { status: 400 });
    }

    const normEmail = gmailVal.normalized;

    // Check 30-second resend cooldown
    const cooldown = await checkResendCooldown(normEmail, 'PASSWORD_RESET');
    if (!cooldown.allowed) {
      return NextResponse.json(
        {
          success: false,
          error: `Please wait ${cooldown.remainingSeconds} seconds before requesting another code.`,
          remainingSeconds: cooldown.remainingSeconds,
        },
        { status: 429 }
      );
    }

    const user = findUserByEmail(normEmail);

    // If user exists, generate & send OTP
    if (user) {
      const otp = generate6DigitOTP();
      await createOTPSession(normEmail, 'PASSWORD_RESET', otp);

      const provider = getOTPProvider();
      const result = await provider.sendEmail(normEmail, otp, 'PASSWORD_RESET');

      return NextResponse.json({
        success: true,
        mode: result.mode,
        message: result.message,
        demoOtp: result.demoOtp,
      });
    }

    // Generic security response for non-existent users
    return NextResponse.json({
      success: true,
      message: 'If an account exists for this email address, a verification code has been sent.',
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to process request. Please try again.' }, { status: 500 });
  }
}
