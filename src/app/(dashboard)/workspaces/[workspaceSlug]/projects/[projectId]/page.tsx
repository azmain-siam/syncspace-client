'use client';

import * as React from 'react';
import { use, useState, Suspense } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  FileText,
  Flag,
  FolderKanban,
  Kanban,
  ListTodo,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCurrentWorkspace } from '@/features/workspace/hooks/use-current-workspace';
import { useWorkspacePermissions } from '@/features/workspace/hooks/use-workspace-permissions';
import {
  ProjectHeader,
  ProjectOverviewTab,
  ProjectTasksTab,
} from '@/features/project';
import dynamic from 'next/dynamic';

const ProjectDialogModal = dynamic(
  () =>
    import('@/features/project/components/project-dialog-modal').then(
      (mod) => mod.ProjectDialogModal,
    ),
  { ssr: false },
);

const ArchiveProjectModal = dynamic(
  () =>
    import('@/features/project/components/archive-project-modal').then(
      (mod) => mod.ArchiveProjectModal,
    ),
  { ssr: false },
);

const ProjectStatusUpdateModal = dynamic(
  () =>
    import('@/features/project/components/project-status-update-modal').then(
      (mod) => mod.ProjectStatusUpdateModal,
    ),
  { ssr: false },
);

const ProjectBriefModal = dynamic(
  () =>
    import('@/features/project/components/project-brief-modal').then(
      (mod) => mod.ProjectBriefModal,
    ),
  { ssr: false },
);

import { useProjectDetail } from '@/features/project/hooks/use-project-detail';
import { KanbanBoard } from '@/features/board/components';
import { SprintBacklogView } from '@/features/sprint';

