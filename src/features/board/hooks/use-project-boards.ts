import { useQuery } from '@tanstack/react-query';
import { boardApi } from '../api/board.api';

export function useProjectBoards(workspaceId?: string, projectId?: string) {
  return useQuery({
    queryKey: ['workspaces', workspaceId, 'projects', projectId, 'boards'],
    queryFn: async () => {
      if (!workspaceId || !projectId) {
        throw new Error('Workspace ID and Project ID are required');
      }
      return boardApi.getProjectBoards(workspaceId, projectId);
    },
    enabled: Boolean(workspaceId && projectId),
  });
}
