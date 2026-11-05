"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, DollarSign, Target, Users } from "lucide-react";
import { apiRequest, formatCurrency, formatNumber } from "@/lib/api";
import type { ApiEnvelope } from "@/types/admin";
import StatCard, { type StatCardProps } from "./StatCard";

type UserAnalytics = ApiEnvelope<{ summary: { total_users: number; active_subscriptions: number; monthly_revenue: string; total_leads_captured: number } }>;

export default function Stats() {
  const [summary, setSummary] = useState({ total_users: 0, active_subscriptions: 0, monthly_revenue: "0", total_leads_captured: 0 });
  const [error, setError] = useState("");
  useEffect(() => { apiRequest<UserAnalytics>("admin/users/analytics/?year=this_year").then((response) => setSummary(response.data.summary)).catch((cause) => setError(cause instanceof Error ? cause.message : "Unable to load dashboard metrics.")); }, []);
  const dataset: StatCardProps[] = [
    { title: "Total Users", value: formatNumber(summary.total_users), change: "Live total", icon: Users, variant: "blue" },
    { title: "Active Subscriptions", value: formatNumber(summary.active_subscriptions), change: "Currently active", icon: CheckCircle2, variant: "green" },
    { title: "Monthly Revenue", value: formatCurrency(summary.monthly_revenue), change: "Current month", icon: DollarSign, variant: "gold" },
    { title: "Total Leads Captured", value: formatNumber(summary.total_leads_captured), change: "Live total", icon: Target, variant: "purple" },
  ];
  return <>{error && <div className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</div>}<div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">{dataset.map((data) => <StatCard key={data.title} {...data} />)}</div></>;
}
