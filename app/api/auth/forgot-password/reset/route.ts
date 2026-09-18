import { NextResponse } from 'next/server';
import { validatePassword } from '@/lib/auth/validation';
import { validateResetToken, consumeResetToken } from '@/lib/auth/otp-store';
import { updateUserPassword } from '@/lib/auth/user-store';

export async function POST(req: Request) {
  try {
    const { resetToken, newPassword, confirmPassword } = await req.json();

    if (!resetToken) {
      return NextResponse.json({ success: false, error: 'Reset session token is missing. Please start over.' }, { status: 400 });
    }

    if (newPassword !== confirmPassword) {
      return NextResponse.json({ success: false, error: 'Passwords do not match.' }, { status: 400 });
    }

    // Validate password strength
    const passVal = validatePassword(newPassword);
    if (!passVal.valid) {
      return NextResponse.json({ success: false, error: passVal.errors[0] }, { status: 400 });
    }

    // Validate reset session token
    const tokenVal = validateResetToken(resetToken);
    if (!tokenVal.valid || !tokenVal.email) {
      return NextResponse.json({ success: false, error: tokenVal.error }, { status: 400 });
    }

    // Update password in global user store
    const updateResult = updateUserPassword(tokenVal.email, newPassword);
    if (!updateResult.success) {
      return NextResponse.json({ success: false, error: updateResult.error }, { status: 400 });
    }

    // Consumes token to prevent reuse
    consumeResetToken(resetToken);

    return NextResponse.json({
      success: true,
      message: 'Your password has been updated successfully.',
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to reset password. Please try again.' }, { status: 500 });
  }
}
