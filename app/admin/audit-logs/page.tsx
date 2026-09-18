'use client';

import React from 'react';
import { useAppStore } from '@/lib/store/use-app-store';
import { FileText, ShieldCheck } from 'lucide-react';

export default function AdminAuditLogsPage() {
  const { auditLogs } = useAppStore();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 bg-[#F7F3EA]">
      <div className="space-y-1.5 border-b border-[#DDD8CC] pb-4">
        <h1 className="text-2xl font-extrabold text-[#252A27] tracking-tight">System Audit Log Trail</h1>
        <p className="text-xs text-[#6F756F] font-medium">
          Immutable history of sensitive actions including user approvals, bids, payments, cancellations, and settings changes.
        </p>
      </div>

      <div className="bg-[#FFFDF8] rounded-md border border-[#DDD8CC] shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#252A27] text-white text-[11px] font-bold uppercase tracking-wider">
                <th className="p-3.5">Actor</th>
                <th className="p-3.5">Role</th>
                <th className="p-3.5">Action Taken</th>
                <th className="p-3.5">Entity Type</th>
                <th className="p-3.5">Entity ID</th>
                <th className="p-3.5">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#DDD8CC] text-xs">
              {auditLogs.map(log => (
                <tr key={log.id} className="hover:bg-[#F7F3EA] bg-[#FFFDF8]">
                  <td className="p-3.5 font-extrabold text-[#252A27]">{log.actorName}</td>
                  <td className="p-3.5 font-bold text-[#B65C3A]">{log.actorRole}</td>
                  <td className="p-3.5 font-extrabold text-[#23483A]">{log.action}</td>
                  <td className="p-3.5 font-semibold text-[#6F756F]">{log.entity}</td>
                  <td className="p-3.5 font-mono text-[#6F756F] text-[11px]">{log.entityId}</td>
                  <td className="p-3.5 text-[#6F756F]">{new Date(log.timestamp).toLocaleString('en-IN')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
