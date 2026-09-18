'use client';

import * as React from 'react';
import { LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import type { Workspace } from '@/types/domain';
import { useLeaveWorkspace } from '../hooks/use-leave-workspace';

interface LeaveWorkspaceDialogProps {
  workspace: Workspace;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function LeaveWorkspaceDialog({
  workspace,
  open,
  onOpenChange,
}: LeaveWorkspaceDialogProps) {
  const leaveMutation = useLeaveWorkspace(workspace.id, () => {
    onOpenChange(false);
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[420px] rounded-2xl">
        <DialogHeader>
          <div className="h-11 w-11 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center mb-1">
            <LogOut className="h-6 w-6" />
          </div>
          <DialogTitle className="text-xl">Leave Workspace</DialogTitle>
          <DialogDescription>
            Are you sure you want to leave this workspace?
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 pt-2">
          <p className="text-xs text-muted-foreground leading-relaxed">
            You are about to leave <strong>{workspace.name}</strong>. You will immediately lose access to all projects, boards, and tasks within this workspace until re-invited.
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
            isLoading={leaveMutation.isPending}
            onClick={() => leaveMutation.mutate(workspace.id)}
            className="h-11 font-semibold rounded-lg gap-2"
          >
            <LogOut className="h-4 w-4" /> Leave Workspace
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
