'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { api, LoginResponse } from '@/lib/api/client';

export type UserRole = 'worker' | 'foreman' | 'engineer' | 'supervisor' | 'project_manager' | 'admin' | 'platform_owner';

interface User {
  id: string;
  email: string;
  userType?: UserRole;
  companyName?: string;
  fullName?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string, tenantSlug: string) => Promise<void>;
  signUp: (companyName: string, email: string, password: string, fullName: string) => Promise<void>;
  signOut: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const storedUser = localStorage.getItem('user');
    const token = localStorage.getItem('accessToken');

    if (storedUser && token) {
      setUser(JSON.parse(storedUser));
    }

    setLoading(false);
  }, []);

  const signIn = async (email: string, password: string, tenantSlug: string) => {
    setLoading(true);

    try {
      const response = await api.post<LoginResponse>('/auth/admin/login', {
        email,
        password,
      }, {
        'X-Tenant-Slug': tenantSlug,
      });

      if (response.error) {
        throw new Error(response.error);
      }

      const { accessToken, refreshToken, user: authUser } = response.data!;

      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
      localStorage.setItem('tenantSlug', tenantSlug);

      const mappedUser: User = {
        id: authUser.id,
        email: authUser.email,
        userType: authUser.role as UserRole,
        companyName: tenantSlug,
        fullName: authUser.fullName,
      };

      localStorage.setItem('user', JSON.stringify(mappedUser));
      setUser(mappedUser);
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (companyName: string, email: string, password: string, fullName: string) => {
    setLoading(true);

    try {
      const slug = companyName.toLowerCase().replace(/[^a-z0-9]/g, '_').slice(0, 50);

      const response = await api.post('/tenants/signup', {
        companyName,
        slug,
        plan: 'starter',
        adminEmail: email,
        adminPassword: password,
        adminFullName: fullName,
      });

      if (response.error) {
        throw new Error(response.error);
      }

      await signIn(email, password, slug);
    } finally {
      setLoading(false);
    }
  };

  const signOut = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('tenantSlug');
    localStorage.removeItem('user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signUp, signOut }}>
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
