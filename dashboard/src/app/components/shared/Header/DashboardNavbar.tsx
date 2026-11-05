"use client";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useDashboard } from "@/providers/DashboardStateProvider";
import NotificationDropdown from "../Modals/NotificationModal";

export default function DashboardNavbar() {
  const {
    pageTitle,
    setSidebarOpen,
  } = useDashboard();

  return (
    <header className="w-full border-b border-gray-100 bg-white px-6 py-4">
      <nav className="mx-auto flex flex-row items-center justify-between">
        {/* Left Side: Sidebar Toggle & Page Title */}
        <div className="flex items-center gap-3">
          {/* Mobile/Tablet Sidebar Trigger (Visible below lg break point) */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarOpen(true)}
            className="text-slate-700 lg:hidden"
            aria-label="Open sidebar"
          >
            <Menu className="h-6 w-6" />
          </Button>

          <h1 className="text-xl font-bold tracking-tight text-[#0F172A] sm:text-2xl">
            {pageTitle || "Dashboard"}
          </h1>
        </div>

        {/* Right Side: Date, Notifications, and Profile */}
        <div className="flex items-center gap-6">
          {/* Date (Hidden on small mobile viewports for clean layout) */}
          <p className="hidden text-sm font-medium text-[#64748B] sm:block">
            Tuesday, May 12, 2026
          </p>

          <div className="flex items-center gap-4">
            {/* Notification Bell Button */}
            <NotificationDropdown />

            {/* User Avatar Circle */}
            <div className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-[#0052CC] bg-[#E6F0FF] text-sm font-bold text-[#0052CC]">
              SA
            </div>
          </div>
        </div>
      </nav>
    </header>
  );
}
