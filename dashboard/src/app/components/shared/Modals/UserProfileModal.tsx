"use client";

import * as React from "react";
import {
  X,
  ChevronLeft,
  MessageSquare,
  Target,
  Calendar,
  Percent,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogOverlay,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  onViewConversation?: () => void;
  data?: {
    user: string;
  } | null;
}

export function UserProfileModal({
  isOpen,
  onClose,
  onViewConversation,
  data,
}: ProfileModalProps) {
  // Dynamic names parsed out directly for the user initials avatar circle
  const currentUserName = data?.user || "Alex Johnson";
  const userInitials = React.useMemo(() => {
    return currentUserName
      .split(" ")
      .map((name) => name[0])
      .join("")
      .toUpperCase();
  }, [currentUserName]);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogOverlay className="fixed inset-0 bg-black/40 backdrop-blur-[2px] z-50 transition-all duration-200" />
      <DialogContent className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[calc(100%-2rem)] sm:w-full sm:max-w-150 max-h-[90vh] flex flex-col bg-white rounded-[28px] shadow-2xl border border-slate-100 overflow-hidden focus:outline-none z-50 text-left p-0 gap-0">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-white shrink-0">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-50 transition-colors"
            >
              <ChevronLeft className="h-4 w-4 stroke-[2.5]" />
            </button>
            <DialogTitle className="text-[17px] font-bold text-[#0F172A] tracking-tight">
              User Profile
            </DialogTitle>
          </div>
          <DialogClose className="text-slate-400 hover:text-slate-600 transition-colors p-1.5 rounded-lg hover:bg-slate-50 focus:outline-none">
            <X className="h-4 w-4 stroke-[2.5]" />
          </DialogClose>
        </div>

        {/* Scrollable Container Elements Workspace */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6 bg-white custom-scrollbar">
          {/* Identity Hero Profile Card */}
          <div className="p-5 bg-gradient-to-br from-slate-50/80 to-slate-50 border border-slate-100/70 rounded-2xl flex items-center gap-4">
            <div className="w-14 h-14 shrink-0 rounded-full bg-[#004BCE] flex items-center justify-center text-white text-[18px] font-extrabold shadow-sm">
              {userInitials}
            </div>
            <div className="space-y-0.5">
              <h3 className="text-base font-bold text-[#0F172A] tracking-tight">
                {currentUserName}
              </h3>
              <p className="text-xs font-semibold text-slate-400">
                alex@johnsonrealty.com
              </p>
              <p className="text-[11px] font-bold text-slate-400/90 tracking-wide">
                +1 (555) 234-5678
              </p>
              <div className="pt-1 flex items-center gap-1.5">
                <span className="px-2.5 py-0.5 bg-[#004BCE] text-white text-[9px] font-extrabold rounded-full uppercase tracking-wider">
                  Pro
                </span>
                <span className="px-2.5 py-0.5 bg-emerald-50 text-emerald-600 text-[9px] font-extrabold rounded-full uppercase tracking-wider">
                  Active
                </span>
              </div>
            </div>
          </div>

          {/* Core Analytics Metric Stream Grid Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <div className="p-3.5 bg-slate-50/50 border border-slate-100 rounded-xl text-center space-y-1">
              <div className="mx-auto w-7 h-7 rounded-lg bg-blue-50 flex items-center justify-center text-[#004BCE]">
                <MessageSquare className="h-3.5 w-3.5 stroke-[2.2]" />
              </div>
              <div className="text-sm font-extrabold text-[#0F172A]">1,247</div>
              <div className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">
                Messages
              </div>
            </div>

            <div className="p-3.5 bg-slate-50/50 border border-slate-100 rounded-xl text-center space-y-1">
              <div className="mx-auto w-7 h-7 rounded-lg bg-purple-50 flex items-center justify-center text-purple-600">
                <Target className="h-3.5 w-3.5 stroke-[2.2]" />
              </div>
              <div className="text-sm font-extrabold text-[#0F172A]">89</div>
              <div className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">
                Leads
              </div>
            </div>

            <div className="p-3.5 bg-slate-50/50 border border-slate-100 rounded-xl text-center space-y-1">
              <div className="mx-auto w-7 h-7 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600">
                <Calendar className="h-3.5 w-3.5 stroke-[2.2]" />
              </div>
              <div className="text-sm font-extrabold text-[#0F172A]">87</div>
              <div className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">
                Days Active
              </div>
            </div>

            <div className="p-3.5 bg-slate-50/50 border border-slate-100 rounded-xl text-center space-y-1">
              <div className="mx-auto w-7 h-7 rounded-lg bg-amber-50 flex items-center justify-center text-amber-600">
                <Percent className="h-3.5 w-3.5 stroke-[2.2]" />
              </div>
              <div className="text-sm font-extrabold text-[#0F172A]">94%</div>
              <div className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">
                Response
              </div>
            </div>
          </div>

          {/* Account Profile Details Block Info */}
          <div className="space-y-3.5">
            <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              Account Information
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3.5 text-xs border-b border-slate-100 pb-5">
              <div>
                <span className="text-slate-400 font-semibold block mb-0.5">
                  Business Name
                </span>
                <span className="text-[#0F172A] font-bold">Johnson Realty</span>
              </div>
              <div>
                <span className="text-slate-400 font-semibold block mb-0.5">
                  Business Type
                </span>
                <span className="text-[#0F172A] font-bold">Real Estate</span>
              </div>
              <div>
                <span className="text-slate-400 font-semibold block mb-0.5">
                  Timezone
                </span>
                <span className="text-[#0F172A] font-bold">
                  America/New_York
                </span>
              </div>
              <div>
                <span className="text-slate-400 font-semibold block mb-0.5">
                  Joined
                </span>
                <span className="text-[#0F172A] font-bold">Jan 15, 2026</span>
              </div>
              <div>
                <span className="text-slate-400 font-semibold block mb-0.5">
                  Last Active
                </span>
                <span className="text-[#0F172A] font-bold">2h ago</span>
              </div>
              <div>
                <span className="text-slate-400 font-semibold block mb-0.5">
                  Chesera Number
                </span>
                <span className="text-[#0F172A] font-bold">
                  +1 (555) 100-0001
                </span>
              </div>
            </div>
          </div>

          {/* Progress Usage Gauges Parameter Matrix */}
          <div className="space-y-4">
            <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              Usage This Month
            </h4>

            {/* Metric 1 */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center text-[11px] font-bold">
                <span className="text-slate-400 font-semibold">
                  Messages Sent
                </span>
                <span className="text-[#0F172A]">1,247 / 2,000</span>
              </div>
              <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#004BCE] rounded-full transition-all duration-500"
                  style={{ width: "62.35%" }}
                />
              </div>
            </div>

            {/* Metric 2 */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center text-[11px] font-bold">
                <span className="text-slate-400 font-semibold">
                  Leads Captured
                </span>
                <span className="text-[#0F172A]">89 / 500</span>
              </div>
              <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-purple-500 rounded-full transition-all duration-500"
                  style={{ width: "17.8%" }}
                />
              </div>
            </div>

          </div>
        </div>

        {/* Sticky Fixed Interactive Navigation Footer Actions */}
        <div className="px-6 py-4.5 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between shrink-0 rounded-b-[28px]">
          <button
            type="button"
            onClick={onViewConversation}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-[#004BCE] hover:text-[#003BA3] transition-colors focus:outline-none"
          >
            <MessageSquare className="h-3.5 w-3.5 stroke-[2.2]" />
            <span>View Conversation →</span>
          </button>

          <DialogClose asChild>
            <button
              type="button"
              className="px-4 py-2 border border-slate-200 bg-white hover:bg-slate-50 text-slate-500 font-bold text-xs rounded-xl transition-colors focus:outline-none"
            >
              Close
            </button>
          </DialogClose>
        </div>
      </DialogContent>
    </Dialog>
  );
}
