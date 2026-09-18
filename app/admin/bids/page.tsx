'use client';

import React from 'react';
import { useAppStore } from '@/lib/store/use-app-store';
import { ShieldCheck, UserCheck } from 'lucide-react';
import { getIndustryIdentityView } from '@/lib/identity-helpers';

export default function AdminBidsPage() {
  const { bids, auctions } = useAppStore();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-200 pb-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Admin Master Bid Log</h1>
            <span className="px-2.5 py-0.5 bg-purple-100 text-purple-800 text-[10px] font-extrabold uppercase rounded-full border border-purple-200">
              Real Corporate Identities
            </span>
          </div>
          <p className="text-xs text-slate-500 font-medium">
            Real-time audit log of all live and historic bids submitted by industrial buyers across crop lots.
          </p>
        </div>

        <div className="bg-purple-50 p-3 rounded-2xl border border-purple-100 text-xs text-purple-900 flex items-center gap-3">
          <UserCheck className="w-5 h-5 text-purple-600 shrink-0" />
          <span className="font-semibold text-[11px]">
            Admin View: Anonymity rules do not apply to platform administrators.
          </span>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-[11px] font-bold text-slate-500 uppercase border-b border-slate-200">
                <th className="p-4">Bid #</th>
                <th className="p-4">Crop Lot</th>
                <th className="p-4">Industry / Company</th>
                <th className="p-4">Contact Person</th>
                <th className="p-4">Bid Amount / Ton</th>
                <th className="p-4">Total Bid Value</th>
                <th className="p-4">Timestamp</th>
                <th className="p-4">Bid Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {bids.map((bid, index) => {
                const auction = auctions.find(a => a.id === bid.auctionId);
                const industryView = getIndustryIdentityView(bid, 'ADMIN');

                return (
                  <tr key={bid.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-4 font-mono font-bold text-purple-800">{index + 1}</td>
                    <td className="p-4">
                      <span className="font-bold text-slate-900 block">{auction?.crop || 'Crop Lot'}</span>
                      <span className="text-[10px] text-slate-500 font-mono">{bid.auctionId}</span>
                    </td>
                    <td className="p-4 bg-purple-50/30">
                      <span className="font-bold text-slate-900 block">{industryView.companyName}</span>
                      <span className="text-[10px] text-slate-400 font-mono">GSTIN: {industryView.gstNumber}</span>
                    </td>
                    <td className="p-4">
                      <span className="font-semibold text-slate-700 block">{industryView.contactPerson}</span>
                      <span className="text-[11px] text-slate-400 block">{industryView.mobile}</span>
                    </td>
                    <td className="p-4 font-extrabold text-emerald-700 text-sm">
                      ₹{bid.amountPerTon.toLocaleString('en-IN')} / ton
                    </td>
                    <td className="p-4 font-bold text-slate-800">
                      ₹{bid.totalAmount.toLocaleString('en-IN')}
                    </td>
                    <td className="p-4 text-slate-500 text-[11px]">
                      {new Date(bid.createdAt).toLocaleString('en-IN', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                        hour12: true,
                      })}
                    </td>
                    <td className="p-4">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                        bid.status === 'ACTIVE' || bid.status === 'WINNER_SELECTED'
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                          : 'bg-slate-100 text-slate-600'
                      }`}>
                        {bid.status}
                      </span>
                    </td>
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
