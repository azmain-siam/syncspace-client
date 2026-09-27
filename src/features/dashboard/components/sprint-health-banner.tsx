'use client';

import Link from 'next/link';
import { Flag, Timer } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { buttonVariants } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import type { SprintHealthStatus, WorkspaceSprintHealthResponse } from '../types/dashboard.types';
import { DashboardQueryEmpty, DashboardQueryError } from './dashboard-query-state';

interface SprintHealthBannerProps {
  health?: WorkspaceSprintHealthResponse;
  isLoading?: boolean;
  isError?: boolean;
  onRetry?: () => void;
  workspaceSlug: string;
  onSelectSprint?: (sprintId: string, name: string) => void;
}

const HEALTH_STYLES: Record<SprintHealthStatus, string> = {
  ON_TRACK: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/20',
  AT_RISK: 'bg-amber-500/10 text-amber-800 dark:text-amber-200 border-amber-500/20',
  BEHIND: 'bg-destructive/10 text-destructive border-destructive/20',
  OVERDUE: 'bg-destructive/10 text-destructive border-destructive/20',
};

export function SprintHealthBanner({
  health,
  isLoading,
  isError,
  onRetry,
  workspaceSlug,
  onSelectSprint,
}: SprintHealthBannerProps) {
  if (isLoading) {
    return <div className="h-36 rounded-2xl border border-border bg-card animate-pulse" />;
  }

  if (isError) {
    return <DashboardQueryError title="sprint health" onRetry={onRetry} />;
  }

  const sprints = health?.sprints ?? [];
  if (!health || sprints.length === 0) {
    return (
      <Card className="rounded-2xl border-border bg-card">
        <CardContent className="p-5">
          <DashboardQueryEmpty
            title="No active sprints"
            description="Start a sprint in a project to monitor time remaining versus completed points."
            icon={<Flag className="h-5 w-5" />}
            action={
              <Link
                href={`/workspaces/${workspaceSlug}/projects`}
                className={buttonVariants({ variant: 'outline', size: 'sm' })}
              >
                View projects
              </Link>
            }
          />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {sprints.map((sprint) => (
        <Card key={sprint.id} className="rounded-2xl border-border bg-card">
          <CardContent className="p-5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
              <div className="min-w-0 space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-sm font-bold text-foreground truncate">{sprint.name}</h3>
                  <Badge
                    variant="outline"
                    className={cn(
                      'text-[10px] font-semibold rounded-full border',
                      HEALTH_STYLES[sprint.healthStatus],
                    )}
                  >
                    {sprint.healthStatus.replace('_', ' ')}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">
                  {sprint.project.title}
                  {sprint.goal ? ` · ${sprint.goal}` : ''}
                </p>
              </div>
              <button
                type="button"
                onClick={() => onSelectSprint?.(sprint.id, sprint.name)}
                disabled={!onSelectSprint}
                className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline disabled:no-underline disabled:text-muted-foreground"
              >
                <Timer className="h-3.5 w-3.5" />
                {sprint.daysRemaining == null
                  ? 'View sprint tasks'
                  : `${sprint.daysRemaining} day${sprint.daysRemaining === 1 ? '' : 's'} left`}
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <ProgressLine
                label={`Time elapsed ${sprint.timeElapsedPercentage}%`}
                value={sprint.timeElapsedPercentage}
              />
              <ProgressLine
                label={`Points ${sprint.storyPoints.completed}/${sprint.storyPoints.total} SP`}
                value={sprint.completionPercentage}
                tone="emerald"
              />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function ProgressLine({
  label,
  value,
  tone = 'primary',
}: {
  label: string;
  value: number;
  tone?: 'primary' | 'emerald';
}) {
  const safe = Math.min(100, Math.max(0, value));
  return (
    <div className="space-y-1.5">
      <p className="text-[11px] font-medium text-muted-foreground">{label}</p>
      <div className="h-2 rounded-full bg-muted/60 overflow-hidden">
        <div
          className={cn('h-full rounded-full', tone === 'emerald' ? 'bg-emerald-500' : 'bg-primary')}
          style={{ width: `${safe}%` }}
        />
      </div>
    </div>
  );
}
