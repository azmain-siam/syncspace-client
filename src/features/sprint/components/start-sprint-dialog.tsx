'use client';

import * as React from 'react';
import { AlertTriangle, Calendar, CheckCircle2, Flame, Loader2, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useStartSprint } from '../hooks/use-sprint-mutations';
import type { Sprint } from '../types/sprint.types';

interface StartSprintDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId: string;
  sprint: Sprint | null;
  activeSprint?: Sprint | null;
}

function formatDateDisplay(isoString?: string | null): string {
  if (!isoString) return 'Not scheduled';
  try {
    const d = new Date(isoString);
    return d.toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  } catch {
    return 'Not scheduled';
  }
}

export function StartSprintDialog({
  open,
  onOpenChange,
  projectId,
  sprint,
  activeSprint,
}: StartSprintDialogProps) {
  const startSprintMutation = useStartSprint(projectId);

  if (!sprint) return null;

  const hasConflictingActiveSprint =
    Boolean(activeSprint) && activeSprint?.id !== sprint.id;

  const handleStart = () => {
    startSprintMutation.mutate(sprint.id, {
      onSuccess: () => {
        onOpenChange(false);
      },
    });
  };

  const totalTasks = sprint.tasks?.length ?? sprint.metrics?.totalTasks ?? 0;
  const totalStoryPoints = sprint.metrics?.totalStoryPoints ?? 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <Play className="h-5 w-5 fill-current" />
            </div>
            <div>
              <DialogTitle>Start {sprint.name}</DialogTitle>
              <DialogDescription>
                Begin sprint execution and activate team capacity tracking.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4 py-2 text-sm">
          {/* Conflicting active sprint alert */}
          {hasConflictingActiveSprint && (
            <div className="flex items-start gap-2.5 rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 text-amber-900 dark:text-amber-200">
              <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5 text-amber-600 dark:text-amber-400" />
              <div className="text-xs leading-relaxed space-y-1">
                <p className="font-semibold">Active Sprint In Progress</p>
                <p>
                  <span className="font-semibold">{activeSprint?.name}</span> is
                  currently active. According to Scrum best practices, SyncSpace allows
                  only one active sprint per project. You must complete or close the
                  active sprint before starting this one.
                </p>
              </div>
            </div>
          )}

          {/* Sprint Scope Summary Card */}
          <div className="rounded-xl border border-border bg-muted/30 p-3.5 space-y-3">
            <div className="flex items-center justify-between text-xs text-muted-foreground pb-2 border-b border-border/50">
              <span className="flex items-center gap-1.5 font-medium text-foreground">
                <Calendar className="h-3.5 w-3.5 text-primary" />
                Duration
              </span>
              <span>
                {formatDateDisplay(sprint.startDate)} – {formatDateDisplay(sprint.endDate)}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-1">
              <div className="flex flex-col gap-0.5">
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                  Planned Tasks
                </span>
                <span className="text-lg font-bold text-foreground">
                  {totalTasks} <span className="text-xs font-normal text-muted-foreground">issues</span>
                </span>
              </div>

              <div className="flex flex-col gap-0.5">
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <Flame className="h-3.5 w-3.5 text-amber-500" />
                  Total Commitment
                </span>
                <span className="text-lg font-bold text-foreground">
                  {totalStoryPoints} <span className="text-xs font-normal text-muted-foreground">Story Points</span>
                </span>
              </div>
            </div>

            {sprint.goal && (
              <div className="text-xs pt-1 border-t border-border/50 text-muted-foreground">
                <span className="font-semibold text-foreground">Goal: </span>
                {sprint.goal}
              </div>
            )}
          </div>
        </div>

        <DialogFooter className="gap-2 pt-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={startSprintMutation.isPending}
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleStart}
            disabled={startSprintMutation.isPending || hasConflictingActiveSprint}
            className="bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5"
          >
            {startSprintMutation.isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Starting Sprint...
              </>
            ) : (
              <>
                <Play className="h-4 w-4 fill-current" />
                Start Sprint
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
