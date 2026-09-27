import type { ColumnTasksParams, MyTasksParams } from '../types/task.types';

export const taskKeys = {
  all: ['tasks'] as const,
  lists: () => [...taskKeys.all, 'list'] as const,
  detail: (taskIdOrKey: string) => [...taskKeys.all, taskIdOrKey] as const,
  links: (taskId: string) => [...taskKeys.detail(taskId), 'links'] as const,
  attachments: (taskId: string) => [...taskKeys.detail(taskId), 'attachments'] as const,
  checklists: (taskId: string) => [...taskKeys.detail(taskId), 'checklists'] as const,
  myTasks: (workspaceId: string, params?: MyTasksParams) =>
    ['workspaces', workspaceId, 'my-tasks', params] as const,
};

export const columnKeys = {
  all: ['columns'] as const,
  tasks: (columnId: string, params?: ColumnTasksParams) =>
    [...columnKeys.all, columnId, 'tasks', params] as const,
  columnTasks: (columnId: string) =>
    [...columnKeys.all, columnId, 'tasks'] as const,
};
