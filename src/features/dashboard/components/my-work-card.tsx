'use client';

import * as React from 'react';
import { useState } from 'react';
import Link from 'next/link';
import {
  AlertTriangle,
  ArrowRight,
  Calendar,
  CheckCircle2,
  Inbox,
  Loader2,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import dynamic from 'next/dynamic';

const TaskDetailSheet = dynamic(
  () => import('@/features/task/components/task-detail-sheet').then((mod) => mod.TaskDetailSheet),
  { ssr: false },
);
import { useMyTasks } from '@/features/task/hooks/use-my-tasks';
import type { Task } from '@/features/task/types/task.types';
import { TASK_PRIORITY_CONFIG, TASK_STATUS_CONFIG } from '@/lib/constants/task-theme';
import { cn } from '@/lib/utils';

interface MyWorkCardProps {
  workspaceId: string;
  workspaceSlug: string;
}

type WorkFilter = 'ATTENTION' | 'IN_PROGRESS' | 'ALL';

export function MyWorkCard({ workspaceId, workspaceSlug }: MyWorkCardProps) {
  const [filter, setFilter] = useState<WorkFilter>('ATTENTION');
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  const { data: myTasksResponse, isLoading } = useMyTasks(workspaceId, {
    limit: 50,
  });

  const tasks: Task[] = myTasksResponse?.data?.tasks || [];

  const isOverdue = (task: Task) => {
    if (!task.dueDate || task.status === 'DONE') return false;
    const due = new Date(task.dueDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return due < today;
  };

  const isDueToday = (task: Task) => {
    if (!task.dueDate || task.status === 'DONE') return false;
    const due = new Date(task.dueDate);
    const today = new Date();
    return (
      due.getDate() === today.getDate() &&
      due.getMonth() === today.getMonth() &&
      due.getFullYear() === today.getFullYear()
    );
  };

  const attentionTasks = tasks.filter(
    (t) => t.status !== 'DONE' && (isOverdue(t) || isDueToday(t) || t.priority === 'URGENT'),
  );

  const inProgressTasks = tasks.filter((t) => t.status === 'IN_PROGRESS');

  const displayedTasks =
    filter === 'ATTENTION'
      ? attentionTasks
      : filter === 'IN_PROGRESS'
      ? inProgressTasks
      : tasks.filter((t) => t.status !== 'DONE');

  const visibleTasks = displayedTasks.slice(0, 6);

  return (
    <>
      <Card className="rounded-2xl border-border bg-card shadow-xs">
        <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 gap-3 border-b border-border/40">
          <div>
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <CheckCircle2 className="h-4 w-4" />
              </div>
              <CardTitle className="text-base font-bold text-foreground">
                My Work &amp; Deliverables
              </CardTitle>
              {attentionTasks.length > 0 && (
                <Badge
                  variant="danger"
                  className="text-[10px] font-bold px-1.5 py-0.5 rounded-full"
                >
                  {attentionTasks.length} need attention
                </Badge>
              )}
            </div>
            <CardDescription className="text-xs text-muted-foreground mt-1">
              Active tasks assigned to you across projects in this workspace
            </CardDescription>
          </div>

          <div className="flex items-center gap-1.5 self-start sm:self-auto flex-wrap">
            <button
              type="button"
              onClick={() => setFilter('ATTENTION')}
              className={cn(
                'px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring',
                filter === 'ATTENTION'
                  ? 'bg-primary text-primary-foreground shadow-xs'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/60',
              )}
            >
              Needs Attention ({attentionTasks.length})
            </button>
            <button
              type="button"
              onClick={() => setFilter('IN_PROGRESS')}
              className={cn(
                'px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring',
                filter === 'IN_PROGRESS'
                  ? 'bg-primary text-primary-foreground shadow-xs'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/60',
              )}
            >
              In Progress ({inProgressTasks.length})
            </button>
            <button
              type="button"
              onClick={() => setFilter('ALL')}
              className={cn(
                'px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring',
                filter === 'ALL'
                  ? 'bg-primary text-primary-foreground shadow-xs'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/60',
              )}
            >
              All Open ({tasks.filter((t) => t.status !== 'DONE').length})
            </button>
          </div>
        </CardHeader>

        <CardContent className="p-4 sm:p-5">
          {isLoading ? (
            <div className="flex items-center justify-center py-12 text-sm text-muted-foreground">
              <Loader2 className="h-5 w-5 animate-spin mr-2 text-primary" />
              Loading your tasks...
            </div>
          ) : visibleTasks.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-center space-y-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                <Inbox className="h-5 w-5" />
              </div>
              <p className="text-xs font-semibold text-foreground">
                {filter === 'ATTENTION'
                  ? 'No urgent or overdue tasks assigned to you!'
                  : filter === 'IN_PROGRESS'
                  ? 'No tasks currently in progress.'
                  : 'You have no open tasks assigned.'}
              </p>
              <p className="text-[11px] text-muted-foreground max-w-xs">
                {filter === 'ATTENTION'
                  ? 'Great job keeping your deliverables up to date.'
                  : 'Pick up work from your project Kanban boards or sprint backlog.'}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-border/40">
              {visibleTasks.map((task) => {
                const overdue = isOverdue(task);
                const dueToday = isDueToday(task);
                const priorityConfig = TASK_PRIORITY_CONFIG[task.priority] || TASK_PRIORITY_CONFIG.MEDIUM;
                const statusConfig = TASK_STATUS_CONFIG[task.status] || TASK_STATUS_CONFIG.TODO;

                return (
                  <div
                    key={task.id}
                    onClick={() => setSelectedTask(task)}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 py-3 hover:bg-muted/30 -mx-2 px-2 rounded-xl transition-colors cursor-pointer group focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring"
                    role="button"
                    tabIndex={0}
                    aria-label={`Open task: ${task.title}`}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        setSelectedTask(task);
                      }
                    }}
                  >
                    <div className="space-y-1 min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        {task.key && (
                          <span className="font-mono text-[11px] font-bold text-muted-foreground shrink-0">
                            {task.key}
                          </span>
                        )}
                        <span className="text-xs sm:text-sm font-semibold text-foreground group-hover:text-primary transition-colors truncate">
                          {task.title}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 text-[11px] text-muted-foreground flex-wrap">
                        {task.dueDate && (
                          <span
                            className={cn(
                              'flex items-center gap-1 font-medium',
                              overdue
                                ? 'text-danger font-semibold'
                                : dueToday
                                ? 'text-amber-800 dark:text-amber-200 font-semibold'
                                : 'text-muted-foreground',
                            )}
                          >
                            {overdue ? (
                              <AlertTriangle className="h-3 w-3 shrink-0" />
                            ) : (
                              <Calendar className="h-3 w-3 shrink-0" />
                            )}
                            {overdue
                              ? 'Overdue'
                              : dueToday
                              ? 'Due Today'
                              : `Due ${new Date(task.dueDate).toLocaleDateString('en-US', {
                                  month: 'short',
                                  day: 'numeric',
                                })}`}
                          </span>
                        )}

                        {task.storyPoints !== null && task.storyPoints !== undefined && (
                          <span className="flex items-center gap-1">
                            <span className="inline-block h-1.5 w-1.5 rounded-full bg-muted-foreground/50" />
                            {task.storyPoints} SP
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
                      <span
                        className={cn(
                          'text-[10px] font-semibold px-2 py-0.5 rounded-full border',
                          priorityConfig.badgeClass,
                        )}
                      >
                        {priorityConfig.label}
                      </span>
                      <span
                        className={cn(
                          'text-[10px] font-semibold px-2 py-0.5 rounded-full border',
                          statusConfig.badgeClass,
                        )}
                      >
                        {statusConfig.label}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {tasks.length > 0 && (
            <div className="pt-3 mt-2 border-t border-border/40 flex items-center justify-between">
              <span className="text-[11px] text-muted-foreground">
                Showing {visibleTasks.length} of {tasks.length} assigned task{tasks.length === 1 ? '' : 's'}
              </span>
              <Link
                href={`/workspaces/${workspaceSlug}/my-tasks`}
                className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
              >
                View all in My Tasks <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Detail sheet when task is clicked */}
      {selectedTask && (
        <TaskDetailSheet
          taskIdOrKey={selectedTask.id}
          open={Boolean(selectedTask)}
          onOpenChange={(isOpen) => {
            if (!isOpen) setSelectedTask(null);
          }}
          workspaceId={workspaceId}
          projectId={selectedTask.column?.board?.project?.id || ''}
        />
      )}
    </>
  );
}
