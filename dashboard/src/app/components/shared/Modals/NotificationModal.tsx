"use client";

import { useEffect, useRef, useState } from "react";
import { Bell, X } from "lucide-react";

interface NotificationItem {
  id: string;
  type: "user" | "subscription" | "failed" | "report";
  text: string;
  time: string;
  isUnread: boolean;
}

const initialNotifications: NotificationItem[] = [
  { id: "1", type: "user", text: "New user signed up — Daniel Chen", time: "2m ago", isUnread: true },
  { id: "2", type: "subscription", text: "Pro subscription started — James Wilson", time: "15m ago", isUnread: true },
  { id: "3", type: "failed", text: "Failed message delivery — USR-003", time: "1h ago", isUnread: true },
  { id: "4", type: "report", text: "Daily summary report ready", time: "3h ago", isUnread: false },
];

const badgeColors: Record<NotificationItem["type"], string> = {
  user: "bg-[#22C55E]",
  subscription: "bg-[#0759C7]",
  failed: "bg-[#EF4444]",
  report: "bg-[#64748B]",
};

export default function NotificationDropdown() {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [notifications, setNotifications] = useState(initialNotifications);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const unreadCount = notifications.filter((notification) => notification.isUnread).length;

  useEffect(() => {
    const closeOnOutsideClick = (event: MouseEvent) => {
      if (!dropdownRef.current?.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", closeOnOutsideClick);
    document.addEventListener("keydown", closeOnEscape);

    return () => {
      document.removeEventListener("mousedown", closeOnOutsideClick);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, []);

  const markAllRead = () => {
    setNotifications((current) => current.map((notification) => ({ ...notification, isUnread: false })));
  };

  const markRead = (id: string) => {
    setNotifications((current) =>
      current.map((notification) => notification.id === id ? { ...notification, isUnread: false } : notification),
    );
  };

  return (
    <div ref={dropdownRef} className="relative z-50">
      <button
        type="button"
        onClick={() => setIsDropdownOpen((isOpen) => !isOpen)}
        className="relative rounded-full p-1 text-[#64748B] transition-colors hover:text-[#0F172A] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0052CC]"
        aria-label="View notifications"
        aria-expanded={isDropdownOpen}
        aria-haspopup="dialog"
      >
        <Bell className="h-6 w-6" strokeWidth={2} />
        {unreadCount > 0 && (
          <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#EF4444] text-[10px] font-bold text-white ring-2 ring-white">
            {unreadCount}
          </span>
        )}
      </button>

      {isDropdownOpen && (
        <section
          aria-label="Notifications"
          className="absolute right-0 top-full mt-2 flex h-[355px] w-[calc(100vw-24px)] max-w-[320px] flex-col overflow-hidden rounded-2xl border-[1.05px] border-[#E2E8F0] bg-white shadow-[0px_25px_50px_-12px_rgba(0,0,0,0.25)]"
        >
          <div className="flex h-[46px] shrink-0 items-center border-b border-[#E2E8F0] px-4">
            <h3 className="text-[16px] font-semibold leading-5 text-[#0F172A]">Notifications</h3>
            <div className="ml-auto flex items-center gap-3">
              <button onClick={markAllRead} className="text-[14px] font-medium leading-5 text-[#0052CC] transition-colors hover:text-[#003D99] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0052CC]">
                Mark all read
              </button>
              <button onClick={() => setIsDropdownOpen(false)} className="text-[#64748B] transition-colors hover:text-[#0F172A] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0052CC]" aria-label="Close notifications">
                <X className="h-4 w-4" strokeWidth={2} />
              </button>
            </div>
          </div>

        <div className="min-h-0 flex-1 divide-y divide-[#F1F5F9] overflow-y-auto">
          {notifications.map((item) => (
            <button
              key={item.id}
              onClick={() => markRead(item.id)}
              className="group flex min-h-[61px] w-full cursor-pointer items-start justify-between px-4 py-2 text-left transition-colors hover:bg-[#F8FAFC] focus-visible:outline-2 focus-visible:outline-inset focus-visible:outline-[#0052CC]"
            >
              <span className="flex min-w-0 items-start gap-3 pr-3">
                <span className={`mt-[7px] h-2 w-2 shrink-0 rounded-full ${badgeColors[item.type]}`} />
                <span className="min-w-0">
                  <span className="block text-[14px] leading-5 font-normal text-[#0F172A]">{item.text}</span>
                  <span className="block text-[12px] leading-4 text-[#94A3B8]">{item.time}</span>
                </span>
              </span>
              {item.isUnread && <span className="mt-[7px] h-2 w-2 shrink-0 rounded-full bg-[#0759C7]" />}
            </button>
          ))}
          </div>

          <div className="flex h-[45px] shrink-0 items-center justify-center bg-white px-4 text-center">
            <a href="/dashboard/notifications" onClick={() => setIsDropdownOpen(false)} className="inline-block w-full text-[14px] font-medium leading-5 text-[#0052CC] transition-colors hover:text-[#003D99] hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0052CC]">
              View all notifications
            </a>
          </div>
        </section>
      )}
    </div>
  );
}
