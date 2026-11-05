"use client";
import { useEffect, useState } from "react";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useDashboard } from "@/providers/DashboardStateProvider";
import NotificationDropdown from "../Modals/NotificationModal";
import { apiRequest } from "@/lib/api";
import type { ApiEnvelope } from "@/types/admin";

export default function DashboardNavbar() {
  const [adminName, setAdminName] = useState("Admin");
  const [profilePicture, setProfilePicture] = useState<string | null>(null);
  useEffect(() => { apiRequest<ApiEnvelope<{ full_name: string; profile_picture: string | null }>>("admin/profile/").then((response) => { setAdminName(response.data.full_name || "Admin"); setProfilePicture(response.data.profile_picture); }).catch(() => undefined); }, []);
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
            {new Intl.DateTimeFormat("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" }).format(new Date())}
          </p>

          <div className="flex items-center gap-4">
            {/* Notification Bell Button */}
            <NotificationDropdown />

            {/* User Avatar Circle */}
            {profilePicture ? <img src={profilePicture} alt={adminName} className="h-10 w-10 rounded-full border-2 border-[#0052CC] object-cover" /> : <div className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-[#0052CC] bg-[#E6F0FF] text-sm font-bold text-[#0052CC]">{adminName.split(" ").map((part) => part[0]).join("").slice(0, 2).toUpperCase()}</div>}
          </div>
        </div>
      </nav>
    </header>
  );
}
