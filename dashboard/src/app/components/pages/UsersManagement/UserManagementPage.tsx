"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronDown, Download, Search } from "lucide-react";

import { apiRequest, formatDate, formatNumber } from "@/lib/api";
import type { AdminUserDetail, AdminUserListItem, AdminUserSummary, ApiEnvelope, PaginatedData } from "@/types/admin";
import { useDashboard } from "@/providers/DashboardStateProvider";
import DataTable, { type ColumnDef } from "../../shared/CommonTable/Data-Table";
import CustomPagination from "../../shared/custom/custom-pagination";
import DeleteUserModal from "../../shared/Modals/DeleteUserModal";
import ExportCsvModal from "../../shared/Modals/export-csv-modal";
import UserDetailsModal from "../../shared/Modals/user-details-modal";

type UserRow = AdminUserListItem & { isActive: boolean; display_status: "Active" | "Blocked" | "Trial" };
type UsersResponse = ApiEnvelope<PaginatedData<AdminUserListItem> & { summary: AdminUserSummary }>;

const EMPTY_SUMMARY: AdminUserSummary = { total_users: 0, total_active: 0, total_blocked: 0, total_on_trial: 0 };
const PAGE_SIZE = 10;

export default function UserManagement() {
  const [rows, setRows] = useState<UserRow[]>([]);
  const [summary, setSummary] = useState(EMPTY_SUMMARY);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [plan, setPlan] = useState("");
  const [activeFilter, setActiveFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const requestSequence = useRef(0);
  const [selectedUser, setSelectedUser] = useState<AdminUserDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string; email: string } | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const { isExportModalOpen, setIsExportModalOpen, isViewModalOpen, setIsViewModalOpen } = useDashboard();

  const loadUsers = useCallback(async () => {
    const sequence = ++requestSequence.current;
    setLoading(true);
    setError("");
    const params = new URLSearchParams({ page: String(page), page_size: String(PAGE_SIZE) });
    if (search.trim()) params.set("search", search.trim());
    if (plan) params.set("plan", plan);
    if (activeFilter) params.set("is_active", activeFilter);
    try {
      const response = await apiRequest<UsersResponse>(`admin/users/?${params}`);
      if (sequence !== requestSequence.current) return;
      setRows(response.data.results.map((user) => ({ ...user, isActive: user.is_active, display_status: !user.is_active ? "Blocked" : user.plan === "trial" ? "Trial" : "Active" })));
      setSummary(response.data.summary);
      setTotal(response.data.count);
    } catch (cause) {
      if (sequence === requestSequence.current) setError(cause instanceof Error ? cause.message : "Unable to load users.");
    } finally {
      if (sequence === requestSequence.current) setLoading(false);
    }
  }, [page, search, plan, activeFilter]);

  useEffect(() => { const timer = window.setTimeout(loadUsers, search ? 350 : 0); return () => window.clearTimeout(timer); }, [loadUsers, search]);

  const viewUser = async (row: UserRow) => {
    setSelectedUser(null); setDetailLoading(true); setIsViewModalOpen(true);
    try { const response = await apiRequest<ApiEnvelope<AdminUserDetail>>(`admin/users/${row.id}/`); setSelectedUser(response.data); }
    catch (cause) { setError(cause instanceof Error ? cause.message : "Unable to load user details."); setIsViewModalOpen(false); }
    finally { setDetailLoading(false); }
  };

  const toggleStatus = async (row: UserRow, checked: boolean) => {
    setRows((current) => current.map((item) => item.id === row.id ? { ...item, isActive: checked, is_active: checked, display_status: checked ? (item.plan === "trial" ? "Trial" : "Active") : "Blocked" } : item));
    try { await apiRequest(`admin/users/${row.id}/`, { method: "PATCH", body: JSON.stringify({ is_active: checked }) }); await loadUsers(); }
    catch (cause) { setError(cause instanceof Error ? cause.message : "Unable to update the user."); await loadUsers(); }
  };

  const deleteUser = async (id: string) => {
    try { await apiRequest(`admin/users/${id}/`, { method: "DELETE" }); setDeleteOpen(false); setDeleteTarget(null); if (rows.length === 1 && page > 1) setPage((value) => value - 1); else await loadUsers(); }
    catch (cause) { setError(cause instanceof Error ? cause.message : "Unable to delete the user."); }
  };

  const exportUsers = async ({ fileFormat, delimiter, columns, dateRange }: { fileFormat: string; delimiter: string; columns: string[]; dateRange: string }) => {
    const params = new URLSearchParams({ format: fileFormat, delimiter, columns: columns.join(","), date_range: dateRange });
    if (search.trim()) params.set("search", search.trim()); if (plan) params.set("plan", plan); if (activeFilter) params.set("is_active", activeFilter);
    const response = await fetch(`/api/backend/admin/users/export/?${params}`);
    if (!response.ok) { const payload = await response.json().catch(() => ({})); throw new Error(payload.detail || "Unable to export users."); }
    const blob = await response.blob(); const url = URL.createObjectURL(blob); const anchor = document.createElement("a");
    anchor.href = url; anchor.download = fileFormat === "xlsx" ? "chesera-users.xlsx" : "chesera-users.csv"; anchor.click(); URL.revokeObjectURL(url); setIsExportModalOpen(false);
  };

  const columns: ColumnDef<UserRow>[] = [
    { header: "ID", accessorKey: "user_id", cell: (row) => <span className="text-slate-400">USR-{String(row.user_id).padStart(4, "0")}</span> },
    { header: "User", accessorKey: "custom_user", cell: (row) => <div className="flex items-center gap-3">{row.profile_pic ? <img src={row.profile_pic} alt="" className="h-8 w-8 rounded-full object-cover" /> : <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-700 text-xs font-bold text-white">{initials(row.user_name)}</div>}<div><p className="font-semibold text-slate-900">{row.user_name || "Unnamed user"}</p><p className="text-xs text-slate-400">{row.business_name || "No business"}</p></div></div> },
    { header: "Email", accessorKey: "email", cell: (row) => row.email || "—" },
    { header: "Phone", accessorKey: "phone" },
    { header: "Plan", accessorKey: "plan", cell: (row) => <Badge tone={row.plan === "pro" ? "blue" : row.plan === "trial" ? "gold" : "gray"}>{title(row.plan)}</Badge> },
    { header: "Messages", accessorKey: "messages_sent_count", cell: (row) => formatNumber(row.messages_sent_count) },
    { header: "Leads", accessorKey: "leads_count", cell: (row) => formatNumber(row.leads_count) },
    { header: "Status", accessorKey: "display_status", cell: (row) => <Badge tone={row.display_status === "Active" ? "green" : row.display_status === "Trial" ? "gold" : "red"}>{row.display_status}</Badge> },
    { header: "Joined", accessorKey: "joined_date", cell: (row) => formatDate(row.joined_date) },
    { header: "Action", accessorKey: "action", align: "right" },
  ];

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  return <div className="space-y-5">
    <div className="flex flex-col items-center justify-between gap-3 md:flex-row">
      <div className="relative w-full md:max-w-md"><Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" /><input value={search} onChange={(event) => { setSearch(event.target.value); setPage(1); }} placeholder="Search name, email, phone or business" className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-11 pr-4 text-sm outline-none focus:ring-2 focus:ring-blue-100" /></div>
      <div className="flex w-full flex-wrap justify-end gap-2 md:w-auto"><Select value={plan} onChange={(value) => { setPlan(value); setPage(1); }} options={[["", "All plans"], ["pro", "Pro"], ["trial", "Trial"], ["free", "Free"]]} /><Select value={activeFilter} onChange={(value) => { setActiveFilter(value); setPage(1); }} options={[["", "All statuses"], ["true", "Active"], ["false", "Blocked"]]} /><button onClick={() => setIsExportModalOpen(true)} className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-blue-700"><Download className="h-4 w-4" />Export</button></div>
    </div>
    {error && <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}
    <div className="flex flex-wrap gap-3 rounded-2xl border border-slate-100 bg-white px-6 py-3.5"><Counter tone="blue" label="Total" value={summary.total_users} /><Counter tone="green" label="Active" value={summary.total_active} /><Counter tone="red" label="Blocked" value={summary.total_blocked} /><Counter tone="gold" label="Trial" value={summary.total_on_trial} /></div>
    <div className="rounded-2xl border border-slate-100 bg-white">{loading ? <div className="p-12 text-center text-sm text-slate-500">Loading users…</div> : <DataTable title="Users" columns={columns} data={rows} onStatusToggle={toggleStatus} onRowView={viewUser} onRowDelete={(row) => { setDeleteTarget({ id: String(row.id), name: row.user_name, email: row.email || "" }); setDeleteOpen(true); }} />}<CustomPagination currentPage={page} totalPages={totalPages} totalEntries={total} entriesPerPage={PAGE_SIZE} onPageChange={setPage} /></div>
    <ExportCsvModal isOpen={isExportModalOpen} onClose={() => setIsExportModalOpen(false)} onConfirm={exportUsers} totalRecords={total} />
    <UserDetailsModal isOpen={isViewModalOpen} userData={selectedUser} isLoading={detailLoading} onClose={() => { setIsViewModalOpen(false); setSelectedUser(null); }} />
    <DeleteUserModal isOpen={deleteOpen} userToConfirm={deleteTarget} onConfirmDelete={deleteUser} onClose={() => { setDeleteOpen(false); setDeleteTarget(null); }} />
  </div>;
}

function initials(name: string) { return (name || "U").split(/\s+/).slice(0, 2).map((part) => part[0]).join("").toUpperCase(); }
function title(value: string) { return value.replaceAll("_", " ").replace(/\b\w/g, (letter) => letter.toUpperCase()); }
function Badge({ children, tone }: { children: React.ReactNode; tone: "blue" | "green" | "red" | "gold" | "gray" }) { const styles = { blue: "bg-blue-50 text-blue-700", green: "bg-green-50 text-green-700", red: "bg-red-50 text-red-700", gold: "bg-amber-50 text-amber-700", gray: "bg-slate-100 text-slate-600" }; return <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${styles[tone]}`}>{children}</span>; }
function Counter({ label, value, tone }: { label: string; value: number; tone: "blue" | "green" | "red" | "gold" }) { const styles = { blue: "bg-indigo-50 text-indigo-700", green: "bg-green-50 text-green-700", red: "bg-red-50 text-red-700", gold: "bg-amber-50 text-amber-700" }; return <span className={`rounded-full px-3 py-1 text-xs font-bold ${styles[tone]}`}>{label}: {formatNumber(value)}</span>; }
function Select({ value, onChange, options }: { value: string; onChange: (value: string) => void; options: string[][] }) { return <div className="relative"><select value={value} onChange={(event) => onChange(event.target.value)} className="appearance-none rounded-xl border border-slate-200 bg-white py-2.5 pl-4 pr-10 text-sm text-slate-600 outline-none">{options.map(([optionValue, label]) => <option key={optionValue} value={optionValue}>{label}</option>)}</select><ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" /></div>; }
