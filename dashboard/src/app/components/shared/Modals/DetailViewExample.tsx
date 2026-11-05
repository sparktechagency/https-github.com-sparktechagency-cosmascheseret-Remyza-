"use client";

import * as React from "react";
import { X, User, MessageSquare, ArrowUpRight } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";

interface DetailViewExampleProps {
  isOpen: boolean;
  onClose: () => void;
  onViewUser: () => void; // Triggers the User Profile Modal transition
  onViewConversation: () => void; // Triggers the Conversation Thread Modal transition
  data?: {
    id: string;
    user: string;
    contactName: string;
    contactPhone: string;
    preview: string;
    direction: string;
    status: string;
    timestamp: string;
  } | null;
}

export function DetailViewExample({
  isOpen,
  onClose,
  onViewUser,
  onViewConversation,
  data,
}: DetailViewExampleProps) {
  // Fallback defaults to preserve your absolute layout metrics if no row is selected yet
  const displayData = data || {
    id: "MSG-001",
    user: "Alex Johnson",
    contactName: "Chris Evans",
    contactPhone: "+1 (555) 321-0987",
    preview:
      "Hi! I noticed you were looking at homes in the downtown area. I'd love to help you find your perfect property. We have several new listings this week that match your criteria. Would you like to schedule a tour?",
    direction: "Sent",
    status: "Delivered",
    timestamp: "May 12, 2026 10:23 AM",
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="p-0 gap-0 w-[calc(100%-2rem)] sm:w-full sm:max-w-150 bg-white rounded-[28px] shadow-2xl border border-slate-100 overflow-hidden focus:outline-none text-left">
        {/* Header Block */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 bg-white shrink-0">
          <DialogTitle className="text-[17px] font-bold text-[#0F172A] tracking-tight">
            Message Details
          </DialogTitle>
        </div>

        {/* Modal Scrollable Workspace Context */}
        <div className="px-6 py-5 space-y-5 bg-white max-h-[calc(85vh-120px)] overflow-y-auto custom-scrollbar">
          {/* Sender & Recipient Direct Info Metrics */}
          <div className="grid grid-cols-2 gap-4">
            {/* From Endpoint info */}
            <div className="space-y-2">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                From
              </span>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#004BCE] text-white font-bold text-xs">
                  {displayData.user
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </div>
                <div className="flex flex-col">
                  <span className="text-[13px] font-bold text-[#0F172A] leading-tight">
                    {displayData.user}
                  </span>
                  <span className="text-[11px] font-medium text-slate-400">
                    Chesera User
                  </span>
                </div>
              </div>
            </div>

            {/* To Endpoint Info */}
            <div className="space-y-2">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                To
              </span>
              <div className="flex flex-col justify-center h-10">
                <span className="text-[13px] font-bold text-[#0F172A] leading-tight">
                  {displayData.contactName}
                </span>
                <span className="text-[11px] font-semibold text-slate-400 mt-0.5">
                  {displayData.contactPhone}
                </span>
              </div>
            </div>
          </div>

          {/* Dynamic Status Badges System */}
          <div className="flex flex-wrap gap-2 pt-1">
            <span className="inline-flex items-center px-3 py-1.5 rounded-xl text-[11px] font-bold bg-purple-50 text-purple-600">
              {displayData.type}
            </span>
            <span className="inline-flex items-center px-3 py-1.5 rounded-xl text-[11px] font-bold bg-emerald-50 text-emerald-600">
              {displayData.status}
            </span>
            <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-[11px] font-bold bg-blue-50 text-[#004BCE]">
              <ArrowUpRight className="h-3 w-3 stroke-[2.5]" />
              <span>{displayData.direction}</span>
            </span>
          </div>

          {/* Timestamp Segment */}
          <div className="space-y-1">
            <span className="text-[11px] font-bold text-[#0F172A] uppercase tracking-wider block">
              Timestamp
            </span>
            <p className="text-xs font-semibold text-slate-500">
              {displayData.timestamp}
            </p>
          </div>

          {/* Exact Message Content Box Layer */}
          <div className="space-y-2">
            <span className="text-[11px] font-bold text-[#0F172A] uppercase tracking-wider block">
              Message Content
            </span>
            <div className="w-full bg-slate-50/70 border border-slate-100/80 rounded-[18px] p-4 flex flex-col space-y-3">
              <p className="text-xs font-medium text-[#0F172A] leading-relaxed">
                {displayData.preview}
              </p>
              <span className="text-[11px] font-semibold text-slate-400">
                {displayData.preview.length} characters
              </span>
            </div>
          </div>

          {/* Fixed System Analytical Metadata Breakdown */}
          <div className="space-y-2.5 pt-1">
            <span className="text-[11px] font-bold text-[#0F172A] uppercase tracking-wider block">
              Metadata
            </span>
            <div className="space-y-2 text-xs font-semibold">
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Twilio Message SID</span>
                <span className="text-[#0F172A] font-medium tracking-tight">
                  SM1a2b3c4d5e6f7g8h9i0j
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Delivery Time</span>
                <span className="text-[#0F172A] font-medium">0.4s</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Cost per Message</span>
                <span className="text-[#0F172A] font-medium">$0.0079</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Message ID</span>
                <span className="text-[#0F172A] font-medium">
                  {displayData.id}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Navigation Cross Links Controls */}
        <div className="px-6 py-4 bg-white border-t border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 rounded-b-[28px]">
          <div className="flex items-center gap-4 text-xs font-bold text-[#004BCE]">
            <button
              type="button"
              onClick={onViewUser}
              className="inline-flex items-center gap-1.5 hover:text-[#003BA3] transition-colors focus:outline-none"
            >
              <User className="h-3.5 w-3.5 stroke-[2.2]" />
              <span>View User →</span>
            </button>
            <button
              type="button"
              onClick={onViewConversation}
              className="inline-flex items-center gap-1.5 hover:text-[#003BA3] transition-colors focus:outline-none"
            >
              <MessageSquare className="h-3.5 w-3.5 stroke-[2.2]" />
              <span>View Conversation →</span>
            </button>
          </div>

          <DialogClose asChild>
            <button
              type="button"
              className="w-full sm:w-auto text-center px-5 py-2.5 border border-slate-200 bg-white hover:bg-slate-50 text-slate-500 font-bold text-xs rounded-xl transition-colors focus:outline-none"
            >
              Close
            </button>
          </DialogClose>
        </div>
      </DialogContent>
    </Dialog>
  );
}
