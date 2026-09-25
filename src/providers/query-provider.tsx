'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState, type ReactNode } from 'react';

interface HttpErrorLike {
  response?: {
    status?: number;
  };
}

function isHttpError(error: unknown): error is HttpErrorLike {
  return typeof error === 'object' && error !== null && 'response' in error;
}

export function QueryProvider({ children }: { children: ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 1000 * 60 * 5, // 5 minutes cache
            refetchOnWindowFocus: false,
            retry: (failureCount, error: unknown) => {
              if (isHttpError(error)) {
                if (error.response?.status === 401 || error.response?.status === 403) {
                  return false;
                }
              }
              return failureCount < 2;
            },
          },
        },
      }),
  );

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}
