'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  AlertCircle,
  Archive,
  Calendar,
  Clock,
  ExternalLink,
  Lock,
  MoreVertical,
  Pencil,
  Users,
} from 'lucide-react';
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
import { ProjectIconBadge } from './project-icon-badge';
import { ProjectHealthBadge } from './project-health-badge';
import { ProjectDeliverablesCounter } from './project-deliverables-counter';

interface ProjectCardProps {
  project: Project;
  workspaceSlug: string;
  canEdit?: boolean;
  canArchive?: boolean;
  onEdit: (project: Project) => void;
  onArchive: (project: Project) => void;
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

export function ProjectCard({
  project,
  workspaceSlug,
  canEdit = false,
  canArchive = false,
  onEdit,
  onArchive,
}: ProjectCardProps) {
  const router = useRouter();
  const projectSlug = project.slug || project.id;
  const projectUrl = `/workspaces/${workspaceSlug}/projects/${projectSlug}`;
  const accentColor = project.color || '#4648d4';

  const handleCardClick = (e: React.MouseEvent) => {
    // Prevent navigation if clicking interactive elements inside the card
    const target = e.target as HTMLElement;
    if (target.closest('button, a, [role="menuitem"], [role="button"]:not([data-card-root])')) {
      return;
    }
    router.push(projectUrl);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      const target = e.target as HTMLElement;
      if (target.closest('button, a, [role="menuitem"]')) {
        return;
      }
      e.preventDefault();
      router.push(projectUrl);
    }
  };

