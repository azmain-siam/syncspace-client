'use client';

import * as React from 'react';
import { use, useState } from 'react';
import { Filter, FolderKanban, Plus, RefreshCw, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useCurrentWorkspace } from '@/features/workspace/hooks/use-current-workspace';
import { ArchiveProjectModal } from '@/features/project/components/archive-project-modal';
import { ProjectCard } from '@/features/project/components/project-card';
import { ProjectDialogModal } from '@/features/project/components/project-dialog-modal';
import { useWorkspaceProjects } from '@/features/project/hooks/use-workspace-projects';
import type { Project } from '@/types/domain';
import { ProjectPriority, ProjectStatus } from '@/types/domain';

export default function WorkspaceProjectsPage({
  params,
}: {
  params: Promise<{ workspaceSlug: string }>;
}) {
  const { workspaceSlug } = use(params);
  const { workspace, isLoading: workspaceLoading } = useCurrentWorkspace(workspaceSlug);

  const workspaceId = workspace?.id || '';
  const {
    data: projectsResponse,
    isLoading: projectsLoading,
    isError,
    refetch,
  } = useWorkspaceProjects(workspaceId);

  const [searchQuery, setSearchQuery] = useState('');
  const [priorityFilter, setPriorityFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [projectToEdit, setProjectToEdit] = useState<Project | null>(null);
  const [projectToArchive, setProjectToArchive] = useState<Project | null>(null);

  const projects = projectsResponse?.data || [];

  // Filter projects by search, priority, and status
  const filteredProjects = projects.filter((p) => {
    const matchesSearch =
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.description && p.description.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesPriority =
      priorityFilter === 'ALL' || p.priority === priorityFilter;

    const matchesStatus =
      statusFilter === 'ALL' || p.status === statusFilter;

    return matchesSearch && matchesPriority && matchesStatus;
  });

  const handleEdit = (project: Project) => {
    setProjectToEdit(project);
  };

  const handleArchive = (project: Project) => {
    setProjectToArchive(project);
  };

  const isLoading = workspaceLoading || projectsLoading;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-extrabold tracking-tight text-foreground flex items-center gap-2">
            <FolderKanban className="h-6 w-6 text-primary" /> Projects
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Manage and track all collaborative projects in{' '}
            <strong className="text-foreground">{workspace?.name || 'this workspace'}</strong>.
          </p>
        </div>

        <Button
          onClick={() => {
            setProjectToEdit(null);
            setCreateModalOpen(true);
          }}
          className="h-11 rounded-lg font-semibold shadow-xs gap-2 shrink-0"
        >
          <Plus className="h-4 w-4" /> New Project
        </Button>
      </div>

      {/* Filter & Search Toolbar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3 rounded-2xl border border-border bg-card">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-3.5 h-4 w-4 text-muted-foreground/70" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search projects by title or description..."
            className="pl-10 h-11 rounded-lg bg-background border-border/80"
          />
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Priority Select */}
          <div className="flex items-center gap-1.5 px-3 h-11 rounded-lg border border-border/80 bg-background text-xs font-semibold">
            <Filter className="h-3.5 w-3.5 text-muted-foreground" />
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="bg-transparent focus:outline-none text-xs font-medium cursor-pointer"
            >
              <option value="ALL">All Priorities</option>
              <option value={ProjectPriority.LOW}>Low</option>
              <option value={ProjectPriority.MEDIUM}>Medium</option>
              <option value={ProjectPriority.HIGH}>High</option>
              <option value={ProjectPriority.CRITICAL}>Critical</option>
            </select>
          </div>

          {/* Status Select */}
          <div className="flex items-center gap-1.5 px-3 h-11 rounded-lg border border-border/80 bg-background text-xs font-semibold">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-transparent focus:outline-none text-xs font-medium cursor-pointer"
            >
              <option value="ALL">All Statuses</option>
              <option value={ProjectStatus.PLANNING}>Planning</option>
              <option value={ProjectStatus.ACTIVE}>Active</option>
              <option value={ProjectStatus.ON_HOLD}>On Hold</option>
              <option value={ProjectStatus.COMPLETED}>Completed</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Stream Content */}
      {isLoading ? (
        // Skeleton Loader Grid
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="h-44 rounded-2xl border border-border bg-card animate-pulse"
            />
          ))}
        </div>
      ) : isError ? (
        // Error State
        <div className="py-16 text-center rounded-2xl border border-border bg-card space-y-4">
          <p className="text-sm font-semibold text-danger">
            Failed to load projects for this workspace.
          </p>
          <Button onClick={() => refetch()} variant="outline" className="gap-2 rounded-lg">
            <RefreshCw className="h-4 w-4" /> Retry
          </Button>
        </div>
      ) : filteredProjects.length === 0 ? (
        // Empty State
        <div className="py-16 text-center rounded-2xl border border-dashed border-border bg-card/50 space-y-4">
          <div className="h-12 w-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mx-auto">
            <FolderKanban className="h-6 w-6" />
          </div>
          <div className="space-y-1 max-w-sm mx-auto">
            <h3 className="font-bold text-foreground text-base">No Projects Found</h3>
            <p className="text-xs text-muted-foreground">
              {searchQuery || priorityFilter !== 'ALL' || statusFilter !== 'ALL'
                ? 'No projects match your search or filter criteria.'
                : 'Get started by creating your first project in this workspace.'}
            </p>
          </div>
          {!searchQuery && priorityFilter === 'ALL' && statusFilter === 'ALL' && (
            <Button
              onClick={() => {
                setProjectToEdit(null);
                setCreateModalOpen(true);
              }}
              className="h-10 rounded-lg gap-2 font-semibold"
            >
              <Plus className="h-4 w-4" /> Create Project
            </Button>
          )}
        </div>
      ) : (
        // Projects Grid
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredProjects.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              workspaceSlug={workspaceSlug}
              onEdit={handleEdit}
              onArchive={handleArchive}
            />
          ))}
        </div>
      )}

      {/* Create / Edit Project Modal */}
      <ProjectDialogModal
        open={createModalOpen || Boolean(projectToEdit)}
        onOpenChange={(open) => {
          if (!open) {
            setCreateModalOpen(false);
            setProjectToEdit(null);
          }
        }}
        workspaceId={workspaceId}
        projectToEdit={projectToEdit}
      />

      {/* Archive Confirmation Modal */}
      <ArchiveProjectModal
        open={Boolean(projectToArchive)}
        onOpenChange={(open) => {
          if (!open) setProjectToArchive(null);
        }}
        workspaceId={workspaceId}
        project={projectToArchive}
      />
    </div>
  );
}
