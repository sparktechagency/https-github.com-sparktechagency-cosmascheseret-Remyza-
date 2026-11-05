"use client";

import * as React from "react";
import { X, ChevronLeft, Phone, User2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";

interface ConversationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onViewUser?: () => void;
}

export function ConversationThreadModal({
  isOpen,
  onClose,
  onViewUser,
}: ConversationModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      {/* Shadcn automatically injects DialogOverlay inside DialogContent.
        We apply structural overrides matching your custom design layout.
      */}
      <DialogContent className="p-0 gap-0 w-[calc(100%-2rem)] sm:w-full sm:max-w-150 max-h-[92vh] flex flex-col bg-white rounded-[24px] shadow-2xl border border-slate-100 overflow-hidden focus:outline-none text-left">
        {/* Header Block */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-white shrink-0">
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              className="p-1 text-slate-400 hover:text-slate-600 rounded-lg transition-colors focus:outline-none"
            >
              <ChevronLeft className="h-4 w-4 stroke-[2.5]" />
            </button>
            <DialogTitle className="text-[17px] font-bold text-[#0F172A] tracking-tight">
              Conversation Thread
            </DialogTitle>
          </div>
        </div>

        {/* Participant Context Info Bar */}
        <div className="flex items-center justify-between px-6 py-3.5 bg-slate-50/60 border-b border-slate-100/80 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#F1F5F9] flex items-center justify-center text-slate-400 border border-slate-200/50">
              <Phone className="h-4 w-4" />
            </div>
            <div className="flex flex-col">
              <span className="text-[14px] font-bold text-[#0F172A]">
                Chris Evans
              </span>
              <span className="text-[11px] font-medium text-slate-400">
                +1 (555) 321-0987
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-[#0052CC] flex items-center justify-center text-white text-[10px] font-bold">
              AJ
            </div>
            <span className="text-[12px] font-semibold text-slate-500">
              Alex Johnson
            </span>
            <span className="ml-1 px-2.5 py-0.5 rounded-full bg-[#F3E8FF] text-[#A855F7] text-[10px] font-bold tracking-wide">
              Chesera Number
            </span>
          </div>
        </div>

        {/* Scrollable Conversation Stream Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5 bg-white">
          {/* Incoming Message Element */}
          <div className="space-y-1 max-w-[85%]">
            <span className="text-[11px] font-bold text-slate-400 block ml-1">
              Chris Evans
            </span>
            <div className="p-3.5 bg-[#F1F5F9] text-[#0F172A] text-[13px] font-medium rounded-2xl rounded-tl-sm leading-relaxed">
              Hi there, I saw your message. Can you tell me more?
            </div>
            <span className="text-[10px] font-medium text-slate-400 block ml-1">
              ⏱ May 12, 2026 09:55 AM
            </span>
          </div>

          {/* Outgoing Message Element */}
          <div className="space-y-1 max-w-[85%] ml-auto text-right">
            <span className="text-[11px] font-bold text-slate-400 block mr-1">
              Alex Johnson
            </span>
            <div className="p-4 bg-white border border-slate-200 text-[#0F172A] text-[13px] font-medium rounded-2xl rounded-tr-sm text-left shadow-sm leading-relaxed">
              Hi Chris Evans! Absolutely — I'd love to walk you through
              everything. Let me share a quick overview.
              <div className="mt-2.5 flex items-center gap-1.5">
                <span className="text-[10px] text-emerald-500 font-bold flex items-center gap-0.5">
                  ✓ Delivered
                </span>
              </div>
            </div>
            <span className="text-[10px] font-medium text-slate-400 block mr-1">
              May 12, 2026 10:01 AM
            </span>
          </div>

          {/* Incoming Message Element */}
          <div className="space-y-1 max-w-[85%]">
            <span className="text-[11px] font-bold text-slate-400 block ml-1">
              Chris Evans
            </span>
            <div className="p-3.5 bg-[#F1F5F9] text-[#0F172A] text-[13px] font-medium rounded-2xl rounded-tl-sm leading-relaxed">
              Sounds great! I'm available this week. What times work for you?
            </div>
            <span className="text-[10px] font-medium text-slate-400 block ml-1">
              May 12, 2026 10:08 AM
            </span>
          </div>

          {/* Target Highlighted AI Generated Outgoing Element */}
          <div className="space-y-1 max-w-[85%] ml-auto text-right relative pt-2">
            <span className="text-[11px] font-bold text-slate-400 block mr-1">
              Alex Johnson
            </span>
            <div className="absolute top-0 right-3 bg-[#0052CC] text-white font-bold text-[8px] tracking-wider px-2 py-0.5 rounded uppercase shadow-sm">
              This Message
            </div>
            <div className="p-4 bg-white border-2 border-[#0052CC] text-[#0F172A] text-[13px] font-medium rounded-2xl rounded-tr-sm text-left shadow-md leading-relaxed">
              Hi! I noticed you were looking at homes in the downtown area. I'd
              love to help you find your perfect property. We have several new
              listings this week that match your criteria. Would you like to
              schedule a tour?
              <div className="mt-2.5 flex items-center gap-1.5">
                <span className="text-[10px] text-emerald-500 font-bold flex items-center gap-0.5">
                  ✓ Delivered
                </span>
              </div>
            </div>
            <span className="text-[10px] font-medium text-slate-400 block mr-1">
              May 12, 2026 10:23 AM
            </span>
          </div>
        </div>

        {/* Log Aggregates Quick Metadata Line */}
        <div className="px-6 py-2.5 border-t border-slate-100 bg-white flex items-center gap-4 text-[11px] font-bold shrink-0">
          <div>
            <span className="text-[#0052CC] text-xs">6</span>{" "}
            <span className="text-slate-400 font-semibold">Total Messages</span>
          </div>
          <div>
            <span className="text-emerald-500 text-xs">3</span>{" "}
            <span className="text-slate-400 font-semibold">Delivered</span>
          </div>
        </div>

        {/* Sticky Form Footer Actions */}
        <div className="px-6 py-4 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between shrink-0 rounded-b-[24px]">
          <button
            type="button"
            onClick={onViewUser}
            className="flex items-center gap-1.5 text-xs font-bold text-[#0052CC] hover:text-[#0043a4] transition-colors focus:outline-none"
          >
            <User2 className="h-3.5 w-3.5" /> View User →
          </button>
          <DialogClose asChild>
            <button className="px-5 py-2 bg-[#0052CC] hover:bg-[#0043a4] text-white font-bold text-xs rounded-xl shadow-sm transition-colors focus:outline-none">
              Close
            </button>
          </DialogClose>
        </div>
      </DialogContent>
    </Dialog>
  );
}
