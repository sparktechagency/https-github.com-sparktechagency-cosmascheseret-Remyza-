"use client";

import { formatNumber } from "@/lib/api";

interface Item { label: string; count: number; percent: number; change_percent?: number }

export function DistributionSection({ subscribers, leads }: { subscribers: Item[]; leads: Item[] }) {
  const totalSubscribers = subscribers.reduce((sum, item) => sum + item.count, 0);
  const totalLeads = leads.reduce((sum, item) => sum + item.count, 0);
  return <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
    <Panel title="Subscription Breakdown" total={totalSubscribers}>{subscribers.map((item, index) => <DistributionRow key={item.label} item={item} color={["bg-blue-600", "bg-emerald-500", "bg-slate-400"][index % 3]} />)}</Panel>
    <Panel title="Lead Status Distribution" total={totalLeads}>{leads.map((item) => <DistributionRow key={item.label} item={item} color={item.label.toLowerCase().includes("hot") ? "bg-rose-500" : item.label.toLowerCase().includes("warm") ? "bg-amber-500" : "bg-blue-500"} />)}</Panel>
  </div>;
}

function Panel({ title, total, children }: { title: string; total: number; children: React.ReactNode }) { return <div className="bg-white border rounded-[22px] p-6"><div className="flex justify-between mb-5"><h3 className="font-bold">{title}</h3><div className="text-right"><p className="text-xl font-black">{formatNumber(total)}</p><p className="text-[10px] uppercase text-slate-400">Total</p></div></div><div className="space-y-4">{children}</div></div>; }
function DistributionRow({ item, color }: { item: Item; color: string }) { const width = Math.min(100, Math.max(0, item.percent)); return <div className="space-y-1.5"><div className="flex justify-between text-xs font-bold"><span className="capitalize text-slate-600">{item.label.replaceAll("_", " ")}</span><span>{formatNumber(item.count)} <span className="text-slate-400">{item.percent.toFixed(1)}%</span></span></div><div className="h-2.5 bg-slate-100 rounded-full overflow-hidden"><div className={`h-full rounded-full ${color}`} style={{ width: `${width}%` }} /></div></div>; }
