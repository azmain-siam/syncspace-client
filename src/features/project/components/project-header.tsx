'use client';

import * as React from 'react';
import {
  Activity,
  AlertCircle,
  Archive,
  Calendar,
  Clock,
  Copy,
  ExternalLink,
  GitBranch,
  Lock,
  MoreVertical,
  Pencil,
  Sparkles,
  Users,
} from 'lucide-react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import type { Project } from '@/types/domain';
import { ProjectHealth, ProjectPriority, ProjectStatus } from '@/types/domain';
import { cn } from '@/lib/utils';
import type { ProjectDetail } from '../types/project.types';
import { ProjectIconBadge } from './project-icon-badge';
import { ProjectHealthBadge } from './project-health-badge';
import { ProjectDeliverablesCounter } from './project-deliverables-counter';

interface ProjectHeaderProps {
  project: ProjectDetail | Project;
  workspaceSlug?: string;
  canEdit?: boolean;
  canArchive?: boolean;
  onEdit: () => void;
  onArchive: () => void;
  onPostStatusUpdate?: () => void;
  className?: string;
}

function getInitials(name: string): string {
  if (!name) return 'U';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function getPriorityBadgeColor(priority: ProjectPriority) {
  switch (priority) {
    case ProjectPriority.CRITICAL:
    case ProjectPriority.URGENT:
      return 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/25';
    case ProjectPriority.HIGH:
      return 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/25';
    case ProjectPriority.MEDIUM:
      return 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/25';
    case ProjectPriority.LOW:
      return 'bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/25';
    default:
      return 'bg-muted text-muted-foreground border-border';
  }
}

export function ProjectHeader({
  project,
  canEdit = false,
  canArchive = false,
  onEdit,
  onArchive,
  onPostStatusUpdate,
  className,
}: ProjectHeaderProps) {
  const accentColor = project.color || '#4648d4';

  const membersCount =
    ('projectMembers' in project && Array.isArray(project.projectMembers)
      ? project.projectMembers.length
      : project._count?.projectMembers) || 0;

  const boardsCount =
    ('boards' in project && Array.isArray(project.boards)
      ? project.boards.length
      : project._count?.boards) || 0;

  const sprintsCount =
    ('sprints' in project && Array.isArray(project.sprints)
      ? project.sprints.length
      : project._count?.sprints) || 0;

  const linksCount =
    ('links' in project && Array.isArray(project.links)
      ? project.links.length
      : project._count?.links) || 0;

  const handleCopyUrl = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      toast.success('Project URL copied to clipboard');
    } catch {
      toast.error('Failed to copy project URL');
    }
  };

  // Timeline calculation
  const renderTimeline = () => {
    if (!project.dueDate && !project.startDate) {
      return (
        <span className="text-xs text-muted-foreground/70 italic select-none">
          Timeline not specified
        </span>
      );
    }

    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    let dateText = '';
    if (project.startDate && project.dueDate) {
      const start = new Date(project.startDate);
      const due = new Date(project.dueDate);
      const startFormatted = start.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      });
      const dueFormatted = due.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
      dateText = `${startFormatted} – ${dueFormatted}`;
    } else if (project.dueDate) {
      const due = new Date(project.dueDate);
      dateText = `Target: ${due.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })}`;
    } else if (project.startDate) {
      const start = new Date(project.startDate);
      dateText = `Started: ${start.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })}`;
    }

    // Deadline badge
    let diffDays: number | null = null;
    let isOverdue = false;
    let isDueSoon = false;

    if (project.dueDate) {
      const due = new Date(project.dueDate);
      const dueDay = new Date(due.getFullYear(), due.getMonth(), due.getDate());
      diffDays = Math.round((dueDay.getTime() - startOfToday.getTime()) / (1000 * 60 * 60 * 24));
      isOverdue =
        diffDays < 0 &&
        project.status !== ProjectStatus.COMPLETED &&
        project.status !== ProjectStatus.ARCHIVED;
      isDueSoon =
        diffDays >= 0 &&
        diffDays <= 7 &&
        project.status !== ProjectStatus.COMPLETED &&
        project.status !== ProjectStatus.ARCHIVED;
    }

    return (
      <div className="flex items-center gap-2 flex-wrap">
        <div className="flex items-center gap-1.5 text-xs text-foreground font-medium">
          <Calendar className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
          <span>{dateText}</span>
        </div>

        {isOverdue && diffDays !== null && (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-600 dark:text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded-full border border-rose-500/25">
            <AlertCircle className="h-3 w-3 shrink-0" />
            <span>{Math.abs(diffDays)}d overdue</span>
          </span>
        )}

        {isDueSoon && diffDays !== null && (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-600 dark:text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/25">
            <Clock className="h-3 w-3 shrink-0" />
            <span>{diffDays === 0 ? 'Due today' : `${diffDays}d left`}</span>
          </span>
        )}
      </div>
    );
  };

  return (
    <div
      className={cn(
        'relative rounded-2xl border border-border/80 bg-card p-5 sm:p-7 overflow-hidden shadow-xs space-y-5 transition-all',
        className,
      )}
    >
      {/* Top Accent Strip */}
      <div
        className="absolute top-0 left-0 right-0 h-1.5 transition-opacity opacity-90"
        style={{ backgroundColor: accentColor }}
      />

      {/* Main Header Row */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-5">
        {/* Left Side: Icon + Title + Key + Visibility + Telemetry Badges */}
        <div className="flex items-start gap-4 min-w-0">
          <ProjectIconBadge
            icon={project.icon}
            title={project.title}
            projectKey={project.key}
            color={project.color}
            size="lg"
            className="mt-0.5"
          />

          <div className="space-y-2 min-w-0">
            {/* Title & Key Row */}
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground leading-snug">
                {project.title}
              </h1>

              {project.key && (
                <span className="font-mono text-xs font-bold text-muted-foreground bg-muted/80 px-2 py-0.5 rounded-md border border-border/70 uppercase tracking-tight select-all">
                  {project.key}
                </span>
              )}

              {project.visibility === 'PRIVATE' && (
                <TooltipProvider delayDuration={200}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span className="inline-flex items-center gap-1 text-xs text-muted-foreground bg-muted/60 px-2 py-0.5 rounded-full border border-border/60">
                        <Lock className="h-3 w-3" />
                        <span className="text-[11px] font-medium">Private</span>
                      </span>
                    </TooltipTrigger>
                    <TooltipContent>
                      Visible only to explicit project members and workspace owners
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
            </div>

            {/* Badges Bar: Health + Priority + Status */}
            <div className="flex items-center gap-2 flex-wrap">
              <ProjectHealthBadge
                health={project.health || ProjectHealth.ON_TRACK}
                showLabel={true}
                size="md"
              />

              {project.priority && (
                <span
                  className={cn(
                    'text-xs font-bold px-2.5 py-0.5 rounded-full border select-none',
                    getPriorityBadgeColor(project.priority),
                  )}
                >
                  {project.priority} PRIORITY
                </span>
              )}

              <Badge
                variant={project.status === ProjectStatus.ACTIVE ? 'outline' : 'secondary'}
                className="text-xs uppercase font-bold tracking-wider"
              >
                {project.status}
              </Badge>
            </div>
          </div>
        </div>

        {/* Right Side: Action Suite */}
        <div className="flex items-center gap-2 shrink-0 self-start md:self-auto flex-wrap">
          {/* Post Status Update Trigger */}
          {onPostStatusUpdate && (
            <Button
              variant="outline"
              onClick={onPostStatusUpdate}
              className="h-9 rounded-xl gap-1.5 text-xs font-semibold cursor-pointer shadow-2xs hover:bg-muted"
            >
              <Activity className="h-3.5 w-3.5 text-primary" />
              <span>Update Health</span>
            </Button>
          )}

          {/* Edit Project */}
          {canEdit && (
            <Button
              variant="outline"
              onClick={onEdit}
              className="h-9 rounded-xl gap-1.5 text-xs font-semibold cursor-pointer shadow-2xs hover:bg-muted"
            >
              <Pencil className="h-3.5 w-3.5" />
              <span>Edit</span>
            </Button>
          )}

          {/* External Repository Link */}
          {project.repoUrl && (
            <TooltipProvider delayDuration={200}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => window.open(project.repoUrl!, '_blank')}
                    className="h-9 w-9 rounded-xl text-muted-foreground hover:text-foreground cursor-pointer shadow-2xs"
                  >
                    <GitBranch className="h-4 w-4" />
                    <span className="sr-only">Open Repository</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Open Repository ({project.repoUrl})</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}

          {/* More Actions Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="h-9 w-9 rounded-xl text-muted-foreground hover:text-foreground cursor-pointer shadow-2xs"
              >
                <MoreVertical className="h-4 w-4" />
                <span className="sr-only">Project options</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="rounded-xl w-44 p-1">
              <DropdownMenuItem
                onSelect={handleCopyUrl}
                className="rounded-lg gap-2 text-xs font-semibold cursor-pointer py-2"
              >
                <Copy className="h-3.5 w-3.5" /> Copy Project URL
              </DropdownMenuItem>

              {project.repoUrl && (
                <DropdownMenuItem
                  onSelect={() => window.open(project.repoUrl!, '_blank')}
                  className="rounded-lg gap-2 text-xs font-semibold cursor-pointer py-2"
                >
                  <ExternalLink className="h-3.5 w-3.5" /> Open Repository
                </DropdownMenuItem>
              )}

              {canArchive && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onSelect={onArchive}
                    className="rounded-lg gap-2 text-xs font-semibold cursor-pointer py-2 text-rose-600 dark:text-rose-400 focus:text-rose-600 dark:focus:text-rose-400"
                  >
                    <Archive className="h-3.5 w-3.5" /> Archive Project
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Description / Scope Subtitle */}
      {project.description && (
        <p className="text-xs sm:text-sm text-muted-foreground max-w-3xl leading-relaxed">
          {project.description}
        </p>
      )}

      {/* Quick Telemetry Ribbon */}
      <div className="pt-4 border-t border-border/60 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs text-muted-foreground">
        {/* Left Cluster: Project Lead & Team Member Count */}
        <div className="flex items-center gap-3 sm:gap-4 flex-wrap">
          {project.lead ? (
            <TooltipProvider delayDuration={200}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex items-center gap-2 cursor-default">
                    <Avatar className="h-6 w-6 border border-border/80 shrink-0">
                      {project.lead.avatar && (
                        <AvatarImage src={project.lead.avatar} alt={project.lead.name} />
                      )}
                      <AvatarFallback className="text-[10px] bg-primary/10 text-primary font-bold">
                        {getInitials(project.lead.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-semibold text-foreground">
                        {project.lead.name}
                      </span>
                      <span className="text-[10px] text-muted-foreground bg-muted/60 px-1.5 py-0.2 rounded font-medium">
                        Lead
                      </span>
                    </div>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  Project Lead: {project.lead.name} ({project.lead.email})
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          ) : (
            <span className="text-xs text-muted-foreground/70 italic">Unassigned Lead</span>
          )}

          {membersCount > 0 && (
            <TooltipProvider delayDuration={200}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground bg-muted/40 hover:bg-muted/70 px-2 py-1 rounded-lg transition-colors cursor-default">
                    <Users className="h-3.5 w-3.5 text-muted-foreground" />
                    <span>
                      {membersCount} {membersCount === 1 ? 'member' : 'members'}
                    </span>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  {membersCount} team {membersCount === 1 ? 'member' : 'members'} assigned to
                  this initiative
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}

          {/* Quick Created Date */}
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Sparkles className="h-3 w-3 text-muted-foreground/70" />
            <span>
              Created{' '}
              {new Date(project.createdAt).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
              })}
            </span>
          </div>
        </div>

        {/* Right Cluster: Timeline & Deliverables */}
        <div className="flex items-center gap-4 flex-wrap">
          {renderTimeline()}

          <ProjectDeliverablesCounter
            boardsCount={boardsCount}
            sprintsCount={sprintsCount}
            linksCount={linksCount}
            size="sm"
          />
        </div>
      </div>
    </div>
  );
}
