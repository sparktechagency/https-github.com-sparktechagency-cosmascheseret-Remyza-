'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Lock, Eye, EyeOff, Check } from 'lucide-react';

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const [passwordStrength, setPasswordStrength] = useState<'weak' | 'medium' | 'strong'>('weak');

  const calculatePasswordStrength = (pwd: string) => {
    let strength: 'weak' | 'medium' | 'strong' = 'weak';
    if (pwd.length >= 8) {
      if (/[A-Z]/.test(pwd) && /[0-9]/.test(pwd)) {
        strength = 'strong';
      } else if (/[A-Z]/.test(pwd) || /[0-9]/.test(pwd)) {
        strength = 'medium';
      }
    }
    return strength;
  };

  const handlePasswordChange = (value: string) => {
    setPassword(value);
    setPasswordStrength(calculatePasswordStrength(value));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validation
    if (!password) {
      setError('Password is required');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setIsLoading(true);

    // Simulate API call
    setTimeout(() => {
      // Update password (in demo, we just simulate this)
      localStorage.setItem('user_password', password);
      setIsSubmitted(true);

      // Redirect to login after 3 seconds
      setTimeout(() => {
        router.push('/login');
      }, 3000);

      setIsLoading(false);
    }, 1000);
  };

  const strengthColors = {
    weak: 'bg-red-500',
    medium: 'bg-yellow-500',
    strong: 'bg-green-500',
  };

  const strengthLabels = {
    weak: 'Weak',
    medium: 'Medium',
    strong: 'Strong',
  };

  return (
    <div className=" flex items-center justify-center p-4">
      {/* Decorative background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 -left-20 w-80 h-80 bg-blue-100 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
        <div className="absolute bottom-20 -right-20 w-80 h-80 bg-blue-50 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
      </div>

      <div className="w-full max-w-md relative z-10">
        {!isSubmitted && (
          <Link
            href="/verify-otp"
            className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-semibold mb-8 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Link>
        )}

        {/* Header Section */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-linear-to-br from-blue-600 to-blue-700 rounded-xl shadow-lg mb-4">
            <Lock className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Create New Password</h1>
          <p className="text-slate-500 font-inter">Enter a strong password to secure your account</p>
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
                {/* New Password */}
                <div className="space-y-2">
                  <label htmlFor="password" className="block text-sm font-semibold text-slate-900">
                    New Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => handlePasswordChange(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-10 pr-11 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all text-slate-900 placeholder-slate-400"
                      disabled={isLoading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                      disabled={isLoading}
                    >
                      {showPassword ? (
                        <EyeOff className="w-5 h-5" />
                      ) : (
                        <Eye className="w-5 h-5" />
                      )}
                    </button>
                  </div>

                  {/* Password Strength Indicator */}
                  {password && (
                    <div className="space-y-2">
                      <div className="flex gap-1">
                        {['weak', 'medium', 'strong'].map((level) => (
                          <div
                            key={level}
                            className={`flex-1 h-1 rounded-full transition-colors ${
                              ['weak', 'medium', 'strong'].indexOf(level) <= ['weak', 'medium', 'strong'].indexOf(passwordStrength)
                                ? strengthColors[passwordStrength as keyof typeof strengthColors]
                                : 'bg-slate-200'
                            }`}
                          ></div>
                        ))}
                      </div>
                      <p className="text-xs text-slate-600 font-inter">
                        Password Strength: <span className="font-semibold">{strengthLabels[passwordStrength]}</span>
                      </p>
                    </div>
                  )}

                  <p className="text-xs text-slate-500 font-inter">At least 8 characters with uppercase and numbers</p>
                </div>

                {/* Confirm Password */}
                <div className="space-y-2">
                  <label htmlFor="confirmPassword" className="block text-sm font-semibold text-slate-900">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                      id="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-10 pr-11 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all text-slate-900 placeholder-slate-400"
                      disabled={isLoading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                      disabled={isLoading}
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="w-5 h-5" />
                      ) : (
                        <Eye className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                  {confirmPassword && password === confirmPassword && (
                    <div className="flex items-center gap-2 text-green-600 text-xs font-semibold">
                      <Check className="w-4 h-4" />
                      Passwords match
                    </div>
                  )}
                </div>

                {/* Password Requirements */}
                <div className="bg-slate-50 rounded-lg p-4 space-y-2">
                  <p className="text-xs font-semibold text-slate-900">Password Requirements:</p>
                  <ul className="space-y-1 text-xs text-slate-600 font-inter">
                    <li className={password.length >= 8 ? 'text-green-600' : ''}>
                      {password.length >= 8 ? '✓' : '○'} At least 8 characters
                    </li>
                    <li className={/[A-Z]/.test(password) ? 'text-green-600' : ''}>
                      {/[A-Z]/.test(password) ? '✓' : '○'} One uppercase letter
                    </li>
                    <li className={/[0-9]/.test(password) ? 'text-green-600' : ''}>
                      {/[0-9]/.test(password) ? '✓' : '○'} One number
                    </li>
                  </ul>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isLoading || password !== confirmPassword || password.length < 8}
                  className="w-full bg-linear-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold py-3 rounded-xl transition-all duration-200 transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 shadow-lg"
                >
                  {isLoading ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                      Resetting...
                    </span>
                  ) : (
                    'Reset Password'
                  )}
                </button>
              </form>
            </>
          ) : (
            <div className="text-center space-y-4 py-6">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full">
                <Check className="w-8 h-8 text-green-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-900 mb-2">Password Reset Successful!</h2>
                <p className="text-slate-600 font-inter">Your password has been updated successfully</p>
              </div>
              <div className="pt-4 text-sm text-slate-500 font-inter">
                Redirecting to login page in a few seconds...
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
