'use client';

import * as React from 'react';
import { use, useMemo, useState } from 'react';
import {
  AlertCircle,
  Calendar,
  CheckCircle2,
  CheckSquare,
  Clock,
  FolderKanban,
  Layers,
  Loader2,
  Paperclip,
  Search,
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { TaskDetailSheet } from '@/features/task/components/task-detail-sheet';
import { useMyTasks } from '@/features/task/hooks/use-my-tasks';
import type { Task, TaskPriority, TaskStatus } from '@/features/task/types/task.types';
import { useCurrentWorkspace } from '@/features/workspace/hooks/use-current-workspace';
import { cn } from '@/lib/utils';

type FilterTab = 'ALL' | 'DUE_TODAY' | 'OVERDUE' | 'IN_PROGRESS' | 'DONE';
type GroupBy = 'PROJECT' | 'STATUS' | 'PRIORITY' | 'DUE_DATE';

const PRIORITY_BADGES: Record<TaskPriority, { label: string; className: string }> = {
  URGENT: {
    label: 'Urgent',
    className: 'bg-red-500/15 text-red-600 dark:text-red-400 border-red-500/30',
  },
  HIGH: {
    label: 'High',
    className: 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30',
  },
  MEDIUM: {
    label: 'Medium',
    className: 'bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/30',
  },
  LOW: {
    label: 'Low',
    className: 'bg-slate-500/15 text-slate-600 dark:text-slate-300 border-slate-500/30',
  },
};

const STATUS_BADGES: Record<TaskStatus, { label: string; className: string }> = {
  TODO: {
    label: 'To Do',
    className: 'bg-slate-500/15 text-slate-600 dark:text-slate-400 border-slate-500/30',
  },
  IN_PROGRESS: {
    label: 'In Progress',
    className: 'bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/30',
  },
  REVIEW: {
    label: 'In Review',
    className: 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30',
  },
  DONE: {
    label: 'Completed',
    className: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30',
  },
};

export default function MyTasksPage({
  params,
}: {
  params: Promise<{ workspaceSlug: string }>;
}) {
  const { workspaceSlug } = use(params);
  const { workspace, isLoading: workspaceLoading } = useCurrentWorkspace(workspaceSlug);
  const workspaceId = workspace?.id || '';

  const { data: myTasksResponse, isLoading: tasksLoading } = useMyTasks(workspaceId);
  const tasks = useMemo(() => myTasksResponse?.data?.tasks || [], [myTasksResponse]);

  // Derived summary metrics from tasks
  const summary = useMemo(() => {
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];

    const total = tasks.length;
    let todo = 0;
    let inProgress = 0;
    let review = 0;
    let done = 0;
    let overdue = 0;
    let dueToday = 0;

    tasks.forEach((t) => {
      if (t.status === 'TODO') todo++;
      else if (t.status === 'IN_PROGRESS') inProgress++;
      else if (t.status === 'REVIEW') review++;
      else if (t.status === 'DONE') done++;

      if (t.dueDate && t.status !== 'DONE') {
        const taskDue = new Date(t.dueDate);
        const taskDueStr = taskDue.toISOString().split('T')[0];
        if (taskDue < now) overdue++;
        if (taskDueStr === todayStr) dueToday++;
      }
    });

    return { total, todo, inProgress, review, done, overdue, dueToday };
  }, [tasks]);

  // Local filters and controls
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<FilterTab>('ALL');
  const [groupBy, setGroupBy] = useState<GroupBy>('STATUS');

  // Selected task drawer
  const [selectedTaskIdOrKey, setSelectedTaskIdOrKey] = useState<string | null>(null);
  const [selectedTaskProject, setSelectedTaskProject] = useState<string>('');
  const [detailOpen, setDetailOpen] = useState(false);

  // Filter tasks
  const filteredTasks = useMemo(() => {
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];

    return tasks.filter((t) => {
      // Search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = t.title.toLowerCase().includes(q);
        const matchesKey = t.key ? t.key.toLowerCase().includes(q) : false;
        if (!matchesTitle && !matchesKey) return false;
      }

      // Tab filter
      if (activeTab === 'DONE') return t.status === 'DONE';
      if (activeTab === 'IN_PROGRESS') return t.status === 'IN_PROGRESS' || t.status === 'REVIEW';
      if (activeTab === 'DUE_TODAY') {
        if (!t.dueDate) return false;
        const taskDue = new Date(t.dueDate).toISOString().split('T')[0];
        return taskDue === todayStr;
      }
      if (activeTab === 'OVERDUE') {
        if (!t.dueDate || t.status === 'DONE') return false;
        return new Date(t.dueDate) < now;
      }

      return true;
    });
  }, [tasks, searchQuery, activeTab]);

  // Group tasks
  const groupedTasks = useMemo(() => {
    const groups: { [key: string]: { label: string; tasks: Task[] } } = {};

    filteredTasks.forEach((task) => {
      let key = 'Other';
      let label = 'Other';

      if (groupBy === 'PROJECT') {
        const project = task.column?.board?.project;
        key = project?.id || 'unassigned-project';
        label = project?.title || 'General';
      } else if (groupBy === 'STATUS') {
        key = task.status;
        label = STATUS_BADGES[task.status]?.label || task.status;
      } else if (groupBy === 'PRIORITY') {
        key = task.priority;
        label = PRIORITY_BADGES[task.priority]?.label || task.priority;
      } else if (groupBy === 'DUE_DATE') {
        if (!task.dueDate) {
          key = 'no-due-date';
          label = 'No Due Date';
        } else {
          const now = new Date();
          const due = new Date(task.dueDate);
          const todayStr = now.toISOString().split('T')[0];
          const dueStr = due.toISOString().split('T')[0];

          if (task.status !== 'DONE' && due < now) {
            key = 'overdue';
            label = 'Overdue';
          } else if (dueStr === todayStr) {
            key = 'today';
            label = 'Due Today';
          } else {
            key = 'upcoming';
            label = 'Upcoming';
          }
        }
      }

      if (!groups[key]) {
        groups[key] = { label, tasks: [] };
      }
      groups[key].tasks.push(task);
    });

    return groups;
  }, [filteredTasks, groupBy]);

  const handleOpenTask = (task: Task) => {
    setSelectedTaskIdOrKey(task.key || task.id);
    setSelectedTaskProject(task.column?.board?.project?.id || '');
    setDetailOpen(true);
  };

  const isLoading = workspaceLoading || tasksLoading;

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2">
          <div className="flex size-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <CheckSquare className="size-5" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            My Tasks
          </h1>
        </div>
        <p className="text-xs sm:text-sm text-muted-foreground">
          Personal inbox and overview of all tasks assigned to you across{' '}
          <span className="font-medium text-foreground">{workspace?.name || 'Workspace'}</span>.
        </p>
      </div>

      {/* Metrics Summary Cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {/* Total Assigned */}
        <div className="rounded-xl border border-border/80 bg-card p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">
              Total Assigned
            </span>
            <Layers className="size-4 text-muted-foreground/60" />
          </div>
          <p className="mt-2 text-2xl font-bold text-foreground">
            {summary.total}
          </p>
        </div>

        {/* Due Today */}
        <div className="rounded-xl border border-border/80 bg-card p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-amber-600 dark:text-amber-400">
              Due Today
            </span>
            <Clock className="size-4 text-amber-500" />
          </div>
          <p className="mt-2 text-2xl font-bold text-foreground">
            {summary.dueToday}
          </p>
        </div>

        {/* Overdue */}
        <div className="rounded-xl border border-border/80 bg-card p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-rose-600 dark:text-rose-400">
              Overdue
            </span>
            <AlertCircle className="size-4 text-rose-500" />
          </div>
          <p className="mt-2 text-2xl font-bold text-foreground">
            {summary.overdue}
          </p>
        </div>

        {/* Completed */}
        <div className="rounded-xl border border-border/80 bg-card p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400">
              Completed
            </span>
            <CheckCircle2 className="size-4 text-emerald-500" />
          </div>
          <p className="mt-2 text-2xl font-bold text-foreground">
            {summary.done}
          </p>
        </div>
      </div>

      {/* Filter and Control Bar */}
      <div className="flex flex-col gap-3 rounded-2xl border border-border/70 bg-card p-4 sm:flex-row sm:items-center sm:justify-between shadow-xs">
        {/* Search */}
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            placeholder="Search by title or key (e.g. SYNC-14)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 h-9 text-xs"
          />
        </div>

        {/* Tabs & Group By */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Filter Tabs */}
          <div className="flex rounded-lg border border-border/60 bg-muted/30 p-0.5 text-xs font-medium">
            <button
              type="button"
              onClick={() => setActiveTab('ALL')}
              className={cn(
                'rounded-md px-2.5 py-1 transition-colors cursor-pointer',
                activeTab === 'ALL'
                  ? 'bg-background text-foreground shadow-xs font-semibold'
                  : 'text-muted-foreground hover:text-foreground',
              )}
            >
              All
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('DUE_TODAY')}
              className={cn(
                'rounded-md px-2.5 py-1 transition-colors cursor-pointer',
                activeTab === 'DUE_TODAY'
                  ? 'bg-background text-foreground shadow-xs font-semibold'
                  : 'text-muted-foreground hover:text-foreground',
              )}
            >
              Due Today
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('OVERDUE')}
              className={cn(
                'rounded-md px-2.5 py-1 transition-colors cursor-pointer',
                activeTab === 'OVERDUE'
                  ? 'bg-background text-rose-600 dark:text-rose-400 shadow-xs font-semibold'
                  : 'text-muted-foreground hover:text-foreground',
              )}
            >
              Overdue
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('DONE')}
              className={cn(
                'rounded-md px-2.5 py-1 transition-colors cursor-pointer',
                activeTab === 'DONE'
                  ? 'bg-background text-foreground shadow-xs font-semibold'
                  : 'text-muted-foreground hover:text-foreground',
              )}
            >
              Completed
            </button>
          </div>

          {/* Group By selector */}
          <div className="flex items-center gap-1.5 text-xs">
            <span className="text-muted-foreground hidden sm:inline">Group:</span>
            <select
              value={groupBy}
              onChange={(e) => setGroupBy(e.target.value as GroupBy)}
              aria-label="Group tasks by"
              className="h-8 rounded-lg border border-input bg-background px-2 text-xs text-foreground focus:outline-hidden focus:ring-1 focus:ring-ring cursor-pointer"
            >
              <option value="STATUS">By Status</option>
              <option value="PROJECT">By Project</option>
              <option value="PRIORITY">By Priority</option>
              <option value="DUE_DATE">By Due Date</option>
            </select>
          </div>
        </div>
      </div>

      {/* Task List */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-16 text-center text-muted-foreground">
          <Loader2 className="size-7 animate-spin text-primary mb-3" />
          <p className="text-sm font-medium">Loading your tasks...</p>
        </div>
      ) : Object.keys(groupedTasks).length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-border/80 p-12 text-center">
          <div className="flex size-12 items-center justify-center rounded-2xl bg-muted/60 text-muted-foreground mb-3">
            <CheckSquare className="size-6" />
          </div>
          <h3 className="text-base font-semibold text-foreground">
            No Tasks Found
          </h3>
          <p className="mt-1 text-xs text-muted-foreground max-w-sm">
            {searchQuery
              ? `No tasks matched "${searchQuery}". Try changing your search query or filters.`
              : "You're all caught up! There are no tasks matching your selected filters."}
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(groupedTasks).map(([groupKey, group]) => (
            <div key={groupKey} className="space-y-2">
              {/* Group Title */}
              <div className="flex items-center gap-2 px-1">
                <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  {group.label}
                </h3>
                <span className="rounded-full bg-secondary px-2 py-0.5 text-[10px] font-semibold text-muted-foreground">
                  {group.tasks.length}
                </span>
              </div>

              {/* Task Items */}
              <div className="space-y-1.5">
                {group.tasks.map((task) => {
                  const priority = PRIORITY_BADGES[task.priority] || PRIORITY_BADGES.MEDIUM;
                  const status = STATUS_BADGES[task.status] || STATUS_BADGES.TODO;
                  const isOverdue =
                    task.dueDate &&
                    task.status !== 'DONE' &&
                    new Date(task.dueDate) < new Date();

                  const formattedDue = task.dueDate
                    ? new Date(task.dueDate).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                      })
                    : null;

                  return (
                    <div
                      key={task.id}
                      onClick={() => handleOpenTask(task)}
                      className="group flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 rounded-xl border border-border/70 bg-card p-3 transition-all hover:border-border hover:shadow-sm cursor-pointer"
                    >
                      {/* Left: Key, Status, Title, Project */}
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        {/* Status Badge */}
                        <span
                          className={cn(
                            'rounded-md px-2 py-0.5 text-[10px] font-semibold border shrink-0',
                            status.className,
                          )}
                        >
                          {status.label}
                        </span>

                        {/* Task Key */}
                        <span className="font-mono text-xs font-semibold text-muted-foreground group-hover:text-foreground transition-colors shrink-0">
                          {task.key}
                        </span>

                        {/* Title */}
                        <span className="text-xs font-medium text-foreground truncate group-hover:text-primary transition-colors">
                          {task.title}
                        </span>
                      </div>

                      {/* Right: Project, Priority, Metrics, Due Date */}
                      <div className="flex items-center gap-2.5 shrink-0 flex-wrap sm:flex-nowrap">
                        {/* Project Badge */}
                        {task.column?.board?.project?.title && (
                          <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground bg-muted/40 rounded-md px-2 py-0.5">
                            <FolderKanban className="size-3" />
                            <span className="truncate max-w-[120px]">
                              {task.column.board.project.title}
                            </span>
                          </span>
                        )}

                        {/* Priority Pill */}
                        <span
                          className={cn(
                            'rounded-md px-2 py-0.5 text-[10px] font-semibold border',
                            priority.className,
                          )}
                        >
                          {priority.label}
                        </span>

                        {/* Checklist Counter */}
                        {task._count?.checklists ? (
                          <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground">
                            <CheckSquare className="size-3" />
                            {task._count.checklists}
                          </span>
                        ) : null}

                        {/* Attachments Counter */}
                        {task._count?.attachments ? (
                          <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground">
                            <Paperclip className="size-3" />
                            {task._count.attachments}
                          </span>
                        ) : null}

                        {/* Due Date */}
                        {formattedDue && (
                          <span
                            className={cn(
                              'inline-flex items-center gap-1 text-[11px] font-medium rounded-md px-2 py-0.5 border',
                              isOverdue
                                ? 'border-rose-500/30 bg-rose-500/10 text-rose-600 dark:text-rose-400'
                                : 'border-border/60 bg-muted/30 text-muted-foreground',
                            )}
                          >
                            <Calendar className="size-3" />
                            {formattedDue}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Task Detail Sheet */}
      <TaskDetailSheet
        taskIdOrKey={selectedTaskIdOrKey}
        open={detailOpen}
        onOpenChange={setDetailOpen}
        workspaceId={workspaceId}
        projectId={selectedTaskProject}
        canManage={true}
      />
    </div>
  );
}
