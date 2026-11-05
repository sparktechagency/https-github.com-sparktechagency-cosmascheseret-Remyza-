"use client";

import * as React from "react";
import { TrendingUp } from "lucide-react";
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid } from "recharts";

const data = [
  { month: "Dec", revenue: 71000 },
  { month: "Jan", revenue: 78500 },
  { month: "Feb", revenue: 82000 },
  { month: "Mar", revenue: 86000 },
  { month: "Apr", revenue: 90000 },
  { month: "May", revenue: 94892 },
];

export function MonthlyRevenueChart() {
  return (
    <div className="w-full bg-white border border-slate-100 rounded-[22px] p-6 shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h3 className="text-base font-bold text-[#0F172A] tracking-tight">Monthly Revenue</h3>
          <p className="text-xs font-semibold text-slate-400 mt-0.5">Revenue collected from all active subscriptions</p>
        </div>
        <div className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-50 text-emerald-600 text-xs font-extrabold rounded-full self-start sm:self-auto">
          <TrendingUp className="h-3.5 w-3.5 stroke-[2.5]" />
          <span>+15% this month</span>
        </div>
      </div>

      <div className="h-[240px] w-full overflow-hidden">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
            <defs>
              <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#0052CC" stopOpacity={0.08} />
                <stop offset="95%" stopColor="#0052CC" stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
            <XAxis 
              dataKey="month" 
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#94A3B8', fontSize: 11, fontWeight: 600 }}
              dy={10}
            />
            <YAxis 
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#94A3B8', fontSize: 11, fontWeight: 600 }}
              tickFormatter={(v) => `$${v / 1000}k`}
              dx={-10}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  return (
                    <div className="bg-[#0F172A] text-white p-3 rounded-xl shadow-xl border border-slate-800 text-xs font-bold">
                      <p className="text-slate-400 mb-0.5">{payload[0].payload.month}</p>
                      <p className="text-sm">${payload[0].value?.toLocaleString()}</p>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Area
              type="monotone"
              dataKey="revenue"
              stroke="#0052CC"
              strokeWidth={2.5}
              fillOpacity={1}
              fill="url(#revenueGradient)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}