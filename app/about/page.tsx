import React from 'react';
import Link from 'next/link';
import { Sprout, ShieldCheck, Scale, TrendingUp, ArrowRight } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      {/* Header */}
      <div className="text-center space-y-4 max-w-3xl mx-auto">
        <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center mx-auto shadow-lg shadow-emerald-200">
          <Sprout className="w-7 h-7" />
        </div>
        <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">About CropLink</h1>
        <p className="text-base text-slate-600 leading-relaxed">
          CropLink is a commercial B2B agricultural marketplace dedicated to: 
          <strong className="text-emerald-800"> "Strengthening market linkages and price discovery for farmers."</strong>
        </p>
      </div>

      {/* Problem & Solution Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-8 space-y-4">
          <h2 className="text-xl font-bold text-red-700">The Agricultural Market Challenge</h2>
          <p className="text-xs text-slate-600 leading-relaxed">
            Smallholder farmers across India routinely lose 25–40% of produce value due to intermediary exploitation, opaque local mandi pricing, lack of direct corporate linkages, and quality disputes at harvest time.
          </p>
        </div>

        <div className="bg-emerald-950 text-white rounded-3xl p-8 space-y-4 shadow-xl">
          <h2 className="text-xl font-bold text-emerald-400">The CropLink Solution</h2>
          <p className="text-xs text-emerald-100 leading-relaxed">
            By connecting verified farmers directly with verified industrial processors through AGMARKNET price intelligence, 20kg physical sample verification at Sangli hub, anonymous bidding, and enforced legal contracts, CropLink secures maximum value for every crop lot.
          </p>
        </div>
      </div>
    </div>
  );
}
