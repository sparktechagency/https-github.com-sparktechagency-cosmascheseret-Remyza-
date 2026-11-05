"use client";

import { useState } from "react";
import { X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";

type SubscriberStatus = "Active" | "In Trial" | "Suspended";

interface Subscriber {
  id: string;
  initials: string;
  name: string;
  email: string;
  plan: "Pro" | "Trial" | "Free";
  billing: string;
  status: SubscriberStatus;
  joinedDate: string;
  avatarClass: string;
}

const subscribers: Subscriber[] = [
  { id: "1", initials: "SJ", name: "Sarah Jenkins", email: "sarah.j@vertexlabs.io", plan: "Pro", billing: "$79/month", status: "Active", joinedDate: "Apr 18, 2026", avatarClass: "bg-[#EFF6FF] text-[#2563EB]" },
  { id: "2", initials: "MV", name: "Marcus Vance", email: "m.vance@solardrive.co", plan: "Trial", billing: "14 Days Free", status: "In Trial", joinedDate: "May 04, 2026", avatarClass: "bg-[#E6F9F1] text-[#00A86B]" },
  { id: "3", initials: "ER", name: "Elena Rostova", email: "elena.rostova@nexusgroup.com", plan: "Pro", billing: "$79/month", status: "Active", joinedDate: "Mar 22, 2026", avatarClass: "bg-[#EFF6FF] text-[#2563EB]" },
  { id: "4", initials: "DK", name: "David Kim", email: "david.kim@studioflow.design", plan: "Free", billing: "$0/month", status: "Active", joinedDate: "Feb 10, 2026", avatarClass: "bg-[#F1F5F9] text-[#475569]" },
  { id: "5", initials: "PP", name: "Priya Patel", email: "patel.priya@beaconapp.org", plan: "Pro", billing: "$79/month", status: "Suspended", joinedDate: "Jan 15, 2026", avatarClass: "bg-[#FFF1F2] text-[#F43F5E]" },
];

const statusStyles: Record<SubscriberStatus, string> = {
  Active: "bg-[#E6F9F1] text-[#00A86B]",
  "In Trial": "bg-[#E6F9F1] text-[#00A86B]",
  Suspended: "bg-[#FFF1F2] text-[#F43F5E]",
};

const planStyles: Record<Subscriber["plan"], string> = {
  Pro: "bg-[#EFF6FF] text-[#2563EB]",
  Trial: "bg-[#E6F9F1] text-[#00A86B]",
  Free: "bg-[#F1F5F9] text-[#475569]",
};

export default function SubscribersList() {
  const [selectedSubscriber, setSelectedSubscriber] = useState<Subscriber | null>(null);

  return (
    <section className="w-full space-y-4">
      <div>
        <h2 className="text-lg font-bold text-[#0F172A]">Subscribers List</h2>
        <p className="mt-0.5 max-w-sm text-[13px] leading-4 text-[#64748B]">
          Manage and view all registered subscribers across active tiers
        </p>
      </div>

      <div className="overflow-hidden rounded-2xl border border-[#F1F5F9] bg-white shadow-[0px_2px_10px_-4px_rgba(0,0,0,0.05)]">
        <div className="overflow-x-auto">
          <table className="min-w-[860px] w-full text-left">
            <thead className="h-[45px] bg-[#FAFBFC] text-[11px] font-bold tracking-wide text-[#64748B]">
              <tr>
                <th className="pl-6 pr-4">USER</th>
                <th className="px-4">PLAN</th>
                <th className="px-4">BILLING</th>
                <th className="px-4">STATUS</th>
                <th className="px-4">JOINED DATE</th>
                <th className="px-4 pr-6">ACTIONS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F1F5F9]">
              {subscribers.map((subscriber) => (
                <tr key={subscriber.id} className="h-[64px]">
                  <td className="pl-6 pr-4">
                    <div className="flex items-center gap-3">
                      <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold ${subscriber.avatarClass}`}>
                        {subscriber.initials}
                      </div>
                      <div>
                        <p className="text-[14px] font-semibold leading-5 text-[#0F172A]">{subscriber.name}</p>
                        <p className="text-[11px] leading-4 text-[#94A3B8]">{subscriber.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4"><span className={`rounded-full px-2 py-1 text-[11px] font-semibold ${planStyles[subscriber.plan]}`}>{subscriber.plan}</span></td>
                  <td className="px-4 text-[12px] font-medium text-[#0F172A]">{subscriber.billing}</td>
                  <td className="px-4"><span className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-[11px] font-medium ${statusStyles[subscriber.status]}`}><span className="h-1.5 w-1.5 rounded-full bg-current" />{subscriber.status}</span></td>
                  <td className="px-4 text-[12px] text-[#64748B]">{subscriber.joinedDate}</td>
                  <td className="px-4 pr-6"><button type="button" onClick={() => setSelectedSubscriber(subscriber)} className="rounded-lg border border-[#DBEAFE] bg-[#F8FBFF] px-3 py-1 text-[12px] font-medium text-[#2563EB] transition-colors hover:bg-[#EFF6FF] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2563EB]">View</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex h-[54px] items-center justify-between border-t border-[#F1F5F9] px-6 text-[12px] text-[#64748B]">
          <p>Showing <span className="font-semibold text-[#334155]">1-5</span> of <span className="font-semibold text-[#334155]">1,204</span> subscribers</p>
          <div className="flex items-center gap-2"><button disabled className="rounded-md border border-[#E2E8F0] px-3 py-1 text-[#CBD5E1]">Previous</button><button className="rounded-md border border-[#E2E8F0] px-3 py-1 text-[#334155] hover:bg-slate-50">Next</button></div>
        </div>
      </div>

      <SubscriberDetailsDialog subscriber={selectedSubscriber} onClose={() => setSelectedSubscriber(null)} />
    </section>
  );
}

function SubscriberDetailsDialog({ subscriber, onClose }: { subscriber: Subscriber | null; onClose: () => void }) {
  const isOpen = subscriber !== null;
  const billingDate = subscriber?.plan === "Pro" ? "May 18, 2026" : "May 20, 2026";

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent showCloseButton={false} className="w-[calc(100vw-24px)] max-w-[672px] gap-0 overflow-hidden rounded-2xl border border-[#F1F5F9] bg-white p-0 shadow-[0px_25px_50px_-12px_rgba(0,0,0,0.25)] sm:max-w-[672px]">
        {subscriber && <>
          <div className="flex h-[82px] items-start border-b border-[#F1F5F9] px-6 pt-5">
            <div><DialogTitle className="text-[18px] font-semibold leading-6 text-[#0F172A]">Subscriber Details</DialogTitle><DialogDescription className="mt-1 text-[12px] text-[#64748B]">Viewing subscription and account information for {subscriber.name}</DialogDescription></div>
            <button type="button" onClick={onClose} aria-label="Close subscriber details" className="ml-auto mt-1 text-[#94A3B8] hover:text-[#475569]"><X className="h-5 w-5" /></button>
          </div>
          <div className="space-y-6 px-6 py-6">
            <div className="flex items-center gap-3 rounded-xl border border-[#EDF2F7] bg-[#F8FAFC] px-4 py-4">
              <div className={`flex h-12 w-12 items-center justify-center rounded-full text-[15px] font-semibold ${subscriber.avatarClass}`}>{subscriber.initials}</div>
              <div className="min-w-0"><div className="flex items-center gap-2"><p className="text-[16px] font-semibold text-[#0F172A]">{subscriber.name}</p><span className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-[11px] font-medium ${statusStyles[subscriber.status]}`}><span className="h-1.5 w-1.5 rounded-full bg-current" />{subscriber.status}</span></div><p className="text-[12px] text-[#64748B]">{subscriber.email} · Customer since {subscriber.joinedDate}</p></div>
              <div className="ml-auto hidden items-center gap-2 sm:flex"><span className="rounded-lg border border-[#DBEAFE] bg-[#F8FBFF] px-3 py-1 text-[12px] font-semibold text-[#2563EB]">{subscriber.plan} Tier</span><span className="rounded-lg border border-[#E2E8F0] bg-white px-3 py-1 text-[12px] font-semibold text-[#334155]">{subscriber.billing}</span></div>
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <DetailCard label="Current Plan" value={`${subscriber.plan} Plan`} helper={`Billed monthly at ${subscriber.billing.replace("/month", ".00/month")}`} />
              <DetailCard label="Billing Cycle" value={`Next: ${billingDate}`} helper="Auto-renewal enabled" accent />
              <DetailCard label="Payment Method" value="Visa •••• 4242" helper="Expires 08/2028 · Primary card" />
              <DetailCard label="Lifetime Spend" value={subscriber.plan === "Pro" ? "$474.00" : "$0.00"} helper={subscriber.plan === "Pro" ? "6 successful billing cycles" : "No successful billing cycles"} />
            </div>
          </div>
          <div className="flex h-[66px] items-center border-t border-[#F1F5F9] px-6"><button type="button" onClick={onClose} className="rounded-lg border border-[#DBEAFE] bg-white px-4 py-2 text-[12px] font-medium text-[#334155] shadow-sm hover:bg-slate-50">Close</button></div>
        </>}
      </DialogContent>
    </Dialog>
  );
}

function DetailCard({ label, value, helper, accent = false }: { label: string; value: string; helper: string; accent?: boolean }) {
  return <div className="rounded-xl border border-[#E8EEF5] px-3.5 py-3"><p className="text-[12px] text-[#94A3B8]">{label}</p><p className="mt-0.5 text-[14px] font-semibold text-[#0F172A]">{value}</p><p className={`mt-1 text-[11px] ${accent ? "text-[#00A86B]" : "text-[#64748B]"}`}>{helper}</p></div>;
}
