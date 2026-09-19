'use client';

import * as React from 'react';
import {
  Calendar,
  CheckSquare,
  ExternalLink,
  MessageSquare,
  MoreHorizontal,
  Paperclip,
} from 'lucide-react';
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
import { cn } from '@/lib/utils';
import type { Task, TaskPriority } from '../types/task.types';

interface TaskCardProps {
  task: Task;
  index: number;
  canManage: boolean;
  onSelectTask?: (task: Task) => void;
  onDragStart?: (e: React.DragEvent, task: Task) => void;
  onDragOver?: (e: React.DragEvent, task: Task) => void;
  onDrop?: (e: React.DragEvent, targetTask: Task) => void;
  onDragEnd?: (e: React.DragEvent) => void;
  isDragging?: boolean;
  isDragOver?: boolean;
  availableColumns?: { id: string; title: string }[];
  onMoveToColumn?: (task: Task, columnId: string) => void;
  onDeleteTask?: (task: Task) => void;
}

export function TaskCard({
  task,
  canManage,
  onSelectTask,
  onDragStart,
  onDragOver,
  onDrop,
  onDragEnd,
  isDragging = false,
  isDragOver = false,
  availableColumns = [],
  onMoveToColumn,
  onDeleteTask,
}: TaskCardProps) {
  const priorityColors: Record<TaskPriority, string> = {
    URGENT: 'bg-red-500/15 text-red-600 dark:text-red-400 border-red-500/30',
    HIGH: 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30',
    MEDIUM: 'bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/30',
    LOW: 'bg-slate-500/15 text-slate-600 dark:text-slate-300 border-slate-500/30',
  };

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

  return (
    <div
      data-task-card="true"
      data-task-id={task.id}
      draggable={canManage}
      onDragStart={(e) => {
        if (!canManage) return;
        e.stopPropagation();
        e.dataTransfer.setData('text/plain', task.id);
        e.dataTransfer.setData('syncspace/type', 'task');
        e.dataTransfer.effectAllowed = 'move';
        onDragStart?.(e, task);
      }}
      onDragOver={(e) => {
        if (canManage) {
          e.preventDefault();
          e.stopPropagation();
          onDragOver?.(e, task);
        }
      }}
      onDrop={(e) => {
        if (canManage) {
          e.preventDefault();
          e.stopPropagation();
          onDrop?.(e, task);
        }
      }}
      onDragEnd={(e) => {
        onDragEnd?.(e);
      }}
      onClick={() => onSelectTask?.(task)}
      className={cn(
        'group/task relative flex flex-col gap-2.5 rounded-xl border border-border/80 bg-card p-3 shadow-xs hover:border-primary/50 hover:shadow-md transition-all cursor-pointer select-none',
        isDragging && 'opacity-30 scale-[0.98] border-dashed border-primary shadow-lg',
        isDragOver && !isDragging && 'border-primary ring-2 ring-primary/60 bg-primary/5 -translate-y-0.5',
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
              priorityColors[task.priority] || priorityColors.MEDIUM,
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
                className="h-6 w-6 rounded-md opacity-0 group-hover/task:opacity-100 transition-opacity text-muted-foreground hover:text-foreground"
                aria-label="Task options"
              >
                <MoreHorizontal className="h-3.5 w-3.5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              onClick={(e) => e.stopPropagation()}
              className="w-44 rounded-xl p-1 shadow-lg text-xs"
            >
              <DropdownMenuItem
                onClick={() => onSelectTask?.(task)}
                className="cursor-pointer gap-2 py-1.5 font-medium"
              >
                <span>View Details</span>
              </DropdownMenuItem>

              {availableColumns.length > 1 && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuLabel className="text-[10px] text-muted-foreground font-semibold px-2 py-1">
                    Move to column:
                  </DropdownMenuLabel>
                  {availableColumns
                    .filter((c) => c.id !== task.columnId)
                    .map((col) => (
                      <DropdownMenuItem
                        key={col.id}
                        onClick={() => onMoveToColumn?.(task, col.id)}
                        className="cursor-pointer gap-2 py-1.5 text-xs"
                      >
                        <span>{col.title}</span>
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
