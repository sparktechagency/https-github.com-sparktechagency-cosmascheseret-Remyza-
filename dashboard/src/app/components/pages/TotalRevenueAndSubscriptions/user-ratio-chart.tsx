"use client";

import React, { useState, useMemo } from "react";
import { ChevronDown, TrendingUp } from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

// Mock datasets matching your historical revenue curves exactly
const revenueHistory = {
  "This Year": [
    { month: "Dec", revenue: 71000 },
    { month: "Jan", revenue: 78500 },
    { month: "Feb", revenue: 81800 },
    { month: "Mar", revenue: 84900 },
    { month: "Apr", revenue: 89800 },
    { month: "May", revenue: 94892 }, // Current Total
  ],
  "Previous Year": [
    { month: "Dec", revenue: 52000 },
    { month: "Jan", revenue: 58000 },
    { month: "Feb", revenue: 61000 },
    { month: "Mar", revenue: 63500 },
    { month: "Apr", revenue: 69000 },
    { month: "May", revenue: 74500 },
  ],
};

export default function MonthlyRevenueChart() {
  const [timeframe, setTimeframe] = useState<"This Year" | "Previous Year">(
    "This Year",
  );

  const currentData = useMemo(() => revenueHistory[timeframe], [timeframe]);

  return (
    <div className="w-full bg-white rounded-[24px] border border-slate-100 p-6 shadow-[0_2px_8px_rgba(0,0,0,0.01)] space-y-6">
      {/* Header Controls Layout matching Figma Spec */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 w-full">
        <div className="space-y-1">
          <h2 className="text-lg font-bold text-[#0F172A]">Monthly Revenue</h2>
          <p className="text-[13px] font-medium text-slate-400">
            Revenue collected from all active subscriptions
          </p>
        </div>

        {/* Dynamic Badges & Selector Actions Deck */}
        <div className="flex items-center gap-3 self-start sm:self-auto">
          {/* Growth Percentage Pill Badge */}
          <div className="inline-flex items-center gap-1 rounded-full bg-[#E6F4EA] px-3 py-1.5 text-[12px] font-bold text-[#137333]">
            <TrendingUp className="h-3.5 w-3.5" strokeWidth={2.5} />
            <span>+15% this month</span>
          </div>
        </div>
      </div>

      {/* Chart Canvas Workspace */}
      <div className="w-full h-70 sm:h-80 overflow-hidden text-[11px] font-semibold text-slate-400">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={currentData}
            margin={{ top: 15, right: 15, left: 5, bottom: 0 }}
          >
            <defs>
              {/* Soft Area Gradient Shading Match */}
              <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#004BCE" stopOpacity={0.06} />
                <stop offset="95%" stopColor="#004BCE" stopOpacity={0.0} />
              </linearGradient>
            </defs>

            {/* Dotted horizontal alignment grids to match design template layout */}
            <CartesianGrid
              vertical={false}
              stroke="#F1F5F9"
              strokeDasharray="3 3"
            />

            {/* X-Axis Setup Component */}
            <XAxis
              dataKey="month"
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#94A3B8", fontSize: 11, fontWeight: 500 }}
              dy={12}
            />

            {/* Y-Axis Setup Component formatted to $0k-$100k limits */}
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#94A3B8", fontSize: 11, fontWeight: 500 }}
              tickFormatter={(value) =>
                value === 0 ? "$0k" : `$${value / 1000}k`
              }
              domain={[0, 100000]}
              ticks={[0, 25000, 50000, 75000, 100000]}
              dx={-8}
            />

            {/* Micro Interaction Tooltip Popover Overlay */}
            <Tooltip
              cursor={{
                stroke: "#004BCE",
                strokeWidth: 1,
                strokeDasharray: "4 4",
              }}
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  return (
                    <div className="bg-[#0F172A] text-white px-3 py-2 rounded-xl shadow-xl border-0 text-xs font-bold space-y-0.5">
                      <p className="text-slate-400 font-medium">
                        {payload[0].payload.month}
                      </p>
                      <p className="text-sm text-emerald-400">
                        ${payload[0].value?.toLocaleString()}
                      </p>
                    </div>
                  );
                }
                return null;
              }}
            />

            {/* Main Area & Core Vector Trend-Line Definition */}
            <Area
              type="linear" // Crisp linear point paths matching Figma exactly
              dataKey="revenue"
              stroke="#004BCE" // Deep vibrant corporate branding sapphire accent color
              strokeWidth={2.5}
              fillOpacity={1}
              fill="url(#revenueGradient)"
              // Crisp interactive anchor dots centered precisely along each monthly checkpoint
              dot={{
                r: 4,
                fill: "#004BCE",
                stroke: "#FFFFFF",
                strokeWidth: 2,
              }}
              activeDot={{
                r: 6,
                fill: "#004BCE",
                stroke: "#FFFFFF",
                strokeWidth: 2,
                className: "shadow-md",
              }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
