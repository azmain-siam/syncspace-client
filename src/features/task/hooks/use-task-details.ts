import { useQuery } from '@tanstack/react-query';
import { taskApi } from '../api/task.api';
import { taskKeys } from './task-keys';

export function useTaskDetails(taskIdOrKey?: string | null) {
  return useQuery({
    queryKey: taskKeys.detail(taskIdOrKey || ''),
    queryFn: async () => {
      if (!taskIdOrKey) {
        throw new Error('Task ID or Key is required');
      }
      return taskApi.getTask(taskIdOrKey);
    },
    enabled: Boolean(taskIdOrKey),
    staleTime: 1000 * 30, // 30 seconds fresh cache
  });
}
