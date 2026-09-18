import React from 'react';
import Link from 'next/link';
import { Sprout, Building2, UserCheck, ArrowRight, ShieldCheck } from 'lucide-react';

export default function RegisterRoleSelectPage() {
  return (
    <div className="max-w-4xl mx-auto my-12 px-4 sm:px-6 space-y-8">
      <div className="text-center space-y-2">
        <div className="w-12 h-12 rounded-md bg-forest text-white flex items-center justify-center mx-auto shadow-sm">
          <Sprout className="w-6 h-6" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-charcoal tracking-tight">Create Your CropLink Account</h1>
        <p className="text-xs text-muted font-medium max-w-md mx-auto">
          Join India's B2B direct agricultural marketplace. Select your primary role to begin onboarding verification.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Farmer Box */}
        <div className="bg-offwhite rounded-md border border-border-subtle p-8 space-y-6 flex flex-col justify-between hover:border-forest transition group shadow-sm">
          <div className="space-y-4">
            <div className="w-12 h-12 rounded-md bg-forest/10 text-forest flex items-center justify-center group-hover:bg-forest group-hover:text-white transition">
              <UserCheck className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-charcoal">Farmer / FPO Organization</h2>
              <p className="text-xs text-muted leading-relaxed mt-1">
                List crop lots, send 20kg samples to Sangli hub, receive competitive anonymous industry bids, and sign digital sales agreements.
              </p>
            </div>
            <ul className="space-y-2 text-xs text-muted font-medium">
              <li className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-forest shrink-0" />
                <span>AGMARKNET Modal Price Intelligence</span>
              </li>
              <li className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-forest shrink-0" />
                <span>Anonymous Bidder Identity Protection</span>
              </li>
            </ul>
          </div>

          <Link
            href="/register/farmer"
            className="w-full py-3 bg-forest hover:bg-forest/90 text-white font-bold rounded-md text-xs shadow-sm text-center flex items-center justify-center gap-2 transition"
          >
            <span>Register as Farmer</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Industry Box */}
        <div className="bg-offwhite rounded-md border border-border-subtle p-8 space-y-6 flex flex-col justify-between hover:border-terracotta transition group shadow-sm">
          <div className="space-y-4">
            <div className="w-12 h-12 rounded-md bg-terracotta/10 text-terracotta flex items-center justify-center group-hover:bg-terracotta group-hover:text-white transition">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-charcoal">Industrial Buyer / Processor</h2>
              <p className="text-xs text-muted leading-relaxed mt-1">
                Procure quality verified agricultural produce directly from verified farmers with sample test reports and ground inspection.
              </p>
            </div>
            <ul className="space-y-2 text-xs text-muted font-medium">
              <li className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-terracotta shrink-0" />
                <span>Verified 20kg Physical Samples</span>
              </li>
              <li className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-terracotta shrink-0" />
                <span>GSTIN Company Verification</span>
              </li>
            </ul>
          </div>

          <Link
            href="/register/industry"
            className="w-full py-3 bg-terracotta hover:bg-terracotta/90 text-white font-bold rounded-md text-xs shadow-sm text-center flex items-center justify-center gap-2 transition"
          >
            <span>Register as Industry</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
