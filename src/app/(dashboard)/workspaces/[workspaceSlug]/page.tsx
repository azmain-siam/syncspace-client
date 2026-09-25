'use client';

import * as React from 'react';
import { use } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useCurrentWorkspace } from '@/features/workspace/hooks/use-current-workspace';
import {
  DashboardKpiGrid,
  DashboardSkeleton,
  MemberWorkloadTable,
  MyWorkCard,
  ProductivityVelocityCard,
  TaskPriorityChart,
  TaskStatusChart,
  useDashboardSummary,
  useMemberWorkload,
  useTaskDistribution,
} from '@/features/dashboard';

export default function WorkspaceDashboardPage({
  params,
}: {
  params: Promise<{ workspaceSlug: string }>;
}) {
  const { workspaceSlug } = use(params);
  const { workspace, isLoading: workspaceLoading } = useCurrentWorkspace(workspaceSlug);

  const workspaceId = workspace?.id || '';
  const displaySlug = workspace?.slug || workspaceSlug;

  // Live analytics queries
  const { data: summary, isLoading: summaryLoading } = useDashboardSummary(workspaceId);
  const { data: distribution, isLoading: distributionLoading } = useTaskDistribution(workspaceId);
  const { data: workload, isLoading: workloadLoading } = useMemberWorkload(workspaceId);

  if (workspaceLoading && !workspace) {
    return <DashboardSkeleton />;
  }

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* 1. Clean Workspace Header Banner */}
      <div className="rounded-2xl border border-border bg-card p-5 sm:p-6 shadow-xs flex items-center justify-between gap-4">
        <div className="flex items-center gap-3.5 sm:gap-4 min-w-0">
          <Avatar className="h-12 w-12 sm:h-14 sm:w-14 rounded-xl border border-border shrink-0">
            {workspace?.logo && (
              <AvatarImage src={workspace.logo} alt={workspace.name} />
            )}
            <AvatarFallback className="rounded-xl bg-primary/10 text-primary font-bold text-base sm:text-lg">
              {workspace?.name ? workspace.name.substring(0, 2).toUpperCase() : 'WS'}
            </AvatarFallback>
          </Avatar>
          <div className="space-y-0.5 min-w-0">
            <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-foreground truncate break-words">
              {workspace?.name || 'Workspace Dashboard'}
            </h1>
            <p className="text-xs text-muted-foreground truncate">
              {workspace?.description ||
                'Collaborative workspace deliverables, sprint health, and team execution.'}
            </p>
          </div>
        </div>
      </div>

      {/* 2. Executive KPI Overview */}
      <section aria-label="Executive Key Performance Indicators">
        <DashboardKpiGrid summary={summary} isLoading={summaryLoading} />
      </section>

      {/* 3. Actionable Personal Deliverables ("My Work") */}
      {workspaceId && (
        <section aria-label="Personal Assigned Deliverables">
          <MyWorkCard workspaceId={workspaceId} workspaceSlug={displaySlug} />
        </section>
      )}

      {/* 4. Categorical Distribution Charts Grid */}
      <section
        aria-label="Workflow Distribution Analysis"
        className="grid grid-cols-1 lg:grid-cols-2 gap-6"
      >
        <TaskStatusChart
          distribution={distribution}
          isLoading={distributionLoading}
        />
        <TaskPriorityChart
          distribution={distribution}
          isLoading={distributionLoading}
        />
      </section>

      {/* 5. Productivity Velocity & Throughput */}
      {workspaceId && (
        <section aria-label="Productivity Velocity">
          <ProductivityVelocityCard workspaceId={workspaceId} />
        </section>
      )}

      {/* 6. Team Member Workload Breakdown */}
      <section aria-label="Team Workload Breakdown">
        <MemberWorkloadTable
          workload={workload}
          isLoading={workloadLoading}
        />
      </section>
    </div>
  );
}
