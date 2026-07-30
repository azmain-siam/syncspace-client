import { useEffect, useMemo } from 'react';
import type { Workspace } from '@/types/domain';
import { useMyWorkspaces } from './use-my-workspaces';
import { useWorkspaceStore } from '../stores/use-workspace-store';

export function useCurrentWorkspace(workspaceSlug?: string) {
  const { data: workspacesResponse, isLoading, isError } = useMyWorkspaces();
  const activeWorkspace = useWorkspaceStore((state) => state.activeWorkspace);
  const setActiveWorkspace = useWorkspaceStore((state) => state.setActiveWorkspace);

  const workspaces = useMemo(() => workspacesResponse?.data || [], [workspacesResponse]);

  const currentWorkspace = useMemo(() => {
    if (!workspaceSlug) {
      return activeWorkspace || workspaces[0] || null;
    }
    return (
      workspaces.find(
        (w) => w.slug === workspaceSlug || w.id === workspaceSlug,
      ) || activeWorkspace || workspaces[0] || null
    );
  }, [workspaceSlug, workspaces, activeWorkspace]);

  useEffect(() => {
    if (currentWorkspace && currentWorkspace.id !== activeWorkspace?.id) {
      setActiveWorkspace(currentWorkspace);
    }
  }, [currentWorkspace, activeWorkspace, setActiveWorkspace]);

  return {
    workspace: currentWorkspace as Workspace | null,
    workspaces,
    isLoading,
    isError,
  };
}
