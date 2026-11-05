"use client";

import React, { useState, useEffect } from "react";
import { X, AlertTriangle, XCircle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";

interface DeleteUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmDelete: (userId: string) => void;
  userToConfirm: {
    id: string;
    name: string;
    email: string;
  } | null;
}

export default function DeleteUserModal({
  isOpen,
  onClose,
  onConfirmDelete,
  userToConfirm,
}: DeleteUserModalProps) {
  const [confirmationInput, setConfirmationInput] = useState("");

  // Clean confirmation keyphrase buffer when modal visibility cycles
  useEffect(() => {
    if (!isOpen) {
      setConfirmationInput("");
    }
  }, [isOpen]);

  if (!userToConfirm) return null;

  // Enforce explicit security string validation check
  const isDeleteUnlocked = confirmationInput === "DELETE";

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isDeleteUnlocked) {
      onConfirmDelete(userToConfirm.id);
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-150 w-[94vw] overflow-hidden rounded-[24px] border-0 bg-white p-0 shadow-[0_20px_50px_rgba(0,0,0,0.16)] outline-none sm:rounded-[24px]">
        {/* Header Section Container */}
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-slate-50">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#FCE8E6] text-[#EF4444]">
              <AlertTriangle className="h-5 w-5" strokeWidth={2.2} />
            </div>
            <DialogTitle className="font-heading text-lg font-bold text-[#D93025]">
              Delete User Account?
            </DialogTitle>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Main Descriptive Context Header */}
          <p className="text-sm leading-relaxed text-slate-600 font-medium">
            This will permanently delete all data including contacts, leads,
            conversations and SMS history for{" "}
            <span className="font-bold text-[#0F172A]">
              {userToConfirm.name}
            </span>
            .
          </p>

          {/* Crimson Warning Deck: Itemized Destruction Impacts Panel */}
          <div className="rounded-2xl bg-[#FFF5F5] border border-[#FEE2E2] p-4.5 space-y-3">
            {[
              "All contacts and leads",
              "All conversations and SMS history",
              "Dedicated Chesera number",
              "Subscription data and history",
              "All AI training data",
            ].map((impactText, index) => (
              <div key={index} className="flex items-start gap-3">
                <XCircle
                  className="h-4 w-4 text-[#EF4444] shrink-0 mt-0.5"
                  strokeWidth={2}
                />
                <span className="text-[13px] font-semibold text-[#E11D48] leading-tight">
                  {impactText}
                </span>
              </div>
            ))}
          </div>

          {/* Target User Identity Node Badge */}
          <div className="rounded-xl bg-[#F8FAFC] border border-slate-100 p-3.5 flex items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#004BCE] text-[11px] font-bold text-white">
              {userToConfirm.name
                .split(" ")
                .map((n) => n[0])
                .join("")}
            </div>
            <div className="overflow-hidden">
              <p className="text-[13px] font-bold text-[#0F172A] leading-snug">
                {userToConfirm.name}
              </p>
              <p className="text-[11px] font-medium text-slate-400 truncate leading-none mt-0.5">
                {userToConfirm.email}
              </p>
            </div>
          </div>

          {/* Secure Challenge String Input Layout Section */}
          <div className="space-y-2">
            <label className="text-[13px] font-medium text-slate-600 block">
              Type <span className="font-bold text-[#EF4444]">DELETE</span> to
              confirm
            </label>
            <input
              type="text"
              value={confirmationInput}
              onChange={(e) => setConfirmationInput(e.target.value)}
              placeholder="DELETE"
              className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm font-bold text-[#0F172A] placeholder:text-slate-300 placeholder:font-normal focus:outline-none focus:ring-2 focus:ring-slate-100 uppercase tracking-wide bg-white transition-all"
              autoFocus
            />
          </div>

          {/* Controls Footer Block Action Grid Row */}
          <div className="flex items-center gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="w-1/2 py-3 rounded-xl border border-slate-200 bg-white text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors focus:outline-none"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!isDeleteUnlocked}
              className="w-1/2 py-3 rounded-xl bg-[#FCA5A5] text-sm font-bold text-white shadow-sm transition-all focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed enabled:bg-[#EF4444] enabled:hover:bg-[#DC2626]"
            >
              Permanently Delete
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
