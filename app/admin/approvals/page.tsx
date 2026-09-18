'use client';

import React, { useState, useEffect } from 'react';
import { useAppStore } from '@/lib/store/use-app-store';
import { UserCheck, CheckCircle2, XCircle, FileText, ExternalLink, ShieldCheck, RefreshCw, Filter, Eye, AlertCircle } from 'lucide-react';

export interface ApprovalItem {
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

export default function AdminApprovalsPage() {
  const { updateUserStatus } = useAppStore();

  const [applicants, setApplicants] = useState<ApprovalItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<'ALL' | 'PENDING_APPROVAL' | 'APPROVED' | 'REJECTED'>('PENDING_APPROVAL');

  // Rejection Modal State
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [rejectionReasonInput, setRejectionReasonInput] = useState('');

  // Document Inspection Preview Modal State
  const [previewDoc, setPreviewDoc] = useState<{ title: string; url: string } | null>(null);

  const fetchApplications = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/admin/approvals', { cache: 'no-store' });
      const data = await res.json();
      setLoading(false);

      if (!res.ok || !data.success) {
        setError(data.error || 'Failed to load approval applications queue.');
        return;
      }

      setApplicants(data.applications || []);
    } catch (err) {
      setLoading(false);
      setError('Network error loading approval applications.');
    }
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  const handleAction = async (id: string, status: 'APPROVED' | 'REJECTED' | 'SUSPENDED', reason?: string) => {
    try {
      const res = await fetch(`/api/admin/approvals/${id}/action`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, rejectionReason: reason }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        alert(data.error || 'Failed to update status.');
        return;
      }

      // Sync local app store state
      const targetApp = applicants.find(a => a.id === id);
      if (targetApp) {
        updateUserStatus(targetApp.userId, status, reason);
      }

      setRejectingId(null);
      setRejectionReasonInput('');

      // Refresh applications queue
      await fetchApplications();
    } catch (err) {
      alert('Network error updating status.');
    }
  };

  const filteredApplicants = applicants.filter(app => {
    if (activeFilter === 'ALL') return true;
    return app.status === activeFilter;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-extrabold text-[#252A27] tracking-tight">Farmer & Industry Approval Queue</h1>
          <p className="text-xs text-[#6F756F] font-medium">
            Inspect uploaded 7/12 land revenue extracts, Aadhaar IDs, and GST certificates to approve or reject applicant accounts.
          </p>
        </div>

        <button
          onClick={fetchApplications}
          className="px-4 py-2 bg-[#FFFDF8] hover:bg-[#F7F3EA] border border-[#DDD8CC] rounded-md text-xs font-bold text-[#252A27] shadow-sm flex items-center gap-2 transition shrink-0"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Queue</span>
        </button>
      </div>

      {/* Status Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-[#DDD8CC] pb-3 overflow-x-auto">
        <span className="text-xs font-extrabold text-[#252A27] flex items-center gap-1 mr-2">
          <Filter className="w-3.5 h-3.5" />
          <span>Filter Status:</span>
        </span>

        {(['PENDING_APPROVAL', 'ALL', 'APPROVED', 'REJECTED'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveFilter(tab)}
            className={`px-3.5 py-1.5 rounded-md text-xs font-bold transition shadow-sm ${
              activeFilter === tab
                ? 'bg-[#23483A] text-white'
                : 'bg-[#FFFDF8] border border-[#DDD8CC] text-[#252A27] hover:bg-[#F7F3EA]'
            }`}
          >
            {tab === 'PENDING_APPROVAL' ? 'Pending Approval' : tab === 'ALL' ? 'All Applications' : tab === 'APPROVED' ? 'Approved' : 'Rejected'}
            <span className="ml-1.5 px-1.5 py-0.5 rounded-full text-[10px] bg-white/20">
              {tab === 'ALL'
                ? applicants.length
                : applicants.filter(a => a.status === tab).length}
            </span>
          </button>
        ))}
      </div>

      {loading && applicants.length === 0 ? (
        <div className="p-12 text-center text-xs text-[#6F756F] font-medium bg-[#FFFDF8] rounded-md border border-[#DDD8CC]">
          <RefreshCw className="w-6 h-6 animate-spin mx-auto text-[#23483A] mb-2" />
          <span>Loading real registration applications...</span>
        </div>
      ) : error ? (
        <div className="p-6 bg-[#B65C3A]/10 text-[#B65C3A] rounded-md border border-[#B65C3A]/20 flex items-center gap-3 text-xs font-semibold">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{error}</span>
        </div>
      ) : filteredApplicants.length === 0 ? (
        <div className="p-12 text-center text-xs text-[#6F756F] font-medium bg-[#FFFDF8] rounded-md border border-[#DDD8CC]">
          No {activeFilter.toLowerCase().replace('_', ' ')} records found.
        </div>
      ) : (
        <div className="space-y-6">
          {filteredApplicants.map(app => (
            <div key={app.id} className="bg-[#FFFDF8] rounded-md border border-[#DDD8CC] shadow-sm p-6 lg:p-8 space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#DDD8CC] pb-4">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-md flex items-center justify-center font-bold text-white shadow-sm ${
                      app.role === 'FARMER' ? 'bg-[#23483A]' : 'bg-[#B65C3A]'
                    }`}
                  >
                    {app.role === 'FARMER' ? 'F' : 'I'}
                  </div>
                  <div>
                    <h3 className="font-extrabold text-lg text-[#252A27] flex items-center gap-2">
                      <span>{app.fullName}</span>
                      <span className="text-xs px-2 py-0.5 bg-[#F7F3EA] text-[#252A27] rounded font-bold border border-[#DDD8CC]">
                        {app.role}
                      </span>
                    </h3>
                    <p className="text-xs text-[#6F756F] font-medium">
                      {app.email} • {app.mobile}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-bold shadow-sm ${
                      app.status === 'APPROVED'
                        ? 'bg-[#23483A]/10 text-[#23483A] border border-[#23483A]/20'
                        : app.status === 'REJECTED'
                        ? 'bg-[#B65C3A]/10 text-[#B65C3A] border border-[#B65C3A]/20'
                        : 'bg-amber-100 text-amber-900 border border-amber-300'
                    }`}
                  >
                    {app.status}
                  </span>
                  <span className="text-[11px] text-[#6F756F] font-medium">
                    Submitted: {new Date(app.registeredAt).toLocaleDateString('en-IN')}
                  </span>
                </div>
              </div>

              <div className="p-4 bg-[#F7F3EA] rounded-md border border-[#DDD8CC]">
                <span className="text-[11px] font-bold text-[#6F756F] uppercase tracking-wider block mb-1">
                  Submitted Profile / Company Details:
                </span>
                <p className="text-xs text-[#252A27] font-semibold leading-relaxed">{app.details}</p>
              </div>

              {/* Documents Inspection Section */}
              <div className="space-y-2">
                <span className="text-xs font-bold text-[#252A27] uppercase tracking-wider block">
                  Uploaded Verification Documents:
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Doc 1 */}
                  <div className="p-3 bg-[#F7F3EA] rounded-md border border-[#DDD8CC] flex items-center justify-between text-xs">
                    <span className="font-bold text-[#252A27] flex items-center gap-2 truncate pr-2">
                      <FileText className="w-4 h-4 text-[#23483A] shrink-0" />
                      <span className="truncate">{app.doc1Name}</span>
                    </span>
                    <button
                      onClick={() => setPreviewDoc({ title: app.doc1Name, url: app.doc1Url })}
                      className="text-xs font-bold text-[#23483A] hover:underline flex items-center gap-1 shrink-0 bg-white px-2.5 py-1 rounded border border-[#23483A]/20 shadow-sm"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Inspect</span>
                    </button>
                  </div>

                  {/* Doc 2 */}
                  <div className="p-3 bg-[#F7F3EA] rounded-md border border-[#DDD8CC] flex items-center justify-between text-xs">
                    <span className="font-bold text-[#252A27] flex items-center gap-2 truncate pr-2">
                      <FileText className="w-4 h-4 text-[#23483A] shrink-0" />
                      <span className="truncate">{app.doc2Name}</span>
                    </span>
                    <button
                      onClick={() => setPreviewDoc({ title: app.doc2Name, url: app.doc2Url })}
                      className="text-xs font-bold text-[#23483A] hover:underline flex items-center gap-1 shrink-0 bg-white px-2.5 py-1 rounded border border-[#23483A]/20 shadow-sm"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Inspect</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Review History */}
              {app.reviewedAt && (
                <div className="text-[11px] text-[#6F756F] font-medium border-t border-[#DDD8CC] pt-3 flex items-center justify-between">
                  <span>Reviewed by: <strong className="text-[#252A27]">{app.reviewedBy || 'Admin'}</strong> on {new Date(app.reviewedAt).toLocaleString('en-IN')}</span>
                  {app.rejectionReason && (
                    <span className="text-[#B65C3A] font-bold">Reason: {app.rejectionReason}</span>
                  )}
                </div>
              )}

              {/* Action Buttons */}
              {app.status === 'PENDING_APPROVAL' && (
                <div className="flex flex-wrap items-center gap-3 pt-2">
                  <button
                    onClick={() => handleAction(app.id, 'APPROVED')}
                    className="px-6 py-2.5 bg-[#23483A] hover:bg-[#1b382d] text-white font-bold text-xs rounded-md shadow-sm flex items-center gap-1.5 transition"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Approve User</span>
                  </button>

                  <button
                    onClick={() => {
                      setRejectingId(app.id);
                      setRejectionReasonInput('');
                    }}
                    className="px-6 py-2.5 bg-[#B65C3A] hover:bg-[#9a4b2e] text-white font-bold text-xs rounded-md shadow-sm flex items-center gap-1.5 transition"
                  >
                    <XCircle className="w-4 h-4" />
                    <span>Reject Application</span>
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Rejection Reason Modal */}
      {rejectingId && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-[#FFFDF8] rounded-md border border-[#DDD8CC] max-w-md w-full p-6 space-y-4 shadow-xl animate-in zoom-in-95">
            <h3 className="text-lg font-extrabold text-[#252A27]">Reject Application</h3>
            <p className="text-xs text-[#6F756F] font-medium">
              Please provide a reason for rejecting this registration application.
            </p>
            <textarea
              required
              rows={3}
              placeholder="e.g. Incomplete 7/12 land revenue record provided."
              value={rejectionReasonInput}
              onChange={e => setRejectionReasonInput(e.target.value)}
              className="w-full text-xs p-3 bg-[#FFFDF8] border border-[#CFC9BC] rounded-md font-bold text-[#252A27] focus:ring-1 focus:ring-[#B65C3A] focus:outline-none"
            />
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setRejectingId(null)}
                className="px-4 py-2 border border-[#DDD8CC] rounded-md text-xs font-bold text-[#252A27] hover:bg-[#F7F3EA]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleAction(rejectingId, 'REJECTED', rejectionReasonInput || 'Document or detail mismatch.')}
                className="px-4 py-2 bg-[#B65C3A] hover:bg-[#9a4b2e] text-white text-xs font-bold rounded-md shadow-sm"
              >
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Document Inspection Preview Modal */}
      {previewDoc && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-[#FFFDF8] rounded-md border border-[#DDD8CC] max-w-2xl w-full p-6 space-y-4 shadow-xl max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-[#DDD8CC] pb-3">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-[#23483A]" />
                <h3 className="text-sm font-extrabold text-[#252A27]">{previewDoc.title}</h3>
              </div>
              <button
                onClick={() => setPreviewDoc(null)}
                className="text-xs font-bold text-[#6F756F] hover:text-[#252A27] bg-[#F7F3EA] px-2.5 py-1 rounded"
              >
                Close ✕
              </button>
            </div>

            <div className="flex-1 overflow-auto min-h-[350px] bg-[#F7F3EA] rounded-md border border-[#DDD8CC] p-4 flex flex-col items-center justify-center space-y-4 text-center">
              <iframe
                src={previewDoc.url}
                className="w-full h-[400px] rounded border border-[#DDD8CC]"
                title={previewDoc.title}
              />
              <a
                href={previewDoc.url}
                target="_blank"
                rel="noreferrer"
                className="px-4 py-2 bg-[#23483A] text-white font-bold text-xs rounded-md shadow-sm flex items-center gap-1.5"
              >
                <ExternalLink className="w-4 h-4" />
                <span>Open Document in New Tab</span>
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
