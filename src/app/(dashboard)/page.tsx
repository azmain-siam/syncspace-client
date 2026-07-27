'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { useMyWorkspaces } from '@/features/workspace/hooks/use-my-workspaces';
import { useWorkspaceStore } from '@/features/workspace/stores/use-workspace-store';

export default function DashboardRootPage() {
  const router = useRouter();
  const { data: workspacesResponse, isLoading } = useMyWorkspaces();
  const activeWorkspaceId = useWorkspaceStore((state) => state.activeWorkspaceId);

  useEffect(() => {
    if (!isLoading) {
      const workspaces = workspacesResponse?.data || [];
      if (workspaces.length === 0) {
        router.replace('/workspaces/create');
      } else if (activeWorkspaceId) {
        router.replace(`/workspaces/${activeWorkspaceId}`);
      } else {
        router.replace(`/workspaces/${workspaces[0].id}`);
      }
    }
  }, [isLoading, workspacesResponse, activeWorkspaceId, router]);

  return (
    <div className="flex h-64 w-full items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-xs font-medium text-muted-foreground">
          Connecting to workspace...
        </p>
      </div>
    </div>
  );
}
