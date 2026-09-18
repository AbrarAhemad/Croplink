'use client';

import React from 'react';
import Link from 'next/link';
import { AuctionLot } from '@/types';
import { Sprout, MapPin, Scale, ShieldCheck, Clock, ArrowRight } from 'lucide-react';
import { getApproximateDistanceBetweenLocations } from '@/lib/maps/distance';
import { useTranslation } from '@/lib/i18n/context';

export function AuctionCard({ auction, userRole }: { auction: AuctionLot; userRole?: string }) {
  const { t } = useTranslation();
  const approxDistance = getApproximateDistanceBetweenLocations(auction.locationArea, 'Mumbai');

  const getStatusBadge = (status: AuctionLot['status']) => {
    const statusLabel = t(`status.${status}`) || status.replace(/_/g, ' ');
    switch (status) {
      case 'AUCTION_LIVE':
        return <span className="badge-status badge-live">{statusLabel}</span>;
      case 'REGISTRATION_OPEN':
        return <span className="badge-status badge-pending">{statusLabel}</span>;
      case 'SAMPLE_PROCESSING':
        return <span className="badge-status badge-verified">{statusLabel}</span>;
      case 'WINNER_PENDING_VERIFICATION':
        return <span className="badge-status bg-[#faf5e8] text-[#C28B2C] border border-[#C28B2C]/30">{statusLabel}</span>;
      case 'GROUND_VERIFICATION':
        return <span className="badge-status bg-[#fbf0ec] text-[#B65C3A] border border-[#B65C3A]/30">{statusLabel}</span>;
      case 'DELIVERY':
      case 'COMPLETED':
        return <span className="badge-status badge-live">{statusLabel}</span>;
      case 'CANCELLED':
        return <span className="badge-status badge-cancelled">{statusLabel}</span>;
      default:
        return <span className="badge-status badge-pending">{statusLabel}</span>;
    }
  };

  return (
    <div className="bg-[#FFFDF8] rounded-md border border-[#DDD8CC] transition flex flex-col justify-between overflow-hidden">
      <div className="p-5 space-y-4">
        {/* Top Badges & Anonymous Identity */}
        <div className="flex items-center justify-between gap-2">
          {getStatusBadge(auction.status)}
          <span className="text-xs font-bold px-2 py-0.5 bg-[#F7F3EA] text-[#6F756F] rounded-sm border border-[#DDD8CC] flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-[#23483A]" />
            {auction.farmerAnonymousId}
          </span>
        </div>

        {/* Title & Variety */}
        <div>
          <h3 className="text-base font-extrabold text-[#252A27] flex items-center justify-between">
            <span>{auction.crop}</span>
            <span className="text-[11px] font-bold px-2 py-0.5 bg-[#fbf0ec] text-[#B65C3A] rounded-sm border border-[#B65C3A]/30">
              {auction.qualityGrade}
            </span>
          </h3>
          <p className="text-xs text-[#6F756F] font-medium">{auction.variety}</p>
        </div>

        {/* Key Metrics Grid */}
        <div className="grid grid-cols-2 gap-3 p-3 bg-[#F7F3EA] rounded-md text-xs border border-[#DDD8CC]/50">
          <div>
            <span className="text-[#6F756F] block font-medium text-[11px]">{t('auction.lotVolume')}</span>
            <span className="font-extrabold text-[#252A27] text-sm">{auction.quantityTons} {t('common.tons')}</span>
          </div>
          <div>
            <span className="text-[#6F756F] block font-medium text-[11px]">{t('auction.basePrice')}</span>
            <span className="font-extrabold text-[#252A27] text-sm">₹{auction.basePricePerTon.toLocaleString('en-IN')}{t('common.perTon')}</span>
          </div>
          <div>
            <span className="text-[#6F756F] block font-medium text-[11px]">{t('auction.currentHighestBid')}</span>
            <span className="font-extrabold text-[#3F7655] text-sm">
              {auction.currentHighestBid ? `₹${auction.currentHighestBid.toLocaleString('en-IN')}${t('common.perTon')}` : t('auction.noBidsYet')}
            </span>
          </div>
          <div>
            <span className="text-[#6F756F] block font-medium text-[11px]">{t('auction.approxDistance')}</span>
            <span className="font-bold text-[#252A27] flex items-center gap-1">
              <MapPin className="w-3 h-3 text-[#6F756F]" />
              ~{approxDistance} {t('common.km')}
            </span>
          </div>
        </div>

        {/* Sangli Hub 20kg Sample Status */}
        <div className="flex items-center justify-between text-xs text-[#6F756F] pt-2 border-t border-[#DDD8CC]/60">
          <span>{t('admin.sampleStatusCol')}:</span>
          <span className={`font-bold ${auction.sampleStatus === 'VERIFIED' ? 'text-[#3F7655]' : 'text-[#C28B2C]'}`}>
            {t(`status.${auction.sampleStatus}`) || auction.sampleStatus.replace(/_/g, ' ')}
          </span>
        </div>
      </div>

      {/* Footer Action Bar */}
      <div className="px-5 py-3 bg-[#F7F3EA] border-t border-[#DDD8CC] flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-xs text-[#6F756F] font-medium">
          <Clock className="w-3.5 h-3.5" />
          <span>{auction.bidCount} Bids</span>
        </div>

        <Link
          href={userRole === 'INDUSTRY' ? `/industry/auctions/${auction.id}` : userRole === 'FARMER' ? `/farmer/auctions/${auction.id}` : `/auctions/${auction.id}`}
          className="px-3.5 py-1.5 text-xs font-bold text-white bg-[#23483A] hover:bg-[#1b382d] rounded-md transition flex items-center gap-1"
        >
          <span>{t('common.viewAll')}</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
}
