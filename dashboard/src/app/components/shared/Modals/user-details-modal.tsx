"use client";

import { Calendar, MessageSquare, Percent, Target } from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { formatDate, formatNumber } from "@/lib/api";
import type { AdminUserDetail } from "@/types/admin";

export default function UserDetailsModal({ isOpen, onClose, userData, isLoading = false }: { isOpen: boolean; onClose: () => void; userData: AdminUserDetail | null; isLoading?: boolean }) {
  return <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
    <DialogContent className="w-[94vw] max-w-3xl overflow-hidden rounded-3xl border-0 bg-white p-0 shadow-2xl">
      <div className="border-b border-slate-100 px-6 py-5"><DialogTitle className="text-lg font-bold text-slate-900">User Details</DialogTitle></div>
      {isLoading ? <div className="p-12 text-center text-sm text-slate-500">Loading user details…</div> : userData ? <div className="max-h-[78vh] space-y-6 overflow-y-auto p-6">
        <div className="flex flex-wrap items-center gap-4">
          {userData.profile_picture ? <img src={userData.profile_picture} alt="" className="h-14 w-14 rounded-full object-cover" /> : <div className="flex h-14 w-14 items-center justify-center rounded-full bg-blue-700 text-lg font-bold text-white">{initials(userData.full_name)}</div>}
          <div><h3 className="text-lg font-bold text-slate-900">{userData.full_name || "Unnamed user"}</h3><p className="text-sm text-slate-500">{userData.email || "No email"} · {userData.phone_number}</p><p className="text-sm text-slate-500">{userData.business_name || "No business profile"}</p></div>
          <div className="ml-auto flex gap-2"><Badge>{title(userData.plan)}</Badge><Badge tone={userData.is_active ? "green" : "red"}>{userData.is_active ? "Active" : "Blocked"}</Badge></div>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Metric icon={<MessageSquare className="h-4 w-4" />} label="Messages sent" value={formatNumber(userData.messages_sent_count)} />
          <Metric icon={<Target className="h-4 w-4" />} label="Leads" value={formatNumber(userData.leads_count)} />
          <Metric icon={<Calendar className="h-4 w-4" />} label="Days active" value={formatNumber(userData.days_active)} />
          <Metric icon={<Percent className="h-4 w-4" />} label="Response rate" value={`${userData.response_rate}%`} />
        </div>
        <Section heading="Account information">
          <Field label="Business type" value={userData.business_type} /><Field label="Timezone" value={userData.timezone} />
          <Field label="Location" value={[userData.city, userData.country].filter(Boolean).join(", ")} /><Field label="Joined" value={formatDate(userData.joined_date)} />
          <Field label="Last active" value={userData.last_active} /><Field label="Phone verified" value={userData.is_phone_verified ? "Yes" : "No"} />
        </Section>
        <Section heading="Subscription">
          <Field label="Plan" value={title(userData.subscription?.plan || userData.plan)} /><Field label="Price" value={userData.subscription?.price} />
          <Field label="Start date" value={formatDate(userData.subscription?.start_date)} /><Field label="Next renewal" value={formatDate(userData.subscription?.next_renewal)} />
          <Field label="Store" value={userData.subscription?.medium} /><Field label="Status" value={userData.subscription?.status || "No subscription"} />
        </Section>
        <div className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3"><div><p className="text-xs font-bold uppercase text-slate-400">Chesera number</p><p className="font-semibold text-blue-700">{userData.chesera_number || "Not assigned"}</p></div><Badge tone={userData.chesera_number ? "green" : "gray"}>{userData.chesera_number ? "Assigned" : "Pending"}</Badge></div>
      </div> : <div className="p-12 text-center text-sm text-slate-500">User details are unavailable.</div>}
    </DialogContent>
  </Dialog>;
}

function initials(name: string) { return (name || "U").split(/\s+/).slice(0, 2).map((part) => part[0]).join("").toUpperCase(); }
function title(value?: string | null) { return value ? value.replaceAll("_", " ").replace(/\b\w/g, (letter) => letter.toUpperCase()) : "—"; }
function Badge({ children, tone = "blue" }: { children: React.ReactNode; tone?: "blue" | "green" | "red" | "gray" }) { const styles = { blue: "bg-blue-50 text-blue-700", green: "bg-emerald-50 text-emerald-700", red: "bg-red-50 text-red-700", gray: "bg-slate-100 text-slate-600" }; return <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${styles[tone]}`}>{children}</span>; }
function Metric({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) { return <div className="rounded-xl bg-slate-50 p-3 text-center"><div className="mx-auto mb-1 flex h-7 w-7 items-center justify-center rounded-lg bg-white text-blue-700">{icon}</div><p className="font-bold text-slate-900">{value}</p><p className="text-xs text-slate-500">{label}</p></div>; }
function Section({ heading, children }: { heading: string; children: React.ReactNode }) { return <section><h4 className="mb-3 text-xs font-bold uppercase tracking-wide text-slate-400">{heading}</h4><div className="grid grid-cols-1 gap-x-8 gap-y-4 rounded-xl border border-slate-100 p-4 sm:grid-cols-2">{children}</div></section>; }
function Field({ label, value }: { label: string; value?: string | null }) { return <div><p className="text-xs font-medium text-slate-400">{label}</p><p className="mt-0.5 text-sm font-semibold text-slate-700">{value || "—"}</p></div>; }
