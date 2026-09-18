'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAppStore } from '@/lib/store/use-app-store';
import { agmarknetService } from '@/lib/market/agmarknet';
import { calculateAuctionTimelines } from '@/lib/auction/lifecycle';
import { PlusCircle, Sprout, MapPin, Calculator, ShieldCheck, CheckCircle2 } from 'lucide-react';

export default function CreateAuctionPage() {
  const router = useRouter();
  const { createAuction, settings, farmerProfile } = useAppStore();

  const [crop, setCrop] = useState('Turmeric (हल्दी)');
  const [variety, setVariety] = useState('Rajapuri Finger');
  const [quantityTons, setQuantityTons] = useState(25);
  const [qualityGrade, setQualityGrade] = useState('Grade A+');
  const [harvestDate, setHarvestDate] = useState('2026-09-15');
  const [locationArea, setLocationArea] = useState('Sangli APMC Region, Maharashtra');
  const [description, setDescription] = useState('Sun dried turmeric fingers, high curcumin 4.8%, double polished.');
  const [basePricePerTon, setBasePricePerTon] = useState(150000);
  const [transportPricePer100Km, setTransportPricePer100Km] = useState(600);
  const [registrationDurationDays, setRegistrationDurationDays] = useState(4);

  const [calcData, setCalcData] = useState<any>(null);

  const handleFetchRecommendation = async () => {
    const res = await agmarknetService.getSuggestedAuctionPrice(crop, qualityGrade, quantityTons);
    setCalcData(res);
    setBasePricePerTon(res.suggestedBasePrice);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const timelines = calculateAuctionTimelines(registrationDurationDays);

    const newAuction = createAuction({
      farmerId: farmerProfile.userId,
      crop,
      variety,
      quantityTons,
      qualityGrade,
      harvestDate,
      locationArea,
      description,
      basePricePerTon,
      transportPricePer100Km,
      registrationDurationDays,
      registrationEndsAt: timelines.registrationEndsAt,
      sampleProcessingEndsAt: timelines.sampleProcessingEndsAt,
      auctionStartsAt: timelines.auctionStartsAt,
      auctionEndsAt: timelines.auctionEndsAt,
    });

    router.push(`/farmer/auctions/${newAuction.id}`);
  };

  return (
    <div className="max-w-3xl mx-auto py-10 px-4 sm:px-6 space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full text-xs font-semibold">
          <Sprout className="w-3.5 h-3.5 text-emerald-600" />
          <span>Crop Lot Auction Setup</span>
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Create Crop Lot Auction</h1>
        <p className="text-xs text-slate-500 font-medium">
          List your crop lot, get AGMARKNET price recommendations, and dispatch a 20kg sample to CropLink hub in Sangli.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 lg:p-8 space-y-6">
        {/* Section 1: Crop Lot Info */}
        <div className="space-y-4">
          <h3 className="font-bold text-sm text-slate-900 border-b border-slate-100 pb-2">1. Crop Produce Details</h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Crop Type</label>
              <select
                value={crop}
                onChange={(e) => setCrop(e.target.value)}
                className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:ring-2 focus:ring-emerald-500"
              >
                <option value="Turmeric (हल्दी)">Turmeric (हल्दी)</option>
                <option value="Onion (प्याज)">Onion (प्याज)</option>
                <option value="Tomato (टमाटर)">Tomato (टमाटर)</option>
                <option value="Grapes (अंगूर)">Grapes (अंगूर)</option>
                <option value="Sugarcane (गन्ना)">Sugarcane (गन्ना)</option>
                <option value="Soybean (सोयाबीन)">Soybean (सोयाबीन)</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Variety</label>
              <input
                type="text"
                required
                value={variety}
                onChange={(e) => setVariety(e.target.value)}
                className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Lot Quantity (Tons)</label>
              <input
                type="number"
                required
                min="1"
                value={quantityTons}
                onChange={(e) => setQuantityTons(Number(e.target.value))}
                className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Quality Grade</label>
              <select
                value={qualityGrade}
                onChange={(e) => setQualityGrade(e.target.value)}
                className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:ring-2 focus:ring-emerald-500"
              >
                <option value="Grade A+">Grade A+ (Curcumin High / Export Premium)</option>
                <option value="Grade A">Grade A (Standard Commercial)</option>
                <option value="Grade B">Grade B (Processing Grade)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Section 2: AGMARKNET Reference & Pricing */}
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <h3 className="font-bold text-sm text-slate-900">2. Base Price & Transport Rates</h3>
            <button
              type="button"
              onClick={handleFetchRecommendation}
              className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-lg border border-emerald-200 hover:bg-emerald-100 transition flex items-center gap-1"
            >
              <Calculator className="w-3.5 h-3.5" />
              <span>Get AGMARKNET Price Suggestion</span>
            </button>
          </div>

          {calcData && (
            <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-xs text-emerald-900 space-y-1">
              <span className="font-bold">AGMARKNET Recommendation:</span>
              <p>{calcData.reasoning}</p>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Base Price per Ton (₹)</label>
              <input
                type="number"
                required
                step="500"
                value={basePricePerTon}
                onChange={(e) => setBasePricePerTon(Number(e.target.value))}
                className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Transportation Rate (₹ per 100 km)</label>
              <input
                type="number"
                required
                value={transportPricePer100Km}
                onChange={(e) => setTransportPricePer100Km(Number(e.target.value))}
                className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>
        </div>

        {/* Section 3: Registration Duration */}
        <div className="space-y-4">
          <h3 className="font-bold text-sm text-slate-900 border-b border-slate-100 pb-2">3. Registration Period (3–7 Days)</h3>
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">Select Industry Registration Window</label>
            <select
              value={registrationDurationDays}
              onChange={(e) => setRegistrationDurationDays(Number(e.target.value))}
              className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:ring-2 focus:ring-emerald-500"
            >
              <option value={3}>3 Days Registration</option>
              <option value={4}>4 Days Registration (Recommended)</option>
              <option value={5}>5 Days Registration</option>
              <option value={6}>6 Days Registration</option>
              <option value={7}>7 Days Registration</option>
            </select>
          </div>
        </div>

        {/* Section 4: Sangli Hub 20kg Sample Commitment */}
        <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 space-y-2 text-xs text-emerald-900">
          <div className="flex items-center gap-2 font-bold">
            <ShieldCheck className="w-4 h-4 text-emerald-700" />
            <span>20kg Physical Sample Dispatch Requirement:</span>
          </div>
          <p className="text-[11px] text-emerald-800 leading-relaxed">
            By creating this auction lot, you commit to sending a <strong>minimum 20 kg physical sample</strong> to CropLink Agri-Hub (Plot 42, APMC Market Yard, Sangli). Physical quality verification unlocks live bidding on the 4th day.
          </p>
        </div>

        <button
          type="submit"
          className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-sm shadow-md shadow-emerald-200 transition flex items-center justify-center gap-2"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Publish Crop Lot & Generate Sample Dispatch Slip</span>
        </button>
      </form>
    </div>
  );
}
