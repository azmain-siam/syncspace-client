'use client';

import * as React from 'react';
import Link from 'next/link';
import { Calendar, MoreVertical, Pencil, Trash2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { Project } from '@/types/domain';
import { ProjectPriority, ProjectStatus } from '@/types/domain';

interface ProjectCardProps {
  project: Project;
  workspaceSlug: string;
  onEdit: (project: Project) => void;
  onArchive: (project: Project) => void;
}

export function ProjectCard({
  project,
  workspaceSlug,
  onEdit,
  onArchive,
}: ProjectCardProps) {
  const accentColor = project.color || '#4648d4';

  const getStatusBadgeVariant = (status: ProjectStatus) => {
    switch (status) {
      case ProjectStatus.ACTIVE:
        return 'default';
      case ProjectStatus.PLANNING:
        return 'secondary';
      case ProjectStatus.COMPLETED:
        return 'outline';
      case ProjectStatus.ON_HOLD:
        return 'danger';
      default:
        return 'secondary';
    }
  };

  const getPriorityBadgeColor = (priority: ProjectPriority) => {
    switch (priority) {
      case ProjectPriority.CRITICAL:
        return 'bg-red-500/10 text-red-500 border-red-500/20';
      case ProjectPriority.HIGH:
        return 'bg-amber-500/10 text-amber-500 border-amber-500/20';
      case ProjectPriority.MEDIUM:
        return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
      case ProjectPriority.LOW:
        return 'bg-slate-500/10 text-slate-500 border-slate-500/20';
    }
  };

  return (
    <Card className="group relative rounded-2xl border border-border bg-card transition-all duration-200 hover:border-primary/50 hover:shadow-md flex flex-col justify-between overflow-hidden">
      {/* Top Color Accent Line */}
      <div
        className="h-1.5 w-full transition-opacity group-hover:opacity-100"
        style={{ backgroundColor: accentColor }}
      />

      <CardHeader className="p-5 pb-3">
        <div className="flex items-start justify-between gap-3">
          {/* Title & Status */}
          <div className="space-y-1.5 min-w-0">
            <Link
              href={`/workspaces/${workspaceSlug}/projects/${project.id}`}
              className="text-base font-bold text-foreground hover:text-primary transition-colors line-clamp-1 block"
            >
              {project.title}
            </Link>
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant={getStatusBadgeVariant(project.status)}>
                {project.status}
              </Badge>

              {project.priority && (
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getPriorityBadgeColor(
                    project.priority,
                  )}`}
                >
                  {project.priority}
                </span>
              )}
            </div>
          </div>

          {/* Action Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-lg text-muted-foreground opacity-80 group-hover:opacity-100 hover:text-foreground shrink-0"
              >
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="rounded-xl w-36 p-1">
              <DropdownMenuItem
                onSelect={() => onEdit(project)}
                className="rounded-lg gap-2 text-xs font-semibold cursor-pointer py-2"
              >
                <Pencil className="h-3.5 w-3.5" /> Edit
              </DropdownMenuItem>
              <DropdownMenuItem
                onSelect={() => onArchive(project)}
                className="rounded-lg gap-2 text-xs font-semibold cursor-pointer py-2 text-danger focus:text-danger"
              >
                <Trash2 className="h-3.5 w-3.5" /> Archive
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>

      <CardContent className="p-5 pt-0 flex-1 flex flex-col justify-between gap-4">
        {/* Description */}
        <p className="text-xs text-muted-foreground line-clamp-2 min-h-[32px]">
          {project.description || 'No description provided.'}
        </p>

        {/* Footer Meta: Due Date & Details Link */}
        <div className="pt-3 border-t border-border/60 flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-1.5 text-[11px] font-medium">
            <Calendar className="h-3.5 w-3.5 text-muted-foreground/70" />
            <span>
              {project.dueDate
                ? new Date(project.dueDate).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                  })
                : 'No due date'}
            </span>
          </div>

          <Link
            href={`/workspaces/${workspaceSlug}/projects/${project.id}`}
            className="text-xs font-semibold text-primary hover:underline"
          >
            Open Project →
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
