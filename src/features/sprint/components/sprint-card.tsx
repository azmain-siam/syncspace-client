'use client';

import * as React from 'react';
import {
  Calendar,
  ChevronDown,
  ChevronRight,
  Edit2,
  Flame,
  MoreHorizontal,
  Play,
  Plus,
  Trash2,
  CheckCircle2,
  Layers,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { Sprint } from '../types/sprint.types';
import { SprintCapacityBar } from './sprint-capacity-bar';
import { EditSprintModal } from './edit-sprint-modal';
import { StartSprintDialog } from './start-sprint-dialog';
import { CompleteSprintModal } from './complete-sprint-modal';
import { DeleteSprintDialog } from './delete-sprint-dialog';

interface SprintCardProps {
  sprint: Sprint;
  projectId: string;
  activeSprint?: Sprint | null;
  futureSprints?: Sprint[];
  isExpanded?: boolean;
  onToggleExpand?: () => void;
  children?: React.ReactNode;
  onQuickAddTask?: () => void;
  canManageSprint?: boolean;
}

function formatSprintDates(startDate?: string | null, endDate?: string | null): string {
  if (!startDate && !endDate) return 'No dates scheduled';

  const format = (dStr: string) => {
    try {
      const d = new Date(dStr);
      return d.toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return '';
    }
  };

  if (startDate && endDate) {
    return `${format(startDate)} – ${format(endDate)}`;
  }
  if (startDate) {
    return `Starts ${format(startDate)}`;
  }
  return `Ends ${format(endDate!)}`;
}

export function SprintCard({
  sprint,
  projectId,
  activeSprint,
  futureSprints = [],
  isExpanded = true,
  onToggleExpand,
  children,
  onQuickAddTask,
  canManageSprint = true,
}: SprintCardProps) {
  // Modal states
  const [isEditOpen, setIsEditOpen] = React.useState(false);
  const [isStartOpen, setIsStartOpen] = React.useState(false);
  const [isCompleteOpen, setIsCompleteOpen] = React.useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = React.useState(false);

  const isActive = sprint.status === 'ACTIVE';
  const isPlanning = sprint.status === 'PLANNING';
  const isCompleted = sprint.status === 'COMPLETED';

  const taskCount = sprint.tasks?.length ?? sprint.metrics?.totalTasks ?? 0;
  const storyPoints = sprint.metrics?.totalStoryPoints ?? 0;

  return (
    <>
      <div
        className={cn(
          'rounded-2xl border transition-all duration-200 bg-card overflow-hidden shadow-xs',
          isActive
            ? 'border-primary/40 ring-1 ring-primary/20 shadow-md'
            : 'border-border/80 hover:border-border',
        )}
      >
        {/* Sprint Header */}
        <div className="p-4 sm:p-5 flex flex-col gap-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            {/* Left side: Expand toggle, Title, Status, Dates */}
            <div className="flex items-start sm:items-center gap-3 min-w-0">
              <button
                type="button"
                onClick={onToggleExpand}
                className="mt-0.5 sm:mt-0 p-1 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors cursor-pointer"
                aria-label={isExpanded ? 'Collapse sprint' : 'Expand sprint'}
              >
                {isExpanded ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
              </button>

              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h3
                    onClick={onToggleExpand}
                    className="font-bold text-base sm:text-lg text-foreground tracking-tight hover:text-primary transition-colors cursor-pointer truncate"
                  >
                    {sprint.name}
                  </h3>

                  {/* Status Badge */}
                  {isActive && (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                      </span>
                      ACTIVE
                    </span>
                  )}

                  {isPlanning && (
                    <Badge variant="secondary" className="text-xs font-semibold">
                      PLANNING
                    </Badge>
                  )}

                  {isCompleted && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-purple-500/10 px-2.5 py-0.5 text-xs font-semibold text-purple-600 dark:text-purple-400 border border-purple-500/20">
                      <CheckCircle2 className="h-3 w-3" />
                      COMPLETED
                    </span>
                  )}

                  {/* Task & SP count summary pill */}
                  <span className="text-xs text-muted-foreground font-medium hidden sm:inline-block">
                    • {taskCount} {taskCount === 1 ? 'task' : 'tasks'}
                  </span>
                  {storyPoints > 0 && (
                    <span className="inline-flex items-center gap-1 text-xs text-amber-600 dark:text-amber-400 font-semibold">
                      <Flame className="h-3 w-3" />
                      {storyPoints} SP
                    </span>
                  )}
                </div>

                {/* Subtitle: Date range & sprint goal */}
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground mt-1">
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {formatSprintDates(sprint.startDate, sprint.endDate)}
                  </span>
                  {sprint.goal && (
                    <>
                      <span className="hidden sm:inline">•</span>
                      <span className="line-clamp-1 italic text-foreground/80 max-w-md">
                        &quot;{sprint.goal}&quot;
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Right side: Actions & Sprint lifecycle triggers */}
            <div className="flex items-center justify-end gap-2 self-end sm:self-center shrink-0">
              {canManageSprint && isPlanning && (
                <Button
                  size="sm"
                  onClick={() => setIsStartOpen(true)}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5 h-8 text-xs font-semibold"
                >
                  <Play className="h-3.5 w-3.5 fill-current" />
                  Start Sprint
                </Button>
              )}

              {canManageSprint && isActive && (
                <Button
                  size="sm"
                  onClick={() => setIsCompleteOpen(true)}
                  className="gap-1.5 h-8 text-xs font-semibold"
                >
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  Complete Sprint
                </Button>
              )}

              {/* Overflow Menu */}
              {canManageSprint && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground hover:text-foreground"
                    >
                      <MoreHorizontal className="h-4 w-4" />
                      <span className="sr-only">Sprint options</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-44">
                    <DropdownMenuItem
                      onClick={() => setIsEditOpen(true)}
                      className="gap-2 cursor-pointer"
                    >
                      <Edit2 className="h-3.5 w-3.5 text-muted-foreground" />
                      Edit Sprint
                    </DropdownMenuItem>
                    {onQuickAddTask && (
                      <DropdownMenuItem
                        onClick={onQuickAddTask}
                        className="gap-2 cursor-pointer"
                      >
                        <Plus className="h-3.5 w-3.5 text-muted-foreground" />
                        Add Task to Sprint
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => setIsDeleteOpen(true)}
                      className="gap-2 text-danger focus:text-danger cursor-pointer"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      Delete Sprint
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          </div>

          {/* Progress / Capacity Metric Bar */}
          {sprint.metrics && (
            <div className="pt-2 border-t border-border/50">
              <SprintCapacityBar
                metrics={sprint.metrics}
                status={sprint.status}
              />
            </div>
          )}
        </div>

        {/* Collapsible Body (Tasks List) */}
        {isExpanded && (
          <div className="border-t border-border/60 bg-muted/10 p-3 sm:p-4">
            {children ? (
              children
            ) : (
              <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border/80 p-8 text-center bg-background/50">
                <Layers className="h-8 w-8 text-muted-foreground/50 mb-2" />
                <p className="text-sm font-semibold text-foreground">
                  No tasks assigned to this sprint yet
                </p>
                <p className="text-xs text-muted-foreground max-w-xs mt-1">
                  Drag tasks from the product backlog into this sprint or use the action below to add tasks.
                </p>
                {onQuickAddTask && canManageSprint && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={onQuickAddTask}
                    className="mt-3 gap-1.5 h-8 text-xs"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    Add Task
                  </Button>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Lifecycle Modals */}
      <EditSprintModal
        open={isEditOpen}
        onOpenChange={setIsEditOpen}
        projectId={projectId}
        sprint={sprint}
      />

      <StartSprintDialog
        open={isStartOpen}
        onOpenChange={setIsStartOpen}
        projectId={projectId}
        sprint={sprint}
        activeSprint={activeSprint}
      />

      <CompleteSprintModal
        open={isCompleteOpen}
        onOpenChange={setIsCompleteOpen}
        projectId={projectId}
        sprint={sprint}
        futureSprints={futureSprints}
      />

      <DeleteSprintDialog
        open={isDeleteOpen}
        onOpenChange={setIsDeleteOpen}
        projectId={projectId}
        sprint={sprint}
      />
    </>
  );
}
