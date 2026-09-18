'use client';

import React from 'react';
import Link from 'next/link';
import { Sprout, ShieldCheck, Truck, Scale, MapPin } from 'lucide-react';
import { useTranslation } from '@/lib/i18n/context';

export function Footer() {
  const { t } = useTranslation();

  return (
    <footer className="bg-[#252A27] text-[#FFFDF8] border-t border-[#DDD8CC]/20 pt-12 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          {/* Brand Col */}
          <div className="space-y-4 md:col-span-1">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-md bg-[#23483A] flex items-center justify-center text-white">
                <Sprout className="w-5 h-5" />
              </div>
              <span className="font-extrabold text-xl tracking-tight text-white">{t('nav.brand')}</span>
            </div>
            <p className="text-xs text-[#DDD8CC]/80 leading-relaxed">
              {t('footer.tagline')}
            </p>
            <div className="flex items-center gap-2 text-xs text-[#C99A2E] font-medium">
              <MapPin className="w-4 h-4" />
              <span>{t('footer.address')}</span>
            </div>
          </div>

          {/* Platform Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#C99A2E]">{t('footer.marketplaceHeading')}</h4>
            <ul className="space-y-2 text-xs text-[#DDD8CC]">
              <li><Link href="/market-prices" className="hover:text-[#C99A2E] transition">{t('footer.agmarknetLink')}</Link></li>
              <li><Link href="/auctions" className="hover:text-[#C99A2E] transition">{t('footer.activeAuctionsLink')}</Link></li>
              <li><Link href="/how-it-works" className="hover:text-[#C99A2E] transition">{t('footer.workflowLink')}</Link></li>
              <li><Link href="/how-it-works#anonymity" className="hover:text-[#C99A2E] transition">{t('footer.rulesLink')}</Link></li>
            </ul>
          </div>

          {/* Participant Guides */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#C99A2E]">{t('footer.rolesHeading')}</h4>
            <ul className="space-y-2 text-xs text-[#DDD8CC]">
              <li><Link href="/register/farmer" className="hover:text-[#C99A2E] transition">{t('footer.farmerRegisterLink')}</Link></li>
              <li><Link href="/register/industry" className="hover:text-[#C99A2E] transition">{t('footer.industryRegisterLink')}</Link></li>
              <li><Link href="/farmer/dashboard" className="hover:text-[#C99A2E] transition">{t('footer.farmerPortalLink')}</Link></li>
              <li><Link href="/industry/dashboard" className="hover:text-[#C99A2E] transition">{t('footer.industryPortalLink')}</Link></li>
              <li><Link href="/admin/dashboard" className="hover:text-[#C99A2E] transition">{t('footer.adminPortalLink')}</Link></li>
            </ul>
          </div>

          {/* Trust Metrics */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#C99A2E]">{t('footer.trustHeading')}</h4>
            <div className="space-y-2 text-xs text-[#DDD8CC]">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#3F7655]" />
                <span>{t('footer.trustRls')}</span>
              </div>
              <div className="flex items-center gap-2">
                <Scale className="w-4 h-4 text-[#3F7655]" />
                <span>{t('footer.trustRazorpay')}</span>
              </div>
              <div className="flex items-center gap-2">
                <Truck className="w-4 h-4 text-[#3F7655]" />
                <span>{t('footer.trustLogistics')}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="pt-6 border-t border-[#DDD8CC]/10 flex flex-col sm:flex-row items-center justify-between text-xs text-[#6F756F] gap-4">
          <p>{t('footer.copyright')}</p>
          <div className="flex items-center gap-4">
            <Link href="/about" className="hover:text-[#DDD8CC] transition">{t('footer.aboutLink')}</Link>
            <Link href="/contact" className="hover:text-[#DDD8CC] transition">{t('footer.supportLink')}</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
