"use client";

import { useEffect, useState } from "react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { apiRequest } from "@/lib/api";

interface Response { data: { user_ratio: Array<{ month: string; users: number }> } }
export default function UserRatioChart() {
  const currentYear = new Date().getFullYear();
  const [year, setYear] = useState(currentYear);
  const [data, setData] = useState<Array<{ month: string; users: number }>>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  useEffect(() => { setLoading(true); apiRequest<Response>(`admin/users/analytics/?year=${year}`).then((response) => { setData(response.data.user_ratio); setError(""); }).catch((cause) => setError(cause instanceof Error ? cause.message : "Unable to load user chart.")).finally(() => setLoading(false)); }, [year]);
  return <div className="w-full min-w-0 rounded-2xl border bg-white p-6"><div className="mb-8 flex items-center justify-between"><div><h2 className="text-lg font-bold">User Signups</h2><p className="text-xs text-slate-500">Monthly registered users</p></div><select value={year} onChange={(event) => setYear(Number(event.target.value))} className="rounded-xl border px-4 py-2 text-sm">{[currentYear, currentYear - 1, currentYear - 2].map((value) => <option key={value} value={value}>{value === currentYear ? `This Year (${value})` : value}</option>)}</select></div>{error ? <State text={error} /> : loading ? <State text="Loading chart…" /> : <div className="h-80 min-w-0"><ResponsiveContainer width="100%" height="100%" minWidth={0} initialDimension={{ width: 800, height: 320 }}><BarChart data={data} margin={{ top: 10, right: 5, left: -20, bottom: 0 }} barSize={24}><CartesianGrid vertical={false} stroke="#F1F5F9" /><XAxis dataKey="month" axisLine={false} tickLine={false} /><YAxis allowDecimals={false} axisLine={false} tickLine={false} /><Tooltip /><Bar dataKey="users" name="Users" fill="#062F87" radius={[4, 4, 0, 0]} /></BarChart></ResponsiveContainer></div>}</div>;
}
function State({ text }: { text: string }) { return <div className="h-80 place-content-center text-center text-sm text-slate-500">{text}</div>; }
