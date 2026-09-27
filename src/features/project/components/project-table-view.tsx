'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  AlertCircle,
  Archive,
  ArrowRight,
  Calendar,
  Clock,
  ExternalLink,
  Lock,
  MoreVertical,
  Pencil,
  Users,
} from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
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

interface ProjectTableViewProps {
  projects: Project[];
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

export function ProjectTableView({
  projects,
  workspaceSlug,
  canEdit = false,
  canArchive = false,
  onEdit,
  onArchive,
}: ProjectTableViewProps) {
  const router = useRouter();

  const handleRowClick = (projectSlug: string, e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    if (target.closest('button, a, [role="menuitem"], [role="button"]:not([data-table-row])')) {
      return;
    }
    router.push(`/workspaces/${workspaceSlug}/projects/${projectSlug}`);
  };

  const renderDueDateBadge = (dueDate?: string | null, status?: ProjectStatus) => {
    if (!dueDate) {
      return (
        <span className="text-xs text-muted-foreground/60 select-none">
          —
        </span>
      );
    }

    const due = new Date(dueDate);
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const dueDay = new Date(due.getFullYear(), due.getMonth(), due.getDate());
    const diffDays = Math.round((dueDay.getTime() - startOfToday.getTime()) / (1000 * 60 * 60 * 24));

    const isOverdue = diffDays < 0 && status !== ProjectStatus.COMPLETED && status !== ProjectStatus.ARCHIVED;
    const isDueSoon = diffDays >= 0 && diffDays <= 7 && status !== ProjectStatus.COMPLETED && status !== ProjectStatus.ARCHIVED;

    const formattedDate = due.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });

    if (isOverdue) {
      const daysOverdue = Math.abs(diffDays);
      return (
        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-600 dark:text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded-full border border-rose-500/25 whitespace-nowrap">
          <AlertCircle className="h-3 w-3 shrink-0" />
          <span>{daysOverdue === 1 ? '1d overdue' : `${daysOverdue}d overdue`}</span>
        </span>
      );
    }

    if (isDueSoon) {
      return (
        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-600 dark:text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/25 whitespace-nowrap">
          <Clock className="h-3 w-3 shrink-0" />
          <span>{diffDays === 0 ? 'Today' : `${diffDays}d left`}</span>
        </span>
      );
    }

