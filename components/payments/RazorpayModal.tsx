'use client';

import React, { useState } from 'react';
import { ShieldCheck, CreditCard, CheckCircle2, Lock, X, AlertCircle } from 'lucide-react';
import { useAppStore } from '@/lib/store/use-app-store';
import { useTranslation } from '@/lib/i18n/context';

interface RazorpayModalProps {
  auctionId: string;
  cropName: string;
  feeAmount: number;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (paymentId: string) => void;
}

export function RazorpayModal({ auctionId, cropName, feeAmount, isOpen, onClose, onSuccess }: RazorpayModalProps) {
  const { currentUser } = useAppStore();
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'CARD' | 'UPI' | 'NETBANKING'>('UPI');
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleProcessPayment = async () => {
    setLoading(true);
    setError(null);

    try {
      // 1. Call Backend to create order
      const orderRes = await fetch('/api/payments/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          auctionId,
          userId: currentUser?.id,
          amountInr: feeAmount,
        }),
      });

      const orderData = await orderRes.json();
      if (!orderRes.ok) {
        throw new Error(orderData.error || 'Failed to initialize payment order');
      }

      // Simulate Razorpay Test Mode Checkout response
      const mockPaymentId = `pay_demo_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
      const mockSignature = `sig_demo_${Date.now()}`;

      // 2. Call Backend verification
      const verifyRes = await fetch('/api/payments/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          razorpayOrderId: orderData.orderId,
          razorpayPaymentId: mockPaymentId,
          razorpaySignature: mockSignature,
          auctionId,
          userId: currentUser?.id,
        }),
      });

      const verifyData = await verifyRes.json();
      if (!verifyRes.ok || !verifyData.success) {
        throw new Error(verifyData.error || 'Payment verification failed');
      }

      setLoading(false);
      onSuccess(mockPaymentId);
    } catch (err: any) {
      setLoading(false);
      setError(err.message || 'Payment processing error');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden">
        {/* Header */}
        <div className="bg-slate-900 text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center font-bold text-xs">
              RZP
            </div>
            <div>
              <h3 className="font-bold text-base">{t('payment.modalTitle')}</h3>
              <p className="text-[11px] text-slate-400">{t('payment.testModeNotice')}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-slate-800 rounded-lg transition text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5">
          {/* Summary Box */}
          <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200 space-y-2">
            <div className="flex justify-between text-xs text-emerald-800">
              <span>{t('payment.modalSubtitle')}:</span>
              <span className="font-semibold">{cropName}</span>
            </div>
            <div className="flex justify-between text-xs text-emerald-800">
              <span>{t('payment.feeBreakdown')}</span>
              <span className="font-bold">₹{feeAmount.toLocaleString('en-IN')}</span>
            </div>
            <div className="border-t border-emerald-200 pt-2 flex justify-between text-sm font-extrabold text-emerald-900">
              <span>{t('payment.amountCollectedCol')}:</span>
              <span>₹{feeAmount.toLocaleString('en-IN')}</span>
            </div>
          </div>

          {/* Payment Method Selector */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
              Payment Method
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setPaymentMethod('UPI')}
                className={`p-2.5 rounded-xl border text-xs font-semibold flex flex-col items-center gap-1 transition ${paymentMethod === 'UPI' ? 'border-emerald-600 bg-emerald-50 text-emerald-800' : 'border-slate-200 text-slate-600 hover:bg-slate-50'}`}
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>UPI / GPay</span>
              </button>
              <button
                type="button"
                onClick={() => setPaymentMethod('CARD')}
                className={`p-2.5 rounded-xl border text-xs font-semibold flex flex-col items-center gap-1 transition ${paymentMethod === 'CARD' ? 'border-emerald-600 bg-emerald-50 text-emerald-800' : 'border-slate-200 text-slate-600 hover:bg-slate-50'}`}
              >
                <CreditCard className="w-4 h-4 text-emerald-600" />
                <span>Card</span>
              </button>
              <button
                type="button"
                onClick={() => setPaymentMethod('NETBANKING')}
                className={`p-2.5 rounded-xl border text-xs font-semibold flex flex-col items-center gap-1 transition ${paymentMethod === 'NETBANKING' ? 'border-emerald-600 bg-emerald-50 text-emerald-800' : 'border-slate-200 text-slate-600 hover:bg-slate-50'}`}
              >
                <Lock className="w-4 h-4 text-emerald-600" />
                <span>NetBanking</span>
              </button>
            </div>
          </div>

          {error && (
            <div className="p-3 bg-red-50 text-red-700 rounded-xl border border-red-200 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Guarantee Note */}
          <div className="flex items-center gap-2 text-[11px] text-slate-500 bg-slate-50 p-2.5 rounded-lg border border-slate-200">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{t('payment.testModeNotice')}</span>
          </div>

          {/* Action Button */}
          <button
            type="button"
            onClick={handleProcessPayment}
            disabled={loading}
            className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-lg shadow-emerald-200 text-sm transition flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? (
              <>
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                <span>{t('common.processing')}</span>
              </>
            ) : (
              <span>{t('payment.payWithRazorpayBtn')}</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
