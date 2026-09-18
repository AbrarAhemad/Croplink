'use client';

import React, { useState, useEffect, useRef, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useTranslation } from '@/lib/i18n/context';
import { ShieldCheck, AlertCircle, CheckCircle2, RefreshCw, KeyRound, Info } from 'lucide-react';

function VerifyResetOtpContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t } = useTranslation();

  const [email, setEmail] = useState('');
  const [otpDigits, setOtpDigits] = useState<string[]>(Array(6).fill(''));
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);

  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [demoCode, setDemoCode] = useState<string | null>(null);
  const [cooldown, setCooldown] = useState(30);

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    const emailParam = searchParams.get('email');
    if (emailParam) {
      setEmail(emailParam);
    }
    const demoParam = searchParams.get('demoOtp');
    if (demoParam) {
      setDemoCode(demoParam);
    }
  }, [searchParams]);

  // Cooldown countdown
  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => setCooldown(prev => prev - 1), 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  const handleDigitChange = (index: number, val: string) => {
    const char = val.slice(-1).replace(/\D/g, '');
    const newDigits = [...otpDigits];
    newDigits[index] = char;
    setOtpDigits(newDigits);
    setError(null);

    if (char && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (!pasted) return;

    const newDigits = Array(6).fill('');
    for (let i = 0; i < pasted.length; i++) {
      newDigits[i] = pasted[i];
    }
    setOtpDigits(newDigits);
    const nextIndex = Math.min(pasted.length, 5);
    inputRefs.current[nextIndex]?.focus();
  };

  const handleResendOtp = async () => {
    if (!email || resending) return;
    setError(null);
    setMessage(null);
    setDemoCode(null);
    setResending(true);

    try {
      const res = await fetch('/api/auth/forgot-password/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      setResending(false);

      if (!res.ok || !data.success) {
        setError(data.error || 'Failed to resend code.');
        if (data.remainingSeconds) setCooldown(data.remainingSeconds);
        return;
      }

      setCooldown(30);
      setMessage(data.message || t('otp.sentSuccess'));
      if (data.demoOtp) setDemoCode(data.demoOtp);
    } catch (err) {
      setResending(false);
      setError('Network error resending code.');
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    const code = otpDigits.join('');
    if (code.length !== 6) {
      setError(t('otp.enter6Digit'));
      return;
    }

    setError(null);
    setMessage(null);
    setLoading(true);

    try {
      const res = await fetch('/api/auth/forgot-password/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp: code }),
      });

      const data = await res.json();
      setLoading(false);

      if (!res.ok || !data.success) {
        setError(data.error || t('otp.invalid'));
        return;
      }

      // Success -> navigate to /reset-password with resetToken
      router.push(`/reset-password?token=${data.resetToken}`);
    } catch (err) {
      setLoading(false);
      setError('Network error verifying code.');
    }
  };

  return (
    <div className="max-w-md mx-auto my-12 px-4 sm:px-6 space-y-6 bg-[#F7F3EA]">
      <div className="text-center space-y-2">
        <div className="w-10 h-10 rounded-md bg-[#23483A] text-white flex items-center justify-center mx-auto shadow-sm">
          <KeyRound className="w-6 h-6 text-white" />
        </div>
        <h1 className="text-2xl font-extrabold text-[#252A27] tracking-tight">{t('auth.verifyResetOtpTitle')}</h1>
        <p className="text-xs text-[#6F756F] font-medium leading-relaxed">
          {t('auth.verifyResetOtpSubtitle')}
        </p>
      </div>

      <form onSubmit={handleVerify} className="bg-[#FFFDF8] rounded-md border border-[#DDD8CC] shadow-sm p-6 space-y-5">
        {email && (
          <div className="text-xs font-bold text-[#252A27] bg-[#F7F3EA] p-3 rounded-md border border-[#DDD8CC] flex items-center justify-between">
            <span>Destination: <strong className="text-[#23483A]">{email}</strong></span>
            <Link href="/forgot-password" className="text-[11px] text-[#23483A] hover:underline">Change</Link>
          </div>
        )}

        {demoCode && (
          <div className="p-3 bg-[#23483A]/10 text-[#23483A] text-xs font-bold rounded-md border border-[#23483A]/20 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="font-extrabold text-xs flex items-center gap-1.5">
                <Info className="w-4 h-4" />
                {t('otp.demoOtpReady')}
              </span>
              <span className="font-mono text-sm tracking-wider font-extrabold bg-white text-[#23483A] px-2.5 py-0.5 rounded border border-[#23483A]/30">
                {t('otp.demoVerificationCode')} {demoCode}
              </span>
            </div>
            <p className="text-[11px] text-[#23483A]/80 font-medium">
              ⚡ {t('otp.demoNoSmsSent')}
            </p>
          </div>
        )}

        {message && !error && (
          <div className="p-3 bg-[#23483A]/10 text-[#23483A] text-xs font-semibold rounded border border-[#23483A]/20 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{message}</span>
          </div>
        )}

        {error && (
          <div className="p-3 bg-[#B65C3A]/10 text-[#B65C3A] text-xs font-semibold rounded border border-[#B65C3A]/20 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* 6 Digit Input Boxes */}
        <div className="flex items-center justify-center gap-2 sm:gap-3 py-2">
          {otpDigits.map((digit, idx) => (
            <input
              key={idx}
              ref={el => { inputRefs.current[idx] = el; }}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={e => handleDigitChange(idx, e.target.value)}
              onKeyDown={e => handleKeyDown(idx, e)}
              onPaste={handlePaste}
              className="w-10 h-12 text-center text-base font-extrabold text-[#252A27] bg-[#FFFDF8] border border-[#CFC9BC] rounded-md focus:border-[#23483A] focus:ring-1 focus:ring-[#23483A] focus:outline-none shadow-sm transition"
            />
          ))}
        </div>

        <button
          type="submit"
          disabled={loading || otpDigits.join('').length !== 6}
          className="w-full py-3 bg-[#23483A] hover:bg-[#1b382d] text-white font-bold rounded-md text-xs shadow-sm transition disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span>Verifying Code...</span>
            </>
          ) : (
            <span>{t('otp.verifyOtp')}</span>
          )}
        </button>

        <div className="flex items-center justify-between text-xs text-[#6F756F] font-medium pt-2">
          <Link href="/forgot-password" className="hover:underline">
            ← Request New Code
          </Link>
          {cooldown > 0 ? (
            <span>{t('otp.resendIn')} <strong className="text-[#252A27]">{cooldown}s</strong></span>
          ) : (
            <button type="button" onClick={handleResendOtp} className="font-bold text-[#23483A] hover:underline">
              {t('otp.resendOtp')}
            </button>
          )}
        </div>
      </form>
    </div>
  );
}

export default function VerifyResetOtpPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs text-[#6F756F]">Loading verification...</div>}>
      <VerifyResetOtpContent />
    </Suspense>
  );
}
