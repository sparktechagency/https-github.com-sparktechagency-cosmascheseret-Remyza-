"use client";

import React, { useState, useMemo } from "react";
import { Search, ChevronDown, Download } from "lucide-react";
import DataTable, { ColumnDef } from "../../shared/CommonTable/Data-Table";
import CustomPagination from "../../shared/custom/custom-pagination";
import { useDashboard } from "@/providers/DashboardStateProvider";
import ExportCsvModal from "../../shared/Modals/export-csv-modal";
import UserDetailsModal from "../../shared/Modals/user-details-modal";
import DeleteUserModal from "../../shared/Modals/DeleteUserModal";

// User Data Struct Contract
interface UserManagementRow {
  id: string;
  sid: string;
  name: string;
  company: string;
  email: string;
  phone: string;
  plan: "Pro" | "Enterprise" | "Free";
  messages: string;
  leads: number;
  status: "Active" | "Blocked" | "Trial";
  joined: string;
  isActive: boolean;
}

// Complete dataset generated exactly from your design image reference rows
const initialDataset: UserManagementRow[] = [
  {
    id: "1",
    sid: "USR-001",
    name: "Alex Johnson",
    company: "Johnson Realty",
    email: "alex@johnsonrealty.com",
    phone: "+1 (555) 234-5678",
    plan: "Pro",
    messages: "1,247",
    leads: 89,
    status: "Active",
    joined: "Jan 15, 2026",
    isActive: true,
  },
  {
    id: "2",
    sid: "USR-001",
    name: "Alex Johnson",
    company: "Johnson Realty",
    email: "alex@johnsonrealty.com",
    phone: "+1 (555) 234-5678",
    plan: "Pro",
    messages: "1,247",
    leads: 89,
    status: "Trial",
    joined: "Jan 15, 2026",
    isActive: true,
  },
  {
    id: "3",
    sid: "USR-001",
    name: "Alex Johnson",
    company: "Johnson Realty",
    email: "alex@johnsonrealty.com",
    phone: "+1 (555) 234-5678",
    plan: "Pro",
    messages: "1,247",
    leads: 89,
    status: "Blocked",
    joined: "Jan 15, 2026",
    isActive: false,
  },
  {
    id: "4",
    sid: "USR-001",
    name: "Alex Johnson",
    company: "Johnson Realty",
    email: "alex@johnsonrealty.com",
    phone: "+1 (555) 234-5678",
    plan: "Pro",
    messages: "1,247",
    leads: 89,
    status: "Active",
    joined: "Jan 15, 2026",
    isActive: true,
  },
  {
    id: "5",
    sid: "USR-001",
    name: "Alex Johnson",
    company: "Johnson Realty",
    email: "alex@johnsonrealty.com",
    phone: "+1 (555) 234-5678",
    plan: "Pro",
    messages: "1,247",
    leads: 89,
    status: "Active",
    joined: "Jan 15, 2026",
    isActive: true,
  },
  {
    id: "6",
    sid: "USR-001",
    name: "Alex Johnson",
    company: "Johnson Realty",
    email: "alex@johnsonrealty.com",
    phone: "+1 (555) 234-5678",
    plan: "Pro",
    messages: "1,247",
    leads: 89,
    status: "Blocked",
    joined: "Jan 15, 2026",
    isActive: false,
  },
  {
    id: "7",
    sid: "USR-001",
    name: "Alex Johnson",
    company: "Johnson Realty",
    email: "alex@johnsonrealty.com",
    phone: "+1 (555) 234-5678",
    plan: "Pro",
    messages: "1,247",
    leads: 89,
    status: "Active",
    joined: "Jan 15, 2026",
    isActive: true,
  },
  {
    id: "8",
    sid: "USR-001",
    name: "Alex Johnson",
    company: "Johnson Realty",
    email: "alex@johnsonrealty.com",
    phone: "+1 (555) 234-5678",
    plan: "Pro",
    messages: "1,247",
    leads: 89,
    status: "Trial",
    joined: "Jan 15, 2026",
    isActive: true,
  },
  {
    id: "9",
    sid: "USR-001",
    name: "Alex Johnson",
    company: "Johnson Realty",
    email: "alex@johnsonrealty.com",
    phone: "+1 (555) 234-5678",
    plan: "Pro",
    messages: "1,247",
    leads: 89,
    status: "Blocked",
    joined: "Jan 15, 2026",
    isActive: false,
  },
  {
    id: "10",
    sid: "USR-001",
    name: "Alex Johnson",
    company: "Johnson Realty",
    email: "alex@johnsonrealty.com",
    phone: "+1 (555) 234-5678",
    plan: "Pro",
    messages: "1,247",
    leads: 89,
    status: "Active",
    joined: "Jan 15, 2026",
    isActive: true,
  },
];

