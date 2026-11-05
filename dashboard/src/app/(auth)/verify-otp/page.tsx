"use client";

import React, { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Shield, RotateCcw } from "lucide-react";
import { useAuth } from "@/providers/AuthProvider";

export default function VerifyOtpPage() {
  const router = useRouter();
  const { resetEmail } = useAuth();
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [canResend, setCanResend] = useState(false);
  const [resendTimer, setResendTimer] = useState(60);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Handle resend timer
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (!canResend && resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
    } else if (resendTimer === 0) {
      setCanResend(true);
    }
    return () => clearInterval(interval);
  }, [canResend, resendTimer]);

  // Redirect if no email is set
  useEffect(() => {
    if (!resetEmail) {
      router.push("/forgot-password");
    }
  }, [resetEmail, router]);

  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Move to next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>,
  ) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const otpValue = otp.join("");
    if (otpValue.length !== 6) {
      setError("Please enter all 6 digits");
      return;
    }

    setIsLoading(true);

    // Simulate API verification
    setTimeout(() => {
      // For demo, any 6-digit code works (use 123456 or similar)
      if (otpValue === "123456" || otpValue === "000000") {
        router.push("/reset-password");
      } else {
        setError("Invalid verification code. Try 123456 for demo");
        setOtp(["", "", "", "", "", ""]);
        inputRefs.current[0]?.focus();
      }
      setIsLoading(false);
    }, 1000);
  };

  const handleResend = () => {
    setCanResend(false);
    setResendTimer(60);
    setError("");
    setOtp(["", "", "", "", "", ""]);
    // Simulate resending OTP
    setError("");
  };

  return (
    <div className="flex items-center justify-center p-4">
      {/* Decorative background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 -left-20 w-80 h-80 bg-blue-100 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
        <div className="absolute bottom-20 -right-20 w-80 h-80 bg-blue-50 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Back Button */}
        <Link
          href="/forgot-password"
          className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-semibold mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </Link>

        {/* Header Section */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-linear-to-br from-blue-600 to-blue-700 rounded-xl shadow-lg mb-4">
            <Shield className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">
            Verify Code
          </h1>
          <p className="text-slate-500 font-inter">
            We sent a verification code to <br />
            <strong>{resetEmail}</strong>
          </p>
        </div>

        {/* Content Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-slate-100 p-8">
          {/* Error Alert */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
              <p className="text-red-700 text-sm font-medium">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* OTP Input Fields */}
            <div className="space-y-3">
              <label className="block text-sm font-semibold text-slate-900">
                Verification Code
              </label>
              <div className="flex gap-2 justify-between">
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    ref={(el) => {
                      inputRefs.current[index] = el;
                    }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    className="w-12 h-12 text-center text-2xl font-bold border-2 border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all bg-slate-50"
                    disabled={isLoading}
                  />
                ))}
              </div>
              <p className="text-xs text-slate-500 font-inter text-center">
                Enter 6-digit code sent to your email
              </p>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading || otp.join("").length !== 6}
              className="w-full bg-linear-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold py-3 rounded-xl transition-all duration-200 transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 shadow-lg"
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  Verifying...
                </span>
              ) : (
                "Verify Code"
              )}
            </button>
          </form>

          {/* Resend Section */}
          <div className="mt-6 pt-6 border-t border-slate-200">
            <p className="text-sm text-slate-600 font-inter text-center mb-4">
              Didn't receive the code?
            </p>
            {canResend ? (
              <button
                onClick={handleResend}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
              >
                <RotateCcw className="w-4 h-4" />
                Resend Code
              </button>
            ) : (
              <div className="text-center text-sm text-slate-500 font-inter">
                Resend available in <strong>{resendTimer}s</strong>
              </div>
            )}
          </div>

          {/* Demo Info */}
          <div className="mt-6 bg-blue-50 border border-blue-100 rounded-xl p-4">
            <p className="text-xs font-semibold text-blue-900 mb-2">
              Demo Code:
            </p>
            <p className="text-xs text-blue-800 font-mono font-bold">123456</p>
          </div>
        </div>
      </div>
    </div>
  );
}
