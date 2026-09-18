import { NextResponse } from 'next/server';
import { storeUploadedDocument } from '@/lib/auth/document-store';

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ success: false, error: 'No document file provided.' }, { status: 400 });
    }

    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ success: false, error: 'File size must be less than 5 MB.' }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const stored = storeUploadedDocument(file.name, file.type, buffer);

    return NextResponse.json({
      success: true,
      docId: stored.id,
      filename: stored.filename,
      url: stored.url,
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to upload document.' }, { status: 500 });
  }
}
