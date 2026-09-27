'use client';

import * as React from 'react';
import {
  Activity,
  Calendar,
  Clock,
  FileText,
  Key,
  Lock,
  Pencil,
  Plus,
  Shield,
  Sparkles,
  Users,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { ProjectHealth, ProjectStatus } from '@/types/domain';
import type { ProjectDetail, ProjectMemberRole } from '../types/project.types';
import { useProjectStatusUpdates } from '../hooks/use-project-status-updates';
import { ProjectHealthBadge } from './project-health-badge';
import { ProjectLinksWidget } from './project-links-widget';

interface ProjectOverviewTabProps {
  project: ProjectDetail;
  workspaceId: string;
  canManage?: boolean;
  onPostStatusUpdate?: () => void;
  onEditProject?: () => void;
  className?: string;
}

function getInitials(name: string): string {
  if (!name) return 'U';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function formatRelativeTime(dateString: string) {
  try {
    const date = new Date(dateString);
    const now = new Date();
    const diffSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    if (diffSeconds < 60) return 'Just now';
    const diffMinutes = Math.floor(diffSeconds / 60);
    if (diffMinutes < 60) return `${diffMinutes}m ago`;
    const diffHours = Math.floor(diffMinutes / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  } catch {
    return dateString;
  }
}

function getRoleBadgeStyle(role: ProjectMemberRole) {
  switch (role) {
    case 'LEAD':
      return 'bg-purple-500/10 text-purple-700 dark:text-purple-300 border-purple-500/25';
    case 'MANAGER':
      return 'bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-500/25';
    case 'MEMBER':
      return 'bg-slate-500/10 text-slate-700 dark:text-slate-300 border-slate-500/25';
    case 'VIEWER':
      return 'bg-muted text-muted-foreground border-border';
    default:
      return 'bg-muted text-muted-foreground border-border';
  }
}

// Lightweight Markdown Renderer for Brief
function MarkdownBriefViewer({ content }: { content: string }) {
  const lines = content.split('\n');

  return (
    <div className="space-y-3 text-xs sm:text-sm text-foreground/90 leading-relaxed font-normal">
      {lines.map((line, idx) => {
        const trimmed = line.trim();

        if (trimmed.startsWith('# ')) {
          return (
            <h2 key={idx} className="text-base sm:text-lg font-bold text-foreground mt-4 pt-1 border-b border-border/40 pb-1">
              {trimmed.slice(2)}
            </h2>
          );
        }

        if (trimmed.startsWith('## ')) {
          return (
            <h3 key={idx} className="text-sm sm:text-base font-bold text-foreground mt-3">
              {trimmed.slice(3)}
            </h3>
          );
        }

        if (trimmed.startsWith('### ')) {
          return (
            <h4 key={idx} className="text-xs sm:text-sm font-bold text-foreground mt-2">
              {trimmed.slice(4)}
            </h4>
          );
        }

        if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
          return (
            <div key={idx} className="flex items-start gap-2 pl-2">
              <span className="h-1.5 w-1.5 rounded-full bg-primary mt-2 shrink-0" />
              <span>{trimmed.slice(2)}</span>
            </div>
          );
        }

        if (trimmed.startsWith('> ')) {
          return (
            <blockquote
              key={idx}
              className="border-l-2 border-primary/60 bg-muted/30 px-3 py-1.5 rounded-r-lg italic text-muted-foreground"
            >
              {trimmed.slice(2)}
            </blockquote>
          );
        }

        if (!trimmed) {
          return <div key={idx} className="h-2" />;
        }

        return <p key={idx}>{line}</p>;
      })}
    </div>
  );
}

export function ProjectOverviewTab({
  project,
  workspaceId,
  canManage = false,
  onPostStatusUpdate,
  onEditProject,
  className,
}: ProjectOverviewTabProps) {
  const { data: statusUpdatesResponse } = useProjectStatusUpdates(
    workspaceId,
    project.id,
  );
  const statusUpdates = statusUpdatesResponse?.data || project.statusUpdates || [];

  return (
    <div className={cn('grid grid-cols-1 lg:grid-cols-12 gap-6', className)}>
      {/* Left Column (65% on Desktop): Scope & Brief + Status Updates Feed */}
      <div className="lg:col-span-8 space-y-6">
        {/* 1. Project Brief & Scope Card */}
        <div className="rounded-2xl border border-border/80 bg-card p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between gap-3 border-b border-border/60 pb-3">
            <div className="flex items-center gap-2">
              <div className="h-7 w-7 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                <FileText className="h-4 w-4" />
              </div>
              <h3 className="font-bold text-sm text-foreground">
                Scope & Objectives
              </h3>
            </div>

            {canManage && (
              <Button
                size="sm"
                variant="outline"
                onClick={onEditProject}
                className="h-7 rounded-lg gap-1.5 text-xs font-semibold cursor-pointer shadow-2xs hover:bg-muted"
              >
                <Pencil className="h-3 w-3" />
                <span>Edit Brief</span>
              </Button>
            )}
          </div>

          {project.brief ? (
            <div className="bg-muted/20 rounded-xl p-4 border border-border/40">
              <MarkdownBriefViewer content={project.brief} />
            </div>
          ) : (
            <div className="text-center py-8 px-4 rounded-xl border border-dashed border-border/70 bg-muted/20 space-y-2.5">
              <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center mx-auto">
                <FileText className="h-5 w-5" />
              </div>
              <div className="space-y-1 max-w-sm mx-auto">
                <h4 className="font-bold text-sm text-foreground">
                  No Project Brief Documented
                </h4>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Clarify technical goals, architecture decisions, and core delivery milestones for this initiative.
                </p>
              </div>
              {canManage && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={onEditProject}
                  className="rounded-lg gap-1.5 text-xs font-semibold cursor-pointer"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>Write Project Brief</span>
                </Button>
              )}
            </div>
          )}
        </div>

        {/* 2. Executive Status Updates Timeline Feed */}
        <div className="rounded-2xl border border-border/80 bg-card p-6 shadow-xs space-y-5">
          <div className="flex items-center justify-between gap-3 border-b border-border/60 pb-3">
            <div className="flex items-center gap-2">
              <div className="h-7 w-7 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <Activity className="h-4 w-4" />
              </div>
              <h3 className="font-bold text-sm text-foreground flex items-center gap-2">
                <span>Executive Status History</span>
                <Badge variant="secondary" className="text-[10px] px-1.5 py-0 rounded-full font-mono">
                  {statusUpdates.length}
                </Badge>
              </h3>
            </div>

            {onPostStatusUpdate && (
              <Button
                size="sm"
                variant="outline"
                onClick={onPostStatusUpdate}
                className="h-8 rounded-lg gap-1.5 text-xs font-semibold cursor-pointer shadow-2xs hover:bg-muted"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Post Update</span>
              </Button>
            )}
          </div>

          {statusUpdates.length === 0 ? (
            <div className="text-center py-8 px-4 rounded-xl border border-dashed border-border/70 bg-muted/20 space-y-2.5">
              <div className="h-10 w-10 rounded-xl bg-muted/60 text-muted-foreground flex items-center justify-center mx-auto">
                <Activity className="h-5 w-5" />
              </div>
              <div className="space-y-1 max-w-sm mx-auto">
                <h4 className="font-bold text-sm text-foreground">
                  No Status Updates Yet
                </h4>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Log progress reports and sync health status with stakeholders to maintain organizational transparency.
                </p>
              </div>
              {onPostStatusUpdate && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={onPostStatusUpdate}
                  className="rounded-lg gap-1.5 text-xs font-semibold cursor-pointer"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>Post First Status Update</span>
                </Button>
              )}
            </div>
          ) : (
            <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-border/60">
              {statusUpdates.map((update) => {
                const isAuthorAvailable = Boolean(update.author);
                const isHealthOnTrack = update.health === ProjectHealth.ON_TRACK;
                const isHealthAtRisk = update.health === ProjectHealth.AT_RISK;

                return (
                  <div key={update.id} className="relative group space-y-2">
                    {/* Status Dot on Timeline Rail */}
                    <div
                      className={cn(
                        'absolute -left-[27px] top-1 h-3 w-3 rounded-full border-2 border-background shrink-0',
                        isHealthOnTrack
                          ? 'bg-emerald-500'
                          : isHealthAtRisk
                          ? 'bg-amber-500'
                          : 'bg-rose-500',
                      )}
                    />

                    {/* Header Info */}
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        {isAuthorAvailable ? (
                          <div className="flex items-center gap-1.5">
                            <Avatar className="h-5 w-5 border border-border/80">
                              {update.author.avatar && (
                                <AvatarImage
                                  src={update.author.avatar}
                                  alt={update.author.name}
                                />
                              )}
                              <AvatarFallback className="text-[9px] bg-primary/10 text-primary font-bold">
                                {getInitials(update.author.name)}
                              </AvatarFallback>
                            </Avatar>
                            <span className="text-xs font-bold text-foreground">
                              {update.author.name}
                            </span>
                          </div>
                        ) : (
                          <span className="text-xs font-semibold text-foreground">
                            System
                          </span>
                        )}

                        <span className="text-xs text-muted-foreground">·</span>

                        <span className="text-xs text-muted-foreground">
                          {formatRelativeTime(update.createdAt)}
                        </span>
                      </div>

                      <ProjectHealthBadge
                        health={update.health}
                        showLabel={true}
                        size="sm"
                      />
                    </div>

                    {/* Message Body */}
                    <div className="p-3.5 rounded-xl border border-border/60 bg-muted/20 text-xs text-foreground/90 whitespace-pre-wrap leading-relaxed">
                      {update.message}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Right Column (35% on Desktop): Resources, Team & Metadata */}
      <div className="lg:col-span-4 space-y-6">
        {/* 1. Resources & Links Widget */}
        <ProjectLinksWidget
          workspaceId={workspaceId}
          projectId={project.id}
          initialLinks={project.links}
          canManage={canManage}
        />

        {/* 2. Team Roster Card */}
        <div className="rounded-2xl border border-border/80 bg-card p-5 space-y-4 shadow-xs">
          <div className="flex items-center justify-between gap-3 border-b border-border/60 pb-3">
            <div className="flex items-center gap-2">
              <div className="h-7 w-7 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                <Users className="h-4 w-4" />
              </div>
              <h3 className="font-bold text-sm text-foreground">
                Team & Assignees
              </h3>
            </div>

            <Badge variant="secondary" className="text-[10px] px-1.5 py-0 rounded-full font-mono">
              {(project.projectMembers?.length || 0) + (project.lead ? 1 : 0)}
            </Badge>
          </div>

          <div className="space-y-3">
            {/* Project Lead */}
            {project.lead && (
              <div className="flex items-center justify-between gap-3 p-2.5 rounded-xl border border-primary/20 bg-primary/5">
                <div className="flex items-center gap-2.5 min-w-0">
                  <Avatar className="h-7 w-7 border border-primary/30 shrink-0">
                    {project.lead.avatar && (
                      <AvatarImage src={project.lead.avatar} alt={project.lead.name} />
                    )}
                    <AvatarFallback className="text-[10px] bg-primary/20 text-primary font-bold">
                      {getInitials(project.lead.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 space-y-0.5">
                    <span className="text-xs font-bold text-foreground line-clamp-1 block">
                      {project.lead.name}
                    </span>
                    <span className="text-[10px] text-muted-foreground truncate block">
                      {project.lead.email}
                    </span>
                  </div>
                </div>

                <span className="text-[9px] font-bold px-2 py-0.5 rounded-full border uppercase tracking-wider bg-primary/15 text-primary border-primary/30 shrink-0 select-none">
                  Lead
                </span>
              </div>
            )}

            {/* Other Project Members */}
            {project.projectMembers && project.projectMembers.length > 0 ? (
              <div className="space-y-2">
                {project.projectMembers
                  .filter((pm) => pm.userId !== project.leadId)
                  .map((pm) => (
                    <div
                      key={pm.id}
                      className="flex items-center justify-between gap-3 p-2 rounded-xl border border-border/50 bg-muted/20 hover:bg-muted/40 transition-colors"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <Avatar className="h-6 w-6 border border-border/70 shrink-0">
                          {pm.user.avatar && (
                            <AvatarImage src={pm.user.avatar} alt={pm.user.name} />
                          )}
                          <AvatarFallback className="text-[9px] bg-muted text-muted-foreground font-bold">
                            {getInitials(pm.user.name)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                          <span className="text-xs font-semibold text-foreground line-clamp-1 block">
                            {pm.user.name}
                          </span>
                        </div>
                      </div>

                      <span
                        className={cn(
                          'text-[9px] font-bold px-1.5 py-0.2 rounded border uppercase select-none shrink-0',
                          getRoleBadgeStyle(pm.role),
                        )}
                      >
                        {pm.role}
                      </span>
                    </div>
                  ))}
              </div>
            ) : !project.lead ? (
              <p className="text-xs text-muted-foreground italic text-center py-2">
                No explicit members assigned.
              </p>
            ) : null}

            {project.visibility === 'PUBLIC' && (
              <p className="text-[11px] text-muted-foreground/80 leading-normal pt-1 border-t border-border/40">
                This project is <strong>Public</strong>: all workspace collaborators have default access.
              </p>
            )}
          </div>
        </div>

        {/* 3. Project Information & Metadata Card */}
        <div className="rounded-2xl border border-border/80 bg-card p-5 space-y-3.5 shadow-xs text-xs">
          <h3 className="font-bold text-sm text-foreground border-b border-border/60 pb-2">
            Project Information
          </h3>

          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground flex items-center gap-1.5">
                <Key className="h-3 w-3" /> Project Key
              </span>
              <span className="font-mono text-xs font-bold text-foreground bg-muted px-1.5 py-0.5 rounded border border-border/60 uppercase">
                {project.key || '—'}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-muted-foreground flex items-center gap-1.5">
                <Activity className="h-3 w-3" /> Status
              </span>
              <Badge
                variant={project.status === ProjectStatus.ACTIVE ? 'outline' : 'secondary'}
                className="text-[10px] py-0 px-2 uppercase font-bold"
              >
                {project.status}
              </Badge>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-muted-foreground flex items-center gap-1.5">
                <Shield className="h-3 w-3" /> Visibility
              </span>
              <span className="font-medium text-foreground flex items-center gap-1">
                {project.visibility === 'PRIVATE' ? (
                  <>
                    <Lock className="h-3 w-3 text-muted-foreground" /> Private
                  </>
                ) : (
                  'Public'
                )}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-muted-foreground flex items-center gap-1.5">
                <Sparkles className="h-3 w-3" /> Created by
              </span>
              <span className="font-medium text-foreground">
                {project.createdBy?.name || 'Workspace Member'}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-muted-foreground flex items-center gap-1.5">
                <Calendar className="h-3 w-3" /> Created on
              </span>
              <span className="font-medium text-foreground">
                {new Date(project.createdAt).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </span>
            </div>

            {project.updatedAt && (
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground flex items-center gap-1.5">
                  <Clock className="h-3 w-3" /> Last updated
                </span>
                <span className="font-medium text-foreground">
                  {formatRelativeTime(project.updatedAt)}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
