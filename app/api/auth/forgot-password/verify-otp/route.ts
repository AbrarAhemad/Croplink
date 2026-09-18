import { NextResponse } from 'next/server';
import { validateGmail } from '@/lib/auth/validation';
import { verifyOTP, createResetToken } from '@/lib/auth/otp-store';

export async function POST(req: Request) {
  try {
    const { email, otp } = await req.json();

    if (!otp || typeof otp !== 'string' || otp.trim().length !== 6) {
      return NextResponse.json({ success: false, error: 'Please enter the 6-digit verification code.' }, { status: 400 });
    }

    const gmailVal = validateGmail(email);
    if (!gmailVal.valid) {
      return NextResponse.json({ success: false, error: gmailVal.error }, { status: 400 });
    }

    const normEmail = gmailVal.normalized;

    const result = await verifyOTP(normEmail, 'PASSWORD_RESET', otp);
    if (!result.success) {
      return NextResponse.json({ success: false, error: result.error, code: result.code }, { status: 400 });
    }

    // Generate single-use password reset authorization token
    const resetToken = await createResetToken(normEmail);

    return NextResponse.json({
      success: true,
      resetToken,
      message: 'OTP verified successfully.',
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to verify OTP. Please try again.' }, { status: 500 });
  }
}
