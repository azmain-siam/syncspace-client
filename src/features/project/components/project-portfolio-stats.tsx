import * as React from 'react';
import { Activity, AlertTriangle, CalendarClock, Columns3, FolderKanban } from 'lucide-react';
import { Project, ProjectHealth } from '@/types/domain';
import { cn } from '@/lib/utils';

interface ProjectPortfolioStatsProps {
  projects: Project[];
  className?: string;
  onSelectHealthFilter?: (health: ProjectHealth) => void;
  onSelectStatusTab?: (status: 'ALL' | 'ACTIVE' | 'ARCHIVED') => void;
}

export function ProjectPortfolioStats({
  projects,
  className,
  onSelectHealthFilter,
  onSelectStatusTab,
}: ProjectPortfolioStatsProps) {
  const total = projects.length;
  const active = projects.filter((p) => p.status === 'ACTIVE').length;
  const archived = projects.filter((p) => p.status === 'ARCHIVED').length;
  const completed = projects.filter((p) => p.status === 'COMPLETED').length;

  const onTrackCount = projects.filter(
    (p) => !p.health || p.health === ProjectHealth.ON_TRACK,
  ).length;
  const atRiskCount = projects.filter((p) => p.health === ProjectHealth.AT_RISK).length;
  const offTrackCount = projects.filter((p) => p.health === ProjectHealth.OFF_TRACK).length;

  const healthPct = total > 0 ? Math.round((onTrackCount / total) * 100) : 100;

  const totalBoards = projects.reduce((acc, p) => acc + (p._count?.boards || 0), 0);
  const totalSprints = projects.reduce((acc, p) => acc + (p._count?.sprints || 0), 0);

  // Deadlines calculation
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const in14Days = new Date(startOfToday.getTime() + 14 * 24 * 60 * 60 * 1000);

  let overdueCount = 0;
  let dueSoonCount = 0;

  for (const project of projects) {
    if (!project.dueDate || project.status === 'COMPLETED' || project.status === 'ARCHIVED') {
      continue;
    }
    const due = new Date(project.dueDate);
    if (due < startOfToday) {
      overdueCount++;
    } else if (due <= in14Days) {
      dueSoonCount++;
    }
  }

  return (
    <div
      className={cn(
        'grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4',
        className,
      )}
    >
      {/* 1. Initiatives / Total Projects */}
      <button
        type="button"
        onClick={() => onSelectStatusTab?.('ACTIVE')}
        className="text-left rounded-2xl border border-border bg-card p-4 sm:p-5 shadow-xs hover:border-primary/40 hover:shadow-sm transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring cursor-pointer group"
      >
        <div className="flex items-center justify-between gap-2 mb-2 sm:mb-3">
          <span className="text-xs font-semibold text-muted-foreground group-hover:text-foreground transition-colors">
            Initiatives
          </span>
          <div className="h-8 w-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
            <FolderKanban className="h-4 w-4" />
          </div>
        </div>
        <div className="space-y-0.5">
          <div className="text-xl sm:text-2xl font-extrabold tracking-tight text-foreground">
            {active} <span className="text-xs sm:text-sm font-semibold text-muted-foreground">Active</span>
          </div>
          <p className="text-[11px] text-muted-foreground truncate">
            {total} total ({completed} completed, {archived} archived)
          </p>
        </div>
      </button>

      {/* 2. Portfolio Health */}
      <button
        type="button"
        onClick={() => onSelectHealthFilter?.(ProjectHealth.ON_TRACK)}
        className="text-left rounded-2xl border border-border bg-card p-4 sm:p-5 shadow-xs hover:border-emerald-500/40 hover:shadow-sm transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring cursor-pointer group"
      >
        <div className="flex items-center justify-between gap-2 mb-2 sm:mb-3">
          <span className="text-xs font-semibold text-muted-foreground group-hover:text-foreground transition-colors">
            Portfolio Health
          </span>
          <div
            className={cn(
              'h-8 w-8 rounded-xl flex items-center justify-center shrink-0',
              offTrackCount > 0
                ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400'
                : atRiskCount > 0
                  ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                  : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
            )}
          >
            <Activity className="h-4 w-4" />
          </div>
        </div>
        <div className="space-y-0.5">
          <div className="text-xl sm:text-2xl font-extrabold tracking-tight text-foreground">
            {healthPct}%{' '}
            <span className="text-xs sm:text-sm font-semibold text-emerald-600 dark:text-emerald-400">
              Healthy
            </span>
          </div>
          <div className="flex items-center gap-2 text-[11px] text-muted-foreground truncate">
            {atRiskCount > 0 && (
              <span className="inline-flex items-center gap-1 text-amber-700 dark:text-amber-300 font-semibold">
                <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                {atRiskCount} at risk
              </span>
            )}
            {offTrackCount > 0 && (
              <span className="inline-flex items-center gap-1 text-rose-700 dark:text-rose-300 font-semibold">
                <span className="h-1.5 w-1.5 rounded-full bg-rose-500" />
                {offTrackCount} off track
              </span>
            )}
            {atRiskCount === 0 && offTrackCount === 0 && <span>All initiatives on track</span>}
          </div>
        </div>
      </button>

      {/* 3. Workflows & Sprints */}
      <div className="rounded-2xl border border-border bg-card p-4 sm:p-5 shadow-xs">
        <div className="flex items-center justify-between gap-2 mb-2 sm:mb-3">
          <span className="text-xs font-semibold text-muted-foreground">Workflows</span>
          <div className="h-8 w-8 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
            <Columns3 className="h-4 w-4" />
          </div>
        </div>
        <div className="space-y-0.5">
          <div className="text-xl sm:text-2xl font-extrabold tracking-tight text-foreground">
            {totalBoards}{' '}
            <span className="text-xs sm:text-sm font-semibold text-muted-foreground">
              {totalBoards === 1 ? 'Board' : 'Boards'}
            </span>
          </div>
          <p className="text-[11px] text-muted-foreground truncate">
            {totalSprints} active sprint{totalSprints === 1 ? '' : 's'} running
          </p>
        </div>
      </div>

      {/* 4. Deadlines & Schedule Pressure */}
      <div className="rounded-2xl border border-border bg-card p-4 sm:p-5 shadow-xs">
        <div className="flex items-center justify-between gap-2 mb-2 sm:mb-3">
          <span className="text-xs font-semibold text-muted-foreground">Schedule</span>
          <div
            className={cn(
              'h-8 w-8 rounded-xl flex items-center justify-center shrink-0',
              overdueCount > 0
                ? 'bg-destructive/10 text-destructive'
                : 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
            )}
          >
            {overdueCount > 0 ? (
              <AlertTriangle className="h-4 w-4" />
            ) : (
              <CalendarClock className="h-4 w-4" />
            )}
          </div>
        </div>
        <div className="space-y-0.5">
          <div
            className={cn(
              'text-xl sm:text-2xl font-extrabold tracking-tight',
              overdueCount > 0 ? 'text-destructive' : 'text-foreground',
            )}
          >
            {overdueCount > 0 ? (
              <>
                {overdueCount}{' '}
                <span className="text-xs sm:text-sm font-semibold text-destructive">
                  Overdue
                </span>
              </>
            ) : (
              <>
                {dueSoonCount}{' '}
                <span className="text-xs sm:text-sm font-semibold text-muted-foreground">
                  Due Soon
                </span>
              </>
            )}
          </div>
          <p className="text-[11px] text-muted-foreground truncate">
            {overdueCount > 0
              ? `${overdueCount} project${overdueCount === 1 ? '' : 's'} require immediate focus`
              : `${dueSoonCount} milestone${dueSoonCount === 1 ? '' : 's'} in next 14 days`}
          </p>
        </div>
      </div>
    </div>
  );
}
