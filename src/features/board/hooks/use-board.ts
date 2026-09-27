import { useQuery } from '@tanstack/react-query';
import { boardApi } from '../api/board.api';

export function useBoard(
  workspaceId?: string,
  projectId?: string,
  boardId?: string,
) {
  return useQuery({
    queryKey: ['workspaces', workspaceId, 'projects', projectId, 'boards', boardId],
    queryFn: async () => {
      if (!workspaceId || !projectId || !boardId) {
        throw new Error('Workspace ID, Project ID, and Board ID are required');
      }
      return boardApi.getBoard(workspaceId, projectId, boardId);
    },
    enabled: Boolean(workspaceId && projectId && boardId),
  });
}
