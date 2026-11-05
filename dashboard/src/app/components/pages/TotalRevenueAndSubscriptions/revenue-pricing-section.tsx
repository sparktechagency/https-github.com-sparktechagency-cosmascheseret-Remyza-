"use client";

import { useEffect, useState } from "react";
import { AlertOctagon, Calendar, DollarSign, Users } from "lucide-react";
import { apiRequest, formatCurrency, formatNumber } from "@/lib/api";
import type { ApiEnvelope } from "@/types/admin";
import StatCard from "../../shared/custom/stat-card";
import MonthlyRevenueChart from "./user-ratio-chart";
import SubscribersList from "./SubscribersList";

type Metric = { value: number | string; change_percent: number };
type SummaryResponse = ApiEnvelope<{ summary: { total_revenue: Metric; active_subscribers: Metric; trial_users: Metric; suspended_users: Metric } }>;
const empty: SummaryResponse["data"]["summary"] = { total_revenue: { value: 0, change_percent: 0 }, active_subscribers: { value: 0, change_percent: 0 }, trial_users: { value: 0, change_percent: 0 }, suspended_users: { value: 0, change_percent: 0 } };

export default function RevenuePricingSection() {
  const [summary, setSummary] = useState(empty); const [error, setError] = useState("");
  useEffect(() => { apiRequest<SummaryResponse>("admin/subscriptions/?page=1&page_size=1").then((response) => setSummary(response.data.summary)).catch((cause) => setError(cause instanceof Error ? cause.message : "Unable to load subscription summary.")); }, []);
  const change = (metric: Metric) => `${metric.change_percent >= 0 ? "+" : ""}${metric.change_percent}% this month`;
  return <div className="w-full space-y-6">{error && <div className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</div>}<div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
    <StatCard title="Total Revenue" value={formatCurrency(summary.total_revenue.value)} changeText={change(summary.total_revenue)} isNegative={summary.total_revenue.change_percent < 0} icon={<Icon color="amber"><DollarSign className="h-5 w-5" /></Icon>} />
    <StatCard title="Active Subscribers" value={formatNumber(summary.active_subscribers.value)} changeText={change(summary.active_subscribers)} isNegative={summary.active_subscribers.change_percent < 0} icon={<Icon color="green"><Users className="h-5 w-5" /></Icon>} />
    <StatCard title="Trial Users" value={formatNumber(summary.trial_users.value)} changeText={change(summary.trial_users)} isNegative={summary.trial_users.change_percent < 0} icon={<Icon color="blue"><Calendar className="h-5 w-5" /></Icon>} />
    <StatCard title="Suspended Users" value={formatNumber(summary.suspended_users.value)} changeText={change(summary.suspended_users)} isNegative={summary.suspended_users.change_percent < 0} icon={<Icon color="red"><AlertOctagon className="h-5 w-5" /></Icon>} />
  </div><SubscribersList /><MonthlyRevenueChart /></div>;
}

function Icon({ children, color }: { children: React.ReactNode; color: "amber" | "green" | "blue" | "red" }) { const styles = { amber: "bg-amber-50 text-amber-700", green: "bg-green-50 text-green-700", blue: "bg-blue-50 text-blue-700", red: "bg-red-50 text-red-700" }; return <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${styles[color]}`}>{children}</div>; }
