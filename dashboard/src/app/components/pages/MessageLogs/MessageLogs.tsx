"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { ArrowDownLeft, ArrowUpRight, CheckCircle2, MessageSquare, Search, XCircle } from "lucide-react";
import DataTable, { type ColumnDef } from "../../shared/CommonTable/Data-Table";
import CustomPagination from "../../shared/custom/custom-pagination";
import { DetailViewExample } from "../../shared/Modals/DetailViewExample";
import { ConversationThreadModal } from "../../shared/Modals/ConversationThreadModal";
import { UserProfileModal } from "../../shared/Modals/UserProfileModal";
import { apiRequest, formatDate, formatNumber } from "@/lib/api";
import type { AdminMessageDetail, AdminMessageListItem, ApiEnvelope } from "@/types/admin";

interface MessageListData {
  summary: { total_messages: number; delivered_or_sent_messages: number; failed_messages: number };
  count: number;
  next: string | null;
  previous: string | null;
  results: AdminMessageListItem[];
}

export default function MessageLogs() {
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [status, setStatus] = useState("");
  const [direction, setDirection] = useState("");
  const [channel, setChannel] = useState("");
  const [page, setPage] = useState(1);
  const [data, setData] = useState<MessageListData>({ summary: { total_messages: 0, delivered_or_sent_messages: 0, failed_messages: 0 }, count: 0, next: null, previous: null, results: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selected, setSelected] = useState<AdminMessageDetail | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [conversationOpen, setConversationOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const pageSize = 10;

  useEffect(() => { const timer = setTimeout(() => { setDebouncedSearch(search); setPage(1); }, 350); return () => clearTimeout(timer); }, [search]);
  const load = useCallback(async () => {
    setLoading(true); setError("");
    const params = new URLSearchParams({ page: String(page), page_size: String(pageSize) });
    if (debouncedSearch) params.set("search", debouncedSearch);
    if (status) params.set("status", status);
    if (direction) params.set("direction", direction);
    if (channel) params.set("channel", channel);
    try { const response = await apiRequest<ApiEnvelope<MessageListData>>(`admin/messages/?${params}`); setData(response.data); }
    catch (err) { setError(err instanceof Error ? err.message : "Unable to load messages."); }
    finally { setLoading(false); }
  }, [page, debouncedSearch, status, direction, channel]);
  useEffect(() => { void load(); }, [load]);

  const inspect = async (row: AdminMessageListItem) => {
    setDetailOpen(true); setDetailLoading(true); setSelected(null);
    try { const response = await apiRequest<ApiEnvelope<AdminMessageDetail>>(`admin/messages/${row.id}/`); setSelected(response.data); }
    catch (err) { setError(err instanceof Error ? err.message : "Unable to load message details."); setDetailOpen(false); }
    finally { setDetailLoading(false); }
  };
  const columns = useMemo<ColumnDef<AdminMessageListItem>[]>(() => [
    { header: "ID", accessorKey: "id" },
    { header: "User", accessorKey: "user", cell: (row) => <div><p className="font-bold text-slate-900">{row.user.name || "Unknown user"}</p><p className="text-[11px] text-slate-400">{row.user.phone}</p></div> },
    { header: "Contact", accessorKey: "contact", cell: (row) => <div><p className="font-bold text-slate-900">{row.contact.name || "Unknown contact"}</p><p className="text-[11px] text-slate-400">{row.contact.phone}</p></div> },
    { header: "Message", accessorKey: "message", cell: (row) => <p title={row.message} className="max-w-72 truncate text-slate-500">{row.message}</p> },
    { header: "Direction", accessorKey: "direction", cell: (row) => <span className={`inline-flex items-center gap-1 font-bold capitalize ${row.direction.toLowerCase() === "sent" ? "text-blue-600" : "text-emerald-600"}`}>{row.direction.toLowerCase() === "sent" ? <ArrowUpRight className="h-3.5 w-3.5" /> : <ArrowDownLeft className="h-3.5 w-3.5" />}{row.direction}</span> },
    { header: "Status", accessorKey: "status", cell: (row) => <span className={`rounded-lg px-2.5 py-1 text-[11px] font-bold capitalize ${row.status.toLowerCase() === "failed" ? "bg-rose-50 text-rose-600" : "bg-emerald-50 text-emerald-600"}`}>{row.status}</span> },
    { header: "Timestamp", accessorKey: "timestamp", cell: (row) => <span className="text-xs text-slate-400">{formatDate(row.timestamp)}</span> },
    { header: "Action", accessorKey: "action", align: "right", showView: true, showDelete: false, showToggle: false },
  ], []);
  const totalPages = Math.max(1, Math.ceil(data.count / pageSize));

  return <div className="w-full space-y-6 bg-slate-50/50">
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
      <SummaryCard icon={<MessageSquare className="h-5 w-5" />} value={data.summary.total_messages} label="Total Messages" color="blue" />
      <SummaryCard icon={<CheckCircle2 className="h-5 w-5" />} value={data.summary.delivered_or_sent_messages} label="Delivered / Sent" color="green" />
      <SummaryCard icon={<XCircle className="h-5 w-5" />} value={data.summary.failed_messages} label="Failed" color="red" />
    </div>
    <div className="bg-white rounded-[24px] border border-slate-100 overflow-hidden">
      <div className="p-5 border-b flex flex-col xl:flex-row gap-3">
        <div className="relative flex-1"><Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" /><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search message, user, contact or phone..." className="w-full pl-10 pr-4 py-2.5 rounded-xl border text-xs font-semibold" /></div>
        <Filter value={status} onChange={(value) => { setStatus(value); setPage(1); }} label="All statuses" options={["sent", "delivered", "failed", "received", "queued"]} />
        <Filter value={direction} onChange={(value) => { setDirection(value); setPage(1); }} label="All directions" options={["sent", "received"]} />
        <Filter value={channel} onChange={(value) => { setChannel(value); setPage(1); }} label="All channels" options={["sms", "rcs", "whatsapp"]} />
      </div>
      {error && <p className="px-6 py-3 text-sm text-rose-600 bg-rose-50">{error}</p>}
      {loading ? <p className="p-10 text-center text-sm text-slate-400">Loading messages...</p> : <DataTable title="Message Logs" columns={columns} data={data.results} onRowView={(row) => void inspect(row)} />}
      <CustomPagination currentPage={page} entriesPerPage={pageSize} totalEntries={data.count} totalPages={totalPages} onPageChange={setPage} itemLabel="messages" />
    </div>
    <DetailViewExample isOpen={detailOpen} onClose={() => setDetailOpen(false)} data={selected} loading={detailLoading} onViewUser={() => { setDetailOpen(false); setProfileOpen(true); }} onViewConversation={() => { setDetailOpen(false); setConversationOpen(true); }} />
    <ConversationThreadModal isOpen={conversationOpen} onClose={() => setConversationOpen(false)} conversationId={selected?.conversation_id} onViewUser={() => { setConversationOpen(false); setProfileOpen(true); }} />
    <UserProfileModal isOpen={profileOpen} onClose={() => setProfileOpen(false)} onViewConversation={() => { setProfileOpen(false); setConversationOpen(true); }} />
  </div>;
}

function SummaryCard({ icon, value, label, color }: { icon: React.ReactNode; value: number; label: string; color: "blue" | "green" | "red" }) { const colors = { blue: "bg-blue-50 text-blue-600", green: "bg-emerald-50 text-emerald-600", red: "bg-rose-50 text-rose-600" }; return <div className="bg-white rounded-[22px] border p-5 space-y-4"><div className={`flex h-10 w-10 items-center justify-center rounded-xl ${colors[color]}`}>{icon}</div><div><h4 className="text-2xl font-extrabold">{formatNumber(value)}</h4><p className="text-[13px] text-slate-400">{label}</p></div></div>; }
function Filter({ value, onChange, label, options }: { value: string; onChange: (value: string) => void; label: string; options: string[] }) { return <select value={value} onChange={(e) => onChange(e.target.value)} className="rounded-xl border px-3 py-2.5 text-xs font-semibold capitalize"><option value="">{label}</option>{options.map((option) => <option key={option} value={option}>{option}</option>)}</select>; }
