'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from '@/lib/i18n/context';
import { maskMobile } from '@/lib/auth/validation';
import { ShieldCheck, CheckCircle2, AlertCircle, RefreshCw, Smartphone, Info } from 'lucide-react';

interface OtpVerificationSectionProps {
  mobile: string;
  isVerified: boolean;
  onVerificationSuccess: () => void;
  disabled?: boolean;
}

export function OtpVerificationSection({
  mobile,
  isVerified,
  onVerificationSuccess,
  disabled,
}: OtpVerificationSectionProps) {
  const { t } = useTranslation();

  const [otpSent, setOtpSent] = useState(false);
  const [otpDigits, setOtpDigits] = useState<string[]>(Array(6).fill(''));
  const [sending, setSending] = useState(false);
  const [verifying, setVerifying] = useState(false);

  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [otpMode, setOtpMode] = useState<'demo' | 'sms'>('demo');
  const [demoCode, setDemoCode] = useState<string | null>(null);

  const [cooldown, setCooldown] = useState(0);

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Countdown Timer for Resend Cooldown (30s)
  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => {
      setCooldown(prev => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  const handleSendOtp = async () => {
    if (!mobile || disabled) return;
    setError(null);
    setMessage(null);
    setDemoCode(null);
    setSending(true);

    try {
      const res = await fetch('/api/auth/otp/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mobile }),
      });
      const data = await res.json();
      setSending(false);

      if (!res.ok || !data.success) {
        setError(data.error || t('otp.expired'));
        if (data.remainingSeconds) {
          setCooldown(data.remainingSeconds);
        }
        return;
      }

      setOtpSent(true);
      setCooldown(30);
      const mode = data.mode || 'demo';
      setOtpMode(mode);

      // In Demo Mode, clear bottom message box to avoid any message duplication
      if (mode === 'sms') {
        setMessage(data.message || t('otp.smsSentSuccess'));
      } else {
        setMessage(null);
      }

      if (data.demoOtp) {
        setDemoCode(data.demoOtp);
      }

      // Focus first digit input
      setTimeout(() => {
        if (inputRefs.current[0]) inputRefs.current[0].focus();
      }, 100);
    } catch (err) {
      setSending(false);
      setError('Network error sending OTP. Please try again.');
    }
  };

  const handleDigitChange = (index: number, val: string) => {
    const char = val.slice(-1).replace(/\D/g, '');
    const newDigits = [...otpDigits];
    newDigits[index] = char;
    setOtpDigits(newDigits);
    setError(null);

    // Auto-advance focus to next digit box
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

  const handleVerifyOtp = async () => {
    const code = otpDigits.join('');
    if (code.length !== 6) {
      setError(t('otp.enter6Digit'));
      return;
    }

    setError(null);
    setMessage(null);
    setVerifying(true);

    try {
      const res = await fetch('/api/auth/otp/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mobile, otp: code }),
      });
      const data = await res.json();
      setVerifying(false);

      if (!res.ok || !data.success) {
        setError(data.error || t('otp.invalid'));
        return;
      }

      setMessage(t('otp.verifiedSuccessfully'));
      onVerificationSuccess();
    } catch (err) {
      setVerifying(false);
      setError('Network error verifying OTP. Please try again.');
    }
  };

  if (isVerified) {
    return (
      <div className="p-4 bg-[#23483A]/10 border border-[#23483A]/30 rounded-md flex items-center justify-between shadow-sm animate-in fade-in">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-[#23483A] text-white flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs font-extrabold text-[#23483A] block">✓ {t('otp.verifiedSuccessfully')}</span>
            <span className="text-xs font-bold text-[#6F756F]">{maskMobile(mobile)}</span>
          </div>
        </div>
        <span className="text-[11px] font-bold text-[#23483A] bg-white px-2.5 py-1 rounded border border-[#23483A]/20">
          Verified
        </span>
      </div>
    );
  }

  return (
    <div className="bg-[#FFFDF8] border border-[#DDD8CC] rounded-md p-5 space-y-4 shadow-sm">
      <div className="flex items-center justify-between border-b border-[#DDD8CC] pb-3">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-[#23483A]" />
          <h4 className="text-xs font-extrabold text-[#252A27]">{t('otp.verifyMobileTitle')}</h4>
        </div>
        {mobile && <span className="text-xs font-bold text-[#6F756F]">{maskMobile(mobile)}</span>}
      </div>

      {!otpSent ? (
        <div className="space-y-3">
          <p className="text-xs text-[#6F756F] font-medium leading-relaxed">
            Click below to generate a 6-digit verification code for your Indian mobile number.
          </p>
          <button
            type="button"
            disabled={!mobile || sending || disabled}
            onClick={handleSendOtp}
            className="w-full sm:w-auto px-5 py-2.5 bg-[#23483A] hover:bg-[#1b382d] text-white font-bold text-xs rounded-md shadow-sm transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {sending ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Sending OTP...</span>
              </>
            ) : (
              <>
                <Smartphone className="w-4 h-4" />
                <span>{t('otp.sendOtp')}</span>
              </>
            )}
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Demo Mode vs SMS Mode Banner */}
          {otpMode === 'demo' ? (
            <div className="p-3 bg-[#23483A]/10 text-[#23483A] text-xs font-bold rounded-md border border-[#23483A]/20 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="font-extrabold text-xs flex items-center gap-1.5">
                  <Info className="w-4 h-4" />
                  {t('otp.demoOtpReady')}
                </span>
                <span className="font-mono text-sm tracking-wider font-extrabold bg-white text-[#23483A] px-2.5 py-0.5 rounded border border-[#23483A]/30">
                  {t('otp.demoVerificationCode')} {demoCode || '123456'}
                </span>
              </div>
              <p className="text-[11px] text-[#23483A]/80 font-medium">
                {t('otp.demoNoSmsSent')}
              </p>
            </div>
          ) : (
            <div className="p-3 bg-[#23483A]/10 text-[#23483A] text-xs font-semibold rounded-md border border-[#23483A]/20">
              {t('otp.smsSentSuccess')} <strong className="text-[#252A27]">{maskMobile(mobile)}</strong>
            </div>
          )}

          {/* 6 Digit Input Boxes */}
          <div className="flex items-center justify-center gap-2 sm:gap-3 py-1">
            {otpDigits.map((digit, idx) => (
              <input
                key={idx}
                ref={el => {
                  inputRefs.current[idx] = el;
                }}
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

          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
            <button
              type="button"
              disabled={verifying || otpDigits.join('').length !== 6}
              onClick={handleVerifyOtp}
              className="w-full sm:w-auto px-6 py-2.5 bg-[#23483A] hover:bg-[#1b382d] text-white font-bold text-xs rounded-md shadow-sm transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {verifying ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Verifying...</span>
                </>
              ) : (
                <span>{t('otp.verifyOtp')}</span>
              )}
            </button>

            {/* Resend OTP button & timer */}
            <div className="text-xs text-[#6F756F] font-medium">
              {cooldown > 0 ? (
                <span>
                  {t('otp.resendIn')} <strong className="text-[#252A27]">{cooldown}s</strong>
                </span>
              ) : (
                <button
                  type="button"
                  onClick={handleSendOtp}
                  className="font-bold text-[#23483A] hover:underline"
                >
                  {t('otp.resendOtp')}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Messages */}
      {message && !error && (
        <div className="p-2.5 bg-[#23483A]/10 text-[#23483A] text-xs font-semibold rounded border border-[#23483A]/20 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{message}</span>
        </div>
      )}

      {error && (
        <div className="p-2.5 bg-[#B65C3A]/10 text-[#B65C3A] text-xs font-semibold rounded border border-[#B65C3A]/20 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}
