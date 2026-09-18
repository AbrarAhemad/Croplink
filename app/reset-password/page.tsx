'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useTranslation } from '@/lib/i18n/context';
import { validatePassword } from '@/lib/auth/validation';
import { Lock, CheckCircle2, AlertCircle, RefreshCw, Check, X, ShieldCheck } from 'lucide-react';

function ResetPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t } = useTranslation();

  const [token, setToken] = useState<string | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const tokenParam = searchParams.get('token');
    if (!tokenParam) {
      setError('Password reset session token missing or expired. Please start over.');
    } else {
      setToken(tokenParam);
    }
  }, [searchParams]);

  const passCheck = validatePassword(newPassword);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!token) {
      setError('Password reset authorization missing.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (!passCheck.valid) {
      setError(passCheck.errors[0]);
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/auth/forgot-password/reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resetToken: token, newPassword, confirmPassword }),
      });

      const data = await res.json();
      setLoading(false);

      if (!res.ok || !data.success) {
        setError(data.error || 'Failed to update password.');
        return;
      }

      setSuccess(true);
    } catch (err) {
      setLoading(false);
      setError('Network error resetting password.');
    }
  };

  if (success) {
    return (
      <div className="max-w-md mx-auto my-12 px-4 sm:px-6">
        <div className="bg-[#FFFDF8] rounded-md border border-[#23483A]/30 p-8 text-center space-y-5 shadow-sm">
          <div className="w-12 h-12 bg-[#23483A]/10 text-[#23483A] rounded-full flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-extrabold text-[#252A27]">{t('auth.passwordUpdatedSuccess')}</h2>
          <p className="text-xs text-[#6F756F] font-medium leading-relaxed">
            You can now sign in to your CropLink account using your new password.
          </p>
          <Link
            href="/login"
            className="w-full py-3 bg-[#23483A] hover:bg-[#1b382d] text-white font-bold rounded-md text-xs shadow-sm text-center block transition"
          >
            {t('auth.signIn')} →
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto my-12 px-4 sm:px-6 space-y-6 bg-[#F7F3EA]">
      <div className="text-center space-y-2">
        <div className="w-10 h-10 rounded-md bg-[#23483A] text-white flex items-center justify-center mx-auto shadow-sm">
          <Lock className="w-6 h-6 text-white" />
        </div>
        <h1 className="text-2xl font-extrabold text-[#252A27] tracking-tight">{t('auth.resetPasswordTitle')}</h1>
        <p className="text-xs text-[#6F756F] font-medium leading-relaxed">
          {t('auth.resetPasswordSubtitle')}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="bg-[#FFFDF8] rounded-md border border-[#DDD8CC] shadow-sm p-6 space-y-5">
        {error && (
          <div className="p-3 bg-[#B65C3A]/10 text-[#B65C3A] text-xs font-semibold rounded border border-[#B65C3A]/20 flex items-center gap-2 animate-in fade-in">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div>
          <label className="text-xs font-bold text-[#252A27] block mb-1">
            {t('auth.newPasswordLabel')} <span className="text-[#B65C3A]">*</span>
          </label>
          <div className="relative">
            <Lock className="w-4 h-4 text-[#6F756F] absolute left-3 top-3" />
            <input
              type="password"
              required
              placeholder="••••••••"
              value={newPassword}
              onChange={e => setNewPassword(e.target.value)}
              className="w-full text-xs pl-9 pr-3 py-2.5 bg-[#FFFDF8] border border-[#CFC9BC] rounded-md font-bold text-[#252A27] focus:ring-1 focus:ring-[#23483A] focus:border-[#23483A] focus:outline-none"
            />
          </div>
        </div>

        <div>
          <label className="text-xs font-bold text-[#252A27] block mb-1">
            {t('auth.confirmPasswordLabel')} <span className="text-[#B65C3A]">*</span>
          </label>
          <div className="relative">
            <Lock className="w-4 h-4 text-[#6F756F] absolute left-3 top-3" />
            <input
              type="password"
              required
              placeholder="••••••••"
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              className="w-full text-xs pl-9 pr-3 py-2.5 bg-[#FFFDF8] border border-[#CFC9BC] rounded-md font-bold text-[#252A27] focus:ring-1 focus:ring-[#23483A] focus:border-[#23483A] focus:outline-none"
            />
          </div>
        </div>

        {/* Password Requirements Checklist */}
        <div className="p-3.5 bg-[#F7F3EA] rounded-md border border-[#DDD8CC] space-y-2">
          <span className="text-[11px] font-bold text-[#252A27] block">Password requirements:</span>
          <div className="grid grid-cols-2 gap-1.5 text-[11px] font-bold">
            <div className={`flex items-center gap-1.5 ${passCheck.hasMinLength ? 'text-[#23483A]' : 'text-[#6F756F]'}`}>
              {passCheck.hasMinLength ? <Check className="w-3.5 h-3.5" /> : <X className="w-3.5 h-3.5 text-gray-400" />}
              <span>{t('auth.passwordReqMinChar')}</span>
            </div>
            <div className={`flex items-center gap-1.5 ${passCheck.hasUppercase ? 'text-[#23483A]' : 'text-[#6F756F]'}`}>
              {passCheck.hasUppercase ? <Check className="w-3.5 h-3.5" /> : <X className="w-3.5 h-3.5 text-gray-400" />}
              <span>{t('auth.passwordReqUppercase')}</span>
            </div>
            <div className={`flex items-center gap-1.5 ${passCheck.hasLowercase ? 'text-[#23483A]' : 'text-[#6F756F]'}`}>
              {passCheck.hasLowercase ? <Check className="w-3.5 h-3.5" /> : <X className="w-3.5 h-3.5 text-gray-400" />}
              <span>{t('auth.passwordReqLowercase')}</span>
            </div>
            <div className={`flex items-center gap-1.5 ${passCheck.hasNumber ? 'text-[#23483A]' : 'text-[#6F756F]'}`}>
              {passCheck.hasNumber ? <Check className="w-3.5 h-3.5" /> : <X className="w-3.5 h-3.5 text-gray-400" />}
              <span>{t('auth.passwordReqNumber')}</span>
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading || !token || !passCheck.valid || newPassword !== confirmPassword}
          className="w-full py-3 bg-[#23483A] hover:bg-[#1b382d] text-white font-bold rounded-md text-xs shadow-sm transition disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span>Updating Password...</span>
            </>
          ) : (
            <span>Update Password</span>
          )}
        </button>

        <div className="text-center pt-2">
          <Link href="/login" className="text-xs font-bold text-[#23483A] hover:underline">
            Cancel and return to {t('auth.signIn')}
          </Link>
        </div>
      </form>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs text-[#6F756F]">Loading reset form...</div>}>
      <ResetPasswordContent />
    </Suspense>
  );
}
