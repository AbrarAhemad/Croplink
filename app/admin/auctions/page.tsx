'use client';

import React from 'react';
import { useAppStore } from '@/lib/store/use-app-store';
import { ShieldCheck, CheckCircle2, Package, Truck, ArrowRight, UserCheck } from 'lucide-react';
import { SampleStatus } from '@/types';
import { getFarmerIdentityView, getIndustryIdentityView } from '@/lib/identity-helpers';

export default function AdminAuctionsPage() {
  const { auctions, bids, farmerProfile, updateSampleStatus } = useAppStore();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-200 pb-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Admin Crop Lot Operations</h1>
            <span className="px-2.5 py-0.5 bg-purple-100 text-purple-800 text-[10px] font-extrabold uppercase rounded-full border border-purple-200">
              Unmasked Operational View
            </span>
          </div>
          <p className="text-xs text-slate-500 font-medium">
            Manage 20kg physical crop sample testing at APMC Sangli Hub and inspect real participant identities.
          </p>
        </div>

        <div className="bg-purple-50 p-3 rounded-2xl border border-purple-100 text-xs text-purple-900 flex items-center gap-3">
          <UserCheck className="w-5 h-5 text-purple-600 shrink-0" />
          <span className="font-semibold text-[11px]">
            Admin Privileges Active: Full seller and buyer corporate identities unmasked for platform management.
          </span>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-[11px] font-bold text-slate-500 uppercase border-b border-slate-200">
                <th className="p-4">Crop Lot</th>
                <th className="p-4">Quantity / Grade</th>
                <th className="p-4">Farmer</th>
                <th className="p-4">Sample Status</th>
                <th className="p-4">Auction Status</th>
                <th className="p-4">Highest Bidder</th>
                <th className="p-4">Highest Bid</th>
                <th className="p-4">Sample Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {auctions.map(auc => {
                // Resolve real farmer identity for Admin
                const farmerView = getFarmerIdentityView(auc, 'ADMIN', farmerProfile);

                // Find highest bid for this auction lot
                const lotBids = bids.filter(b => b.auctionId === auc.id).sort((a, b) => b.amountPerTon - a.amountPerTon);
                const highestBid = lotBids[0];
                const highestBidderView = highestBid ? getIndustryIdentityView(highestBid, 'ADMIN') : null;

                return (
                  <tr key={auc.id} className="hover:bg-slate-50/80 transition-colors">
                    {/* Crop Lot */}
                    <td className="p-4">
                      <span className="font-bold text-slate-900 block text-sm">{auc.crop}</span>
                      <span className="text-[11px] text-slate-500 block mt-0.5">{auc.variety}</span>
                      <span className="text-[10px] font-mono text-purple-700 font-semibold">{auc.id}</span>
                    </td>

                    {/* Quantity / Grade */}
                    <td className="p-4">
                      <span className="font-extrabold text-slate-800 block">{auc.quantityTons} Tons</span>
                      <span className="text-[11px] text-emerald-700 font-semibold">{auc.qualityGrade}</span>
                    </td>

                    {/* FARMER (Real Identity for Admin) */}
                    <td className="p-4 bg-purple-50/30">
                      <span className="font-bold text-slate-900 block">{farmerView.fullName}</span>
                      <span className="text-[11px] text-purple-900 font-medium block">{farmerView.farmName}</span>
                      <span className="text-[10px] text-slate-500 block">{farmerView.locationDisplay}</span>
                    </td>

                    {/* Sample Status */}
                    <td className="p-4">
                      <span className="px-2.5 py-1 bg-purple-100 text-purple-900 rounded-full text-[10px] font-bold border border-purple-200 inline-block">
                        {auc.sampleStatus.replace(/_/g, ' ')}
                      </span>
                    </td>

                    {/* Auction Status */}
                    <td className="p-4">
                      <span className="px-2.5 py-1 bg-slate-100 text-slate-800 rounded-full text-[10px] font-bold inline-block">
                        {auc.status.replace(/_/g, ' ')}
                      </span>
                    </td>

                    {/* HIGHEST BIDDER (Real Corporate Identity) */}
                    <td className="p-4">
                      {highestBidderView ? (
                        <div>
                          <span className="font-bold text-slate-900 block">{highestBidderView.companyName}</span>
                          <span className="text-[11px] text-slate-500 block">Contact: {highestBidderView.contactPerson}</span>
                        </div>
                      ) : (
                        <span className="text-slate-400 italic">No Bids Placed</span>
                      )}
                    </td>

                    {/* HIGHEST BID */}
                    <td className="p-4 font-extrabold text-emerald-700 text-sm">
                      {auc.currentHighestBid ? `₹${auc.currentHighestBid.toLocaleString('en-IN')} / ton` : '—'}
                    </td>

                    {/* SAMPLE ACTIONS */}
                    <td className="p-4">
                      <select
                        value={auc.sampleStatus}
                        onChange={(e) => updateSampleStatus(auc.id, e.target.value as SampleStatus)}
                        className="text-xs p-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 focus:ring-2 focus:ring-purple-500 focus:outline-none"
                      >
                        <option value="NOT_SENT">NOT_SENT</option>
                        <option value="SENT">SENT to Hub</option>
                        <option value="RECEIVED">RECEIVED at Hub</option>
                        <option value="VERIFIED">VERIFIED (Passed)</option>
                        <option value="FORWARDED_TO_INDUSTRY">FORWARDED TO INDUSTRY</option>
                      </select>
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
