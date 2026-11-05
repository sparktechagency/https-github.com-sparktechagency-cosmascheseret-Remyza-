"use client";

import * as React from "react";
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid } from "recharts";

const data = [
  { day: "Mon", Manual: 3100, AiGenerated: 1200 },
  { day: "Tue", Manual: 4100, AiGenerated: 1800 },
  { day: "Wed", Manual: 3800, AiGenerated: 1600 },
  { day: "Thu", Manual: 4500, AiGenerated: 2100 },
  { day: "Fri", Manual: 5100, AiGenerated: 2900 },
  { day: "Sat", Manual: 2700, AiGenerated: 900 },
  { day: "Sun", Manual: 2100, AiGenerated: 750 },
];

export function MessageVolumeChart() {
  return (
    <div className="w-full bg-white border border-slate-100 rounded-[22px] p-6 shadow-xs">
      <div className="mb-6">
        <h3 className="text-base font-bold text-[#0F172A] tracking-tight">Message Volume</h3>
      </div>

      <div className="h-[260px] w-full overflow-hidden">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 10, right: 10, left: 10, bottom: 0 }} barGap={6}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
            <XAxis 
              dataKey="day" 
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#94A3B8', fontSize: 11, fontWeight: 600 }}
              dy={10}
            />
            <YAxis 
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#94A3B8', fontSize: 11, fontWeight: 600 }}
              dx={-10}
            />
            <Tooltip
              cursor={{ fill: '#F8FAFC', radius: 4 }}
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  return (
                    <div className="bg-[#0F172A] text-white p-3 rounded-xl shadow-xl border border-slate-800 text-xs font-bold space-y-1">
                      <p className="text-slate-400">{payload[0].payload.day}</p>
                      {payload.map((p, i) => (
                        <div key={i} className="flex items-center gap-2 justify-between min-w-[120px]">
                          <span className="font-medium text-slate-300">{p.name}:</span>
                          <span>{p.value?.toLocaleString()}</span>
                        </div>
                      ))}
                    </div>
                  );
                }
                return null;
              }}
            />
            <Bar dataKey="Manual" fill="#0052CC" radius={[4, 4, 0, 0]} maxBarSize={32} />
            <Bar dataKey="AiGenerated" fill="#A855F7" radius={[4, 4, 0, 0]} maxBarSize={32} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Segment Legends Component */}
      <div className="flex items-center justify-center gap-6 mt-4 pt-2 border-t border-slate-50 text-[11px] font-bold">
        <div className="flex items-center gap-1.5 text-slate-500">
          <span className="w-2.5 h-2.5 rounded-full bg-[#A855F7]" />
          <span>AI Generated</span>
        </div>
        <div className="flex items-center gap-1.5 text-slate-500">
          <span className="w-2.5 h-2.5 rounded-full bg-[#0052CC]" />
          <span>Manual</span>
        </div>
      </div>
    </div>
  );
}