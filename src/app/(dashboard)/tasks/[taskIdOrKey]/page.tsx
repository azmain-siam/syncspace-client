'use client';

import * as React from 'react';
import { use, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { AlertCircle, ArrowLeft, CheckSquare, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { taskApi } from '@/features/task/api/task.api';
import { useMyWorkspaces } from '@/features/workspace/hooks/use-my-workspaces';
import { useWorkspaceStore } from '@/features/workspace/stores/use-workspace-store';

interface TaskResolverPageProps {
  params: Promise<{ taskIdOrKey: string }>;
}

export default function TaskResolverPage({ params }: TaskResolverPageProps) {
  const { taskIdOrKey } = use(params);
  const router = useRouter();

  // 1. Fetch Task Details (supports UUID or key like SYNC-12)
  const {
    data: taskResponse,
    isLoading: isTaskLoading,
    isError: isTaskError,
    error: taskError,
  } = useQuery({
    queryKey: ['tasks', 'resolve', taskIdOrKey],
    queryFn: () => taskApi.getTask(taskIdOrKey),
    enabled: Boolean(taskIdOrKey),
    retry: 1,
    staleTime: 1000 * 30,
  });

  // 2. Fetch User Workspaces
  const { data: workspacesResponse, isLoading: isWorkspacesLoading } = useMyWorkspaces();
  const activeWorkspace = useWorkspaceStore((state) => state.activeWorkspace);
  const setActiveWorkspace = useWorkspaceStore((state) => state.setActiveWorkspace);

  const task = taskResponse?.data;
  const workspaces = React.useMemo(() => workspacesResponse?.data || [], [workspacesResponse?.data]);

  // 3. Resolve destination and redirect once loaded
  useEffect(() => {
    if (!task) return;

    // Check project association
    const projectId =
      task.column?.board?.project?.id ||
      (task.column?.board as { projectId?: string } | undefined)?.projectId;

    if (!projectId) return;

    // Find matching workspace
    const workspaceId =
      task.column?.board?.project?.workspaceId ||
      activeWorkspace?.id;

    const matchedWorkspace =
      workspaces.find((w) => w.id === workspaceId) ||
      workspaces.find((w) => w.id === activeWorkspace?.id) ||
      workspaces[0];

    const targetSlug = matchedWorkspace?.slug || matchedWorkspace?.id || activeWorkspace?.slug;
    if (!targetSlug) return;

    // Synchronize active workspace if needed
    if (matchedWorkspace && activeWorkspace?.id !== matchedWorkspace.id) {
      setActiveWorkspace(matchedWorkspace);
    }

    const boardId = task.column?.boardId || task.column?.board?.id;
    const isBacklog = task.isBacklog || !task.columnId;

    const queryParams = new URLSearchParams();
    queryParams.set('task', task.key || task.id);

    if (isBacklog) {
      queryParams.set('tab', 'tasks');
    } else {
      queryParams.set('tab', 'boards');
      if (boardId) {
        queryParams.set('board', boardId);
      }
    }

    router.replace(
      `/workspaces/${targetSlug}/projects/${projectId}?${queryParams.toString()}`,
    );
  }, [task, workspaces, activeWorkspace, setActiveWorkspace, router]);

  const isLoading = isTaskLoading || isWorkspacesLoading;

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] w-full flex-col items-center justify-center space-y-4">
        <div className="relative flex items-center justify-center">
          <div className="h-14 w-14 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center">
            <CheckSquare className="h-7 w-7 text-primary animate-pulse" />
          </div>
          <Loader2 className="absolute -bottom-1 -right-1 h-5 w-5 animate-spin text-primary" />
        </div>
        <div className="text-center space-y-1">
          <h2 className="text-base font-bold text-foreground">Locating Task</h2>
          <p className="text-xs text-muted-foreground">
            Resolving project and board context for {taskIdOrKey}...
          </p>
        </div>
      </div>
    );
  }

  if (isTaskError || !task) {
    const errorMsg =
      (taskError as { response?: { data?: { message?: string } } })?.response?.data
        ?.message || 'The requested task could not be found or you do not have permission to view it.';

    return (
      <div className="flex min-h-[60vh] w-full flex-col items-center justify-center p-4">
        <div className="max-w-md w-full rounded-2xl border border-border bg-card p-6 sm:p-8 text-center space-y-4 shadow-sm">
          <div className="h-12 w-12 rounded-full bg-danger/10 text-danger flex items-center justify-center mx-auto">
            <AlertCircle className="h-6 w-6" />
          </div>
          <div className="space-y-1.5">
            <h1 className="text-lg font-bold text-foreground">Task Not Found</h1>
            <p className="text-xs text-muted-foreground leading-relaxed">
              {errorMsg}
            </p>
          </div>
          <div className="pt-2 flex flex-col sm:flex-row gap-2.5 justify-center">
            <Link href="/dashboard">
              <Button variant="default" className="w-full sm:w-auto h-10 text-xs font-semibold rounded-lg gap-2">
                <ArrowLeft className="h-3.5 w-3.5" /> Return to Dashboard
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-[60vh] w-full flex-col items-center justify-center space-y-3">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
      <p className="text-xs text-muted-foreground">Redirecting to task...</p>
    </div>
  );
}
