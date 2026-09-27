'use client';

import * as React from 'react';
import { UserMinus } from 'lucide-react';
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

interface RemoveMemberDialogProps {
  member: WorkspaceMember | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  isLoading: boolean;
}

export function RemoveMemberDialog({
  member,
  open,
  onOpenChange,
  onConfirm,
  isLoading,
}: RemoveMemberDialogProps) {
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[420px] rounded-2xl">
        <DialogHeader>
          <div className="h-11 w-11 rounded-2xl bg-danger/10 text-danger flex items-center justify-center mb-1">
            <UserMinus className="h-6 w-6" />
          </div>
          <DialogTitle className="text-xl">Remove Workspace Member</DialogTitle>
          <DialogDescription>
            Are you sure you want to remove this member from the workspace?
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 pt-2">
          {/* Member Card */}
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

          <p className="text-xs text-muted-foreground leading-relaxed">
            They will immediately lose access to all projects, boards, tasks, and discussions within this workspace.
          </p>
        </div>

        <DialogFooter className="gap-2 sm:gap-0 pt-3">
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
            isLoading={isLoading}
            onClick={onConfirm}
            className="h-11 font-semibold rounded-lg"
          >
            Remove Member
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
