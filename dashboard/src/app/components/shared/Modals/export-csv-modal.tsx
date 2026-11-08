"use client";

import React, { useState, useMemo } from "react";
import { Download, FileText, Check } from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";

// Available Exportable Columns Blueprint Configuration
const AVAILABLE_COLUMNS = [
  { id: "user_id", label: "User ID" },
  { id: "full_name", label: "Full Name" },
  { id: "email", label: "Email Address" },
  { id: "phone", label: "Phone Number" },
  { id: "business_name", label: "Business Name" },
  { id: "business_type", label: "Business Type" },
  { id: "plan", label: "Plan" },
  { id: "status", label: "Status" },
  { id: "messages_sent_count", label: "Messages Sent" },
  { id: "leads_count", label: "Leads Generated" },
  { id: "joined_date", label: "Joined Date" },
  { id: "last_active", label: "Last Active" },
  { id: "chesera_number", label: "Chesera Number" },
];

interface ExportCsvModalProps {
  isOpen: boolean;
  onClose: () => void;
  dataToExport?: unknown[];
  totalRecords?: number;
  onConfirm: (config: {
    fileFormat: string;
    delimiter: string;
    columns: string[];
    dateRange: string;
  }) => void | Promise<void>;
}

export default function ExportCsvModal({
  isOpen,
  onClose,
  onConfirm,
  dataToExport = [],
  totalRecords,
}: ExportCsvModalProps) {
  const recordCount = totalRecords ?? dataToExport.length;
  const [fileFormat, setFileFormat] = useState<"csv" | "xlsx">("csv");
  const [delimiter, setDelimiter] = useState<"comma" | "semicolon" | "tab">("comma");
  const [dateRange, setDateRange] = useState("all_time");
  const [selectedColumns, setSelectedColumns] = useState<string[]>(
    AVAILABLE_COLUMNS.map((col) => col.id),
  );

  const generatedFileName = useMemo(() => {
    const dateStamp = new Date().toISOString().slice(0, 10);
    return `lead_users_${dateStamp}.${fileFormat}`;
  }, [fileFormat]);

  const toggleColumn = (id: string) => {
    setSelectedColumns((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
  };

  const handleSelectDeselectAll = () => {
    if (selectedColumns.length === AVAILABLE_COLUMNS.length) {
      setSelectedColumns([]);
    } else {
      setSelectedColumns(AVAILABLE_COLUMNS.map((col) => col.id));
    }
  };

  const triggerDownloadProcess = async () => {
    if (selectedColumns.length === 0) {
      alert(
        "Please select at least one column to include in the export configuration.",
      );
      return;
    }

    await onConfirm({ fileFormat, delimiter, columns: selectedColumns, dateRange });
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-150 w-[94vw] overflow-hidden rounded-[24px] border-0 bg-white p-0 shadow-[0_20px_50px_rgba(0,0,0,0.15)] outline-none sm:rounded-[24px]">
        <div className="flex items-start justify-between px-6 pt-6 pb-4 border-b border-slate-50">
          <div className="flex items-center gap-3.5">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#EEF2FF] text-[#0052CC]">
              <Download className="h-5 w-5" strokeWidth={2.2} />
            </div>
            <div>
              <DialogTitle className="font-heading text-lg font-bold text-[#0F172A]">
                Export CSV
              </DialogTitle>
              <p className="text-xs font-medium text-slate-400 mt-0.5">
                Users — {recordCount} records available
              </p>
            </div>
          </div>
        </div>

        {/* Modal Main Options Config Workspace */}
        <div className="p-6 space-y-5 max-h-[70vh] overflow-y-auto">
          {/* Option Segment A: File Format Selectors */}
          <div className="space-y-2">
            <label className="text-[11px] font-bold tracking-wider text-[#64748B] uppercase block">
              File Format
            </label>
            <div className="grid grid-cols-2 gap-3">
              {/* CSV Custom Selector */}
              <button
                type="button"
                onClick={() => setFileFormat("csv")}
                className={`relative flex items-center justify-between p-3.5 rounded-xl border text-left transition-all ${
                  fileFormat === "csv"
                    ? "border-[#0052CC] bg-[#F8FAFC] ring-1 ring-[#0052CC]"
                    : "border-slate-200 bg-white hover:bg-slate-50"
                }`}
              >
                <div className="flex items-center gap-3">
                  <FileText
                    className={`h-5 w-5 ${fileFormat === "csv" ? "text-[#0052CC]" : "text-slate-400"}`}
                  />
                  <div>
                    <p className="text-sm font-bold text-[#0F172A]">CSV</p>
                    <p className="text-[11px] font-medium text-slate-400">
                      Comma-separated values
                    </p>
                  </div>
                </div>
                {fileFormat === "csv" && (
                  <div className="flex h-4 w-4 items-center justify-center rounded-full bg-[#0052CC] text-white">
                    <Check className="h-2.5 w-2.5" strokeWidth={3} />
                  </div>
                )}
              </button>

              {/* Excel Custom Selector */}
              <button
                type="button"
                onClick={() => setFileFormat("xlsx")}
                className={`relative flex items-center justify-between p-3.5 rounded-xl border text-left transition-all ${
                  fileFormat === "xlsx"
                    ? "border-[#0052CC] bg-[#F8FAFC] ring-1 ring-[#0052CC]"
                    : "border-slate-200 bg-white hover:bg-slate-50"
                }`}
              >
                <div className="flex items-center gap-3">
                  <FileText
                    className={`h-5 w-5 ${fileFormat === "xlsx" ? "text-[#0052CC]" : "text-slate-400"}`}
                  />
                  <div>
                    <p className="text-sm font-bold text-[#0F172A]">
                      Excel (.xlsx)
                    </p>
                    <p className="text-[11px] font-medium text-slate-400">
                      Microsoft Excel format
                    </p>
                  </div>
                </div>
                {fileFormat === "xlsx" && (
                  <div className="flex h-4 w-4 items-center justify-center rounded-full bg-[#0052CC] text-white">
                    <Check className="h-2.5 w-2.5" strokeWidth={3} />
                  </div>
                )}
              </button>
            </div>
          </div>

          {/* Option Segment B: Delimiter Configuration */}
          <div className="space-y-2">
            <label className="text-[11px] font-bold tracking-wider text-[#64748B] uppercase block">
              Delimiter
            </label>
            <div className="flex gap-2">
              {[
                { label: "Comma ( , )", val: "comma" },
                { label: "Semicolon ( ; )", val: "semicolon" },
                { label: "Tab", val: "tab" },
              ].map((d) => (
                <button
                  key={d.val}
                  type="button"
                  onClick={() => setDelimiter(d.val as "comma" | "semicolon" | "tab")}
                  className={`px-4 py-2 rounded-xl text-xs font-semibold border transition-all ${
                    delimiter === d.val
                      ? "border-[#0052CC] bg-[#EFF6FF] text-[#0052CC]"
                      : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  {d.label}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-[11px] font-bold uppercase tracking-wider text-[#64748B]">Joined Date Range</label>
            <select value={dateRange} onChange={(event) => setDateRange(event.target.value)} className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none focus:ring-2 focus:ring-blue-100">
              <option value="all_time">All time</option>
              <option value="last_week">Last 7 days</option>
              <option value="last_month">Last 30 days</option>
            </select>
          </div>

          {/* Option Segment C: Column Checklist Selection Deck */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-bold tracking-wider text-[#64748B] uppercase block">
                Columns to Include
              </label>
              <button
                type="button"
                onClick={handleSelectDeselectAll}
                className="text-xs font-bold text-[#0052CC] hover:underline"
              >
                {selectedColumns.length === AVAILABLE_COLUMNS.length
                  ? "Deselect All"
                  : "Select All"}
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-1">
              {AVAILABLE_COLUMNS.map((col) => {
                const isChecked = selectedColumns.includes(col.id);
                return (
                  <button
                    key={col.id}
                    type="button"
                    onClick={() => toggleColumn(col.id)}
                    className={`flex items-center gap-3 w-full border rounded-xl px-4 py-2.5 text-left transition-all ${
                      isChecked
                        ? "border-slate-200 bg-[#EFF6FF]/40 text-[#0F172A]"
                        : "border-slate-100 bg-white text-slate-400"
                    }`}
                  >
                    <div
                      className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border transition-all ${
                        isChecked
                          ? "bg-[#0052CC] border-[#0052CC] text-white"
                          : "border-slate-300 bg-white"
                      }`}
                    >
                      {isChecked && (
                        <Check className="h-3 w-3" strokeWidth={3} />
                      )}
                    </div>
                    <span className="text-xs font-bold text-[#0F172A]">
                      {col.label}
                    </span>
                  </button>
                );
              })}
            </div>
            <p className="text-[11px] font-medium text-slate-400 pt-1">
              {selectedColumns.length} of {AVAILABLE_COLUMNS.length} columns
              selected
            </p>
          </div>

          {/* Option Segment D: Live Mock File Preview Container Card */}
          <div className="rounded-xl bg-[#F8FAFC] border border-slate-100 p-4 flex items-center gap-3.5">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white border border-slate-100 shadow-sm text-slate-400">
              <FileText className="h-5 w-5 text-[#0052CC]" />
            </div>
            <div className="overflow-hidden">
              <p className="text-xs font-bold text-[#0F172A] truncate">
                {generatedFileName}
              </p>
              <p className="text-[11px] font-medium text-slate-400 mt-0.5">
                {recordCount} rows • {selectedColumns.length} columns •{" "}
                {fileFormat.toUpperCase()}
              </p>
            </div>
          </div>
        </div>

        {/* Modal Action Controls Footer Row */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-50 bg-slate-50/50">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl border border-slate-200 bg-white text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors focus:outline-none"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={triggerDownloadProcess}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#004BCE] text-sm font-semibold text-white hover:bg-[#003da6] transition-colors shadow-sm focus:outline-none"
          >
            <Download className="h-4 w-4" />
            <span>Export CSV</span>
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
