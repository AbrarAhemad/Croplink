'use client';

import React from 'react';
import { useAppStore } from '@/lib/store/use-app-store';
import { Building2, ShieldCheck } from 'lucide-react';

export default function IndustryProfilePage() {
  const { industryProfile, currentUser } = useAppStore();

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 lg:p-8 space-y-6">
        <div className="flex items-center gap-4 border-b border-slate-100 pb-4">
          <div className="w-14 h-14 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-bold text-xl">
            <Building2 className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-extrabold text-slate-900">{industryProfile.companyName}</h1>
              <span className="px-2.5 py-0.5 bg-blue-100 text-blue-800 rounded-full text-[10px] font-bold">
                APPROVED
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium">{industryProfile.contactPerson} • GSTIN: {industryProfile.gstNumber}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
            <span className="text-slate-400 block font-medium mb-1">Company Address</span>
            <span className="font-bold text-slate-900 block">{industryProfile.fullAddress}</span>
            <span className="text-slate-600">{industryProfile.city}, {industryProfile.state}</span>
          </div>

          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
            <span className="text-slate-400 block font-medium mb-1">Procurement Targets</span>
            <span className="font-bold text-slate-900 block">{industryProfile.requiredQuantityTons} Tons Requirement</span>
            <span className="text-slate-600">{industryProfile.requiredCrops.join(', ')}</span>
          </div>
        </div>

        <div className="p-4 bg-blue-50 rounded-2xl border border-blue-200 text-xs text-blue-900 flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-blue-600 shrink-0" />
          <span>GSTIN & Incorporation Certificate verified by Admin.</span>
        </div>
      </div>
    </div>
  );
}
