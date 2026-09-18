import { NextResponse } from 'next/server';
import { validateIndianMobile, validateGmail } from '@/lib/auth/validation';
import { isMobileVerifiedForRegistration, consumeMobileVerification } from '@/lib/auth/otp-store';
import { registerNewUser } from '@/lib/auth/user-store';
import { createApprovalApplication } from '@/lib/auth/approval-store';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      fullName,
      mobile,
      email,
      village,
      district,
      pincode,
      farmName,
      landAreaAcres,
      doc1Name,
      doc1Url,
      doc2Name,
      doc2Url,
    } = body;

    if (!fullName || !mobile || !email || !village || !district || !pincode || !farmName || !landAreaAcres) {
      return NextResponse.json({ success: false, error: 'Please fill in all required registration fields.' }, { status: 400 });
    }

    const mobVal = validateIndianMobile(mobile);
    if (!mobVal.valid) {
      return NextResponse.json({ success: false, error: mobVal.error }, { status: 400 });
    }

    const gmailVal = validateGmail(email);
    if (!gmailVal.valid) {
      return NextResponse.json({ success: false, error: gmailVal.error }, { status: 400 });
    }

    // SERVER-SIDE MANDATORY OTP CHECK
    const verified = await isMobileVerifiedForRegistration(mobVal.normalized);
    if (!verified) {
      return NextResponse.json(
        { success: false, error: 'Mobile number verification is required before submitting registration.', code: 'OTP_REQUIRED' },
        { status: 400 }
      );
    }

    // Attempt Account Registration
    const regResult = registerNewUser({
      fullName,
      mobile: mobVal.normalized,
      email: gmailVal.normalized,
      role: 'FARMER',
    });

    if (!regResult.success || !regResult.user) {
      return NextResponse.json({ success: false, error: regResult.error || 'User registration failed.' }, { status: 400 });
    }

    // Create persistent Approval Application record in server database/store
    const approvalRecord = createApprovalApplication({
      userId: regResult.user.id,
      role: 'FARMER',
      fullName,
      email: gmailVal.normalized,
      mobile: mobVal.normalized,
      details: `Farm: ${farmName} (${landAreaAcres} Acres) in ${village}, ${district}. Pincode: ${pincode}`,
      doc1Name: doc1Name || '7/12 Land Revenue Extract',
      doc1Url: doc1Url || '/api/documents/doc_sample_712',
      doc2Name: doc2Name || 'Government Identity Card',
      doc2Url: doc2Url || '/api/documents/doc_sample_aadhaar',
      status: 'PENDING_APPROVAL',
    });

    // Consume OTP verification state on success
    await consumeMobileVerification(mobVal.normalized);

    return NextResponse.json({
      success: true,
      user: regResult.user,
      applicationId: approvalRecord.id,
      message: 'Farmer registration completed successfully and submitted for Admin approval.',
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Registration submission failed. Please try again.' }, { status: 500 });
  }
}
