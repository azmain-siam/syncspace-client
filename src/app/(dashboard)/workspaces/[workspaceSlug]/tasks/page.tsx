'use client';

import * as React from 'react';
import { use, useMemo } from 'react';
import dynamic from 'next/dynamic';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { Inbox, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useCurrentWorkspace } from '@/features/workspace/hooks/use-current-workspace';
import { useWorkspaceMembers } from '@/features/workspace/hooks/use-workspace-members';
import { useWorkspaceProjects } from '@/features/project/hooks/use-workspace-projects';
import { useWorkspaceTasks } from '@/features/dashboard/hooks/use-workspace-tasks';
import {
  parseWorkspaceTaskFilters,
  workspaceTaskFiltersToSearchParams,
} from '@/features/dashboard/lib/workspace-task-filters';
import { DashboardQueryEmpty, DashboardQueryError } from '@/features/dashboard/components/dashboard-query-state';
import type { WorkspaceTaskItem } from '@/features/dashboard/types/workspace-tasks.types';
import type { WorkspaceTasksDueDateFilter, WorkspaceTasksQueryDto } from '@/features/dashboard/types/workspace-tasks.types';
import { TASK_PRIORITY_CONFIG, TASK_STATUS_CONFIG } from '@/lib/constants/task-theme';
import { formatDueDate } from '@/features/dashboard/lib/format-dashboard';
import { cn } from '@/lib/utils';
import type { TaskPriority, TaskStatus } from '@/types/domain';

const TaskDetailSheet = dynamic(
  () => import('@/features/task/components/task-detail-sheet').then((mod) => mod.TaskDetailSheet),
  { ssr: false },
);

const STATUSES: TaskStatus[] = ['TODO', 'IN_PROGRESS', 'REVIEW', 'DONE'];
const PRIORITIES: TaskPriority[] = ['URGENT', 'HIGH', 'MEDIUM', 'LOW'];

export default function WorkspaceTasksPage({
  params,
}: {
  params: Promise<{ workspaceSlug: string }>;
}) {
  return (
    <React.Suspense fallback={<div className="h-64 rounded-2xl border border-border bg-card animate-pulse" />}>
      <WorkspaceTasksExplorer params={params} />
    </React.Suspense>
  );
}

