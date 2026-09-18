'use client';

import React from 'react';
import { useAppStore } from '@/lib/store/use-app-store';
import { CreditCard, CheckCircle2, ShieldCheck } from 'lucide-react';

export default function IndustryPaymentsPage() {
  const { registrations, auctions } = useAppStore();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Razorpay Registration Payments</h1>
        <p className="text-xs text-slate-500 font-medium">
          Audit trail of ₹1,999 auction registration fees paid via Razorpay Test Mode.
        </p>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-[11px] font-bold text-slate-500 uppercase border-b border-slate-200">
                <th className="p-4">Payment ID</th>
                <th className="p-4">Auction Lot</th>
                <th className="p-4">Fee Amount</th>
                <th className="p-4">Status</th>
                <th className="p-4">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {registrations.map(reg => {
                const auction = auctions.find(a => a.id === reg.auctionId);
                return (
                  <tr key={reg.id} className="hover:bg-slate-50">
                    <td className="p-4 font-mono font-bold text-slate-800">{reg.paymentId}</td>
                    <td className="p-4 font-bold text-slate-900">{auction?.crop || 'Auction Lot'} ({auction?.variety})</td>
                    <td className="p-4 font-extrabold text-emerald-800">₹{reg.feeAmount.toLocaleString('en-IN')}</td>
                    <td className="p-4">
                      <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 rounded-full text-[10px] font-bold flex items-center gap-1 w-max">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
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
