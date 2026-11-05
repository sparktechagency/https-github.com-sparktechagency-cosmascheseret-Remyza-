"use client";
import { Users, CheckCircle2, DollarSign, Target } from "lucide-react";
import StatCard, { StatCardProps } from "./StatCard";

export default function Stats() {
  const dataset: StatCardProps[] = [
    { title: "Total Users", value: "2,847", change: "+12%", icon: Users, variant: "blue" },
    { title: "Active Subscriptions", value: "1,204", change: "+8%", icon: CheckCircle2, variant: "green" },
    { title: "Monthly Revenue", value: "$94,892", change: "+15%", icon: DollarSign, variant: "gold" },
    { title: "Total Leads Captured", value: "9,471", change: "+18%", icon: Target, variant: "purple" },
  ];

  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
      {dataset.map((data, index) => (
        <StatCard key={index} {...data} />
      ))}
    </div>
  );
}