'use client';

import React from 'react';
import Link from 'next/link';
import { useAppStore } from '@/lib/store/use-app-store';
import { useTranslation } from '@/lib/i18n/context';
import { Sprout, PlusCircle, TrendingUp, ShieldCheck, Scale, ArrowRight, Package, Truck, CheckCircle2 } from 'lucide-react';
import { AuctionCard } from '@/components/auction/AuctionCard';

export default function FarmerDashboardPage() {
  const { auctions, farmerProfile, currentUser } = useAppStore();
  const { t } = useTranslation();

  const myAuctions = auctions.filter(a => a.farmerId === currentUser?.id || a.farmerAnonymousId.includes('MH-42'));
  const activeAuctions = myAuctions.filter(a => a.status === 'AUCTION_LIVE' || a.status === 'REGISTRATION_OPEN');
  const highestBidReceived = Math.max(...myAuctions.map(a => a.currentHighestBid || 0), 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 bg-[#F7F3EA]">
      {/* Top Banner */}
      <div className="bg-[#23483A] text-white p-6 lg:p-8 rounded-md border border-[#23483A] flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-sm">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold px-2.5 py-0.5 bg-white/10 text-white rounded-sm border border-white/20">
              {t('farmer.portalBadge')}
            </span>
            <span className="text-xs font-semibold text-[#DDD8CC]">{t('farmer.regionBadge')}</span>
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight">{t('farmer.welcome')}, {farmerProfile.farmName}!</h1>
          <p className="text-xs text-[#DDD8CC]">
            {farmerProfile.fullAddress} • {t('farmer.landDetails')} {farmerProfile.landAreaAcres} Acres
          </p>
        </div>

        <Link
          href="/farmer/auctions/create"
          className="px-5 py-3 bg-[#B65C3A] hover:bg-[#9b4b2c] text-white font-bold rounded-md text-xs flex items-center gap-2 transition shrink-0 shadow-sm"
        >
          <PlusCircle className="w-4 h-4" />
          <span>{t('farmer.createAuctionBtn')}</span>
        </Link>
      </div>

      {/* Metrics Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 bg-[#FFFDF8] rounded-md border border-[#DDD8CC] shadow-sm space-y-1.5">
          <span className="text-[11px] font-bold text-[#6F756F] uppercase tracking-wider block">{t('farmer.myActiveAuctions')}</span>
          <span className="text-2xl font-extrabold text-[#252A27] block">{activeAuctions.length} Lots</span>
          <span className="text-[11px] text-[#3F7655] font-bold flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5" /> {t('home.statSampleHub')}
          </span>
        </div>

        <div className="p-4 bg-[#FFFDF8] rounded-md border border-[#DDD8CC] shadow-sm space-y-1.5">
          <span className="text-[11px] font-bold text-[#6F756F] uppercase tracking-wider block">{t('farmer.highestBidReceived')}</span>
          <span className="text-2xl font-extrabold text-[#3F7655] block">
            {highestBidReceived > 0 ? `₹${highestBidReceived.toLocaleString('en-IN')}${t('common.perTon')}` : '₹0'}
          </span>
          <span className="text-[11px] text-[#6F756F] font-medium">Turmeric Rajapuri Lot</span>
        </div>

        <div className="p-4 bg-[#FFFDF8] rounded-md border border-[#DDD8CC] shadow-sm space-y-1.5">
          <span className="text-[11px] font-bold text-[#6F756F] uppercase tracking-wider block">{t('farmer.mandiBenchmark')}</span>
          <span className="text-2xl font-extrabold text-[#252A27] block">₹1,52,000<span className="text-xs text-[#6F756F] font-normal">{t('common.perTon')}</span></span>
          <span className="text-[11px] text-[#3F7655] font-bold flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5" /> +4.2% in Sangli APMC
          </span>
        </div>

        <div className="p-4 bg-[#FFFDF8] rounded-md border border-[#DDD8CC] shadow-sm space-y-1.5">
          <span className="text-[11px] font-bold text-[#6F756F] uppercase tracking-wider block">{t('farmer.sampleStatusCard')}</span>
          <span className="text-xl font-bold text-[#3F7655] block">{t('status.VERIFIED')}</span>
          <span className="text-[11px] text-[#6F756F] font-medium">Delivered to Sangli Hub</span>
        </div>
      </div>

      {/* Quick Action Navigation Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link
          href="/farmer/auctions/create"
          className="p-5 bg-[#FFFDF8] hover:bg-[#F7F3EA] rounded-md border border-[#DDD8CC] transition space-y-3 group"
        >
          <div className="w-9 h-9 rounded-md bg-[#23483A] text-white flex items-center justify-center font-bold">
            <PlusCircle className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-sm text-[#252A27] group-hover:text-[#23483A] transition">{t('farmer.createAuctionBtn')}</h3>
          <p className="text-xs text-[#6F756F] leading-relaxed">
            Specify crop, quantity, quality grade, base price, transport rate, and dispatch 20kg sample to Sangli hub.
          </p>
        </Link>

        <Link
          href="/farmer/deals"
          className="p-5 bg-[#FFFDF8] hover:bg-[#F7F3EA] rounded-md border border-[#DDD8CC] transition space-y-3 group"
        >
          <div className="w-9 h-9 rounded-md bg-[#fbf0ec] text-[#B65C3A] flex items-center justify-center font-bold">
            <Scale className="w-5 h-5 text-[#B65C3A]" />
          </div>
          <h3 className="font-bold text-sm text-[#252A27] group-hover:text-[#B65C3A] transition">{t('farmer.legalAgreementsTitle')}</h3>
          <p className="text-xs text-[#6F756F] leading-relaxed">
            {t('farmer.legalAgreementsDesc')}
          </p>
        </Link>

        <Link
          href="/market-prices"
          className="p-5 bg-[#FFFDF8] hover:bg-[#F7F3EA] rounded-md border border-[#DDD8CC] transition space-y-3 group"
        >
          <div className="w-9 h-9 rounded-md bg-[#faf5e8] text-[#C99A2E] flex items-center justify-center font-bold">
            <TrendingUp className="w-5 h-5 text-[#C99A2E]" />
          </div>
          <h3 className="font-bold text-sm text-[#252A27] group-hover:text-[#C99A2E] transition">{t('farmer.mandiPricesTitle')}</h3>
          <p className="text-xs text-[#6F756F] leading-relaxed">
            {t('farmer.mandiPricesDesc')}
          </p>
        </Link>
      </div>

      {/* My Auctions Catalog */}
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b border-[#DDD8CC] pb-3">
          <h2 className="text-lg font-extrabold text-[#252A27]">{t('farmer.myAuctionsHeading')}</h2>
          <span className="text-xs text-[#6F756F] font-bold">{myAuctions.length} {t('farmer.totalAuctionsCount')}</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {myAuctions.map(auction => (
            <AuctionCard key={auction.id} auction={auction} userRole="FARMER" />
          ))}
        </div>
      </div>
    </div>
  );
}
