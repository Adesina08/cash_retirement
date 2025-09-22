import { createBrowserRouter, Navigate, useLocation } from 'react-router-dom';
import { AppLayout } from '@components/app-layout';
import { MyAdvancesPage } from '@pages/my-advances';
import { AdvanceWizardPage } from '@pages/advance-wizard';
import { AdvanceDetailPage } from '@pages/advance-detail';
import { FinanceDashboardPage } from '@pages/finance-dashboard';
import { LoginPage } from '@pages/login';
import { useAuth } from '@features/auth/auth-context';
import { RequireRole } from './secure-route';

export function createAppRouter() {
  return createBrowserRouter([
    {
      path: '/login',
      element: <LoginPage />
    },
    {
      path: '/',
      element: <ProtectedAppLayout />,
      children: [
        {
          index: true,
          element: <Navigate to="/advances" replace />
        },
        {
          path: 'advances',
          element: <MyAdvancesPage />
        },
        {
          path: 'advances/new',
          element: (
            <RequireRole roles={['EMPLOYEE', 'ADMIN']}>
              <AdvanceWizardPage mode="create" />
            </RequireRole>
          )
        },
        {
          path: 'advances/:advanceId',
          element: <AdvanceDetailPage />
        },
        {
          path: 'advances/:advanceId/retire',
          element: (
            <RequireRole roles={['EMPLOYEE', 'ADMIN']}>
              <AdvanceWizardPage mode="retire" />
            </RequireRole>
          )
        },
        {
          path: 'finance',
          element: (
            <RequireRole roles={['FINANCE', 'ADMIN']}>
              <FinanceDashboardPage />
            </RequireRole>
          )
        }
      ]
    },
    {
      path: '*',
      element: <Navigate to="/" replace />
    }
  ]);
}

function ProtectedAppLayout() {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 text-slate-200">
        <div className="rounded-2xl border border-white/10 bg-white/5 px-6 py-4 text-sm font-medium shadow-lg shadow-brand-500/10">
          Preparing your workspace…
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <AppLayout />;
}
