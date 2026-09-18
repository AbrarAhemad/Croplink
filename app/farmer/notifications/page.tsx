'use client';

import React from 'react';
import { useAppStore } from '@/lib/store/use-app-store';
import { Bell, CheckCircle2 } from 'lucide-react';

export default function FarmerNotificationsPage() {
  const { notifications, currentUser } = useAppStore();

  const myNotifications = notifications.filter(n => n.userId === currentUser?.id || n.userId === 'usr_farmer_1');

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Notifications & SMS Alerts</h1>
        <p className="text-xs text-slate-500 font-medium">
          In-app notifications and simulated SMS dispatch log.
        </p>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-4">
        {myNotifications.length === 0 ? (
          <div className="p-8 text-center text-slate-400 text-xs">
            No unread notifications right now. Alerts for 20kg sample receipts and highest bids will appear here.
          </div>
        ) : (
          myNotifications.map(notif => (
            <div key={notif.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-start gap-3 text-xs">
              <Bell className="w-4 h-4 text-emerald-600 mt-0.5" />
              <div className="space-y-1">
                <span className="font-bold text-slate-900 block">{notif.title}</span>
                <p className="text-slate-600">{notif.message}</p>
                <span className="text-[10px] text-slate-400 block">{new Date(notif.createdAt).toLocaleString('en-IN')}</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
