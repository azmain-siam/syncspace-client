'use client';

import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import Link from 'next/link';
import { Building2, CheckCircle2, Loader2, Shield, User, XCircle } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useValidateInvitation } from '@/features/workspace/hooks/use-validate-invitation';
import { useAcceptInvitation } from '@/features/workspace/hooks/use-accept-invitation';
import { useDeclineInvitation } from '@/features/workspace/hooks/use-decline-invitation';

function AcceptInvitationContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token') || '';

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
        <p className="text-sm text-muted-foreground">
          No invitation token was provided in the link.
        </p>
        <Link href="/">
          <Button variant="outline" className="w-full h-11 rounded-lg">
            Back to Home
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
          Validating invitation...
        </h1>
        <p className="text-sm text-muted-foreground">
          Please wait while we check your invitation status.
        </p>
      </div>
    );
  }

  if (isError || !validateResponse?.data) {
    const errorMessage =
      error?.response?.data?.message ||
      'This workspace invitation is invalid, has expired, or was cancelled.';

    return (
      <div className="text-center space-y-4">
        <div className="h-12 w-12 rounded-full bg-danger/20 text-danger flex items-center justify-center mx-auto">
          <XCircle className="h-6 w-6" />
        </div>
        <h1 className="text-xl font-bold text-foreground">
          Invitation Invalid
        </h1>
        <p className="text-sm text-muted-foreground max-w-sm mx-auto">
          {errorMessage}
        </p>
        <div className="pt-2">
          <Link href="/">
            <Button className="w-full h-11 font-semibold rounded-lg">
              Return to Home
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const { workspace, inviter, invitation } = validateResponse.data;

  return (
    <div className="space-y-6 text-center sm:text-left">
      <div className="space-y-1.5 text-center">
        <div className="h-12 w-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mx-auto border border-primary/20">
          <Building2 className="h-6 w-6" />
        </div>
        <h1 className="text-2xl font-extrabold tracking-tight text-foreground">
          Workspace Invitation
        </h1>
        <p className="text-xs sm:text-sm text-muted-foreground">
          You have been invited to join a team workspace on SyncSpace.
        </p>
      </div>

      {/* Workspace Invitation Detail Card */}
      <div className="rounded-xl border border-border bg-background p-4 space-y-4">
        <div className="flex items-center gap-3">
          <Avatar className="h-12 w-12 rounded-xl border border-border">
            {workspace.logo && <AvatarImage src={workspace.logo} alt={workspace.name} />}
            <AvatarFallback className="rounded-xl bg-primary/10 text-primary font-bold text-base">
              {workspace.name.substring(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="text-left space-y-0.5 min-w-0">
            <h3 className="font-bold text-base text-foreground truncate">
              {workspace.name}
            </h3>
            <div className="flex items-center gap-2">
              <Badge variant="default" className="gap-1">
                <Shield className="h-3 w-3" /> {invitation.role}
              </Badge>
            </div>
          </div>
        </div>

        {/* Inviter Details */}
        {inviter && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground pt-2 border-t border-border/60">
            <User className="h-3.5 w-3.5" />
            <span>Invited by <strong className="text-foreground">{inviter.name}</strong> ({inviter.email})</span>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="grid grid-cols-2 gap-3 pt-2">
        <Button
          variant="outline"
          onClick={() => declineMutation.mutate(token)}
          className="h-11 rounded-lg"
          isLoading={declineMutation.isPending}
        >
          Decline
        </Button>
        <Button
          onClick={() => acceptMutation.mutate(token)}
          className="h-11 font-semibold rounded-lg shadow-xs"
          isLoading={acceptMutation.isPending}
        >
          Accept Invitation
        </Button>
      </div>
    </div>
  );
}

export default function AcceptInvitationPage() {
  return (
    <div className="flex min-h-screen items-center justify-center p-4 bg-background text-foreground">
      <div className="w-full max-w-[440px] rounded-2xl border border-border/80 bg-card p-6 sm:p-8 shadow-sm">
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
