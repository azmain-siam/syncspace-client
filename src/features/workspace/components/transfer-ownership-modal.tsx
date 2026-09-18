'use client';

import * as React from 'react';
import { useState } from 'react';
import { Crown, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import type { WorkspaceMember } from '@/types/domain';
import { useTransferOwnership } from '../hooks/use-transfer-ownership';

interface TransferOwnershipModalProps {
  workspaceId: string;
  member: WorkspaceMember | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function TransferOwnershipModal({
  workspaceId,
  member,
  open,
  onOpenChange,
}: TransferOwnershipModalProps) {
  const [confirmed, setConfirmed] = useState(false);

  const transferMutation = useTransferOwnership(workspaceId, () => {
    onOpenChange(false);
    setConfirmed(false);
  });

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      setConfirmed(false);
    }
    onOpenChange(newOpen);
  };

  if (!member) return null;

  const memberUser = member.user;
  const initials = memberUser?.name
    ? memberUser.name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .substring(0, 2)
        .toUpperCase()
    : 'U';

  const handleTransfer = () => {
    transferMutation.mutate({ memberId: member.userId });
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[440px] rounded-2xl">
        <DialogHeader>
          <div className="h-11 w-11 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center mb-1">
            <Crown className="h-6 w-6" />
          </div>
          <DialogTitle className="text-xl">Transfer Workspace Ownership</DialogTitle>
          <DialogDescription>
            You are about to transfer ownership of this workspace to another team member.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          {/* Target Member Card */}
          <div className="flex items-center gap-3 p-3 rounded-xl border border-border bg-muted/30">
            <Avatar className="h-10 w-10 border border-border">
              {memberUser?.avatar && (
                <AvatarImage src={memberUser.avatar} alt={memberUser.name} />
              )}
              <AvatarFallback>{initials}</AvatarFallback>
            </Avatar>
            <div className="flex flex-col min-w-0">
              <span className="font-semibold text-sm text-foreground truncate">
                {memberUser?.name || 'User'}
              </span>
              <span className="text-xs text-muted-foreground truncate">
                {memberUser?.email}
              </span>
            </div>
          </div>

          {/* Warning Card */}
          <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-3.5 text-xs text-amber-900 dark:text-amber-200 space-y-2">
            <div className="flex items-center gap-2 font-bold text-sm text-amber-700 dark:text-amber-400">
              <AlertTriangle className="h-4 w-4 shrink-0" />
              <span>Irreversible Action</span>
            </div>
            <ul className="list-disc pl-4 space-y-1 text-xs opacity-90 leading-relaxed">
              <li>
                You will immediately step down as <strong>Owner</strong> and become a workspace <strong>Admin</strong>.
              </li>
              <li>
                The new owner will have full administrative authority over all workspace settings, members, and deletion.
              </li>
              <li>You cannot undo this action without the new owner transferring it back.</li>
            </ul>
          </div>

          {/* Confirmation Checkbox */}
          <label className="flex items-start gap-2.5 pt-1 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={confirmed}
              onChange={(e) => setConfirmed(e.target.checked)}
              className="mt-0.5 h-4 w-4 rounded border-input text-primary focus:ring-primary/20 accent-primary"
            />
            <span className="text-xs text-foreground/90 font-medium leading-tight">
              I understand that I am relinquishing ownership of this workspace to {memberUser?.name || 'this member'}.
            </span>
          </label>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="h-11 rounded-lg"
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            disabled={!confirmed}
            isLoading={transferMutation.isPending}
            onClick={handleTransfer}
            className="h-11 font-semibold rounded-lg gap-2"
          >
            <Crown className="h-4 w-4" /> Transfer Ownership
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
