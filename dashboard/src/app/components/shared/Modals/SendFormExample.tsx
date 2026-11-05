"use client";

import * as React from "react";
import { useState } from "react";
import { X, Bell, Mail, MessageSquare } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";

interface SendNotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type RecipientGroup = "All Users" | "Pro Users" | "Trial Users" | "Free Users";
type NotificationType = "In-App" | "Email" | "SMS";

export function SendFormExample({
  isOpen,
  onClose,
}: SendNotificationModalProps) {
  // Form State Configurations
  const [recipient, setRecipient] = useState<RecipientGroup>("All Users");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [notificationType, setNotificationType] =
    useState<NotificationType>("In-App");

  // Dynamic user delivery target calculations based on selection
  const userTargetCount = React.useMemo(() => {
    switch (recipient) {
      case "All Users":
        return "2,847";
      case "Pro Users":
        return "1,240";
      case "Trial Users":
        return "452";
      case "Free Users":
        return "1,155";
      default:
        return "0";
    }
  }, [recipient]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Dispatched Notification Payload:", {
      recipient,
      subject,
      message,
      notificationType,
      estimatedAudience: userTargetCount,
    });

    // Clear state inputs on success
    setSubject("");
    setMessage("");
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="p-0 gap-0 w-[calc(100%-2rem)] sm:w-full sm:max-w-150 bg-white rounded-[28px] shadow-2xl border border-slate-100 overflow-hidden focus:outline-none text-left">
        {/* Header Segment */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 bg-white shrink-0">
          <DialogTitle className="text-[17px] font-bold text-[#0F172A] tracking-tight">
            Send Notification
          </DialogTitle>
        </div>

        {/* Core Interactive Content Area */}
        <form onSubmit={handleSubmit}>
          <div className="px-6 py-5 space-y-5 bg-white">
            {/* Recipients Block */}
            <div className="space-y-2">
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                Recipients
              </label>
              <div className="flex flex-wrap gap-2">
                {(
                  [
                    "All Users",
                    "Pro Users",
                    "Trial Users",
                    "Free Users",
                  ] as RecipientGroup[]
                ).map((group) => {
                  const isSelected = recipient === group;
                  return (
                    <button
                      key={group}
                      type="button"
                      onClick={() => setRecipient(group)}
                      className={`px-4 py-2 rounded-full text-xs font-bold transition-all border ${
                        isSelected
                          ? "bg-[#004BCE] border-[#004BCE] text-white shadow-sm"
                          : "bg-white border-slate-200 text-slate-500 hover:bg-slate-50"
                      }`}
                    >
                      {group}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Subject Field Input */}
            <div className="space-y-2">
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                Subject
              </label>
              <input
                type="text"
                required
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Enter notification subject..."
                className="w-full text-xs font-semibold px-4 py-3 rounded-xl border border-slate-200 bg-white text-[#0F172A] placeholder-slate-400 focus:outline-none focus:border-[#004BCE] transition-all"
              />
            </div>

            {/* Main Message TextArea Body */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                Message
              </label>
              <div className="relative">
                <textarea
                  required
                  rows={4}
                  maxLength={1000}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Write your notification message..."
                  className="w-full text-xs font-semibold px-4 py-3 rounded-xl border border-slate-200 bg-white text-[#0F172A] placeholder-slate-400 focus:outline-none focus:border-[#004BCE] resize-none transition-all leading-relaxed"
                />
                {/* Micro character layout metric */}
                <div className="text-right text-[11px] font-semibold text-slate-400 mt-1 mr-1">
                  {message.length} characters
                </div>
              </div>
            </div>

            {/* Notification Delivery Strategy Type Selector */}
            <div className="space-y-2 pt-1">
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                Notification Type
              </label>
              <div className="flex flex-wrap gap-2.5">
                {/* 1. In App Pill Option */}
                <button
                  type="button"
                  onClick={() => setNotificationType("In-App")}
                  className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold border transition-all ${
                    notificationType === "In-App"
                      ? "bg-blue-50/50 border-[#004BCE] text-[#004BCE]"
                      : "bg-white border-slate-200 text-slate-500 hover:bg-slate-50"
                  }`}
                >
                  <Bell className="h-3.5 w-3.5 stroke-[2.2]" />
                  <span>In-App</span>
                </button>

                {/* 2. Email Pill Option */}
                <button
                  type="button"
                  onClick={() => setNotificationType("Email")}
                  className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold border transition-all ${
                    notificationType === "Email"
                      ? "bg-blue-50/50 border-[#004BCE] text-[#004BCE]"
                      : "bg-white border-slate-200 text-slate-500 hover:bg-slate-50"
                  }`}
                >
                  <Mail className="h-3.5 w-3.5 stroke-[2.2]" />
                  <span>Email</span>
                </button>

                {/* 3. SMS Pill Option */}
                <button
                  type="button"
                  onClick={() => setNotificationType("SMS")}
                  className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold border transition-all ${
                    notificationType === "SMS"
                      ? "bg-blue-50/50 border-[#004BCE] text-[#004BCE]"
                      : "bg-white border-slate-200 text-slate-500 hover:bg-slate-50"
                  }`}
                >
                  <MessageSquare className="h-3.5 w-3.5 stroke-[2.2]" />
                  <span>SMS</span>
                </button>
              </div>
            </div>

            {/* Dynamic Live Delivery Projection Estimate Banner */}
            <div className="w-full bg-slate-50/70 border border-slate-100 px-4 py-3 rounded-xl text-xs font-semibold text-slate-500">
              Will send to{" "}
              <span className="font-extrabold text-[#004BCE]">
                {userTargetCount}
              </span>{" "}
              users
            </div>
          </div>

          {/* Footer Action Bar controls */}
          <div className="px-6 py-5 bg-white border-t border-slate-100 flex items-center justify-end gap-3 rounded-b-[28px]">
            <DialogClose asChild>
              <button
                type="button"
                className="px-5 py-2.5 border border-slate-200 bg-white hover:bg-slate-50 text-slate-500 font-bold text-xs rounded-xl transition-colors focus:outline-none"
              >
                Cancel
              </button>
            </DialogClose>
            <button
              type="submit"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#004BCE]/90 hover:bg-[#004BCE] text-white font-bold text-xs rounded-xl shadow-sm transition-colors focus:outline-none"
            >
              <Bell className="h-3.5 w-3.5 stroke-[2.2]" />
              <span>Send Notification</span>
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
