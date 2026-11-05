"use client";

import * as React from "react";
import { Users, DollarSign, MessageSquare, Target } from "lucide-react";

const metrics = [
  {
    title: "New Users",
    value: "847",
    change: "+12%",
    isPositive: true,
    icon: Users,
    iconBg: "bg-blue-50 text-blue-600",
  },
  {
    title: "Revenue",
    value: "$94,892",
    change: "+15%",
    isPositive: true,
    icon: DollarSign,
    iconBg: "bg-amber-50 text-amber-600",
  },
  {
    title: "Messages Sent",
    value: "48,291",
    change: "+22%",
    isPositive: true,
    icon: MessageSquare,
    iconBg: "bg-purple-50 text-purple-600",
  },
  {
    title: "Lead Conversion",
    value: "19.6%",
    change: "+3.2%",
    isPositive: true,
    icon: Target,
    iconBg: "bg-emerald-50 text-emerald-600",
  },
];

export function AnalyticsMetricsGrid() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full">
      {metrics.map((metric, idx) => {
        const Icon = metric.icon;
        return (
          <div key={idx} className="bg-white border border-slate-100 rounded-[22px] p-5 flex flex-col justify-between shadow-xs relative overflow-hidden">
            <div className="flex items-center justify-between w-full">
              <div className={`p-2.5 rounded-xl ${metric.iconBg}`}>
                <Icon className="h-5 w-5 stroke-[2.2]" />
              </div>
              <span className={`text-[11px] font-extrabold px-2 py-0.5 rounded-full ${
                metric.isPositive ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"
              }`}>
                {metric.change}
              </span>
            </div>
            <div className="mt-4 space-y-0.5">
              <span className="text-xs font-bold text-slate-400 block tracking-tight">{metric.title}</span>
              <span className="text-2xl font-black text-[#0F172A] block tracking-tight">{metric.value}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}