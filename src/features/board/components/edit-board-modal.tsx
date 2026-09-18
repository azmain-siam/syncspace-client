'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Edit3 } from 'lucide-react';
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
import {
  updateBoardSchema,
  type UpdateBoardInput,
} from '../schemas/board.schema';
import { useUpdateBoard } from '../hooks/use-update-board';
import type { Board } from '../types/board.types';

interface EditBoardModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  workspaceId: string;
  projectId: string;
  board: Board | null;
}

export function EditBoardModal({
  open,
  onOpenChange,
  workspaceId,
  projectId,
  board,
}: EditBoardModalProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<UpdateBoardInput>({
    resolver: zodResolver(updateBoardSchema),
    defaultValues: {
      title: board?.title || '',
    },
  });

  React.useEffect(() => {
    if (board) {
      reset({
        title: board.title,
      });
    }
  }, [board, reset]);

  const updateBoardMutation = useUpdateBoard(
    workspaceId,
    projectId,
    board?.id || '',
    () => {
      onOpenChange(false);
    },
  );

  if (!board) return null;

  const onSubmit = (data: UpdateBoardInput) => {
    updateBoardMutation.mutate(data);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[440px] rounded-2xl p-6">
        <DialogHeader>
          <div className="flex items-center gap-2.5 text-primary mb-1">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Edit3 className="h-5 w-5" />
            </div>
            <DialogTitle className="text-xl font-bold text-foreground">
              Rename Board
            </DialogTitle>
          </div>
          <DialogDescription className="text-sm text-muted-foreground">
            Update the title of your Kanban board.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 pt-3">
          <div className="space-y-2">
            <Label htmlFor="edit-board-title" className="text-xs font-semibold text-foreground">
              Board Title <span className="text-destructive">*</span>
            </Label>
            <Input
              id="edit-board-title"
              placeholder="e.g. Sprint Backlog"
              className="h-11 rounded-xl"
              {...register('title')}
              autoFocus
            />
            {errors.title && (
              <p className="text-xs font-medium text-destructive">
                {errors.title.message}
              </p>
            )}
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="h-10 rounded-xl px-4"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="h-10 rounded-xl px-5 font-semibold"
              isLoading={updateBoardMutation.isPending}
            >
              Save Changes
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
