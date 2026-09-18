'use client';

import React, { useState } from 'react';
import { useAppStore } from '@/lib/store/use-app-store';
import { Truck, MapPin, CheckCircle2, UserCheck, ShieldCheck } from 'lucide-react';
import { DeliveryStatus } from '@/types';
import { getFarmerIdentityView, getIndustryIdentityView } from '@/lib/identity-helpers';

export default function AdminDeliveryPage() {
  const { deliveries, agreements, auctions, farmerProfile, updateDeliveryStatus } = useAppStore();

  const [selectedDelId, setSelectedDelId] = useState<string>(deliveries[0]?.id || '');
  const [status, setStatus] = useState<DeliveryStatus>('IN_TRANSIT');
  const [location, setLocation] = useState('Pune Bypass Highway Toll Plaza');
  const [note, setNote] = useState('Vehicle passed checkpoint; ETA on schedule.');
  const [updated, setUpdated] = useState(false);

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDelId) return;
    updateDeliveryStatus(selectedDelId, status, note, location);
    setUpdated(true);
    setTimeout(() => setUpdated(false), 3000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-200 pb-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Admin Delivery & Dispatch Control</h1>
            <span className="px-2.5 py-0.5 bg-purple-100 text-purple-800 text-[10px] font-extrabold uppercase rounded-full border border-purple-200">
              Operational Real Identities
            </span>
          </div>
          <p className="text-xs text-slate-500 font-medium">
            Admin operational control to coordinate truck dispatches between real farmers and corporate industry buyers.
          </p>
        </div>

        <div className="bg-purple-50 p-3 rounded-2xl border border-purple-100 text-xs text-purple-900 flex items-center gap-3">
          <UserCheck className="w-5 h-5 text-purple-600 shrink-0" />
          <span className="font-semibold text-[11px]">
            Real Identities Visible: Admin needs complete farmer & buyer logistics details to coordinate transport.
          </span>
        </div>
      </div>

      {/* Deliveries Overview Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100">
          <h3 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
            <Truck className="w-5 h-5 text-purple-600" />
            <span>Active Logistics Shipments ({deliveries.length})</span>
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-[11px] font-bold text-slate-500 uppercase border-b border-slate-200">
                <th className="p-4">Shipment / Deal ID</th>
                <th className="p-4">Farmer (Origin)</th>
                <th className="p-4">Industry (Destination)</th>
                <th className="p-4">Crop & Quantity</th>
                <th className="p-4">Logistics Details</th>
                <th className="p-4">Delivery Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {deliveries.map(del => {
                const deal = agreements.find(a => a.id === del.dealId);
                const auction = auctions.find(a => a.id === del.auctionId);
                const farmerView = getFarmerIdentityView(
                  auction || { farmerId: deal?.farmerId || 'usr_farmer_1', farmerAnonymousId: 'Farmer #MH-42 (Sangli)', locationArea: 'Sangli' },
                  'ADMIN',
                  farmerProfile
                );
                const industryView = getIndustryIdentityView(
                  { industryId: deal?.industryId || 'usr_industry_1' },
                  'ADMIN'
                );

                return (
                  <tr key={del.id} className="hover:bg-slate-50 transition-colors">
                    {/* Shipment / Deal ID */}
                    <td className="p-4 font-mono">
                      <span className="font-bold text-slate-900 block">{del.id}</span>
                      <span className="text-[10px] text-purple-700 block">Deal: {del.dealId}</span>
                    </td>

                    {/* FARMER (REAL IDENTITY FOR ADMIN) */}
                    <td className="p-4 bg-purple-50/30">
                      <span className="font-bold text-slate-900 block">{farmerView.fullName}</span>
                      <span className="text-[11px] text-slate-600 block">{farmerView.farmName}</span>
                      <span className="text-[10px] text-slate-400 block">{del.originArea}</span>
                    </td>

                    {/* INDUSTRY (REAL IDENTITY FOR ADMIN) */}
                    <td className="p-4">
                      <span className="font-bold text-slate-900 block">{industryView.companyName}</span>
                      <span className="text-[11px] text-slate-600 block">Contact: {industryView.contactPerson}</span>
                      <span className="text-[10px] text-slate-400 block">{del.destinationArea}</span>
                    </td>

                    {/* Crop & Quantity */}
                    <td className="p-4">
                      <span className="font-extrabold text-slate-900 block">{deal?.crop || auction?.crop || 'Turmeric'}</span>
                      <span className="text-[11px] text-emerald-700 font-semibold">{deal?.quantityTons || auction?.quantityTons || 10} Tons</span>
                    </td>

                    {/* Logistics Details */}
                    <td className="p-4">
                      <span className="font-semibold text-slate-800 block">Driver: {del.driverName || 'Suresh More'}</span>
                      <span className="text-[11px] text-slate-500 block">Vehicle: {del.vehicleNumber || 'MH 10 CR 4582'}</span>
                      <span className="text-[10px] text-slate-400 block">Distance: ~{del.estimatedKm} km</span>
                    </td>

                    {/* Delivery Status */}
                    <td className="p-4">
                      <span className="px-2.5 py-1 bg-purple-100 text-purple-900 rounded-full text-[10px] font-bold border border-purple-200 inline-block">
                        {del.status}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Update Checkpoint Form */}
      <form onSubmit={handleUpdate} className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-4 max-w-2xl">
        <h3 className="font-bold text-sm text-slate-900 border-b border-slate-100 pb-2">Update Delivery Checkpoint</h3>

        {updated && (
          <div className="p-3 bg-emerald-50 text-emerald-800 rounded-xl border border-emerald-200 text-xs font-semibold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Delivery milestone updated and timeline broadcasted!</span>
          </div>
        )}

        <div>
          <label className="text-xs font-bold text-slate-700 block mb-1">Select Delivery Shipment</label>
          <select
            value={selectedDelId}
            onChange={e => setSelectedDelId(e.target.value)}
            className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium"
          >
            {deliveries.map(d => (
              <option key={d.id} value={d.id}>
                Shipment {d.id} ({d.originArea} → {d.destinationArea})
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">New Milestone Status</label>
            <select
              value={status}
              onChange={e => setStatus(e.target.value as DeliveryStatus)}
              className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900"
            >
              <option value="ORDER_CONFIRMED">ORDER_CONFIRMED</option>
              <option value="PICKUP_PENDING">PICKUP_PENDING</option>
              <option value="PICKED_UP">PICKED_UP</option>
              <option value="IN_TRANSIT">IN_TRANSIT</option>
              <option value="OUT_FOR_DELIVERY">OUT_FOR_DELIVERY</option>
              <option value="DELIVERED">DELIVERED</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">Current Checkpoint Location</label>
            <input
              type="text"
              required
              value={location}
              onChange={e => setLocation(e.target.value)}
              className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium"
            />
          </div>
        </div>

        <div>
          <label className="text-xs font-bold text-slate-700 block mb-1">Milestone Log Note</label>
          <input
            type="text"
            required
            value={note}
            onChange={e => setNote(e.target.value)}
            className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium"
          />
        </div>

        <button
          type="submit"
          className="w-full py-3 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-xl shadow-md transition flex items-center justify-center gap-2"
        >
          <Truck className="w-4 h-4" />
          <span>Broadcast Delivery Milestone Update</span>
        </button>
      </form>
    </div>
  );
}
