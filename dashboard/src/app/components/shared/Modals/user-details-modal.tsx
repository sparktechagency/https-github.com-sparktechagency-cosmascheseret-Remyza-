"use client";

import React from "react";
import { X, MessageSquare, Target, Calendar, Percent } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";

interface UserDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  userData: {
    name: string;
    email: string;
    phone: string;
    company: string;
    plan: "Pro" | "Enterprise" | "Free";
    status: "Active" | "Blocked" | "Trial";
    joined: string;
    messages: string;
    leads: number;
  } | null;
}

export default function UserDetailsModal({
  isOpen,
  onClose,
  userData,
}: UserDetailsModalProps) {
  if (!userData) return null;

  // Status color mapper matching your dashboard specs exactly
  const getStatusStyles = (status: string) => {
    switch (status) {
      case "Active":
        return "bg-[#E6F4EA] text-[#137333]";
      case "Blocked":
        return "bg-[#FCE8E6] text-[#C5221F]";
      case "Trial":
        return "bg-[#FEF7E0] text-[#B06000]";
      default:
        return "bg-slate-100 text-slate-600";
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-150 w-[94vw] overflow-hidden rounded-[24px] border-0 bg-white p-0 shadow-[0_20px_50px_rgba(0,0,0,0.12)] outline-none sm:rounded-[24px]">
        {/* Modal Top Close Anchor bar */}
        <div className="flex items-center justify-between px-6 pt-5 pb-2">
          <DialogTitle className="text-base font-bold text-[#0F172A]">
            User Details
          </DialogTitle>
        </div>

        {/* Outer Scroll Area container wrapper */}
        <div className="px-6 pb-6 space-y-6 max-h-[82vh] overflow-y-auto hidden-scrollbar">
          {/* PROFILE CARD IDENTIFIER HEADER */}
          <div className="flex items-start gap-4 pt-2">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-[#004BCE] text-lg font-bold text-white">
              {userData.name
                .split(" ")
                .map((n) => n[0])
                .join("")}
            </div>
            <div className="space-y-1.5">
              <h3 className="text-lg font-bold text-[#0F172A] leading-tight">
                {userData.name}
              </h3>
              <p className="text-[13px] font-medium text-slate-400 leading-none">
                {userData.email}
              </p>
              <p className="text-[13px] font-medium text-slate-400 leading-none">
                {userData.phone}
              </p>

              <div className="flex items-center gap-1.5 pt-1">
                <span className="inline-flex items-center rounded-md bg-[#004BCE] px-2 py-0.5 text-[11px] font-bold text-white">
                  {userData.plan}
                </span>
                <span
                  className={`inline-flex items-center rounded-md px-2 py-0.5 text-[11px] font-bold ${getStatusStyles(userData.status)}`}
                >
                  {userData.status}
                </span>
              </div>
            </div>
          </div>

          {/* FOUR-COLUMN HORIZONTAL SUMMARY STATS GRID CARDS */}
          <div className="grid grid-cols-4 gap-2.5">
            {/* Stat Item 1 */}
            <div className="bg-[#F8FAFC] border border-slate-50 rounded-xl p-3 text-center space-y-1">
              <div className="mx-auto flex h-7 w-7 items-center justify-center rounded-lg bg-[#EFF6FF] text-[#2563EB]">
                <MessageSquare className="h-4 w-4" />
              </div>
              <p className="text-sm font-bold text-[#0F172A] pt-1">
                {userData.messages}
              </p>
              <p className="text-[10px] font-medium text-slate-400">
                Messages Sent
              </p>
            </div>
            {/* Stat Item 2 */}
            <div className="bg-[#F8FAFC] border border-slate-50 rounded-xl p-3 text-center space-y-1">
              <div className="mx-auto flex h-7 w-7 items-center justify-center rounded-lg bg-[#F3E8FF] text-[#9333EA]">
                <Target className="h-4 w-4" />
              </div>
              <p className="text-sm font-bold text-[#0F172A] pt-1">
                {userData.leads}
              </p>
              <p className="text-[10px] font-medium text-slate-400">
                Leads Generated
              </p>
            </div>
            {/* Stat Item 3 */}
            <div className="bg-[#F8FAFC] border border-slate-50 rounded-xl p-3 text-center space-y-1">
              <div className="mx-auto flex h-7 w-7 items-center justify-center rounded-lg bg-[#E6F4EA] text-[#137333]">
                <Calendar className="h-4 w-4" />
              </div>
              <p className="text-sm font-bold text-[#0F172A] pt-1">87</p>
              <p className="text-[10px] font-medium text-slate-400">
                Days Active
              </p>
            </div>
            {/* Stat Item 4 */}
            <div className="bg-[#F8FAFC] border border-slate-50 rounded-xl p-3 text-center space-y-1">
              <div className="mx-auto flex h-7 w-7 items-center justify-center rounded-lg bg-[#FEF7E0] text-[#B06000]">
                <Percent className="h-4 w-4" />
              </div>
              <p className="text-sm font-bold text-[#0F172A] pt-1">94%</p>
              <p className="text-[10px] font-medium text-slate-400">
                Response Rate
              </p>
            </div>
          </div>

          {/* SECTION: ACCOUNT INFORMATION */}
          <div className="space-y-3">
            <h4 className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">
              Account Information
            </h4>
            <div className="grid grid-cols-2 gap-x-6 gap-y-3 border-b border-slate-100 pb-5">
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">
                  Full Name
                </p>
                <p className="text-cd font-semibold text-[#2C3E50] text-[13px] mt-0.5">
                  {userData.name}
                </p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">
                  Email Address
                </p>
                <p className="text-cd font-semibold text-[#2C3E50] text-[13px] mt-0.5">
                  {userData.email}
                </p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">
                  Phone Number
                </p>
                <p className="text-cd font-semibold text-[#2C3E50] text-[13px] mt-0.5">
                  {userData.phone}
                </p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">
                  Business Name
                </p>
                <p className="text-cd font-semibold text-[#2C3E50] text-[13px] mt-0.5">
                  {userData.company}
                </p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">
                  Business Type
                </p>
                <p className="text-cd font-semibold text-[#2C3E50] text-[13px] mt-0.5">
                  Real Estate
                </p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">
                  Time Zone
                </p>
                <p className="text-cd font-semibold text-[#2C3E50] text-[13px] mt-0.5">
                  America/New_York
                </p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">
                  Joined Date
                </p>
                <p className="text-cd font-semibold text-[#2C3E50] text-[13px] mt-0.5">
                  {userData.joined}
                </p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">
                  Last Active
                </p>
                <p className="text-cd font-semibold text-[#2C3E50] text-[13px] mt-0.5">
                  2h ago
                </p>
              </div>
            </div>
          </div>

          {/* SECTION: SUBSCRIPTION DETAIL METRICS REGISTRY */}
          <div className="space-y-3">
            <h4 className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">
              Subscription
            </h4>
            <div className="grid grid-cols-2 gap-x-6 gap-y-3 border-b border-slate-100 pb-5">
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">
                  Plan
                </p>
                <p className="text-cd font-semibold text-[#2C3E50] text-[13px] mt-0.5">
                  {userData.plan}
                </p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">
                  Price
                </p>
                <p className="text-cd font-semibold text-[#2C3E50] text-[13px] mt-0.5">
                  $79/month
                </p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">
                  Start Date
                </p>
                <p className="text-cd font-semibold text-[#2C3E50] text-[13px] mt-0.5">
                  {userData.joined}
                </p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">
                  Next Renewal
                </p>
                <p className="text-cd font-semibold text-[#2C3E50] text-[13px] mt-0.5">
                  Jun 15, 2026
                </p>
              </div>
              <div className="col-span-2">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">
                  Status
                </p>
                <p className="text-cd font-semibold text-[#2C3E50] text-[13px] mt-0.5">
                  {userData.status}
                </p>
                <a
                  href="#view-sub"
                  className="inline-block text-[11px] font-bold text-[#0052CC] hover:underline mt-1.5"
                >
                  View Subscription &rarr;
                </a>
              </div>
            </div>
          </div>

          {/* SECTION: USAGE THIS MONTH WITH LINE PROGRESSION INDICATORS */}
          <div className="space-y-3.5">
            <h4 className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">
              Usage This Month
            </h4>
            <div className="space-y-3">
              {/* Progress metric 1 */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
                  <span>Messages Sent</span>
                  <span className="text-[#0F172A] font-bold">
                    {userData.messages} / 2,000
                  </span>
                </div>
                <div className="h-2 w-full rounded-full bg-[#EFF3F6]">
                  <div
                    className="h-2 rounded-full bg-[#004BCE]"
                    style={{ width: "62.3%" }}
                  />
                </div>
              </div>

              {/* Progress metric 2 */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
                  <span>Leads Captured</span>
                  <span className="text-[#0F172A] font-bold">
                    {userData.leads} / 500
                  </span>
                </div>
                <div className="h-2 w-full rounded-full bg-[#EFF3F6]">
                  <div
                    className="h-2 rounded-full bg-[#8B5CF6]"
                    style={{ width: "17.8%" }}
                  />
                </div>
              </div>

            </div>
          </div>

          {/* FOOTER BOX AREA: SYSTEM REFERENCE CHESERA PHONE NUMBER LINE */}
          <div className="rounded-xl border border-slate-100 bg-[#F8FAFC] px-4 py-3.5 flex items-center justify-between">
            <div className="space-y-0.5">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tight block">
                Chesera Number
              </span>
              <span className="text-sm font-bold text-[#004BCE]">
                +1 (555) 100-0001
              </span>
            </div>
            <span className="rounded-md bg-[#E6F4EA] px-2 py-0.5 text-[11px] font-bold text-[#137333]">
              Active
            </span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
