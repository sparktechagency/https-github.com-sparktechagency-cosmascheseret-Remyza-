"use client";

import React, { useState } from "react";
import DataTable, { ColumnDef } from "../../shared/CommonTable/Data-Table";
import UserDetailsModal from "../../shared/Modals/user-details-modal";
import DeleteUserModal from "../../shared/Modals/DeleteUserModal";

// 1. Data Contract Definition
interface UserRow {
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

export default function RecentUsersSection() {
  // Mock Dynamic Reactive State Array
  const [users, setUsers] = useState<UserRow[]>([
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
      status: "Blocked",
      joined: "Jan 15, 2026",
      isActive: false,
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
      status: "Active",
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
      status: "Trial",
      joined: "Jan 15, 2026",
      isActive: true,
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
      status: "Blocked",
      joined: "Jan 15, 2026",
      isActive: false,
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
  ]);
  const [userForViewing, setUserForViewing] = useState<UserRow | null>(null);
  const [userForDeletion, setUserForDeletion] = useState<{
    id: string;
    name: string;
    email: string;
  } | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  // 2. Define Table Column Structures to pass
  const userColumns: ColumnDef<UserRow>[] = [
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
        <span className="inline-flex items-center rounded-md bg-[#EFF6FF] px-2 py-0.5 text-xs font-semibold text-[#2563EB]">
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
        const styles = {
          Active: "bg-[#E6F4EA] text-[#137333]",
          Blocked: "bg-[#FCE8E6] text-[#C5221F]",
          Trial: "bg-[#FEF7E0] text-[#B06000]",
        }[row.status];
        return (
          <span
            className={`inline-flex items-center rounded px-2 py-0.5 text-[11px] font-bold ${styles}`}
          >
            {row.status}
          </span>
        );
      },
    },
    { header: "Joined", accessorKey: "joined" },
    { header: "Action", accessorKey: "action" },
  ];

  // 3. Operational Handler Actions
  const handleStatusToggle = (targetRow: UserRow, checkState: boolean) => {
    setUsers((prev) =>
      prev.map((user) =>
        user.id === targetRow.id
          ? {
              ...user,
              isActive: checkState,
              status: checkState ? "Active" : "Blocked",
            }
          : user,
      ),
    );
  };

  const handleRowView = (targetRow: UserRow) => {
    setUserForViewing(targetRow);
    setIsViewModalOpen(true);
  };

  const handleRowDelete = (targetRow: UserRow) => {
    setUserForDeletion({
      id: targetRow.id,
      name: targetRow.name,
      email: targetRow.email,
    });
    setIsDeleteModalOpen(true);
  };

  const handleRowDeleteConfirm = (userId: string) => {
    setUsers((current) => current.filter((user) => user.id !== userId));
    setIsDeleteModalOpen(false);
    setUserForDeletion(null);
  };

  return (
    <>
      <DataTable
        title="Recent Users"
        viewAllHref="/dashboard/users-manage"
        columns={userColumns}
        data={users}
        onStatusToggle={handleStatusToggle}
        onRowDelete={handleRowDelete}
        onRowView={handleRowView}
      />

      <UserDetailsModal
        isOpen={isViewModalOpen}
        userData={userForViewing}
        onClose={() => {
          setIsViewModalOpen(false);
          setUserForViewing(null);
        }}
      />

      <DeleteUserModal
        isOpen={isDeleteModalOpen}
        userToConfirm={userForDeletion}
        onConfirmDelete={handleRowDeleteConfirm}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setUserForDeletion(null);
        }}
      />
    </>
  );
}
