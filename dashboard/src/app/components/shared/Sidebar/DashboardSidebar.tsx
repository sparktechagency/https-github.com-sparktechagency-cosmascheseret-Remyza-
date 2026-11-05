"use client";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutGrid,
  Users,
  Banknote,
  MessageSquare,
  BarChart3,
  Settings,
  LogOut,
  X,
} from "lucide-react";
import { useDashboard } from "@/providers/DashboardStateProvider";
import { useAuth } from "@/providers/AuthProvider";
import { useEffect } from "react";

export default function DashboardSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { logout } = useAuth();

  const { sidebarOpen, setSidebarOpen, setPageTitle } = useDashboard();

  const navItems = [
    { label: "Dashboard", href: "/dashboard", icon: LayoutGrid },
    { label: "User Management", href: "/dashboard/users-manage", icon: Users },
    {
      label: "Total Revenue & Subscriptions",
      href: "/dashboard/total-revenue-subscriptions",
      icon: Banknote,
    },
    {
      label: "Message Logs",
      href: "/dashboard/message-logs",
      icon: MessageSquare,
    },
    { label: "Analytics", href: "/dashboard/analytics", icon: BarChart3 },
    { label: "Settings", href: "/dashboard/settings", icon: Settings },
  ];
  // create here logout functionality
  const handleLogout = async () => {
    try {
      // Call the logout function from auth context
      await logout();

      // Close sidebar on mobile
      setSidebarOpen(false);

      // Redirect to login page
      router.push("/login");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  useEffect(() => {
    const currentNav = navItems.find((item) => item.href === pathname);
    if (currentNav) {
      setPageTitle(currentNav.label);
    }
  }, [pathname, setPageTitle]);

  const sidebarContent = (
    <div className="flex h-full flex-col justify-between bg-white px-6 py-8">
      <div className="flex flex-col">
        <div className="mb-10 flex items-center justify-center lg:px-4">
          <div className="relative h-32 lg:h-40 w-32 lg:w-40 flex items-center justify-center">
            <Image
              src="/logo/logo.png"
              alt="Logo"
              fill
              className="object-contain"
              sizes="(max-width: 1024px) 128px, 160px"
              priority
            />
          </div>
        </div>

        <nav className="flex flex-col gap-2">
          {navItems.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href === "/dashboard" && pathname === "/");
            const Icon = item.icon;

            return (
              <Link
                key={item.label}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-4 rounded-lg px-4 py-3.5 text-[15px] font-semibold transition-all duration-200 ${
                  isActive
                    ? "bg-linear-to-r from-[#0C32CD] to-[#1D4ED8] text-white shadow-sm"
                    : "text-[#001A44] hover:bg-slate-50"
                }`}
              >
                <Icon
                  className={`h-5 w-5 ${isActive ? "text-white" : "text-[#001A44]"}`}
                  strokeWidth={2}
                />
                <span className="leading-tight">{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="mt-auto lg:px-4">
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-4 py-4 text-[17px] font-bold text-[#00A896] transition-colors hover:opacity-80 focus:outline-none"
        >
          <LogOut
            className="h-6 w-6 transform rotate-180 text-[#00A896]"
            strokeWidth={2.5}
          />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      <aside className="hidden h-screen w-72 shrink-0 border-r border-gray-100 bg-white lg:block">
        {sidebarContent}
      </aside>

      {sidebarOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity"
            onClick={() => setSidebarOpen(false)}
          />

          <aside className="relative flex w-full max-w-xs flex-col bg-white animate-in slide-in-from-left duration-200 ease-in-out">
            <div className="absolute top-4 right-4 z-10">
              <button
                onClick={() => setSidebarOpen(false)}
                className="rounded-md p-1.5 text-slate-500 hover:bg-slate-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            {sidebarContent}
          </aside>
        </div>
      )}
    </>
  );
}
