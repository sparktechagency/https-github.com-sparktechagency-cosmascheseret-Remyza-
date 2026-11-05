"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Mail, Check } from "lucide-react";
import { useAuth } from "@/providers/AuthProvider";
import { apiRequest } from "@/lib/api";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const { setResetEmail } = useAuth();
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    if (!email.trim()) {
      setError("Email is required");
      setIsLoading(false);
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Please enter a valid email address");
      setIsLoading(false);
      return;
    }

    try {
      await apiRequest<{ success: boolean; message: string }>("admin/auth/password-reset/request/", { method: "POST", body: JSON.stringify({ email }) });
      setResetEmail(email.trim().toLowerCase());
      setIsSubmitted(true);
      router.push("/verify-otp");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Unable to request a reset code.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className=" flex items-center justify-center p-4">
      {/* Decorative background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 -left-20 w-80 h-80 bg-blue-100 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
        <div className="absolute bottom-20 -right-20 w-80 h-80 bg-blue-50 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Back Button */}
        <Link
          href="/login"
          className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-semibold mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Login
        </Link>

        {/* Header Section */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl shadow-lg mb-4">
            <Mail className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">
            Reset Password
          </h1>
          <p className="text-slate-500 font-inter">
            Enter your email to receive verification code
          </p>
        </div>

        {/* Content Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-slate-100 p-8">
          {!isSubmitted ? (
            <>
              {/* Error Alert */}
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
                  <p className="text-red-700 text-sm font-medium">{error}</p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Email Input */}
                <div className="space-y-2">
                  <label
                    htmlFor="email"
                    className="block text-sm font-semibold text-slate-900"
                  >
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="admin@example.com"
                      className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all text-slate-900 placeholder-slate-400"
                      disabled={isLoading}
                    />
                  </div>
                  <p className="text-xs text-slate-500 font-inter">
                    We&apos;ll send a verification code to this email
                  </p>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold py-3 rounded-xl transition-all duration-200 transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 shadow-lg"
                >
                  {isLoading ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                      Sending...
                    </span>
                  ) : (
                    "Send Verification Code"
                  )}
                </button>
              </form>

              {/* Help Text */}
              <div className="hidden">
                <p className="text-sm text-blue-900 font-inter">
                  💡 <strong>Tip:</strong> Use{" "}
                  <code className="bg-blue-100 px-2 py-1 rounded font-mono text-xs">
                    alamin@gmail.com
                  </code>{" "}
                  to test
                </p>
              </div>
            </>
          ) : (
            <div className="text-center space-y-4">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full animate-bounce">
                <Check className="w-8 h-8 text-green-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-900 mb-2">
                  Check Your Email
                </h2>
                <p className="text-slate-600 font-inter">
                  We&apos;ve sent a verification code to <strong>{email}</strong>
                </p>
              </div>
              <div className="pt-2 text-sm text-slate-500 font-inter">
                Redirecting to verification page...
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
