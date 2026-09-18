'use client';

import React from 'react';
import Link from 'next/link';
import { Sprout, ArrowLeft, LayoutDashboard } from 'lucide-react';
import { useTranslation } from '@/lib/i18n/context';

export default function NotFound() {
  const { t } = useTranslation();

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 sm:px-6 lg:px-8">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xl p-8 sm:p-12 text-center max-w-md w-full space-y-6">
        <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-3xl flex items-center justify-center mx-auto border border-emerald-100 shadow-sm">
          <Sprout className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">{t('notFound.title')}</h1>
          <p className="text-xs text-slate-500 font-medium leading-relaxed">
            {t('notFound.subtitle')}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
          <Link
            href="/"
            className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs shadow-md shadow-emerald-200 transition flex items-center justify-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{t('notFound.returnHomeBtn')}</span>
          </Link>

          <Link
            href="/farmer/dashboard"
            className="w-full py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs border border-slate-200 transition flex items-center justify-center gap-2"
          >
            <LayoutDashboard className="w-4 h-4" />
            <span>{t('notFound.goDashboardBtn')}</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
