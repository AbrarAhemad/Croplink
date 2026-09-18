import React from 'react';
import Link from 'next/link';
import { UserCheck, Building2, ShieldCheck, Scale, ArrowRight, CheckCircle2 } from 'lucide-react';

export default function HowItWorksPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10 bg-[#F7F3EA]">
      <div className="text-center space-y-2 max-w-2xl mx-auto border-b border-[#DDD8CC] pb-4">
        <h1 className="text-3xl font-extrabold text-[#252A27] tracking-tight">How CropLink Works</h1>
        <p className="text-xs text-[#6F756F]">
          A step-by-step breakdown of the CropLink marketplace for Farmers and Industrial Buyers.
        </p>
      </div>

      {/* Two Columns: Farmer vs Industry */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Farmer Steps */}
        <div className="bg-[#FFFDF8] rounded-md border border-[#DDD8CC] shadow-sm p-6 space-y-5">
          <div className="flex items-center gap-3 border-b border-[#DDD8CC] pb-3">
            <div className="w-9 h-9 rounded-md bg-[#23483A] text-white flex items-center justify-center font-bold">
              <UserCheck className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-lg font-extrabold text-[#252A27]">Farmer Workflow</h2>
          </div>

          <ol className="space-y-3.5 text-xs text-[#252A27] list-decimal list-inside font-medium leading-relaxed">
            <li><strong className="text-[#23483A]">Register & Upload Docs:</strong> Provide 7/12 land revenue extract and identity proof. Status set to PENDING_APPROVAL.</li>
            <li><strong className="text-[#23483A]">Check AGMARKNET Prices:</strong> Review modal mandi prices to decide reserve base price.</li>
            <li><strong className="text-[#23483A]">Create Crop Lot:</strong> Specify crop, tons, variety, base price, and transport rate.</li>
            <li><strong className="text-[#23483A]">Dispatch 20kg Sample:</strong> Send a 20 kg physical sample to CropLink Sangli Hub.</li>
            <li><strong className="text-[#23483A]">24-Hour Live Auction:</strong> Industry buyers submit anonymous bids (e.g. Bidder #A17).</li>
            <li><strong className="text-[#23483A]">Ground Inspection & Agreement:</strong> Highest bidder inspects lot, signs legal agreement, and arranges transport.</li>
          </ol>
        </div>

        {/* Industry Steps */}
        <div className="bg-[#FFFDF8] rounded-md border border-[#DDD8CC] shadow-sm p-6 space-y-5">
          <div className="flex items-center gap-3 border-b border-[#DDD8CC] pb-3">
            <div className="w-9 h-9 rounded-md bg-[#B65C3A] text-white flex items-center justify-center font-bold">
              <Building2 className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-lg font-extrabold text-[#252A27]">Industry Workflow</h2>
          </div>

          <ol className="space-y-3.5 text-xs text-[#252A27] list-decimal list-inside font-medium leading-relaxed">
            <li><strong className="text-[#B65C3A]">Register & Verify GSTIN:</strong> Upload GST certificate and corporate details.</li>
            <li><strong className="text-[#B65C3A]">Discover Auctions:</strong> Filter lots by crop, quality grade, and approximate farm distance.</li>
            <li><strong className="text-[#B65C3A]">Pay ₹1,999 Fee:</strong> Pay registration fee via Razorpay Test Mode to unlock bidding.</li>
            <li><strong className="text-[#B65C3A]">Submit Anonymous Bids:</strong> Bid competitively with minimum increments.</li>
            <li><strong className="text-[#B65C3A]">3-Day Winner Window:</strong> Accept winner offer, schedule ground verification, or execute agreement.</li>
            <li><strong className="text-[#B65C3A]">Delivery Tracking:</strong> Track truck dispatch from Sangli hub to facility.</li>
          </ol>
        </div>
      </div>
    </div>
  );
}
