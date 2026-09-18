'use client';

import React, { useState, use } from 'react';
import { useAppStore } from '@/lib/store/use-app-store';
import { RazorpayModal } from '@/components/payments/RazorpayModal';
import { getApproximateDistanceBetweenLocations } from '@/lib/maps/distance';
import { 
  Sprout, ShieldCheck, MapPin, Clock, Scale, Truck, CheckCircle2, 
  AlertCircle, ChevronLeft, CreditCard, Lock, Shield, Eye, RefreshCw, UserCheck 
} from 'lucide-react';
import Link from 'next/link';
import { SampleStatus } from '@/types';
import { getFarmerIdentityView, getIndustryIdentityView } from '@/lib/identity-helpers';
import { AuctionCountdown } from '@/components/auction/AuctionCountdown';

interface AuctionDetailPageProps {
  params: Promise<{ id: string }>;
  forcedRole?: 'ADMIN' | 'FARMER' | 'INDUSTRY';
  forcedBackHref?: string;
}

export default function AuctionDetailPage({ params, forcedRole, forcedBackHref }: AuctionDetailPageProps) {
  const { id } = use(params);
  const { auctions, bids, registrations, currentUser, farmerProfile, placeBid, registerForAuction, updateSampleStatus, settings } = useAppStore();

  const auction = auctions.find(a => a.id === id);
  const userRole = forcedRole || currentUser?.role || 'FARMER';
  const defaultBackHref = userRole === 'ADMIN' ? '/admin/auctions' : userRole === 'INDUSTRY' ? '/industry/auctions' : '/farmer/auctions';
  const backHref = forcedBackHref || defaultBackHref;

  const auctionBids = bids.filter(b => b.auctionId === id).sort((a, b) => b.amountPerTon - a.amountPerTon);
  const auctionRegistrations = registrations.filter(r => r.auctionId === id && r.status === 'PAID');
  const isRegistered = currentUser ? registrations.some(r => r.auctionId === id && r.industryId === currentUser.id && r.status === 'PAID') : false;

  const [bidInput, setBidInput] = useState<number>(0);
  const [showRazorpayModal, setShowRazorpayModal] = useState(false);
  const [bidError, setBidError] = useState<string | null>(null);
  const [bidSuccess, setBidSuccess] = useState<string | null>(null);

  if (!auction) {
    return (
      <div className="max-w-4xl mx-auto p-12 text-center space-y-4">
        <h2 className="text-2xl font-extrabold text-slate-900">Auction Lot Not Found</h2>
        <p className="text-xs text-slate-500 font-medium">
          The requested auction lot (<code className="font-mono font-bold text-slate-700">{id}</code>) does not exist or has been removed.
        </p>
        <Link href={backHref} className="inline-flex items-center gap-1 text-xs px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition">
          <ChevronLeft className="w-4 h-4" />
          <span>Return to Auctions List</span>
        </Link>
      </div>
    );
  }

  const farmerView = getFarmerIdentityView(auction, userRole, farmerProfile, currentUser?.id);
  const isOwner = currentUser?.id ? auction.farmerId === currentUser.id : false;
  const approxDistance = getApproximateDistanceBetweenLocations(auction.locationArea, 'Mumbai');
  const minRequiredBid = Math.max(auction.basePricePerTon, (auction.currentHighestBid || 0) + settings.minimumBidIncrementInr);
  const isTimerExpired = auction.auctionEndsAt ? new Date(auction.auctionEndsAt).getTime() <= Date.now() : false;

  const handleBidSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBidError(null);
    setBidSuccess(null);

    const res = placeBid(auction.id, Number(bidInput));
    if (!res.success) {
      setBidError(res.error || 'Failed to submit bid');
    } else {
      setBidSuccess(`Your anonymous bid of ₹${Number(bidInput).toLocaleString('en-IN')}/ton was successfully placed!`);
      setBidInput(0);
    }
  };

  const handleRazorpaySuccess = (paymentId: string) => {
    registerForAuction(auction.id, paymentId);
    setShowRazorpayModal(false);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 bg-[#F7F3EA]">
      {/* Back Link */}
      <Link href={backHref} className="inline-flex items-center gap-1 text-xs font-bold text-[#6F756F] hover:text-[#252A27] transition">
        <ChevronLeft className="w-4 h-4 text-[#23483A]" />
        <span>Back to Auctions</span>
      </Link>

      {/* 24-Hour Live Auction Countdown & Registration Deadline */}
      <AuctionCountdown auction={auction} />

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Lot Info & Anonymous/Unmasked History */}
        <div className="lg:col-span-8 space-y-6">
          {/* Main Card */}
          <div className="bg-[#FFFDF8] rounded-md border border-[#DDD8CC] p-6 lg:p-8 space-y-6 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#DDD8CC] pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-[#23483A] bg-[#e8f0ec] px-2.5 py-1 rounded-sm border border-[#23483A]/20">
                    {auction.crop}
                  </span>
                  <span className="text-xs font-bold text-[#B65C3A] bg-[#fbf0ec] px-2 py-0.5 rounded-sm border border-[#B65C3A]/30">{auction.qualityGrade}</span>
                </div>
                <h1 className="text-2xl font-extrabold text-[#252A27] mt-1">{auction.variety}</h1>
              </div>

              {/* FARMER IDENTITY DISPLAY (Role & Ownership Aware) */}
              <div className="text-right">
                {userRole === 'ADMIN' ? (
                  <div className="bg-[#F7F3EA] p-2.5 rounded-md border border-[#DDD8CC] text-right">
                    <span className="text-[10px] font-extrabold text-[#23483A] uppercase tracking-wider block">Farmer (Real Identity)</span>
                    <span className="text-sm font-extrabold text-[#252A27] block">{farmerView.fullName}</span>
                    <span className="text-[11px] font-semibold text-[#6F756F] block">{farmerView.farmName}</span>
                    <span className="text-[10px] text-[#6F756F] block">{farmerView.locationDisplay}</span>
                  </div>
                ) : userRole === 'FARMER' && isOwner ? (
                  <div className="bg-[#e8f0ec] p-2.5 rounded-md border border-[#3F7655]/30 text-right">
                    <span className="text-[10px] font-extrabold text-[#3F7655] uppercase tracking-wider block">Your Crop Lot Listing</span>
                    <span className="text-sm font-extrabold text-[#252A27] block">{farmerView.farmName}</span>
                    <span className="text-[11px] text-[#6F756F] block">{farmerView.locationDisplay}</span>
                  </div>
                ) : (
                  <div>
                    <span className="text-xs text-[#6F756F] block font-medium">Farmer Anonymous ID</span>
                    <span className="text-sm font-bold text-[#252A27] flex items-center gap-1 justify-end">
                      <ShieldCheck className="w-4 h-4 text-[#23483A]" />
                      {farmerView.displayName}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Description & Lot Details */}
            <div className="space-y-2 text-xs text-[#6F756F] leading-relaxed">
              <h3 className="font-bold text-[#252A27] text-sm">Lot Description</h3>
              <p className="bg-[#F7F3EA] p-4 rounded-md border border-[#DDD8CC]/70 text-[#252A27]">{auction.description}</p>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="p-4 bg-[#F7F3EA] rounded-md border border-[#DDD8CC]">
                <span className="text-[#6F756F] text-[11px] block font-medium">Lot Volume</span>
                <span className="font-extrabold text-[#252A27] text-base">{auction.quantityTons} Tons</span>
              </div>
              <div className="p-4 bg-[#F7F3EA] rounded-md border border-[#DDD8CC]">
                <span className="text-[#6F756F] text-[11px] block font-medium">Base Price / Ton</span>
                <span className="font-extrabold text-[#252A27] text-base">₹{auction.basePricePerTon.toLocaleString('en-IN')}</span>
              </div>
              <div className="p-4 bg-[#faf5e8] rounded-md border border-[#C99A2E]/40">
                <span className="text-[#C99A2E] text-[11px] block font-bold">Highest Bid</span>
                <span className="font-extrabold text-[#252A27] text-base">
                  {auction.currentHighestBid ? `₹${auction.currentHighestBid.toLocaleString('en-IN')}` : 'No Bids'}
                </span>
              </div>
              <div className="p-4 bg-[#F7F3EA] rounded-md border border-[#DDD8CC]">
                <span className="text-[#6F756F] text-[11px] block font-medium">Distance</span>
                <span className="font-extrabold text-[#252A27] text-base">~{approxDistance} km</span>
              </div>
            </div>

            {/* Sangli Hub 20kg Sample Status Tracker */}
            <div className="p-5 bg-[#F7F3EA] rounded-md border border-[#DDD8CC] space-y-3">
              <h3 className="font-bold text-xs text-[#252A27] uppercase tracking-wider flex items-center justify-between">
                <span>CropLink Sangli Hub 20kg Sample Status</span>
                <span className="text-[#3F7655] font-extrabold">{auction.sampleStatus.replace(/_/g, ' ')}</span>
              </h3>
              <div className="grid grid-cols-4 gap-2 text-[10px] font-bold text-center">
                <div className={`p-2 rounded-md border ${['SENT', 'RECEIVED', 'VERIFIED', 'FORWARDED_TO_INDUSTRY'].includes(auction.sampleStatus) ? 'bg-[#e8f0ec] border-[#3F7655] text-[#3F7655]' : 'bg-[#FFFDF8] text-[#6F756F] border-[#DDD8CC]'}`}>
                  1. Dispatch
                </div>
                <div className={`p-2 rounded-md border ${['RECEIVED', 'VERIFIED', 'FORWARDED_TO_INDUSTRY'].includes(auction.sampleStatus) ? 'bg-[#e8f0ec] border-[#3F7655] text-[#3F7655]' : 'bg-[#FFFDF8] text-[#6F756F] border-[#DDD8CC]'}`}>
                  2. Hub Receipt
                </div>
                <div className={`p-2 rounded-md border ${['VERIFIED', 'FORWARDED_TO_INDUSTRY'].includes(auction.sampleStatus) ? 'bg-[#e8f0ec] border-[#3F7655] text-[#3F7655]' : 'bg-[#FFFDF8] text-[#6F756F] border-[#DDD8CC]'}`}>
                  3. Quality Test
                </div>
                <div className={`p-2 rounded-md border ${auction.sampleStatus === 'FORWARDED_TO_INDUSTRY' ? 'bg-[#e8f0ec] border-[#3F7655] text-[#3F7655]' : 'bg-[#FFFDF8] text-[#6F756F] border-[#DDD8CC]'}`}>
                  4. Forwarded
                </div>
              </div>
            </div>
          </div>

          {/* Bid History Table (ROLE-AWARE ANONYMIZATION) */}
          <div className="bg-[#FFFDF8] rounded-md border border-[#DDD8CC] p-6 space-y-4 shadow-sm">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-base text-[#252A27] flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-[#23483A]" />
                <span>Bid Log ({auctionBids.length})</span>
              </h3>
              {userRole === 'ADMIN' ? (
                <span className="text-[10px] font-bold uppercase px-2 py-0.5 bg-[#F7F3EA] text-[#252A27] border border-[#DDD8CC] rounded-sm">
                  Admin Operational View (Real Corporate Identities Unmasked)
                </span>
              ) : (
                <span className="text-[10px] font-medium text-[#6F756F]">
                  Anonymous Bidding Active
                </span>
              )}
            </div>

            <div className="overflow-x-auto border border-[#DDD8CC] rounded-md">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#F7F3EA] text-[11px] font-bold text-[#6F756F] uppercase border-b border-[#DDD8CC]">
                    <th className="p-3">Bidder</th>
                    {userRole === 'ADMIN' && <th className="p-3">Contact Person</th>}
                    <th className="p-3">Bid Amount / Ton</th>
                    <th className="p-3">Total Value</th>
                    <th className="p-3">Timestamp</th>
                    <th className="p-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#DDD8CC] text-xs">
                  {auctionBids.length === 0 ? (
                    <tr>
                      <td colSpan={userRole === 'ADMIN' ? 6 : 5} className="p-6 text-center text-[#6F756F] bg-[#FFFDF8]">
                        No bids placed yet for this auction.
                      </td>
                    </tr>
                  ) : (
                    auctionBids.map(bid => {
                      const industryView = getIndustryIdentityView(bid, userRole);

                      return (
                        <tr key={bid.id} className="hover:bg-[#F7F3EA] bg-[#FFFDF8]">
                          {/* Bidder Column: Real Company for Admin, Anonymous ID for Farmer/Industry */}
                          <td className="p-3 font-bold text-[#252A27]">
                            {userRole === 'ADMIN' ? (
                              <div>
                                <span className="text-[#23483A] block">{industryView.companyName}</span>
                                <span className="text-[10px] font-mono text-[#6F756F] block">{bid.anonymousBidderId} · GST: {industryView.gstNumber}</span>
                              </div>
                            ) : (
                              <span>{industryView.displayName}</span>
                            )}
                          </td>

                          {userRole === 'ADMIN' && (
                            <td className="p-3 font-semibold text-[#6F756F]">
                              {industryView.contactPerson}
                            </td>
                          )}

                          <td className="p-3 font-extrabold text-[#3F7655]">₹{bid.amountPerTon.toLocaleString('en-IN')}</td>
                          <td className="p-3 font-semibold text-[#252A27]">₹{bid.totalAmount.toLocaleString('en-IN')}</td>
                          <td className="p-3 text-[#6F756F]">{new Date(bid.createdAt).toLocaleTimeString('en-IN')}</td>
                          <td className="p-3">
                            <span className={`px-2 py-0.5 rounded-sm text-[10px] font-bold ${bid.status === 'ACTIVE' || bid.status === 'WINNER_SELECTED' ? 'bg-[#e8f0ec] text-[#3F7655] border border-[#3F7655]/30' : 'bg-[#F7F3EA] text-[#6F756F] border border-[#DDD8CC]'}`}>
                              {bid.status}
                            </span>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Column: ROLE-SPECIFIC CONTROL PANEL */}
        <div className="lg:col-span-4 space-y-6">

          {/* 1. ADMIN ROLE PANEL */}
          {userRole === 'ADMIN' && (
            <div className="bg-[#FFFDF8] rounded-md border border-[#DDD8CC] p-6 space-y-5 sticky top-24 shadow-sm">
              <div className="flex items-center justify-between border-b border-[#DDD8CC] pb-3">
                <div className="flex items-center gap-2">
                  <Shield className="w-5 h-5 text-[#23483A]" />
                  <h3 className="font-extrabold text-base text-[#252A27] uppercase tracking-wide">
                    Admin Operational Control
                  </h3>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 bg-[#252A27] text-white rounded-sm">
                  ADMIN ONLY
                </span>
              </div>

              {/* Admin Metrics Snapshot */}
              <div className="space-y-3 bg-[#F7F3EA] p-4 rounded-md border border-[#DDD8CC] text-xs">
                <div className="flex justify-between">
                  <span className="text-[#6F756F] font-medium">Auction Status:</span>
                  <span className="font-extrabold text-[#23483A] bg-[#e8f0ec] px-2 py-0.5 rounded-sm text-[11px] border border-[#23483A]/30">
                    {auction.status}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#6F756F] font-medium">Registered Industries:</span>
                  <span className="font-bold text-[#252A27]">{auctionRegistrations.length} Paid</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#6F756F] font-medium">Current Highest Bid:</span>
                  <span className="font-extrabold text-[#3F7655]">
                    {auction.currentHighestBid ? `₹${auction.currentHighestBid.toLocaleString('en-IN')} / ton` : 'No Bids'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#6F756F] font-medium">Total Bids Placed:</span>
                  <span className="font-bold text-[#252A27]">{auctionBids.length} Bids</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#6F756F] font-medium">Sample Status:</span>
                  <span className="font-bold text-[#252A27]">{auction.sampleStatus}</span>
                </div>
              </div>

              {/* Admin Operations Controls */}
              <div className="space-y-2 pt-1">
                <label className="text-xs font-bold text-[#252A27] block">Override Sangli Hub Sample Status</label>
                <select
                  value={auction.sampleStatus}
                  onChange={(e) => updateSampleStatus(auction.id, e.target.value as SampleStatus)}
                  className="w-full text-xs p-2.5 bg-[#FFFDF8] border border-[#CFC9BC] rounded-md font-bold text-[#252A27] focus:ring-1 focus:ring-[#23483A] focus:border-[#23483A]"
                >
                  <option value="NOT_SENT">NOT_SENT</option>
                  <option value="SENT">SENT to Hub</option>
                  <option value="RECEIVED">RECEIVED at Sangli Hub</option>
                  <option value="VERIFIED">VERIFIED (Passed Quality Test)</option>
                  <option value="FORWARDED_TO_INDUSTRY">FORWARDED TO INDUSTRY</option>
                </select>
              </div>

              <div className="p-3 bg-[#F7F3EA] rounded-md border border-[#DDD8CC] text-[11px] text-[#6F756F] space-y-1">
                <span className="font-bold text-[#252A27] block">🔒 Operational Guard:</span>
                <p>Admin accounts oversee master state, real bidder identities, and ground inspections. Admin accounts cannot initiate ₹1,999 registration payments or place bidder offers.</p>
              </div>
            </div>
          )}

          {/* 2. FARMER ROLE PANEL */}
          {userRole === 'FARMER' && (
            <div className="bg-[#FFFDF8] rounded-md border border-[#DDD8CC] p-6 space-y-5 sticky top-24 shadow-sm">
              <div className="flex items-center justify-between border-b border-[#DDD8CC] pb-3">
                <div className="flex items-center gap-2">
                  <Sprout className="w-5 h-5 text-[#23483A]" />
                  <h3 className="font-extrabold text-base text-[#252A27]">
                    {isOwner ? 'My Auction Overview' : 'Farmer Auction Overview'}
                  </h3>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 bg-[#e8f0ec] text-[#23483A] rounded-sm border border-[#23483A]/30">
                  {isOwner ? 'FARMER OWNER' : 'FARMER VIEW'}
                </span>
              </div>

              {/* Farmer Metrics Snapshot */}
              <div className="space-y-3 bg-[#F7F3EA] p-4 rounded-md border border-[#DDD8CC] text-xs">
                <div className="flex justify-between">
                  <span className="text-[#6F756F] font-medium">Auction Status:</span>
                  <span className="font-extrabold text-[#23483A] bg-[#e8f0ec] px-2 py-0.5 rounded-sm text-[11px]">
                    {auction.status.replace(/_/g, ' ')}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#6F756F] font-medium">Registered Industry Buyers:</span>
                  <span className="font-bold text-[#252A27]">{auctionRegistrations.length} Buyers</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#6F756F] font-medium">Highest Current Bid:</span>
                  <span className="font-extrabold text-[#3F7655]">
                    {auction.currentHighestBid ? `₹${auction.currentHighestBid.toLocaleString('en-IN')}/ton` : 'No Bids Received'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#6F756F] font-medium">Sangli 20kg Sample:</span>
                  <span className="font-bold text-[#3F7655]">{auction.sampleStatus}</span>
                </div>
              </div>

              {/* Farmer Fee Exemption Notice */}
              <div className="p-3 bg-[#e8f0ec] rounded-md border border-[#3F7655]/30 text-[11px] text-[#23483A] space-y-1">
                <div className="flex items-center gap-1.5 font-bold">
                  <CheckCircle2 className="w-4 h-4 text-[#3F7655]" />
                  <span>Farmer Auction Privilege (₹0 Fee)</span>
                </div>
                <p>Farmers list crop lots and receive anonymous industry bids with zero registration charges.</p>
              </div>

              {isOwner && (
                <Link
                  href="/farmer/deals"
                  className="w-full py-3 bg-[#23483A] hover:bg-[#1b382d] text-white font-bold rounded-md text-xs shadow-sm flex items-center justify-center gap-2 transition"
                >
                  <Scale className="w-4 h-4" />
                  <span>View Winner Verification & Deals</span>
                </Link>
              )}
            </div>
          )}

          {/* 3. INDUSTRY ROLE PANEL */}
          {userRole === 'INDUSTRY' && (
            <div className="bg-[#FFFDF8] rounded-md border border-[#DDD8CC] p-6 space-y-5 sticky top-24 shadow-sm">
              <h3 className="font-extrabold text-base text-[#252A27] border-b border-[#DDD8CC] pb-3">
                Industry Bidding Panel
              </h3>

              {/* Registration Fee Lock Notice */}
              {!isRegistered ? (
                <div className="p-4 bg-[#faf5e8] rounded-md border border-[#C99A2E]/40 space-y-3">
                  <div className="flex items-start gap-2.5">
                    <Lock className="w-4 h-4 text-[#C99A2E] shrink-0 mt-0.5" />
                    <div className="space-y-1">
                      <h4 className="font-bold text-xs text-[#252A27]">Auction Registration Required</h4>
                      <p className="text-[11px] text-[#6F756F] leading-relaxed">
                        Pay ₹1,999 sample processing & platform fee to register and participate in bidding for this lot.
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => setShowRazorpayModal(true)}
                    className="w-full py-2.5 bg-[#23483A] hover:bg-[#1b382d] text-white font-bold rounded-md text-xs transition flex items-center justify-center gap-2"
                  >
                    <CreditCard className="w-4 h-4" />
                    <span>Pay ₹1,999 & Register</span>
                  </button>
                </div>
              ) : (
                <div className="p-3 bg-[#e8f0ec] text-[#23483A] rounded-md border border-[#3F7655]/30 text-xs font-bold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#3F7655]" />
                  <span>Registration Confirmed (Your registration is active.)</span>
                </div>
              )}

              {/* Interactive Bid Form */}
              {isRegistered && auction.status === 'AUCTION_LIVE' && !isTimerExpired && (
                <form onSubmit={handleBidSubmit} className="space-y-4">
                  <div>
                    <label className="text-xs font-bold text-[#252A27] block mb-1">
                      Enter Bid Amount (₹/ton)
                    </label>
                    <p className="text-[10px] text-[#6F756F] mb-2">
                      Minimum allowed bid: <strong>₹{minRequiredBid.toLocaleString('en-IN')}/ton</strong>
                    </p>
                    <input
                      type="number"
                      step="500"
                      min={minRequiredBid}
                      value={bidInput || ''}
                      onChange={(e) => setBidInput(Number(e.target.value))}
                      placeholder={`e.g. ${minRequiredBid}`}
                      className="w-full p-2.5 bg-[#FFFDF8] border border-[#CFC9BC] rounded-md text-sm font-bold text-[#252A27] focus:ring-1 focus:ring-[#23483A] focus:border-[#23483A]"
                    />
                  </div>

                  {bidError && (
                    <div className="p-3 bg-[#f9eceb] text-[#A94A3F] text-xs rounded-md border border-[#A94A3F]/30 font-bold">
                      {bidError}
                    </div>
                  )}

                  {bidSuccess && (
                    <div className="p-3 bg-[#e8f0ec] text-[#3F7655] text-xs rounded-md border border-[#3F7655]/30 font-bold">
                      {bidSuccess}
                    </div>
                  )}

                  <button
                    type="submit"
                    className="w-full py-3 bg-[#23483A] hover:bg-[#1b382d] text-white font-bold rounded-md text-xs transition shadow-sm"
                  >
                    Submit Anonymous Bid
                  </button>
                </form>
              )}

              {isRegistered && auction.status === 'AUCTION_LIVE' && isTimerExpired && (
                <div className="p-4 bg-[#F7F3EA] rounded-md border border-[#DDD8CC] text-center space-y-1">
                  <div className="text-xs font-extrabold text-[#252A27] uppercase tracking-wide">24-Hour Bidding Period Ended</div>
                  <p className="text-[11px] text-[#6F756F]">The 24-hour live bidding window has concluded for this crop lot. Bidding is now closed.</p>
                </div>
              )}

              {/* Info Notice */}
              <div className="text-[11px] text-[#6F756F] space-y-1 border-t border-[#DDD8CC] pt-3">
                <p>• Highest bid at auction end gets first ground verification offer.</p>
                <p>• 3-day response window before approaching 2nd highest bidder.</p>
              </div>
            </div>
          )}

        </div>
      </div>

      {/* Razorpay Modal for Industry Buyers only */}
      {userRole === 'INDUSTRY' && (
        <RazorpayModal
          auctionId={auction.id}
          cropName={auction.crop}
          feeAmount={1999}
          isOpen={showRazorpayModal}
          onClose={() => setShowRazorpayModal(false)}
          onSuccess={handleRazorpaySuccess}
        />
      )}
    </div>
  );
}