    return (
      <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground whitespace-nowrap">
        <Calendar className="h-3.5 w-3.5 text-muted-foreground/70 shrink-0" />
        <span>{formattedDate}</span>
      </span>
    );
  };

  return (
    <div className="rounded-2xl border border-border/80 bg-card overflow-hidden shadow-xs">
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead className="w-[340px] pl-5">Project & Key</TableHead>
            <TableHead className="w-[180px]">Lead & Team</TableHead>
            <TableHead className="w-[130px]">Health</TableHead>
            <TableHead className="w-[110px]">Priority</TableHead>
            <TableHead className="w-[110px]">Status</TableHead>
            <TableHead className="w-[180px]">Deliverables</TableHead>
            <TableHead className="w-[140px]">Due Date</TableHead>
            <TableHead className="w-[80px] text-right pr-5">Actions</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {projects.map((project) => {
            const projectSlug = project.slug || project.id;
            const projectUrl = `/workspaces/${workspaceSlug}/projects/${projectSlug}`;

            return (
              <TableRow
                key={project.id}
                data-table-row="true"
                onClick={(e) => handleRowClick(projectSlug, e)}
                className="cursor-pointer hover:bg-muted/40 transition-colors group"
              >
                {/* 1. Project & Key */}
                <TableCell className="pl-5 py-3.5">
                  <div className="flex items-center gap-3 min-w-0">
                    <ProjectIconBadge
                      icon={project.icon}
                      title={project.title}
                      projectKey={project.key}
                      color={project.color}
                      size="sm"
                    />

                    <div className="min-w-0 space-y-0.5">
                      <div className="flex items-center gap-2">
                        <Link
                          href={projectUrl}
                          onClick={(e) => e.stopPropagation()}
                          className="font-semibold text-foreground group-hover:text-primary transition-colors text-sm line-clamp-1 block"
                        >
                          {project.title}
                        </Link>

                        {project.key && (
                          <span className="font-mono text-[10px] font-bold text-muted-foreground bg-muted px-1.5 py-0.5 rounded border border-border/60 uppercase shrink-0">
                            {project.key}
                          </span>
                        )}

                        {project.visibility === 'PRIVATE' && (
                          <TooltipProvider delayDuration={200}>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <span className="inline-flex items-center text-muted-foreground/70 shrink-0">
                                  <Lock className="h-3 w-3" />
                                </span>
                              </TooltipTrigger>
                              <TooltipContent>Private Project</TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        )}
                      </div>

                      {project.description ? (
                        <p className="text-[11px] text-muted-foreground line-clamp-1 max-w-[260px]">
                          {project.description}
                        </p>
                      ) : null}
                    </div>
                  </div>
                </TableCell>

                {/* 2. Lead & Team */}
                <TableCell className="py-3.5">
                  <div className="flex items-center gap-2">
                    {project.lead ? (
                      <TooltipProvider delayDuration={200}>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div className="flex items-center gap-1.5 min-w-0">
                              <Avatar className="h-5 w-5 border border-border shrink-0">
                                {project.lead.avatar && (
                                  <AvatarImage src={project.lead.avatar} alt={project.lead.name} />
                                )}
                                <AvatarFallback className="text-[9px] bg-primary/10 text-primary font-bold">
                                  {getInitials(project.lead.name)}
                                </AvatarFallback>
                              </Avatar>
                              <span className="text-xs font-medium text-muted-foreground truncate max-w-[90px]">
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
                      <span className="text-xs text-muted-foreground/60 italic">
                        Unassigned
                      </span>
                    )}

                    {typeof project._count?.projectMembers === 'number' && project._count.projectMembers > 0 && (
                      <TooltipProvider delayDuration={200}>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <span className="inline-flex items-center gap-1 text-[10px] font-medium text-muted-foreground bg-muted/40 px-1.5 py-0.5 rounded shrink-0">
                              <Users className="h-3 w-3 text-muted-foreground/80" />
                              <span>{project._count.projectMembers}</span>
                            </span>
                          </TooltipTrigger>
                          <TooltipContent>
                            {project._count.projectMembers} team members
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    )}
                  </div>
                </TableCell>

                {/* 3. Health */}
                <TableCell className="py-3.5">
                  <ProjectHealthBadge
                    health={project.health || ProjectHealth.ON_TRACK}
                    size="sm"
                  />
                </TableCell>

                {/* 4. Priority */}
                <TableCell className="py-3.5">
                  {project.priority ? (
                    <span
                      className={cn(
                        'text-[10px] font-bold px-2 py-0.5 rounded-full border select-none whitespace-nowrap',
                        getPriorityBadgeColor(project.priority),
                      )}
                    >
                      {project.priority}
                    </span>
                  ) : (
                    <span className="text-xs text-muted-foreground/60">—</span>
                  )}
                </TableCell>

                {/* 5. Status */}
                <TableCell className="py-3.5">
                  <Badge
                    variant={project.status === ProjectStatus.ACTIVE ? 'outline' : 'secondary'}
                    className="text-[10px] py-0.5 px-2 uppercase font-bold tracking-wider whitespace-nowrap"
                  >
                    {project.status}
                  </Badge>
                </TableCell>

                {/* 6. Deliverables */}
                <TableCell className="py-3.5">
                  <ProjectDeliverablesCounter
                    boardsCount={project._count?.boards}
                    sprintsCount={project._count?.sprints}
                    linksCount={project._count?.links}
                    repoUrl={project.repoUrl}
                    size="sm"
                  />
                </TableCell>

                {/* 7. Due Date */}
                <TableCell className="py-3.5">
                  {renderDueDateBadge(project.dueDate, project.status)}
                </TableCell>

                {/* 8. Actions */}
                <TableCell className="pr-5 py-3.5 text-right">
                  <div className="flex items-center justify-end gap-1">
                    <TooltipProvider delayDuration={200}>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={(e) => {
                              e.stopPropagation();
                              router.push(projectUrl);
                            }}
                            className="h-7 w-7 rounded-lg text-muted-foreground hover:text-foreground opacity-60 group-hover:opacity-100"
                          >
                            <ArrowRight className="h-3.5 w-3.5" />
                            <span className="sr-only">Open project</span>
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Open Project</TooltipContent>
                      </Tooltip>
                    </TooltipProvider>

                    {(canEdit || canArchive) && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={(e) => e.stopPropagation()}
                            className="h-7 w-7 rounded-lg text-muted-foreground hover:text-foreground opacity-60 group-hover:opacity-100"
                          >
                            <MoreVertical className="h-3.5 w-3.5" />
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
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
