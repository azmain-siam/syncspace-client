'use client';

import * as React from 'react';
import {
  ArrowRightLeft,
  Clock,
  Flame,
  GripVertical,
  MoreVertical,
  User as UserIcon,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { SprintTask, Sprint } from '../types/sprint.types';
import { useAssignTaskToSprint } from '../hooks/use-sprint-mutations';
import { TASK_STATUS_CONFIG, TASK_PRIORITY_CONFIG } from '@/lib/constants/task-theme';

interface SprintTaskItemProps {
  task: SprintTask;
  projectId: string;
  sprints?: Sprint[];
  currentSprintId?: string | null;
  onSelectTask?: (taskId: string) => void;
  canManage?: boolean;
  isDragging?: boolean;
}

const PRIORITY_BADGES: Record<
  string,
  { label: string; className: string }
> = {
  URGENT: {
    label: TASK_PRIORITY_CONFIG.URGENT.label,
    className: TASK_PRIORITY_CONFIG.URGENT.badgeClass,
  },
  HIGH: {
    label: TASK_PRIORITY_CONFIG.HIGH.label,
    className: TASK_PRIORITY_CONFIG.HIGH.badgeClass,
  },
  MEDIUM: {
    label: TASK_PRIORITY_CONFIG.MEDIUM.label,
    className: TASK_PRIORITY_CONFIG.MEDIUM.badgeClass,
  },
  LOW: {
    label: TASK_PRIORITY_CONFIG.LOW.label,
    className: TASK_PRIORITY_CONFIG.LOW.badgeClass,
  },
};

const STATUS_BADGES: Record<
  string,
  { label: string; className: string }
> = {
  DONE: {
    label: TASK_STATUS_CONFIG.DONE.label,
    className: TASK_STATUS_CONFIG.DONE.badgeClass,
  },
  REVIEW: {
    label: TASK_STATUS_CONFIG.REVIEW.label,
    className: TASK_STATUS_CONFIG.REVIEW.badgeClass,
  },
  IN_PROGRESS: {
    label: TASK_STATUS_CONFIG.IN_PROGRESS.label,
    className: TASK_STATUS_CONFIG.IN_PROGRESS.badgeClass,
  },
  TODO: {
    label: TASK_STATUS_CONFIG.TODO.label,
    className: TASK_STATUS_CONFIG.TODO.badgeClass,
  },
};

export function SprintTaskItem({
  task,
  projectId,
  sprints = [],
  currentSprintId = null,
  onSelectTask,
  canManage = true,
  isDragging = false,
}: SprintTaskItemProps) {
  const assignMutation = useAssignTaskToSprint(projectId);

  const priorityMeta =
    PRIORITY_BADGES[task.priority] || PRIORITY_BADGES.MEDIUM;
  const statusMeta =
    STATUS_BADGES[task.status] || STATUS_BADGES.TODO;

  const isDone = task.status === 'DONE';

  const handleMoveToSprint = (targetSprintId: string) => {
    assignMutation.mutate({
      taskId: task.id,
      data: {
        sprintId: targetSprintId,
        isBacklog: false,
      },
    });
  };

  const handleMoveToBacklog = () => {
    assignMutation.mutate({
      taskId: task.id,
      data: {
        sprintId: null,
        isBacklog: true,
      },
    });
  };

  return (
    <div
      onClick={() => onSelectTask?.(task.id)}
      className={cn(
        'group relative flex items-center justify-between gap-3 rounded-xl border border-border/70 bg-card p-3 sm:p-3.5 transition-all duration-150 cursor-pointer shadow-2xs hover:border-primary/50 hover:shadow-xs',
        isDragging && 'opacity-50 ring-2 ring-primary scale-[0.99]',
        isDone && 'bg-muted/20 border-border/40',
      )}
    >
      {/* Left section: Key, Title, Labels, Status */}
      <div className="flex items-center gap-2.5 sm:gap-3 min-w-0 flex-1">
        {/* Grip drag handle */}
        {canManage && (
          <div
            onClick={(e) => e.stopPropagation()}
            className="text-muted-foreground/40 group-hover:text-muted-foreground transition-colors cursor-grab active:cursor-grabbing shrink-0"
            title="Drag to reorder or reassign"
          >
            <GripVertical className="h-4 w-4" />
          </div>
        )}

        {/* Task key pill */}
        {task.key && (
          <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded-md bg-muted text-muted-foreground shrink-0 border border-border/60">
            {task.key}
          </span>
        )}

        {/* Title & Status */}
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <span
            className={cn(
              'text-xs sm:text-sm font-medium text-foreground truncate group-hover:text-primary transition-colors',
              isDone && 'line-through text-muted-foreground',
            )}
          >
            {task.title}
          </span>

          {/* Labels */}
          {task.labels && task.labels.length > 0 && (
            <div className="hidden md:flex items-center gap-1 shrink-0">
              {task.labels.slice(0, 2).map((label) => (
                <span
                  key={label.id}
                  className="text-[10px] font-semibold px-1.5 py-0.2 rounded border"
                  style={{
                    backgroundColor: `${label.color}15`,
                    borderColor: `${label.color}40`,
                    color: label.color,
                  }}
                >
                  {label.name}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Right section: Badges, Story Points, Assignee, Actions */}
      <div
        onClick={(e) => e.stopPropagation()}
        className="flex items-center gap-2 sm:gap-3 shrink-0"
      >
        {/* Story Points Pill */}
        {task.storyPoints !== null && task.storyPoints !== undefined && (
          <div
            className="flex items-center gap-1 rounded-md bg-amber-500/10 px-2 py-0.5 text-xs font-semibold text-amber-700 dark:text-amber-400 border border-amber-500/20 shrink-0"
            title={`${task.storyPoints} Story Points`}
          >
            <Flame className="h-3 w-3" />
            <span>{task.storyPoints}</span>
          </div>
        )}

        {/* Estimated Hours (desktop) */}
        {task.estimatedHours !== null && task.estimatedHours !== undefined && (
          <div
            className="hidden lg:flex items-center gap-1 text-[11px] text-muted-foreground font-medium shrink-0"
            title={`${task.estimatedHours} hours estimated`}
          >
            <Clock className="h-3 w-3 text-muted-foreground/70" />
            <span>{task.estimatedHours}h</span>
          </div>
        )}

        {/* Priority Badge */}
        <span
          className={cn(
            'hidden sm:inline-flex items-center rounded-md px-2 py-0.5 text-[11px] font-semibold border',
            priorityMeta.className,
          )}
        >
          {priorityMeta.label}
        </span>

        {/* Status Badge */}
        <span
          className={cn(
            'inline-flex items-center rounded-md px-2 py-0.5 text-[11px] font-semibold border',
            statusMeta.className,
          )}
        >
          {statusMeta.label}
        </span>

        {/* Assignee Avatar */}
        <div className="shrink-0">
          {task.assignee ? (
            <Avatar className="h-6 w-6 ring-1 ring-border">
              <AvatarImage
                src={task.assignee.avatar || undefined}
                alt={task.assignee.name}
              />
              <AvatarFallback className="text-[10px] bg-primary/10 text-primary font-semibold">
                {task.assignee.name.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
          ) : (
            <div
              className="flex h-6 w-6 items-center justify-center rounded-full border border-dashed border-border bg-muted/30 text-muted-foreground"
              title="Unassigned"
            >
              <UserIcon className="h-3 w-3" />
            </div>
          )}
        </div>

        {/* Reassign Sprint / Backlog Menu */}
        {canManage && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-muted-foreground hover:text-foreground opacity-70 group-hover:opacity-100 transition-opacity"
              >
                <MoreVertical className="h-3.5 w-3.5" />
                <span className="sr-only">Task actions</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-52">
              <DropdownMenuLabel className="text-xs text-muted-foreground font-normal">
                Move Task Destination
              </DropdownMenuLabel>
              <DropdownMenuSeparator />

              {/* Option to move to backlog */}
              {currentSprintId !== null && (
                <DropdownMenuItem
                  onClick={handleMoveToBacklog}
                  className="gap-2 cursor-pointer text-xs"
                >
                  <ArrowRightLeft className="h-3.5 w-3.5 text-muted-foreground" />
                  Move to Product Backlog
                </DropdownMenuItem>
              )}

              {/* Options to move to active or planned sprints */}
              {sprints
                .filter((s) => s.id !== currentSprintId && s.status !== 'COMPLETED')
                .map((targetSprint) => (
                  <DropdownMenuItem
                    key={targetSprint.id}
                    onClick={() => handleMoveToSprint(targetSprint.id)}
                    className="gap-2 cursor-pointer text-xs"
                  >
                    <ArrowRightLeft className="h-3.5 w-3.5 text-primary" />
                    Move to {targetSprint.name}
                  </DropdownMenuItem>
                ))}

              {sprints.filter(
                (s) => s.id !== currentSprintId && s.status !== 'COMPLETED',
              ).length === 0 &&
                currentSprintId === null && (
                  <div className="px-2 py-1.5 text-[11px] text-muted-foreground italic">
                    No active or planned sprints available
                  </div>
                )}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </div>
  );
}
