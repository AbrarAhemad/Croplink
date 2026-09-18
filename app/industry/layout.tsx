'use client';

import React from 'react';
import { RoleGuard } from '@/components/auth/RoleGuard';

export default function IndustryLayout({ children }: { children: React.ReactNode }) {
  return <RoleGuard allowedRole="INDUSTRY">{children}</RoleGuard>;
}
