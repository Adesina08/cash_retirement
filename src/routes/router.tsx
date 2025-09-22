import { createBrowserRouter, Navigate } from 'react-router-dom';
import { AppLayout } from '@components/app-layout';
import { MyAdvancesPage } from '@pages/my-advances';
import { AdvanceWizardPage } from '@pages/advance-wizard';
import { AdvanceDetailPage } from '@pages/advance-detail';
import { FinanceDashboardPage } from '@pages/finance-dashboard';
import { RequireRole } from './secure-route';

export function createAppRouter() {
  return createBrowserRouter([
    {
      path: '/',
      element: <AppLayout />,
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
    }
  ]);
}
