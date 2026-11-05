"use client";

import { useState } from "react";
import GeneralSettings from "./SettingTab/GeneralSettings";
import Sidebar from "./Sidebar";
import SecuritySettings from "./SettingTab/SecuritySettings";
import AdminProfile from "./SettingTab/AdminProfile";
import FaqSettings from "./SettingTab/FaqSettings";
import PrivacyPolicySettings from "./SettingTab/PrivacyPolicySettings";
import TermsOfServiceSettings from "./SettingTab/TermsOfServiceSettings";

export default function Settings() {
  const [activeTab, setActiveTab] = useState("General");

  const renderContent = () => {
    switch (activeTab) {
      case "General":
        return <GeneralSettings />;
      case "Admin Profile":
        return <AdminProfile />;
      case "Security":
        return <SecuritySettings />;
      case "FAQ's":
        return <FaqSettings />;
      case "Privacy Policy":
        return <PrivacyPolicySettings />;
      case "Terms of Service":
        return <TermsOfServiceSettings />;

      default:
        return <GeneralSettings />;
    }
  };

  return (
    <div className=" font-sans antialiased flex flex-col md:flex-row gap-6">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

      <main className="flex-1">{renderContent()}</main>
    </div>
  );
}
