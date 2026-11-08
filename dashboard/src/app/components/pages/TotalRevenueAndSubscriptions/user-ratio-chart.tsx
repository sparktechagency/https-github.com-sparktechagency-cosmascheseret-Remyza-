"use client";

import { useEffect, useState } from "react";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { apiRequest, formatCurrency } from "@/lib/api";
import type { ApiEnvelope } from "@/types/admin";

interface RevenuePoint { month: string; year: number; revenue: string | number; currency: string }
export default function MonthlyRevenueChart() {
  const [data, setData] = useState<RevenuePoint[]>([]);
  const [error, setError] = useState("");
  useEffect(() => { apiRequest<ApiEnvelope<RevenuePoint[]>>("admin/revenue/monthly/").then((response) => setData(response.data)).catch((cause) => setError(cause instanceof Error ? cause.message : "Unable to load revenue chart.")); }, []);
  return <div className="min-w-0 space-y-6 rounded-3xl border bg-white p-6"><div><h2 className="text-lg font-bold">Monthly Revenue</h2><p className="text-sm text-slate-500">Revenue recorded during the last six calendar months</p></div>{error ? <div className="h-72 place-content-center text-center text-sm text-red-600">{error}</div> : <div className="h-72 min-w-0"><ResponsiveContainer width="100%" height="100%" minWidth={0} initialDimension={{ width: 800, height: 288 }}><AreaChart data={data.map((point) => ({ ...point, revenue: Number(point.revenue) }))}><defs><linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#004BCE" stopOpacity={0.15} /><stop offset="95%" stopColor="#004BCE" stopOpacity={0} /></linearGradient></defs><CartesianGrid vertical={false} stroke="#F1F5F9" /><XAxis dataKey="month" axisLine={false} tickLine={false} /><YAxis axisLine={false} tickLine={false} tickFormatter={(value) => `$${value >= 1000 ? `${value / 1000}k` : value}`} /><Tooltip formatter={(value) => formatCurrency(Number(value))} /><Area type="monotone" dataKey="revenue" stroke="#004BCE" strokeWidth={2.5} fill="url(#revenueGradient)" /></AreaChart></ResponsiveContainer></div>}</div>;
}