  // Due date rendering with relative time calculation
  const renderDueDate = () => {
    if (!project.dueDate) {
      return (
        <span className="text-[11px] text-muted-foreground/60 font-medium select-none">
          No due date
        </span>
      );
    }

    const due = new Date(project.dueDate);
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const dueDay = new Date(due.getFullYear(), due.getMonth(), due.getDate());
    const diffDays = Math.round((dueDay.getTime() - startOfToday.getTime()) / (1000 * 60 * 60 * 24));

    const isOverdue = diffDays < 0 && project.status !== ProjectStatus.COMPLETED && project.status !== ProjectStatus.ARCHIVED;
    const isDueSoon = diffDays >= 0 && diffDays <= 7 && project.status !== ProjectStatus.COMPLETED && project.status !== ProjectStatus.ARCHIVED;

    const formattedDate = due.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });

    if (isOverdue) {
      const daysOverdue = Math.abs(diffDays);
      return (
        <TooltipProvider delayDuration={200}>
          <Tooltip>
            <TooltipTrigger asChild>
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-600 dark:text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded-full border border-rose-500/25">
                <AlertCircle className="h-3 w-3 shrink-0" />
                <span>{daysOverdue === 1 ? '1d overdue' : `${daysOverdue}d overdue`}</span>
              </span>
            </TooltipTrigger>
            <TooltipContent>Target deadline was {formattedDate}</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
    }

    if (isDueSoon) {
      return (
        <TooltipProvider delayDuration={200}>
          <Tooltip>
            <TooltipTrigger asChild>
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-600 dark:text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/25">
                <Clock className="h-3 w-3 shrink-0" />
                <span>{diffDays === 0 ? 'Due today' : `Due in ${diffDays}d`}</span>
              </span>
            </TooltipTrigger>
            <TooltipContent>Due on {formattedDate}</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
    }

    return (
      <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-muted-foreground">
        <Calendar className="h-3 w-3 text-muted-foreground/80 shrink-0" />
        <span>{formattedDate}</span>
      </span>
    );
  };

  return (
    <div
      role="button"
      tabIndex={0}
      data-card-root="true"
      onClick={handleCardClick}
      onKeyDown={handleKeyDown}
      className="group relative flex flex-col justify-between rounded-2xl border border-border/80 bg-card hover:border-primary/50 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 cursor-pointer overflow-hidden p-5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary text-left"
    >
      {/* Top Accent Strip */}
      <div
        className="absolute top-0 left-0 right-0 h-1 transition-opacity opacity-90 group-hover:opacity-100"
        style={{ backgroundColor: accentColor }}
      />

      {/* Main Content Body */}
      <div className="space-y-3.5">
        {/* Header Row: Icon + Title/Key + Action Menu */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3 min-w-0">
            <ProjectIconBadge
              icon={project.icon}
              title={project.title}
              projectKey={project.key}
              color={project.color}
              size="md"
            />

            <div className="min-w-0 space-y-1">
              <Link
                href={projectUrl}
                onClick={(e) => e.stopPropagation()}
                className="font-bold text-foreground group-hover:text-primary transition-colors text-base line-clamp-1 block leading-snug"
              >
                {project.title}
              </Link>

              <div className="flex items-center gap-1.5 flex-wrap">
                {project.key && (
                  <span className="font-mono text-[11px] font-bold text-muted-foreground bg-muted/70 px-1.5 py-0.5 rounded border border-border/60 uppercase tracking-tight">
                    {project.key}
                  </span>
                )}

                {project.visibility === 'PRIVATE' && (
                  <TooltipProvider delayDuration={200}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span className="inline-flex items-center text-muted-foreground/70 hover:text-foreground">
                          <Lock className="h-3 w-3" />
                          <span className="sr-only">Private project</span>
                        </span>
                      </TooltipTrigger>
                      <TooltipContent>Private to workspace members</TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )}
              </div>
            </div>
          </div>

          {/* Action Menu */}
          {(canEdit || canArchive) && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={(e) => e.stopPropagation()}
                  className="h-8 w-8 rounded-lg text-muted-foreground opacity-70 group-hover:opacity-100 hover:text-foreground hover:bg-muted/80 shrink-0"
                >
                  <MoreVertical className="h-4 w-4" />
                  <span className="sr-only">Project options</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="rounded-xl w-40 p-1"
                onClick={(e) => e.stopPropagation()}
              >
                <DropdownMenuItem
                  onSelect={() => window.open(projectUrl, '_blank')}
                  className="rounded-lg gap-2 text-xs font-semibold cursor-pointer py-2"
                >
                  <ExternalLink className="h-3.5 w-3.5" /> Open in New Tab
                </DropdownMenuItem>
                {canEdit && (
                  <DropdownMenuItem
                    onSelect={() => onEdit(project)}
                    className="rounded-lg gap-2 text-xs font-semibold cursor-pointer py-2"
                  >
                    <Pencil className="h-3.5 w-3.5" /> Edit Project
                  </DropdownMenuItem>
                )}
                {canArchive && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onSelect={() => onArchive(project)}
                      className="rounded-lg gap-2 text-xs font-semibold cursor-pointer py-2 text-rose-600 dark:text-rose-400 focus:text-rose-600 dark:focus:text-rose-400"
                    >
                      <Archive className="h-3.5 w-3.5" /> Archive Project
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>

        {/* Telemetry Badges: Health + Priority + Status */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <ProjectHealthBadge
            health={project.health || ProjectHealth.ON_TRACK}
            size="sm"
          />

          {project.priority && (
            <span
              className={cn(
                'text-[10px] font-bold px-2 py-0.5 rounded-full border select-none',
                getPriorityBadgeColor(project.priority),
              )}
            >
              {project.priority}
            </span>
          )}

          {project.status !== ProjectStatus.ACTIVE && (
            <Badge
              variant="outline"
              className="text-[10px] py-0 px-1.5 uppercase font-bold tracking-wider"
            >
              {project.status}
            </Badge>
          )}
        </div>

        {/* Description Snippet */}
        <p className="text-xs text-muted-foreground line-clamp-2 min-h-[34px] leading-relaxed">
          {project.description || project.brief || 'No description provided.'}
        </p>

        {/* Deliverables Metrics */}
        <div>
          <ProjectDeliverablesCounter
            boardsCount={project._count?.boards}
            sprintsCount={project._count?.sprints}
            linksCount={project._count?.links}
            repoUrl={project.repoUrl}
            size="sm"
          />
        </div>
      </div>

      {/* Card Footer: Lead & Team + Due Date */}
      <div className="mt-4 pt-3 border-t border-border/60 flex items-center justify-between text-xs text-muted-foreground gap-2">
        {/* Left: Lead Avatar & Team Member Count */}
        <div className="flex items-center gap-2 min-w-0">
          {project.lead ? (
            <TooltipProvider delayDuration={200}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex items-center gap-1.5 min-w-0 cursor-default">
                    <Avatar className="h-5 w-5 border border-border/80 shrink-0">
                      {project.lead.avatar && (
                        <AvatarImage src={project.lead.avatar} alt={project.lead.name} />
                      )}
                      <AvatarFallback className="text-[9px] bg-primary/10 text-primary font-bold">
                        {getInitials(project.lead.name)}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-xs font-medium text-muted-foreground truncate max-w-[85px] sm:max-w-[100px]">
                      {project.lead.name}
                    </span>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  Project Lead: {project.lead.name} ({project.lead.email})
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          ) : (
            <span className="text-[11px] text-muted-foreground/60 italic">
              Unassigned lead
            </span>
          )}

          {typeof project._count?.projectMembers === 'number' && project._count.projectMembers > 0 && (
            <TooltipProvider delayDuration={200}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className="inline-flex items-center gap-1 text-[11px] font-medium text-muted-foreground bg-muted/40 hover:bg-muted/70 px-1.5 py-0.5 rounded transition-colors shrink-0 cursor-default">
                    <Users className="h-3 w-3 text-muted-foreground/80" />
                    <span>{project._count.projectMembers}</span>
                  </span>
                </TooltipTrigger>
                <TooltipContent>
                  {project._count.projectMembers} team{' '}
                  {project._count.projectMembers === 1 ? 'member' : 'members'}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>

        {/* Right: Due Date */}
        <div className="shrink-0">{renderDueDate()}</div>
      </div>
    </div>
  );
}
