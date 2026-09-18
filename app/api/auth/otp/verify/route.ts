import { NextResponse } from 'next/server';
import { validateIndianMobile } from '@/lib/auth/validation';
import { verifyOTP } from '@/lib/auth/otp-store';

export async function POST(req: Request) {
  try {
    const { mobile, otp } = await req.json();

    if (!otp || typeof otp !== 'string' || otp.trim().length !== 6) {
      return NextResponse.json({ success: false, error: 'Please enter a valid 6-digit OTP.' }, { status: 400 });
    }

    const mobVal = validateIndianMobile(mobile);
    if (!mobVal.valid) {
      return NextResponse.json({ success: false, error: mobVal.error }, { status: 400 });
    }

    const result = verifyOTP(mobVal.normalized, 'MOBILE_REGISTRATION', otp);
    if (!result.success) {
      return NextResponse.json({ success: false, error: result.error, code: result.code }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      mobileVerified: true,
      message: 'Mobile number verified successfully.',
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to verify OTP. Please try again.' }, { status: 500 });
  }
}
