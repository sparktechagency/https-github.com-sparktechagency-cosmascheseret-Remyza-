"use client";

import { useEffect, useState } from "react";
import { apiRequest, formatDate, formatNumber } from "@/lib/api";
import type { AdminUserDetail, AdminUserListItem, ApiEnvelope, PaginatedData } from "@/types/admin";
import DataTable, { type ColumnDef } from "../../shared/CommonTable/Data-Table";
import UserDetailsModal from "../../shared/Modals/user-details-modal";

type Row = AdminUserListItem & { isActive: boolean };

export default function RecentUsersSection() {
  const [rows, setRows] = useState<Row[]>([]); const [error, setError] = useState(""); const [selected, setSelected] = useState<AdminUserDetail | null>(null); const [open, setOpen] = useState(false); const [detailLoading, setDetailLoading] = useState(false);
  useEffect(() => { apiRequest<ApiEnvelope<PaginatedData<AdminUserListItem>>>("admin/users/?page=1&page_size=5").then((response) => setRows(response.data.results.map((row) => ({ ...row, isActive: row.is_active })))).catch((cause) => setError(cause instanceof Error ? cause.message : "Unable to load recent users.")); }, []);
  const view = async (row: Row) => { setOpen(true); setDetailLoading(true); setSelected(null); try { const response = await apiRequest<ApiEnvelope<AdminUserDetail>>(`admin/users/${row.id}/`); setSelected(response.data); } finally { setDetailLoading(false); } };
  const columns: ColumnDef<Row>[] = [
    { header: "User", accessorKey: "custom_user", cell: (row) => <div><p className="font-semibold text-slate-900">{row.user_name || "Unnamed user"}</p><p className="text-xs text-slate-400">{row.business_name || "No business"}</p></div> },
    { header: "Email", accessorKey: "email", cell: (row) => row.email || "—" }, { header: "Phone", accessorKey: "phone" },
    { header: "Plan", accessorKey: "plan", cell: (row) => <span className="rounded-full bg-blue-50 px-2 py-1 text-xs font-semibold text-blue-700">{row.plan.toUpperCase()}</span> },
    { header: "Messages", accessorKey: "messages_sent_count", cell: (row) => formatNumber(row.messages_sent_count) }, { header: "Leads", accessorKey: "leads_count" },
    { header: "Joined", accessorKey: "joined_date", cell: (row) => formatDate(row.joined_date) }, { header: "Action", accessorKey: "action", showToggle: false, showDelete: false },
  ];
  return <>{error && <div className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</div>}<DataTable title="Recent Users" viewAllHref="/dashboard/users-manage" columns={columns} data={rows} onRowView={view} /><UserDetailsModal isOpen={open} userData={selected} isLoading={detailLoading} onClose={() => { setOpen(false); setSelected(null); }} /></>;
}
