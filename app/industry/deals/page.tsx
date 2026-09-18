'use client';

import React from 'react';
import Link from 'next/link';
import { useAppStore } from '@/lib/store/use-app-store';
import { Scale, CheckCircle2, Truck } from 'lucide-react';

export default function IndustryDealsPage() {
  const { agreements, deliveries, signAgreement } = useAppStore();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Legal Purchase Agreements</h1>
        <p className="text-xs text-slate-500 font-medium">
          Review, sign, and manage legal agreements generated after passing ground verifications.
        </p>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 lg:p-8 space-y-6">
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
                {agr.industrySignature ? (
                  <span className="text-emerald-700 font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Industry Signed</span>
                  </span>
                ) : (
                  <button
                    onClick={() => signAgreement(agr.id, 'Sunil Deshmukh (AgriFoods Ltd)')}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl transition"
                  >
                    Sign Purchase Agreement
                  </button>
                )}

                {agr.status === 'FULLY_EXECUTED' && (
                  <Link
                    href={`/industry/delivery/${deliveries[0]?.id || 'del_1'}`}
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
      </div>
    </div>
  );
}
