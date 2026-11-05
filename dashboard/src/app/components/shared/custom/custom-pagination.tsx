"use client";

import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalEntries: number;
  entriesPerPage: number;
  onPageChange: (page: number) => void;
}

export default function CustomPagination({
  currentPage,
  totalPages,
  totalEntries,
  entriesPerPage,
  onPageChange,
}: PaginationProps) {
  const startEntry = (currentPage - 1) * entriesPerPage + 1;
  const endEntry = Math.min(currentPage * entriesPerPage, totalEntries);

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-6 py-5 border-t border-slate-50 bg-white rounded-b-2xl">
      {/* Informational Range Text */}
      <p className="text-[13px] font-medium text-[#64748B]">
        Showing {totalEntries === 0 ? 0 : startEntry}–{endEntry} of{" "}
        <span className="font-semibold text-[#0F172A]">{totalEntries}</span> users
      </p>

      {/* Interactive Controller Buttons */}
      <div className="flex items-center gap-2">
        {/* Previous Button */}
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition-colors hover:bg-slate-50 disabled:opacity-40 disabled:hover:bg-white"
          aria-label="Previous Page"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>

        {/* Page Number Button Indicators */}
        {Array.from({ length: totalPages }, (_, idx) => idx + 1).map((page) => (
          <button
            key={page}
            onClick={() => onPageChange(page)}
            className={`flex h-8 w-8 items-center justify-center rounded-lg text-xs font-semibold transition-all ${
              currentPage === page
                ? "bg-[#004BCE] text-white shadow-sm"
                : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
            }`}
          >
            {page}
          </button>
        ))}

        {/* Next Button */}
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition-colors hover:bg-slate-50 disabled:opacity-40 disabled:hover:bg-white"
          aria-label="Next Page"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}