import { NextResponse } from 'next/server';
import { checkAccountUniqueness } from '@/lib/auth/user-store';
import { validateIndianMobile, validateGmail } from '@/lib/auth/validation';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { mobile, email } = body;

    let mobileError: string | undefined;
    let emailError: string | undefined;

    if (mobile) {
      const mobVal = validateIndianMobile(mobile);
      if (!mobVal.valid) {
        mobileError = mobVal.error;
      }
    }

    if (email) {
      const emailVal = validateGmail(email);
      if (!emailVal.valid) {
        emailError = emailVal.error;
      }
    }

    const uniqueness = checkAccountUniqueness(mobile, email);

    return NextResponse.json({
      mobileExists: uniqueness.mobileExists,
      emailExists: uniqueness.emailExists,
      mobileError: mobileError || uniqueness.mobileError,
      emailError: emailError || uniqueness.emailError,
    });
  } catch (error) {
    return NextResponse.json({ error: 'Server error checking uniqueness.' }, { status: 500 });
  }
}
