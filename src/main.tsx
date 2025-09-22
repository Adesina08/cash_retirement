import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { RouterProvider } from 'react-router-dom';

import '@/styles/tailwind.css';
import { ThemeProvider } from '@components/theme-provider';
import { AuthProvider } from '@features/auth/auth-context';
import { DataClientProvider } from '@lib/data';
import { createAppRouter } from './routes/router';

const queryClient = new QueryClient();
const router = createAppRouter();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider>
      <DataClientProvider>
        <AuthProvider>
          <QueryClientProvider client={queryClient}>
            <RouterProvider router={router} />
            <ReactQueryDevtools initialIsOpen={false} position="bottom-right" />
          </QueryClientProvider>
        </AuthProvider>
      </DataClientProvider>
    </ThemeProvider>
  </StrictMode>
);
