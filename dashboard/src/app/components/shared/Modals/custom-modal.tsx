"use client";

import * as React from "react";
import { X } from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";

interface CustomModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
  footerActions?: React.ReactNode;
  maxWidthClass?: "max-w-md" | "max-w-lg" | "max-w-xl" | "max-w-2xl";
}

export default function CustomModal({
  isOpen,
  onClose,
  title,
  subtitle,
  icon,
  children,
  footerActions,
  maxWidthClass = "max-w-md",
}: CustomModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent 
        className={`w-[calc(100%-2rem)] sm:w-full sm:${maxWidthClass} max-h-[90vh] overflow-y-auto p-0 gap-0 bg-white rounded-2xl border border-slate-100 shadow-[0_4px_24px_rgba(0,0,0,0.03)] focus:outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 duration-200`}
      >
        {/* Sticky Semantic Header Section */}
        <div className="flex items-start justify-between px-6 pt-6 pb-4 bg-white border-b border-slate-50/80 sticky top-0 z-10">
          <div className="flex items-center gap-3.5 text-left">
            {icon && (
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50/60 text-[#0052CC] border border-blue-100/20">
                {icon}
              </div>
            )}
            <div className="flex flex-col space-y-0.5">
              <DialogTitle className="text-base font-bold text-[#0F172A] tracking-tight">
                {title}
              </DialogTitle>
              {subtitle && (
                <p className="text-[11px] font-semibold text-slate-400 tracking-wide">
                  {subtitle}
                </p>
              )}
            </div>
          </div>
          
          <button 
            onClick={onClose} 
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-50 transition-all duration-150 focus:outline-none"
            aria-label="Close dialog"
          >
            <X className="h-4 w-4 stroke-[2.5]" />
          </button>
        </div>

        {/* Modal Content Body Slot */}
        <div className="px-6 py-5 bg-white text-left">
          {children}
        </div>

        {/* Sticky Structural Action Footer */}
        {footerActions && (
          <div className="px-6 py-4 bg-slate-50/50 border-t border-slate-100 flex items-center justify-end gap-2.5 rounded-b-2xl sticky bottom-0 z-10">
            {footerActions}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
