'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useTranslation } from '@/lib/i18n/context';
import { validateIndianMobile } from '@/lib/auth/validation';
import { CheckCircle2, AlertCircle } from 'lucide-react';

interface MobileInputProps {
  value: string;
  onChange: (val: string) => void;
  onVerifiedChange?: (isVerified: boolean) => void;
  disabled?: boolean;
}

/**
 * Extracts strictly 10 national digits from user input or prop value.
 * Correctly strips +91/91 prefix without prepending country code on keystrokes.
 */
export function extractNationalDigits(input: string): string {
  if (!input) return '';
  let str = input.trim();

  if (str.startsWith('+91')) {
    str = str.slice(3);
  } else if (str.startsWith('91') && str.replace(/\D/g, '').length === 12) {
    str = str.slice(2);
  }

  const digits = str.replace(/\D/g, '');
  return digits.slice(0, 10);
}

export function MobileInput({ value, onChange, onVerifiedChange, disabled }: MobileInputProps) {
  const { t } = useTranslation();
  const [digits, setDigits] = useState(() => extractNationalDigits(value));
  const [error, setError] = useState<string | null>(null);
  const [isRegistered, setIsRegistered] = useState(false);
  const [isValidFormat, setIsValidFormat] = useState(false);

  // Sync internal digits state from prop value
  useEffect(() => {
    const extracted = extractNationalDigits(value);
    setDigits(extracted);
  }, [value]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawInput = e.target.value;
    const nationalDigits = extractNationalDigits(rawInput);

    setDigits(nationalDigits);

    // Form canonical normalized value for parent state (+91XXXXXXXXXX or empty)
    const fullValue = nationalDigits ? `+91${nationalDigits}` : '';
    onChange(fullValue);

    if (onVerifiedChange) {
      onVerifiedChange(false);
    }

    setError(null);
    setIsRegistered(false);

    if (nationalDigits.length === 10) {
      const valRes = validateIndianMobile(`+91${nationalDigits}`);
      if (!valRes.valid) {
        setError(valRes.error || t('otp.invalidIndianMobile'));
        setIsValidFormat(false);
      } else {
        setIsValidFormat(true);
        checkUniqueness(`+91${nationalDigits}`);
      }
    } else {
      setIsValidFormat(false);
    }
  };

  const handleBlur = () => {
    if (!digits) {
      setError(null);
      return;
    }

    if (digits.length < 10) {
      setError(t('otp.invalidIndianMobile'));
      setIsValidFormat(false);
      return;
    }

    const fullValue = `+91${digits}`;
    const valRes = validateIndianMobile(fullValue);
    if (!valRes.valid) {
      setError(valRes.error || t('otp.invalidIndianMobile'));
      setIsValidFormat(false);
    } else {
      setIsValidFormat(true);
      checkUniqueness(fullValue);
    }
  };

  const checkUniqueness = async (mobileStr: string) => {
    try {
      const res = await fetch('/api/auth/check-unique', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mobile: mobileStr }),
      });
      const data = await res.json();
      if (data.mobileExists) {
        setIsRegistered(true);
        setError(data.mobileError || t('otp.mobileAlreadyRegistered'));
      } else if (data.mobileError) {
        setError(data.mobileError);
      } else {
        setError(null);
        setIsRegistered(false);
      }
    } catch (err) {
      // Ignore network hiccup
    }
  };

  return (
    <div className="space-y-1.5">
      <label className="text-xs font-bold text-[#252A27] block">
        {t('farmerRegister.mobileLabel')} <span className="text-[#B65C3A]">*</span>
      </label>

      <div className="flex items-center gap-2">
        {/* Country Code Addon - Separate visual element */}
        <div className="flex items-center gap-1.5 px-3 py-2.5 bg-[#FFFDF8] border border-[#DDD8CC] rounded-md font-bold text-xs text-[#252A27] shrink-0 shadow-sm select-none">
          <span className="text-sm">🇮🇳</span>
          <span>+91</span>
        </div>

        {/* 10-Digit Mobile Input */}
        <div className="relative flex-1">
          <input
            type="tel"
            required
            autoComplete="tel"
            disabled={disabled}
            placeholder="9876543210"
            value={digits}
            onChange={handleInputChange}
            onBlur={handleBlur}
            maxLength={10}
            className={`w-full text-xs p-2.5 bg-[#FFFDF8] border rounded-md font-bold text-[#252A27] focus:ring-1 focus:outline-none transition ${
              error
                ? 'border-[#B65C3A] focus:ring-[#B65C3A]'
                : isValidFormat && !isRegistered
                ? 'border-[#23483A] focus:ring-[#23483A]'
                : 'border-[#CFC9BC] focus:ring-[#23483A]'
            } ${disabled ? 'opacity-60 cursor-not-allowed bg-gray-100' : ''}`}
          />
          {isValidFormat && !isRegistered && !error && (
            <CheckCircle2 className="w-4 h-4 text-[#23483A] absolute right-3 top-3 shrink-0" />
          )}
        </div>
      </div>

      {/* Inline Errors & Sign In link */}
      {error && (
        <div className="text-xs font-medium text-[#B65C3A] flex items-center justify-between gap-2 pt-0.5 animate-in fade-in">
          <div className="flex items-center gap-1.5">
            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
            <span>{error}</span>
          </div>
          {isRegistered && (
            <Link
              href="/login"
              className="font-bold text-[#23483A] hover:underline bg-[#23483A]/10 px-2 py-0.5 rounded text-[11px] shrink-0"
            >
              {t('auth.signIn')} →
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
