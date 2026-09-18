'use client';

import { useSearchParams } from 'next/navigation';
import { Suspense, useState } from 'react';
import Link from 'next/link';
import { CheckCircle2, Loader2, Mail, Send, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ThemeToggle } from '@/components/common/theme-toggle';
import { useVerifyEmail } from '@/features/auth/hooks/use-verify-email';
import { useResendVerification } from '@/features/auth/hooks/use-resend-verification';
import { formatApiErrorMessage } from '@/lib/api/api-error';

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token') || '';
  const initialEmail = searchParams.get('email') || '';
  const [resendEmail, setResendEmail] = useState(initialEmail);
  const [showResendForm, setShowResendForm] = useState(false);

  const { data, isLoading, isError, error } = useVerifyEmail(token);
  const resendMutation = useResendVerification();

  const handleResendSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (resendEmail.trim()) {
      resendMutation.mutate({ email: resendEmail.trim() });
    }
  };

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
        <div className="pt-2">
          <Link href="/login">
            <Button variant="outline" className="w-full cursor-pointer">
              Back to Login
            </Button>
          </Link>
        </div>
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
    const errorMessage = formatApiErrorMessage(
      error,
      'Email verification failed. The link may have expired or already been used.',
    );

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

        {/* Resend Verification Section */}
        {showResendForm ? (
          <form onSubmit={handleResendSubmit} className="space-y-3 pt-2 text-left">
            <div className="space-y-1">
              <label htmlFor="resend-email" className="text-xs font-medium text-foreground">
                Enter your email address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="resend-email"
                  type="email"
                  placeholder="alex@company.com"
                  className="pl-9 h-10 text-sm"
                  value={resendEmail}
                  onChange={(e) => setResendEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            {resendMutation.isSuccess ? (
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-semibold flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 shrink-0" />
                <span>Verification link sent! Check your email.</span>
              </div>
            ) : (
              <Button
                type="submit"
                className="w-full h-10 text-xs font-semibold gap-1.5 cursor-pointer"
                isLoading={resendMutation.isPending}
              >
                <Send className="h-3.5 w-3.5" /> Send New Verification Link
              </Button>
            )}
          </form>
        ) : (
          <div className="pt-2 flex flex-col gap-2">
            <Button
              variant="outline"
              className="w-full font-semibold cursor-pointer"
              onClick={() => setShowResendForm(true)}
            >
              Resend Verification Email
            </Button>
            <Link href="/login">
              <Button variant="ghost" className="w-full cursor-pointer text-muted-foreground hover:text-foreground">
                Back to Login
              </Button>
            </Link>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="text-center space-y-4">
      <div className="h-12 w-12 rounded-full bg-success/20 text-success-foreground flex items-center justify-center mx-auto">
        <CheckCircle2 className="h-6 w-6 text-emerald-500" />
      </div>
      <h1 className="text-xl font-bold text-foreground">
        Email Verified Successfully!
      </h1>
      <p className="text-sm text-muted-foreground">
        {data?.data?.message || data?.message || 'Your email has been verified. You can now sign in to your workspace.'}
      </p>
      <div className="pt-2">
        <Link href="/login">
          <Button className="w-full font-semibold shadow-sm cursor-pointer">
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
