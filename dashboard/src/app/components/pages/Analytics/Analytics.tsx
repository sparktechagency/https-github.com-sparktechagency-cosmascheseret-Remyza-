"use client";

import { useCallback, useEffect, useState } from "react";
import { AnalyticsMetricsGrid } from "./AnalyticsMetricsGrid";
import { MessageVolumeChart } from "./MessageVolumeChart";
import { DistributionSection } from "./DistributionSection";
import { apiRequest } from "@/lib/api";
import type { AdminRevenueAnalytics, ApiEnvelope } from "@/types/admin";

const ranges = [
  ["This Week", "this_week"], ["This Month", "this_month"], ["This Quarter", "this_quarter"], ["This Year", "this_year"], ["Custom Range", "custom"],
] as const;

export default function AnalyticsDashboardPage() {
  const [period, setPeriod] = useState("this_month");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [data, setData] = useState<AdminRevenueAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const load = useCallback(async () => {
    if (period === "custom" && (!fromDate || !toDate)) return;
    setLoading(true); setError("");
    const params = new URLSearchParams({ period });
    if (period === "custom") { params.set("from_date", fromDate); params.set("to_date", toDate); }
    try { const response = await apiRequest<ApiEnvelope<AdminRevenueAnalytics>>(`admin/revenue/analytics/?${params}`); setData(response.data); }
    catch (err) { setError(err instanceof Error ? err.message : "Unable to load analytics."); }
    finally { setLoading(false); }
  }, [period, fromDate, toDate]);
  useEffect(() => { void load(); }, [load]);

  return <main className="min-h-screen w-full bg-[#F8FAFC] space-y-6">
    <div className="flex flex-col lg:flex-row lg:items-center gap-3 border-b pb-3">
      <div className="flex overflow-x-auto bg-slate-200/60 p-1 rounded-xl gap-0.5">
        {ranges.map(([label, value]) => <button key={value} onClick={() => setPeriod(value)} className={`px-3.5 py-1.5 text-xs font-bold rounded-lg whitespace-nowrap ${period === value ? "bg-white text-[#0052CC] shadow-xs" : "text-slate-500"}`}>{label}</button>)}
      </div>
      {period === "custom" && <div className="flex items-center gap-2"><input aria-label="From date" type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} className="rounded-lg border px-3 py-1.5 text-xs" /><span className="text-xs text-slate-400">to</span><input aria-label="To date" type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} className="rounded-lg border px-3 py-1.5 text-xs" /></div>}
    </div>
    {error && <p className="rounded-xl bg-rose-50 p-4 text-sm text-rose-600">{error}</p>}
    {loading ? <p className="py-20 text-center text-sm text-slate-400">Loading analytics...</p> : data && <div className="space-y-5"><p className="text-xs text-slate-400">Data from {data.start_date} to {data.end_date}</p><AnalyticsMetricsGrid summary={data.summary} /><MessageVolumeChart data={data.message_volume_analytics} /><DistributionSection subscribers={data.subscribers} leads={data.leads} /></div>}
  </main>;
}
