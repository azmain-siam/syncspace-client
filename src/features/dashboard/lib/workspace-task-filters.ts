import type { TaskPriority, TaskStatus } from '@/types/domain';
import type {
  WorkspaceTasksDueDateFilter,
  WorkspaceTasksQueryDto,
  WorkspaceTasksSortBy,
} from '../types/workspace-tasks.types';

const STATUS_VALUES: TaskStatus[] = ['TODO', 'IN_PROGRESS', 'REVIEW', 'DONE'];
const PRIORITY_VALUES: TaskPriority[] = ['LOW', 'MEDIUM', 'HIGH', 'URGENT'];
const DUE_DATE_VALUES: WorkspaceTasksDueDateFilter[] = [
  'today',
  'overdue',
  'upcoming',
  'this_week',
  'nodate',
  'no_due_date',
];
const SORT_BY_VALUES: WorkspaceTasksSortBy[] = [
  'dueDate',
  'priority',
  'status',
  'createdAt',
  'updatedAt',
  'title',
  'order',
];

function splitCsv(value: string | null): string[] {
  if (!value) return [];
  return value
    .split(',')
    .map((part) => part.trim())
    .filter(Boolean);
}

function asStatusList(value: string | null): TaskStatus[] {
  return splitCsv(value).filter((item): item is TaskStatus =>
    STATUS_VALUES.includes(item as TaskStatus),
  );
}

function asPriorityList(value: string | null): TaskPriority[] {
  return splitCsv(value).filter((item): item is TaskPriority =>
    PRIORITY_VALUES.includes(item as TaskPriority),
  );
}

export function workspaceTaskFiltersToSearchParams(
  filters: WorkspaceTasksQueryDto,
): URLSearchParams {
  const params = new URLSearchParams();

  const status = serializeMaybeList(filters.status);
  if (status) params.set('status', status);

  const priority = serializeMaybeList(filters.priority);
  if (priority) params.set('priority', priority);

  if (filters.assigneeId) params.set('assigneeId', filters.assigneeId);

  const projectId = serializeMaybeList(filters.projectId);
  if (projectId) params.set('projectId', projectId);

  if (filters.sprintId) params.set('sprintId', filters.sprintId);
  if (filters.dueDate) params.set('dueDate', filters.dueDate);
  if (filters.search) params.set('search', filters.search);
  if (filters.sortBy) params.set('sortBy', filters.sortBy);
  if (filters.sortOrder) params.set('sortOrder', filters.sortOrder);
  if (typeof filters.isBacklog === 'boolean') {
    params.set('isBacklog', String(filters.isBacklog));
  }
  if (filters.page && filters.page > 1) params.set('page', String(filters.page));
  if (filters.limit && filters.limit !== 20) params.set('limit', String(filters.limit));

  return params;
}

export function parseWorkspaceTaskFilters(
  searchParams: URLSearchParams,
): WorkspaceTasksQueryDto {
  const status = asStatusList(searchParams.get('status'));
  const priority = asPriorityList(searchParams.get('priority'));
  const dueDateRaw = searchParams.get('dueDate');
  const dueDate = DUE_DATE_VALUES.includes(dueDateRaw as WorkspaceTasksDueDateFilter)
    ? (dueDateRaw as WorkspaceTasksDueDateFilter)
    : undefined;
  const sortByRaw = searchParams.get('sortBy');
  const sortBy = SORT_BY_VALUES.includes(sortByRaw as WorkspaceTasksSortBy)
    ? (sortByRaw as WorkspaceTasksSortBy)
    : undefined;
  const sortOrderRaw = searchParams.get('sortOrder');
  const page = Number(searchParams.get('page') || '1');
  const limit = Number(searchParams.get('limit') || '20');

  const filters: WorkspaceTasksQueryDto = {};

  if (status.length === 1) filters.status = status[0];
  if (status.length > 1) filters.status = status;
  if (priority.length === 1) filters.priority = priority[0];
  if (priority.length > 1) filters.priority = priority;

  const assigneeId = searchParams.get('assigneeId');
  if (assigneeId) filters.assigneeId = assigneeId;

  const projectId = searchParams.get('projectId');
  if (projectId) filters.projectId = projectId.includes(',') ? splitCsv(projectId) : projectId;

  const sprintId = searchParams.get('sprintId');
  if (sprintId) filters.sprintId = sprintId;

  if (dueDate) filters.dueDate = dueDate;

  const search = searchParams.get('search');
  if (search) filters.search = search;

  if (sortBy) filters.sortBy = sortBy;
  if (sortOrderRaw === 'asc' || sortOrderRaw === 'desc') filters.sortOrder = sortOrderRaw;

  const isBacklog = searchParams.get('isBacklog');
  if (isBacklog === 'true') filters.isBacklog = true;
  if (isBacklog === 'false') filters.isBacklog = false;

  if (Number.isFinite(page) && page > 1) filters.page = page;
  if (Number.isFinite(limit) && limit !== 20) filters.limit = limit;

  return filters;
}

export function buildExplorerHref(
  workspaceSlug: string,
  filters: WorkspaceTasksQueryDto,
): string {
  const params = workspaceTaskFiltersToSearchParams(filters);
  const query = params.toString();
  return query
    ? `/workspaces/${workspaceSlug}/tasks?${query}`
    : `/workspaces/${workspaceSlug}/tasks`;
}

function serializeMaybeList(value: string | string[] | undefined): string | undefined {
  if (value == null) return undefined;
  return Array.isArray(value) ? value.join(',') : value;
}
