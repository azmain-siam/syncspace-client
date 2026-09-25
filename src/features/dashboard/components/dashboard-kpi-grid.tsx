'use client';

import * as React from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  Layers,
  Timer,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import type { DashboardSummaryResponse } from '../types/dashboard.types';

interface DashboardKpiGridProps {
  summary?: DashboardSummaryResponse;
  isLoading?: boolean;
}

export function DashboardKpiGrid({ summary, isLoading }: DashboardKpiGridProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="p-5 sm:p-6 animate-pulse">
            <div className="h-4 w-24 rounded bg-muted/60 mb-3" />
            <div className="h-8 w-20 rounded bg-muted/80 mb-4" />
            <div className="h-2 w-full rounded bg-muted/50" />
          </Card>
        ))}
      </div>
    );
  }

  const {
    totalTasks = 0,
    completedTasks = 0,
    inProgressTasks = 0,
    overdueTasks = 0,
    completionPercentage = 0,
    totalStoryPoints = 0,
    completedStoryPoints = 0,
    totalEstimatedHours = 0,
  } = summary || {};

  const spCompletionRate =
    totalStoryPoints > 0
      ? Math.round((completedStoryPoints / totalStoryPoints) * 100)
      : 0;

  const safeCompletionRate = Math.min(100, Math.max(0, completionPercentage));

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* 1. Total Deliverables & Completion Rate */}
      <Card className="rounded-2xl border-border bg-card shadow-xs">
        <CardContent className="p-5 flex flex-col justify-between h-full space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Total Deliverables
            </span>
            <div className="p-2 rounded-xl bg-primary/10 text-primary">
              <CheckCircle2 className="h-4 w-4" />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-baseline justify-between gap-2">
              <span className="text-3xl font-extrabold tracking-tight text-foreground tabular-nums">
                {totalTasks.toLocaleString()}
              </span>
              <Badge
                variant="default"
                className={cn(
                  'text-[11px] font-semibold px-2 py-0.5 rounded-full border',
                  safeCompletionRate >= 70
                    ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/20'
                    : 'bg-primary/10 text-primary border-primary/20',
                )}
              >
                {safeCompletionRate}% done
              </Badge>
            </div>

            <div
              className="h-2 w-full rounded-full bg-muted/60 overflow-hidden"
              role="progressbar"
              aria-valuenow={safeCompletionRate}
              aria-valuemin={0}
              aria-valuemax={100}
            >
              <div
                className={cn(
                  'h-full rounded-full transition-all duration-700 ease-out',
                  safeCompletionRate >= 70 ? 'bg-emerald-500' : 'bg-primary',
                )}
                style={{ width: `${safeCompletionRate}%` }}
              />
            </div>
          </div>

          <div className="flex items-center justify-between text-xs text-muted-foreground pt-1 border-t border-border/40">
            <span>Progress</span>
            <span className="font-semibold text-foreground tabular-nums">
              {completedTasks.toLocaleString()} / {totalTasks.toLocaleString()} completed
            </span>
          </div>
        </CardContent>
      </Card>

      {/* 2. Active Execution (In Progress) */}
      <Card className="rounded-2xl border-border bg-card shadow-xs">
        <CardContent className="p-5 flex flex-col justify-between h-full space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              In Progress
            </span>
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-700 dark:text-amber-300">
              <Clock className="h-4 w-4" />
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex items-baseline justify-between gap-2">
              <span className="text-3xl font-extrabold tracking-tight text-foreground tabular-nums">
                {inProgressTasks.toLocaleString()}
              </span>
              <span className="text-xs text-muted-foreground font-medium">active tasks</span>
            </div>
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              Items actively in flight on team Kanban boards
            </p>
          </div>

          <div className="flex items-center justify-between text-xs text-muted-foreground pt-1 border-t border-border/40">
            <span>Workload ratio</span>
            <span className="font-semibold text-foreground tabular-nums">
              {totalTasks > 0 ? Math.round((inProgressTasks / totalTasks) * 100) : 0}% of all tasks
            </span>
          </div>
        </CardContent>
      </Card>

      {/* 3. Actionable Overdue Tasks Alert */}
      <Card
        className={cn(
          'rounded-2xl border bg-card shadow-xs transition-colors',
          overdueTasks > 0 ? 'border-destructive/40 bg-destructive/5' : 'border-border',
        )}
      >
        <CardContent className="p-5 flex flex-col justify-between h-full space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Overdue Alert
            </span>
            <div
              className={cn(
                'p-2 rounded-xl',
                overdueTasks > 0
                  ? 'bg-destructive/15 text-destructive'
                  : 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300',
              )}
            >
              {overdueTasks > 0 ? (
                <AlertTriangle className="h-4 w-4" />
              ) : (
                <CheckCircle2 className="h-4 w-4" />
              )}
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex items-baseline justify-between gap-2">
              <span
                className={cn(
                  'text-3xl font-extrabold tracking-tight tabular-nums',
                  overdueTasks > 0 ? 'text-destructive' : 'text-foreground',
                )}
              >
                {overdueTasks.toLocaleString()}
              </span>
              <Badge
                variant={overdueTasks > 0 ? 'danger' : 'default'}
                className={cn(
                  'text-[11px] font-semibold px-2 py-0.5 rounded-full',
                  overdueTasks === 0 && 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20',
                )}
              >
                {overdueTasks > 0 ? 'Action Required' : 'On Track'}
              </Badge>
            </div>
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              {overdueTasks > 0
                ? 'Tasks past their due date requiring attention'
                : 'Zero overdue tasks across the workspace'}
            </p>
          </div>

          <div className="flex items-center justify-between text-xs text-muted-foreground pt-1 border-t border-border/40">
            <span>Status</span>
            <span
              className={cn(
                'font-semibold',
                overdueTasks > 0 ? 'text-destructive' : 'text-emerald-700 dark:text-emerald-300',
              )}
            >
              {overdueTasks > 0 ? 'Attention Needed' : 'All Clear'}
            </span>
          </div>
        </CardContent>
      </Card>

      {/* 4. Velocity & Estimation Effort */}
      <Card className="rounded-2xl border-border bg-card shadow-xs">
        <CardContent className="p-5 flex flex-col justify-between h-full space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Effort &amp; Velocity
            </span>
            <div className="p-2 rounded-xl bg-primary/10 text-primary">
              <Layers className="h-4 w-4" />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-baseline justify-between gap-2">
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-extrabold tracking-tight text-foreground tabular-nums">
                  {completedStoryPoints.toLocaleString()}
                </span>
                <span className="text-xs font-medium text-muted-foreground">
                  / {totalStoryPoints.toLocaleString()} SP
                </span>
              </div>
              <Badge
                variant="default"
                className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20"
              >
                {spCompletionRate}% SP
              </Badge>
            </div>

            <div
              className="h-2 w-full rounded-full bg-muted/60 overflow-hidden"
              role="progressbar"
              aria-valuenow={spCompletionRate}
              aria-valuemin={0}
              aria-valuemax={100}
            >
              <div
                className="h-full rounded-full bg-primary transition-all duration-700 ease-out"
                style={{ width: `${Math.min(100, Math.max(0, spCompletionRate))}%` }}
              />
            </div>
          </div>

          <div className="flex items-center justify-between text-xs text-muted-foreground pt-1 border-t border-border/40">
            <span className="flex items-center gap-1">
              <Timer className="h-3 w-3" /> Hours
            </span>
            <span className="font-semibold text-foreground tabular-nums">
              {totalEstimatedHours > 0
                ? `${totalEstimatedHours.toLocaleString(undefined, { maximumFractionDigits: 1 })}h estimated`
                : '0h estimated'}
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
