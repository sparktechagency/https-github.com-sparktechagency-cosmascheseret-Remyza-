"use client";
import { LucideIcon } from "lucide-react";

export interface StatCardProps {
  title: string;
  value: string;
  change: string;
  icon: LucideIcon;
  variant: "blue" | "green" | "gold" | "purple";
}

const variantStyles = {
  blue: { bg: "bg-[#EEF2FF]", text: "text-[#3B82F6]" },
  green: { bg: "bg-[#ECFDF5]", text: "text-[#10B981]" },
  gold: { bg: "bg-[#FFFBEB]", text: "text-[#F59E0B]" },
  purple: { bg: "bg-[#F5F3FF]", text: "text-[#8B5CF6]" },
};

export default function StatCard({ title, value, change, icon: Icon, variant }: StatCardProps) {
  const styles = variantStyles[variant];

  return (
    <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-[0_2px_8px_rgba(0,0,0,0.02)] transition-all hover:shadow-md">
      <div className="flex flex-col gap-4">
        {/* Rounded Custom Icon Circle wrapper */}
        <div className={`flex h-12 w-12 items-center justify-center rounded-full ${styles.bg} ${styles.text}`}>
          <Icon className="h-5 w-5" strokeWidth={2.2} />
        </div>

        {/* Numeric Metrics */}
        <div className="space-y-1">
          <h3 className="font-heading text-3xl font-bold tracking-tight text-[#0F172A]">
            {value}
          </h3>
          <p className="text-sm font-medium text-[#64748B]">
            {title}
          </p>
        </div>

        {/* Growth Rate / Status Indicator */}
        <div className="flex items-center gap-1.5 text-xs font-semibold text-[#10B981]">
          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
          </svg>
          <span>{change} this month</span>
        </div>
      </div>
    </div>
  );
}