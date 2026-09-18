'use client';

import React, { useState } from 'react';
import { useAppStore } from '@/lib/store/use-app-store';
import { AuctionCard } from '@/components/auction/AuctionCard';
import { Search, Filter, Sprout } from 'lucide-react';

export default function AuctionsDirectoryPage() {
  const { auctions, currentUser } = useAppStore();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  const filtered = auctions.filter(a => {
    const matchesSearch = a.crop.toLowerCase().includes(search.toLowerCase()) ||
      a.variety.toLowerCase().includes(search.toLowerCase()) ||
      a.locationArea.toLowerCase().includes(search.toLowerCase());
    
    if (statusFilter === 'LIVE') return matchesSearch && a.status === 'AUCTION_LIVE';
    if (statusFilter === 'REGISTRATION_OPEN') return matchesSearch && a.status === 'REGISTRATION_OPEN';
    return matchesSearch;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 bg-[#F7F3EA]">
      {/* Directory Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-[#DDD8CC] pb-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-[#e8f0ec] text-[#23483A] rounded-md text-xs font-bold mb-1.5 border border-[#23483A]/20">
            <Sprout className="w-3.5 h-3.5 text-[#23483A]" />
            <span>Verified Farmer Crop Lots</span>
          </div>
          <h1 className="text-2xl font-extrabold text-[#252A27] tracking-tight">Active Crop Lot Auctions</h1>
          <p className="text-xs text-[#6F756F] font-medium">
            Anonymous bidding marketplace with Sangli Hub 20kg sample validation.
          </p>
        </div>

        {/* Filter Bar */}
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="w-4 h-4 text-[#6F756F] absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search crop, variety, district..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full text-xs pl-9 pr-3 py-2 bg-[#FFFDF8] rounded-md border border-[#CFC9BC] text-[#252A27] focus:outline-none focus:ring-1 focus:ring-[#23483A] focus:border-[#23483A]"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs py-2 px-3 bg-[#FFFDF8] rounded-md border border-[#CFC9BC] text-[#252A27] font-bold"
          >
            <option value="ALL">All Statuses</option>
            <option value="LIVE">Live Bidding Only</option>
            <option value="REGISTRATION_OPEN">Registration Open</option>
          </select>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {filtered.length === 0 ? (
          <div className="col-span-3 p-12 text-center bg-[#FFFDF8] rounded-md border border-[#DDD8CC] text-[#6F756F] text-xs font-medium">
            No crop auctions match your search filter.
          </div>
        ) : (
          filtered.map(auction => (
            <AuctionCard key={auction.id} auction={auction} userRole={currentUser?.role} />
          ))
        )}
      </div>
    </div>
  );
}
