'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAppStore } from '@/lib/store/use-app-store';
import { useTranslation } from '@/lib/i18n/context';
import { validateCredentials } from '@/lib/auth/user-store';
import { validateGmail } from '@/lib/auth/validation';
import { Sprout, Lock, Mail, ArrowRight, UserCheck, Building2, ShieldCheck, AlertCircle } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const { loginAs, setCurrentUser } = useAppStore();
  const { t } = useTranslation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleDemoLogin = (role: 'FARMER' | 'INDUSTRY' | 'ADMIN') => {
    loginAs(role);
    if (role === 'FARMER') router.push('/farmer/dashboard');
    else if (role === 'INDUSTRY') router.push('/industry/dashboard');
    else router.push('/admin/dashboard');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const gmailVal = validateGmail(email);
    if (!gmailVal.valid && !email.includes('admin') && !email.includes('demo')) {
      setError(t('auth.invalidCredentials'));
      return;
    }

    const normEmail = email.trim().toLowerCase();
    const user = validateCredentials(normEmail, password);

    if (user) {
      setCurrentUser(user);
      if (user.role === 'FARMER') router.push('/farmer/dashboard');
      else if (user.role === 'INDUSTRY') router.push('/industry/dashboard');
      else router.push('/admin/dashboard');
      return;
    }

    // Fallback demo matching
    if (email.includes('farmer')) {
      handleDemoLogin('FARMER');
    } else if (email.includes('admin')) {
      handleDemoLogin('ADMIN');
    } else if (email.includes('industry') || email.includes('gmail')) {
      handleDemoLogin('INDUSTRY');
    } else {
      // Security Requirement: Never reveal whether email or password was wrong
      setError(t('auth.invalidCredentials'));
    }
  };

  return (
    <div className="max-w-md mx-auto my-12 px-4 sm:px-6 space-y-6 bg-[#F7F3EA]">
      <div className="text-center space-y-2">
        <div className="w-10 h-10 rounded-md bg-[#23483A] text-white flex items-center justify-center mx-auto shadow-sm">
          <Sprout className="w-6 h-6 text-white" />
        </div>
        <h1 className="text-2xl font-extrabold text-[#252A27] tracking-tight">{t('auth.loginTitle')}</h1>
        <p className="text-xs text-[#6F756F] font-medium">{t('auth.loginSubtitle')}</p>
      </div>

      {/* 1-Click Demo Quickstart */}
      <div className="bg-[#FFFDF8] border border-[#DDD8CC] rounded-md p-4 space-y-3 shadow-sm">
        <div className="flex items-center justify-between text-xs text-[#252A27] font-extrabold border-b border-[#DDD8CC] pb-2">
          <span>⚡ {t('auth.selectDemoRole')}:</span>
        </div>
        <div className="space-y-2">
          <button
            type="button"
            onClick={() => handleDemoLogin('FARMER')}
            className="w-full py-2 px-3 bg-[#e8f0ec] hover:bg-[#d8e6df] text-[#23483A] font-bold text-xs rounded-md border border-[#23483A]/30 shadow-sm flex items-center justify-between transition"
          >
            <div className="flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-[#23483A]" />
              <span>{t('home.demoFarmerRole')} (Rameshwar Patil)</span>
            </div>
            <ArrowRight className="w-3.5 h-3.5 text-[#23483A]" />
          </button>

          <button
            type="button"
            onClick={() => handleDemoLogin('INDUSTRY')}
            className="w-full py-2 px-3 bg-[#fbf0ec] hover:bg-[#f4e2db] text-[#B65C3A] font-bold text-xs rounded-md border border-[#B65C3A]/30 shadow-sm flex items-center justify-between transition"
          >
            <div className="flex items-center gap-2">
              <Building2 className="w-4 h-4 text-[#B65C3A]" />
              <span>{t('home.demoIndustryRole')} (AgriFoods Ltd)</span>
            </div>
            <ArrowRight className="w-3.5 h-3.5 text-[#B65C3A]" />
          </button>

          <button
            type="button"
            onClick={() => handleDemoLogin('ADMIN')}
            className="w-full py-2 px-3 bg-[#F7F3EA] hover:bg-[#eae3d5] text-[#252A27] font-bold text-xs rounded-md border border-[#DDD8CC] shadow-sm flex items-center justify-between transition"
          >
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#252A27]" />
              <span>{t('home.demoAdminRole')}</span>
            </div>
            <ArrowRight className="w-3.5 h-3.5 text-[#252A27]" />
          </button>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="bg-[#FFFDF8] rounded-md border border-[#DDD8CC] shadow-sm p-6 space-y-4">
        {error && (
          <div className="p-3 bg-[#B65C3A]/10 text-[#B65C3A] text-xs font-semibold rounded border border-[#B65C3A]/20 flex items-center gap-2 animate-in fade-in">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div>
          <label className="text-xs font-bold text-[#252A27] block mb-1">{t('auth.emailLabel')}</label>
          <div className="relative">
            <Mail className="w-4 h-4 text-[#6F756F] absolute left-3 top-3" />
            <input
              type="text"
              required
              placeholder={t('auth.emailPlaceholder')}
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setError(null);
              }}
              className="w-full text-xs pl-9 pr-3 py-2.5 bg-[#FFFDF8] border border-[#CFC9BC] rounded-md font-bold text-[#252A27] focus:ring-1 focus:ring-[#23483A] focus:border-[#23483A] focus:outline-none"
            />
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-xs font-bold text-[#252A27] block">{t('auth.passwordLabel')}</label>
            <Link href="/forgot-password" className="text-xs font-bold text-[#23483A] hover:underline">
              {t('auth.forgotPassword')}
            </Link>
          </div>
          <div className="relative">
            <Lock className="w-4 h-4 text-[#6F756F] absolute left-3 top-3" />
            <input
              type="password"
              required
              placeholder={t('auth.passwordPlaceholder')}
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setError(null);
              }}
              className="w-full text-xs pl-9 pr-3 py-2.5 bg-[#FFFDF8] border border-[#CFC9BC] rounded-md font-bold text-[#252A27] focus:ring-1 focus:ring-[#23483A] focus:border-[#23483A] focus:outline-none"
            />
          </div>
        </div>

        <button
          type="submit"
          className="w-full py-3 bg-[#23483A] hover:bg-[#1b382d] text-white font-bold rounded-md text-xs shadow-sm transition"
        >
          {t('auth.loginBtn')}
        </button>

        <div className="text-center text-xs text-[#6F756F] pt-2 space-y-1">
          <p>{t('auth.dontHaveAccount')}</p>
          <div className="flex items-center justify-center gap-3 font-bold text-[#23483A]">
            <Link href="/register/farmer" className="hover:underline">
              {t('auth.registerFarmer')}
            </Link>
            <span>•</span>
            <Link href="/register/industry" className="hover:underline">
              {t('auth.registerIndustry')}
            </Link>
          </div>
        </div>
      </form>
    </div>
  );
}
