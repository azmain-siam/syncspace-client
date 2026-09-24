import { useQuery } from '@tanstack/react-query';
import { taskApi } from '../api/task.api';
import type { MyTasksParams } from '../types/task.types';

export function useMyTasks(workspaceId?: string, params?: MyTasksParams) {
  return useQuery({
    queryKey: ['workspaces', workspaceId, 'my-tasks', params],
    queryFn: async () => {
      if (!workspaceId) {
        throw new Error('Workspace ID is required');
      }
      return taskApi.getMyTasks(workspaceId, params);
    },
    enabled: Boolean(workspaceId),
  });
}
