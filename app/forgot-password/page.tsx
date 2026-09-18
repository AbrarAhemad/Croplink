'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useTranslation } from '@/lib/i18n/context';
import { validateGmail } from '@/lib/auth/validation';
import { Sprout, Mail, ArrowRight, AlertCircle, CheckCircle2, RefreshCw } from 'lucide-react';

export default function ForgotPasswordPage() {
  const router = useRouter();
  const { t } = useTranslation();

  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setInfoMessage(null);

    const valRes = validateGmail(email);
    if (!valRes.valid) {
      setError(valRes.error || t('otp.invalidGmail'));
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/auth/forgot-password/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: valRes.normalized }),
      });

      const data = await res.json();
      setLoading(false);

      if (!res.ok || !data.success) {
        setError(data.error || 'Failed to request password reset code.');
        return;
      }

      setInfoMessage(data.message || t('auth.genericResetNotice'));

      setTimeout(() => {
        router.push(`/verify-reset-otp?email=${encodeURIComponent(valRes.normalized)}${data.demoOtp ? `&demoOtp=${data.demoOtp}` : ''}`);
      }, 1500);
    } catch (err) {
      setLoading(false);
      setError('Network error processing password reset request.');
    }
  };

  return (
    <div className="max-w-md mx-auto my-12 px-4 sm:px-6 space-y-6 bg-[#F7F3EA]">
      <div className="text-center space-y-2">
        <div className="w-10 h-10 rounded-md bg-[#23483A] text-white flex items-center justify-center mx-auto shadow-sm">
          <Sprout className="w-6 h-6 text-white" />
        </div>
        <h1 className="text-2xl font-extrabold text-[#252A27] tracking-tight">{t('auth.forgotPasswordTitle')}</h1>
        <p className="text-xs text-[#6F756F] font-medium leading-relaxed">
          {t('auth.forgotPasswordSubtitle')}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="bg-[#FFFDF8] rounded-md border border-[#DDD8CC] shadow-sm p-6 space-y-5">
        {infoMessage && (
          <div className="p-3 bg-[#23483A]/10 text-[#23483A] text-xs font-semibold rounded border border-[#23483A]/20 flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{infoMessage}</span>
          </div>
        )}

        {error && (
          <div className="p-3 bg-[#B65C3A]/10 text-[#B65C3A] text-xs font-semibold rounded border border-[#B65C3A]/20 flex items-center gap-2 animate-in fade-in">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div>
          <label className="text-xs font-bold text-[#252A27] block mb-1">
            {t('auth.emailLabel')} <span className="text-[#B65C3A]">*</span>
          </label>
          <div className="relative">
            <Mail className="w-4 h-4 text-[#6F756F] absolute left-3 top-3" />
            <input
              type="email"
              required
              placeholder="user@gmail.com"
              value={email}
              onChange={handleEmailChange}
              className="w-full text-xs pl-9 pr-3 py-2.5 bg-[#FFFDF8] border border-[#CFC9BC] rounded-md font-bold text-[#252A27] focus:ring-1 focus:ring-[#23483A] focus:border-[#23483A] focus:outline-none"
            />
          </div>
          <span className="text-[11px] text-[#6F756F] font-medium mt-1 block">
            Must be a valid @gmail.com address.
          </span>
        </div>

        <button
          type="submit"
          disabled={loading || !email}
          className="w-full py-3 bg-[#23483A] hover:bg-[#1b382d] text-white font-bold rounded-md text-xs shadow-sm transition disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span>Sending Reset Code...</span>
            </>
          ) : (
            <>
              <span>{t('auth.sendResetOtp')}</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>

        <div className="text-center pt-2">
          <Link href="/login" className="text-xs font-bold text-[#23483A] hover:underline">
            ← Back to {t('auth.signIn')}
          </Link>
        </div>
      </form>
    </div>
  );
}
