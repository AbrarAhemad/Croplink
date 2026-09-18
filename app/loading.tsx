import React from 'react';
import { Sprout } from 'lucide-react';

export default function Loading() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center p-8 space-y-4">
      <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-lg shadow-emerald-200 animate-bounce">
        <Sprout className="w-6 h-6" />
      </div>
      <span className="text-xs font-bold text-slate-500 tracking-wide uppercase">Loading CropLink Data...</span>
    </div>
  );
}
