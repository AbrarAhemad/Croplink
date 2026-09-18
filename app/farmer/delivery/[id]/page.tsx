'use client';

import React, { use } from 'react';
import { useAppStore } from '@/lib/store/use-app-store';
import { Truck, MapPin, Calendar, CheckCircle2, Clock, ShieldCheck } from 'lucide-react';
import Link from 'next/link';

export default function FarmerDeliveryPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { deliveries } = useAppStore();

  const delivery = deliveries.find(d => d.id === id) || deliveries[0];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div className="space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full text-xs font-semibold">
          <Truck className="w-3.5 h-3.5 text-emerald-600" />
          <span>CropLink Logistics Tracking</span>
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Delivery Tracker</h1>
        <p className="text-xs text-slate-500 font-medium">
          Real-time route tracking from farm origin to industrial warehouse.
        </p>
      </div>

      {/* Main Delivery Card */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 lg:p-8 space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <span className="text-xs font-bold text-slate-400 block">Current Delivery Status</span>
            <span className="text-xl font-extrabold text-emerald-700">{delivery.status}</span>
          </div>

          <div className="text-right">
            <span className="text-xs text-slate-400 block font-medium">Assigned Vehicle</span>
            <span className="text-sm font-bold text-slate-800">{delivery.vehicleNumber || 'MH 10 CR 4582'}</span>
            <span className="text-xs text-slate-500 block font-medium">Driver: {delivery.driverName || 'Suresh More'}</span>
          </div>
        </div>

        {/* Route Summary */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-100 text-xs">
          <div>
            <span className="text-slate-400 font-medium block">Origin Area</span>
            <span className="font-bold text-slate-800">{delivery.originArea}</span>
          </div>
          <div>
            <span className="text-slate-400 font-medium block">Destination Area</span>
            <span className="font-bold text-slate-800">{delivery.destinationArea}</span>
          </div>
          <div>
            <span className="text-slate-400 font-medium block">Estimated Highway Distance</span>
            <span className="font-bold text-emerald-800">{delivery.estimatedKm} km</span>
          </div>
        </div>

        {/* Timeline */}
        <div className="space-y-4">
          <h3 className="font-bold text-sm text-slate-900">Delivery Event Timeline</h3>
          <div className="space-y-3 relative before:absolute before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-emerald-200">
            {delivery.timeline.map((event, idx) => (
              <div key={idx} className="flex items-start gap-4 text-xs relative z-10 pl-1">
                <div className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold shrink-0 text-[10px]">
                  ✓
                </div>
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 flex-1 space-y-1">
                  <div className="flex items-center justify-between font-bold text-slate-900">
                    <span>{event.status}</span>
                    <span className="text-[10px] text-slate-400 font-normal">{new Date(event.timestamp).toLocaleString('en-IN')}</span>
                  </div>
                  <p className="text-slate-600">{event.note}</p>
                  <span className="text-[10px] font-semibold text-emerald-700 flex items-center gap-1">
                    <MapPin className="w-3 h-3" /> {event.location}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
