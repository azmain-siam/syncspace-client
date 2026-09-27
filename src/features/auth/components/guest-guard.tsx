'use client';

import { useEffect, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { useMounted } from '@/hooks/use-mounted';
import { useAuthStore } from '../stores/use-auth-store';

export function GuestGuard({ children }: { children: ReactNode }) {
  const router = useRouter();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const mounted = useMounted();

  useEffect(() => {
    if (mounted && isAuthenticated) {
      let destination = '/dashboard';
      if (typeof window !== 'undefined') {
        const params = new URLSearchParams(window.location.search);
        const redirectParam = params.get('redirect');
        if (
          redirectParam &&
          redirectParam.startsWith('/') &&
          !redirectParam.startsWith('//')
        ) {
          destination = redirectParam;
        }
      }
      router.replace(destination);
    }
  }, [mounted, isAuthenticated, router]);

  if (!mounted) {
    return (
      <div className="flex h-64 w-full items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}
