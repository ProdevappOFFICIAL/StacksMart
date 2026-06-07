"use client";

import React from 'react';
import { useAuth } from '@/contexts/AuthContext';

export function AuthStatus() {
  const { isAuthenticated, token, logout } = useAuth();

  // Also check localStorage directly
  return (
    <div className="">
    
      {token && (
        <p className="text-xs mt-2 break-all hidden">Token: {token.substring(0, 50)}...</p>
      )}
      {isAuthenticated && (
        <button 
          onClick={logout}
          className="mt-2 px-3 py-1 bg-red-500 text-white rounded text-sm hover:bg-red-600"
        >
          Logout
        </button>
      )}
    </div>
  );
}