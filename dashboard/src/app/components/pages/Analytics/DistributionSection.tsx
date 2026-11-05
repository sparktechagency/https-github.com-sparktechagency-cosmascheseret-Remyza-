"use client";

import * as React from "react";
import { ArrowUpRight } from "lucide-react";

export function DistributionSection() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 w-full">
      
      {/* Subscription Breakdown Ring Visual */}
      <div className="bg-white border border-slate-100 rounded-[22px] p-6 shadow-xs flex flex-col justify-between">
        <div>
          <h3 className="text-base font-bold text-[#0F172A] tracking-tight mb-4">Subscription Breakdown</h3>
          <div className="relative flex items-center justify-center h-44 w-full">
            {/* Embedded Inline Explicit SVG Ring Graphic */}
            <svg className="w-36 h-36 transform -rotate-90" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="40" fill="transparent" stroke="#E2E8F0" strokeWidth="11" />
              {/* Pro Segment - 57% */}
              <circle cx="50" cy="50" r="40" fill="transparent" stroke="#0052CC" strokeWidth="11" 
                strokeDasharray="251.2" strokeDashoffset={251.2 * (1 - 0.57)} strokeLinecap="round" />
              {/* Free Segment - 37% (offset by Pro 57%) */}
              <circle cx="50" cy="50" r="40" fill="transparent" stroke="#94A3B8" strokeWidth="11" 
                strokeDasharray="251.2" strokeDashoffset={251.2 * (1 - 0.37)} transform="rotate(205 50 50)" />
              {/* Trial Segment - 6% */}
              <circle cx="50" cy="50" r="40" fill="transparent" stroke="#22C55E" strokeWidth="11" 
                strokeDasharray="251.2" strokeDashoffset={251.2 * (1 - 0.06)} transform="rotate(338 50 50)" />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              <span className="text-xl font-black text-[#0F172A] tracking-tight">2,108</span>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Total</span>
            </div>
          </div>
        </div>

        {/* Legend metrics mapping list */}
        <div className="space-y-2 mt-4 text-xs font-bold">
          <div className="flex items-center justify-between text-slate-600">
            <div className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full bg-[#0052CC]" /><span>Pro</span></div>
            <div>1,204 <span className="text-slate-400 font-medium ml-1">57%</span></div>
          </div>
          <div className="flex items-center justify-between text-slate-600">
            <div className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full bg-[#22C55E]" /><span>Trial</span></div>
            <div>124 <span className="text-slate-400 font-medium ml-1">6%</span></div>
          </div>
          <div className="flex items-center justify-between text-slate-600">
            <div className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full bg-[#94A3B8]" /><span>Free</span></div>
            <div>780 <span className="text-slate-400 font-medium ml-1">37%</span></div>
          </div>
        </div>
      </div>

      {/* Lead Status Progress Rails Layout Block */}
      <div className="bg-white border border-slate-100 rounded-[22px] p-6 shadow-xs lg:col-span-2 flex flex-col justify-between">
        <div>
          <h3 className="text-base font-bold text-[#0F172A] tracking-tight mb-5">Lead Status Distribution</h3>
          
          <div className="space-y-4">
            {/* Row 1 */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center text-xs font-bold">
                <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-rose-500" /><span className="text-slate-600">Hot Leads</span></div>
                <div className="text-[#0F172A]">2,834 <span className="text-slate-400 font-medium ml-1">30%</span></div>
              </div>
              <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-rose-500 rounded-full" style={{ width: "30%" }} />
              </div>
            </div>

            {/* Row 2 */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center text-xs font-bold">
                <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-amber-500" /><span className="text-slate-600">Warm Leads</span></div>
                <div className="text-[#0F172A]">3,788 <span className="text-slate-400 font-medium ml-1">40%</span></div>
              </div>
              <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-amber-500 rounded-full" style={{ width: "40%" }} />
              </div>
            </div>

            {/* Row 3 */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center text-xs font-bold">
                <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-blue-500" /><span className="text-slate-600">Cold Leads</span></div>
                <div className="text-[#0F172A]">2,849 <span className="text-slate-400 font-medium ml-1">30%</span></div>
              </div>
              <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-blue-500 rounded-full" style={{ width: "30%" }} />
              </div>
            </div>
          </div>
        </div>

        {/* Total Aggregate Footer Card Segment */}
        <div className="mt-5 pt-4 border-t border-slate-50 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Total Leads</span>
            <span className="text-xl font-black text-[#0F172A] tracking-tight block">9,471</span>
            <span className="inline-flex items-center gap-0.5 text-[11px] font-extrabold text-emerald-600 mt-0.5">
              <ArrowUpRight className="h-3 w-3 stroke-[2.5]" /> +18% this month
            </span>
          </div>
        </div>
      </div>

    </div>
  );
}