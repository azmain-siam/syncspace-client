'use client';

import * as React from 'react';
import { use } from 'react';
import { Activity, Clock, Shield, UserPlus } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useCurrentWorkspace } from '@/features/workspace/hooks/use-current-workspace';

export default function WorkspaceActivityPage({
  params,
}: {
  params: Promise<{ workspaceSlug: string }>;
}) {
  const { workspaceSlug } = use(params);
  const { workspace, isLoading } = useCurrentWorkspace(workspaceSlug);

  if (isLoading && !workspace) {
    return (
      <div className="space-y-4 max-w-5xl mx-auto">
        <div className="h-24 w-full bg-card animate-pulse rounded-2xl border border-border" />
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
            Chronological audit stream of project updates, member events, and team actions in{' '}
            <strong className="text-foreground">{workspace?.name || 'this workspace'}</strong>.
          </p>
        </div>
      </div>

      {/* Activity Timeline Card */}
      <Card className="rounded-2xl border border-border bg-card">
        <CardHeader className="flex flex-row items-center justify-between border-b border-border/60 pb-4">
          <CardTitle className="text-sm font-bold flex items-center gap-2">
            <Clock className="h-4 w-4 text-primary" /> Recent Events
          </CardTitle>
          <Badge variant="outline" className="text-xs font-semibold gap-1">
            Realtime feed
          </Badge>
        </CardHeader>
        <CardContent className="p-6">
          {/* Initial activity stream events */}
          <div className="relative pl-6 space-y-8 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-[2px] before:bg-border">
            {/* Event 1: Workspace creation */}
            <div className="relative flex items-start gap-4">
              <div className="absolute -left-6 top-1 h-5 w-5 rounded-full bg-primary/20 text-primary flex items-center justify-center ring-4 ring-card">
                <Shield className="h-3 w-3" />
              </div>
              <div className="space-y-1 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-bold text-foreground">Workspace Initialized</span>
                  <Badge variant="default" className="text-[10px]">ORGANIZATION</Badge>
                </div>
                <p className="text-xs text-muted-foreground">
                  Workspace <strong className="text-foreground">{workspace?.name}</strong> was created.
                </p>
                <span className="text-[10px] text-muted-foreground/80 font-mono">
                  {workspace?.createdAt
                    ? new Date(workspace.createdAt).toLocaleString(undefined, {
                        dateStyle: 'medium',
                        timeStyle: 'short',
                      })
                    : 'Recently'}
                </span>
              </div>
            </div>

            {/* Event 2: Collaboration ready */}
            <div className="relative flex items-start gap-4">
              <div className="absolute -left-6 top-1 h-5 w-5 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center ring-4 ring-card">
                <UserPlus className="h-3 w-3" />
              </div>
              <div className="space-y-1 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-bold text-foreground">Collaboration Ready</span>
                  <Badge variant="secondary" className="text-[10px]">SETUP</Badge>
                </div>
                <p className="text-xs text-muted-foreground">
                  Team members can now be invited and projects configured for Kanban tracking.
                </p>
                <span className="text-[10px] text-muted-foreground/80 font-mono">Active</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
