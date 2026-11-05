import React, { useState, ChangeEvent, FormEvent } from "react";
import { Eye, EyeOff } from "lucide-react";

interface PasswordState {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export default function SecuritySettings(): React.JSX.Element {
  const [passwords, setPasswords] = useState<PasswordState>({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [showCurrent, setShowCurrent] = useState<boolean>(false);
  const [showNew, setShowNew] = useState<boolean>(false);
  const [showConfirm, setShowConfirm] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  const handleChange = (e: ChangeEvent<HTMLInputElement>): void => {
    const { name, value } = e.target;
    setPasswords((prev) => ({ ...prev, [name]: value }));
    if (error) setError("");
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>): void => {
    e.preventDefault();

    if (passwords.newPassword !== passwords.confirmPassword) {
      setError("New password and confirmation password do not match.");
      return;
    }

    if (passwords.newPassword.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    console.log("Password Updated Successfully:", passwords);
    alert("Password updated successfully!");
    setPasswords({ currentPassword: "", newPassword: "", confirmPassword: "" });
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Security</h2>
      <h3 className="text-lg font-bold text-gray-800 mb-4">Change Password</h3>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="p-3.5 bg-red-50 text-red-600 rounded-xl text-sm font-medium border border-red-100">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Current Password */}
          <div>
            <label className="block text-sm font-semibold text-gray-500 mb-2">
              Current Password
            </label>
            <div className="relative">
              <input
                type={showCurrent ? "text" : "password"}
                name="currentPassword"
                value={passwords.currentPassword}
                onChange={handleChange}
                placeholder="••••••••"
                className="w-full pl-4 pr-11 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-gray-900 tracking-wide"
                required
              />
              <button
                type="button"
                onClick={() => setShowCurrent(!showCurrent)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                {showCurrent ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>

          {/* New Password */}
          <div>
            <label className="block text-sm font-semibold text-gray-500 mb-2">
              New Password
            </label>
            <div className="relative">
              <input
                type={showNew ? "text" : "password"}
                name="newPassword"
                value={passwords.newPassword}
                onChange={handleChange}
                placeholder="••••••••"
                className="w-full pl-4 pr-11 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-gray-900 tracking-wide"
                required
              />
              <button
                type="button"
                onClick={() => setShowNew(!showNew)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                {showNew ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block text-sm font-semibold text-gray-500 mb-2">
              Confirm New Password
            </label>
            <div className="relative">
              <input
                type={showConfirm ? "text" : "password"}
                name="confirmPassword"
                value={passwords.confirmPassword}
                onChange={handleChange}
                placeholder="••••••••"
                className="w-full pl-4 pr-11 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-gray-900 tracking-wide"
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                {showConfirm ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>
          <div className="hidden md:block" />
        </div>

        <div className="pt-4 max-w-xs">
          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-150 shadow-sm"
          >
            Update Password
          </button>
        </div>
      </form>
    </div>
  );
}
