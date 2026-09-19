'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Columns3, LayoutList, Sparkles } from 'lucide-react';
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
import { createBoardSchema } from '../schemas/board.schema';
import { useCreateBoard } from '../hooks/use-create-board';
import type { Board } from '../types/board.types';

interface CreateBoardModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  workspaceId: string;
  projectId: string;
  onBoardCreated?: (board: Board) => void;
}

export function CreateBoardModal({
  open,
  onOpenChange,
  workspaceId,
  projectId,
  onBoardCreated,
}: CreateBoardModalProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<{ title: string }>({
    resolver: zodResolver(createBoardSchema.pick({ title: true })),
    defaultValues: {
      title: '',
    },
  });

  const [includeDefaultColumns, setIncludeDefaultColumns] = React.useState(true);

  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      reset({ title: '' });
      setIncludeDefaultColumns(true);
    }
    onOpenChange(isOpen);
  };

  const createBoardMutation = useCreateBoard(workspaceId, projectId, (board) => {
    reset();
    setIncludeDefaultColumns(true);
    onOpenChange(false);
    if (onBoardCreated) {
      onBoardCreated(board);
    }
  });

  const onSubmit = (data: { title: string }) => {
    createBoardMutation.mutate({
      title: data.title,
      includeDefaultColumns,
    });
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="w-[92vw] max-w-[480px] rounded-2xl p-5 sm:p-6 max-h-[90dvh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-2.5 text-primary mb-1">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <LayoutList className="h-5 w-5" />
            </div>
            <DialogTitle className="text-xl font-bold text-foreground">
              Create New Board
            </DialogTitle>
          </div>
          <DialogDescription className="text-sm text-muted-foreground">
            Add a Kanban board to organize and track workflow stages for this project.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 pt-3">
          {/* Title Input */}
          <div className="space-y-2">
            <Label htmlFor="title" className="text-xs font-semibold text-foreground">
              Board Title <span className="text-destructive">*</span>
            </Label>
            <Input
              id="title"
              placeholder="e.g. Sprint Backlog, Engineering Kanban"
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

          {/* Seed Default Columns Option */}
          <div className="rounded-xl border border-border bg-muted/30 p-4 transition-colors">
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-1">
                <div className="flex items-center gap-1.5">
                  <Sparkles className="h-4 w-4 text-primary" />
                  <span className="text-xs font-semibold text-foreground">
                    Provision Standard Workflow
                  </span>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Automatically set up standard Kanban columns:
                </p>
                <div className="flex flex-wrap items-center gap-1.5 pt-1.5">
                  {['Todo', 'In Progress', 'Review', 'Done'].map((col) => (
                    <span
                      key={col}
                      className="inline-flex items-center gap-1 rounded-md bg-background px-2 py-0.5 text-[11px] font-medium text-foreground border border-border/80 shadow-xs"
                    >
                      <Columns3 className="h-3 w-3 text-muted-foreground" />
                      {col}
                    </span>
                  ))}
                </div>
              </div>

              {/* Custom Toggle Switch */}
              <button
                type="button"
                role="switch"
                aria-checked={includeDefaultColumns}
                onClick={() => setIncludeDefaultColumns(!includeDefaultColumns)}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${
                  includeDefaultColumns ? 'bg-primary' : 'bg-muted'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md transition-transform ${
                    includeDefaultColumns ? 'translate-x-5' : 'translate-x-0.5'
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2.5 sm:gap-3 pt-2">
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
              isLoading={createBoardMutation.isPending}
            >
              Create Board
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
