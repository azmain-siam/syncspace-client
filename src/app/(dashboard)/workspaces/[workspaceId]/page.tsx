'use client';

import * as React from 'react';
import { use } from 'react';
import Link from 'next/link';
import {
  Activity,
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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useWorkspaceStore } from '@/features/workspace/stores/use-workspace-store';
import { useWorkspaceMembers } from '@/features/workspace/hooks/use-workspace-members';

export default function WorkspaceDashboardPage({
  params,
}: {
  params: Promise<{ workspaceId: string }>;
}) {
  const { workspaceId } = use(params);
  const activeWorkspace = useWorkspaceStore((state) => state.activeWorkspace);
  const { data: membersResponse } = useWorkspaceMembers(workspaceId);

  const members = membersResponse?.data || [];

  return (
    <div className="space-y-6">
      {/* Workspace Header Banner */}
      <div className="rounded-2xl border border-border bg-card p-6 sm:p-8 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <Avatar className="h-14 w-14 rounded-xl border border-border">
            {activeWorkspace?.logo && (
              <AvatarImage src={activeWorkspace.logo} alt={activeWorkspace.name} />
            )}
            <AvatarFallback className="rounded-xl bg-primary/10 text-primary font-bold text-lg">
              {activeWorkspace?.name ? activeWorkspace.name.substring(0, 2).toUpperCase() : 'WS'}
            </AvatarFallback>
          </Avatar>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-extrabold tracking-tight text-foreground">
                {activeWorkspace?.name || 'SyncSpace Workspace'}
              </h1>
              <Badge variant="default" className="gap-1">
                <Shield className="h-3 w-3" /> ACTIVE
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground">
              ID: <code className="font-mono text-[11px]">{workspaceId}</code>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link href={`/workspaces/${workspaceId}/members`}>
            <Button variant="outline" className="h-10 rounded-lg gap-2">
              <Users className="h-4 w-4" /> Members ({members.length})
            </Button>
          </Link>
          <Link href={`/workspaces/${workspaceId}/settings`}>
            <Button variant="ghost" size="icon" className="h-10 w-10 rounded-lg">
              <Settings className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Projects Metric Card */}
        <Card className="rounded-2xl">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground">
              Total Projects
            </CardTitle>
            <FolderKanban className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground tracking-tight">0</div>
            <p className="text-xs text-muted-foreground mt-1">
              Ready for project setup
            </p>
          </CardContent>
        </Card>

        {/* Members Metric Card */}
        <Card className="rounded-2xl">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground">
              Team Members
            </CardTitle>
            <Users className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground tracking-tight">
              {members.length}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Active collaborators
            </p>
          </CardContent>
        </Card>

        {/* Activity Status Card */}
        <Card className="rounded-2xl">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground">
              Sync Engine Status
            </CardTitle>
            <Activity className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground tracking-tight flex items-center gap-2">
              <span className="h-3 w-3 rounded-full bg-emerald-500 animate-pulse" />
              Connected
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Realtime WebSocket active
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Launch Card */}
      <Card className="rounded-2xl">
        <CardHeader>
          <CardTitle className="text-lg">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Link href={`/workspaces/${workspaceId}/members`}>
            <div className="p-4 rounded-xl border border-border/80 bg-background hover:bg-accent transition-all cursor-pointer group flex items-center justify-between">
              <div className="space-y-1">
                <div className="font-bold text-sm text-foreground flex items-center gap-2">
                  <Users className="h-4 w-4 text-primary" /> Invite Team Members
                </div>
                <div className="text-xs text-muted-foreground">
                  Send email invitations to bring your team into this workspace.
                </div>
              </div>
              <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors shrink-0 ml-2" />
            </div>
          </Link>

          <Link href={`/workspaces/${workspaceId}/settings`}>
            <div className="p-4 rounded-xl border border-border/80 bg-background hover:bg-accent transition-all cursor-pointer group flex items-center justify-between">
              <div className="space-y-1">
                <div className="font-bold text-sm text-foreground flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-primary" /> Workspace Settings
                </div>
                <div className="text-xs text-muted-foreground">
                  Update workspace name, logo, or manage access control.
                </div>
              </div>
              <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors shrink-0 ml-2" />
            </div>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
