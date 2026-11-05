"use client";

import { AlertOctagon, Calendar, DollarSign, Users } from "lucide-react";
import StatCard from "../../shared/custom/stat-card";
import MonthlyRevenueChart from "./user-ratio-chart";
import SubscribersList from "./SubscribersList";

export default function RevenuePricingSection() {
  return (
    <div className="w-full space-y-6">
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Total Revenue" value="$94,892" changeText="+15% this month" icon={<div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#FEF7E0] text-[#B06000]"><DollarSign className="h-5 w-5" strokeWidth={2.5} /></div>} />
        <StatCard title="Active Subscribers" value="1,204" changeText="+8% this month" icon={<div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#E6F4EA] text-[#137333]"><Users className="h-5 w-5" strokeWidth={2.5} /></div>} />
        <StatCard title="Trial Users" value="124" changeText="+3% this month" icon={<div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#EFF6FF] text-[#2563EB]"><Calendar className="h-5 w-5" strokeWidth={2.5} /></div>} />
        <StatCard title="Suspended Users" value="47" changeText="-2% this month" isNegative icon={<div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#FCE8E6] text-[#C5221F]"><AlertOctagon className="h-5 w-5" strokeWidth={2.5} /></div>} />
      </div>

      <SubscribersList />
      <MonthlyRevenueChart />
    </div>
  );
}
