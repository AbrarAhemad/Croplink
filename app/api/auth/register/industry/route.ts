import { NextResponse } from 'next/server';
import { validateIndianMobile, validateGmail } from '@/lib/auth/validation';
import { isMobileVerifiedForRegistration, consumeMobileVerification } from '@/lib/auth/otp-store';
import { registerNewUser } from '@/lib/auth/user-store';
import { createApprovalApplication } from '@/lib/auth/approval-store';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      companyName,
      gstin,
      contactPerson,
      mobile,
      email,
      doc1Name,
      doc1Url,
      doc2Name,
      doc2Url,
    } = body;

    if (!companyName || !gstin || !contactPerson || !mobile || !email) {
      return NextResponse.json({ success: false, error: 'Please fill in all required company registration details.' }, { status: 400 });
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

    // Attempt Registration
    const regResult = registerNewUser({
      fullName: `${contactPerson} (${companyName})`,
      mobile: mobVal.normalized,
      email: gmailVal.normalized,
      role: 'INDUSTRY',
    });

    if (!regResult.success || !regResult.user) {
      return NextResponse.json({ success: false, error: regResult.error || 'Industry registration failed.' }, { status: 400 });
    }

    // Create persistent Approval Application record in server database/store
    const approvalRecord = createApprovalApplication({
      userId: regResult.user.id,
      role: 'INDUSTRY',
      fullName: `${contactPerson} (${companyName})`,
      email: gmailVal.normalized,
      mobile: mobVal.normalized,
      details: `GSTIN: ${gstin} • Contact: ${contactPerson} • Company: ${companyName}`,
      doc1Name: doc1Name || 'GST Registration Certificate',
      doc1Url: doc1Url || '/api/documents/doc_sample_gst',
      doc2Name: doc2Name || 'CIN Incorporation Certificate',
      doc2Url: doc2Url || '/api/documents/doc_sample_cin',
      status: 'PENDING_APPROVAL',
    });

    // Consume verification on success
    await consumeMobileVerification(mobVal.normalized);

    return NextResponse.json({
      success: true,
      user: regResult.user,
      applicationId: approvalRecord.id,
      message: 'Industry registration submitted successfully and pending approval.',
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Industry registration failed. Please try again.' }, { status: 500 });
  }
}
