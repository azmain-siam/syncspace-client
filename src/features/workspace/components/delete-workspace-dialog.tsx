'use client';

import * as React from 'react';
import { useState } from 'react';
import { AlertTriangle, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { Workspace } from '@/types/domain';
import { useDeleteWorkspace } from '../hooks/use-delete-workspace';

interface DeleteWorkspaceDialogProps {
  workspace: Workspace;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DeleteWorkspaceDialog({
  workspace,
  open,
  onOpenChange,
}: DeleteWorkspaceDialogProps) {
  const [confirmationInput, setConfirmationInput] = useState('');

  const deleteMutation = useDeleteWorkspace(workspace.id, () => {
    onOpenChange(false);
  });

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      setConfirmationInput('');
    }
    onOpenChange(newOpen);
  };

  const isConfirmed = confirmationInput.trim() === workspace.name.trim();

  const handleDelete = () => {
    if (isConfirmed) {
      deleteMutation.mutate(workspace.id);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[440px] rounded-2xl">
        <DialogHeader>
          <div className="h-11 w-11 rounded-2xl bg-danger/10 text-danger flex items-center justify-center mb-1">
            <Trash2 className="h-6 w-6" />
          </div>
          <DialogTitle className="text-xl">Delete Workspace</DialogTitle>
          <DialogDescription>
            This action cannot be undone. Please confirm by typing the workspace name.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          {/* Warning Box */}
          <div className="rounded-xl border border-danger/30 bg-danger/10 p-3.5 text-xs text-danger space-y-1.5 leading-relaxed">
            <div className="flex items-center gap-2 font-bold text-sm">
              <AlertTriangle className="h-4 w-4 shrink-0" />
              <span>Warning: Permanent Deletion</span>
            </div>
            <p>
              Deleting <strong>{workspace.name}</strong> will soft-delete the workspace and revoke access for all members.
            </p>
          </div>

          {/* Typing confirmation */}
          <div className="space-y-2">
            <Label htmlFor="confirm-workspace-name" className="text-xs">
              Type <strong className="text-foreground">{workspace.name}</strong> to confirm:
            </Label>
            <Input
              id="confirm-workspace-name"
              value={confirmationInput}
              onChange={(e) => setConfirmationInput(e.target.value)}
              placeholder={workspace.name}
              className="h-11 rounded-lg"
              autoComplete="off"
            />
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0 pt-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => handleOpenChange(false)}
            className="h-11 rounded-lg"
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            disabled={!isConfirmed}
            isLoading={deleteMutation.isPending}
            onClick={handleDelete}
            className="h-11 font-semibold rounded-lg gap-2"
          >
            <Trash2 className="h-4 w-4" /> Delete Workspace
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
