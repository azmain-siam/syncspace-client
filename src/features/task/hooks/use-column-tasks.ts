import { useQuery } from '@tanstack/react-query';
import { taskApi } from '../api/task.api';
import { columnKeys } from './task-keys';
import type { ColumnTasksParams } from '../types/task.types';

export function useColumnTasks(columnId?: string, params?: ColumnTasksParams) {
  return useQuery({
    queryKey: columnKeys.tasks(columnId || '', params),
    queryFn: async () => {
      if (!columnId) {
        throw new Error('Column ID is required');
      }
      return taskApi.getColumnTasks(columnId, params);
    },
    enabled: Boolean(columnId),
  });
}
