'use client';

import React, { useState, useEffect } from 'react';
import { agmarknetService } from '@/lib/market/agmarknet';
import { MarketPriceRecord } from '@/types';
import { Search, Filter, TrendingUp, Calculator, Sprout, MapPin, Calendar, RefreshCw } from 'lucide-react';

export default function MarketPricesPage() {
  const [prices, setPrices] = useState<MarketPriceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [cropFilter, setCropFilter] = useState('');
  const [stateFilter, setStateFilter] = useState('');
  const [districtFilter, setDistrictFilter] = useState('');

  // Suggested price calculator inputs
  const [calcCrop, setCalcCrop] = useState('Turmeric (हल्दी)');
  const [calcGrade, setCalcGrade] = useState('Grade A+');
  const [calcTons, setCalcTons] = useState(25);
  const [calcResult, setCalcResult] = useState<any>(null);

  const fetchPrices = async () => {
    setLoading(true);
    const data = await agmarknetService.getMarketPrices({
      crop: cropFilter || undefined,
      state: stateFilter || undefined,
      district: districtFilter || undefined,
    });
    setPrices(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchPrices();
  }, [cropFilter, stateFilter, districtFilter]);

  const handleCalculatePrice = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await agmarknetService.getSuggestedAuctionPrice(calcCrop, calcGrade, calcTons);
    setCalcResult(res);
  };
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 bg-[#F7F3EA]">
      {/* Header Banner */}
      <div className="bg-[#23483A] text-white p-6 lg:p-8 rounded-md border border-[#23483A] flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-sm">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-white/10 text-white rounded-sm text-xs font-bold border border-white/20">
            <Sprout className="w-3.5 h-3.5 text-[#C99A2E]" />
            <span>AGMARKNET Government Feed Integration</span>
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight">Today&apos;s Mandi Market Price Intelligence</h1>
          <p className="text-xs text-[#DDD8CC] max-w-xl">
            Real-time APMC wholesale price discovery across Indian districts. Use live benchmark prices to set competitive auction base prices.
          </p>
        </div>

        <button
          onClick={fetchPrices}
          className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-md text-xs font-bold border border-white/20 flex items-center gap-2 transition shrink-0"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Data</span>
        </button>
      </div>

      {/* Suggested Auction Price Calculator Card */}
      <div className="bg-[#FFFDF8] rounded-md border border-[#DDD8CC] p-6 space-y-5 shadow-sm">
        <div className="flex items-center gap-2 text-[#23483A] font-extrabold text-base border-b border-[#DDD8CC] pb-3">
          <Calculator className="w-5 h-5 text-[#B65C3A]" />
          <h2>Smart Auction Base Price Recommendation</h2>
        </div>

        <form onSubmit={handleCalculatePrice} className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="text-xs font-bold text-[#252A27] block mb-1">Select Crop</label>
            <select
              value={calcCrop}
              onChange={(e) => setCalcCrop(e.target.value)}
              className="w-full p-2.5 bg-[#FFFDF8] border border-[#CFC9BC] rounded-md text-xs font-bold text-[#252A27] focus:ring-1 focus:ring-[#23483A] focus:border-[#23483A]"
            >
              <option value="Turmeric (हल्दी)">Turmeric (हल्दी)</option>
              <option value="Onion (प्याज)">Onion (प्याज)</option>
              <option value="Tomato (टमाटर)">Tomato (टमाटर)</option>
              <option value="Grapes (अंगूर)">Grapes (अंगूर)</option>
              <option value="Sugarcane (गन्ना)">Sugarcane (गन्ना)</option>
              <option value="Soybean (सोयाबीन)">Soybean (सोयाबीन)</option>
              <option value="Cotton (कपास)">Cotton (कपास)</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-bold text-[#252A27] block mb-1">Quality / Grade</label>
            <select
              value={calcGrade}
              onChange={(e) => setCalcGrade(e.target.value)}
              className="w-full p-2.5 bg-[#FFFDF8] border border-[#CFC9BC] rounded-md text-xs font-bold text-[#252A27] focus:ring-1 focus:ring-[#23483A] focus:border-[#23483A]"
            >
              <option value="Grade A+">Grade A+ (Export Premium)</option>
              <option value="Grade A">Grade A (Standard Commercial)</option>
              <option value="Grade B">Grade B (Processing Grade)</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-bold text-[#252A27] block mb-1">Lot Quantity (Tons)</label>
            <input
              type="number"
              min="1"
              value={calcTons}
              onChange={(e) => setCalcTons(Number(e.target.value))}
              className="w-full p-2.5 bg-[#FFFDF8] border border-[#CFC9BC] rounded-md text-xs font-bold text-[#252A27] focus:ring-1 focus:ring-[#23483A] focus:border-[#23483A]"
            />
          </div>

          <div className="flex items-end">
            <button
              type="submit"
              className="w-full py-2.5 bg-[#23483A] hover:bg-[#1b382d] text-white font-bold rounded-md text-xs transition shadow-sm"
            >
              Calculate Suggested Price
            </button>
          </div>
        </form>

        {calcResult && (
          <div className="p-4 bg-[#faf5e8] rounded-md border border-[#C99A2E]/40 space-y-2 text-xs">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <span className="text-[#6F756F] font-medium block">Suggested Base Price:</span>
                <span className="text-xl font-extrabold text-[#23483A]">
                  ₹{calcResult.suggestedBasePrice.toLocaleString('en-IN')}<span className="text-xs text-[#6F756F]">/ton</span>
                </span>
              </div>
              <div>
                <span className="text-[#6F756F] font-medium block">Recommended Auction Reserve Range:</span>
                <span className="font-extrabold text-[#252A27]">
                  ₹{calcResult.recommendedMinPrice.toLocaleString('en-IN')} – ₹{calcResult.recommendedMaxPrice.toLocaleString('en-IN')} / ton
                </span>
              </div>
            </div>
            <p className="text-[#252A27] text-[11px] font-medium border-t border-[#C99A2E]/20 pt-2">
              {calcResult.reasoning}
            </p>
          </div>
        )}
      </div>

      {/* Filter Controls */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-[#FFFDF8] p-4 rounded-md border border-[#DDD8CC] shadow-sm">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Search className="w-4 h-4 text-[#6F756F]" />
          <input
            type="text"
            placeholder="Search crop or mandi..."
            value={cropFilter}
            onChange={(e) => setCropFilter(e.target.value)}
            className="w-full sm:w-64 text-xs p-2 bg-[#FFFDF8] rounded-md border border-[#CFC9BC] text-[#252A27] focus:ring-1 focus:ring-[#23483A]"
          />
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <select
            value={stateFilter}
            onChange={(e) => setStateFilter(e.target.value)}
            className="text-xs p-2 bg-[#FFFDF8] rounded-md border border-[#CFC9BC] font-bold text-[#252A27]"
          >
            <option value="">All States</option>
            <option value="Maharashtra">Maharashtra</option>
            <option value="Gujarat">Gujarat</option>
            <option value="Karnataka">Karnataka</option>
          </select>

          <select
            value={districtFilter}
            onChange={(e) => setDistrictFilter(e.target.value)}
            className="text-xs p-2 bg-[#FFFDF8] rounded-md border border-[#CFC9BC] font-bold text-[#252A27]"
          >
            <option value="">All Districts</option>
            <option value="Sangli">Sangli</option>
            <option value="Nashik">Nashik</option>
            <option value="Pune">Pune</option>
            <option value="Solapur">Solapur</option>
            <option value="Kolhapur">Kolhapur</option>
          </select>
        </div>
      </div>

      {/* Prices Table */}
      <div className="bg-[#FFFDF8] rounded-md border border-[#DDD8CC] shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#23483A] text-white text-[11px] font-bold uppercase tracking-wider">
                <th className="p-3.5">Crop Name</th>
                <th className="p-3.5">Variety</th>
                <th className="p-3.5">Mandi APMC</th>
                <th className="p-3.5">District / State</th>
                <th className="p-3.5">Min Price</th>
                <th className="p-3.5">Max Price</th>
                <th className="p-3.5">Modal Price</th>
                <th className="p-3.5">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#DDD8CC] text-xs text-[#252A27]">
              {loading ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-[#6F756F]">
                    Loading AGMARKNET live feeds...
                  </td>
                </tr>
              ) : prices.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-[#6F756F]">
                    No mandi records matching search criteria.
                  </td>
                </tr>
              ) : (
                prices.map(row => (
                  <tr key={row.id} className="hover:bg-[#F7F3EA] transition">
                    <td className="p-3.5 font-extrabold text-[#252A27]">{row.crop}</td>
                    <td className="p-3.5 font-semibold text-[#6F756F]">{row.variety}</td>
                    <td className="p-3.5 font-bold text-[#23483A]">{row.mandi}</td>
                    <td className="p-3.5 text-[#6F756F]">{row.district}, {row.state}</td>
                    <td className="p-3.5 font-bold text-[#6F756F]">₹{row.minPrice.toLocaleString('en-IN')}</td>
                    <td className="p-3.5 font-bold text-[#6F756F]">₹{row.maxPrice.toLocaleString('en-IN')}</td>
                    <td className="p-3.5 font-extrabold text-[#C99A2E] text-sm">
                      ₹{row.modalPrice.toLocaleString('en-IN')}<span className="text-[10px] text-[#6F756F] font-normal">/ton</span>
                    </td>
                    <td className="p-3.5 text-[#6F756F]">{row.date}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
