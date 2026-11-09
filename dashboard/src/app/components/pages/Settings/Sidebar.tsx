import {
  Settings,
  User,
  Shield,
  HelpCircle,
  EyeOff,
  FileText,
  CreditCard,
} from "lucide-react"; // Elegant modern icons matching your design

export default function Sidebar({
  activeTab,
  setActiveTab,
}: {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}) {
  const menuItems = [
    { id: "General", label: "General", icon: Settings },
    { id: "Billing & Credits", label: "Billing & Credits", icon: CreditCard },
    { id: "Admin Profile", label: "Admin Profile", icon: User },
    { id: "Security", label: "Security", icon: Shield },
    { id: "FAQ's", label: "FAQ's", icon: HelpCircle },
    { id: "Privacy Policy", label: "Privacy Policy", icon: EyeOff },
    { id: "Terms of Service", label: "Terms of Service", icon: FileText },
  ];

  return (
    <aside className="w-full md:w-64 bg-white rounded-2xl border-b md:border-b-0 md:border-r border-gray-200 shrink-0 sticky top-0 z-10 md:z-0">
      {/* Container fits row scroll on mobile, vertical stack on desktop */}
      <div className="flex md:flex-col overflow-x-auto md:overflow-x-visible scrollbar-none p-2 md:p-4 space-x-2 md:space-x-0 md:space-y-1">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex items-center space-x-3 px-4 py-3 text-sm font-medium rounded-xl whitespace-nowrap transition-all duration-200 w-full text-left
                ${
                  isActive
                    ? "bg-blue-50 text-blue-600 shadow-sm"
                    : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
                }`}
            >
              <Icon
                className={`w-5 h-5 flex-shrink-0 ${isActive ? "text-blue-600" : "text-gray-400"}`}
              />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>
    </aside>
  );
}
