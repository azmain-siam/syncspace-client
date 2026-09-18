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
import { useDeleteColumn } from '../hooks/use-delete-column';
import type { BoardColumn } from '../types/board.types';

interface DeleteColumnDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  workspaceId: string;
  projectId: string;
  boardId: string;
  column: BoardColumn | null;
}

export function DeleteColumnDialog({
  open,
  onOpenChange,
  workspaceId,
  projectId,
  boardId,
  column,
}: DeleteColumnDialogProps) {
  const deleteMutation = useDeleteColumn(
    workspaceId,
    projectId,
    boardId,
    () => {
      onOpenChange(false);
    },
  );

  if (!column) return null;

  const handleDelete = () => {
    deleteMutation.mutate(column.id);
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
              Delete Column
            </DialogTitle>
          </div>
          <DialogDescription className="text-sm text-muted-foreground leading-relaxed pt-1">
            Are you sure you want to delete column{' '}
            <strong className="text-foreground font-semibold">
              &quot;{column.title}&quot;
            </strong>
            ? Tasks inside this column will also be removed. This action cannot be undone.
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
            Delete Column
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
