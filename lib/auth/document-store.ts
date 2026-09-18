/**
 * CropLink Document Upload & Storage Manager
 * Stores uploaded file buffers securely and provides inspectable file references.
 */

export interface StoredDocument {
  id: string;
  filename: string;
  mimeType: string;
  sizeBytes: number;
  buffer: Buffer;
  uploadedAt: string;
}

const globalDocumentStore = new Map<string, StoredDocument>();

/**
 * Default sample documents for demo records
 */
const SAMPLE_PDF_BUFFER = Buffer.from(
  '%PDF-1.4\n1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj\n2 0 obj<</Type/Pages/Count 1/Kids[3 0 R]>>endobj\n3 0 obj<</Type/Page/MediaBox[0 0 612 792]/Parent 2 0 R/Resources<<>>>>endobj\nxref\n0 4\n0000000000 65535 f\n0000000009 00000 n\n0000000052 00000 n\n0000000101 00000 n\ntrailer<</Size 4/Root 1 0 R>>\nstartxref\n178\n%%EOF'
);

globalDocumentStore.set('doc_sample_712', {
  id: 'doc_sample_712',
  filename: 'Kupwad_712_Extract.pdf',
  mimeType: 'application/pdf',
  sizeBytes: SAMPLE_PDF_BUFFER.length,
  buffer: SAMPLE_PDF_BUFFER,
  uploadedAt: '2026-08-01T10:00:00Z',
});

globalDocumentStore.set('doc_sample_aadhaar', {
  id: 'doc_sample_aadhaar',
  filename: 'Aadhaar_Patil.pdf',
  mimeType: 'application/pdf',
  sizeBytes: SAMPLE_PDF_BUFFER.length,
  buffer: SAMPLE_PDF_BUFFER,
  uploadedAt: '2026-08-01T10:00:00Z',
});

globalDocumentStore.set('doc_sample_gst', {
  id: 'doc_sample_gst',
  filename: 'GST_AgriFoods.pdf',
  mimeType: 'application/pdf',
  sizeBytes: SAMPLE_PDF_BUFFER.length,
  buffer: SAMPLE_PDF_BUFFER,
  uploadedAt: '2026-08-02T11:30:00Z',
});

globalDocumentStore.set('doc_sample_cin', {
  id: 'doc_sample_cin',
  filename: 'CIN_AgriFoods.pdf',
  mimeType: 'application/pdf',
  sizeBytes: SAMPLE_PDF_BUFFER.length,
  buffer: SAMPLE_PDF_BUFFER,
  uploadedAt: '2026-08-02T11:30:00Z',
});

/**
 * Stores an uploaded file buffer in document store.
 */
export function storeUploadedDocument(filename: string, mimeType: string, buffer: Buffer): { id: string; url: string; filename: string } {
  const docId = `doc_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
  const doc: StoredDocument = {
    id: docId,
    filename,
    mimeType: mimeType || 'application/octet-stream',
    sizeBytes: buffer.length,
    buffer,
    uploadedAt: new Date().toISOString(),
  };

  globalDocumentStore.set(docId, doc);
  return {
    id: docId,
    filename,
    url: `/api/documents/${docId}`,
  };
}

/**
 * Retrieves stored document by ID or filename.
 */
export function getStoredDocument(idOrFilename: string): StoredDocument | undefined {
  if (globalDocumentStore.has(idOrFilename)) {
    return globalDocumentStore.get(idOrFilename);
  }

  for (const doc of globalDocumentStore.values()) {
    if (doc.filename === idOrFilename) {
      return doc;
    }
  }

  return undefined;
}
