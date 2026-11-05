"use client";

import * as React from "react";
import { Eye, Trash2 } from "lucide-react";
import { Switch } from "@/components/ui/switch";

// 1. Updated Column Definition with action button visibility overrides
export interface ColumnDef<TData> {
  header: string;
  accessorKey: keyof TData | "action" | "custom_user";
  cell?: (row: TData) => React.ReactNode;
  align?: "left" | "center" | "right";
  // Custom action visibility rules
  showView?: boolean;
  showToggle?: boolean;
  showDelete?: boolean;
}

interface DataTableProps<TData> {
  title: string;
  viewAllHref?: string;
  columns: ColumnDef<TData>[];
  data: TData[];
  onRowView?: (row: TData) => void;
  onRowDelete?: (row: TData) => void;
  onStatusToggle?: (row: TData, checked: boolean) => void;
}

export default function DataTable<
  TData extends { id: string | number; isActive?: boolean },
>({
  title,
  viewAllHref,
  columns,
  data,
  onRowView,
  onRowDelete,
  onStatusToggle,
}: DataTableProps<TData>) {
  return (
    <div className="w-full rounded-2xl border border-slate-100 bg-white shadow-[0_2px_8px_rgba(0,0,0,0.02)]">
      {/* Table Header Section */}
      <div className="flex items-center justify-between px-6 py-5 border-b border-slate-50">
        <h2 className="font-heading text-lg font-bold text-[#0F172A]">
          {title}
        </h2>
        {viewAllHref && (
          <a
            href={viewAllHref}
            className="text-xs font-semibold text-[#0052CC] hover:underline transition-colors"
          >
            View All
          </a>
        )}
      </div>

      {/* Responsive Table Container */}
      <div className="w-full overflow-x-auto">
        <table className="w-full border-collapse text-left">
          <thead>
            <tr className="border-b border-slate-100 bg-white">
              {columns.map((col, idx) => (
                <th
                  key={idx}
                  className={`px-6 py-4 text-[11px] font-bold tracking-wider text-[#64748B] uppercase ${
                    col.align === "center"
                      ? "text-center"
                      : col.align === "right"
                        ? "text-right"
                        : "text-left"
                  }`}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100">
            {data.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className="px-6 py-10 text-center text-sm text-slate-400"
                >
                  No data available.
                </td>
              </tr>
            ) : (
              data.map((row) => (
                <tr
                  key={row.id}
                  className="group hover:bg-slate-50/50 transition-colors duration-150"
                >
                  {columns.map((col, idx) => {
                    const alignClass =
                      col.align === "center"
                        ? "text-center"
                        : col.align === "right"
                          ? "text-right"
                          : "text-left";

                    // Dynamic Actions Rendering Row
                    if (col.accessorKey === "action") {
                      // Fallback to true if flags are undefined for backwards compatibility
                      const canView = col.showView !== false;
                      const canToggle = col.showToggle !== false;
                      const canDelete = col.showDelete !== false;

                      return (
                        <td
                          key={idx}
                          className="px-6 py-3.5 whitespace-nowrap text-right"
                        >
                          <div
                            className={`flex items-center gap-3.5 ${
                              col.align === "right"
                                ? "justify-end"
                                : "justify-start"
                            }`}
                          >
                            {/* Dynamic Conditional Check for View Button */}
                            {canView && (
                              <button
                                onClick={() => onRowView?.(row)}
                                className="text-slate-400 hover:text-slate-700 transition-colors"
                                aria-label="View Details"
                              >
                                <Eye className="h-4 w-4" />
                              </button>
                            )}

                            {/* Dynamic Conditional Check for Switch Toggle */}
                            {canToggle && (
                              <Switch
                                checked={row.isActive}
                                onCheckedChange={(checked) =>
                                  onStatusToggle?.(row, checked)
                                }
                                className="data-[state=checked]:bg-[#10B981]"
                              />
                            )}

                            {/* Dynamic Conditional Check for Delete Button */}
                            {canDelete && (
                              <button
                                onClick={() => onRowDelete?.(row)}
                                className="text-slate-400 hover:text-[#EF4444] transition-colors"
                                aria-label="Delete Entry"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            )}
                          </div>
                        </td>
                      );
                    }

                    // Standard Data Cell Fallbacks
                    return (
                      <td
                        key={idx}
                        className={`px-6 py-3.5 text-[13px] text-[#475569] font-medium whitespace-nowrap ${alignClass}`}
                      >
                        {col.cell
                          ? col.cell(row)
                          : (row[
                              col.accessorKey as keyof TData
                            ] as React.ReactNode)}
                      </td>
                    );
                  })}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
