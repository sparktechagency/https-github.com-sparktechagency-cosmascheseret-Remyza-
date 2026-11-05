'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';

interface AuthContextType {
  resetEmail: string | null;
  setResetEmail: (email: string | null) => void;
  resetToken: string | null;
  setResetToken: (token: string | null) => void;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; message?: string }>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [resetEmail, setResetEmail] = useState<string | null>(null);
  const [resetToken, setResetToken] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  React.useEffect(() => {
    setResetEmail(window.sessionStorage.getItem('chesera_reset_email'));
    setResetToken(window.sessionStorage.getItem('chesera_reset_token'));
    fetch('/api/auth/session', { cache: 'no-store' })
      .then((response) => setIsAuthenticated(response.ok))
      .catch(() => setIsAuthenticated(false));
  }, []);

  const updateResetEmail = useCallback((email: string | null) => {
    setResetEmail(email);
    if (email) window.sessionStorage.setItem('chesera_reset_email', email);
    else window.sessionStorage.removeItem('chesera_reset_email');
  }, []);
  const updateResetToken = useCallback((token: string | null) => {
    setResetToken(token);
    if (token) window.sessionStorage.setItem('chesera_reset_token', token);
    else window.sessionStorage.removeItem('chesera_reset_token');
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        return { success: false, message: payload.message || 'Invalid email or password.' };
      }
      setIsAuthenticated(true);
      return { success: true };
    } catch {
      return { success: false, message: 'Unable to reach the authentication service.' };
    }
  }, []);

  const logout = useCallback(async () => {
    await fetch('/api/auth/logout', { method: 'POST' }).catch(() => undefined);
    setIsAuthenticated(false);
  }, []);

  return (
    <AuthContext.Provider value={{ resetEmail, setResetEmail: updateResetEmail, resetToken, setResetToken: updateResetToken, isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
