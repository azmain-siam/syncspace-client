'use client';

import * as React from 'react';
import {
  Archive,
  ChevronLeft,
  ChevronRight,
  Clock,
  Flame,
  Layers,
  Plus,
  Search,
  SlidersHorizontal,
  X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useProjectBacklog } from '../hooks/use-project-backlog';
import type { BacklogQueryParams, Sprint, SprintTask } from '../types/sprint.types';
import type { TaskPriority, TaskStatus } from '@/features/task/types/task.types';
import { SprintTaskItem } from './sprint-task-item';

interface BacklogSectionProps {
  projectId: string;
  workspaceId: string;
  sprints?: Sprint[];
  onSelectTask?: (taskId: string) => void;
  onOpenCreateTaskModal?: () => void;
  canManage?: boolean;
}

export function BacklogSection({
  projectId,
  sprints = [],
  onSelectTask,
  onOpenCreateTaskModal,
  canManage = true,
}: BacklogSectionProps) {
  // Query filters state
  const [search, setSearch] = React.useState('');
  const [priority, setPriority] = React.useState<TaskPriority | ''>('');
  const [status, setStatus] = React.useState<TaskStatus | ''>('');
  const [page, setPage] = React.useState(1);

  // Debounced search query
  const [debouncedSearch, setDebouncedSearch] = React.useState('');
  React.useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 300);
    return () => clearTimeout(handler);
  }, [search]);

  const queryParams: BacklogQueryParams = React.useMemo(() => {
    const params: BacklogQueryParams = { page, limit: 20 };
    if (debouncedSearch.trim()) params.search = debouncedSearch.trim();
    if (priority) params.priority = priority;
    if (status) params.status = status;
    return params;
  }, [debouncedSearch, priority, status, page]);

  const { data: backlogRes, isLoading, isFetching } = useProjectBacklog(
    projectId,
    queryParams,
  );

  const backlogTasks = backlogRes?.data?.data || [];
  const meta = backlogRes?.data?.meta;

  const totalTasks = meta?.total ?? 0;
  const totalStoryPoints = meta?.totalStoryPoints ?? 0;
  const totalEstimatedHours = meta?.totalEstimatedHours ?? 0;

  const hasActiveFilters = Boolean(search || priority || status);

  const resetFilters = () => {
    setSearch('');
    setPriority('');
    setStatus('');
    setPage(1);
  };

  return (
    <div className="rounded-2xl border border-border/80 bg-card overflow-hidden shadow-xs space-y-4 p-4 sm:p-5">
      {/* Backlog Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border/60">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5 flex-wrap">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Archive className="h-4 w-4" />
            </div>
            <h3 className="font-bold text-base sm:text-lg text-foreground tracking-tight">
              Product Backlog
            </h3>
            <span className="rounded-full bg-muted px-2.5 py-0.5 text-xs font-semibold text-muted-foreground">
              {totalTasks} {totalTasks === 1 ? 'issue' : 'issues'}
            </span>
          </div>
          <p className="text-xs text-muted-foreground">
            Unplanned work pool. Drag or assign tasks to active and upcoming sprints.
          </p>
        </div>

        {/* Effort Badges & Quick Action */}
        <div className="flex flex-wrap items-center gap-2 self-start sm:self-center">
          {totalStoryPoints > 0 && (
            <div className="flex items-center gap-1 rounded-lg border border-amber-500/20 bg-amber-500/10 px-2.5 py-1 text-xs font-semibold text-amber-700 dark:text-amber-300">
              <Flame className="h-3.5 w-3.5" />
              <span>{totalStoryPoints} SP</span>
            </div>
          )}

          {totalEstimatedHours > 0 && (
            <div className="hidden sm:flex items-center gap-1 rounded-lg border border-border bg-background px-2.5 py-1 text-xs font-medium text-muted-foreground">
              <Clock className="h-3.5 w-3.5" />
              <span>{totalEstimatedHours}h</span>
            </div>
          )}

          {onOpenCreateTaskModal && canManage && (
            <Button
              size="sm"
              onClick={onOpenCreateTaskModal}
              className="gap-1.5 h-8 text-xs font-semibold"
            >
              <Plus className="h-3.5 w-3.5" />
              Create Issue
            </Button>
          )}
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search backlog by key or title..."
            className="pl-9 h-9 text-xs rounded-lg"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-2.5 top-2.5 text-muted-foreground hover:text-foreground cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Priority Filter */}
        <select
          value={priority}
          onChange={(e) => {
            setPriority(e.target.value as TaskPriority | '');
            setPage(1);
          }}
          className="h-9 rounded-lg border border-input bg-background px-3 text-xs text-foreground transition-colors focus:border-primary focus:outline-none cursor-pointer sm:w-36"
        >
          <option value="">All Priorities</option>
          <option value="URGENT">🔴 Urgent</option>
          <option value="HIGH">🟠 High</option>
          <option value="MEDIUM">🔵 Medium</option>
          <option value="LOW">⚪ Low</option>
        </select>

        {/* Status Filter */}
        <select
          value={status}
          onChange={(e) => {
            setStatus(e.target.value as TaskStatus | '');
            setPage(1);
          }}
          className="h-9 rounded-lg border border-input bg-background px-3 text-xs text-foreground transition-colors focus:border-primary focus:outline-none cursor-pointer sm:w-36"
        >
          <option value="">All Statuses</option>
          <option value="TODO">To Do</option>
          <option value="IN_PROGRESS">In Progress</option>
          <option value="REVIEW">In Review</option>
          <option value="DONE">Done</option>
        </select>

        {/* Clear Filters Button */}
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={resetFilters}
            className="h-9 px-2.5 text-xs text-muted-foreground hover:text-foreground gap-1"
          >
            <X className="h-3.5 w-3.5" />
            Reset
          </Button>
        )}
      </div>

      {/* Backlog List */}
      <div className="space-y-2 pt-1">
        {isLoading ? (
          <div className="space-y-2 py-4">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="h-14 w-full rounded-xl bg-muted/40 animate-pulse border border-border/40"
              />
            ))}
          </div>
        ) : backlogTasks.length > 0 ? (
          backlogTasks.map((task: SprintTask) => (
            <SprintTaskItem
              key={task.id}
              task={task}
              projectId={projectId}
              sprints={sprints}
              currentSprintId={null}
              onSelectTask={onSelectTask}
              canManage={canManage}
            />
          ))
        ) : hasActiveFilters ? (
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border/80 p-8 text-center bg-background/50">
            <SlidersHorizontal className="h-8 w-8 text-muted-foreground/50 mb-2" />
            <p className="text-sm font-semibold text-foreground">
              No matching backlog items
            </p>
            <p className="text-xs text-muted-foreground max-w-xs mt-1">
              None of your product backlog tasks match the current search or filters.
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={resetFilters}
              className="mt-3 text-xs h-8"
            >
              Clear Filters
            </Button>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border/80 p-10 text-center bg-background/50">
            <Layers className="h-10 w-10 text-muted-foreground/40 mb-2" />
            <p className="text-sm font-semibold text-foreground">
              Your backlog is completely clear!
            </p>
            <p className="text-xs text-muted-foreground max-w-xs mt-1">
              All tasks have been scheduled into upcoming sprints or completed. Create a new issue to add to the backlog.
            </p>
            {onOpenCreateTaskModal && canManage && (
              <Button
                size="sm"
                onClick={onOpenCreateTaskModal}
                className="mt-4 gap-1.5 h-8 text-xs font-semibold"
              >
                <Plus className="h-3.5 w-3.5" />
                Create Issue
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Pagination Controls */}
      {meta && meta.totalPages > 1 && (
        <div className="flex items-center justify-between pt-3 border-t border-border/60 text-xs text-muted-foreground">
          <span>
            Showing page <strong className="text-foreground">{meta.page}</strong> of{' '}
            <strong className="text-foreground">{meta.totalPages}</strong> ({meta.total} total)
          </span>

          <div className="flex items-center gap-1.5">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={!meta.hasPrevPage || isFetching}
              className="h-8 px-2 text-xs"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => p + 1)}
              disabled={!meta.hasNextPage || isFetching}
              className="h-8 px-2 text-xs"
            >
              Next
              <ChevronRight className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
