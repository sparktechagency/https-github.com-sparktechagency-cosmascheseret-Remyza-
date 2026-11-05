import React, { useState, useRef, ChangeEvent, FormEvent } from "react";
import { Camera } from "lucide-react";

interface ProfileState {
  fullName: string;
  email: string;
  phone: string;
  avatarUrl: string | null;
}

export default function AdminProfile(): React.JSX.Element {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [profile, setProfile] = useState<ProfileState>({
    fullName: "Super Admin",
    email: "admin@chesera.io",
    phone: "+1 (800) 555-0100",
    avatarUrl: null,
  });

  const handleChange = (e: ChangeEvent<HTMLInputElement>): void => {
    const { name, value } = e.target;
    setProfile((prev) => ({ ...prev, [name]: value }));
  };

  const handleAvatarClick = (): void => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>): void => {
    const file = e.target.files?.[0];
    if (file) {
      const fakeUrl = URL.createObjectURL(file);
      setProfile((prev) => ({ ...prev, avatarUrl: fakeUrl }));
    }
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>): void => {
    e.preventDefault();
    console.log("Saved Profile Data:", profile);
    alert("Profile updated successfully!");
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Admin Profile</h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="flex items-center space-x-5 pb-2">
          <div className="relative group flex-shrink-0">
            <button
              type="button"
              onClick={handleAvatarClick}
              className="w-24 h-24 rounded-full border-2 border-blue-600 bg-blue-50 flex items-center justify-center font-bold text-blue-600 text-2xl tracking-wide shadow-sm relative overflow-hidden focus:outline-none focus:ring-4 focus:ring-blue-100 transition-all"
            >
              {profile.avatarUrl ? (
                <img
                  src={profile.avatarUrl}
                  alt="Profile Preview"
                  className="w-full h-full object-cover"
                />
              ) : (
                <span>SA</span>
              )}
            </button>

            <button
              type="button"
              onClick={handleAvatarClick}
              className="absolute bottom-0 right-0 bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-full shadow border-2 border-white transition-all transform hover:scale-105"
              aria-label="Upload profile image"
            >
              <Camera className="w-4 h-4" />
            </button>

            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/*"
              className="hidden"
            />
          </div>

          <div className="overflow-hidden">
            <h3 className="text-lg font-bold text-gray-900 truncate">
              {profile.fullName || "Admin User"}
            </h3>
            <p className="text-sm text-gray-400 truncate mt-0.5">
              {profile.email || "no-email@domain.com"}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-semibold text-gray-500 mb-2">
              Full Name
            </label>
            <input
              type="text"
              name="fullName"
              value={profile.fullName}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-gray-900 font-normal"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-500 mb-2">
              Email Address
            </label>
            <input
              type="email"
              name="email"
              value={profile.email}
              readOnly
              aria-readonly="true"
              className="w-full cursor-not-allowed rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-gray-500 outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-500 mb-2">
              Phone Number
            </label>
            <input
              type="text"
              name="phone"
              value={profile.phone}
              readOnly
              aria-readonly="true"
              className="w-full cursor-not-allowed rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-gray-500 outline-none"
            />
          </div>
          <div className="hidden md:block" />
        </div>

        <div className="pt-4">
          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3.5 px-4 rounded-xl transition-all duration-150 shadow-sm"
          >
            Save Profile
          </button>
        </div>
      </form>
    </div>
  );
}
