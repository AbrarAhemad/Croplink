import { NextResponse } from 'next/server';
import { getAllApprovalApplications } from '@/lib/auth/approval-store';

export async function GET() {
  try {
    const applications = getAllApprovalApplications();
    return NextResponse.json({
      success: true,
      applications,
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to fetch approval applications.' }, { status: 500 });
  }
}
