'use client';

import * as React from 'react';
import { CheckCircle2, Circle, Clock, Eye, Layers } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { TaskDistributionResponse } from '../types/dashboard.types';
import type { TaskStatus } from '@/types/domain';
import { DashboardQueryError } from './dashboard-query-state';

interface TaskStatusChartProps {
  distribution?: TaskDistributionResponse;
  isLoading?: boolean;
  isError?: boolean;
  onRetry?: () => void;
  onSelectStatus?: (status: TaskStatus) => void;
}

interface StatusConfig {
  label: string;
  colorClass: string;
  bgTintClass: string;
  borderClass: string;
  icon: React.ComponentType<{ className?: string }>;
}

const STATUS_CONFIGS: Record<TaskStatus, StatusConfig> = {
  DONE: {
    label: 'Done',
    colorClass: 'bg-emerald-500 text-emerald-500',
    bgTintClass: 'bg-emerald-500/10 text-emerald-800 dark:text-emerald-400',
    borderClass: 'border-emerald-500/25',
    icon: CheckCircle2,
  },
  IN_PROGRESS: {
    label: 'In Progress',
    colorClass: 'bg-blue-500 text-blue-500',
    bgTintClass: 'bg-blue-500/10 text-blue-700 dark:text-blue-400',
    borderClass: 'border-blue-500/20',
    icon: Clock,
  },
  REVIEW: {
    label: 'In Review',
    colorClass: 'bg-amber-500 text-amber-500',
    bgTintClass: 'bg-amber-500/10 text-amber-800 dark:text-amber-400',
    borderClass: 'border-amber-500/25',
    icon: Eye,
  },
  TODO: {
    label: 'To Do',
    colorClass: 'bg-slate-400 dark:bg-slate-500 text-slate-500',
    bgTintClass: 'bg-slate-500/10 text-slate-700 dark:text-slate-300',
    borderClass: 'border-slate-500/20',
    icon: Circle,
  },
};

const ORDERED_STATUSES: TaskStatus[] = ['DONE', 'IN_PROGRESS', 'REVIEW', 'TODO'];

export function TaskStatusChart({
  distribution,
  isLoading,
  isError,
  onRetry,
  onSelectStatus,
}: TaskStatusChartProps) {
  if (isLoading) {
    return (
      <Card className="rounded-2xl border-border bg-card p-6 space-y-4 animate-pulse">
        <div className="h-5 w-44 rounded bg-muted/70" />
        <div className="h-3 w-56 rounded bg-muted/50" />
        <div className="h-3 w-full rounded-full bg-muted/60 my-4" />
        <div className="space-y-3 pt-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-9 w-full rounded-xl bg-muted/40" />
          ))}
        </div>
      </Card>
    );
  }

  if (isError || !distribution) {
    return <DashboardQueryError title="status distribution" onRetry={onRetry} />;
  }

  const rawByStatus = distribution.byStatus || [];
  const statusMap = new Map<TaskStatus, number>();
  let totalTasks = 0;

  rawByStatus.forEach((item) => {
    statusMap.set(item.status, item.count);
    totalTasks += item.count;
  });

  return (
    <Card className="rounded-2xl border-border bg-card">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <CardTitle className="text-base font-bold tracking-tight">
              Status Distribution
            </CardTitle>
            <CardDescription className="text-xs">
              Categorical breakdown of task execution across workspace projects
            </CardDescription>
          </div>
          <Badge variant="outline" className="font-mono text-xs font-semibold gap-1">
            <Layers className="h-3 w-3 text-muted-foreground" />
            {totalTasks.toLocaleString()} tasks
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-5 pt-1">
        {/* Multi-segment continuous horizontal distribution bar */}
        <div className="space-y-1.5">
          <div className="h-3 w-full rounded-full bg-muted/50 overflow-hidden flex gap-0.5">
            {totalTasks > 0 ? (
              ORDERED_STATUSES.map((status) => {
                const count = statusMap.get(status) || 0;
                if (count === 0) return null;
                const percentage = (count / totalTasks) * 100;
                const config = STATUS_CONFIGS[status];
                return (
                  <div
                    key={status}
                    className={cn('h-full transition-all duration-700 ease-out', config.colorClass.split(' ')[0])}
                    style={{ width: `${percentage}%` }}
                    title={`${config.label}: ${count} (${Math.round(percentage)}%)`}
                  />
                );
              })
            ) : (
              <div className="h-full w-full bg-muted/60" />
            )}
          </div>
        </div>

        {/* Detailed status row items */}
        <div className="space-y-2.5">
          {ORDERED_STATUSES.map((status) => {
            const count = statusMap.get(status) || 0;
            const percentage = totalTasks > 0 ? Math.round((count / totalTasks) * 100) : 0;
            const config = STATUS_CONFIGS[status];
            const Icon = config.icon;

            return (
              <button
                type="button"
                key={status}
                onClick={() => onSelectStatus?.(status)}
                disabled={!onSelectStatus || count === 0}
                aria-label={`View ${count} ${config.label} tasks`}
                className="w-full flex items-center justify-between p-2.5 rounded-xl bg-muted/20 border border-border/40 hover:bg-muted/40 transition-colors text-left disabled:opacity-60 disabled:cursor-default focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className={cn('p-1.5 rounded-lg border', config.bgTintClass, config.borderClass)}>
                    <Icon className="h-3.5 w-3.5" />
                  </div>
                  <span className="text-xs font-semibold text-foreground">
                    {config.label}
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-20 hidden sm:block">
                    <div className="h-1.5 w-full rounded-full bg-muted/60 overflow-hidden">
                      <div
                        className={cn('h-full rounded-full transition-all duration-500', config.colorClass.split(' ')[0])}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs font-mono">
                    <span className="font-bold text-foreground">{count}</span>
                    <span className="text-muted-foreground text-[11px]">({percentage}%)</span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
