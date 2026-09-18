import { NextResponse } from 'next/server';
import { updateApprovalStatus, findApprovalApplicationById } from '@/lib/auth/approval-store';
import { updateUserAccountStatus } from '@/lib/auth/user-store';

export async function POST(req: Request, props: { params: Promise<{ id: string }> }) {
  try {
    const params = await props.params;
    const { id } = params;
    const { status, rejectionReason } = await req.json();

    if (!['APPROVED', 'REJECTED', 'SUSPENDED'].includes(status)) {
      return NextResponse.json({ success: false, error: 'Invalid approval status action.' }, { status: 400 });
    }

    const appRecord = findApprovalApplicationById(id);
    if (!appRecord) {
      return NextResponse.json({ success: false, error: 'Approval application record not found.' }, { status: 404 });
    }

    // Update Approval Application Status
    const updateAppRes = updateApprovalStatus(id, status, rejectionReason, 'Admin Operations');
    if (!updateAppRes.success || !updateAppRes.application) {
      return NextResponse.json({ success: false, error: updateAppRes.error || 'Failed to update application.' }, { status: 400 });
    }

    // Synchronize User Profile Account Status
    updateUserAccountStatus(appRecord.userId, status);

    return NextResponse.json({
      success: true,
      application: updateAppRes.application,
      message: `Applicant application status updated to ${status}.`,
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to process admin approval action.' }, { status: 500 });
  }
}
