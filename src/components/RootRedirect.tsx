'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { getDefaultRoute } from '@/lib/permissions';

export function RootRedirect() {
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading) {
      if (user) {
        router.push(getDefaultRoute(user.userType));
      } else {
        router.push('/auth/signin');
      }
    }
  }, [user, loading, router]);

  return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
}
