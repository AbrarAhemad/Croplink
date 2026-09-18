'use client';

import React, { useState } from 'react';
import { useAppStore } from '@/lib/store/use-app-store';
import { ShieldCheck, CheckCircle2, XCircle, Calendar, Clock, AlertTriangle } from 'lucide-react';

export default function IndustryVerificationsPage() {
  const { auctions, verifications, respondToWinnerOffer, scheduleGroundVerification, completeGroundVerification, settings } = useAppStore();

  const winnerAuctions = auctions.filter(a => a.status === 'WINNER_PENDING_VERIFICATION' || a.status === 'GROUND_VERIFICATION');

  const [scheduleDate, setScheduleDate] = useState('2026-09-20');
  const [notes, setNotes] = useState('Quality inspection team scheduled to verify moisture content and grade sample.');
  const [cancelReason, setCancelReason] = useState('');
  const [selectedAuctionId, setSelectedAuctionId] = useState<string | null>(null);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Winner Selection & Ground Verifications</h1>
        <p className="text-xs text-slate-500 font-medium">
          Highest rank bidder has a <strong>3-day window</strong> to accept offer, schedule ground verification, or pass to 2nd & 3rd fallback bidders.
        </p>
      </div>

      {/* Offers & Verification Queue */}
      <div className="space-y-6">
        <h2 className="font-extrabold text-lg text-slate-900 flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-purple-600" />
          <span>Pending Offers & Inspection Workflows ({winnerAuctions.length})</span>
        </h2>

        {winnerAuctions.length === 0 ? (
          <div className="bg-white rounded-3xl border border-slate-200 p-8 text-center text-slate-400 text-xs">
            No pending winner verifications active right now.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {winnerAuctions.map(auc => {
              const gv = verifications.find(v => v.auctionId === auc.id);
              const rankIndex = (auc.activeRankBidderIndex || 0) + 1;

              return (
                <div key={auc.id} className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-5">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <div>
                      <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        {auc.crop}
                      </span>
                      <h3 className="font-extrabold text-base text-slate-900 mt-1">{auc.variety}</h3>
                    </div>

                    <span className="px-3 py-1 bg-purple-100 text-purple-800 border border-purple-200 rounded-full text-xs font-bold">
                      Rank #{rankIndex} Offer
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-xs bg-slate-50 p-3 rounded-2xl">
                    <div>
                      <span className="text-slate-400 block font-medium">Winning Bid Price</span>
                      <span className="font-bold text-slate-900">₹{(auc.currentHighestBid || auc.basePricePerTon).toLocaleString('en-IN')}/ton</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block font-medium">3-Day Response Deadline</span>
                      <span className="font-bold text-amber-700">3 Days Remaining</span>
                    </div>
                  </div>

                  {/* Actions depending on state */}
                  {auc.status === 'WINNER_PENDING_VERIFICATION' && (
                    <div className="space-y-3 pt-2">
                      <p className="text-xs text-slate-600 font-medium">
                        You hold the <strong>Rank #{rankIndex} Highest Bid</strong>. Accept offer to send ground verification team or reject to pass to fallback bidders.
                      </p>

                      <div className="grid grid-cols-2 gap-3">
                        <button
                          onClick={() => respondToWinnerOffer(auc.id, true)}
                          className="py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs shadow-sm flex items-center justify-center gap-1 transition"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Accept Offer & Inspect</span>
                        </button>

                        <button
                          onClick={() => respondToWinnerOffer(auc.id, false)}
                          className="py-2.5 bg-slate-100 hover:bg-red-50 text-slate-700 hover:text-red-700 font-bold rounded-xl text-xs border border-slate-200 transition"
                        >
                          <span>Reject Offer</span>
                        </button>
                      </div>
                    </div>
                  )}

                  {auc.status === 'GROUND_VERIFICATION' && (
                    <div className="space-y-4 pt-2">
                      <div className="p-3 bg-blue-50 text-blue-900 rounded-xl border border-blue-200 text-xs font-semibold flex items-center gap-2">
                        <ShieldCheck className="w-4 h-4 text-blue-600" />
                        <span>Ground Inspection In Progress (Status: {gv?.status || 'REQUESTED'})</span>
                      </div>

                      {gv?.status === 'REQUESTED' && (
                        <div className="space-y-3 bg-slate-50 p-4 rounded-2xl border border-slate-200 text-xs">
                          <label className="font-bold text-slate-700 block">Schedule Inspection Date</label>
                          <input
                            type="date"
                            value={scheduleDate}
                            onChange={(e) => setScheduleDate(e.target.value)}
                            className="w-full p-2 bg-white rounded-lg border border-slate-200 font-medium"
                          />
                          <button
                            onClick={() => scheduleGroundVerification(auc.id, scheduleDate, notes)}
                            className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition"
                          >
                            Schedule Inspection Visit
                          </button>
                        </div>
                      )}

                      {gv?.status === 'SCHEDULED' && (
                        <div className="space-y-3">
                          <div className="grid grid-cols-2 gap-2">
                            <button
                              onClick={() => completeGroundVerification(gv.id, 'PASSED')}
                              className="py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition"
                            >
                              Pass Inspection & Create Deal
                            </button>

                            <button
                              onClick={() => setSelectedAuctionId(auc.id)}
                              className="py-2.5 bg-red-50 hover:bg-red-100 text-red-700 font-bold text-xs rounded-xl border border-red-200 transition"
                            >
                              Cancel Deal (₹{settings.cancellationFeeInr} Fee)
                            </button>
                          </div>

                          {selectedAuctionId === auc.id && (
                            <div className="p-4 bg-red-50 rounded-2xl border border-red-200 space-y-3 text-xs">
                              <div className="flex items-center gap-1.5 font-bold text-red-900">
                                <AlertTriangle className="w-4 h-4 text-red-600" />
                                <span>Cancellation Policy Notice</span>
                              </div>
                              <p className="text-[11px] text-red-800">
                                Cancelling after ground verification incurs a <strong>₹{settings.cancellationFeeInr} fee</strong>. Reason required.
                              </p>
                              <textarea
                                placeholder="Enter cancellation reason..."
                                value={cancelReason}
                                onChange={(e) => setCancelReason(e.target.value)}
                                className="w-full p-2 bg-white rounded-lg border border-red-200 font-medium"
                              />
                              <button
                                onClick={() => {
                                  completeGroundVerification(gv.id, 'CANCELLED', cancelReason);
                                  setSelectedAuctionId(null);
                                }}
                                className="w-full py-2 bg-red-600 text-white font-bold rounded-lg transition"
                              >
                                Confirm Cancellation
                              </button>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
