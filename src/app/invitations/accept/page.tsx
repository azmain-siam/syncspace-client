'use client';

import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import Link from 'next/link';
import {
  AlertTriangle,
  Building2,
  CheckCircle2,
  Clock,
  Loader2,
  LogIn,
  LogOut,
  Shield,
  User,
  UserPlus,
  XCircle,
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/features/auth/stores/use-auth-store';
import { useValidateInvitation } from '@/features/workspace/hooks/use-validate-invitation';
import { useAcceptInvitation } from '@/features/workspace/hooks/use-accept-invitation';
import { useDeclineInvitation } from '@/features/workspace/hooks/use-decline-invitation';

function AcceptInvitationContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token') || '';

  const currentUser = useAuthStore((state) => state.user);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const logout = useAuthStore((state) => state.logout);

  const { data: validateResponse, isLoading, isError, error } = useValidateInvitation(token);
  const acceptMutation = useAcceptInvitation();
  const declineMutation = useDeclineInvitation();

  if (!token) {
    return (
      <div className="text-center space-y-4">
        <div className="h-12 w-12 rounded-full bg-danger/20 text-danger flex items-center justify-center mx-auto">
          <XCircle className="h-6 w-6" />
        </div>
        <h1 className="text-xl font-bold text-foreground">Missing Token</h1>
        <p className="text-xs sm:text-sm text-muted-foreground">
          No invitation token was provided in the link. Please check your invitation email.
        </p>
        <Link href="/dashboard">
          <Button variant="outline" className="w-full h-11 rounded-lg">
            Back to Dashboard
          </Button>
        </Link>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="text-center space-y-4 py-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
        <h1 className="text-xl font-bold text-foreground">
          Validating invitation...
        </h1>
        <p className="text-xs sm:text-sm text-muted-foreground">
          Please wait while we verify your workspace invitation status.
        </p>
      </div>
    );
  }

  if (isError || !validateResponse?.data) {
    const errorMessage =
      error?.response?.data?.message ||
      'This workspace invitation is invalid, has expired, or was already revoked.';

    return (
      <div className="text-center space-y-4">
        <div className="h-12 w-12 rounded-full bg-danger/20 text-danger flex items-center justify-center mx-auto">
          <XCircle className="h-6 w-6" />
        </div>
        <h1 className="text-xl font-bold text-foreground">
          Invitation Invalid
        </h1>
        <p className="text-xs sm:text-sm text-muted-foreground max-w-sm mx-auto leading-relaxed">
          {Array.isArray(errorMessage) ? errorMessage.join('. ') : errorMessage}
        </p>
        <div className="pt-2">
          <Link href="/dashboard">
            <Button className="w-full h-11 font-semibold rounded-lg">
              Return to Dashboard
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const invitation = validateResponse.data;
  const isEmailMismatch =
    isAuthenticated &&
    currentUser?.email &&
    currentUser.email.toLowerCase() !== invitation.invitedEmail.toLowerCase();

  const formattedExpiry = new Date(invitation.expiresAt).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  const returnUrl = `/invitations/accept?token=${encodeURIComponent(token)}`;

  return (
    <div className="space-y-6 text-center sm:text-left">
      {/* Header */}
      <div className="space-y-1.5 text-center">
        <div className="h-12 w-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mx-auto border border-primary/20">
          <Building2 className="h-6 w-6" />
        </div>
        <h1 className="text-2xl font-extrabold tracking-tight text-foreground">
          Workspace Invitation
        </h1>
        <p className="text-xs sm:text-sm text-muted-foreground">
          You have been invited to join a collaborative team on SyncSpace.
        </p>
      </div>

      {/* Workspace Invitation Detail Card */}
      <div className="rounded-xl border border-border bg-background p-4 space-y-4">
        <div className="flex items-center gap-3.5">
          <Avatar className="h-12 w-12 rounded-xl border border-border">
            {invitation.workspaceLogo && (
              <AvatarImage src={invitation.workspaceLogo} alt={invitation.workspaceName} />
            )}
            <AvatarFallback className="rounded-xl bg-primary/10 text-primary font-bold text-base">
              {invitation.workspaceName.substring(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="text-left space-y-1 min-w-0">
            <h3 className="font-bold text-base text-foreground truncate">
              {invitation.workspaceName}
            </h3>
            <div className="flex items-center gap-2">
              <Badge variant="default" className="gap-1 text-[11px]">
                <Shield className="h-3 w-3" /> {invitation.role}
              </Badge>
              <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                <Clock className="h-3 w-3" /> Expires {formattedExpiry}
              </span>
            </div>
          </div>
        </div>

        {/* Inviter & Recipient Details */}
        <div className="space-y-1.5 pt-3 border-t border-border/60 text-xs text-muted-foreground">
          {invitation.inviterName && (
            <div className="flex items-center gap-2">
              <User className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
              <span>
                Invited by <strong className="text-foreground">{invitation.inviterName}</strong>
              </span>
            </div>
          )}
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
            <span>
              Recipient: <strong className="text-foreground">{invitation.invitedEmail}</strong>
            </span>
          </div>
        </div>
      </div>

      {/* Unauthenticated State Notice & Auth CTAs */}
      {!isAuthenticated ? (
        <div className="space-y-3 pt-1">
          <div className="p-3 rounded-xl border border-border bg-muted/30 text-xs text-muted-foreground text-center">
            You must be logged in as <strong className="text-foreground">{invitation.invitedEmail}</strong> to accept this invitation.
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <Link href={`/login?redirect=${encodeURIComponent(returnUrl)}&email=${encodeURIComponent(invitation.invitedEmail)}`}>
              <Button className="w-full h-11 font-semibold rounded-lg gap-2">
                <LogIn className="h-4 w-4" /> Log In
              </Button>
            </Link>
            <Link href={`/register?redirect=${encodeURIComponent(returnUrl)}&email=${encodeURIComponent(invitation.invitedEmail)}`}>
              <Button variant="outline" className="w-full h-11 rounded-lg gap-2">
                <UserPlus className="h-4 w-4" /> Create Account
              </Button>
            </Link>
          </div>
        </div>
      ) : (
        /* Authenticated State Actions */
        <div className="space-y-3 pt-1">
          {/* Email mismatch warning */}
          {isEmailMismatch && (
            <div className="p-3 rounded-xl border border-amber-500/30 bg-amber-500/10 text-xs text-amber-900 dark:text-amber-200 space-y-2 text-left">
              <div className="flex items-center gap-2 font-bold text-amber-700 dark:text-amber-400">
                <AlertTriangle className="h-4 w-4 shrink-0" />
                <span>Email Mismatch</span>
              </div>
              <p className="leading-relaxed">
                You are currently signed in as <strong>{currentUser?.email}</strong>, but this invitation was issued to <strong>{invitation.invitedEmail}</strong>.
              </p>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  logout();
                  window.location.href = `/login?redirect=${encodeURIComponent(returnUrl)}&email=${encodeURIComponent(invitation.invitedEmail)}`;
                }}
                className="h-8 text-xs gap-1.5 rounded-lg border-amber-500/40 text-amber-800 dark:text-amber-200 hover:bg-amber-500/20"
              >
                <LogOut className="h-3 w-3" /> Switch to Invited Account
              </Button>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3 pt-1">
            <Button
              type="button"
              variant="outline"
              onClick={() => declineMutation.mutate(token)}
              className="h-11 rounded-lg"
              isLoading={declineMutation.isPending}
            >
              Decline
            </Button>
            <Button
              type="button"
              onClick={() => acceptMutation.mutate(token)}
              className="h-11 font-semibold rounded-lg shadow-xs"
              isLoading={acceptMutation.isPending}
            >
              Accept Invitation
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function AcceptInvitationPage() {
  return (
    <div className="flex min-h-screen items-center justify-center p-4 bg-background text-foreground">
      <div className="w-full max-w-[460px] rounded-2xl border border-border/80 bg-card p-6 sm:p-8 shadow-sm">
        <Suspense
          fallback={
            <div className="flex h-32 w-full items-center justify-center">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          }
        >
          <AcceptInvitationContent />
        </Suspense>
      </div>
    </div>
  );
}
