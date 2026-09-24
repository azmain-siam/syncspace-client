'use client';

import * as React from 'react';
import { use, useState } from 'react';
import {
  Activity,
  CheckSquare,
  ChevronLeft,
  ChevronRight,
  Clock,
  Folder,
  Layers,
  MessageSquare,
  Search,
  Users,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  SegmentedControl,
  type SegmentedControlOption,
} from '@/components/ui/segmented-control';
import { useCurrentWorkspace } from '@/features/workspace/hooks/use-current-workspace';
import { useWorkspaceActivities } from '@/features/safety';
import { ActivityFeed } from '@/features/safety/components/activity-feed';

type ActivityCategory = 'ALL' | 'TASK' | 'PROJECT' | 'TEAM' | 'COMMENT';

const ACTIVITY_CATEGORY_OPTIONS: SegmentedControlOption<ActivityCategory>[] = [
  { value: 'ALL', label: 'All Events', icon: Layers },
  { value: 'TASK', label: 'Tasks', icon: CheckSquare },
  { value: 'PROJECT', label: 'Projects', icon: Folder },
  { value: 'TEAM', label: 'Team', icon: Users },
  { value: 'COMMENT', label: 'Comments', icon: MessageSquare },
];

export default function WorkspaceActivityPage({
  params,
}: {
  params: Promise<{ workspaceSlug: string }>;
}) {
  const { workspaceSlug } = use(params);
  const { workspace, isLoading: wsLoading } = useCurrentWorkspace(workspaceSlug);
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<ActivityCategory>('ALL');

  const workspaceId = workspace?.id || '';
  const { data, isLoading: activitiesLoading } = useWorkspaceActivities(
    workspaceId,
    { page, limit: 30 },
  );

  const activities = data?.activities || [];
  const meta = data?.meta;

  // Filter activities by search query and category
  const filteredActivities = activities.filter((act) => {
    const query = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !query ||
      (act.description && act.description.toLowerCase().includes(query)) ||
      (act.actor?.name && act.actor.name.toLowerCase().includes(query)) ||
      (act.project?.title && act.project.title.toLowerCase().includes(query));

    let matchesCategory = true;
    if (categoryFilter === 'TASK') {
      matchesCategory =
        act.action.startsWith('TASK_') ||
        act.action.startsWith('TASKS_') ||
        act.action.startsWith('CHECKLIST_') ||
        act.action.startsWith('ATTACHMENT_') ||
        act.action.startsWith('LABEL_');
    } else if (categoryFilter === 'PROJECT') {
      matchesCategory =
        act.action.startsWith('PROJECT_') ||
        act.action.startsWith('BOARD_') ||
        act.action.startsWith('COLUMN_') ||
        act.action.startsWith('SPRINT_');
    } else if (categoryFilter === 'TEAM') {
      matchesCategory =
        act.action.startsWith('MEMBER_') ||
        act.action.startsWith('INVITATION_') ||
        act.action === 'ROLE_UPDATED';
    } else if (categoryFilter === 'COMMENT') {
      matchesCategory = act.action.startsWith('COMMENT_');
    }

    return matchesSearch && matchesCategory;
  });

  if (wsLoading && !workspace) {
    return (
      <div className="space-y-4 max-w-5xl mx-auto">
        <div className="h-20 w-1/3 bg-card animate-pulse rounded-2xl border border-border" />
        <div className="h-96 w-full bg-card animate-pulse rounded-2xl border border-border" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-extrabold tracking-tight text-foreground flex items-center gap-2">
            <Activity className="h-6 w-6 text-primary" /> Workspace Activity Feed
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Chronological stream of project updates, member events, and team actions in{' '}
            <strong className="text-foreground">{workspace?.name || 'this workspace'}</strong>.
          </p>
        </div>
      </div>

      {/* Filter & Search Toolbar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3 bg-card rounded-2xl border border-border">
        {/* Search */}
        <div className="relative flex-1 sm:max-w-md">
          <Search className="absolute left-3.5 top-3.5 h-4 w-4 text-muted-foreground pointer-events-none" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Filter activities by keyword, user, or project..."
            className="pl-10 h-11 rounded-lg bg-background border-border/80 text-sm"
          />
        </div>

        {/* Category Segmented Control */}
        <SegmentedControl
          options={ACTIVITY_CATEGORY_OPTIONS}
          value={categoryFilter}
          onChange={setCategoryFilter}
        />
      </div>

      {/* Activity Timeline Card */}
      <Card className="rounded-2xl border border-border bg-card shadow-xs">
        <CardHeader className="flex flex-row items-center justify-between border-b border-border/60 pb-4">
          <CardTitle className="text-sm font-bold flex items-center gap-2">
            <Clock className="h-4 w-4 text-primary" /> Recent Events
          </CardTitle>
          <div className="flex items-center gap-2">
            {meta?.total !== undefined && (
              <span className="text-xs text-muted-foreground font-medium">
                {meta.total} events recorded
              </span>
            )}
            <Badge variant="outline" className="text-xs font-semibold gap-1 text-primary border-primary/30">
              Live Feed
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="p-4 sm:p-6">
          <ActivityFeed activities={filteredActivities} isLoading={activitiesLoading} />

          {/* Pagination Bar */}
          {meta && meta.totalPages > 1 && (
            <div className="flex items-center justify-between px-2 pt-6 border-t border-border/40 mt-6 text-xs text-muted-foreground">
              <span className="font-medium">
                Page <strong className="text-foreground">{meta.page}</strong> of{' '}
                <strong className="text-foreground">{meta.totalPages}</strong>
              </span>

              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={!meta.hasPrevPage || activitiesLoading}
                  className="h-8 px-2 text-xs font-semibold rounded-lg"
                >
                  <ChevronLeft className="h-3.5 w-3.5 mr-1" /> Previous
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => p + 1)}
                  disabled={!meta.hasNextPage || activitiesLoading}
                  className="h-8 px-2 text-xs font-semibold rounded-lg"
                >
                  Next <ChevronRight className="h-3.5 w-3.5 ml-1" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
