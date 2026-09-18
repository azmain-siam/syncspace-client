'use client';

import * as React from 'react';
import { AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useDeleteBoard } from '../hooks/use-delete-board';
import type { Board } from '../types/board.types';

interface DeleteBoardDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  workspaceId: string;
  projectId: string;
  board: Board | null;
  onBoardDeleted?: () => void;
}

export function DeleteBoardDialog({
  open,
  onOpenChange,
  workspaceId,
  projectId,
  board,
  onBoardDeleted,
}: DeleteBoardDialogProps) {
  const deleteMutation = useDeleteBoard(workspaceId, projectId, () => {
    onOpenChange(false);
    if (onBoardDeleted) {
      onBoardDeleted();
    }
  });

  if (!board) return null;

  const handleDelete = () => {
    deleteMutation.mutate(board.id);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[440px] rounded-2xl p-6">
        <DialogHeader>
          <div className="flex items-center gap-2.5 text-destructive mb-1">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-destructive/10 text-destructive">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <DialogTitle className="text-xl font-bold text-foreground">
              Delete Board
            </DialogTitle>
          </div>
          <DialogDescription className="text-sm text-muted-foreground leading-relaxed pt-1">
            Are you sure you want to delete{' '}
            <strong className="text-foreground font-semibold">
              &quot;{board.title}&quot;
            </strong>
            ? All columns and tasks inside this board will be permanently removed.
            This action cannot be undone.
          </DialogDescription>
        </DialogHeader>

        <div className="flex items-center justify-end gap-3 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="h-10 rounded-xl px-4"
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={handleDelete}
            className="h-10 rounded-xl px-5 font-semibold"
            isLoading={deleteMutation.isPending}
          >
            Delete Board
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
