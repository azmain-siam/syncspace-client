'use client';

import * as React from 'react';
import {
  ArrowLeft,
  ArrowRight,
  Calendar,
  CheckSquare,
  ExternalLink,
  MessageSquare,
  MoreHorizontal,
  Paperclip,
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { useSortable } from '@dnd-kit/react/sortable';
import { TASK_PRIORITY_CONFIG } from '@/lib/constants/task-theme';
import type { Task } from '../types/task.types';

interface TaskCardProps {
  task: Task;
  index?: number;
  columnId?: string;
  canManage: boolean;
  isOverlay?: boolean;
  onSelectTask?: (task: Task) => void;
  availableColumns?: { id: string; title: string }[];
  onMoveToColumn?: (task: Task, columnId: string) => void;
  onDeleteTask?: (task: Task) => void;
}

export function TaskCard({
  task,
  index = 0,
  columnId,
  canManage,
  isOverlay = false,
  onSelectTask,
  availableColumns = [],
  onMoveToColumn,
  onDeleteTask,
}: TaskCardProps) {
  const { ref, isDragSource } = useSortable({
    id: task.id,
    index,
    group: columnId || task.columnId,
    type: 'item',
    accept: ['item'],
    data: {
      type: 'item',
      task,
      columnId: columnId || task.columnId,
      index,
    },
    disabled: !canManage || isOverlay,
  });

  // Due date calculation
  const isOverdue = React.useMemo(() => {
    if (!task.dueDate) return false;
    const due = new Date(task.dueDate);
    const now = new Date();
    // Overdue if past today and task not DONE
    return due < now && task.status !== 'DONE';
  }, [task.dueDate, task.status]);

  const formattedDueDate = React.useMemo(() => {
    if (!task.dueDate) return null;
    const date = new Date(task.dueDate);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  }, [task.dueDate]);

  // Checklists stats
  const checklistStats = React.useMemo(() => {
    const list = task.checklists || [];
    if (list.length === 0) return null;
    const completed = list.filter((i) => i.isCompleted).length;
    return { completed, total: list.length };
  }, [task.checklists]);

  // Counts
  const attachmentCount =
    task._count?.attachments ?? task.attachments?.length ?? 0;
  const linkCount = task._count?.links ?? task.links?.length ?? 0;
  const commentsCount = task._count?.comments ?? 0;

  // Initials for avatar
  const assigneeInitials = React.useMemo(() => {
    if (!task.assignee?.name) return '?';
    const parts = task.assignee.name.trim().split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return parts[0].slice(0, 2).toUpperCase();
  }, [task.assignee]);

  // Directional stage navigation for mobile / quick shortcuts
  const currentColumnIndex = React.useMemo(() => {
    return availableColumns.findIndex((c) => c.id === task.columnId);
  }, [availableColumns, task.columnId]);

  const prevColumn = React.useMemo(() => {
    return currentColumnIndex > 0 ? availableColumns[currentColumnIndex - 1] : null;
  }, [availableColumns, currentColumnIndex]);

  const nextColumn = React.useMemo(() => {
    return currentColumnIndex >= 0 && currentColumnIndex < availableColumns.length - 1
      ? availableColumns[currentColumnIndex + 1]
      : null;
  }, [availableColumns, currentColumnIndex]);

  const otherColumns = React.useMemo(() => {
    return availableColumns.filter(
      (c) => c.id !== task.columnId && c.id !== prevColumn?.id && c.id !== nextColumn?.id,
    );
  }, [availableColumns, task.columnId, prevColumn, nextColumn]);

  return (
    <div
      ref={isOverlay ? undefined : ref}
      data-task-card="true"
      data-task-id={task.id}
      tabIndex={isOverlay ? undefined : 0}
      role="button"
      aria-label={`Task ${task.key || ''}: ${task.title}`}
      onClick={() => {
        onSelectTask?.(task);
      }}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          if ((e.target as HTMLElement).closest('button, a, [role="menuitem"]')) return;
          e.preventDefault();
          onSelectTask?.(task);
        }
      }}
      className={cn(
        'group/task relative flex flex-col gap-2.5 rounded-xl border border-border/80 bg-card p-3 shadow-xs transition-all select-none',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 ring-offset-background',
        !isOverlay && 'hover:border-primary/50 hover:shadow-md cursor-grab active:cursor-grabbing',
        isDragSource && 'opacity-30 scale-[0.98] border-dashed border-primary shadow-lg',
        isOverlay && 'shadow-2xl ring-2 ring-primary/80 border-primary scale-[1.02] cursor-grabbing rotate-1 pointer-events-none',
      )}
    >
      {/* Top Header Row: Key + Priority + Quick Menu */}
      <div className="flex items-center justify-between gap-1.5">
        <div className="flex items-center gap-1.5 flex-wrap min-w-0">
          {task.key && (
            <span className="text-[11px] font-mono font-bold text-muted-foreground bg-muted/80 px-1.5 py-0.5 rounded-md tracking-tight">
              {task.key}
            </span>
          )}

          <span
            className={cn(
              'text-[10px] font-bold px-2 py-0.5 rounded-full border uppercase tracking-wider',
              TASK_PRIORITY_CONFIG[task.priority]?.badgeClass,
            )}
          >
            {task.priority}
          </span>

          {task.storyPoints !== null && task.storyPoints !== undefined && (
            <span className="text-[10px] font-semibold text-muted-foreground bg-muted/50 px-1.5 py-0.5 rounded-md">
              {task.storyPoints} pts
            </span>
          )}
        </div>

        {/* Quick Menu */}
        {canManage && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={(e) => e.stopPropagation()}
                className="h-7 w-7 rounded-md opacity-100 sm:opacity-0 sm:group-hover/task:opacity-100 transition-opacity text-muted-foreground hover:text-foreground hover:bg-muted/80"
                aria-label="Task options"
              >
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              onClick={(e) => e.stopPropagation()}
              className="w-48 rounded-xl p-1 shadow-lg text-xs"
            >
              <DropdownMenuItem
                onClick={() => onSelectTask?.(task)}
                className="cursor-pointer gap-2 py-1.5 font-medium"
              >
                <span>View Details</span>
              </DropdownMenuItem>

              {/* Quick Move Directional Shortcuts for Mobile & Fast Progress */}
              {(nextColumn || prevColumn) && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuLabel className="text-[10px] text-muted-foreground font-semibold px-2 py-1">
                    Quick Move
                  </DropdownMenuLabel>
                  {nextColumn && (
                    <DropdownMenuItem
                      onClick={() => onMoveToColumn?.(task, nextColumn.id)}
                      className="cursor-pointer gap-2 py-1.5 font-medium text-primary focus:text-primary focus:bg-primary/10"
                    >
                      <ArrowRight className="h-3.5 w-3.5 text-primary shrink-0" />
                      <span className="truncate">Move to {nextColumn.title}</span>
                    </DropdownMenuItem>
                  )}
                  {prevColumn && (
                    <DropdownMenuItem
                      onClick={() => onMoveToColumn?.(task, prevColumn.id)}
                      className="cursor-pointer gap-2 py-1.5 font-medium text-muted-foreground focus:text-foreground"
                    >
                      <ArrowLeft className="h-3.5 w-3.5 shrink-0" />
                      <span className="truncate">Back to {prevColumn.title}</span>
                    </DropdownMenuItem>
                  )}
                </>
              )}

              {/* Other columns if more than immediate neighbors */}
              {otherColumns.length > 0 && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuLabel className="text-[10px] text-muted-foreground font-semibold px-2 py-1">
                    Other stages:
                  </DropdownMenuLabel>
                  {otherColumns.map((col) => (
                    <DropdownMenuItem
                      key={col.id}
                      onClick={() => onMoveToColumn?.(task, col.id)}
                      className="cursor-pointer gap-2 py-1.5 text-xs"
                    >
                      <span className="truncate">{col.title}</span>
                    </DropdownMenuItem>
                  ))}
                </>
              )}

              {onDeleteTask && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => onDeleteTask(task)}
                    className="cursor-pointer gap-2 py-1.5 text-destructive focus:bg-destructive/10 focus:text-destructive"
                  >
                    <span>Delete Task</span>
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>

      {/* Task Title */}
      <h4 className="text-xs font-semibold text-foreground line-clamp-2 group-hover/task:text-primary transition-colors leading-relaxed">
        {task.title}
      </h4>

      {/* Footer Row: Metadata Badges + Assignee */}
      <div className="flex items-center justify-between gap-2 pt-1 border-t border-border/40 text-[11px] text-muted-foreground">
        {/* Left indicators */}
        <div className="flex items-center gap-2.5 flex-wrap min-w-0">
          {/* Due date */}
          {formattedDueDate && (
            <div
              className={cn(
                'flex items-center gap-1 shrink-0 font-medium',
                isOverdue
                  ? 'text-destructive font-bold'
                  : 'text-muted-foreground',
              )}
              title={isOverdue ? 'Overdue' : 'Due date'}
            >
              <Calendar className="h-3 w-3" />
              <span>{formattedDueDate}</span>
            </div>
          )}

          {/* Checklist progress */}
          {checklistStats && (
            <div
              className="flex items-center gap-1 shrink-0 text-muted-foreground"
              title={`Checklist: ${checklistStats.completed} of ${checklistStats.total} completed`}
            >
              <CheckSquare className="h-3 w-3 text-primary" />
              <span className="text-[10px] font-semibold">
                {checklistStats.completed}/{checklistStats.total}
              </span>
            </div>
          )}

          {/* Attachment count */}
          {attachmentCount > 0 && (
            <div
              className="flex items-center gap-0.5 shrink-0 text-muted-foreground"
              title={`${attachmentCount} attachments`}
            >
              <Paperclip className="h-3 w-3" />
              <span className="text-[10px] font-semibold">
                {attachmentCount}
              </span>
            </div>
          )}

          {/* Link count */}
          {linkCount > 0 && (
            <div
              className="flex items-center gap-0.5 shrink-0 text-muted-foreground"
              title={`${linkCount} links`}
            >
              <ExternalLink className="h-3 w-3" />
              <span className="text-[10px] font-semibold">{linkCount}</span>
            </div>
          )}

          {/* Comments count */}
          {commentsCount > 0 && (
            <div
              className="flex items-center gap-0.5 shrink-0 text-muted-foreground"
              title={`${commentsCount} comments`}
            >
              <MessageSquare className="h-3 w-3" />
              <span className="text-[10px] font-semibold">
                {commentsCount}
              </span>
            </div>
          )}
        </div>

        {/* Right: Assignee Avatar */}
        <div className="shrink-0">
          {task.assignee ? (
            <Avatar
              className="h-5 w-5 ring-1 ring-border"
              title={`Assigned to ${task.assignee.name}`}
            >
              {task.assignee.avatar && (
                <AvatarImage src={task.assignee.avatar} alt={task.assignee.name} />
              )}
              <AvatarFallback className="text-[9px] bg-primary/10 text-primary font-bold">
                {assigneeInitials}
              </AvatarFallback>
            </Avatar>
          ) : (
            <div
              className="h-5 w-5 rounded-full border border-dashed border-border/80 bg-muted/40 flex items-center justify-center text-[9px] text-muted-foreground"
              title="Unassigned"
            >
              –
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
