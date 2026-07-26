'use client';

import { useEffect, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useAuthStore } from '@/features/auth/stores/use-auth-store';
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

    const accessToken = searchParams.get('accessToken');
    const refreshToken = searchParams.get('refreshToken');

    if (!accessToken || !refreshToken) {
      toast.error('Google sign-in failed. Tokens were missing from response.');
      router.replace('/login');
      return;
    }

    const processAuth = async () => {
      try {
        setTokens(accessToken, refreshToken);
        const userRes = await authApi.getCurrentUser();
        if (userRes.data) {
          setUser(userRes.data);
        }
        toast.success('Signed in with Google successfully!');
        router.replace('/');
      } catch (err) {
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
