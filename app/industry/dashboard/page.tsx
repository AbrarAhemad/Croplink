'use client';

import React from 'react';
import Link from 'next/link';
import { useAppStore } from '@/lib/store/use-app-store';
import { Building2, ShoppingBag, ShieldCheck, Scale, ArrowRight, CreditCard, Truck, CheckCircle2 } from 'lucide-react';
import { AuctionCard } from '@/components/auction/AuctionCard';

export default function IndustryDashboardPage() {
  const { auctions, bids, registrations, verifications, agreements, industryProfile, currentUser } = useAppStore();

  const registeredAuctions = auctions.filter(a => registrations.some(r => r.auctionId === a.id && r.status === 'PAID'));
  const myBids = bids.filter(b => b.industryId === currentUser?.id || b.anonymousBidderId.includes('A17'));
  const activeBidsCount = myBids.filter(b => b.status === 'ACTIVE').length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 bg-[#F7F3EA]">
      {/* Top Banner */}
      <div className="bg-[#23483A] text-white p-6 lg:p-8 rounded-md border border-[#23483A] flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-sm">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold px-2.5 py-0.5 bg-[#B65C3A] text-white rounded-sm">
              Verified Industrial Buyer
            </span>
            <span className="text-xs font-semibold text-[#DDD8CC]">GSTIN: {industryProfile.gstNumber}</span>
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight">{industryProfile.companyName}</h1>
          <p className="text-xs text-[#DDD8CC]">
            {industryProfile.contactPerson} • Procurement Hub: {industryProfile.city}, {industryProfile.state}
          </p>
        </div>

        <Link
          href="/industry/auctions"
          className="px-5 py-3 bg-[#B65C3A] hover:bg-[#9b4b2c] text-white font-bold rounded-md text-xs flex items-center gap-2 transition shrink-0 shadow-sm"
        >
          <ShoppingBag className="w-4 h-4" />
          <span>Browse Active Auctions</span>
        </Link>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 bg-[#FFFDF8] rounded-md border border-[#DDD8CC] shadow-sm space-y-1.5">
          <span className="text-[11px] font-bold text-[#6F756F] uppercase tracking-wider block">Registered Auctions</span>
          <span className="text-2xl font-extrabold text-[#252A27] block">{registeredAuctions.length} Lots</span>
          <span className="text-[11px] text-[#B65C3A] font-bold flex items-center gap-1">
            <CreditCard className="w-3.5 h-3.5" /> ₹1,999 Fee Paid
          </span>
        </div>

        <div className="p-4 bg-[#FFFDF8] rounded-md border border-[#DDD8CC] shadow-sm space-y-1.5">
          <span className="text-[11px] font-bold text-[#6F756F] uppercase tracking-wider block">My Active Bids</span>
          <span className="text-2xl font-extrabold text-[#3F7655] block">{activeBidsCount} Active</span>
          <span className="text-[11px] text-[#6F756F] font-medium">Anonymous Identity Protected</span>
        </div>

        <div className="p-4 bg-[#FFFDF8] rounded-md border border-[#DDD8CC] shadow-sm space-y-1.5">
          <span className="text-[11px] font-bold text-[#6F756F] uppercase tracking-wider block">Ground Verifications</span>
          <span className="text-2xl font-extrabold text-[#252A27] block">{verifications.length} Requested</span>
          <span className="text-[11px] text-[#C99A2E] font-bold flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5" /> Quality Inspector Assigned
          </span>
        </div>

        <div className="p-4 bg-[#FFFDF8] rounded-md border border-[#DDD8CC] shadow-sm space-y-1.5">
          <span className="text-[11px] font-bold text-[#6F756F] uppercase tracking-wider block">Executed Agreements</span>
          <span className="text-2xl font-extrabold text-[#252A27] block">{agreements.length} Deals</span>
          <span className="text-[11px] text-[#3F7655] font-bold">Fully Executed</span>
        </div>
      </div>

      {/* Action Quick Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link
          href="/industry/auctions"
          className="p-5 bg-[#FFFDF8] hover:bg-[#F7F3EA] rounded-md border border-[#DDD8CC] transition space-y-3 group"
        >
          <div className="w-9 h-9 rounded-md bg-[#23483A] text-white flex items-center justify-center font-bold">
            <ShoppingBag className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-sm text-[#252A27] group-hover:text-[#23483A] transition">Discover Crop Auctions</h3>
          <p className="text-xs text-[#6F756F] leading-relaxed">
            Filter lots by crop, quality grade, distance, pay ₹1,999 registration fee, and submit anonymous bids.
          </p>
        </Link>

        <Link
          href="/industry/verifications"
          className="p-5 bg-[#FFFDF8] hover:bg-[#F7F3EA] rounded-md border border-[#DDD8CC] transition space-y-3 group"
        >
          <div className="w-9 h-9 rounded-md bg-[#faf5e8] text-[#C99A2E] flex items-center justify-center font-bold">
            <ShieldCheck className="w-5 h-5 text-[#C99A2E]" />
          </div>
          <h3 className="font-bold text-sm text-[#252A27] group-hover:text-[#C99A2E] transition">Winner Verifications</h3>
          <p className="text-xs text-[#6F756F] leading-relaxed">
            Accept winner offers within 3-day window, schedule farm inspection, or handle fallback ranking.
          </p>
        </Link>

        <Link
          href="/industry/deals"
          className="p-5 bg-[#FFFDF8] hover:bg-[#F7F3EA] rounded-md border border-[#DDD8CC] transition space-y-3 group"
        >
          <div className="w-9 h-9 rounded-md bg-[#fbf0ec] text-[#B65C3A] flex items-center justify-center font-bold">
            <Scale className="w-5 h-5 text-[#B65C3A]" />
          </div>
          <h3 className="font-bold text-sm text-[#252A27] group-hover:text-[#B65C3A] transition">Agreements & Deliveries</h3>
          <p className="text-xs text-[#6F756F] leading-relaxed">
            Sign legal purchase agreements and track truck dispatch timelines from Sangli hub to your processing facility.
          </p>
        </Link>
      </div>

      {/* Registered Auctions Catalog */}
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b border-[#DDD8CC] pb-3">
          <h2 className="text-lg font-extrabold text-[#252A27]">Registered Auctions Catalog</h2>
          <Link href="/industry/auctions" className="text-xs font-bold text-[#23483A] hover:underline">
            View All Auctions →
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {registeredAuctions.map(auction => (
            <AuctionCard key={auction.id} auction={auction} userRole="INDUSTRY" />
          ))}
        </div>
      </div>
    </div>
  );
}
