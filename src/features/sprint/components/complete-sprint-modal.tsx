'use client';

import * as React from 'react';
import {
  ArrowRight,
  CheckCircle2,
  Clock,
  HelpCircle,
  Loader2,
  PartyPopper,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { useCompleteSprint } from '../hooks/use-sprint-mutations';
import type { Sprint } from '../types/sprint.types';

interface CompleteSprintModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId: string;
  sprint: Sprint | null;
  futureSprints?: Sprint[];
}

export function CompleteSprintModal({
  open,
  onOpenChange,
  projectId,
  sprint,
  futureSprints = [],
}: CompleteSprintModalProps) {
  const completeSprintMutation = useCompleteSprint(projectId);

  // Rollover destination selection: 'BACKLOG' or specific sprint ID
  const [rolloverTarget, setRolloverTarget] = React.useState<string>('BACKLOG');

  // Filter planned future sprints
  const plannedSprints = React.useMemo(() => {
    return futureSprints.filter(
      (s) => s.id !== sprint?.id && s.status === 'PLANNING',
    );
  }, [futureSprints, sprint]);

  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      setRolloverTarget('BACKLOG');
    }
    onOpenChange(isOpen);
  };

  if (!sprint) return null;

  // Calculate completed vs remaining from tasks or metrics
  const totalTasks = sprint.metrics?.totalTasks ?? sprint.tasks?.length ?? 0;
  const completedTasks =
    sprint.metrics?.completedTasks ??
    sprint.tasks?.filter((t) => t.status === 'DONE').length ??
    0;
  const remainingTasks = Math.max(0, totalTasks - completedTasks);

  const totalStoryPoints = sprint.metrics?.totalStoryPoints ?? 0;
  const completedStoryPoints = sprint.metrics?.completedStoryPoints ?? 0;
  const remainingStoryPoints = Math.max(0, totalStoryPoints - completedStoryPoints);

  const handleComplete = () => {
    const moveToSprintId =
      rolloverTarget === 'BACKLOG' ? null : rolloverTarget;

    completeSprintMutation.mutate(
      {
        sprintId: sprint.id,
        data: {
          moveToSprintId,
        },
      },
      {
        onSuccess: () => {
          onOpenChange(false);
        },
      },
    );
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[85dvh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <PartyPopper className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle>Complete {sprint.name}</DialogTitle>
              <DialogDescription>
                Close the current active sprint and rollover any uncompleted work.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4 py-2 text-sm">
          {/* Completion Statistics Grid */}
          <div className="grid grid-cols-2 gap-3 rounded-xl border border-border bg-muted/20 p-4">
            <div className="space-y-1">
              <div className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-semibold">
                <CheckCircle2 className="h-4 w-4" />
                Completed
              </div>
              <p className="text-xl font-bold text-foreground">
                {completedTasks}{' '}
                <span className="text-xs font-normal text-muted-foreground">tasks</span>
              </p>
              <p className="text-xs text-muted-foreground">
                {completedStoryPoints} Story Points delivered
              </p>
            </div>

            <div className="space-y-1 border-l border-border pl-4">
              <div className="flex items-center gap-1.5 text-xs text-amber-600 dark:text-amber-400 font-semibold">
                <Clock className="h-4 w-4" />
                Unfinished
              </div>
              <p className="text-xl font-bold text-foreground">
                {remainingTasks}{' '}
                <span className="text-xs font-normal text-muted-foreground">tasks</span>
              </p>
              <p className="text-xs text-muted-foreground">
                {remainingStoryPoints} Story Points remaining
              </p>
            </div>
          </div>

          {/* Rollover Target Selection */}
          {remainingTasks > 0 ? (
            <div className="space-y-2 pt-1">
              <Label htmlFor="rollover-target" className="text-xs font-semibold flex items-center gap-1.5">
                <ArrowRight className="h-3.5 w-3.5 text-primary" />
                Move {remainingTasks} uncompleted {remainingTasks === 1 ? 'task' : 'tasks'} to:
              </Label>
              <select
                id="rollover-target"
                value={rolloverTarget}
                onChange={(e) => setRolloverTarget(e.target.value)}
                className="flex h-11 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground transition-all duration-150 focus:border-primary focus:shadow-[0_0_0_3px_rgba(70,72,212,0.12)] focus:outline-none cursor-pointer"
              >
                <option value="BACKLOG">
                  📦 Product Backlog (Unplanned pool)
                </option>
                {plannedSprints.map((planned) => (
                  <option key={planned.id} value={planned.id}>
                    🏃 {planned.name} (Next planned sprint)
                  </option>
                ))}
              </select>
              <p className="text-[11px] text-muted-foreground flex items-center gap-1">
                <HelpCircle className="h-3 w-3" />
                Unfinished tasks retain their assigned members, labels, and estimated story points.
              </p>
            </div>
          ) : (
            <div className="rounded-lg bg-emerald-500/10 border border-emerald-500/20 p-3 text-xs text-emerald-800 dark:text-emerald-200 flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
              <span>
                Outstanding work! All planned tasks were completed in this sprint.
              </span>
            </div>
          )}
        </div>

        <DialogFooter className="gap-2 pt-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={completeSprintMutation.isPending}
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleComplete}
            disabled={completeSprintMutation.isPending}
            className="gap-2"
          >
            {completeSprintMutation.isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Completing Sprint...
              </>
            ) : (
              <>
                <CheckCircle2 className="h-4 w-4" />
                Complete Sprint
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
