'use client';

import { useEffect, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { useMounted } from '@/hooks/use-mounted';
import { useAuthStore } from '../stores/use-auth-store';

export function AuthGuard({ children }: { children: ReactNode }) {
  const router = useRouter();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const mounted = useMounted();

  useEffect(() => {
    if (mounted && !isAuthenticated) {
      if (typeof window !== 'undefined') {
        const currentPath = window.location.pathname + window.location.search;
        const redirectQuery =
          currentPath && currentPath !== '/' && currentPath !== '/login'
            ? `?redirect=${encodeURIComponent(currentPath)}`
            : '';
        router.replace(`/login${redirectQuery}`);
      } else {
        router.replace('/login');
      }
    }
  }, [mounted, isAuthenticated, router]);

  if (!mounted || !isAuthenticated) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-xs font-medium text-muted-foreground">
            Authenticating session...
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
