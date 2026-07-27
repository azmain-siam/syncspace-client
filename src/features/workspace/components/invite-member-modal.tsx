'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Mail, UserPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { WorkspaceRole } from '@/types/domain';
import {
  inviteMemberSchema,
  type InviteMemberInput,
} from '../schemas/invite-member.schema';
import { useSendInvitation } from '../hooks/use-send-invitation';

interface InviteMemberModalProps {
  workspaceId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function InviteMemberModal({
  workspaceId,
  open,
  onOpenChange,
}: InviteMemberModalProps) {
  const sendInvitationMutation = useSendInvitation(workspaceId, () => {
    onOpenChange(false);
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<InviteMemberInput>({
    resolver: zodResolver(inviteMemberSchema),
    defaultValues: {
      email: '',
      role: WorkspaceRole.MEMBER,
    },
  });

  React.useEffect(() => {
    if (!open) {
      reset();
    }
  }, [open, reset]);

  const onSubmit = (data: InviteMemberInput) => {
    sendInvitationMutation.mutate(data);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[420px] rounded-2xl">
        <DialogHeader>
          <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-1">
            <UserPlus className="h-5 w-5" />
          </div>
          <DialogTitle>Invite Team Member</DialogTitle>
          <DialogDescription>
            Send an email invitation to add a new collaborator to this workspace.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-2">
          {/* Email Address */}
          <div className="space-y-1.5">
            <Label htmlFor="invite-email">Work Email Address</Label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-3.5 h-4 w-4 text-muted-foreground/60" />
              <Input
                id="invite-email"
                type="email"
                placeholder="colleague@company.com"
                className="pl-10 h-11 rounded-lg"
                error={!!errors.email}
                {...register('email')}
              />
            </div>
            {errors.email && (
              <p className="text-xs text-danger font-medium mt-1">
                {errors.email.message}
              </p>
            )}
          </div>

          {/* Role Selection */}
          <div className="space-y-1.5">
            <Label htmlFor="invite-role">Workspace Role</Label>
            <select
              id="invite-role"
              className="flex h-11 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground transition-all duration-150 focus:border-primary focus:shadow-[0_0_0_3px_rgba(70,72,212,0.12)] focus:outline-none"
              {...register('role')}
            >
              <option value={WorkspaceRole.MEMBER}>Member (Can view, create & edit projects)</option>
              <option value={WorkspaceRole.ADMIN}>Admin (Can manage settings & invite members)</option>
            </select>
            {errors.role && (
              <p className="text-xs text-danger font-medium mt-1">
                {errors.role.message}
              </p>
            )}
          </div>

          <div className="pt-2 flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="h-11 rounded-lg"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="h-11 font-semibold rounded-lg shadow-xs"
              isLoading={sendInvitationMutation.isPending}
            >
              Send Invitation
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
