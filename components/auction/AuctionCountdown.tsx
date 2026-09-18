'use client';

import React, { useState, useEffect } from 'react';
import { Clock, Calendar, AlertCircle, CheckCircle2 } from 'lucide-react';
import { AuctionLot } from '@/types';
import { useTranslation } from '@/lib/i18n/context';

interface AuctionCountdownProps {
  auction: AuctionLot;
  onExpire?: () => void;
  className?: string;
}

export function AuctionCountdown({ auction, onExpire, className = '' }: AuctionCountdownProps) {
  const { t, language } = useTranslation();

  const [timeLeft, setTimeLeft] = useState<{
    hours: number;
    minutes: number;
    seconds: number;
    totalMs: number;
    isExpired: boolean;
  }>({ hours: 0, minutes: 0, seconds: 0, totalMs: 0, isExpired: false });

  useEffect(() => {
    const calculateTimeLeft = () => {
      if (!auction.auctionEndsAt) {
        return { hours: 0, minutes: 0, seconds: 0, totalMs: 0, isExpired: true };
      }

      const endTime = new Date(auction.auctionEndsAt).getTime();
      const now = Date.now();
      const diffMs = endTime - now;

      if (diffMs <= 0) {
        return { hours: 0, minutes: 0, seconds: 0, totalMs: 0, isExpired: true };
      }

      const hours = Math.floor(diffMs / (1000 * 60 * 60));
      const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diffMs % (1000 * 60)) / 1000);

      return { hours, minutes, seconds, totalMs: diffMs, isExpired: false };
    };

    const initial = calculateTimeLeft();
    setTimeLeft(initial);

    if (initial.isExpired && auction.status === 'AUCTION_LIVE' && onExpire) {
      onExpire();
    }

    const interval = setInterval(() => {
      const updated = calculateTimeLeft();
      setTimeLeft(updated);
      if (updated.isExpired && auction.status === 'AUCTION_LIVE' && onExpire) {
        onExpire();
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [auction.auctionEndsAt, auction.status, onExpire]);

  // Format IST dates cleanly for registration deadline & auction start/end
  const formatDateString = (isoString?: string) => {
    if (!isoString) return 'N/A';
    try {
      const date = new Date(isoString);
      return new Intl.DateTimeFormat(language === 'hi' ? 'hi-IN' : language === 'mr' ? 'mr-IN' : 'en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
        timeZone: 'Asia/Kolkata',
      }).format(date);
    } catch {
      return isoString;
    }
  };

  const isLive = auction.status === 'AUCTION_LIVE' && !timeLeft.isExpired;

  return (
    <div className={`rounded-xl border p-5 transition-all shadow-sm ${
      isLive
        ? 'bg-gradient-to-br from-amber-500/10 via-amber-500/5 to-surface border-amber-500/30'
        : auction.status === 'REGISTRATION_OPEN'
        ? 'bg-gradient-to-br from-forest/10 via-forest/5 to-surface border-forest/30'
        : 'bg-muted/30 border-border-subtle'
    } ${className}`}>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        {/* Header Title & Status */}
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            {isLive ? (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-black uppercase tracking-wider bg-amber-500 text-white animate-pulse">
                <span className="w-2 h-2 rounded-full bg-white animate-ping" />
                {t('auction.auctionLive')}
              </span>
            ) : auction.status === 'REGISTRATION_OPEN' ? (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-black uppercase tracking-wider bg-forest text-white">
                <Calendar className="w-3.5 h-3.5" />
                {t('status.REGISTRATION_OPEN')}
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-black uppercase tracking-wider bg-charcoal/70 text-white">
                <CheckCircle2 className="w-3.5 h-3.5" />
                {t('auction.auctionEnded')}
              </span>
            )}

            <span className="text-xs font-semibold text-charcoal/60">
              Lot #{auction.id}
            </span>
          </div>

          <h3 className="text-sm font-bold text-charcoal uppercase tracking-wider flex items-center gap-1.5 pt-1">
            <Clock className="w-4 h-4 text-forest" />
            {isLive ? t('auction.auctionEndsIn') : auction.status === 'REGISTRATION_OPEN' ? t('auction.auctionStartsIn') : t('auction.auctionEnded')}
          </h3>
        </div>

        {/* Live Countdown Display */}
        {isLive && (
          <div className="flex items-center gap-2 text-center">
            {/* Hours */}
            <div className="bg-surface border border-amber-500/40 rounded-lg px-3 py-2 min-w-[64px] shadow-sm">
              <span className="block text-2xl font-black text-amber-600 font-mono tracking-tight">
                {String(timeLeft.hours).padStart(2, '0')}
              </span>
              <span className="block text-[10px] font-bold text-charcoal/60 uppercase">
                {t('auction.hours')}
              </span>
            </div>

            <span className="text-2xl font-black text-amber-600 font-mono">:</span>

            {/* Minutes */}
            <div className="bg-surface border border-amber-500/40 rounded-lg px-3 py-2 min-w-[64px] shadow-sm">
              <span className="block text-2xl font-black text-amber-600 font-mono tracking-tight">
                {String(timeLeft.minutes).padStart(2, '0')}
              </span>
              <span className="block text-[10px] font-bold text-charcoal/60 uppercase">
                {t('auction.minutes')}
              </span>
            </div>

            <span className="text-2xl font-black text-amber-600 font-mono">:</span>

            {/* Seconds */}
            <div className="bg-surface border border-amber-500/40 rounded-lg px-3 py-2 min-w-[64px] shadow-sm">
              <span className="block text-2xl font-black text-amber-600 font-mono tracking-tight">
                {String(timeLeft.seconds).padStart(2, '0')}
              </span>
              <span className="block text-[10px] font-bold text-charcoal/60 uppercase">
                {t('auction.seconds')}
              </span>
            </div>
          </div>
        )}

        {!isLive && auction.status === 'REGISTRATION_OPEN' && (
          <div className="text-right">
            <div className="text-xs text-charcoal/70 font-semibold">Expected Start Time:</div>
            <div className="text-sm font-extrabold text-forest">{formatDateString(auction.auctionStartsAt)}</div>
          </div>
        )}

        {!isLive && auction.status !== 'REGISTRATION_OPEN' && (
          <div className="text-right">
            <div className="text-xs text-charcoal/70 font-semibold">{t('auction.auctionEnded')}:</div>
            <div className="text-sm font-extrabold text-charcoal/80">{formatDateString(auction.auctionEndsAt)}</div>
          </div>
        )}
      </div>

      {/* Registration Deadline & Additional Info Footer */}
      <div className="mt-4 pt-3 border-t border-border-subtle/60 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-1.5 text-charcoal/80">
          <Calendar className="w-3.5 h-3.5 text-forest shrink-0" />
          <span className="font-semibold">{t('auction.registrationDeadline')}:</span>
          <span className="font-bold text-charcoal">{formatDateString(auction.registrationEndsAt)}</span>
        </div>

        <div className="flex items-center gap-1 text-charcoal/60">
          <AlertCircle className="w-3.5 h-3.5 text-amber-500 shrink-0" />
          <span>24-Hour Bidding Period Enforced</span>
        </div>
      </div>
    </div>
  );
}
