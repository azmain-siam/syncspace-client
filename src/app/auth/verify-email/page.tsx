'use client';

import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import Link from 'next/link';
import { CheckCircle2, Loader2, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/common/theme-toggle';
import { useVerifyEmail } from '@/features/auth/hooks/use-verify-email';

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token') || '';
  const { data, isLoading, isError, error } = useVerifyEmail(token);

  if (!token) {
    return (
      <div className="text-center space-y-4">
        <div className="h-12 w-12 rounded-full bg-danger/20 text-danger flex items-center justify-center mx-auto">
          <XCircle className="h-6 w-6" />
        </div>
        <h1 className="text-xl font-bold text-foreground">Missing Token</h1>
        <p className="text-sm text-muted-foreground">
          No verification token was provided in the link.
        </p>
        <Link href="/login">
          <Button variant="outline" className="w-full">
            Back to Login
          </Button>
        </Link>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="text-center space-y-4 py-6">
        <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
        <h1 className="text-xl font-bold text-foreground">
          Verifying your email...
        </h1>
        <p className="text-sm text-muted-foreground">
          Please wait while we validate your verification token.
        </p>
      </div>
    );
  }

  if (isError) {
    const errorMessage =
      error.response?.data?.message ||
      'Email verification failed. The link may have expired or already been used.';

    return (
      <div className="text-center space-y-4">
        <div className="h-12 w-12 rounded-full bg-danger/20 text-danger flex items-center justify-center mx-auto">
          <XCircle className="h-6 w-6" />
        </div>
        <h1 className="text-xl font-bold text-foreground">
          Verification Failed
        </h1>
        <p className="text-sm text-muted-foreground max-w-sm mx-auto">
          {errorMessage}
        </p>
        <div className="pt-2 flex flex-col gap-2">
          <Link href="/login">
            <Button className="w-full font-semibold">
              Go to Login
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="text-center space-y-4">
      <div className="h-12 w-12 rounded-full bg-success/20 text-success-foreground flex items-center justify-center mx-auto">
        <CheckCircle2 className="h-6 w-6" />
      </div>
      <h1 className="text-xl font-bold text-foreground">
        Email Verified Successfully!
      </h1>
      <p className="text-sm text-muted-foreground">
        {data?.message || 'Your email has been verified. You can now sign in to your workspace.'}
      </p>
      <div className="pt-2">
        <Link href="/login">
          <Button className="w-full font-semibold shadow-sm">
            Continue to Login
          </Button>
        </Link>
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <div className="relative flex min-h-screen items-center justify-center p-4 bg-background">
      <div className="absolute top-4 right-4 z-10">
        <ThemeToggle />
      </div>
      <div className="w-full max-w-[420px] rounded-2xl border border-border bg-card p-6 sm:p-8 shadow-sm">
        <Suspense
          fallback={
            <div className="flex h-32 w-full items-center justify-center">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          }
        >
          <VerifyEmailContent />
        </Suspense>
      </div>
    </div>
  );
}
