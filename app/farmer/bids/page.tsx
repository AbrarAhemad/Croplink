'use client';

import React from 'react';
import { useAppStore } from '@/lib/store/use-app-store';
import { ShieldCheck, Scale, Clock } from 'lucide-react';
import Link from 'next/link';

export default function FarmerBidsPage() {
  const { auctions, bids, currentUser } = useAppStore();

  const myAuctions = auctions.filter(a => a.farmerId === currentUser?.id || a.farmerAnonymousId.includes('MH-42'));
  const myAuctionIds = new Set(myAuctions.map(a => a.id));

  const receivedBids = bids.filter(b => myAuctionIds.has(b.auctionId)).sort((a, b) => b.amountPerTon - a.amountPerTon);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Bid Activity Log</h1>
        <p className="text-xs text-slate-500 font-medium">
          Monitor competitive anonymous bids across your published crop lots. Bidder identities are strictly protected as <strong className="text-emerald-700">Bidder #A17</strong>.
        </p>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-[11px] font-bold text-slate-500 uppercase border-b border-slate-200">
                <th className="p-4">Crop Lot</th>
                <th className="p-4">Anonymous Bidder ID</th>
                <th className="p-4">Bid Amount / Ton</th>
                <th className="p-4">Total Lot Value</th>
                <th className="p-4">Timestamp</th>
                <th className="p-4">Status</th>
                <th className="p-4">Auction Link</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {receivedBids.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-400">
                    No bids received yet. Ensure your 20kg sample has reached Sangli APMC Hub.
                  </td>
                </tr>
              ) : (
                receivedBids.map(bid => {
                  const auction = myAuctions.find(a => a.id === bid.auctionId);
                  return (
                    <tr key={bid.id} className="hover:bg-slate-50">
                      <td className="p-4 font-bold text-slate-900">{auction?.crop || 'Crop Lot'} ({auction?.variety})</td>
                      <td className="p-4 font-bold text-slate-800 flex items-center gap-1.5">
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
                        <Link href={`/farmer/auctions/${bid.auctionId}`} className="text-xs font-bold text-emerald-600 hover:underline">
                          View Auction →
                        </Link>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