export default function UserManagement() {
  const [data, setData] = useState<UserManagementRow[]>(initialDataset);

  // Filtering States
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPlan, setSelectedPlan] = useState("All Plans");
  const [selectedStatus, setSelectedStatus] = useState("All Status");

  // Operational Modal Selected Trackers
  const [userForDeletion, setUserForDeletion] = useState<{
    id: string;
    name: string;
    email: string;
  } | null>(null);
  const [userForViewing, setUserForViewing] =
    useState<UserManagementRow | null>(null);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  // Context Provider Global Open Overlays
  const {
    isExportModalOpen,
    setIsExportModalOpen,
    isViewModalOpen,
    setIsViewModalOpen,
  } = useDashboard();

  const [currentPage, setCurrentPage] = useState(1);
  const entriesPerPage = 10;

  // 1. Live Counters Analytics Computation
  const counters = useMemo(() => {
    return {
      total: data.length,
      active: data.filter((u) => u.status === "Active").length,
      blocked: data.filter((u) => u.status === "Blocked").length,
      trial: data.filter((u) => u.status === "Trial").length,
    };
  }, [data]);

  const filteredData = useMemo(() => {
    return data.filter((user) => {
      const matchesSearch =
        user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.phone.includes(searchQuery);

      const matchesPlan =
        selectedPlan === "All Plans" || user.plan === selectedPlan;
      const matchesStatus =
        selectedStatus === "All Status" || user.status === selectedStatus;

      return matchesSearch && matchesPlan && matchesStatus;
    });
  }, [data, searchQuery, selectedPlan, selectedStatus]);

  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * entriesPerPage;
    return filteredData.slice(startIndex, startIndex + entriesPerPage);
  }, [filteredData, currentPage]);

  const totalPages = Math.ceil(filteredData.length / entriesPerPage) || 1;

  // Handles updates passing through the active switches inside the table rows
  const handleStatusToggle = (
    targetRow: UserManagementRow,
    checked: boolean,
  ) => {
    setData((prev) =>
      prev.map((user) =>
        user.id === targetRow.id
          ? {
              ...user,
              isActive: checked,
              status: checked ? "Active" : "Blocked",
            }
          : user,
      ),
    );
  };

  // Securely processes explicit deletions received from the validation modal
  const handleRowDeleteConfirm = (userId: string) => {
    setData((prev) => prev.filter((user) => user.id !== userId));
    setIsDeleteModalOpen(false);
    setUserForDeletion(null);
  };

  // Safe fallback utility if standalone custom components use download context hooks
  const handleCsvExportFallback = () => {
    const headers = [
      "S.ID,User Name,Company,Email,Phone,Plan,Messages,Leads,Status,Joined\n",
    ];
    const rows = filteredData.map(
      (u) =>
        `"${u.sid}","${u.name}","${u.company}","${u.email}","${u.phone}","${u.plan}","${u.messages}",${u.leads},"${u.status}","${u.joined}"`,
    );

    const blob = new Blob([headers.concat(rows.join("\n")).join("")], {
      type: "text/csv;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `User_Export_${new Date().toISOString().slice(0, 10)}.csv`,
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setIsExportModalOpen(false);
  };

  const handleRowView = (targetRow: UserManagementRow) => {
    setUserForViewing(targetRow);
    setIsViewModalOpen(true);
  };

  const columns: ColumnDef<UserManagementRow>[] = [
    {
      header: "S.ID",
      accessorKey: "sid",
      cell: (row) => (
        <span className="text-slate-400 font-normal">{row.sid}</span>
      ),
    },
    {
      header: "User",
      accessorKey: "custom_user",
      cell: (row) => (
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#004BCE] text-[11px] font-bold text-white">
            AJ
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-[#0F172A] text-[13px] leading-snug">
              {row.name}
            </span>
            <span className="text-[11px] text-slate-400 font-medium">
              {row.company}
            </span>
          </div>
        </div>
      ),
    },
    { header: "Email", accessorKey: "email" },
    { header: "Phone", accessorKey: "phone" },
    {
      header: "Plan",
      accessorKey: "plan",
      cell: (row) => (
        <span className="inline-flex items-center rounded-md bg-[#EFF6FF] px-2.5 py-0.5 text-xs font-semibold text-[#2563EB]">
          {row.plan}
        </span>
      ),
    },
    { header: "Messages", accessorKey: "messages" },
    { header: "Leads", accessorKey: "leads" },
    {
      header: "Status",
      accessorKey: "status",
      cell: (row) => {
        const style = {
          Active: "bg-[#E6F4EA] text-[#137333]",
          Blocked: "bg-[#FCE8E6] text-[#C5221F]",
          Trial: "bg-[#FEF7E0] text-[#B06000]",
        }[row.status];
        return (
          <span
            className={`inline-flex items-center rounded px-2 py-0.5 text-[11px] font-bold ${style}`}
          >
            {row.status}
          </span>
        );
      },
    },
    { header: "Joined", accessorKey: "joined" },
    { header: "Action", accessorKey: "action" },
  ];

  return (
    <div className="space-y-5">
      {/* Top Filter and Search Action Layout Block */}
      <div className="flex flex-col md:flex-row gap-3 items-center justify-between w-full">
        <div className="relative w-full md:max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by name, email or phone"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm font-medium text-[#0F172A] placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-100 bg-white"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto justify-end">
          <div className="relative">
            <select
              value={selectedPlan}
              onChange={(e) => {
                setSelectedPlan(e.target.value);
                setCurrentPage(1);
              }}
              className="appearance-none rounded-xl border border-slate-200 bg-white pl-4 pr-10 py-2.5 text-sm font-medium text-[#64748B] focus:outline-none focus:ring-2 focus:ring-slate-100 cursor-pointer"
            >
              <option>All Plans</option>
              <option>Pro</option>
              <option>Enterprise</option>
              <option>Free</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
          </div>

          <div className="relative">
            <select
              value={selectedStatus}
              onChange={(e) => {
                setSelectedStatus(e.target.value);
                setCurrentPage(1);
              }}
              className="appearance-none rounded-xl border border-slate-200 bg-white pl-4 pr-10 py-2.5 text-sm font-medium text-[#64748B] focus:outline-none focus:ring-2 focus:ring-slate-100 cursor-pointer"
            >
              <option>All Status</option>
              <option>Active</option>
              <option>Blocked</option>
              <option>Trial</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
          </div>

          <button
            onClick={() => setIsExportModalOpen(true)}
            className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-[#004BCE] hover:bg-slate-50 transition-colors focus:outline-none"
          >
            <Download className="h-4 w-4" />
            <span>Export CSV</span>
          </button>

          <ExportCsvModal
            isOpen={isExportModalOpen}
            onClose={() => setIsExportModalOpen(false)}
            onConfirm={handleCsvExportFallback}
            dataToExport={filteredData}
          />
        </div>
      </div>

      {/* Counter Analytics Status Pill Panel */}
      <div className="w-full rounded-2xl border border-slate-100 bg-white px-6 py-3.5 flex flex-wrap items-center gap-3 shadow-[0_2px_8px_rgba(0,0,0,0.01)]">
        <span className="rounded-full bg-[#EEF2FF] px-3 py-1 text-xs font-bold text-[#4F46E5]">
          Total: {counters.total}
        </span>
        <span className="rounded-full bg-[#E6F4EA] px-3 py-1 text-xs font-bold text-[#137333]">
          Active: {counters.active}
        </span>
        <span className="rounded-full bg-[#FCE8E6] px-3 py-1 text-xs font-bold text-[#C5221F]">
          Blocked: {counters.blocked}
        </span>
        <span className="rounded-full bg-[#FEF7E0] px-3 py-1 text-xs font-bold text-[#B06000]">
          Trial: {counters.trial}
        </span>
      </div>

      {/* Main Table Grid Card Frame with Pagination Footer and Overlays */}
      <div className="border border-slate-100 rounded-2xl bg-white shadow-[0_2px_8px_rgba(0,0,0,0.02)]">
        <DataTable
          title="Recent Users"
          columns={columns}
          data={paginatedData}
          onStatusToggle={handleStatusToggle}
          onRowDelete={(user) => {
            setUserForDeletion({
              id: user.id,
              name: user.name,
              email: user.email,
            });
            setIsDeleteModalOpen(true);
          }}
          onRowView={handleRowView}
        />

        <CustomPagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalEntries={filteredData.length}
          entriesPerPage={entriesPerPage}
          onPageChange={setCurrentPage}
        />

        {/* User Statistics Overview Modal Wrapper */}
        <UserDetailsModal
          isOpen={isViewModalOpen}
          userData={userForViewing}
          onClose={() => {
            setIsViewModalOpen(false);
            setUserForViewing(null);
          }}
        />

        {/* Secure User Deletion Challenge Modal Wrapper */}
        <DeleteUserModal
          isOpen={isDeleteModalOpen}
          userToConfirm={userForDeletion}
          onConfirmDelete={handleRowDeleteConfirm}
          onClose={() => {
            setIsDeleteModalOpen(false);
            setUserForDeletion(null);
          }}
        />
      </div>
    </div>
  );
}
