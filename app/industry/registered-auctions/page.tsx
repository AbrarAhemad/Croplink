'use client';

import React from 'react';
import { useAppStore } from '@/lib/store/use-app-store';
import { AuctionCard } from '@/components/auction/AuctionCard';
import { CreditCard, ShoppingBag } from 'lucide-react';

export default function IndustryRegisteredAuctionsPage() {
  const { auctions, registrations, currentUser } = useAppStore();

  const registeredAuctions = auctions.filter(a => registrations.some(r => r.auctionId === a.id && r.industryId === currentUser?.id && r.status === 'PAID'));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">My Registered Auctions (Paid ₹1,999)</h1>
        <p className="text-xs text-slate-500 font-medium">
          Crop lot auctions where your ₹1,999 registration fee has been paid and anonymous bidding is active.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {registeredAuctions.length === 0 ? (
          <div className="col-span-3 p-12 text-center bg-white rounded-3xl border border-slate-200 text-slate-400 text-xs">
            You have not registered for any auctions yet.
          </div>
        ) : (
          registeredAuctions.map(auction => (
            <AuctionCard key={auction.id} auction={auction} userRole="INDUSTRY" />
          ))
        )}
      </div>
    </div>
  );
}
