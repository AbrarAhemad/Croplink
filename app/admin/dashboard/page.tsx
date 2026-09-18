'use client';

import React from 'react';
import Link from 'next/link';
import { useAppStore } from '@/lib/store/use-app-store';
import { ShieldCheck, UserCheck, Building2, Scale, DollarSign, AlertCircle, Settings, FileText, ArrowRight } from 'lucide-react';

export default function AdminDashboardPage() {
  const { auctions, verifications, agreements, auditLogs, settings } = useAppStore();

  const totalFarmers = 142;
  const totalIndustries = 86;
  const pendingApprovals = 5;
  const activeAuctions = auctions.filter(a => a.status === 'AUCTION_LIVE' || a.status === 'REGISTRATION_OPEN').length;
  const completedDeals = agreements.filter(a => a.status === 'FULLY_EXECUTED').length;
  const cancelledDeals = verifications.filter(v => v.status === 'CANCELLED').length;
  const totalRevenueInr = (auctions.length * settings.industryRegistrationFeeInr) + (cancelledDeals * settings.cancellationFeeInr);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 bg-[#F7F3EA]">
      {/* Admin Top Banner */}
      <div className="bg-[#252A27] text-white p-6 lg:p-8 rounded-md border border-[#252A27] flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-sm">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-white/10 text-white rounded-sm text-xs font-bold border border-white/20">
            <ShieldCheck className="w-3.5 h-3.5 text-[#C99A2E]" />
            <span>CropLink Master Operations Panel</span>
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight text-white">Admin Operations & Control</h1>
          <p className="text-xs text-[#DDD8CC]">
            CropLink Master Operations • Sangli APMC Hub Operations & Audit Logging
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/admin/approvals"
            className="px-4 py-2.5 bg-[#B65C3A] hover:bg-[#9b4b2c] text-white font-bold rounded-md text-xs transition flex items-center gap-1.5 shadow-sm"
          >
            <UserCheck className="w-4 h-4" />
            <span>Pending Approvals ({pendingApprovals})</span>
          </Link>
          <Link
            href="/admin/settings"
            className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white font-bold rounded-md text-xs border border-white/20 transition flex items-center gap-1.5"
          >
            <Settings className="w-4 h-4" />
            <span>Platform Settings</span>
          </Link>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 bg-[#FFFDF8] rounded-md border border-[#DDD8CC] shadow-sm space-y-1.5">
          <span className="text-[11px] font-bold text-[#6F756F] uppercase tracking-wider block">Total Verified Farmers</span>
          <span className="text-2xl font-extrabold text-[#252A27] block">{totalFarmers} Registered</span>
          <span className="text-[11px] text-[#3F7655] font-bold">Sangli / Nashik / Pune</span>
        </div>

        <div className="p-4 bg-[#FFFDF8] rounded-md border border-[#DDD8CC] shadow-sm space-y-1.5">
          <span className="text-[11px] font-bold text-[#6F756F] uppercase tracking-wider block">Total Industry Buyers</span>
          <span className="text-2xl font-extrabold text-[#252A27] block">{totalIndustries} Buyers</span>
          <span className="text-[11px] text-[#23483A] font-bold">GSTIN Verified</span>
        </div>

        <div className="p-4 bg-[#FFFDF8] rounded-md border border-[#DDD8CC] shadow-sm space-y-1.5">
          <span className="text-[11px] font-bold text-[#6F756F] uppercase tracking-wider block">Active Crop Auctions</span>
          <span className="text-2xl font-extrabold text-[#3F7655] block">{activeAuctions} Live</span>
          <span className="text-[11px] text-[#6F756F] font-medium">Sangli 20kg Samples Tested</span>
        </div>

        <div className="p-4 bg-[#FFFDF8] rounded-md border border-[#DDD8CC] shadow-sm space-y-1.5">
          <span className="text-[11px] font-bold text-[#6F756F] uppercase tracking-wider block">Platform Revenue</span>
          <span className="text-2xl font-extrabold text-[#C99A2E] block">₹{totalRevenueInr.toLocaleString('en-IN')}</span>
          <span className="text-[11px] text-[#6F756F] font-medium">Registration & Cancellation Fees</span>
        </div>
      </div>

      {/* Quick Navigation Admin Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Link
          href="/admin/approvals"
          className="p-5 bg-[#FFFDF8] hover:bg-[#F7F3EA] rounded-md border border-[#DDD8CC] transition space-y-3 group"
        >
          <div className="w-9 h-9 rounded-md bg-[#fbf0ec] text-[#B65C3A] flex items-center justify-center font-bold">
            <UserCheck className="w-5 h-5 text-[#B65C3A]" />
          </div>
          <h3 className="font-bold text-sm text-[#252A27] group-hover:text-[#B65C3A] transition">User Approvals</h3>
          <p className="text-xs text-[#6F756F] leading-relaxed">
            Verify 7/12 land revenue extracts and GST certificates for pending applicants.
          </p>
        </Link>

        <Link
          href="/admin/auctions"
          className="p-5 bg-[#FFFDF8] hover:bg-[#F7F3EA] rounded-md border border-[#DDD8CC] transition space-y-3 group"
        >
          <div className="w-9 h-9 rounded-md bg-[#e8f0ec] text-[#23483A] flex items-center justify-center font-bold">
            <ShieldCheck className="w-5 h-5 text-[#23483A]" />
          </div>
          <h3 className="font-bold text-sm text-[#252A27] group-hover:text-[#23483A] transition">Sangli Hub Verification</h3>
          <p className="text-xs text-[#6F756F] leading-relaxed">
            Update physical 20kg sample testing status (RECEIVED, VERIFIED, FORWARDED).
          </p>
        </Link>

        <Link
          href="/admin/audit-logs"
          className="p-5 bg-[#FFFDF8] hover:bg-[#F7F3EA] rounded-md border border-[#DDD8CC] transition space-y-3 group"
        >
          <div className="w-9 h-9 rounded-md bg-[#F7F3EA] text-[#252A27] flex items-center justify-center font-bold border border-[#DDD8CC]">
            <FileText className="w-5 h-5 text-[#252A27]" />
          </div>
          <h3 className="font-bold text-sm text-[#252A27] group-hover:text-[#23483A] transition">System Audit Trail</h3>
          <p className="text-xs text-[#6F756F] leading-relaxed">
            Immutable log of user approvals, bids, Razorpay payments, and cancellation events.
          </p>
        </Link>

        <Link
          href="/admin/settings"
          className="p-5 bg-[#FFFDF8] hover:bg-[#F7F3EA] rounded-md border border-[#DDD8CC] transition space-y-3 group"
        >
          <div className="w-9 h-9 rounded-md bg-[#faf5e8] text-[#C99A2E] flex items-center justify-center font-bold">
            <Settings className="w-5 h-5 text-[#C99A2E]" />
          </div>
          <h3 className="font-bold text-sm text-[#252A27] group-hover:text-[#C99A2E] transition">Platform Settings</h3>
          <p className="text-xs text-[#6F756F] leading-relaxed">
            Configure ₹1,999 registration fee, ₹5,000 cancellation fee, and Sangli hub address.
          </p>
        </Link>
      </div>

      {/* Recent Audit Logs Snapshot */}
      <div className="bg-[#FFFDF8] rounded-md border border-[#DDD8CC] p-6 space-y-4 shadow-sm">
        <div className="flex items-center justify-between border-b border-[#DDD8CC] pb-3">
          <h2 className="font-extrabold text-base text-[#252A27]">Recent Admin Operations Log</h2>
          <Link href="/admin/audit-logs" className="text-xs font-bold text-[#23483A] hover:underline">
            View All Audit Logs →
          </Link>
        </div>

        <div className="overflow-x-auto border border-[#DDD8CC] rounded-md">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#252A27] text-white text-[11px] font-bold uppercase tracking-wider">
                <th className="p-3">Actor / Admin</th>
                <th className="p-3">Action</th>
                <th className="p-3">Entity Target</th>
                <th className="p-3">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#DDD8CC] text-xs">
              {auditLogs.slice(0, 5).map(log => (
                <tr key={log.id} className="hover:bg-[#F7F3EA] bg-[#FFFDF8]">
                  <td className="p-3 font-bold text-[#252A27]">{log.actorName} ({log.actorRole})</td>
                  <td className="p-3 font-extrabold text-[#23483A]">{log.action}</td>
                  <td className="p-3 text-[#6F756F]">{log.entity}: {log.entityId}</td>
                  <td className="p-3 text-[#6F756F]">{new Date(log.timestamp).toLocaleString('en-IN')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
