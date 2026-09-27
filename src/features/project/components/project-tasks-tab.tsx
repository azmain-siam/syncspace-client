'use client';

import * as React from 'react';
import dynamic from 'next/dynamic';
import {
  Calendar,
  CheckCircle2,
  CheckSquare,
  Filter,
  Inbox,
  Layers,
  MessageSquare,
  Paperclip,
  Search,
  X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { TASK_PRIORITY_CONFIG, TASK_STATUS_CONFIG } from '@/lib/constants/task-theme';
import type { TaskPriority, TaskStatus } from '@/types/domain';
import type {
  ProjectDetail,
  ProjectTaskItem,
  ProjectTasksResponse,
} from '../types/project.types';
import { useProjectTasks } from '../hooks/use-project-tasks';

const TaskDetailSheet = dynamic(
  () =>
    import('@/features/task/components/task-detail-sheet').then(
      (mod) => mod.TaskDetailSheet,
    ),
  { ssr: false },
);

interface ProjectTasksTabProps {
  project: ProjectDetail;
  workspaceId: string;
  canManage?: boolean;
  className?: string;
}

const ALL_STATUSES: TaskStatus[] = ['TODO', 'IN_PROGRESS', 'REVIEW', 'DONE'];
const ALL_PRIORITIES: TaskPriority[] = ['LOW', 'MEDIUM', 'HIGH', 'URGENT'];

function getInitials(name?: string | null): string {
  if (!name) return 'U';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function formatTaskDueDate(dueDateString?: string | null) {
  if (!dueDateString) return null;
  try {
    const due = new Date(dueDateString);
    const now = new Date();
    // Normalize to midnight for fair date comparison
    const dueDay = new Date(due.getFullYear(), due.getMonth(), due.getDate());
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const diffDays = Math.round(
      (dueDay.getTime() - today.getTime()) / (1000 * 60 * 60 * 24),
    );

    const isOverdue = diffDays < 0;
    const isDueToday = diffDays === 0;
    const isDueTomorrow = diffDays === 1;

    let text = due.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });

    if (isDueToday) text = 'Today';
    else if (isDueTomorrow) text = 'Tomorrow';
    else if (isOverdue) text = `${Math.abs(diffDays)}d overdue`;

    return {
      text,
      isOverdue,
      isDueToday,
    };
  } catch {
    return { text: dueDateString, isOverdue: false, isDueToday: false };
  }
}

