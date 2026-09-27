'use client';

import * as React from 'react';
import { CheckCircle2, Clock, Flame, ListTodo } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { SprintMetrics, SprintStatus } from '../types/sprint.types';

interface SprintCapacityBarProps {
  metrics?: SprintMetrics;
  status: SprintStatus;
  className?: string;
  compact?: boolean;
}

export function SprintCapacityBar({
  metrics,
  status,
  className,
  compact = false,
}: SprintCapacityBarProps) {
  if (!metrics) return null;

  const {
    totalTasks = 0,
    completedTasks = 0,
    totalStoryPoints = 0,
    completedStoryPoints = 0,
    totalEstimatedHours = 0,
    completionPercentage = 0,
  } = metrics;

  const pct = Math.min(100, Math.max(0, Math.round(completionPercentage)));

  const barColor =
    status === 'COMPLETED'
      ? 'bg-emerald-500'
      : status === 'ACTIVE'
        ? 'bg-primary'
        : 'bg-amber-500';

  if (compact) {
    return (
      <div className={cn('flex items-center gap-3', className)}>
        {/* Story Points Mini Pill */}
        <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
          <span className="flex items-center gap-1 rounded-md bg-amber-500/10 px-2 py-0.5 text-amber-700 dark:text-amber-400 font-semibold">
            <Flame className="h-3 w-3" />
            {completedStoryPoints}/{totalStoryPoints} SP
          </span>
        </div>

        {/* Mini Progress Bar */}
        <div className="flex items-center gap-2 min-w-[100px] max-w-[140px] flex-1">
          <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
            <div
              className={cn('h-full transition-all duration-300', barColor)}
              style={{ width: `${pct}%` }}
            />
          </div>
          <span className="text-[11px] font-semibold text-muted-foreground">
            {pct}%
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className={cn('space-y-2', className)}>
      {/* Metrics Row */}
      <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
        <div className="flex flex-wrap items-center gap-2">
          {/* Story Points Pill */}
          <div className="inline-flex items-center gap-1.5 rounded-lg border border-amber-500/20 bg-amber-500/10 px-2.5 py-1 text-amber-700 dark:text-amber-300 font-semibold">
            <Flame className="h-3.5 w-3.5" />
            <span>
              {completedStoryPoints} / {totalStoryPoints} Story Points
            </span>
          </div>

          {/* Tasks Count */}
          <div className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-background px-2.5 py-1 text-muted-foreground font-medium">
            <ListTodo className="h-3.5 w-3.5 text-foreground/70" />
            <span>
              {completedTasks} / {totalTasks} Tasks
            </span>
          </div>

          {/* Estimated Hours (if available) */}
          {totalEstimatedHours > 0 && (
            <div className="hidden sm:inline-flex items-center gap-1.5 rounded-lg border border-border bg-background px-2.5 py-1 text-muted-foreground font-medium">
              <Clock className="h-3.5 w-3.5 text-muted-foreground" />
              <span>{totalEstimatedHours}h estimated</span>
            </div>
          )}
        </div>

        {/* Completion Percentage Label */}
        <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
          <span>{pct}% Completed</span>
        </div>
      </div>

      {/* Progress Bar Container */}
      <div className="h-2 w-full overflow-hidden rounded-full bg-muted/80">
        <div
          className={cn(
            'h-full rounded-full transition-all duration-500 ease-out',
            barColor,
          )}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
