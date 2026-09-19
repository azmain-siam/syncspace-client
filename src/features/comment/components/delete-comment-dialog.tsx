'use client';

import * as React from 'react';
import { Loader2, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface DeleteCommentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirmDelete: () => Promise<unknown> | void;
  isDeleting?: boolean;
}

export function DeleteCommentDialog({
  open,
  onOpenChange,
  onConfirmDelete,
  isDeleting = false,
}: DeleteCommentDialogProps) {
  const handleConfirm = async () => {
    try {
      await onConfirmDelete();
      onOpenChange(false);
    } catch {
      // Handled by caller
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm rounded-2xl p-5 sm:p-6 border border-border bg-card">
        <DialogHeader className="gap-2">
          <div className="flex items-center gap-2.5 text-destructive">
            <div className="flex size-8 items-center justify-center rounded-full bg-destructive/10">
              <Trash2 className="size-4 text-destructive" />
            </div>
            <DialogTitle className="text-base font-semibold">
              Delete Comment
            </DialogTitle>
          </div>
          <DialogDescription className="text-xs text-muted-foreground leading-relaxed">
            Are you sure you want to delete this comment? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="flex flex-row justify-end gap-2 pt-3">
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={isDeleting}
            onClick={() => onOpenChange(false)}
            className="text-xs h-8 rounded-lg cursor-pointer"
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            size="sm"
            disabled={isDeleting}
            onClick={handleConfirm}
            className="text-xs h-8 rounded-lg gap-1.5 cursor-pointer shadow-xs active:scale-98"
          >
            {isDeleting ? (
              <Loader2 className="size-3.5 animate-spin" />
            ) : (
              <Trash2 className="size-3.5" />
            )}
            Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
