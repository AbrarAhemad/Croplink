'use client';

import React from 'react';
import { useAppStore } from '@/lib/store/use-app-store';
import { CreditCard, CheckCircle2, ShieldCheck, UserCheck } from 'lucide-react';
import { getIndustryIdentityView } from '@/lib/identity-helpers';

export default function AdminPaymentsPage() {
  const { registrations, verifications, settings } = useAppStore();

  const totalRegRevenue = registrations.length * settings.industryRegistrationFeeInr;
  const totalCancelRevenue = verifications.filter(v => v.status === 'CANCELLED').length * settings.cancellationFeeInr;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-200 pb-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Platform Payments & Fee Audit</h1>
            <span className="px-2.5 py-0.5 bg-purple-100 text-purple-800 text-[10px] font-extrabold uppercase rounded-full border border-purple-200">
              Unmasked Payer Identities
            </span>
          </div>
          <p className="text-xs text-slate-500 font-medium">
            Comprehensive ledger of Razorpay industry registration fees (₹1,999) and post-verification cancellation penalties (₹5,000).
          </p>
        </div>

        <div className="bg-purple-50 p-3 rounded-2xl border border-purple-100 text-xs text-purple-900 flex items-center gap-3">
          <UserCheck className="w-5 h-5 text-purple-600 shrink-0" />
          <span className="font-semibold text-[11px]">
            Admin Payer Unmasking: Corporate buyer identities visible for fee reconciliation.
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="p-5 bg-white rounded-3xl border border-slate-200 shadow-sm space-y-1">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Registration Revenue</span>
          <span className="text-2xl font-extrabold text-slate-900 block">₹{totalRegRevenue.toLocaleString('en-IN')}</span>
          <span className="text-[11px] text-emerald-600 font-semibold">{registrations.length} Registrations × ₹1,999</span>
        </div>

        <div className="p-5 bg-white rounded-3xl border border-slate-200 shadow-sm space-y-1">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Cancellation Fee Revenue</span>
          <span className="text-2xl font-extrabold text-purple-700 block">₹{totalCancelRevenue.toLocaleString('en-IN')}</span>
          <span className="text-[11px] text-slate-400 font-medium">Penalties Applied</span>
        </div>

        <div className="p-5 bg-white rounded-3xl border border-slate-200 shadow-sm space-y-1">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Total Platform Collections</span>
          <span className="text-2xl font-extrabold text-emerald-700 block">₹{(totalRegRevenue + totalCancelRevenue).toLocaleString('en-IN')}</span>
          <span className="text-[11px] text-slate-400 font-medium">Razorpay Test Mode Verified</span>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-[11px] font-bold text-slate-500 uppercase border-b border-slate-200">
                <th className="p-4">Transaction ID</th>
                <th className="p-4">Industry Buyer (Corporate Identity)</th>
                <th className="p-4">Auction Lot ID</th>
                <th className="p-4">Amount Collected</th>
                <th className="p-4">Status</th>
                <th className="p-4">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {registrations.map(reg => {
                const industryView = getIndustryIdentityView(reg, 'ADMIN');

                return (
                  <tr key={reg.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-4 font-mono font-bold text-slate-800">{reg.paymentId}</td>
                    <td className="p-4 bg-purple-50/30">
                      <span className="font-bold text-slate-900 block">{industryView.companyName}</span>
                      <span className="text-[11px] text-slate-600 block">Contact: {industryView.contactPerson}</span>
                      <span className="text-[10px] font-mono text-slate-400 block">GST: {industryView.gstNumber}</span>
                    </td>
                    <td className="p-4 font-mono text-purple-700 font-semibold">{reg.auctionId}</td>
                    <td className="p-4 font-extrabold text-emerald-800">₹{reg.feeAmount.toLocaleString('en-IN')}</td>
                    <td className="p-4">
                      <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 rounded-full text-[10px] font-bold">
                        {reg.status}
                      </span>
                    </td>
                    <td className="p-4 text-slate-400">{new Date(reg.createdAt).toLocaleString('en-IN')}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
