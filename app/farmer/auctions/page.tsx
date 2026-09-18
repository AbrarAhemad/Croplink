'use client';

import React from 'react';
import Link from 'next/link';
import { useAppStore } from '@/lib/store/use-app-store';
import { Sprout, PlusCircle, ShieldCheck, Scale, MapPin } from 'lucide-react';
import { AuctionCard } from '@/components/auction/AuctionCard';

export default function FarmerAuctionsListingPage() {
  const { auctions, currentUser } = useAppStore();

  const myAuctions = auctions.filter(a => a.farmerId === currentUser?.id || a.farmerAnonymousId.includes('MH-42'));
  const otherAuctions = auctions.filter(a => !myAuctions.some(m => m.id === a.id));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-200 pb-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Farmer Crop Lot Auctions</h1>
            <span className="px-2.5 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-extrabold uppercase rounded-full border border-emerald-200">
              Farmer Marketplace
            </span>
          </div>
          <p className="text-xs text-slate-500 font-medium">
            View your active listings, track anonymous industry buyer bids, and explore live mandi crop lots.
          </p>
        </div>

        <Link
          href="/farmer/auctions/create"
          className="px-5 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold rounded-xl shadow-md text-xs flex items-center gap-2 transition shrink-0"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Create New Crop Lot</span>
        </Link>
      </div>

      {/* Section 1: My Auctions */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
            <Sprout className="w-5 h-5 text-emerald-600" />
            <span>My Listed Auctions ({myAuctions.length})</span>
          </h2>
        </div>

        {myAuctions.length === 0 ? (
          <div className="p-8 bg-slate-50 border border-dashed border-slate-200 rounded-3xl text-center text-xs text-slate-500">
            You have not listed any crop auctions yet.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {myAuctions.map(auction => (
              <AuctionCard key={auction.id} auction={auction} userRole="FARMER" />
            ))}
          </div>
        )}
      </div>

      {/* Section 2: All Platform Auctions (Anonymous View) */}
      {otherAuctions.length > 0 && (
        <div className="space-y-4 pt-6 border-t border-slate-200">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-800">Other Active Platform Auctions ({otherAuctions.length})</h2>
            <span className="text-xs text-slate-400">Anonymous Seller Privacy Enforced</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {otherAuctions.map(auction => (
              <AuctionCard key={auction.id} auction={auction} userRole="FARMER" />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
