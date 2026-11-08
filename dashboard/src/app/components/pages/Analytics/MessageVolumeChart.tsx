"use client";

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

export function MessageVolumeChart({ data }: { data: Array<{ label: string; message_volume: number }> }) {
  return <div className="w-full min-w-0 rounded-[22px] border bg-white p-6"><h3 className="mb-6 text-base font-bold">Message Volume</h3><div className="h-[280px] min-w-0"><ResponsiveContainer width="100%" height="100%" minWidth={0} initialDimension={{ width: 800, height: 280 }}><BarChart data={data}><CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" /><XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fill: "#94A3B8", fontSize: 11 }} /><YAxis axisLine={false} tickLine={false} tick={{ fill: "#94A3B8", fontSize: 11 }} /><Tooltip /><Bar dataKey="message_volume" name="Messages" fill="#0052CC" radius={[5, 5, 0, 0]} maxBarSize={38} /></BarChart></ResponsiveContainer></div></div>;
}
