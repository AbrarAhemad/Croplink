'use client';

import React from 'react';
import Link from 'next/link';
import { useAppStore } from '@/lib/store/use-app-store';
import { Scale, ShieldCheck, CheckCircle2, Truck, UserCheck, FileText } from 'lucide-react';
import { getFarmerIdentityView, getIndustryIdentityView } from '@/lib/identity-helpers';

export default function AdminDealsPage() {
  const { agreements, verifications, auctions, deliveries, farmerProfile } = useAppStore();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-200 pb-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Admin Deal Management</h1>
            <span className="px-2.5 py-0.5 bg-purple-100 text-purple-800 text-[10px] font-extrabold uppercase rounded-full border border-purple-200">
              Unmasked Operational View
            </span>
          </div>
          <p className="text-xs text-slate-500 font-medium">
            Monitor executed sales agreements, unmasked farmer/buyer contracts, and post-verification escrow deals.
          </p>
        </div>

        <div className="bg-purple-50 p-3 rounded-2xl border border-purple-100 text-xs text-purple-900 flex items-center gap-3">
          <UserCheck className="w-5 h-5 text-purple-600 shrink-0" />
          <span className="font-semibold text-[11px]">
            Admin Privileges: Real farmer and industrial buyer identities fully visible for operational oversight.
          </span>
        </div>
      </div>

      {/* Agreements Section */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 lg:p-8 space-y-6">
        <h2 className="font-extrabold text-lg text-slate-900 flex items-center gap-2">
          <Scale className="w-5 h-5 text-purple-600" />
          <span>Executed Sales & Legal Agreements ({agreements.length})</span>
        </h2>

        {agreements.length === 0 ? (
          <div className="p-8 text-center text-slate-400 text-xs border border-dashed border-slate-200 rounded-2xl">
            No sales agreements recorded yet.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {agreements.map(agr => {
              const auction = auctions.find(a => a.id === agr.auctionId);
              const farmerView = getFarmerIdentityView(
                auction || { farmerId: agr.farmerId, farmerAnonymousId: 'Farmer #MH-42 (Sangli)', locationArea: 'Sangli' },
                'ADMIN',
                farmerProfile
              );
              const industryView = getIndustryIdentityView(
                { industryId: agr.industryId },
                'ADMIN'
              );

              return (
                <div key={agr.id} className="p-6 rounded-3xl bg-slate-50 border border-slate-200 space-y-5">
                  {/* Title & Status */}
                  <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                    <div>
                      <span className="text-sm font-extrabold text-slate-900 block">{agr.crop}</span>
                      <span className="text-xs text-slate-500 font-medium">{agr.quantityTons} Tons Lot</span>
                    </div>
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold ${agr.status === 'FULLY_EXECUTED' ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' : 'bg-amber-100 text-amber-800'}`}>
                      {agr.status}
                    </span>
                  </div>

                  {/* Contracting Parties (REAL IDENTITIES FOR ADMIN) */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-white p-4 rounded-2xl border border-slate-200 text-xs">
                    {/* FARMER */}
                    <div className="space-y-1 border-r sm:border-r border-slate-100 pr-2">
                      <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider block">Farmer Party</span>
                      <span className="font-extrabold text-slate-900 block">{farmerView.fullName}</span>
                      <span className="text-[11px] text-slate-600 block">{farmerView.farmName}</span>
                      <span className="text-[10px] text-slate-400 block">{farmerView.locationDisplay}</span>
                      <span className="text-[10px] text-slate-500 block">{farmerView.mobile}</span>
                    </div>

                    {/* INDUSTRY */}
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold text-purple-700 uppercase tracking-wider block">Industry Buyer</span>
                      <span className="font-extrabold text-slate-900 block">{industryView.companyName}</span>
                      <span className="text-[11px] text-slate-600 block">Contact: {industryView.contactPerson}</span>
                      <span className="text-[10px] font-mono text-slate-400 block">GST: {industryView.gstNumber}</span>
                      <span className="text-[10px] text-slate-500 block">{industryView.mobile}</span>
                    </div>
                  </div>

                  {/* Financial Summary */}
                  <div className="grid grid-cols-2 gap-2 text-xs bg-slate-100/70 p-3 rounded-xl">
                    <div>
                      <span className="text-slate-500 text-[10px] block">Agreed Price</span>
                      <span className="font-extrabold text-emerald-800 text-sm">₹{agr.finalPricePerTon.toLocaleString('en-IN')}/ton</span>
                    </div>
                    <div>
                      <span className="text-slate-500 text-[10px] block">Total Contract Value</span>
                      <span className="font-extrabold text-slate-900 text-sm">₹{agr.totalDealValue.toLocaleString('en-IN')}</span>
                    </div>
                  </div>

                  {/* Signature Verification Status */}
                  <div className="pt-2 border-t border-slate-200 flex flex-wrap items-center justify-between text-xs gap-2">
                    <div className="space-y-1 text-[11px]">
                      <div className="flex items-center gap-1.5 font-semibold text-slate-700">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Farmer Sig: {agr.farmerSignature || 'Pending'}</span>
                      </div>
                      <div className="flex items-center gap-1.5 font-semibold text-slate-700">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Buyer Sig: {agr.industrySignature || 'Pending'}</span>
                      </div>
                    </div>

                    <Link
                      href="/admin/delivery"
                      className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-xl shadow transition flex items-center gap-1"
                    >
                      <Truck className="w-3.5 h-3.5" />
                      <span>Manage Dispatch</span>
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
