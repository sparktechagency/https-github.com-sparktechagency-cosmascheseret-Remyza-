"use client";

import { useState, useMemo } from "react";
import {
  MessageSquare,
  Zap,
  CheckCircle2,
  XCircle,
  Search,
  Download,
  Bell,
  ArrowUpRight,
  ArrowDownLeft,
} from "lucide-react";
import DataTable, { ColumnDef } from "../../shared/CommonTable/Data-Table";
import CustomPagination from "../../shared/custom/custom-pagination";

// Premium Modal Components Suite
import { DetailViewExample } from "../../shared/Modals/DetailViewExample";
import { SendFormExample } from "../../shared/Modals/SendFormExample";
import { ConversationThreadModal } from "../../shared/Modals/ConversationThreadModal";
import { UserProfileModal } from "../../shared/Modals/UserProfileModal";

interface MessageLogItem {
  id: string;
  user: string;
  contactName: string;
  contactPhone: string;
  preview: string;
  direction: "Sent" | "Received";
  status: "Delivered" | "Failed";
  timestamp: string;
  isActive?: boolean;
}

const INITIAL_MOCK_LOGS: MessageLogItem[] = [
  {
    id: "MSG-9821",
    user: "Alex Johnson",
    contactName: "Chris Evans",
    contactPhone: "+1 (555) 321-0987",
    preview:
      "Hi! I noticed you were looking at homes in the downtown area. Would you like to schedule a quick tour this weekend?",
    direction: "Sent",
    status: "Delivered",
    timestamp: "May 12, 2026 10:23 AM",
    isActive: true,
  },
  {
    id: "MSG-9820",
    user: "Sarah Jenkins",
    contactName: "Jessica Alba",
    contactPhone: "+1 (555) 871-4421",
    preview:
      "Thanks for the details! What is the minimum down payment required for the second property listed?",
    direction: "Received",
    status: "Delivered",
    timestamp: "May 12, 2026 10:15 AM",
    isActive: true,
  },
  {
    id: "MSG-9819",
    user: "Alex Johnson",
    contactName: "Michael B.",
    contactPhone: "+1 (555) 902-1182",
    preview:
      "Your automated valuation report is ready. Click the link to review your custom equity breakdown path.",
    direction: "Sent",
    status: "Delivered",
    timestamp: "May 12, 2026 09:44 AM",
    isActive: true,
  },
  {
    id: "MSG-9818",
    user: "David Miller",
    contactName: "Robert Downey",
    contactPhone: "+1 (555) 234-5678",
    preview:
      "Failed to establish a primary connection handshake with the local carrier gateway. Retrying drop sequence.",
    direction: "Sent",
    status: "Failed",
    timestamp: "May 12, 2026 09:12 AM",
    isActive: false,
  },
  {
    id: "MSG-9817",
    user: "Sarah Jenkins",
    contactName: "Emma Watson",
    contactPhone: "+1 (555) 765-4321",
    preview:
      "Perfect, let's lock in the Tuesday slot at 3 PM. Sending over the digital calendar invite links now.",
    direction: "Sent",
    status: "Delivered",
    timestamp: "May 12, 2026 08:55 AM",
    isActive: true,
  },
];

