'use client';

import * as React from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { ArrowRight, Calendar, Inbox } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button, buttonVariants } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { TASK_PRIORITY_CONFIG, TASK_STATUS_CONFIG } from '@/lib/constants/task-theme';
import { cn } from '@/lib/utils';
import { useWorkspaceTasksInfinite } from '../hooks/use-workspace-tasks';
import { buildExplorerHref } from '../lib/workspace-task-filters';
import { formatDueDate } from '../lib/format-dashboard';
import type { WorkspaceTaskDrilldown, WorkspaceTaskItem } from '../types/workspace-tasks.types';
import { DashboardQueryEmpty, DashboardQueryError } from './dashboard-query-state';

const TaskDetailSheet = dynamic(
  () => import('@/features/task/components/task-detail-sheet').then((mod) => mod.TaskDetailSheet),
  { ssr: false },
);

interface TaskListSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  workspaceId: string;
  workspaceSlug: string;
  drilldown: WorkspaceTaskDrilldown | null;
}

export function TaskListSheet({
  open,
  onOpenChange,
  workspaceId,
  workspaceSlug,
  drilldown,
}: TaskListSheetProps) {
  const [selectedTask, setSelectedTask] = React.useState<WorkspaceTaskItem | null>(null);

  const filters = drilldown?.filters ?? {};
  const query = useWorkspaceTasksInfinite(
    workspaceId,
    { ...filters, limit: 20 },
    open && Boolean(workspaceId && drilldown),
  );

  const tasks = query.data?.pages.flatMap((page) => page.tasks) ?? [];
  const meta = query.data?.pages[0]?.meta;
  const explorerHref = drilldown ? buildExplorerHref(workspaceSlug, filters) : '#';

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent
          side="right"
          className="flex flex-col w-full sm:max-w-lg p-0 gap-0"
        >
          <SheetHeader className="p-5 sm:p-6 border-b border-border text-left">
            <SheetTitle className="text-lg font-bold tracking-tight">
              {drilldown?.title ?? 'Tasks'}
            </SheetTitle>
            <SheetDescription className="text-xs">
              {drilldown?.description ?? 'Matching tasks across this workspace'}
              {typeof meta?.total === 'number' && (
                <span className="block mt-1 font-mono text-muted-foreground">
                  {meta.total.toLocaleString()} match{meta.total === 1 ? '' : 'es'}
                </span>
              )}
            </SheetDescription>
          </SheetHeader>

          <div className="flex-1 overflow-y-auto p-4 sm:p-5">
            {query.isLoading ? (
              <div className="space-y-2.5" aria-label="Loading matching tasks">
                {Array.from({ length: 6 }).map((_, index) => (
                  <div key={index} className="h-16 rounded-xl bg-muted/40 animate-pulse" />
                ))}
              </div>
            ) : query.isError ? (
              <DashboardQueryError title="these tasks" onRetry={() => void query.refetch()} />
            ) : tasks.length === 0 ? (
              <DashboardQueryEmpty
                title="No matching tasks"
                description="Nothing matches this filter right now."
                icon={<Inbox className="h-5 w-5" />}
                action={
                  <Link
                    href={explorerHref}
                    className={buttonVariants({ variant: 'outline', size: 'sm' })}
                  >
                    Open in Explorer
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                }
              />
            ) : (
              <div className="space-y-1.5">
                {tasks.map((task) => (
                  <TaskListRow
                    key={task.id}
                    task={task}
                    onSelect={() => setSelectedTask(task)}
                  />
                ))}
                {query.hasNextPage && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="w-full mt-2"
                    isLoading={query.isFetchingNextPage}
                    onClick={() => void query.fetchNextPage()}
                  >
                    Load more
                  </Button>
                )}
              </div>
            )}
          </div>

          <div className="p-4 sm:p-5 border-t border-border">
            <Link
              href={explorerHref}
              className={cn(buttonVariants({ variant: 'outline' }), 'w-full')}
            >
              Open in Explorer
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </SheetContent>
      </Sheet>

      {selectedTask && (
        <TaskDetailSheet
          taskIdOrKey={selectedTask.id}
          open={Boolean(selectedTask)}
          onOpenChange={(isOpen) => {
            if (!isOpen) setSelectedTask(null);
          }}
          workspaceId={workspaceId}
          projectId={selectedTask.column.board.project.id}
          boardId={selectedTask.column.board.id}
          canManage={selectedTask.permissions.canEdit}
          canDelete={selectedTask.permissions.canDelete}
        />
      )}
    </>
  );
}

function TaskListRow({
  task,
  onSelect,
}: {
  task: WorkspaceTaskItem;
  onSelect: () => void;
}) {
  const due = formatDueDate(task.dueDate);
  const priority = TASK_PRIORITY_CONFIG[task.priority];
  const status = TASK_STATUS_CONFIG[task.status];
  const project = task.column.board.project;
  const initials = task.assignee?.name
    ? task.assignee.name
        .split(' ')
        .map((part) => part[0])
        .slice(0, 2)
        .join('')
        .toUpperCase()
    : '—';

  return (
    <button
      type="button"
      onClick={onSelect}
      aria-label={`Open task ${task.key ?? ''} ${task.title}`.trim()}
      className="w-full text-left p-3 rounded-xl border border-border/60 bg-card hover:bg-muted/40 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 space-y-1">
          <div className="flex items-center gap-2 min-w-0">
            {task.key && (
              <span className="font-mono text-[11px] font-bold text-muted-foreground shrink-0">
                {task.key}
              </span>
            )}
            <span className="text-sm font-semibold text-foreground truncate">{task.title}</span>
          </div>
          <div className="flex items-center gap-2 text-[11px] text-muted-foreground flex-wrap">
            <span className="inline-flex items-center gap-1.5 min-w-0">
              <span
                className="h-2 w-2 rounded-full shrink-0"
                style={{ backgroundColor: project.color || '#64748b' }}
              />
              <span className="truncate max-w-[140px]">{project.title}</span>
            </span>
            <span
              className={cn(
                'inline-flex items-center gap-1',
                due.isOverdue && 'text-destructive font-semibold',
                due.isDueToday && 'text-amber-800 dark:text-amber-200 font-semibold',
              )}
            >
              <Calendar className="h-3 w-3" />
              {due.label}
            </span>
          </div>
        </div>
        {task.assignee && (
          <Avatar className="h-7 w-7 rounded-lg border border-border shrink-0">
            {task.assignee.avatar && (
              <AvatarImage src={task.assignee.avatar} alt={task.assignee.name} />
            )}
            <AvatarFallback className="rounded-lg text-[10px] font-semibold">
              {initials}
            </AvatarFallback>
          </Avatar>
        )}
      </div>
      <div className="flex items-center gap-1.5 mt-2">
        <span className={cn('text-[10px] font-semibold px-2 py-0.5 rounded-full border', priority.badgeClass)}>
          {priority.label}
        </span>
        <span className={cn('text-[10px] font-semibold px-2 py-0.5 rounded-full border', status.badgeClass)}>
          {status.label}
        </span>
      </div>
    </button>
  );
}