export function ProjectTasksTab({
  project,
  workspaceId,
  canManage = false,
  className,
}: ProjectTasksTabProps) {
  const { data: tasksResponse, isLoading, isError, refetch } = useProjectTasks(
    workspaceId,
    project.id,
  );
  // Normalize tasks array safely supporting both { tasks: [...] } and flat [...]
  const tasks: ProjectTaskItem[] = React.useMemo(() => {
    const rawData = tasksResponse?.data;
    if (Array.isArray(rawData)) {
      return rawData;
    }
    if (
      rawData &&
      typeof rawData === 'object' &&
      'tasks' in rawData &&
      Array.isArray((rawData as ProjectTasksResponse).tasks)
    ) {
      return (rawData as ProjectTasksResponse).tasks;
    }
    return [];
  }, [tasksResponse?.data]);

  // Filter & Search states
  const [searchQuery, setSearchQuery] = React.useState('');
  const [statusFilter, setStatusFilter] = React.useState<TaskStatus | 'ALL'>('ALL');
  const [priorityFilter, setPriorityFilter] = React.useState<TaskPriority | 'ALL'>('ALL');

  // Task Detail Sheet states
  const [selectedTaskId, setSelectedTaskId] = React.useState<string | null>(null);
  const [isSheetOpen, setIsSheetOpen] = React.useState(false);

  const handleOpenTask = (taskId: string) => {
    setSelectedTaskId(taskId);
    setIsSheetOpen(true);
  };

  const handleCloseSheet = (open: boolean) => {
    setIsSheetOpen(open);
    if (!open) {
      setSelectedTaskId(null);
    }
  };

  // Status counts
  const statusCounts = React.useMemo(() => {
    const counts: Record<string, number> = {
      ALL: tasks.length,
      TODO: 0,
      IN_PROGRESS: 0,
      REVIEW: 0,
      DONE: 0,
    };
    tasks.forEach((t) => {
      if (counts[t.status] !== undefined) {
        counts[t.status] += 1;
      }
    });
    return counts;
  }, [tasks]);

  // Filtered tasks
  const filteredTasks = React.useMemo(() => {
    return tasks.filter((task) => {
      // Search query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const matchesTitle = task.title.toLowerCase().includes(query);
        const matchesDescription =
          task.description?.toLowerCase().includes(query) ?? false;
        const matchesAssignee =
          task.assignee?.name?.toLowerCase().includes(query) ?? false;
        const taskKey = task.key || `${project.key}-${task.taskNumber ?? task.order}`;
        const matchesKey = taskKey.toLowerCase().includes(query);

        if (!matchesTitle && !matchesDescription && !matchesAssignee && !matchesKey) {
          return false;
        }
      }

      // Status filter
      if (statusFilter !== 'ALL' && task.status !== statusFilter) {
        return false;
      }

      // Priority filter
      if (priorityFilter !== 'ALL' && task.priority !== priorityFilter) {
        return false;
      }

      return true;
    });
  }, [tasks, searchQuery, statusFilter, priorityFilter, project.key]);

  const hasActiveFilters =
    searchQuery.trim().length > 0 || statusFilter !== 'ALL' || priorityFilter !== 'ALL';

  const clearFilters = () => {
    setSearchQuery('');
    setStatusFilter('ALL');
    setPriorityFilter('ALL');
  };

  const completedCount = statusCounts.DONE || 0;
  const progressPercent =
    tasks.length > 0 ? Math.round((completedCount / tasks.length) * 100) : 0;

  return (
    <div className={cn('space-y-4', className)}>
      {/* 1. Header Toolbar & Interactive Filters */}
      <div className="rounded-2xl border border-border/80 bg-card p-4 shadow-xs space-y-3.5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search tasks by title, key, or assignee..."
              className="pl-9 h-9 text-xs rounded-xl bg-muted/20 border-border/70 focus-visible:ring-1 focus-visible:ring-primary"
              aria-label="Search project tasks"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                aria-label="Clear search"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          {/* Right Toolbar Controls: Priority Filter & Clear */}
          <div className="flex items-center gap-2">
            <div className="w-[140px] shrink-0">
              <Select
                value={priorityFilter}
                onValueChange={(val) =>
                  setPriorityFilter(val as TaskPriority | 'ALL')
                }
              >
                <SelectTrigger className="h-9 text-xs rounded-xl border-border/70 bg-muted/20">
                  <div className="flex items-center gap-1.5 truncate">
                    <Filter className="h-3 w-3 text-muted-foreground shrink-0" />
                    <SelectValue placeholder="Priority" />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Priorities</SelectItem>
                  {ALL_PRIORITIES.map((priority) => (
                    <SelectItem key={priority} value={priority}>
                      <span className="flex items-center gap-1.5">
                        <span
                          className={cn(
                            'h-2 w-2 rounded-full shrink-0',
                            TASK_PRIORITY_CONFIG[priority].dotClass,
                          )}
                        />
                        <span>{TASK_PRIORITY_CONFIG[priority].label}</span>
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFilters}
                className="h-9 px-2.5 text-xs text-muted-foreground hover:text-foreground cursor-pointer"
              >
                Clear
              </Button>
            )}
          </div>
        </div>

        {/* Status Filter Pills Ribbon */}
        <div className="flex flex-wrap items-center gap-1.5 pt-1 border-t border-border/50">
          <button
            type="button"
            onClick={() => setStatusFilter('ALL')}
            className={cn(
              'px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5',
              statusFilter === 'ALL'
                ? 'bg-foreground text-background shadow-xs'
                : 'bg-muted/40 text-muted-foreground hover:bg-muted hover:text-foreground',
            )}
          >
            <span>All</span>
            <span
              className={cn(
                'text-[10px] px-1.5 py-0.2 rounded-full font-mono',
                statusFilter === 'ALL'
                  ? 'bg-background/20 text-background'
                  : 'bg-muted text-muted-foreground',
              )}
            >
              {statusCounts.ALL}
            </span>
          </button>

          {ALL_STATUSES.map((status) => {
            const config = TASK_STATUS_CONFIG[status];
            const isSelected = statusFilter === status;
            return (
              <button
                key={status}
                type="button"
                onClick={() => setStatusFilter(status)}
                className={cn(
                  'px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 border',
                  isSelected
                    ? cn(config.badgeClass, 'ring-1 ring-primary/40 font-bold')
                    : 'border-transparent bg-muted/30 text-muted-foreground hover:bg-muted hover:text-foreground',
                )}
              >
                <span className={cn('h-1.5 w-1.5 rounded-full shrink-0', config.dotClass)} />
                <span>{config.label}</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-background/50 text-muted-foreground font-mono">
                  {statusCounts[status] || 0}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Main Content Area */}
      {isLoading ? (
        <div className="rounded-2xl border border-border/80 bg-card overflow-hidden shadow-xs divide-y divide-border/60">
          <div className="p-3.5 bg-muted/30 flex items-center gap-4 text-xs font-bold text-muted-foreground uppercase tracking-wider">
            <div className="w-24">Key</div>
            <div className="flex-1">Task Title</div>
            <div className="w-28 hidden sm:block">Status</div>
            <div className="w-24 hidden md:block">Priority</div>
            <div className="w-36 hidden lg:block">Assignee</div>
            <div className="w-28 hidden sm:block text-right">Due Date</div>
          </div>
          {Array.from({ length: 6 }).map((_, idx) => (
            <div
              key={idx}
              className="p-3.5 flex items-center gap-4 animate-pulse bg-card"
            >
              <div className="h-5 w-20 bg-muted/60 rounded-md" />
              <div className="h-5 flex-1 bg-muted/50 rounded-md" />
              <div className="h-5 w-24 bg-muted/40 rounded-full hidden sm:block" />
              <div className="h-5 w-20 bg-muted/40 rounded-full hidden md:block" />
              <div className="h-5 w-32 bg-muted/40 rounded-md hidden lg:block" />
              <div className="h-5 w-20 bg-muted/30 rounded-md hidden sm:block ml-auto" />
            </div>
          ))}
        </div>
      ) : isError ? (
        <div className="text-center py-12 px-4 rounded-2xl border border-destructive/30 bg-destructive/5 space-y-3">
          <p className="text-sm font-semibold text-destructive">
            Failed to load tasks for this project.
          </p>
          <Button
            size="sm"
            variant="outline"
            onClick={() => void refetch()}
            className="rounded-lg text-xs"
          >
            Retry
          </Button>
        </div>
      ) : tasks.length === 0 ? (
        <div className="text-center py-12 px-4 rounded-2xl border border-dashed border-border/70 bg-card space-y-3">
          <div className="h-10 w-10 rounded-xl bg-muted/60 text-muted-foreground flex items-center justify-center mx-auto">
            <Inbox className="h-5 w-5" />
          </div>
          <div className="space-y-1 max-w-sm mx-auto">
            <h4 className="font-bold text-sm text-foreground">
              No tasks in this project yet
            </h4>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Create tasks from the project board to track deliverables, assign teammates, and meet release milestones.
            </p>
          </div>
        </div>
      ) : filteredTasks.length === 0 ? (
        <div className="text-center py-12 px-4 rounded-2xl border border-dashed border-border/70 bg-card space-y-3">
          <div className="h-10 w-10 rounded-xl bg-muted/60 text-muted-foreground flex items-center justify-center mx-auto">
            <Inbox className="h-5 w-5" />
          </div>
          <div className="space-y-1 max-w-sm mx-auto">
            <h4 className="font-bold text-sm text-foreground">
              No tasks match your filters
            </h4>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Adjust your search keywords, priority selection, or status filter to see other tasks.
            </p>
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={clearFilters}
            className="rounded-lg text-xs cursor-pointer"
          >
            Reset Filters
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="rounded-2xl border border-border/80 bg-card overflow-hidden shadow-xs divide-y divide-border/60">
            {/* Table Header */}
            <div className="px-4 py-2.5 bg-muted/40 flex items-center gap-3 text-[11px] font-bold text-muted-foreground uppercase tracking-wider select-none">
              <div className="w-24 shrink-0">Key</div>
              <div className="flex-1 min-w-0">Task</div>
              <div className="w-28 shrink-0 hidden sm:block">Status</div>
              <div className="w-24 shrink-0 hidden md:block">Priority</div>
              <div className="w-36 shrink-0 hidden lg:block">Assignee</div>
              <div className="w-28 shrink-0 hidden sm:block text-right">Due Date</div>
            </div>

            {/* Task Rows */}
            <div className="divide-y divide-border/50">
              {filteredTasks.map((task) => {
                const statusTheme = TASK_STATUS_CONFIG[task.status];
                const priorityTheme = TASK_PRIORITY_CONFIG[task.priority];
                const dueDateMeta = formatTaskDueDate(task.dueDate);
                const taskKey = task.key || `${project.key}-${task.taskNumber ?? task.order}`;
                const commentsCount = task.commentsCount ?? task._count?.comments ?? 0;
                const attachmentsCount = task.attachmentsCount ?? task._count?.attachments ?? 0;
                const hasChecklists = Boolean(task.checklistProgress && task.checklistProgress.total > 0);

                return (
                  <div
                    key={task.id}
                    onClick={() => handleOpenTask(task.id)}
                    className="px-4 py-3 flex items-center gap-3 hover:bg-muted/30 transition-colors cursor-pointer group"
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        handleOpenTask(task.id);
                      }
                    }}
                  >
                    {/* Key Pill */}
                    <div className="w-24 shrink-0">
                      <span className="font-mono text-[11px] font-bold text-muted-foreground bg-muted/60 px-2 py-0.5 rounded border border-border/60 group-hover:border-primary/40 group-hover:text-primary transition-colors">
                        {taskKey}
                      </span>
                    </div>

                    {/* Task Title & Quick Badges */}
                    <div className="flex-1 min-w-0 space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="text-xs sm:text-sm font-semibold text-foreground truncate group-hover:text-primary transition-colors">
                          {task.title}
                        </span>

                        {/* Comments, Attachments & Checklist indicator */}
                        {(commentsCount > 0 || attachmentsCount > 0 || hasChecklists) && (
                          <div className="hidden sm:flex items-center gap-1.5 text-muted-foreground shrink-0 text-[10px]">
                            {commentsCount > 0 && (
                              <span className="flex items-center gap-0.5">
                                <MessageSquare className="h-3 w-3" />
                                <span>{commentsCount}</span>
                              </span>
                            )}
                            {attachmentsCount > 0 && (
                              <span className="flex items-center gap-0.5">
                                <Paperclip className="h-3 w-3" />
                                <span>{attachmentsCount}</span>
                              </span>
                            )}
                            {hasChecklists && (
                              <span className="flex items-center gap-0.5 text-primary">
                                <CheckSquare className="h-3 w-3" />
                                <span>
                                  {task.checklistProgress?.completed}/{task.checklistProgress?.total}
                                </span>
                              </span>
                            )}
                          </div>
                        )}

                        {/* Labels Pill */}
                        {task.labels && task.labels.length > 0 && (
                          <div className="hidden xl:flex items-center gap-1 shrink-0">
                            {task.labels.slice(0, 2).map((label) => (
                              <span
                                key={label.id}
                                className="text-[9px] px-1.5 py-0.2 rounded font-medium border"
                                style={{
                                  backgroundColor: `${label.color}15`,
                                  borderColor: `${label.color}40`,
                                  color: label.color,
                                }}
                              >
                                {label.name}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Mobile Metadata Ribbon */}
                      <div className="flex sm:hidden items-center gap-2 text-[10px] text-muted-foreground">
                        <span className={cn('px-1.5 py-0.2 rounded border font-semibold', statusTheme.badgeClass)}>
                          {statusTheme.label}
                        </span>
                        <span>·</span>
                        <span>{priorityTheme.label}</span>
                        {dueDateMeta && (
                          <>
                            <span>·</span>
                            <span
                              className={cn(
                                dueDateMeta.isOverdue && task.status !== 'DONE'
                                  ? 'text-rose-500 font-semibold'
                                  : '',
                              )}
                            >
                              {dueDateMeta.text}
                            </span>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Status Badge (Desktop) */}
                    <div className="w-28 shrink-0 hidden sm:block">
                      <span
                        className={cn(
                          'inline-flex items-center gap-1.5 text-[11px] font-semibold px-2 py-0.5 rounded-full border',
                          statusTheme.badgeClass,
                        )}
                      >
                        <span className={cn('h-1.5 w-1.5 rounded-full shrink-0', statusTheme.dotClass)} />
                        <span>{statusTheme.label}</span>
                      </span>
                    </div>

                    {/* Priority Badge (Desktop) */}
                    <div className="w-24 shrink-0 hidden md:block">
                      <span
                        className={cn(
                          'inline-flex items-center gap-1.5 text-[11px] font-semibold px-2 py-0.5 rounded-full border',
                          priorityTheme.badgeClass,
                        )}
                      >
                        <span className={cn('h-1.5 w-1.5 rounded-full shrink-0', priorityTheme.dotClass)} />
                        <span>{priorityTheme.label}</span>
                      </span>
                    </div>

                    {/* Assignee (Desktop) */}
                    <div className="w-36 shrink-0 hidden lg:flex items-center gap-2 min-w-0">
                      {task.assignee ? (
                        <>
                          <Avatar className="h-5 w-5 border border-border/80 shrink-0">
                            {task.assignee.avatar && (
                              <AvatarImage
                                src={task.assignee.avatar}
                                alt={task.assignee.name}
                              />
                            )}
                            <AvatarFallback className="text-[9px] bg-primary/10 text-primary font-bold">
                              {getInitials(task.assignee.name)}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-xs text-foreground font-medium truncate">
                            {task.assignee.name}
                          </span>
                        </>
                      ) : (
                        <span className="text-xs text-muted-foreground italic">
                          Unassigned
                        </span>
                      )}
                    </div>

                    {/* Due Date (Desktop) */}
                    <div className="w-28 shrink-0 hidden sm:flex items-center justify-end gap-1.5 text-right text-xs">
                      {dueDateMeta ? (
                        <span
                          className={cn(
                            'inline-flex items-center gap-1 font-medium',
                            dueDateMeta.isOverdue && task.status !== 'DONE'
                              ? 'text-rose-600 dark:text-rose-400 font-bold'
                              : dueDateMeta.isDueToday
                              ? 'text-amber-600 dark:text-amber-400 font-semibold'
                              : 'text-muted-foreground',
                          )}
                        >
                          <Calendar className="h-3 w-3 shrink-0" />
                          <span>{dueDateMeta.text}</span>
                        </span>
                      ) : (
                        <span className="text-muted-foreground/60">—</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Footer Telemetry & Progress Strip */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-2 text-xs text-muted-foreground">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-foreground">
                Showing {filteredTasks.length} of {tasks.length} tasks
              </span>
              <span>·</span>
              <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-medium">
                <CheckCircle2 className="h-3 w-3" />
                <span>{completedCount} completed ({progressPercent}%)</span>
              </span>
            </div>

            {project.boards && project.boards.length > 0 && (
              <span className="text-[11px] text-muted-foreground/80 flex items-center gap-1">
                <Layers className="h-3 w-3" />
                <span>
                  Tracked across {project.boards.length} Kanban{' '}
                  {project.boards.length === 1 ? 'board' : 'boards'}
                </span>
              </span>
            )}
          </div>
        </div>
      )}

      {/* Task Detail Sheet Integration */}
      <TaskDetailSheet
        taskIdOrKey={selectedTaskId}
        open={isSheetOpen}
        onOpenChange={handleCloseSheet}
        workspaceId={workspaceId}
        projectId={project.id}
        canManage={canManage}
      />
    </div>
  );
}
