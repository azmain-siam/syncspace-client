import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Workspace } from '@/types/domain';

interface WorkspaceState {
  activeWorkspaceId: string | null;
  activeWorkspace: Workspace | null;
  setActiveWorkspace: (workspace: Workspace) => void;
  clearWorkspace: () => void;
}

export const useWorkspaceStore = create<WorkspaceState>()(
  persist(
    (set) => ({
      activeWorkspaceId: null,
      activeWorkspace: null,
      setActiveWorkspace: (workspace) =>
        set({
          activeWorkspaceId: workspace.id,
          activeWorkspace: workspace,
        }),
      clearWorkspace: () =>
        set({
          activeWorkspaceId: null,
          activeWorkspace: null,
        }),
    }),
    {
      name: 'syncspace-workspace-storage',
      partialize: (state) => ({
        activeWorkspaceId: state.activeWorkspaceId,
        activeWorkspace: state.activeWorkspace,
      }),
    },
  ),
);
