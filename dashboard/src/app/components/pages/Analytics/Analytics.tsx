"use client";

import { useState } from "react";
import { AnalyticsMetricsGrid } from "./AnalyticsMetricsGrid";
import { MonthlyRevenueChart } from "./MonthlyRevenueChart";
import { MessageVolumeChart } from "./MessageVolumeChart";
import { DistributionSection } from "./DistributionSection";

const rangeOptions = [
  "This Week",
  "This Month",
  "This Quarter",
  "This Year",
  "Custom Range",
];

export default function AnalyticsDashboardPage() {
  const [activeRange, setActiveRange] = useState("This Month");

  return (
    <main className="min-h-screen w-full bg-[#F8FAFC] space-y-6 antialiased selection:bg-blue-500/10">
      {/* Structural Segment Filters Controller Header */}
      <div className="w-full flex items-center overflow-x-auto no-scrollbar pb-1 border-b border-slate-200/40">
        <div className="flex bg-slate-200/60 p-1 rounded-xl gap-0.5 shrink-0">
          {rangeOptions.map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => setActiveRange(option)}
              className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all focus:outline-none ${
                activeRange === option
                  ? "bg-white text-[#0052CC] shadow-xs"
                  : "text-slate-500 hover:text-slate-800 hover:bg-white/40"
              }`}
            >
              {option}
            </button>
          ))}
        </div>
      </div>

      {/* Grid Block Layout Render Tree */}
      <div className="space-y-5">
        {/* Row 1: High Level Totals Summary Stream Grid */}
        <AnalyticsMetricsGrid />

        {/* Row 3: Message Performance Analytics */}
        <MessageVolumeChart />

        {/* Row 4: Custom Segment Aggregates Matrices */}
        <DistributionSection />
      </div>
    </main>
  );
}
