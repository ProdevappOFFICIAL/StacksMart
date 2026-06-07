"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';

interface AuthContextType {
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setToken: (token: string | null) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [token, setTokenState] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // Initialize token from localStorage on mount
  useEffect(() => {
    console.log('AuthContext: Initializing...');
    const storedToken = localStorage.getItem('authToken');
    console.log('AuthContext: Stored token:', storedToken ? 'Present' : 'Not found');
    if (storedToken) {
      setTokenState(storedToken);
      console.log('AuthContext: Token set in state');
    }
    setIsLoading(false);
    console.log('AuthContext: Initialization complete');
  }, []);

  // Update localStorage when token changes
  const setToken = (newToken: string | null) => {
    console.log('AuthContext: Setting token:', newToken ? 'Present' : 'Null');
    setTokenState(newToken);
    if (newToken) {
      localStorage.setItem('authToken', newToken);
      // Also set the auth_token for the API client
      localStorage.setItem('auth_token', newToken);
      console.log('AuthContext: Token stored in localStorage');
    } else {
      localStorage.removeItem('authToken');
      localStorage.removeItem('auth_token');
      console.log('AuthContext: Token removed from localStorage');
    }
  };

  const logout = () => {
    setToken(null);
    router.push('/onboard');
  };

  const isAuthenticated = !!token;

  const value: AuthContextType = {
    token,
    isAuthenticated,
    isLoading,
    setToken,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
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