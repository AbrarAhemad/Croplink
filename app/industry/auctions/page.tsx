'use client';

import React, { useState } from 'react';
import { useAppStore } from '@/lib/store/use-app-store';
import { AuctionCard } from '@/components/auction/AuctionCard';
import { Search, ShoppingBag, MapPin } from 'lucide-react';

export default function IndustryAuctionsPage() {
  const { auctions, registrations, currentUser } = useAppStore();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'ALL' | 'REGISTERED'>('ALL');

  const filtered = auctions.filter(a => {
    const matchesSearch = a.crop.toLowerCase().includes(search.toLowerCase()) ||
      a.variety.toLowerCase().includes(search.toLowerCase()) ||
      a.locationArea.toLowerCase().includes(search.toLowerCase());

    const isReg = registrations.some(r => r.auctionId === a.id && r.industryId === currentUser?.id && r.status === 'PAID');
    if (filter === 'REGISTERED') return matchesSearch && isReg;
    return matchesSearch;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-semibold mb-2">
            <ShoppingBag className="w-3.5 h-3.5 text-blue-600" />
            <span>Industrial Procurement Catalog</span>
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Browse Crop Auctions</h1>
          <p className="text-xs text-slate-500 font-medium">
            Approximate farm-to-industry distance computation without exposing private farmer coordinates.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Search crop, grade, district..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full text-xs pl-9 pr-3 py-2 bg-white rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as any)}
            className="text-xs py-2 px-3 bg-white rounded-xl border border-slate-200 font-medium"
          >
            <option value="ALL">All Available Lots</option>
            <option value="REGISTERED">My Paid Registrations Only</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {filtered.map(auction => (
          <AuctionCard key={auction.id} auction={auction} userRole="INDUSTRY" />
        ))}
      </div>
    </div>
  );
}
