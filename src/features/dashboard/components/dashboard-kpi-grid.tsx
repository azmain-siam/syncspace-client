'use client';

import * as React from 'react';
import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  Clock,
  FolderKanban,
  Layers,
  Sparkles,
  Timer,
  Users,
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
    projectsCount = 0,
    totalTasks = 0,
    completedTasks = 0,
    inProgressTasks = 0,
    overdueTasks = 0,
    membersCount = 0,
    activitiesCount = 0,
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
      {/* 1. Total Tasks & Completion Rate */}
      <Card className="rounded-2xl border-border bg-card hover:border-primary/40 transition-all duration-200">
        <CardContent className="p-5 sm:p-6 flex flex-col justify-between h-full space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Total Tasks
            </span>
            <div className="p-2 rounded-xl bg-primary/10 text-primary border border-primary/20">
              <CheckCircle2 className="h-4 w-4" />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-baseline justify-between gap-2">
              <span className="text-3xl font-extrabold tracking-tight text-foreground font-mono">
                {totalTasks.toLocaleString()}
              </span>
              <Badge
                variant="default"
                className={cn(
                  'text-[11px] font-semibold px-2 py-0.5 rounded-full border',
                  safeCompletionRate >= 70
                    ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
                    : 'bg-primary/10 text-primary border-primary/20',
                )}
              >
                {safeCompletionRate}% done
              </Badge>
            </div>

            {/* Custom high-performance progress bar */}
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
                  safeCompletionRate >= 70
                    ? 'bg-emerald-500'
                    : 'bg-primary',
                )}
                style={{ width: `${safeCompletionRate}%` }}
              />
            </div>
          </div>

          <div className="flex items-center justify-between text-xs text-muted-foreground pt-1 border-t border-border/40">
            <span>Completed</span>
            <span className="font-semibold text-foreground">
              {completedTasks.toLocaleString()} of {totalTasks.toLocaleString()}
            </span>
          </div>
        </CardContent>
      </Card>

      {/* 2. Active Execution & Overdue Tasks */}
      <Card className="rounded-2xl border-border bg-card hover:border-primary/40 transition-all duration-200">
        <CardContent className="p-5 sm:p-6 flex flex-col justify-between h-full space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Active Execution
            </span>
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
              <Clock className="h-4 w-4" />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-baseline justify-between gap-2">
              <div className="flex items-baseline gap-1.5">
                <span className="text-3xl font-extrabold tracking-tight text-foreground font-mono">
                  {inProgressTasks.toLocaleString()}
                </span>
                <span className="text-xs text-muted-foreground font-medium">in progress</span>
              </div>
              {overdueTasks > 0 ? (
                <Badge
                  variant="danger"
                  className="gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full"
                >
                  <AlertTriangle className="h-3 w-3" />
                  {overdueTasks} overdue
                </Badge>
              ) : (
                <Badge
                  variant="success"
                  className="text-[11px] font-semibold px-2 py-0.5 rounded-full"
                >
                  On Track
                </Badge>
              )}
            </div>

            {/* In Progress vs Backlog distribution */}
            <div className="h-2 w-full rounded-full bg-muted/60 overflow-hidden">
              <div
                className="h-full rounded-full bg-amber-500 transition-all duration-700 ease-out"
                style={{
                  width: `${
                    totalTasks > 0
                      ? Math.min(100, Math.round((inProgressTasks / totalTasks) * 100))
                      : 0
                  }%`,
                }}
              />
            </div>
          </div>

          <div className="flex items-center justify-between text-xs text-muted-foreground pt-1 border-t border-border/40">
            <span>Overdue Alert</span>
            <span
              className={cn(
                'font-semibold',
                overdueTasks > 0 ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400',
              )}
            >
              {overdueTasks > 0 ? `${overdueTasks} urgent attention` : '0 overdue tasks'}
            </span>
          </div>
        </CardContent>
      </Card>

      {/* 3. Story Points & Velocity */}
      <Card className="rounded-2xl border-border bg-card hover:border-primary/40 transition-all duration-200">
        <CardContent className="p-5 sm:p-6 flex flex-col justify-between h-full space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Story Points
            </span>
            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
              <Layers className="h-4 w-4" />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-baseline justify-between gap-2">
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-extrabold tracking-tight text-foreground font-mono">
                  {completedStoryPoints.toLocaleString()}
                </span>
                <span className="text-sm font-semibold text-muted-foreground">
                  / {totalStoryPoints.toLocaleString()} SP
                </span>
              </div>
              <Badge
                variant="default"
                className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20"
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
                className="h-full rounded-full bg-indigo-500 dark:bg-indigo-400 transition-all duration-700 ease-out"
                style={{ width: `${Math.min(100, Math.max(0, spCompletionRate))}%` }}
              />
            </div>
          </div>

          <div className="flex items-center justify-between text-xs text-muted-foreground pt-1 border-t border-border/40">
            <span className="flex items-center gap-1">
              <Timer className="h-3 w-3" /> Effort
            </span>
            <span className="font-semibold text-foreground font-mono">
              {totalEstimatedHours > 0
                ? `${totalEstimatedHours.toLocaleString(undefined, { maximumFractionDigits: 1 })}h estimated`
                : '0h logged'}
            </span>
          </div>
        </CardContent>
      </Card>

      {/* 4. Workspace Scale */}
      <Card className="rounded-2xl border-border bg-card hover:border-primary/40 transition-all duration-200">
        <CardContent className="p-5 sm:p-6 flex flex-col justify-between h-full space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Workspace Scale
            </span>
            <div className="p-2 rounded-xl bg-violet-500/10 text-violet-600 dark:text-violet-400 border border-violet-500/20">
              <FolderKanban className="h-4 w-4" />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-baseline justify-between gap-2">
              <div className="flex items-baseline gap-1.5">
                <span className="text-3xl font-extrabold tracking-tight text-foreground font-mono">
                  {projectsCount.toLocaleString()}
                </span>
                <span className="text-xs text-muted-foreground font-medium">projects</span>
              </div>
              <Badge
                variant="default"
                className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-violet-500/10 text-violet-600 dark:text-violet-400 border border-violet-500/20 flex items-center gap-1"
              >
                <Sparkles className="h-2.5 w-2.5" /> Active
              </Badge>
            </div>

            {/* Dual sub-metric chips */}
            <div className="grid grid-cols-2 gap-2 pt-0.5">
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-muted/40 border border-border/60 text-xs">
                <Users className="h-3 w-3 text-muted-foreground shrink-0" />
                <span className="font-semibold text-foreground font-mono">
                  {membersCount}
                </span>
                <span className="text-muted-foreground text-[10px]">members</span>
              </div>
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-muted/40 border border-border/60 text-xs">
                <Activity className="h-3 w-3 text-muted-foreground shrink-0" />
                <span className="font-semibold text-foreground font-mono">
                  {activitiesCount.toLocaleString()}
                </span>
                <span className="text-muted-foreground text-[10px]">events</span>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs text-muted-foreground pt-1 border-t border-border/40">
            <span>Collaborative Scope</span>
            <span className="font-semibold text-foreground">
              {membersCount > 0 ? `${membersCount} active peers` : 'Solo workspace'}
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
