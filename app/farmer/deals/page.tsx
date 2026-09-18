'use client';

import React from 'react';
import Link from 'next/link';
import { useAppStore } from '@/lib/store/use-app-store';
import { Scale, ShieldCheck, CheckCircle2, Truck, FileText, ArrowRight } from 'lucide-react';

export default function FarmerDealsPage() {
  const { agreements, verifications, auctions, deliveries, signAgreement } = useAppStore();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Sales & Legal Agreements</h1>
        <p className="text-xs text-slate-500 font-medium">
          Manage winner ground verifications, sign legally binding sales agreements, and track crop dispatch.
        </p>
      </div>

      {/* Agreements Section */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 lg:p-8 space-y-6">
        <h2 className="font-extrabold text-lg text-slate-900 flex items-center gap-2">
          <Scale className="w-5 h-5 text-emerald-600" />
          <span>Active Sales Agreements ({agreements.length})</span>
        </h2>

        {agreements.length === 0 ? (
          <div className="p-8 text-center text-slate-400 text-xs border border-dashed border-slate-200 rounded-2xl">
            No sales agreements pending signature yet. Agreements are generated automatically after ground verification passes.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {agreements.map(agr => (
              <div key={agr.id} className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                  <div>
                    <span className="text-xs font-bold text-slate-900 block">{agr.crop}</span>
                    <span className="text-[11px] text-slate-500">{agr.quantityTons} Tons</span>
                  </div>
                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold ${agr.status === 'FULLY_EXECUTED' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
                    {agr.status}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-slate-400 text-[10px] block">Agreed Price</span>
                    <span className="font-bold text-emerald-800">₹{agr.finalPricePerTon.toLocaleString('en-IN')}/ton</span>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] block">Total Deal Value</span>
                    <span className="font-bold text-slate-900">₹{agr.totalDealValue.toLocaleString('en-IN')}</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-xs">
                  {agr.farmerSignature ? (
                    <span className="text-emerald-700 font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>Farmer Signed</span>
                    </span>
                  ) : (
                    <button
                      onClick={() => signAgreement(agr.id, 'Rameshwar Patil (Digitally Signed)')}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition"
                    >
                      Sign Sales Agreement
                    </button>
                  )}

                  {agr.status === 'FULLY_EXECUTED' && (
                    <Link
                      href={`/farmer/delivery/${deliveries[0]?.id || 'del_1'}`}
                      className="text-xs font-bold text-blue-600 hover:underline flex items-center gap-1"
                    >
                      <Truck className="w-4 h-4" />
                      <span>Track Dispatch</span>
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Ground Verifications Status */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 lg:p-8 space-y-4">
        <h2 className="font-extrabold text-lg text-slate-900 flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-blue-600" />
          <span>Ground Inspection Requests ({verifications.length})</span>
        </h2>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-[11px] font-bold text-slate-500 uppercase border-b border-slate-200">
                <th className="p-3">Assigned Winner Rank</th>
                <th className="p-3">Inspection Date</th>
                <th className="p-3">Status</th>
                <th className="p-3">Inspector Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {verifications.map(gv => (
                <tr key={gv.id} className="hover:bg-slate-50">
                  <td className="p-3 font-bold text-slate-800">Rank #{gv.assignedBidderRank} Highest Bidder</td>
                  <td className="p-3 font-medium text-slate-600">{gv.scheduledDate}</td>
                  <td className="p-3">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-800">
                      {gv.status}
                    </span>
                  </td>
                  <td className="p-3 text-slate-500">{gv.notes || 'Awaiting quality team visit'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
