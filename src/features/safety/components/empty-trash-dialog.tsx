'use client';

import * as React from 'react';
import { AlertTriangle, Trash2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { TrashItem } from '../types/safety.types';

interface EmptyTrashDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  isPending: boolean;
  itemToPurge?: TrashItem | null;
}

export function EmptyTrashDialog({
  open,
  onOpenChange,
  onConfirm,
  isPending,
  itemToPurge,
}: EmptyTrashDialogProps) {
  const [confirmText, setConfirmText] = React.useState('');
  const isBulkEmpty = !itemToPurge;
  const isDeleteUnlocked = isBulkEmpty ? confirmText.trim().toUpperCase() === 'DELETE' : true;

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      setConfirmText('');
    }
    onOpenChange(newOpen);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isDeleteUnlocked && !isPending) {
      onConfirm();
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <form onSubmit={handleSubmit} className="space-y-4">
          <DialogHeader>
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-destructive/10 text-destructive mb-2">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <DialogTitle className="text-lg font-bold text-foreground">
              {isBulkEmpty
                ? 'Empty Workspace Trash'
                : `Permanently Delete ${itemToPurge?.itemType === 'PROJECT' ? 'Project' : 'Task'}`}
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground leading-relaxed pt-1">
              {isBulkEmpty ? (
                <>
                  This action is <strong className="text-destructive font-bold">irreversible</strong>.
                  All soft-deleted tasks, projects, comments, and attachments in this workspace will be permanently wiped from the database.
                </>
              ) : (
                <>
                  Are you sure you want to permanently delete{' '}
                  <strong className="text-foreground font-semibold">&ldquo;{itemToPurge?.title}&rdquo;</strong>?
                  This action cannot be undone.
                </>
              )}
            </DialogDescription>
          </DialogHeader>

          {isBulkEmpty && (
            <div className="space-y-2 pt-2">
              <Label htmlFor="confirm-delete-text" className="text-xs font-semibold text-foreground">
                Type <span className="font-mono font-bold text-destructive">DELETE</span> to confirm:
              </Label>
              <Input
                id="confirm-delete-text"
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                placeholder="DELETE"
                className="h-10 text-xs font-mono"
                autoComplete="off"
              />
            </div>
          )}

          <DialogFooter className="gap-2 sm:gap-0 pt-3">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onOpenChange(false)}
              disabled={isPending}
              className="h-9 text-xs font-semibold rounded-lg"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="destructive"
              size="sm"
              disabled={!isDeleteUnlocked || isPending}
              isLoading={isPending}
              className="h-9 text-xs font-bold rounded-lg gap-1.5 shadow-xs"
            >
              <Trash2 className="h-3.5 w-3.5" />
              <span>{isBulkEmpty ? 'Empty Trash Permanently' : 'Delete Permanently'}</span>
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
