'use client';

import React, { useState } from 'react';
import { useAppStore } from '@/lib/store/use-app-store';
import { Settings, Save, CheckCircle2 } from 'lucide-react';

export default function AdminSettingsPage() {
  const { settings, updateSettings } = useAppStore();

  const [form, setForm] = useState(settings);
  const [saved, setSaved] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings(form);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="max-w-3xl mx-auto py-10 px-4 sm:px-6 space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Platform Configuration Settings</h1>
        <p className="text-xs text-slate-500 font-medium">
          Configure global marketplace rules, Razorpay registration fees, cancellation charges, and Sangli hub address.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 lg:p-8 space-y-6">
        {saved && (
          <div className="p-3 bg-emerald-50 text-emerald-800 rounded-xl border border-emerald-200 text-xs font-semibold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Platform settings updated & audit log saved successfully!</span>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">Industry Registration Fee (₹)</label>
            <input
              type="number"
              value={form.industryRegistrationFeeInr}
              onChange={e => setForm({ ...form, industryRegistrationFeeInr: Number(e.target.value) })}
              className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">Cancellation Fee (₹)</label>
            <input
              type="number"
              value={form.cancellationFeeInr}
              onChange={e => setForm({ ...form, cancellationFeeInr: Number(e.target.value) })}
              className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">Minimum Bid Increment (₹)</label>
            <input
              type="number"
              value={form.minimumBidIncrementInr}
              onChange={e => setForm({ ...form, minimumBidIncrementInr: Number(e.target.value) })}
              className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">Sangli Hub Sample Min Weight (kg)</label>
            <input
              type="number"
              value={form.sampleMinimumWeightKg}
              onChange={e => setForm({ ...form, sampleMinimumWeightKg: Number(e.target.value) })}
              className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">Winner Response Window (Days)</label>
            <input
              type="number"
              value={form.winnerResponseWindowDays}
              onChange={e => setForm({ ...form, winnerResponseWindowDays: Number(e.target.value) })}
              className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">Max Fallback Bidders</label>
            <input
              type="number"
              value={form.maxFallbackBidders}
              onChange={e => setForm({ ...form, maxFallbackBidders: Number(e.target.value) })}
              className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:ring-2 focus:ring-purple-500"
            />
          </div>
        </div>

        <div>
          <label className="text-xs font-bold text-slate-700 block mb-1">Sangli Central Quality Hub Address</label>
          <textarea
            value={form.sangliHubAddress}
            onChange={e => setForm({ ...form, sangliHubAddress: e.target.value })}
            className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:ring-2 focus:ring-purple-500"
          />
        </div>

        <button
          type="submit"
          className="w-full py-3 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-xl shadow-md transition flex items-center justify-center gap-2"
        >
          <Save className="w-4 h-4" />
          <span>Save Platform Settings</span>
        </button>
      </form>
    </div>
  );
}
