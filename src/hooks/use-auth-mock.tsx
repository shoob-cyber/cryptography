
"use client";

import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { app as firebaseApp } from '@/lib/firebase'; // Import to initialize Firebase

interface User {
  id: string;
  email?: string;
  name?: string;
  walletAddress?: string;
}

interface AuthContextType {
  user: User | null;
  login: (type: 'email' | 'google' | 'metamask', details?: { email?: string; password?: string; wallet?: string }) => void;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true); // Start with loading true
  const router = useRouter();

  // The import of '@/lib/firebase' above ensures Firebase is initialized.
  // We don't need to explicitly call firebaseApp here for the mock auth to work.

  useEffect(() => {
    // Simulate checking for persisted login state
    const storedUser = localStorage.getItem('blocktalk-user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = (type: 'email' | 'google' | 'metamask', details?: { email?: string; password?: string; wallet?: string }) => {
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      let newUser: User | null = null;
      if (type === 'email' && details?.email) {
        newUser = { id: 'user-email-123', email: details.email, name: details.email.split('@')[0] };
      } else if (type === 'google') {
        newUser = { id: 'user-google-456', email: 'user@google.com', name: 'Google User' };
      } else if (type === 'metamask' && details?.wallet) {
         newUser = { id: 'user-metamask-789', walletAddress: details.wallet, name: 'MetaMask User' };
      }
      
      if (newUser) {
        setUser(newUser);
        localStorage.setItem('blocktalk-user', JSON.stringify(newUser));
        router.push('/chat');
      }
      setLoading(false);
    }, 1000);
  };

  const logout = () => {
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setUser(null);
      localStorage.removeItem('blocktalk-user');
      router.push('/');
      setLoading(false);
    }, 500);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
