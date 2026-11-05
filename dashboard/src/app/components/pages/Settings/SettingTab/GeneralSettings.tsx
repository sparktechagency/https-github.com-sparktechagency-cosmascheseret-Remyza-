"use client";

import { useState } from "react";

export default function GeneralSettings() {
  const [formData, setFormData] = useState({
    appName: "Chesera",
    supportEmail: "support@chesera.io",
    supportPhone: "+1 (800) 555-0199",
    timeZone: "",
    dateFormat: "",
    currency: "",
    maintenanceMode: false,
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleToggle = () => {
    setFormData((prev) => ({
      ...prev,
      maintenanceMode: !prev.maintenanceMode,
    }));
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log("Saved Settings:", formData);
    // Add your API submit action here
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">General</h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Form Inputs Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* App Name */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              App Name
            </label>
            <input
              type="text"
              name="appName"
              value={formData.appName}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-gray-900"
            />
          </div>

          {/* Support Email */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Support Email
            </label>
            <input
              type="email"
              name="supportEmail"
              value={formData.supportEmail}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-gray-900"
            />
          </div>

          {/* Support Phone */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Support Phone
            </label>
            <input
              type="text"
              name="supportPhone"
              value={formData.supportPhone}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-gray-900"
            />
          </div>

          {/* Default Time Zone */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Default Time Zone
            </label>
            <select
              name="timeZone"
              value={formData.timeZone}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all bg-white text-gray-900"
            >
              <option value="">Select Time Zone</option>
              <option value="UTC">UTC (GMT+0)</option>
              <option value="EST">EST (GMT-5)</option>
            </select>
          </div>

          {/* Date Format */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Date Format
            </label>
            <select
              name="dateFormat"
              value={formData.dateFormat}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all bg-white text-gray-900"
            >
              <option value="">Select Date Format</option>
              <option value="MM/DD/YYYY">MM/DD/YYYY</option>
              <option value="DD/MM/YYYY">DD/MM/YYYY</option>
            </select>
          </div>

          {/* Currency */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Currency
            </label>
            <select
              name="currency"
              value={formData.currency}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all bg-white text-gray-900"
            >
              <option value="">Select Currency</option>
              <option value="USD">USD ($)</option>
              <option value="EUR">EUR (€)</option>
            </select>
          </div>
        </div>

        {/* Maintenance Mode Card */}
        <div className="bg-slate-50 border border-slate-100 rounded-2xl p-5 flex items-center justify-between transition-all">
          <div>
            <h4 className="font-semibold text-gray-900">Maintenance Mode</h4>
            <p className="text-sm text-gray-500 mt-0.5">
              This will make the app inaccessible to all users
            </p>
          </div>
          <button
            type="button"
            onClick={handleToggle}
            className={`w-11 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors duration-300 ease-in-out outline-none
              ${formData.maintenanceMode ? "bg-blue-600" : "bg-gray-200"}`}
          >
            <div
              className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-300 ease-in-out
              ${formData.maintenanceMode ? "translate-x-5" : "translate-x-0"}`}
            />
          </button>
        </div>

        {/* App Logo Section */}
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-gray-700">
            App Logo
          </label>
          <div className="flex items-center space-x-4">
            {/* Custom SVG Placeholder resembling your visual asset */}
            <div className="w-14 h-14 bg-linear-to-tr from-blue-700 to-cyan-400 rounded-full flex items-center justify-center shadow-inner relative overflow-hidden">
              <span className="text-white text-2xl font-black italic tracking-tighter">
                C
              </span>
              <div className="absolute bottom-2 right-1 flex space-x-0.5">
                <span className="w-1.5 h-0.5 bg-white rounded-full"></span>
                <span className="w-2 h-0.5 bg-white rounded-full"></span>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center gap-2">
              <label className="cursor-pointer bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 px-4 py-2 rounded-xl text-sm font-semibold shadow-sm transition-all text-center">
                Upload New Logo
                <input type="file" accept=".png,.svg" className="hidden" />
              </label>
              <span className="text-xs text-gray-400">PNG or SVG, max 2MB</span>
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="pt-4">
          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3.5 px-4 rounded-xl transition-all duration-150 shadow-sm hover:shadow active:scale-[0.99]"
          >
            Save General Settings
          </button>
        </div>
      </form>
    </div>
  );
}
