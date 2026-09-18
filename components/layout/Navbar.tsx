'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Sprout, User, Shield, ChevronDown, LogOut, LayoutDashboard, ShoppingBag, Truck, FileText } from 'lucide-react';
import { useAppStore } from '@/lib/store/use-app-store';
import { useTranslation } from '@/lib/i18n/context';
import { LanguageSwitcher } from './LanguageSwitcher';

export function Navbar() {
  const pathname = usePathname();
  const { currentUser, loginAs, logout } = useAppStore();
  const { t } = useTranslation();
  const [showRoleDropdown, setShowRoleDropdown] = useState(false);
  const [showRegisterDropdown, setShowRegisterDropdown] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-surface border-b border-border-subtle">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo & Tagline */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-md bg-forest flex items-center justify-center text-white shrink-0">
              <Sprout className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-lg tracking-tight text-charcoal">{t('nav.brand')}</span>
              </div>
            </div>
          </Link>

          {/* Nav Links */}
          <nav className="hidden md:flex items-center gap-6 text-xs font-bold text-charcoal">
            <Link href="/market-prices" className={`py-1 border-b-2 transition ${pathname === '/market-prices' ? 'text-forest border-forest' : 'border-transparent text-charcoal hover:text-forest'}`}>
              {t('nav.mandiPrices')}
            </Link>
            <Link href="/auctions" className={`py-1 border-b-2 transition ${pathname === '/auctions' ? 'text-forest border-forest' : 'border-transparent text-charcoal hover:text-forest'}`}>
              {t('nav.auctions')}
            </Link>
            <Link href="/how-it-works" className={`py-1 border-b-2 transition ${pathname === '/how-it-works' ? 'text-forest border-forest' : 'border-transparent text-charcoal hover:text-forest'}`}>
              {t('nav.howItWorks')}
            </Link>
            <Link href="/contact" className={`py-1 border-b-2 transition ${pathname === '/contact' ? 'text-forest border-forest' : 'border-transparent text-charcoal hover:text-forest'}`}>
              {t('nav.support')}
            </Link>

            {/* Role Dashboard Shortcuts - Strict Role Gated */}
            {currentUser?.role === 'FARMER' && (
              <Link href="/farmer/dashboard" className="flex items-center gap-1.5 text-forest bg-forest/10 px-2.5 py-1 rounded-md border border-forest/20 font-bold hover:bg-forest/20 transition">
                <LayoutDashboard className="w-3.5 h-3.5" />
                {t('nav.farmerPortal')}
              </Link>
            )}

            {currentUser?.role === 'INDUSTRY' && (
              <Link href="/industry/dashboard" className="flex items-center gap-1.5 text-terracotta bg-terracotta/10 px-2.5 py-1 rounded-md border border-terracotta/20 font-bold hover:bg-terracotta/20 transition">
                <ShoppingBag className="w-3.5 h-3.5" />
                {t('nav.industryPortal')}
              </Link>
            )}

            {currentUser?.role === 'ADMIN' && (
              <Link href="/admin/dashboard" className="flex items-center gap-1.5 text-charcoal bg-cream px-2.5 py-1 rounded-md border border-border-subtle font-bold hover:bg-cream-dark transition">
                <Shield className="w-3.5 h-3.5 text-forest" />
                {t('nav.adminOperations')}
              </Link>
            )}
          </nav>

          {/* Right Controls: Global Language Switcher + Auth / Register Choices */}
          <div className="flex items-center gap-3">
            {/* Global Language Switcher */}
            <LanguageSwitcher />

            {currentUser ? (
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-forest bg-forest/10 px-2 py-1 rounded-md border border-forest/20">
                  {currentUser.role}
                </span>
                <button
                  type="button"
                  onClick={logout}
                  className="p-1.5 text-muted hover:text-status-rejected hover:bg-status-rejected/10 rounded-md transition"
                  title={t('nav.logout')}
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link href="/login" className="px-3 py-1.5 text-xs font-bold text-charcoal hover:text-forest transition">
                  {t('nav.signIn')}
                </Link>

                {/* Register Button with Dropdown Choice */}
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setShowRegisterDropdown(!showRegisterDropdown)}
                    className="px-3.5 py-1.5 text-xs font-bold text-white bg-forest hover:bg-forest/90 rounded-md transition flex items-center gap-1"
                  >
                    <span>{t('nav.register')}</span>
                    <ChevronDown className="w-3.5 h-3.5" />
                  </button>

                  {showRegisterDropdown && (
                    <div
                      onMouseLeave={() => setShowRegisterDropdown(false)}
                      className="absolute right-0 mt-1.5 w-48 bg-surface rounded-md shadow-md border border-border-subtle py-1 z-50"
                    >
                      <Link
                        href="/register/farmer"
                        onClick={() => setShowRegisterDropdown(false)}
                        className="block px-3.5 py-2 text-xs font-bold text-charcoal hover:bg-cream hover:text-forest transition border-b border-border-subtle/50"
                      >
                        {t('nav.registerFarmer')} →
                      </Link>
                      <Link
                        href="/register/industry"
                        onClick={() => setShowRegisterDropdown(false)}
                        className="block px-3.5 py-2 text-xs font-bold text-charcoal hover:bg-cream hover:text-terracotta transition"
                      >
                        {t('nav.registerIndustry')}
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
