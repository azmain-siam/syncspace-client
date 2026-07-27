import { useQuery } from '@tanstack/react-query';
import { useEffect } from 'react';
import type { ApiResponse, Workspace } from '@/types/domain';
import { workspaceApi } from '../api/workspace.api';
import { useWorkspaceStore } from '../stores/use-workspace-store';

export function useMyWorkspaces() {
  const activeWorkspaceId = useWorkspaceStore((state) => state.activeWorkspaceId);
  const setActiveWorkspace = useWorkspaceStore((state) => state.setActiveWorkspace);

  const query = useQuery<ApiResponse<Workspace[]>>({
    queryKey: ['workspaces', 'my'],
    queryFn: () => workspaceApi.getMyWorkspaces(),
    staleTime: 1000 * 60 * 5, // 5 minutes cache
  });

  useEffect(() => {
    if (query.data?.data && query.data.data.length > 0) {
      const workspaces = query.data.data;
      const found = workspaces.find((w) => w.id === activeWorkspaceId);
      if (found) {
        setActiveWorkspace(found);
      } else {
        setActiveWorkspace(workspaces[0]);
      }
    }
  }, [query.data, activeWorkspaceId, setActiveWorkspace]);

  return query;
}
