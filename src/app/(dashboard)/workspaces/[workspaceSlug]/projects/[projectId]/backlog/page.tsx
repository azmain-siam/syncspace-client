'use client';

import * as React from 'react';
import { use } from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { useCurrentWorkspace } from '@/features/workspace/hooks/use-current-workspace';
import { useProjectDetail } from '@/features/project/hooks/use-project-detail';
import { SprintBacklogView } from '@/features/sprint';

export default function ProjectBacklogPage({
  params,
}: {
  params: Promise<{ workspaceSlug: string; projectId: string }>;
}) {
  const { workspaceSlug, projectId } = use(params);
  const { workspace, isLoading: workspaceLoading } = useCurrentWorkspace(workspaceSlug);

  const workspaceId = workspace?.id || '';
  const { data: projectResponse, isLoading: projectLoading } = useProjectDetail(
    workspaceId,
    projectId,
  );

  const project = projectResponse?.data;
  const isLoading = workspaceLoading || projectLoading;

  if (isLoading) {
    return (
      <div className="space-y-6 max-w-7xl mx-auto py-6">
        <div className="h-6 w-36 rounded-md bg-muted animate-pulse" />
        <div className="h-28 rounded-2xl bg-card border border-border animate-pulse" />
        <div className="h-96 rounded-2xl bg-card border border-border animate-pulse" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto py-2">
      {/* Navigation Breadcrumb */}
      <div>
        <Link
          href={`/workspaces/${workspaceSlug}/projects/${projectId}`}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Back to{' '}
          <span className="text-foreground">{project?.title || 'Project'}</span>
        </Link>
      </div>

      {/* Main Sprint and Backlog Container */}
      <SprintBacklogView
        workspaceId={workspaceId}
        projectId={projectId}
      />
    </div>
  );
}
