import { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { Role } from '@lib/types';
import { useAuth } from '@features/auth/auth-context';

interface RequireRoleProps {
  roles: Role[];
  children: ReactNode;
}

export function RequireRole({ roles, children }: RequireRoleProps) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <div className="p-8 text-sm text-slate-500">Checking permissions…</div>;
  }

  if (!user) {
    return <Navigate to="/advances" state={{ from: location }} replace />;
  }

  if (!roles.includes(user.role)) {
    return (
      <div className="p-8 text-sm text-rose-600">
        You do not have access to this section. Current role: <strong>{user.role}</strong>
      </div>
    );
  }

  return <>{children}</>;
}
