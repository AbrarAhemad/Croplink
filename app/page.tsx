'use client';

import React from 'react';
import Link from 'next/link';
import { Sprout, ShieldCheck, Scale, ArrowRight, UserCheck, Building2, CheckCircle2, FileText, Truck, ArrowUpRight } from 'lucide-react';
import { useAppStore } from '@/lib/store/use-app-store';
import { useTranslation } from '@/lib/i18n/context';

export default function LandingPage() {
  const { auctions, loginAs } = useAppStore();
  const { t } = useTranslation();
  const liveAuctions = auctions.filter(a => a.status === 'AUCTION_LIVE' || a.status === 'REGISTRATION_OPEN').slice(0, 5);

  return (
    <div className="space-y-16 pb-20 bg-cream min-h-screen">
      {/* 1. Hero Section */}
      <section className="pt-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto bg-surface border border-border-subtle rounded-lg p-6 lg:p-10 shadow-sm">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Left Hero Column */}
            <div className="lg:col-span-7 space-y-5">
              <div className="inline-flex items-center gap-2 text-forest text-xs font-bold uppercase tracking-wider">
                <Sprout className="w-4 h-4 text-forest" />
                <span>{t('home.heroTag')}</span>
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-[42px] font-bold tracking-tight leading-tight text-charcoal">
                Connect Direct Farmers with <span className="text-terracotta font-extrabold">Trusted Industry Buyers</span>
              </h1>

              <p className="text-sm text-muted max-w-xl leading-relaxed font-medium">
                {t('home.heroSubtitle')}
              </p>

              {/* CTAs */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <Link
                  href="/register/farmer"
                  className="px-5 py-3 bg-forest hover:bg-forest/90 text-white font-bold rounded-md text-xs transition flex items-center gap-2 shadow-sm"
                >
                  <span>{t('nav.registerFarmer')}</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  href="/register/industry"
                  className="px-5 py-3 bg-cream hover:bg-cream-dark text-charcoal font-bold rounded-md border border-border-subtle text-xs transition flex items-center gap-2"
                >
                  <span>{t('nav.registerIndustry')}</span>
                </Link>
              </div>
            </div>

            {/* Right Hero Column: Today's Market Board */}
            <div className="lg:col-span-5">
              <div className="bg-surface border border-border-subtle rounded-lg p-5 space-y-4 shadow-sm">
                <div className="flex items-center justify-between border-b border-border-subtle pb-3">
                  <span className="text-xs font-extrabold uppercase tracking-wider text-forest flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-status-verified"></span>
                    {t('home.todaysMarket')}
                  </span>
                  <span className="text-[10px] font-bold text-forest bg-forest/10 px-2 py-0.5 rounded border border-forest/20">
                    AGMARKNET Feed
                  </span>
                </div>

                {/* Mandi Price Information Board */}
                <div className="border border-border-subtle rounded-md overflow-hidden bg-cream">
                  <div className="bg-forest text-white px-3.5 py-2 text-[11px] font-bold uppercase tracking-wider grid grid-cols-3">
                    <span>Crop</span>
                    <span>APMC Mandi</span>
                    <span className="text-right">Price / Ton</span>
                  </div>
                  <div className="divide-y divide-border-subtle text-xs bg-surface">
                    <div className="p-3 grid grid-cols-3 items-center">
                      <div>
                        <span className="font-bold text-charcoal block">Turmeric</span>
                        <span className="text-[10px] text-muted">Rajapuri</span>
                      </div>
                      <span className="text-xs font-medium text-muted">Sangli APMC</span>
                      <div className="text-right">
                        <span className="font-extrabold text-mustard text-sm block">₹1,52,000</span>
                      </div>
                    </div>

                    <div className="p-3 grid grid-cols-3 items-center">
                      <div>
                        <span className="font-bold text-charcoal block">Onion</span>
                        <span className="text-[10px] text-muted">Red Garwa</span>
                      </div>
                      <span className="text-xs font-medium text-muted">Lasalgaon APMC</span>
                      <div className="text-right">
                        <span className="font-extrabold text-mustard text-sm block">₹26,500</span>
                      </div>
                    </div>
                  </div>
                </div>

                <p className="text-[11px] text-muted text-center pt-1 font-medium">
                  {t('home.sampleNotice')}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Live Crop Lots Section (Marketplace List View) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-border-subtle pb-3">
          <div>
            <h2 className="text-xl font-bold text-charcoal tracking-tight">{t('home.liveCropLots')}</h2>
            <p className="text-xs text-muted font-medium mt-0.5">
              {t('home.liveCropLotsSubtitle')}
            </p>
          </div>
          <Link href="/auctions" className="text-xs font-bold text-forest hover:underline flex items-center gap-1">
            <span>{t('common.viewAll')} ({auctions.length})</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Table View */}
        <div className="bg-surface rounded-lg border border-border-subtle shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-cream border-b border-border-subtle text-[11px] font-bold text-charcoal uppercase tracking-wider">
                  <th className="p-3.5">Crop Lot</th>
                  <th className="p-3.5">Location</th>
                  <th className="p-3.5">Quantity</th>
                  <th className="p-3.5">Quality Grade</th>
                  <th className="p-3.5">Current Highest Bid</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-subtle text-xs text-charcoal">
                {liveAuctions.map((auction) => (
                  <tr key={auction.id} className="hover:bg-cream/60 transition">
                    <td className="p-3.5">
                      <span className="font-bold text-charcoal block">{auction.crop} ({auction.variety})</span>
                      <span className="text-[10px] text-muted block font-mono">ID: {auction.id}</span>
                    </td>
                    <td className="p-3.5 text-muted font-medium">{auction.locationArea}</td>
                    <td className="p-3.5 font-bold text-charcoal">{auction.quantityTons} Tons</td>
                    <td className="p-3.5">
                      <span className="px-2 py-0.5 bg-terracotta/10 text-terracotta rounded text-[11px] font-bold border border-terracotta/20">
                        {auction.qualityGrade}
                      </span>
                    </td>
                    <td className="p-3.5 font-extrabold text-mustard text-sm">
                      ₹{auction.currentHighestBid ? auction.currentHighestBid.toLocaleString('en-IN') : auction.basePricePerTon.toLocaleString('en-IN')}<span className="text-[10px] text-muted font-normal"> / ton</span>
                    </td>
                    <td className="p-3.5">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-status-verified/10 text-status-verified rounded text-[11px] font-bold border border-status-verified/20">
                        <span className="w-1.5 h-1.5 rounded-full bg-status-verified animate-pulse"></span>
                        LIVE
                      </span>
                    </td>
                    <td className="p-3.5 text-right">
                      <Link
                        href={`/auctions/${auction.id}`}
                        className="inline-flex items-center gap-1 text-xs font-bold text-forest hover:underline"
                      >
                        <span>Inspect</span>
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* 3. How It Works Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="border-b border-border-subtle pb-3">
          <h2 className="text-xl font-bold text-charcoal tracking-tight">{t('home.howItWorks')}</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-surface border border-border-subtle rounded-lg p-5 space-y-2">
            <span className="text-2xl font-black text-terracotta block">01</span>
            <h3 className="font-bold text-sm text-charcoal">{t('home.step1Title')}</h3>
            <p className="text-xs text-muted leading-relaxed font-medium">
              {t('home.step1Desc')}
            </p>
          </div>

          <div className="bg-surface border border-border-subtle rounded-lg p-5 space-y-2">
            <span className="text-2xl font-black text-terracotta block">02</span>
            <h3 className="font-bold text-sm text-charcoal">{t('home.step2Title')}</h3>
            <p className="text-xs text-muted leading-relaxed font-medium">
              {t('home.step2Desc')}
            </p>
          </div>

          <div className="bg-surface border border-border-subtle rounded-lg p-5 space-y-2">
            <span className="text-2xl font-black text-terracotta block">03</span>
            <h3 className="font-bold text-sm text-charcoal">{t('home.step3Title')}</h3>
            <p className="text-xs text-muted leading-relaxed font-medium">
              {t('home.step3Desc')}
            </p>
          </div>

          <div className="bg-surface border border-border-subtle rounded-lg p-5 space-y-2">
            <span className="text-2xl font-black text-terracotta block">04</span>
            <h3 className="font-bold text-sm text-charcoal">{t('home.step4Title')}</h3>
            <p className="text-xs text-muted leading-relaxed font-medium">
              {t('home.step4Desc')}
            </p>
          </div>
        </div>
      </section>

      {/* 4. Why CropLink / Trust Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="border-b border-border-subtle pb-3">
          <h2 className="text-xl font-bold text-charcoal tracking-tight">{t('home.whyCropLink')}</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="bg-surface border border-border-subtle rounded-md p-4 flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-forest shrink-0 mt-0.5" />
            <div>
              <h4 className="text-xs font-bold text-charcoal">{t('home.whyPoint1')}</h4>
              <p className="text-[11px] text-muted mt-0.5 font-medium">Land revenue extract & Aadhaar identity verification.</p>
            </div>
          </div>

          <div className="bg-surface border border-border-subtle rounded-md p-4 flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-forest shrink-0 mt-0.5" />
            <div>
              <h4 className="text-xs font-bold text-charcoal">{t('home.whyPoint2')}</h4>
              <p className="text-[11px] text-muted mt-0.5 font-medium">Physical 20 kg lot sample tested at APMC Sangli hub.</p>
            </div>
          </div>

          <div className="bg-surface border border-border-subtle rounded-md p-4 flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-forest shrink-0 mt-0.5" />
            <div>
              <h4 className="text-xs font-bold text-charcoal">{t('home.whyPoint3')}</h4>
              <p className="text-[11px] text-muted mt-0.5 font-medium">Fair 24-hour anonymous competitive bidding.</p>
            </div>
          </div>

          <div className="bg-surface border border-border-subtle rounded-md p-4 flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-forest shrink-0 mt-0.5" />
            <div>
              <h4 className="text-xs font-bold text-charcoal">{t('home.whyPoint4')}</h4>
              <p className="text-[11px] text-muted mt-0.5 font-medium">Razorpay payment processing for industry fees & escrow.</p>
            </div>
          </div>

          <div className="bg-surface border border-border-subtle rounded-md p-4 flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-forest shrink-0 mt-0.5" />
            <div>
              <h4 className="text-xs font-bold text-charcoal">{t('home.whyPoint5')}</h4>
              <p className="text-[11px] text-muted mt-0.5 font-medium">Legally binding digital sales & procurement agreements.</p>
            </div>
          </div>

          <div className="bg-surface border border-border-subtle rounded-md p-4 flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-forest shrink-0 mt-0.5" />
            <div>
              <h4 className="text-xs font-bold text-charcoal">{t('home.whyPoint6')}</h4>
              <p className="text-[11px] text-muted mt-0.5 font-medium">Milestone truck dispatch and delivery tracking.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Development Quick Role Switcher Strip */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center pt-6">
        <div className="inline-flex items-center gap-2 p-2 bg-cream-dark rounded-md border border-border-subtle text-[11px] text-muted font-medium">
          <span>Testing Quick Login:</span>
          <button onClick={() => loginAs('FARMER')} className="text-forest font-bold hover:underline">Farmer</button>
          <span>•</span>
          <button onClick={() => loginAs('INDUSTRY')} className="text-terracotta font-bold hover:underline">Industry</button>
          <span>•</span>
          <button onClick={() => loginAs('ADMIN')} className="text-charcoal font-bold hover:underline">Admin</button>
        </div>
      </div>
    </div>
  );
}

