'use client';

import React from 'react';
import { useAppStore } from '@/lib/store/use-app-store';
import { ShieldCheck } from 'lucide-react';
import Link from 'next/link';

export default function IndustryBidsPage() {
  const { bids, auctions, currentUser } = useAppStore();

  const myBids = bids.filter(b => b.industryId === currentUser?.id || b.anonymousBidderId.includes('A17'));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">My Anonymous Bids Log</h1>
        <p className="text-xs text-slate-500 font-medium">
          All anonymous bids placed by your company across registered crop lot auctions.
        </p>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-[11px] font-bold text-slate-500 uppercase border-b border-slate-200">
                <th className="p-4">Crop Lot</th>
                <th className="p-4">Assigned Anonymous ID</th>
                <th className="p-4">Bid Amount / Ton</th>
                <th className="p-4">Total Bid Amount</th>
                <th className="p-4">Timestamp</th>
                <th className="p-4">Status</th>
                <th className="p-4">Auction Link</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {myBids.map(bid => {
                const auction = auctions.find(a => a.id === bid.auctionId);
                return (
                  <tr key={bid.id} className="hover:bg-slate-50">
                    <td className="p-4 font-bold text-slate-900">{auction?.crop || 'Crop Lot'} ({auction?.variety})</td>
                    <td className="p-4 font-bold text-slate-800 flex items-center gap-1">
                      <ShieldCheck className="w-4 h-4 text-emerald-600" />
                      <span>{bid.anonymousBidderId}</span>
                    </td>
                    <td className="p-4 font-extrabold text-emerald-800">₹{bid.amountPerTon.toLocaleString('en-IN')}/ton</td>
                    <td className="p-4 font-semibold text-slate-700">₹{bid.totalAmount.toLocaleString('en-IN')}</td>
                    <td className="p-4 text-slate-400">{new Date(bid.createdAt).toLocaleString('en-IN')}</td>
                    <td className="p-4">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${bid.status === 'ACTIVE' || bid.status === 'WINNER_SELECTED' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-500'}`}>
                        {bid.status}
                      </span>
                    </td>
                    <td className="p-4">
                      <Link href={`/industry/auctions/${bid.auctionId}`} className="text-xs font-bold text-blue-600 hover:underline">
                        View Auction →
                      </Link>
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
