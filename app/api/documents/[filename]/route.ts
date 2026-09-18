import { NextResponse } from 'next/server';
import { getStoredDocument } from '@/lib/auth/document-store';

export async function GET(req: Request, props: { params: Promise<{ filename: string }> }) {
  try {
    const params = await props.params;
    const { filename } = params;

    const doc = getStoredDocument(filename);

    if (!doc) {
      return new NextResponse('Document file not found.', { status: 404 });
    }

    return new NextResponse(new Uint8Array(doc.buffer), {
      status: 200,
      headers: {
        'Content-Type': doc.mimeType,
        'Content-Disposition': `inline; filename="${doc.filename}"`,
        'Cache-Control': 'public, max-age=3600',
      },
    });
  } catch (error) {
    return new NextResponse('Error reading document.', { status: 500 });
  }
}
