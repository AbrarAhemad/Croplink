/**
 * CropLink Approval Applications Store
 * Maintains real pending, approved, and rejected registration applications.
 * Persisted server-side across requests.
 */

export interface ApprovalApplication {
  id: string;
  userId: string;
  role: 'FARMER' | 'INDUSTRY';
  fullName: string;
  email: string;
  mobile: string;
  details: string;
  doc1Name: string;
  doc1Url: string;
  doc2Name: string;
  doc2Url: string;
  status: 'PENDING_APPROVAL' | 'APPROVED' | 'REJECTED' | 'SUSPENDED';
  registeredAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
  rejectionReason?: string;
}

// Global server-side persistent store for approval applications
const globalApprovalApplications: ApprovalApplication[] = [
  {
    id: 'app_f_demo_1',
    userId: 'usr_farmer_1',
    role: 'FARMER',
    fullName: 'Rameshwar Patil',
    email: 'farmer@croplink.demo',
    mobile: '+919823012345',
    details: 'Farm: 18.5 Acres in Kupwad, Sangli. Crops: Turmeric, Grapes, Sugarcane.',
    doc1Name: '7/12 Revenue Extract (Kupwad_142.pdf)',
    doc1Url: '/api/documents/doc_sample_712',
    doc2Name: 'Aadhaar ID (Aadhaar_Patil.pdf)',
    doc2Url: '/api/documents/doc_sample_aadhaar',
    status: 'APPROVED',
    registeredAt: '2026-08-01T10:00:00Z',
    reviewedAt: '2026-08-01T10:15:00Z',
    reviewedBy: 'Admin Operations',
  },
  {
    id: 'app_i_demo_1',
    userId: 'usr_industry_1',
    role: 'INDUSTRY',
    fullName: 'Sunil Deshmukh (AgriFoods India Ltd)',
    email: 'industry@croplink.demo',
    mobile: '+919819098765',
    details: 'GSTIN: 27AAAAA0000A1Z5 • Target: 250 Tons Spice Procurement.',
    doc1Name: 'GST Certificate (GST_AgriFoods.pdf)',
    doc1Url: '/api/documents/doc_sample_gst',
    doc2Name: 'CIN Incorporation (CIN_AgriFoods.pdf)',
    doc2Url: '/api/documents/doc_sample_cin',
    status: 'APPROVED',
    registeredAt: '2026-08-02T11:30:00Z',
    reviewedAt: '2026-08-02T12:00:00Z',
    reviewedBy: 'Admin Operations',
  },
];

/**
 * Returns all approval applications sorted by registeredAt descending.
 */
export function getAllApprovalApplications(): ApprovalApplication[] {
  return [...globalApprovalApplications].sort(
    (a, b) => new Date(b.registeredAt).getTime() - new Date(a.registeredAt).getTime()
  );
}

/**
 * Finds application by ID.
 */
export function findApprovalApplicationById(id: string): ApprovalApplication | undefined {
  return globalApprovalApplications.find(a => a.id === id);
}

/**
 * Creates a new real approval application record.
 */
export function createApprovalApplication(data: Omit<ApprovalApplication, 'id' | 'registeredAt'>): ApprovalApplication {
  const newApp: ApprovalApplication = {
    ...data,
    id: `app_${data.role.toLowerCase()}_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    registeredAt: new Date().toISOString(),
  };

  // Prepend to server list
  globalApprovalApplications.unshift(newApp);
  return newApp;
}

/**
 * Updates status of an approval application (APPROVED, REJECTED, SUSPENDED).
 */
export function updateApprovalStatus(
  id: string,
  status: 'APPROVED' | 'REJECTED' | 'SUSPENDED',
  rejectionReason?: string,
  reviewerName: string = 'Admin Operations'
): { success: boolean; application?: ApprovalApplication; error?: string } {
  const application = findApprovalApplicationById(id);
  if (!application) {
    return { success: false, error: 'Approval application record not found.' };
  }

  application.status = status;
  application.reviewedAt = new Date().toISOString();
  application.reviewedBy = reviewerName;
  if (rejectionReason) {
    application.rejectionReason = rejectionReason;
  }

  return { success: true, application };
}
