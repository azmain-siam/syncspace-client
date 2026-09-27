'use client';

import * as React from 'react';
import { use, useMemo, useState } from 'react';
import dynamic from 'next/dynamic';
import { FolderKanban, Plus, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useCurrentWorkspace } from '@/features/workspace/hooks/use-current-workspace';
import { useWorkspacePermissions } from '@/features/workspace/hooks/use-workspace-permissions';
import { useWorkspaceProjects } from '@/features/project/hooks/use-workspace-projects';
import {
  ProjectCard,
  ProjectPortfolioStats,
  ProjectSortOption,
  ProjectStatusTab,
  ProjectTableView,
  ProjectToolbar,
} from '@/features/project';
import type { Project } from '@/types/domain';
import { ProjectHealth, ProjectPriority, ProjectStatus } from '@/types/domain';

const ProjectDialogModal = dynamic(
  () => import('@/features/project/components/project-dialog-modal').then((mod) => mod.ProjectDialogModal),
  { ssr: false },
);

const ArchiveProjectModal = dynamic(
  () => import('@/features/project/components/archive-project-modal').then((mod) => mod.ArchiveProjectModal),
  { ssr: false },
);

const STORAGE_VIEW_KEY = 'syncspace:projects-view-mode';

const PRIORITY_ORDER: Record<ProjectPriority, number> = {
  [ProjectPriority.CRITICAL]: 4,
  [ProjectPriority.URGENT]: 3,
  [ProjectPriority.HIGH]: 2,
  [ProjectPriority.MEDIUM]: 1,
  [ProjectPriority.LOW]: 0,
};