export type ProjectTabType = 'boards' | 'sprints' | 'overview' | 'tasks';

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
  const tabParam = searchParams.get('tab');
  const activeTab: ProjectTabType =
    tabParam === 'sprints'
      ? 'sprints'
      : tabParam === 'overview'
      ? 'overview'
      : tabParam === 'tasks'
      ? 'tasks'
      : 'boards';

  const handleTabChange = (tabId: ProjectTabType) => {
    const nextParams = new URLSearchParams(searchParams.toString());
    if (tabId === 'boards') {
      nextParams.delete('tab');
    } else {
      nextParams.set('tab', tabId);
    }
    const query = nextParams.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
  };

  const [editModalOpen, setEditModalOpen] = useState(false);
  const [archiveModalOpen, setArchiveModalOpen] = useState(false);
  const [statusUpdateModalOpen, setStatusUpdateModalOpen] = useState(false);
  const [briefModalOpen, setBriefModalOpen] = useState(false);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | undefined>(undefined);

  const handleOpenBriefEditor = (templateId?: string) => {
    setSelectedTemplateId(templateId);
    setBriefModalOpen(true);
  };

  const isLoading = workspaceLoading || projectLoading;

  if (isLoading) {
    return (
      <div className="w-full space-y-6">
        {/* Header Banner Skeleton */}
        <div className="h-48 w-full rounded-2xl border border-border/80 bg-card p-6 space-y-4 animate-pulse relative overflow-hidden">
          <div className="h-1.5 w-full bg-muted absolute top-0 left-0" />
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-2xl bg-muted shrink-0" />
            <div className="space-y-2 flex-1">
              <div className="h-6 w-1/3 bg-muted rounded-lg" />
              <div className="h-4 w-1/4 bg-muted rounded-md" />
            </div>
            <div className="h-9 w-28 bg-muted rounded-xl hidden sm:block" />
          </div>
          <div className="h-4 w-1/2 bg-muted rounded" />
          <div className="pt-4 border-t border-border/40 flex justify-between items-center">
            <div className="h-5 w-44 bg-muted rounded-full" />
            <div className="h-5 w-32 bg-muted rounded-full" />
          </div>
        </div>

        {/* Tab Navigation Skeleton */}
        <div className="flex items-center border-b border-border gap-2 pb-px">
          <div className="h-9 w-24 bg-muted/60 rounded-t-lg animate-pulse" />
          <div className="h-9 w-36 bg-muted/40 rounded-t-lg animate-pulse" />
          <div className="h-9 w-32 bg-muted/40 rounded-t-lg animate-pulse" />
          <div className="h-9 w-24 bg-muted/40 rounded-t-lg animate-pulse" />
        </div>

        {/* Content Shell Skeleton */}
        <div className="h-72 w-full rounded-2xl border border-border bg-card animate-pulse" />
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
          <Button variant="outline" className="h-10 rounded-lg gap-2 cursor-pointer">
            <ArrowLeft className="h-4 w-4" /> Back to Projects
          </Button>
        </Link>
      </div>
    );
  }

  const tabs = [
    {
      id: 'boards',
      label: 'Boards',
      icon: Kanban,
      count: project.boards?.length,
    },
    {
      id: 'sprints',
      label: 'Sprints & Backlog',
      icon: Flag,
      count: project.sprints?.length,
    },
    {
      id: 'overview',
      label: 'Overview & Brief',
      icon: FileText,
      count: undefined,
    },
    {
      id: 'tasks',
      label: 'Task List',
      icon: ListTodo,
      count: undefined,
    },
  ] as const;

  return (
    <div className="w-full space-y-6">
      {/* 1. Enterprise Project Hero Banner */}
      <ProjectHeader
        project={project}
        workspaceSlug={workspaceSlug}
        canEdit={permissions.canEditProject}
        canArchive={permissions.canArchiveProject}
        onEdit={() => setEditModalOpen(true)}
        onArchive={() => setArchiveModalOpen(true)}
        onPostStatusUpdate={() => setStatusUpdateModalOpen(true)}
      />

      {/* 2. Navigation Tab Bar */}
      <div className="flex items-center border-b border-border gap-1 sm:gap-2 overflow-x-auto max-w-full">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id)}
              className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2.5 sm:py-3 text-xs sm:text-sm font-semibold border-b-2 transition-all cursor-pointer whitespace-nowrap shrink-0 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring ${
                isActive
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              <Icon className="h-4 w-4 shrink-0" />
              <span>{tab.label}</span>
              {tab.count !== undefined && (
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                    isActive
                      ? 'bg-primary/15 text-primary'
                      : 'bg-muted text-muted-foreground'
                  }`}
                >
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* 3. Tab View Content Shell */}
      <div className="pt-1">
        {activeTab === 'boards' && (
          <KanbanBoard workspaceId={workspaceId} projectId={project.id} />
        )}

        {activeTab === 'sprints' && (
          <SprintBacklogView
            workspaceId={workspaceId}
            projectId={project.id}
            canManage={permissions.canManageSprints}
          />
        )}

        {activeTab === 'overview' && (
          <ProjectOverviewTab
            project={project}
            workspaceId={workspaceId}
            canManage={permissions.canEditProject}
            onPostStatusUpdate={() => setStatusUpdateModalOpen(true)}
            onEditProject={() => setEditModalOpen(true)}
            onEditBrief={handleOpenBriefEditor}
          />
        )}

        {activeTab === 'tasks' && (
          <ProjectTasksTab
            project={project}
            workspaceId={workspaceId}
            canManage={!permissions.isGuest}
          />
        )}
      </div>

      {/* Edit Project Dialog */}
      {editModalOpen && (
        <ProjectDialogModal
          open={editModalOpen}
          onOpenChange={setEditModalOpen}
          workspaceId={workspaceId}
          projectToEdit={project}
        />
      )}

      {/* Archive Confirmation Dialog */}
      {archiveModalOpen && (
        <ArchiveProjectModal
          open={archiveModalOpen}
          onOpenChange={setArchiveModalOpen}
          workspaceId={workspaceId}
          project={project}
        />
      )}

      {/* Status Update Modal */}
      {statusUpdateModalOpen && (
        <ProjectStatusUpdateModal
          open={statusUpdateModalOpen}
          onOpenChange={setStatusUpdateModalOpen}
          workspaceId={workspaceId}
          projectId={project.id}
          currentHealth={project.health}
          projectTitle={project.title}
        />
      )}

      {/* Project Brief Specification Modal */}
      {briefModalOpen && (
        <ProjectBriefModal
          open={briefModalOpen}
          onOpenChange={setBriefModalOpen}
          workspaceId={workspaceId}
          projectId={project.id}
          initialBrief={project.brief}
          initialTemplateId={selectedTemplateId}
          projectTitle={project.title}
        />
      )}
    </div>
  );
}

export default function ProjectDetailsPage(props: {
  params: Promise<{ workspaceSlug: string; projectId: string }>;
}) {
  return (
    <Suspense
      fallback={
        <div className="w-full space-y-6">
          <div className="h-48 w-full rounded-2xl border border-border/80 bg-card p-6 space-y-4 animate-pulse relative overflow-hidden">
            <div className="h-1.5 w-full bg-muted absolute top-0 left-0" />
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-2xl bg-muted shrink-0" />
              <div className="space-y-2 flex-1">
                <div className="h-6 w-1/3 bg-muted rounded-lg" />
                <div className="h-4 w-1/4 bg-muted rounded-md" />
              </div>
              <div className="h-9 w-28 bg-muted rounded-xl hidden sm:block" />
            </div>
            <div className="h-4 w-1/2 bg-muted rounded" />
            <div className="pt-4 border-t border-border/40 flex justify-between items-center">
              <div className="h-5 w-44 bg-muted rounded-full" />
              <div className="h-5 w-32 bg-muted rounded-full" />
            </div>
          </div>
          <div className="flex items-center border-b border-border gap-2 pb-px">
            <div className="h-9 w-24 bg-muted/60 rounded-t-lg animate-pulse" />
            <div className="h-9 w-36 bg-muted/40 rounded-t-lg animate-pulse" />
            <div className="h-9 w-32 bg-muted/40 rounded-t-lg animate-pulse" />
            <div className="h-9 w-24 bg-muted/40 rounded-t-lg animate-pulse" />
          </div>
          <div className="h-72 w-full rounded-2xl border border-border bg-card animate-pulse" />
        </div>
      }
    >
      <ProjectDetailsContent {...props} />
    </Suspense>
  );
}

