'use client';

import * as React from 'react';
import { use } from 'react';
import Link from 'next/link';
import { FolderKanban, History, Users } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { TooltipProvider } from '@/components/ui/tooltip';
import { useCurrentWorkspace } from '@/features/workspace/hooks/use-current-workspace';
import { useWorkspacePermissions } from '@/features/workspace/hooks/use-workspace-permissions';
import {
  DashboardKpiGrid,
  DashboardSkeleton,
  MemberWorkloadTable,
  MyWorkCard,
  ProductivityVelocityCard,
  ProjectRollupTable,
  SprintHealthBanner,
  TaskListSheet,
  TaskPriorityChart,
  TaskStatusChart,
  useDashboardSummary,
  useMemberWorkload,
  useProjectRollups,
  useTaskDistribution,
  useWorkspaceSprintHealth,
} from '@/features/dashboard';
import { formatRelativeUpdated } from '@/features/dashboard/lib/format-dashboard';
import type { WorkspaceTaskDrilldown } from '@/features/dashboard/types/workspace-tasks.types';
import type { TaskPriority, TaskStatus } from '@/types/domain';

export default function WorkspaceDashboardPage({
  params,
}: {
  params: Promise<{ workspaceSlug: string }>;
}) {
  const { workspaceSlug } = use(params);
  const { workspace, isLoading: workspaceLoading } = useCurrentWorkspace(workspaceSlug);
  const workspaceId = workspace?.id || '';
  const displaySlug = workspace?.slug || workspaceSlug;
  const permissions = useWorkspacePermissions(workspaceId);
  const canViewAnalytics = permissions.canViewWorkspaceAnalytics;

  const [comparisonDays, setComparisonDays] = React.useState(30);
  const [drilldown, setDrilldown] = React.useState<WorkspaceTaskDrilldown | null>(null);

  const summaryQuery = useDashboardSummary(workspaceId, comparisonDays, canViewAnalytics);
  const distributionQuery = useTaskDistribution(workspaceId, canViewAnalytics);
  const workloadQuery = useMemberWorkload(workspaceId, canViewAnalytics);
  const sprintQuery = useWorkspaceSprintHealth(workspaceId, canViewAnalytics);
  const rollupQuery = useProjectRollups(workspaceId, canViewAnalytics);

  const updatedAt = latestUpdatedAt([
    summaryQuery.dataUpdatedAt,
    distributionQuery.dataUpdatedAt,
    workloadQuery.dataUpdatedAt,
    sprintQuery.dataUpdatedAt,
    rollupQuery.dataUpdatedAt,
  ]);

  const openDrilldown = React.useCallback((next: WorkspaceTaskDrilldown) => {
    setDrilldown(next);
  }, []);

  if ((workspaceLoading && !workspace) || permissions.isLoading) {
    return <DashboardSkeleton />;
  }

  const header = (
    <div className="rounded-2xl border border-border bg-card p-5 sm:p-6 shadow-xs flex flex-col gap-4">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3.5 sm:gap-4 min-w-0">
          <Avatar className="h-12 w-12 sm:h-14 sm:w-14 rounded-xl border border-border shrink-0">
            {workspace?.logo && <AvatarImage src={workspace.logo} alt={workspace.name} />}
            <AvatarFallback className="rounded-xl bg-primary/10 text-primary font-bold text-base sm:text-lg">
              {workspace?.name ? workspace.name.substring(0, 2).toUpperCase() : 'WS'}
            </AvatarFallback>
          </Avatar>
          <div className="space-y-0.5 min-w-0">
            <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-foreground truncate">
              {workspace?.name || 'Workspace'}
            </h1>
            <p className="text-xs text-muted-foreground truncate">
              {workspace?.description || 'Workspace overview'}
            </p>
          </div>
        </div>
        {updatedAt && canViewAnalytics && (
          <p className="text-[11px] font-mono text-muted-foreground shrink-0">
            {formatRelativeUpdated(updatedAt)}
          </p>
        )}
      </div>

      {canViewAnalytics && summaryQuery.data && (
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <Link
            href={`/workspaces/${displaySlug}/projects`}
            className="inline-flex items-center gap-1.5 rounded-full border border-border px-2.5 py-1 text-muted-foreground hover:text-foreground hover:bg-muted/40"
          >
            <FolderKanban className="h-3.5 w-3.5" />
            {summaryQuery.data.projectsCount} projects
          </Link>
          <Link
            href={`/workspaces/${displaySlug}/members`}
            className="inline-flex items-center gap-1.5 rounded-full border border-border px-2.5 py-1 text-muted-foreground hover:text-foreground hover:bg-muted/40"
          >
            <Users className="h-3.5 w-3.5" />
            {summaryQuery.data.membersCount} members
          </Link>
          <Link
            href={`/workspaces/${displaySlug}/activity`}
            className="inline-flex items-center gap-1.5 rounded-full border border-border px-2.5 py-1 text-muted-foreground hover:text-foreground hover:bg-muted/40"
          >
            <History className="h-3.5 w-3.5" />
            {summaryQuery.data.activitiesCount} activities
          </Link>
        </div>
      )}
    </div>
  );

  const myWork = workspaceId ? (
    <section aria-label="Personal assigned deliverables">
      <MyWorkCard workspaceId={workspaceId} workspaceSlug={displaySlug} />
    </section>
  ) : null;

  const kpis = (
    <section aria-label="Executive key performance indicators">
      <DashboardKpiGrid
        summary={summaryQuery.data}
        isLoading={summaryQuery.isLoading}
        isError={summaryQuery.isError}
        onRetry={() => void summaryQuery.refetch()}
        onSelectTotal={() =>
          openDrilldown({
            title: 'All workspace tasks',
            description: 'Every task across projects in this workspace',
            filters: {},
          })
        }
        onSelectInProgress={() =>
          openDrilldown({
            title: 'In progress and review',
            description: 'Workspace tasks currently in flight',
            filters: { status: ['IN_PROGRESS', 'REVIEW'] },
          })
        }
        onSelectOverdue={() =>
          openDrilldown({
            title: 'Workspace overdue tasks',
            description: 'Past-due tasks that are not Done, across the workspace',
            filters: { dueDate: 'overdue' },
          })
        }
      />
    </section>
  );

  const sprint = (
    <section aria-label="Active sprint health">
      <SprintHealthBanner
        health={sprintQuery.data}
        isLoading={sprintQuery.isLoading}
        isError={sprintQuery.isError}
        onRetry={() => void sprintQuery.refetch()}
        workspaceSlug={displaySlug}
        onSelectSprint={(sprintId, name) =>
          openDrilldown({
            title: name,
            description: 'Tasks committed to this sprint',
            filters: { sprintId },
          })
        }
      />
    </section>
  );

  const charts = (
    <section aria-label="Workflow distribution analysis" className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <TaskStatusChart
        distribution={distributionQuery.data}
        isLoading={distributionQuery.isLoading}
        isError={distributionQuery.isError}
        onRetry={() => void distributionQuery.refetch()}
        onSelectStatus={(status: TaskStatus) =>
          openDrilldown({
            title: `${status.replace('_', ' ')} tasks`,
            filters: { status },
          })
        }
      />
      <TaskPriorityChart
        distribution={distributionQuery.data}
        isLoading={distributionQuery.isLoading}
        isError={distributionQuery.isError}
        onRetry={() => void distributionQuery.refetch()}
        onSelectPriority={(priority: TaskPriority) =>
          openDrilldown({
            title: `${priority} priority tasks`,
            filters: { priority },
          })
        }
      />
    </section>
  );

  const productivity = workspaceId ? (
    <section aria-label="Productivity velocity">
      <ProductivityVelocityCard
        workspaceId={workspaceId}
        days={comparisonDays}
        onDaysChange={setComparisonDays}
        enabled={canViewAnalytics}
        onSelectCompleted={() =>
          openDrilldown({
            title: 'Completed tasks',
            description: 'Current Done tasks. The comparison window does not filter this list.',
            filters: { status: 'DONE' },
          })
        }
      />
    </section>
  ) : null;

  const rollups = (
    <section aria-label="Project portfolio">
      <ProjectRollupTable
        rollups={rollupQuery.data}
        isLoading={rollupQuery.isLoading}
        isError={rollupQuery.isError}
        onRetry={() => void rollupQuery.refetch()}
        workspaceSlug={displaySlug}
        onSelectProject={(projectId, title) =>
          openDrilldown({
            title,
            description: 'All tasks in this project',
            filters: { projectId },
          })
        }
        onSelectProjectOverdue={(projectId, title, count) =>
          openDrilldown({
            title: `${count} overdue in ${title}`,
            filters: { projectId, dueDate: 'overdue' },
          })
        }
      />
    </section>
  );

  const workload = (
    <section aria-label="Team workload breakdown">
      <MemberWorkloadTable
        workload={workloadQuery.data}
        isLoading={workloadQuery.isLoading}
        isError={workloadQuery.isError}
        onRetry={() => void workloadQuery.refetch()}
        onSelectMember={(userId, name) =>
          openDrilldown({
            title: `${name}'s tasks`,
            filters: { assigneeId: userId },
          })
        }
        onSelectMemberOverdue={(userId, name, count) =>
          openDrilldown({
            title: `${count} overdue for ${name}`,
            filters: { assigneeId: userId, dueDate: 'overdue' },
          })
        }
      />
    </section>
  );

  const isLead = permissions.isOwner || permissions.role === 'ADMIN';

  return (
    <TooltipProvider delayDuration={200}>
      <div className="space-y-6 sm:space-y-8">
        {header}
        {!canViewAnalytics ? (
          myWork
        ) : isLead ? (
          <>
            {kpis}
            {sprint}
            {myWork}
            {charts}
            {productivity}
            {rollups}
            {workload}
          </>
        ) : (
          <>
            {myWork}
            {kpis}
            {sprint}
            {charts}
            {productivity}
            {rollups}
            {workload}
          </>
        )}
      </div>

      <TaskListSheet
        key={drilldown ? `${drilldown.title}:${JSON.stringify(drilldown.filters)}` : 'closed'}
        open={Boolean(drilldown)}
        onOpenChange={(open) => {
          if (!open) setDrilldown(null);
        }}
        workspaceId={workspaceId}
        workspaceSlug={displaySlug}
        drilldown={drilldown}
      />
    </TooltipProvider>
  );
}

function latestUpdatedAt(values: Array<number | undefined>): Date | null {
  const valid = values.filter((value): value is number => typeof value === 'number' && value > 0);
  if (valid.length === 0) return null;
  return new Date(Math.max(...valid));
}
