'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';

interface AuthContextType {
  resetEmail: string | null;
  setResetEmail: (email: string | null) => void;
  isAuthenticated: boolean;
  login: (email: string, password: string) => boolean;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [resetEmail, setResetEmail] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Check if user is already logged in (from localStorage)
  React.useEffect(() => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      setIsAuthenticated(true);
    }
  }, []);

  const login = useCallback((email: string, password: string) => {
    // Demo credentials
    if (email === 'alamin@gmail.com' && password === 'admin') {
      const token = 'demo_token_' + Date.now();
      localStorage.setItem('auth_token', token);
      localStorage.setItem('user_email', email);
      
      // Set cookie for middleware
      document.cookie = `auth_token=${token}; path=/; max-age=86400`;
      
      setIsAuthenticated(true);
      return true;
    }
    return false;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_email');
    
    // Clear cookie
    document.cookie = 'auth_token=; path=/; max-age=0';
    
    setIsAuthenticated(false);
  }, []);

  return (
    <AuthContext.Provider value={{ resetEmail, setResetEmail, isAuthenticated, login, logout }}>
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
