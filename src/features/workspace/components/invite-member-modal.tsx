'use client';

import * as React from 'react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Mail, Send, UserCheck, UserPlus } from 'lucide-react';
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
import { useDirectAddMember } from '../hooks/use-direct-add-member';

interface InviteMemberModalProps {
  workspaceId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type InviteMode = 'INVITE' | 'DIRECT';

export function InviteMemberModal({
  workspaceId,
  open,
  onOpenChange,
}: InviteMemberModalProps) {
  const [mode, setMode] = useState<InviteMode>('INVITE');

  const sendInvitationMutation = useSendInvitation(workspaceId, () => {
    onOpenChange(false);
  });

  const directAddMutation = useDirectAddMember(workspaceId, () => {
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

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      reset();
      setMode('INVITE');
    }
    onOpenChange(newOpen);
  };

  const onSubmit = (data: InviteMemberInput) => {
    if (mode === 'INVITE') {
      sendInvitationMutation.mutate(data);
    } else {
      directAddMutation.mutate({
        email: data.email,
        role: data.role,
      });
    }
  };

  const isPending =
    sendInvitationMutation.isPending || directAddMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[440px] rounded-2xl">
        <DialogHeader>
          <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-1">
            <UserPlus className="h-5 w-5" />
          </div>
          <DialogTitle>
            {mode === 'INVITE' ? 'Invite Team Member' : 'Direct Add Member'}
          </DialogTitle>
          <DialogDescription>
            {mode === 'INVITE'
              ? 'Send a tokenized 7-day email invitation to collaborate on this workspace.'
              : 'Immediately add an existing registered user to this workspace by email.'}
          </DialogDescription>
        </DialogHeader>

        {/* Mode Toggle Tabs */}
        <div className="flex rounded-lg bg-muted p-1 border border-border">
          <button
            type="button"
            onClick={() => setMode('INVITE')}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-all flex items-center justify-center gap-1.5 ${
              mode === 'INVITE'
                ? 'bg-background text-foreground shadow-xs'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Send className="h-3.5 w-3.5" /> Email Invitation
          </button>
          <button
            type="button"
            onClick={() => setMode('DIRECT')}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-all flex items-center justify-center gap-1.5 ${
              mode === 'DIRECT'
                ? 'bg-background text-foreground shadow-xs'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <UserCheck className="h-3.5 w-3.5" /> Direct Add
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-1">
          {/* Email Address */}
          <div className="space-y-1.5">
            <Label htmlFor="invite-email">Work Email Address</Label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-3.5 h-4 w-4 text-muted-foreground" />
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
              <option value={WorkspaceRole.MEMBER}>
                Member (Can create, view & edit projects)
              </option>
              <option value={WorkspaceRole.ADMIN}>
                Admin (Can manage settings & team members)
              </option>
              <option value={WorkspaceRole.GUEST}>
                Guest (Restricted access to assigned projects)
              </option>
            </select>
            {errors.role && (
              <p className="text-xs text-danger font-medium mt-1">
                {errors.role.message}
              </p>
            )}
          </div>

          <div className="pt-2 flex flex-col-reverse sm:flex-row justify-end gap-2 sm:gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="h-10 sm:h-11 rounded-lg w-full sm:w-auto"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="h-10 sm:h-11 font-semibold rounded-lg shadow-xs w-full sm:w-auto"
              isLoading={isPending}
            >
              {mode === 'INVITE' ? 'Send Invitation' : 'Add Member'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