function WorkspaceTasksExplorer({
  params,
}: {
  params: Promise<{ workspaceSlug: string }>;
}) {
  const { workspaceSlug } = use(params);
  const { workspace } = useCurrentWorkspace(workspaceSlug);
  const workspaceId = workspace?.id || '';
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const filters = useMemo(
    () => parseWorkspaceTaskFilters(new URLSearchParams(searchParams.toString())),
    [searchParams],
  );

  const [searchInput, setSearchInput] = React.useState(searchParams.get('search') ?? '');
  const [selectedTask, setSelectedTask] = React.useState<WorkspaceTaskItem | null>(null);

  const searchParamsString = searchParams.toString();

  React.useEffect(() => {
    const handle = window.setTimeout(() => {
      const current = parseWorkspaceTaskFilters(new URLSearchParams(searchParamsString));
      const next = searchInput.trim();
      if ((current.search ?? '') === next) return;
      replaceFilters(router, pathname, {
        ...current,
        search: next || undefined,
        page: undefined,
      });
    }, 300);
    return () => window.clearTimeout(handle);
  }, [searchInput, searchParamsString, pathname, router]);

  const query = useWorkspaceTasks(workspaceId, { ...filters, limit: filters.limit ?? 20 }, Boolean(workspaceId));
  const membersQuery = useWorkspaceMembers(workspaceId);
  const projectsQuery = useWorkspaceProjects(workspaceId);
  const members = membersQuery.data?.data ?? [];
  const projects = projectsQuery.data?.data ?? [];
  const tasks = query.data?.tasks ?? [];
  const meta = query.data?.meta;

  const selectedStatuses = toArray(filters.status) as TaskStatus[];
  const selectedPriorities = toArray(filters.priority) as TaskPriority[];

  const toggleStatus = (status: TaskStatus) => {
    const next = toggleValue(selectedStatuses, status);
    replaceFilters(router, pathname, {
      ...filters,
      status: next.length === 0 ? undefined : next.length === 1 ? next[0] : next,
      page: undefined,
    });
  };

  const togglePriority = (priority: TaskPriority) => {
    const next = toggleValue(selectedPriorities, priority);
    replaceFilters(router, pathname, {
      ...filters,
      priority: next.length === 0 ? undefined : next.length === 1 ? next[0] : next,
      page: undefined,
    });
  };

  return (
    <div className="space-y-5">
      <div className="space-y-1">
        <h1 className="text-2xl font-extrabold tracking-tight">Workspace tasks</h1>
        <p className="text-sm text-muted-foreground">
          Cross-project list. Filters stay in the URL so dashboard drill-downs land here.
        </p>
      </div>

      <div className="rounded-2xl border border-border bg-card p-4 sm:p-5 space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={searchInput}
            onChange={(event) => setSearchInput(event.target.value)}
            placeholder="Search title or key"
            className="pl-9"
            aria-label="Search workspace tasks"
          />
        </div>

        <div className="flex flex-wrap gap-1.5">
          {STATUSES.map((status) => (
            <FilterChip
              key={status}
              active={selectedStatuses.includes(status)}
              onClick={() => toggleStatus(status)}
              label={TASK_STATUS_CONFIG[status].label}
            />
          ))}
        </div>
        <div className="flex flex-wrap gap-1.5">
          {PRIORITIES.map((priority) => (
            <FilterChip
              key={priority}
              active={selectedPriorities.includes(priority)}
              onClick={() => togglePriority(priority)}
              label={TASK_PRIORITY_CONFIG[priority].label}
            />
          ))}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <Select
            value={filters.dueDate ?? 'all'}
            onValueChange={(value) =>
              replaceFilters(router, pathname, {
                ...filters,
                dueDate: value === 'all' ? undefined : (value as WorkspaceTasksDueDateFilter),
                page: undefined,
              })
            }
          >
            <SelectTrigger aria-label="Due date filter">
              <SelectValue placeholder="Due date" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Any due date</SelectItem>
              <SelectItem value="overdue">Overdue</SelectItem>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="this_week">This week</SelectItem>
              <SelectItem value="upcoming">Upcoming</SelectItem>
              <SelectItem value="nodate">No due date</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={filters.assigneeId ?? 'all'}
            onValueChange={(value) =>
              replaceFilters(router, pathname, {
                ...filters,
                assigneeId: value === 'all' ? undefined : value,
                page: undefined,
              })
            }
          >
            <SelectTrigger aria-label="Assignee filter">
              <SelectValue placeholder="Assignee" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Any assignee</SelectItem>
              <SelectItem value="me">Assigned to me</SelectItem>
              <SelectItem value="unassigned">Unassigned</SelectItem>
              {members.map((member) => (
                <SelectItem key={member.userId} value={member.userId}>
                  {member.user.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={typeof filters.projectId === 'string' ? filters.projectId : 'all'}
            onValueChange={(value) =>
              replaceFilters(router, pathname, {
                ...filters,
                projectId: value === 'all' ? undefined : value,
                page: undefined,
              })
            }
          >
            <SelectTrigger aria-label="Project filter">
              <SelectValue placeholder="Project" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Any project</SelectItem>
              {projects.map((project) => (
                <SelectItem key={project.id} value={project.id}>
                  {project.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={filters.sortBy ?? 'dueDate'}
            onValueChange={(value) =>
              replaceFilters(router, pathname, {
                ...filters,
                sortBy: value as WorkspaceTasksQueryDto['sortBy'],
                page: undefined,
              })
            }
          >
            <SelectTrigger aria-label="Sort tasks">
              <SelectValue placeholder="Sort" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="dueDate">Due date</SelectItem>
              <SelectItem value="priority">Priority</SelectItem>
              <SelectItem value="status">Status</SelectItem>
              <SelectItem value="updatedAt">Updated</SelectItem>
              <SelectItem value="title">Title</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex justify-end">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => {
              setSearchInput('');
              router.replace(pathname);
            }}
          >
            Clear filters
          </Button>
        </div>
      </div>

      {query.isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 8 }).map((_, index) => (
            <div key={index} className="h-16 rounded-xl bg-muted/40 animate-pulse" />
          ))}
        </div>
      ) : query.isError ? (
        <DashboardQueryError title="workspace tasks" onRetry={() => void query.refetch()} />
      ) : tasks.length === 0 ? (
        <DashboardQueryEmpty
          title="No tasks match"
          description="Try clearing a filter or searching a different key."
          icon={<Inbox className="h-5 w-5" />}
          action={
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                setSearchInput('');
                router.replace(pathname);
              }}
            >
              Clear filters
            </Button>
          }
        />
      ) : (
        <div className="rounded-2xl border border-border bg-card divide-y divide-border/60">
          {tasks.map((task) => {
            const due = formatDueDate(task.status === 'DONE' ? null : task.dueDate);
            return (
              <button
                key={task.id}
                type="button"
                onClick={() => setSelectedTask(task)}
                aria-label={`Open task ${task.key ?? ''} ${task.title}`.trim()}
                className="w-full text-left p-4 hover:bg-muted/30 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      {task.key && (
                        <span className="font-mono text-[11px] font-bold text-muted-foreground">
                          {task.key}
                        </span>
                      )}
                      <span className="text-sm font-semibold truncate">{task.title}</span>
                    </div>
                    <p className="text-[11px] text-muted-foreground mt-1">
                      {task.column.board.project.title}
                      {task.assignee ? ` · ${task.assignee.name}` : ' · Unassigned'}
                      {` · ${due.label}`}
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <span className={cn('text-[10px] font-semibold px-2 py-0.5 rounded-full border', TASK_PRIORITY_CONFIG[task.priority].badgeClass)}>
                      {TASK_PRIORITY_CONFIG[task.priority].label}
                    </span>
                    <span className={cn('text-[10px] font-semibold px-2 py-0.5 rounded-full border', TASK_STATUS_CONFIG[task.status].badgeClass)}>
                      {TASK_STATUS_CONFIG[task.status].label}
                    </span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      )}

      {meta && meta.totalPages > 1 && (
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>
            Page {meta.page} of {meta.totalPages} · {meta.total.toLocaleString()} tasks
          </span>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={!meta.hasPreviousPage}
              onClick={() =>
                replaceFilters(router, pathname, { ...filters, page: Math.max(1, (filters.page ?? 1) - 1) })
              }
            >
              Previous
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={!meta.hasNextPage}
              onClick={() =>
                replaceFilters(router, pathname, { ...filters, page: (filters.page ?? 1) + 1 })
              }
            >
              Next
            </Button>
          </div>
        </div>
      )}

      {selectedTask && workspaceId && (
        <TaskDetailSheet
          taskIdOrKey={selectedTask.id}
          open={Boolean(selectedTask)}
          onOpenChange={(open) => {
            if (!open) setSelectedTask(null);
          }}
          workspaceId={workspaceId}
          projectId={selectedTask.column.board.project.id}
          boardId={selectedTask.column.board.id}
          canManage={selectedTask.permissions.canEdit}
          canDelete={selectedTask.permissions.canDelete}
        />
      )}
    </div>
  );
}

function FilterChip({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'px-2.5 py-1 rounded-lg text-xs font-semibold border transition-colors',
        active
          ? 'bg-primary text-primary-foreground border-primary'
          : 'bg-card text-muted-foreground border-border hover:text-foreground',
      )}
    >
      {label}
    </button>
  );
}

function replaceFilters(
  router: ReturnType<typeof useRouter>,
  pathname: string,
  filters: WorkspaceTasksQueryDto,
) {
  const params = workspaceTaskFiltersToSearchParams(filters);
  const query = params.toString();
  router.replace(query ? `${pathname}?${query}` : pathname);
}

function toArray(value: string | string[] | undefined): string[] {
  if (!value) return [];
  return Array.isArray(value) ? value : [value];
}

function toggleValue<T extends string>(current: T[], value: T): T[] {
  return current.includes(value) ? current.filter((item) => item !== value) : [...current, value];
}
