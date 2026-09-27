'use client';

import * as React from 'react';
import { AlertTriangle, Loader2, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useDeleteSprint } from '../hooks/use-sprint-mutations';
import type { Sprint } from '../types/sprint.types';

interface DeleteSprintDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId: string;
  sprint: Sprint | null;
}

export function DeleteSprintDialog({
  open,
  onOpenChange,
  projectId,
  sprint,
}: DeleteSprintDialogProps) {
  const deleteSprintMutation = useDeleteSprint(projectId);

  if (!sprint) return null;

  const handleDelete = () => {
    deleteSprintMutation.mutate(sprint.id, {
      onSuccess: () => {
        onOpenChange(false);
      },
    });
  };

  const taskCount = sprint.tasks?.length ?? sprint.metrics?.totalTasks ?? 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-danger/10 text-danger">
              <Trash2 className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle className="text-danger">Delete Sprint</DialogTitle>
              <DialogDescription>
                This action will delete the sprint container.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-3 py-2 text-sm">
          <p className="text-foreground">
            Are you sure you want to delete{' '}
            <span className="font-semibold text-foreground">&quot;{sprint.name}&quot;</span>?
          </p>

          <div className="flex items-start gap-2.5 rounded-lg border border-amber-500/20 bg-amber-500/5 p-3 text-xs text-muted-foreground">
            <AlertTriangle className="h-4 w-4 shrink-0 text-amber-500 mt-0.5" />
            <p>
              Don&apos;t worry: <span className="font-semibold text-foreground">{taskCount} tasks</span> assigned to this sprint will not be deleted. They will automatically be moved to your project&apos;s product backlog.
            </p>
          </div>
        </div>

        <DialogFooter className="gap-2 pt-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={deleteSprintMutation.isPending}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={handleDelete}
            disabled={deleteSprintMutation.isPending}
            className="gap-2"
          >
            {deleteSprintMutation.isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Deleting...
              </>
            ) : (
              <>
                <Trash2 className="h-4 w-4" />
                Delete Sprint
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
