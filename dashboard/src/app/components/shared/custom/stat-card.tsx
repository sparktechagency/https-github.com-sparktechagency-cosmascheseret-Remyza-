"use client";

import React from "react";
import { TrendingUp, TrendingDown } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string;
  changeText: string;
  isNegative?: boolean;
  icon: React.ReactNode;
}

export default function StatCard({ title, value, changeText, isNegative = false, icon }: StatCardProps) {
  return (
    <div className="bg-white rounded-[24px] p-6 border border-slate-100 shadow-[0_2px_8px_rgba(0,0,0,0.01)] flex flex-col justify-between min-h-[148px]">
      <div className="flex items-center justify-between">
        <span className="text-[13px] font-medium text-slate-400">{title}</span>
        <div className="shrink-0">{icon}</div>
      </div>
      
      <div className="mt-4 space-y-1">
        <h3 className="text-3xl font-bold text-[#0F172A] tracking-tight">{value}</h3>
        <div className={`flex items-center gap-1 text-[11px] font-bold ${isNegative ? "text-[#D93025]" : "text-[#137333]"}`}>
          {isNegative ? <TrendingDown className="h-3.5 w-3.5" /> : <TrendingUp className="h-3.5 w-3.5" />}
          <span>{changeText}</span>
        </div>
      </div>
    </div>
  );
}