export default function MessageLogs() {
  const [searchQuery, setSearchQuery] = useState("");
  const [userFilter, setUserFilter] = useState("All Users");
  const [typeFilter, setTypeFilter] = useState("All Types");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // --- Modal Interactivity Management Orchestration Matrix ---
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isConversationOpen, setIsConversationOpen] = useState(false);
  const [isUserProfileOpen, setIsUserProfileOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [selectedRowData, setSelectedRowData] = useState<MessageLogItem | null>(
    null,
  );

  // Search & Filtering Log Logic
  const filteredData = useMemo(() => {
    return INITIAL_MOCK_LOGS.filter((item) => {
      const matchesSearch =
        item.user.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.contactName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.contactPhone.includes(searchQuery) ||
        item.preview.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesUser =
        userFilter === "All Users" || item.user === userFilter;
      const matchesType =
        typeFilter === "All Types" || item.type === typeFilter;

      return matchesSearch && matchesUser && matchesType;
    });
  }, [searchQuery, userFilter, typeFilter]);

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredData.slice(start, start + itemsPerPage);
  }, [filteredData, currentPage]);

  // Handle core row viewer callback mappings
  const handleInspectRow = (row: MessageLogItem) => {
    setSelectedRowData(row);
    setIsDetailOpen(true);
  };

  // Micro-timed frame delays for fluid visual modal context hand-offs
  const handleTransitionToProfile = () => {
    setIsDetailOpen(false);
    setIsConversationOpen(false);
    setTimeout(() => {
      setIsUserProfileOpen(true);
    }, 200);
  };

  const handleTransitionToConversation = () => {
    setIsDetailOpen(false);
    setIsUserProfileOpen(false);
    setTimeout(() => {
      setIsConversationOpen(true);
    }, 200);
  };

  // Columns Layout Def mapping configurations
  const columns: ColumnDef<MessageLogItem>[] = [
    { header: "S.ID", accessorKey: "id" },
    {
      header: "User",
      accessorKey: "user",
      cell: (row) => (
        <span className="font-bold text-[#0F172A]">{row.user}</span>
      ),
    },
    {
      header: "Contact",
      accessorKey: "contactName",
      cell: (row) => (
        <div className="flex flex-col space-y-0.5 text-left">
          <span className="font-bold text-[#0F172A]">{row.contactName}</span>
          <span className="text-[11px] text-slate-400 font-medium">
            {row.contactPhone}
          </span>
        </div>
      ),
    },
    {
      header: "Message Preview",
      accessorKey: "preview",
      cell: (row) => (
        <p
          className="text-slate-500 max-w-[240px] md:max-w-[320px] truncate font-medium text-left"
          title={row.preview}
        >
          {row.preview}
        </p>
      ),
    },
    {
      header: "Direction",
      accessorKey: "direction",
      cell: (row) => (
        <span
          className={`inline-flex items-center gap-1 font-bold ${
            row.direction === "Sent" ? "text-blue-600" : "text-emerald-600"
          }`}
        >
          {row.direction === "Sent" ? (
            <ArrowUpRight className="h-3.5 w-3.5 stroke-[2.5]" />
          ) : (
            <ArrowDownLeft className="h-3.5 w-3.5 stroke-[2.5]" />
          )}
          <span>{row.direction}</span>
        </span>
      ),
    },
    {
      header: "Status",
      accessorKey: "status",
      cell: (row) => (
        <span
          className={`inline-flex items-center px-2.5 py-1 rounded-lg text-[11px] font-bold ${
            row.status === "Delivered"
              ? "bg-emerald-50 text-emerald-600"
              : "bg-rose-50 text-rose-600"
          }`}
        >
          {row.status}
        </span>
      ),
    },
    {
      header: "Timestamp",
      accessorKey: "timestamp",
      cell: (row) => (
        <span className="text-slate-400 font-semibold text-xs whitespace-nowrap">
          {row.timestamp}
        </span>
      ),
    },
    {
      header: "Action",
      accessorKey: "action",
      align: "right",
      showView: true,
      showDelete: false,
      showToggle: false,
    },
  ];

  return (
    <div className="w-full space-y-6 text-left bg-slate-50/50">
      {/* Analytics Card Deck Display Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        <div className="bg-white rounded-[22px] border border-slate-100 p-5 shadow-[0_2px_8px_rgba(0,0,0,0.01)] flex flex-col justify-between space-y-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-[#004BCE]">
            <MessageSquare className="h-5 w-5" strokeWidth={2.2} />
          </div>
          <div>
            <h4 className="text-2xl font-extrabold text-[#0F172A] tracking-tight">
              48,291
            </h4>
            <p className="text-[13px] font-medium text-slate-400 mt-0.5">
              Total Messages
            </p>
          </div>
        </div>

        <div className="bg-white rounded-[22px] border border-slate-100 p-5 shadow-[0_2px_8px_rgba(0,0,0,0.01)] flex flex-col justify-between space-y-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
            <CheckCircle2 className="h-5 w-5" strokeWidth={2.2} />
          </div>
          <div>
            <h4 className="text-2xl font-extrabold text-[#0F172A] tracking-tight">
              46,109
            </h4>
            <p className="text-[13px] font-medium text-slate-400 mt-0.5">
              Delivered
            </p>
          </div>
        </div>

        <div className="bg-white rounded-[22px] border border-slate-100 p-5 shadow-[0_2px_8px_rgba(0,0,0,0.01)] flex flex-col justify-between space-y-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-50 text-rose-600">
            <XCircle className="h-5 w-5" strokeWidth={2.2} />
          </div>
          <div>
            <h4 className="text-2xl font-extrabold text-[#0F172A] tracking-tight">
              2,182
            </h4>
            <p className="text-[13px] font-medium text-slate-400 mt-0.5">
              Failed
            </p>
          </div>
        </div>
      </div>

      {/* Primary Context Container Block */}
      <div className="bg-white rounded-[24px] border border-slate-100 shadow-[0_4px_16px_rgba(0,0,0,0.01)] overflow-hidden flex flex-col">
        {/* Dynamic Filter Utilities Toolbar Segment */}
        <div className="p-5 border-b border-slate-50 bg-white flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="relative w-full lg:max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search by name, email or phone..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50/30 text-xs font-semibold text-[#0F172A] focus:outline-none focus:border-[#004BCE] transition-all"
            />
          </div>

        </div>

        {/* Data Stream Render Table View */}
        <div className="w-full remove-header-borders-override overflow-x-auto">
          <DataTable
            title="Message Tracking Stream"
            columns={columns}
            data={paginatedData}
            onRowView={handleInspectRow}
            onRowDelete={(row) =>
              console.log("Deleting logging row record mapping:", row.id)
            }
            onStatusToggle={(row, checked) =>
              console.log(
                "Toggling stream verification tracer:",
                row.id,
                checked,
              )
            }
          />
        </div>

        {/* Dynamic Pagination Matrix */}
        <CustomPagination
          currentPage={currentPage}
          entriesPerPage={itemsPerPage}
          totalEntries={filteredData.length}
          onPageChange={(page) => setCurrentPage(page)}
          totalPages={totalPages}
          key={currentPage}
        />

        {/* ------------------------------------------------------------------
            SYSTEM PORTAL INTERACTIVE MODALS LAYER (DECOUPLED AND MOUNTED)
           ------------------------------------------------------------------ */}

        {/* 1. Core Inspection Deep Details Context Viewer */}
        <DetailViewExample
          isOpen={isDetailOpen}
          onClose={() => {
            setIsDetailOpen(false);
            setSelectedRowData(null);
          }}
          data={selectedRowData}
          onViewUser={handleTransitionToProfile}
          onViewConversation={handleTransitionToConversation}
        />

        {/* 2. Conversational Message Timeline Stream Modal */}
        <ConversationThreadModal
          isOpen={isConversationOpen}
          onClose={() => {
            setIsConversationOpen(false);
            setSelectedRowData(null);
          }}
          onViewUser={handleTransitionToProfile}
        />

        {/* 3. Account Identity Metadata Metric Profile Portal */}
        <UserProfileModal
          isOpen={isUserProfileOpen}
          onClose={() => {
            setIsUserProfileOpen(false);
            setSelectedRowData(null);
          }}
          onViewConversation={handleTransitionToConversation}
        />

        {/* 4. Global Push System Dispatch Broadcast Builder Form */}
        <SendFormExample
          isOpen={isNotificationOpen}
          onClose={() => setIsNotificationOpen(false)}
        />
      </div>
    </div>
  );
}