export default function WorkspaceProjectsPage({
  params,
}: {
  params: Promise<{ workspaceSlug: string }>;
}) {
  const { workspaceSlug } = use(params);
  const { workspace, isLoading: workspaceLoading } = useCurrentWorkspace(workspaceSlug);

  const workspaceId = workspace?.id || '';
  const permissions = useWorkspacePermissions(workspaceId);
  const {
    data: projectsResponse,
    isLoading: projectsLoading,
    isError,
    refetch,
  } = useWorkspaceProjects(workspaceId);

  // Filter & Control States
  const [searchQuery, setSearchQuery] = useState('');
  const [statusTab, setStatusTab] = useState<ProjectStatusTab>('ALL');
  const [priorityFilter, setPriorityFilter] = useState<string>('ALL');
  const [healthFilter, setHealthFilter] = useState<string>('ALL');
  const [sortBy, setSortBy] = useState<ProjectSortOption>('updatedAt');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem(STORAGE_VIEW_KEY);
        if (saved === 'grid' || saved === 'table') {
          return saved;
        }
      } catch {
        // Ignore
      }
    }
    return 'grid';
  });

  // Modal States
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [projectToEdit, setProjectToEdit] = useState<Project | null>(null);
  const [projectToArchive, setProjectToArchive] = useState<Project | null>(null);

  const handleViewModeChange = (mode: 'grid' | 'table') => {
    setViewMode(mode);
    try {
      localStorage.setItem(STORAGE_VIEW_KEY, mode);
    } catch {
      // Ignore
    }
  };

  const rawProjects = useMemo(() => projectsResponse?.data || [], [projectsResponse?.data]);

  // Live status tab counts
  const statusCounts = useMemo(() => {
    return {
      all: rawProjects.length,
      active: rawProjects.filter((p) => p.status === ProjectStatus.ACTIVE).length,
      archived: rawProjects.filter((p) => p.status === ProjectStatus.ARCHIVED).length,
    };
  }, [rawProjects]);

  // Multi-dimensional Filtering
  const filteredProjects = useMemo(() => {
    return rawProjects.filter((p) => {
      // 1. Status Tab filter
      if (statusTab === 'ACTIVE' && p.status !== ProjectStatus.ACTIVE) {
        return false;
      }
      if (statusTab === 'ARCHIVED' && p.status !== ProjectStatus.ARCHIVED) {
        return false;
      }

      // 2. Search query filter (title, key, description, brief)
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const matchesTitle = p.title.toLowerCase().includes(query);
        const matchesKey = Boolean(p.key && p.key.toLowerCase().includes(query));
        const matchesDesc = Boolean(p.description && p.description.toLowerCase().includes(query));
        const matchesBrief = Boolean(p.brief && p.brief.toLowerCase().includes(query));

        if (!matchesTitle && !matchesKey && !matchesDesc && !matchesBrief) {
          return false;
        }
      }

      // 3. Priority filter
      if (priorityFilter !== 'ALL' && p.priority !== priorityFilter) {
        return false;
      }

      // 4. Health filter
      if (healthFilter !== 'ALL') {
        if (healthFilter === ProjectHealth.ON_TRACK) {
          if (p.health && p.health !== ProjectHealth.ON_TRACK) {
            return false;
          }
        } else if (p.health !== healthFilter) {
          return false;
        }
      }

      return true;
    });
  }, [rawProjects, statusTab, searchQuery, priorityFilter, healthFilter]);

  // Sorting
  const sortedProjects = useMemo(() => {
    return [...filteredProjects].sort((a, b) => {
      switch (sortBy) {
        case 'updatedAt':
          return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();

        case 'dueDate': {
          if (!a.dueDate && !b.dueDate) return 0;
          if (!a.dueDate) return 1; // Put projects without due date at the end
          if (!b.dueDate) return -1;
          return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
        }

        case 'title':
          return a.title.localeCompare(b.title);

        case 'priority': {
          const weightA = a.priority ? PRIORITY_ORDER[a.priority] ?? -1 : -1;
          const weightB = b.priority ? PRIORITY_ORDER[b.priority] ?? -1 : -1;
          return weightB - weightA;
        }

        default:
          return 0;
      }
    });
  }, [filteredProjects, sortBy]);

  const hasActiveFilters = Boolean(
    searchQuery.trim() ||
      priorityFilter !== 'ALL' ||
      healthFilter !== 'ALL' ||
      statusTab !== 'ALL',
  );

  const handleClearFilters = () => {
    setSearchQuery('');
    setPriorityFilter('ALL');
    setHealthFilter('ALL');
    setStatusTab('ALL');
  };

  const handleEdit = (project: Project) => {
    setProjectToEdit(project);
  };

  const handleArchive = (project: Project) => {
    setProjectToArchive(project);
  };

  const isLoading = workspaceLoading || projectsLoading;

  return (
    <div className="w-full space-y-6 pb-12">
      {/* 1. Page Header & Primary Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-extrabold tracking-tight text-foreground flex items-center gap-2.5">
              <FolderKanban className="h-6 w-6 text-primary" />
              <span>Projects</span>
            </h1>
            {!isLoading && rawProjects.length > 0 && (
              <Badge variant="secondary" className="font-semibold text-xs rounded-full px-2.5 py-0.5">
                {rawProjects.length}
              </Badge>
            )}
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Manage, align, and track initiatives across{' '}
            <strong className="text-foreground">{workspace?.name || 'this workspace'}</strong>.
          </p>
        </div>

        {permissions.canCreateProject && (
          <Button
            onClick={() => {
              setProjectToEdit(null);
              setCreateModalOpen(true);
            }}
            className="h-10 rounded-xl font-semibold shadow-xs gap-2 shrink-0 cursor-pointer"
          >
            <Plus className="h-4 w-4" /> New Project
          </Button>
        )}
      </div>

      {/* 2. Portfolio Health & Telemetry Strip */}
      {!isLoading && rawProjects.length > 0 && (
        <ProjectPortfolioStats
          projects={rawProjects}
          onSelectHealthFilter={(health) => {
            setHealthFilter(health);
          }}
          onSelectStatusTab={(tab) => {
            setStatusTab(tab);
          }}
        />
      )}

      {/* 3. Search, Filter, Sort & View-Mode Toolbar */}
      <ProjectToolbar
        statusTab={statusTab}
        onStatusTabChange={setStatusTab}
        statusCounts={statusCounts}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        priorityFilter={priorityFilter}
        onPriorityChange={setPriorityFilter}
        healthFilter={healthFilter}
        onHealthChange={setHealthFilter}
        sortBy={sortBy}
        onSortChange={setSortBy}
        viewMode={viewMode}
        onViewModeChange={handleViewModeChange}
        hasActiveFilters={hasActiveFilters}
        onClearFilters={handleClearFilters}
        totalCount={rawProjects.length}
        filteredCount={sortedProjects.length}
      />

      {/* 4. Main Dynamic Stream Content */}
      {isLoading ? (
        viewMode === 'grid' ? (
          // Grid Skeleton
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="h-56 rounded-2xl border border-border/80 bg-card p-5 space-y-4 animate-pulse relative overflow-hidden"
              >
                <div className="h-1 w-full bg-muted absolute top-0 left-0" />
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-muted shrink-0" />
                  <div className="space-y-1.5 flex-1">
                    <div className="h-4 w-3/4 bg-muted rounded" />
                    <div className="h-3 w-1/3 bg-muted rounded" />
                  </div>
                </div>
                <div className="flex gap-2">
                  <div className="h-5 w-16 bg-muted rounded-full" />
                  <div className="h-5 w-14 bg-muted rounded-full" />
                </div>
                <div className="space-y-2">
                  <div className="h-3 w-full bg-muted rounded" />
                  <div className="h-3 w-4/5 bg-muted rounded" />
                </div>
                <div className="pt-3 border-t border-border/40 flex items-center justify-between">
                  <div className="h-5 w-24 bg-muted rounded" />
                  <div className="h-4 w-16 bg-muted rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          // Table Skeleton
          <div className="rounded-2xl border border-border/80 bg-card overflow-hidden p-4 space-y-3 animate-pulse">
            <div className="h-9 w-full bg-muted/50 rounded-lg" />
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-14 w-full bg-muted/30 rounded-lg" />
            ))}
          </div>
        )
      ) : isError ? (
        // Error State
        <div className="py-16 text-center rounded-2xl border border-border bg-card space-y-4 shadow-xs">
          <p className="text-sm font-semibold text-destructive">
            Failed to load projects for this workspace.
          </p>
          <Button
            onClick={() => refetch()}
            variant="outline"
            className="gap-2 rounded-xl cursor-pointer"
          >
            <RefreshCw className="h-4 w-4" /> Retry Connection
          </Button>
        </div>
      ) : sortedProjects.length === 0 ? (
        // Empty State
        <div className="py-16 text-center rounded-2xl border border-dashed border-border bg-card/50 space-y-4">
          <div className="h-12 w-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mx-auto shadow-inner">
            <FolderKanban className="h-6 w-6" />
          </div>
          <div className="space-y-1.5 max-w-sm mx-auto px-4">
            <h3 className="font-bold text-foreground text-base">
              {hasActiveFilters ? 'No matching projects found' : 'No projects yet'}
            </h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              {hasActiveFilters
                ? 'Try adjusting your search query, priority, health, or status filters.'
                : 'Get started by creating your first collaborative project in this workspace.'}
            </p>
          </div>

          {hasActiveFilters ? (
            <Button
              onClick={handleClearFilters}
              variant="outline"
              size="sm"
              className="rounded-xl font-medium cursor-pointer"
            >
              Reset All Filters
            </Button>
          ) : (
            permissions.canCreateProject && (
              <Button
                onClick={() => {
                  setProjectToEdit(null);
                  setCreateModalOpen(true);
                }}
                className="h-10 rounded-xl gap-2 font-semibold cursor-pointer shadow-xs"
              >
                <Plus className="h-4 w-4" /> Create First Project
              </Button>
            )
          )}
        </div>
      ) : viewMode === 'grid' ? (
        // Grid View
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {sortedProjects.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              workspaceSlug={workspaceSlug}
              canEdit={permissions.canEditProject}
              canArchive={permissions.canArchiveProject}
              onEdit={handleEdit}
              onArchive={handleArchive}
            />
          ))}
        </div>
      ) : (
        // Enterprise Table View
        <ProjectTableView
          projects={sortedProjects}
          workspaceSlug={workspaceSlug}
          canEdit={permissions.canEditProject}
          canArchive={permissions.canArchiveProject}
          onEdit={handleEdit}
          onArchive={handleArchive}
        />
      )}

      {/* 5. Create / Edit Project Modal */}
      {(createModalOpen || Boolean(projectToEdit)) && (
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
      )}

      {/* 6. Archive Confirmation Modal */}
      {Boolean(projectToArchive) && (
        <ArchiveProjectModal
          open={Boolean(projectToArchive)}
          onOpenChange={(open) => {
            if (!open) setProjectToArchive(null);
          }}
          workspaceId={workspaceId}
          project={projectToArchive}
        />
      )}
    </div>
  );
}
