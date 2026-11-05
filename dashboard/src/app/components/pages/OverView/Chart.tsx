"use client";

import { useEffect, useState } from "react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { apiRequest } from "@/lib/api";
import type { ApiEnvelope } from "@/types/admin";

type AnalyticsResponse = ApiEnvelope<{ year: number; user_ratio: { month: string; year: number; users: number }[] }>;

export default function Chart() {
  const currentYear = new Date().getFullYear();
  const [year, setYear] = useState(currentYear);
  const [data, setData] = useState<{ month: string; users: number }[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  useEffect(() => { setLoading(true); setError(""); apiRequest<AnalyticsResponse>(`admin/users/analytics/?year=${year}`).then((response) => setData(response.data.user_ratio)).catch((cause) => setError(cause instanceof Error ? cause.message : "Unable to load user chart.")).finally(() => setLoading(false)); }, [year]);
  return <div className="w-full rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
    <div className="mb-8 flex items-center justify-between"><div><h2 className="text-lg font-bold text-slate-900">User Signups</h2><p className="text-xs text-slate-500">Monthly registered users</p></div><select value={year} onChange={(event) => setYear(Number(event.target.value))} className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700">{[currentYear, currentYear - 1, currentYear - 2].map((value) => <option key={value} value={value}>{value === currentYear ? `This Year (${value})` : value}</option>)}</select></div>
    {error ? <div className="h-80 place-content-center text-center text-sm text-red-600">{error}</div> : loading ? <div className="h-80 place-content-center text-center text-sm text-slate-500">Loading chart…</div> : <div className="h-80 w-full"><ResponsiveContainer width="100%" height="100%"><BarChart data={data} margin={{ top: 10, right: 5, left: -20, bottom: 0 }} barSize={24}><CartesianGrid vertical={false} stroke="#F1F5F9" /><XAxis dataKey="month" axisLine={false} tickLine={false} /><YAxis allowDecimals={false} axisLine={false} tickLine={false} /><Tooltip /><Bar dataKey="users" name="Users" fill="#062F87" radius={[4, 4, 0, 0]} /></BarChart></ResponsiveContainer></div>}
  </div>;
}
