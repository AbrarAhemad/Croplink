'use client';

import React from 'react';
import { useAppStore } from '@/lib/store/use-app-store';
import { UserCheck, ShieldCheck, MapPin, FileText } from 'lucide-react';

export default function FarmerProfilePage() {
  const { farmerProfile, currentUser } = useAppStore();

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 lg:p-8 space-y-6">
        <div className="flex items-center gap-4 border-b border-slate-100 pb-4">
          <div className="w-14 h-14 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-bold text-xl">
            <UserCheck className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-extrabold text-slate-900">{currentUser?.fullName}</h1>
              <span className="px-2.5 py-0.5 bg-emerald-100 text-emerald-800 rounded-full text-[10px] font-bold">
                APPROVED
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium">{currentUser?.email} • {currentUser?.mobile}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
            <span className="text-slate-400 block font-medium mb-1">Farm Name & Location</span>
            <span className="font-bold text-slate-900 block">{farmerProfile.farmName}</span>
            <span className="text-slate-600">{farmerProfile.fullAddress}</span>
          </div>

          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
            <span className="text-slate-400 block font-medium mb-1">Land Area & Crops</span>
            <span className="font-bold text-slate-900 block">{farmerProfile.landAreaAcres} Acres</span>
            <span className="text-slate-600">{farmerProfile.cropsGrown.join(', ')}</span>
          </div>
        </div>

        <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 text-xs text-emerald-900 flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>7/12 Revenue Extract & Aadhaar documents verified by Admin.</span>
        </div>
      </div>
    </div>
  );
}
