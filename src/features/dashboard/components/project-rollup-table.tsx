'use client';

import Link from 'next/link';
import { FolderKanban } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { buttonVariants } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import type { ProjectHealthStatus, ProjectRollupItem } from '../types/dashboard.types';
import { DashboardQueryEmpty, DashboardQueryError } from './dashboard-query-state';

interface ProjectRollupTableProps {
  rollups?: ProjectRollupItem[];
  isLoading?: boolean;
  isError?: boolean;
  onRetry?: () => void;
  workspaceSlug: string;
  onSelectProject?: (projectId: string, title: string) => void;
  onSelectProjectOverdue?: (projectId: string, title: string, count: number) => void;
}

const HEALTH_STYLES: Record<ProjectHealthStatus, string> = {
  HEALTHY: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/20',
  NEEDS_ATTENTION: 'bg-amber-500/10 text-amber-800 dark:text-amber-200 border-amber-500/20',
  CRITICAL: 'bg-destructive/10 text-destructive border-destructive/20',
  ON_HOLD: 'bg-slate-500/10 text-slate-700 dark:text-slate-300 border-slate-500/20',
  COMPLETED: 'bg-primary/10 text-primary border-primary/20',
};

export function ProjectRollupTable({
  rollups = [],
  isLoading,
  isError,
  onRetry,
  workspaceSlug,
  onSelectProject,
  onSelectProjectOverdue,
}: ProjectRollupTableProps) {
  if (isLoading) {
    return <div className="h-64 rounded-2xl border border-border bg-card animate-pulse" />;
  }

  if (isError) {
    return <DashboardQueryError title="project rollups" onRetry={onRetry} />;
  }

  return (
    <Card className="rounded-2xl border-border bg-card">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-bold tracking-tight">Project portfolio</CardTitle>
        <CardDescription className="text-xs">
          Health, progress, and overdue pressure per project
        </CardDescription>
      </CardHeader>
      <CardContent>
        {rollups.length === 0 ? (
          <DashboardQueryEmpty
            title="No projects yet"
            description="Create a project to see portfolio health and sprint alignment."
            icon={<FolderKanban className="h-5 w-5" />}
            action={
              <Link
                href={`/workspaces/${workspaceSlug}/projects`}
                className={buttonVariants({ variant: 'outline', size: 'sm' })}
              >
                Go to projects
              </Link>
            }
          />
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead>Project</TableHead>
                <TableHead>Health</TableHead>
                <TableHead className="hidden md:table-cell">Progress</TableHead>
                <TableHead className="hidden lg:table-cell">T / IP / D</TableHead>
                <TableHead className="text-center">Overdue</TableHead>
                <TableHead className="hidden sm:table-cell">Active sprint</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rollups.map((project) => (
                <TableRow key={project.id}>
                  <TableCell>
                    <button
                      type="button"
                      onClick={() => onSelectProject?.(project.id, project.title)}
                      disabled={!onSelectProject}
                      className="text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-md"
                    >
                      <p className="text-xs font-semibold text-foreground">{project.title}</p>
                      <p className="text-[11px] text-muted-foreground font-mono">
                        {project.key ?? '—'}
                      </p>
                    </button>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={cn(
                        'text-[10px] font-semibold rounded-full border',
                        HEALTH_STYLES[project.healthStatus],
                      )}
                    >
                      {project.healthStatus.replace('_', ' ')}
                    </Badge>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    <div className="flex items-center gap-2">
                      <div className="w-20 h-1.5 rounded-full bg-muted/60 overflow-hidden">
                        <div
                          className="h-full bg-primary rounded-full"
                          style={{ width: `${Math.min(100, project.completionPercentage)}%` }}
                        />
                      </div>
                      <span className="text-xs font-mono">{project.completionPercentage}%</span>
                    </div>
                  </TableCell>
                  <TableCell className="hidden lg:table-cell font-mono text-xs text-muted-foreground">
                    {project.taskCounts.todo} / {project.taskCounts.inProgress} / {project.taskCounts.done}
                  </TableCell>
                  <TableCell className="text-center">
                    {project.taskCounts.overdue > 0 ? (
                      <button
                        type="button"
                        onClick={() =>
                          onSelectProjectOverdue?.(
                            project.id,
                            project.title,
                            project.taskCounts.overdue,
                          )
                        }
                        className="text-xs font-semibold text-destructive hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-md"
                      >
                        {project.taskCounts.overdue}
                      </button>
                    ) : (
                      <span className="text-xs text-muted-foreground">0</span>
                    )}
                  </TableCell>
                  <TableCell className="hidden sm:table-cell text-xs text-muted-foreground">
                    {project.activeSprint
                      ? `${project.activeSprint.name} (${project.activeSprint.completionPercentage}%)`
                      : '—'}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
