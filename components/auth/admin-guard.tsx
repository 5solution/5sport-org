'use client';

import { ProtectedRoute } from './protected-route';
import { Role } from '@/types';

interface AdminGuardProps {
  children: React.ReactNode;
}

export function AdminGuard({ children }: AdminGuardProps) {
  return (
    <ProtectedRoute allowedRoles={[Role.ADMIN]}>
      {children}
    </ProtectedRoute>
  );
}
