"use client";

import { DollarSign, MessageSquare, Target, Users } from "lucide-react";
import { formatCurrency, formatNumber } from "@/lib/api";

const definitions = [
  { key: "new_users", title: "New Users", icon: Users, color: "bg-blue-50 text-blue-600" },
  { key: "revenue", title: "Revenue", icon: DollarSign, color: "bg-amber-50 text-amber-600" },
  { key: "messages_sent", title: "Messages Sent", icon: MessageSquare, color: "bg-purple-50 text-purple-600" },
  { key: "lead_conversion_percent", title: "Lead Conversion", icon: Target, color: "bg-emerald-50 text-emerald-600" },
] as const;

export function AnalyticsMetricsGrid({ summary }: { summary: Record<string, { value: number | string; change_percent: number }> }) {
  return <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
    {definitions.map(({ key, title, icon: Icon, color }) => { const metric = summary[key] || { value: 0, change_percent: 0 }; const change = Number(metric.change_percent || 0); const value = key === "revenue" ? formatCurrency(metric.value) : key === "lead_conversion_percent" ? `${Number(metric.value).toFixed(1)}%` : formatNumber(metric.value); return <div key={key} className="bg-white border rounded-[22px] p-5"><div className="flex justify-between"><div className={`p-2.5 rounded-xl ${color}`}><Icon className="h-5 w-5" /></div><span className={`text-[11px] font-bold px-2 py-1 rounded-full ${change >= 0 ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"}`}>{change >= 0 ? "+" : ""}{change.toFixed(1)}%</span></div><div className="mt-4"><span className="text-xs font-bold text-slate-400">{title}</span><span className="text-2xl font-black block">{value}</span></div></div>; })}
  </div>;
}
