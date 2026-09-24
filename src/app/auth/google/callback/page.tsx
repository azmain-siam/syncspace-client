'use client';

import { useEffect, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import {
  useAuthStore,
  AUTH_STORAGE_KEYS,
} from '@/features/auth/stores/use-auth-store';
import { authApi } from '@/features/auth/api/auth.api';

function GoogleCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const setTokens = useAuthStore((state) => state.setTokens);
  const setUser = useAuthStore((state) => state.setUser);
  const processedRef = useRef(false);

  useEffect(() => {
    if (processedRef.current) return;
    processedRef.current = true;

    const errorParam = searchParams.get('error') || searchParams.get('message');
    if (errorParam) {
      const msg =
        errorParam === 'access_denied'
          ? 'Google sign-in was cancelled.'
          : `Google sign-in failed: ${errorParam}`;
      toast.error(msg);
      router.replace('/login');
      return;
    }

    const accessToken = searchParams.get('accessToken');
    const refreshToken = searchParams.get('refreshToken');

    // Immediately sanitize the URL synchronously to prevent token leakage in history, screen shares, or browser extensions
    if (typeof window !== 'undefined') {
      window.history.replaceState({}, document.title, window.location.pathname);
    }

    if (!accessToken || !refreshToken) {
      toast.error('Google sign-in failed. Tokens were missing from response.');
      router.replace('/login');
      return;
    }

    const processAuth = async () => {
      try {
        if (typeof window !== 'undefined') {
          localStorage.setItem(AUTH_STORAGE_KEYS.ACCESS_TOKEN, accessToken);
          localStorage.setItem(AUTH_STORAGE_KEYS.REFRESH_TOKEN, refreshToken);
        }

        setTokens(accessToken, refreshToken);

        try {
          const userRes = await authApi.getCurrentUser();
          if (userRes.data) {
            setUser(userRes.data);
          }
        } catch {
          // Token is valid; user state can be fetched subsequently by queries
        }

        toast.success('Signed in with Google successfully!');
        router.replace('/dashboard');
      } catch {
        toast.error('Failed to complete Google sign-in. Please try again.');
        router.replace('/login');
      }
    };

    processAuth();
  }, [searchParams, setTokens, setUser, router]);

  return (
    <div className="flex flex-col items-center justify-center gap-3 py-8">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
      <p className="text-sm font-medium text-muted-foreground">
        Completing Google sign in...
      </p>
    </div>
  );
}

export default function GoogleCallbackPage() {
  return (
    <div className="flex min-h-screen items-center justify-center p-4 bg-background">
      <div className="w-full max-w-[380px] rounded-2xl border border-border bg-card p-6 shadow-sm text-center">
        <Suspense
          fallback={
            <div className="flex h-32 items-center justify-center">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          }
        >
          <GoogleCallbackContent />
        </Suspense>
      </div>
    </div>
  );
}
