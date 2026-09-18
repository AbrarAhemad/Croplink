'use client';

import React from 'react';
import { RoleGuard } from '@/components/auth/RoleGuard';

export default function FarmerLayout({ children }: { children: React.ReactNode }) {
  return <RoleGuard allowedRole="FARMER">{children}</RoleGuard>;
}
