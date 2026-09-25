'use client';

import * as React from 'react';
import {
  ArrowDownRight,
  ArrowUpRight,
  Calendar,
  CheckCircle2,
  PlusCircle,
  TrendingDown,
  TrendingUp,
  Zap,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { SegmentedControl } from '@/components/ui/segmented-control';
import { useProductivityMetrics } from '../hooks/use-productivity-metrics';
import type { AnalyticsInterval } from '../types/dashboard.types';
import { DashboardQueryError } from './dashboard-query-state';
import { ProductivityBurnupChart } from './productivity-burnup-chart';

interface ProductivityVelocityCardProps {
  workspaceId: string;
  days: number;
  onDaysChange: (days: number) => void;
  enabled?: boolean;
  onSelectCompleted?: () => void;
}

type TimeframeOption = '7' | '14' | '30' | '90';

const TIMEFRAME_OPTIONS = [
  { value: '7' as TimeframeOption, label: '7d' },
  { value: '14' as TimeframeOption, label: '14d' },
  { value: '30' as TimeframeOption, label: '30d' },
  { value: '90' as TimeframeOption, label: '90d' },
];

const INTERVAL_OPTIONS: Array<{ value: AnalyticsInterval; label: string }> = [
  { value: 'day', label: 'Daily' },
  { value: 'week', label: 'Weekly' },
];

export function ProductivityVelocityCard({
  workspaceId,
  days,
  onDaysChange,
  enabled = true,
  onSelectCompleted,
}: ProductivityVelocityCardProps) {
  const [interval, setInterval] = React.useState<AnalyticsInterval>('day');
  const {
    data: metrics,
    isLoading,
    isError,
    refetch,
  } = useProductivityMetrics(workspaceId, days, interval, enabled);

  const created = metrics?.totalCreatedInPeriod || 0;
  const completed = metrics?.totalCompletedInPeriod || 0;
  const totalVolume = created + completed;
  const completionRatio = created > 0 ? Math.round((completed / created) * 100) : 100;
  const isVelocityPositive = completed >= created;
  const timeline = metrics?.timeline ?? [];

  const formattedStartDate = metrics?.startDate
    ? new Date(metrics.startDate).toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    : '';

  return (
    <Card className="rounded-2xl border-border bg-card">
      <CardHeader className="pb-4">
        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <CardTitle className="text-base font-bold tracking-tight">
                Productivity Velocity
              </CardTitle>
              <Badge variant="outline" className="text-[11px] font-mono gap-1">
                <Zap className="h-3 w-3 text-amber-500" />
                Comparison Window
              </Badge>
            </div>
            <CardDescription className="text-xs">
              Cumulative created vs completed in the selected window. Totals below are period counts, not all-time KPIs.
            </CardDescription>
          </div>

          <div className="flex flex-col sm:flex-row gap-2">
            <SegmentedControl
              options={TIMEFRAME_OPTIONS}
              value={String(days) as TimeframeOption}
              onChange={(val) => onDaysChange(Number(val))}
              className="w-full sm:w-auto"
            />
            <SegmentedControl
              options={INTERVAL_OPTIONS}
              value={interval}
              onChange={setInterval}
              className="w-full sm:w-auto"
            />
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-5">
        {isLoading ? (
          <div className="space-y-4 animate-pulse">
            <div className="h-40 rounded-xl bg-muted/40" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="h-24 rounded-xl bg-muted/50" />
              <div className="h-24 rounded-xl bg-muted/50" />
            </div>
          </div>
        ) : isError || !metrics ? (
          <DashboardQueryError title="productivity" onRetry={() => void refetch()} compact />
        ) : (
          <>
            <ProductivityBurnupChart timeline={timeline} />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-muted/20 border border-border/40 flex items-center justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
                    <PlusCircle className="h-3.5 w-3.5 text-primary" />
                    <span>Created in window</span>
                  </div>
                  <div className="text-3xl font-extrabold font-mono tracking-tight text-foreground">
                    {created.toLocaleString()}
                  </div>
                  <p className="text-[11px] text-muted-foreground">
                    Creation has no task list endpoint
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-primary/10 text-primary border border-primary/20 shrink-0">
                  <ArrowUpRight className="h-5 w-5" />
                </div>
              </div>

              <button
                type="button"
                onClick={onSelectCompleted}
                disabled={!onSelectCompleted || completed === 0}
                aria-label={`View ${completed} tasks completed in this window`}
                className="p-4 rounded-xl bg-muted/20 border border-border/40 flex items-center justify-between text-left disabled:opacity-70 disabled:cursor-default hover:bg-muted/40 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                    <span>Completed in window</span>
                  </div>
                  <div className="text-3xl font-extrabold font-mono tracking-tight text-foreground">
                    {completed.toLocaleString()}
                  </div>
                  <p className="text-[11px] text-muted-foreground">
                    Opens current Done tasks
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 shrink-0">
                  <ArrowDownRight className="h-5 w-5" />
                </div>
              </button>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground font-medium">Flow distribution</span>
                <span className="font-mono font-semibold text-foreground">
                  {completionRatio}% clearance rate
                </span>
              </div>
              <div className="h-2.5 w-full rounded-full bg-muted/50 overflow-hidden flex gap-0.5">
                {totalVolume > 0 ? (
                  <>
                    <div
                      className="h-full bg-primary transition-all duration-700 ease-out"
                      style={{ width: `${(created / totalVolume) * 100}%` }}
                    />
                    <div
                      className="h-full bg-emerald-500 transition-all duration-700 ease-out"
                      style={{ width: `${(completed / totalVolume) * 100}%` }}
                    />
                  </>
                ) : (
                  <div className="h-full w-full bg-muted/60" />
                )}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-2 border-t border-border/40 text-xs text-muted-foreground">
              <div className="flex items-center gap-2">
                {isVelocityPositive ? (
                  <Badge variant="success" className="gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full">
                    <TrendingUp className="h-3 w-3" /> Positive throughput
                  </Badge>
                ) : (
                  <Badge variant="warning" className="gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full">
                    <TrendingDown className="h-3 w-3" /> Backlog growing
                  </Badge>
                )}
                <span className="hidden sm:inline">
                  {typeof metrics.netVelocity === 'number'
                    ? `Net velocity ${metrics.netVelocity > 0 ? '+' : ''}${metrics.netVelocity}`
                    : null}
                </span>
              </div>
              {formattedStartDate && (
                <div className="flex items-center gap-1 font-mono text-[11px]">
                  <Calendar className="h-3 w-3" />
                  <span>Since {formattedStartDate}</span>
                </div>
              )}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
