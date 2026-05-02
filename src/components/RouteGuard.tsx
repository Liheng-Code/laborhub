'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { canAccessRoute, getDefaultRoute } from '@/lib/permissions';

interface RouteGuardProps {
  children: React.ReactNode;
  allowedRoles: string[];
  fallbackRoute?: string;
}

export function RouteGuard({ children, allowedRoles, fallbackRoute }: RouteGuardProps) {
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push('/auth/signin');
        return;
      }

      if (!canAccessRoute(user.userType, allowedRoles)) {
        const redirect = fallbackRoute || getDefaultRoute(user.userType);
        router.push(redirect);
      }
    }
  }, [user, loading, allowedRoles, fallbackRoute, router]);

  if (loading || !user || !canAccessRoute(user.userType, allowedRoles)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground text-sm">Checking access...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
