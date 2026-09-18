'use client';

import React, { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAppStore } from '@/lib/store/use-app-store';
import { UserRole } from '@/types';

export function RoleGuard({ allowedRole, children }: { allowedRole: UserRole; children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { currentUser } = useAppStore();

  useEffect(() => {
    if (!currentUser) {
      router.push('/login');
      return;
    }

    if (currentUser.role !== allowedRole) {
      // Redirect appropriately to user's assigned dashboard
      if (currentUser.role === 'FARMER') {
        router.push('/farmer');
      } else if (currentUser.role === 'INDUSTRY') {
        router.push('/industry');
      } else if (currentUser.role === 'ADMIN') {
        router.push('/admin');
      }
    }
  }, [currentUser, allowedRole, router]);

  if (!currentUser || currentUser.role !== allowedRole) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center p-8">
        <div className="text-center text-xs text-slate-500 space-y-2">
          <div className="w-8 h-8 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p>Redirecting to authorized dashboard...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
