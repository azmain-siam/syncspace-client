'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Columns } from 'lucide-react';
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
  createColumnSchema,
  type CreateColumnInput,
} from '../schemas/column.schema';
import { useCreateColumn } from '../hooks/use-create-column';

interface CreateColumnModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  workspaceId: string;
  projectId: string;
  boardId: string;
  nextOrderIndex?: number;
}

export function CreateColumnModal({
  open,
  onOpenChange,
  workspaceId,
  projectId,
  boardId,
  nextOrderIndex = 0,
}: CreateColumnModalProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateColumnInput>({
    resolver: zodResolver(createColumnSchema),
    defaultValues: {
      title: '',
      order: nextOrderIndex,
    },
  });

  const createColumnMutation = useCreateColumn(
    workspaceId,
    projectId,
    boardId,
    () => {
      reset();
      onOpenChange(false);
    },
  );

  React.useEffect(() => {
    if (open) {
      reset({
        title: '',
        order: nextOrderIndex,
      });
    }
  }, [open, nextOrderIndex, reset]);

  const onSubmit = (data: CreateColumnInput) => {
    createColumnMutation.mutate({
      title: data.title,
      order: nextOrderIndex,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[440px] rounded-2xl p-6">
        <DialogHeader>
          <div className="flex items-center gap-2.5 text-primary mb-1">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Columns className="h-5 w-5" />
            </div>
            <DialogTitle className="text-xl font-bold text-foreground">
              Add Column
            </DialogTitle>
          </div>
          <DialogDescription className="text-sm text-muted-foreground">
            Create a new column stage for organizing tasks in this board.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 pt-3">
          <div className="space-y-2">
            <Label htmlFor="column-title" className="text-xs font-semibold text-foreground">
              Column Name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="column-title"
              placeholder="e.g. In QA, Blocked, Ready for Release"
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
              isLoading={createColumnMutation.isPending}
            >
              Add Column
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
