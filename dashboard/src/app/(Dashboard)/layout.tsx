import DashboardNavbar from "../components/shared/Header/DashboardNavbar";
import DashboardSidebar from "../components/shared/Sidebar/DashboardSidebar";

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex h-screen w-full overflow-hidden bg-[#F8FAFC]">
      {/* Sidebar Component: Handles its own desktop visibility and mobile drawer state internally */}
      <DashboardSidebar />

      {/* Main Content Area Wrapper */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Navbar */}
        <DashboardNavbar />

        {/* Dynamic Page Content Viewport */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="mx-auto max-w-400 w-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}