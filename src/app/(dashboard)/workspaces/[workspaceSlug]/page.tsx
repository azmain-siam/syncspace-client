'use client';

import * as React from 'react';
import { use } from 'react';
import Link from 'next/link';
import {
  ArrowRight,
  Building2,
  FolderKanban,
  Settings,
  Shield,
  Users,
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useCurrentWorkspace } from '@/features/workspace/hooks/use-current-workspace';
import { useWorkspaceMembers } from '@/features/workspace/hooks/use-workspace-members';
import {
  DashboardKpiGrid,
  DashboardSkeleton,
  MemberWorkloadTable,
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
  const { data: membersResponse } = useWorkspaceMembers(workspaceId);
  const members = membersResponse?.data || [];

  const { data: summary, isLoading: summaryLoading } = useDashboardSummary(workspaceId);
  const { data: distribution, isLoading: distributionLoading } = useTaskDistribution(workspaceId);
  const { data: workload, isLoading: workloadLoading } = useMemberWorkload(workspaceId);

  if (workspaceLoading && !workspace) {
    return <DashboardSkeleton />;
  }

  return (
    <div className="space-y-8">
      {/* 1. Workspace Header Banner */}
      <div className="rounded-2xl border border-border bg-card p-5 sm:p-7 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-5 sm:gap-6">
        <div className="flex items-center gap-3.5 sm:gap-4 min-w-0">
          <Avatar className="h-12 w-12 sm:h-14 sm:w-14 rounded-xl border border-border shrink-0">
            {workspace?.logo && (
              <AvatarImage src={workspace.logo} alt={workspace.name} />
            )}
            <AvatarFallback className="rounded-xl bg-primary/10 text-primary font-bold text-base sm:text-lg">
              {workspace?.name ? workspace.name.substring(0, 2).toUpperCase() : 'WS'}
            </AvatarFallback>
          </Avatar>
          <div className="space-y-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-foreground truncate break-words">
                {workspace?.name || 'Workspace Dashboard'}
              </h1>
              <Badge variant="default" className="gap-1 text-[10px] sm:text-xs shrink-0">
                <Shield className="h-3 w-3" /> ACTIVE
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground truncate">
              Slug: <code className="font-mono text-[11px] font-semibold text-primary">{displaySlug}</code>
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 sm:gap-3 shrink-0">
          <Link href={`/workspaces/${displaySlug}/projects`}>
            <Button variant="outline" className="h-9 sm:h-10 text-xs sm:text-sm rounded-lg gap-2">
              <FolderKanban className="h-4 w-4" /> Projects
            </Button>
          </Link>
          <Link href={`/workspaces/${displaySlug}/members`}>
            <Button variant="outline" className="h-9 sm:h-10 text-xs sm:text-sm rounded-lg gap-2">
              <Users className="h-4 w-4" /> Members ({members.length})
            </Button>
          </Link>
          <Link href={`/workspaces/${displaySlug}/settings`}>
            <Button variant="ghost" size="icon" className="h-9 w-9 sm:h-10 sm:w-10 rounded-lg">
              <Settings className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>

      {/* 2. Executive KPI Grid (4 Summary Cards) */}
      <section aria-label="Executive Key Performance Indicators">
        <DashboardKpiGrid summary={summary} isLoading={summaryLoading} />
      </section>

      {/* 3. Categorical Distribution Charts Grid */}
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

      {/* 4. Productivity Velocity & Throughput */}
      {workspaceId && (
        <section aria-label="Productivity Velocity">
          <ProductivityVelocityCard workspaceId={workspaceId} />
        </section>
      )}

      {/* 5. Team Member Workload Breakdown */}
      <section aria-label="Team Workload Breakdown">
        <MemberWorkloadTable
          workload={workload}
          isLoading={workloadLoading}
        />
      </section>

      {/* 6. Executive Navigation & Quick Launch */}
      <Card className="rounded-2xl border-border bg-card">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-bold tracking-tight">
            Workspace Operations
          </CardTitle>
          <CardDescription className="text-xs">
            Direct shortcuts to manage workspace projects, permissions, and team safety
          </CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Link href={`/workspaces/${displaySlug}/projects`}>
            <div className="p-4 rounded-xl border border-border/70 bg-background hover:bg-accent/40 transition-all cursor-pointer group flex items-center justify-between">
              <div className="space-y-1">
                <div className="font-bold text-xs sm:text-sm text-foreground flex items-center gap-2">
                  <FolderKanban className="h-4 w-4 text-primary" /> Active Projects
                </div>
                <p className="text-[11px] text-muted-foreground line-clamp-2">
                  Launch sprints, manage kanban boards, and backlog task items.
                </p>
              </div>
              <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors shrink-0 ml-2" />
            </div>
          </Link>

          <Link href={`/workspaces/${displaySlug}/members`}>
            <div className="p-4 rounded-xl border border-border/70 bg-background hover:bg-accent/40 transition-all cursor-pointer group flex items-center justify-between">
              <div className="space-y-1">
                <div className="font-bold text-xs sm:text-sm text-foreground flex items-center gap-2">
                  <Users className="h-4 w-4 text-primary" /> Invite Collaborators
                </div>
                <p className="text-[11px] text-muted-foreground line-clamp-2">
                  Invite teammates via email with role-based access controls.
                </p>
              </div>
              <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors shrink-0 ml-2" />
            </div>
          </Link>

          <Link href={`/workspaces/${displaySlug}/settings`}>
            <div className="p-4 rounded-xl border border-border/70 bg-background hover:bg-accent/40 transition-all cursor-pointer group flex items-center justify-between">
              <div className="space-y-1">
                <div className="font-bold text-xs sm:text-sm text-foreground flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-primary" /> Governance & Settings
                </div>
                <p className="text-[11px] text-muted-foreground line-clamp-2">
                  Configure workspace profile, audit logs, and data safety trash bin.
                </p>
              </div>
              <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors shrink-0 ml-2" />
            </div>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
