'use client';

import * as React from 'react';
import { use, useState, Suspense } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import Link from 'next/link';
import {
  Activity,
  Archive,
  ArrowLeft,
  Calendar,
  Clock,
  FolderKanban,
  Kanban,
  Pencil,
  Settings,
  Flag,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useCurrentWorkspace } from '@/features/workspace/hooks/use-current-workspace';
import { useWorkspacePermissions } from '@/features/workspace/hooks/use-workspace-permissions';
import { ArchiveProjectModal } from '@/features/project/components/archive-project-modal';
import { ProjectDialogModal } from '@/features/project/components/project-dialog-modal';
import { useProjectDetail } from '@/features/project/hooks/use-project-detail';
import { KanbanBoard } from '@/features/board/components';
import { SprintBacklogView } from '@/features/sprint';

type ProjectTabType = 'boards' | 'tasks' | 'activity' | 'settings';

function ProjectDetailsContent({
  params,
}: {
  params: Promise<{ workspaceSlug: string; projectId: string }>;
}) {
  const { workspaceSlug, projectId } = use(params);
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const { workspace, isLoading: workspaceLoading } = useCurrentWorkspace(workspaceSlug);

  const workspaceId = workspace?.id || '';
  const permissions = useWorkspacePermissions(workspaceId);
  const {
    data: projectResponse,
    isLoading: projectLoading,
    isError,
  } = useProjectDetail(workspaceId, projectId);

  const project = projectResponse?.data;

  // URL-driven active tab
  const tabParam = searchParams.get('tab') as ProjectTabType | null;
  const activeTab: ProjectTabType =
    tabParam && ['boards', 'tasks', 'activity', 'settings'].includes(tabParam)
      ? tabParam
      : 'boards';

  const handleTabChange = (tabId: ProjectTabType) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('tab', tabId);
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const [editModalOpen, setEditModalOpen] = useState(false);
  const [archiveModalOpen, setArchiveModalOpen] = useState(false);

  const isLoading = workspaceLoading || projectLoading;

  if (isLoading) {
    return (
      <div className="space-y-6 max-w-7xl mx-auto">
        <div className="h-36 w-full rounded-2xl border border-border bg-card animate-pulse" />
        <div className="h-64 w-full rounded-2xl border border-border bg-card animate-pulse" />
      </div>
    );
  }

  if (isError || !project) {
    return (
      <div className="py-16 text-center rounded-2xl border border-border bg-card space-y-4 max-w-xl mx-auto">
        <FolderKanban className="h-10 w-10 text-muted-foreground mx-auto" />
        <div className="space-y-1">
          <h2 className="text-lg font-bold text-foreground">Project Not Found</h2>
          <p className="text-xs text-muted-foreground">
            The project you requested could not be loaded or may have been archived.
          </p>
        </div>
        <Link href={`/workspaces/${workspaceSlug}/projects`}>
          <Button variant="outline" className="h-10 rounded-lg gap-2">
            <ArrowLeft className="h-4 w-4" /> Back to Projects
          </Button>
        </Link>
      </div>
    );
  }

  const accentColor = project.color || '#4648d4';

  const tabs = [
    { id: 'boards', label: 'Boards', icon: Kanban },
    { id: 'tasks', label: 'Sprints & Backlog', icon: Flag },
    { id: 'activity', label: 'Activity', icon: Activity },
    { id: 'settings', label: 'Settings', icon: Settings },
  ] as const;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Back link */}
      <div>
        <Link
          href={`/workspaces/${workspaceSlug}/projects`}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Back to Projects
        </Link>
      </div>

      {/* Project Details Header Card */}
      <div className="relative rounded-2xl border border-border bg-card p-6 sm:p-8 overflow-hidden space-y-6 shadow-xs">
        {/* Accent Strip */}
        <div
          className="absolute top-0 left-0 right-0 h-1.5"
          style={{ backgroundColor: accentColor }}
        />

        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div className="space-y-2 min-w-0">
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
                {project.title}
              </h1>
              <Badge variant="default">{project.status}</Badge>
              {project.priority && (
                <Badge variant="outline" className="font-bold">
                  {project.priority} PRIORITY
                </Badge>
              )}
            </div>

            <p className="text-xs sm:text-sm text-muted-foreground max-w-2xl">
              {project.description || 'No project description provided.'}
            </p>
          </div>

          {/* Edit / Archive Action Buttons */}
          {(permissions.canEditProject || permissions.canArchiveProject) && (
            <div className="flex items-center gap-2 shrink-0">
              {permissions.canEditProject && (
                <Button
                  variant="outline"
                  onClick={() => setEditModalOpen(true)}
                  className="h-10 rounded-lg gap-2 text-xs font-semibold"
                >
                  <Pencil className="h-3.5 w-3.5" /> Edit
                </Button>
              )}
              {permissions.canArchiveProject && (
                <Button
                  variant="outline"
                  onClick={() => setArchiveModalOpen(true)}
                  className="h-10 rounded-lg gap-2 text-xs font-semibold text-muted-foreground hover:text-foreground"
                  title="Archive Project"
                >
                  <Archive className="h-3.5 w-3.5" /> Archive
                </Button>
              )}
            </div>
          )}
        </div>

        {/* Metadata Footer */}
        <div className="pt-4 border-t border-border/60 flex items-center gap-6 text-xs text-muted-foreground flex-wrap">
          <div className="flex items-center gap-1.5">
            <Calendar className="h-3.5 w-3.5 text-primary" />
            <span>
              Target Due Date:{' '}
              <strong className="text-foreground font-semibold">
                {project.dueDate
                  ? new Date(project.dueDate).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })
                  : 'Not set'}
              </strong>
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5 text-primary" />
            <span>
              Created:{' '}
              <strong className="text-foreground font-semibold">
                {new Date(project.createdAt).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                })}
              </strong>
            </span>
          </div>
        </div>
      </div>

      {/* Navigation Tab Bar */}
      <div className="flex items-center border-b border-border gap-1 sm:gap-2 overflow-x-auto max-w-full">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id)}
              className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2.5 sm:py-3 text-xs sm:text-sm font-semibold border-b-2 transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                isActive
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              <Icon className="h-4 w-4 shrink-0" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab View Content Shell */}
      <div className="pt-2">
        {activeTab === 'boards' && (
          <KanbanBoard workspaceId={workspaceId} projectId={project.id} />
        )}

        {activeTab === 'tasks' && (
          <SprintBacklogView
            workspaceId={workspaceId}
            projectId={project.id}
            canManage={permissions.canManageSprints}
          />
        )}

        {activeTab === 'activity' && (
          <Card className="rounded-2xl border border-dashed border-border bg-card/40 py-16 text-center space-y-3">
            <Activity className="h-10 w-10 text-primary mx-auto opacity-80" />
            <div className="space-y-1 max-w-sm mx-auto">
              <h3 className="font-bold text-foreground text-base">Activity Log Shell</h3>
              <p className="text-xs text-muted-foreground">
                Project audit trail & activity log prepared.
              </p>
            </div>
          </Card>
        )}

        {activeTab === 'settings' && (
          <Card className="rounded-2xl border border-border bg-card p-6 space-y-4 max-w-xl">
            <h3 className="font-bold text-foreground text-base">Project Settings</h3>
            <p className="text-xs text-muted-foreground">
              {permissions.canEditProject
                ? 'Update project attributes or manage project configuration.'
                : 'Project settings and configuration are viewable by workspace members.'}
            </p>
            {permissions.canEditProject && (
              <div className="pt-2 flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => setEditModalOpen(true)}
                  className="h-10 rounded-lg gap-2 text-xs font-semibold"
                >
                  <Pencil className="h-3.5 w-3.5" /> Edit Project Information
                </Button>
              </div>
            )}
          </Card>
        )}
      </div>

      {/* Edit Project Dialog */}
      <ProjectDialogModal
        open={editModalOpen}
        onOpenChange={setEditModalOpen}
        workspaceId={workspaceId}
        projectToEdit={project}
      />

      {/* Archive Confirmation Dialog */}
      <ArchiveProjectModal
        open={archiveModalOpen}
        onOpenChange={setArchiveModalOpen}
        workspaceId={workspaceId}
        project={project}
      />
    </div>
  );
}

export default function ProjectDetailsPage(props: {
  params: Promise<{ workspaceSlug: string; projectId: string }>;
}) {
  return (
    <Suspense
      fallback={
        <div className="space-y-6 max-w-7xl mx-auto">
          <div className="h-36 w-full rounded-2xl border border-border bg-card animate-pulse" />
          <div className="h-64 w-full rounded-2xl border border-border bg-card animate-pulse" />
        </div>
      }
    >
      <ProjectDetailsContent {...props} />
    </Suspense>
  );
}
