'use client';

import React from 'react';
import { useAppStore } from '@/lib/store/use-app-store';
import { Truck, MapPin, Calendar, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function FarmerDeliveryListPage() {
  const { deliveries } = useAppStore();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Delivery & Dispatch Log</h1>
        <p className="text-xs text-slate-500 font-medium">
          Track truck dispatches from your farm and Sangli hub to buyer processing facilities.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {deliveries.map(del => (
          <div key={del.id} className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                {del.status}
              </span>
              <span className="text-xs text-slate-500 font-semibold">{del.estimatedKm} km Highway Distance</span>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">Origin:</span>
                <span className="font-bold text-slate-800">{del.originArea}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Destination:</span>
                <span className="font-bold text-slate-800">{del.destinationArea}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Assigned Driver:</span>
                <span className="font-bold text-slate-800">{del.driverName || 'Suresh More'} ({del.vehicleNumber || 'MH 10 CR 4582'})</span>
              </div>
            </div>

            <Link
              href={`/farmer/delivery/${del.id}`}
              className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition"
            >
              <Truck className="w-4 h-4" />
              <span>View Full Route Timeline</span>
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
