'use client';

import * as React from 'react';
import {
  AlertCircle,
  ArrowDown,
  ArrowRight,
  ArrowUp,
  Flame,
  Gauge,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { TaskDistributionResponse } from '../types/dashboard.types';
import type { TaskPriority } from '@/types/domain';
import { DashboardQueryError } from './dashboard-query-state';

interface TaskPriorityChartProps {
  distribution?: TaskDistributionResponse;
  isLoading?: boolean;
  isError?: boolean;
  onRetry?: () => void;
  onSelectPriority?: (priority: TaskPriority) => void;
}

interface PriorityConfig {
  label: string;
  colorClass: string;
  bgTintClass: string;
  borderClass: string;
  icon: React.ComponentType<{ className?: string }>;
}

const PRIORITY_CONFIGS: Record<TaskPriority, PriorityConfig> = {
  URGENT: {
    label: 'Urgent',
    colorClass: 'bg-red-500 text-red-500',
    bgTintClass: 'bg-red-500/10 text-red-700 dark:text-red-400',
    borderClass: 'border-red-500/25',
    icon: Flame,
  },
  HIGH: {
    label: 'High',
    colorClass: 'bg-amber-500 text-amber-500',
    bgTintClass: 'bg-amber-500/10 text-amber-800 dark:text-amber-400',
    borderClass: 'border-amber-500/25',
    icon: ArrowUp,
  },
  MEDIUM: {
    label: 'Medium',
    colorClass: 'bg-blue-500 text-blue-500',
    bgTintClass: 'bg-blue-500/10 text-blue-700 dark:text-blue-400',
    borderClass: 'border-blue-500/20',
    icon: ArrowRight,
  },
  LOW: {
    label: 'Low',
    colorClass: 'bg-slate-400 dark:bg-slate-500 text-slate-500',
    bgTintClass: 'bg-slate-500/10 text-slate-700 dark:text-slate-300',
    borderClass: 'border-slate-500/20',
    icon: ArrowDown,
  },
};

const ORDERED_PRIORITIES: TaskPriority[] = ['URGENT', 'HIGH', 'MEDIUM', 'LOW'];

export function TaskPriorityChart({
  distribution,
  isLoading,
  isError,
  onRetry,
  onSelectPriority,
}: TaskPriorityChartProps) {
  if (isLoading) {
    return (
      <Card className="rounded-2xl border-border bg-card p-6 space-y-4 animate-pulse">
        <div className="h-5 w-44 rounded bg-muted/70" />
        <div className="h-3 w-56 rounded bg-muted/50" />
        <div className="h-3 w-full rounded-full bg-muted/60 my-4" />
        <div className="grid grid-cols-2 gap-3 pt-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-20 rounded-xl bg-muted/40" />
          ))}
        </div>
      </Card>
    );
  }

  if (isError || !distribution) {
    return <DashboardQueryError title="priority distribution" onRetry={onRetry} />;
  }

  const rawByPriority = distribution.byPriority || [];
  const priorityMap = new Map<TaskPriority, number>();
  let totalTasks = 0;

  rawByPriority.forEach((item) => {
    priorityMap.set(item.priority, item.count);
    totalTasks += item.count;
  });

  const urgentCount = priorityMap.get('URGENT') || 0;

  return (
    <Card className="rounded-2xl border-border bg-card">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <CardTitle className="text-base font-bold tracking-tight">
              Priority Segmentation
            </CardTitle>
            <CardDescription className="text-xs">
              Task urgency and impact allocation across workspace backlogs
            </CardDescription>
          </div>
          {urgentCount > 0 ? (
            <Badge variant="danger" className="font-mono text-xs font-semibold gap-1">
              <AlertCircle className="h-3 w-3" />
              {urgentCount} critical
            </Badge>
          ) : (
            <Badge variant="outline" className="font-mono text-xs font-semibold gap-1">
              <Gauge className="h-3 w-3 text-muted-foreground" />
              Balanced
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-5 pt-1">
        {/* Multi-segment continuous horizontal priority bar */}
        <div className="space-y-1.5">
          <div className="h-3 w-full rounded-full bg-muted/50 overflow-hidden flex gap-0.5">
            {totalTasks > 0 ? (
              ORDERED_PRIORITIES.map((priority) => {
                const count = priorityMap.get(priority) || 0;
                if (count === 0) return null;
                const percentage = (count / totalTasks) * 100;
                const config = PRIORITY_CONFIGS[priority];
                return (
                  <div
                    key={priority}
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

        {/* 2x2 Grid of priority tiles */}
        <div className="grid grid-cols-2 gap-3">
          {ORDERED_PRIORITIES.map((priority) => {
            const count = priorityMap.get(priority) || 0;
            const percentage = totalTasks > 0 ? Math.round((count / totalTasks) * 100) : 0;
            const config = PRIORITY_CONFIGS[priority];
            const Icon = config.icon;

            return (
              <button
                type="button"
                key={priority}
                onClick={() => onSelectPriority?.(priority)}
                disabled={!onSelectPriority || count === 0}
                aria-label={`View ${count} ${config.label} priority tasks`}
                className="p-3.5 rounded-xl bg-muted/20 border border-border/40 hover:bg-muted/40 transition-colors flex flex-col justify-between space-y-2 text-left disabled:opacity-60 disabled:cursor-default focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-muted-foreground">
                    {config.label}
                  </span>
                  <div className={cn('p-1 rounded-lg border', config.bgTintClass, config.borderClass)}>
                    <Icon className="h-3 w-3" />
                  </div>
                </div>

                <div className="flex items-baseline justify-between">
                  <span className="text-2xl font-bold font-mono tracking-tight text-foreground">
                    {count}
                  </span>
                  <span className="text-[11px] font-mono text-muted-foreground">
                    {percentage}%
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
