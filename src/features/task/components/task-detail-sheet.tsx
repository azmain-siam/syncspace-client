'use client';

import * as React from 'react';
import {
  Activity,
  AlertTriangle,
  Calendar,
  Check,
  CheckSquare,
  Copy,
  ExternalLink,
  Layers,
  Loader2,
  MessageSquare,
  MoreVertical,
  Paperclip,
  Kanban,
  Trash2,
  User,
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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Textarea } from '@/components/ui/textarea';
import { CommentThread } from '@/features/comment';
import { TaskActivityHistory } from '@/features/safety';
import { useWorkspaceMembers } from '@/features/workspace/hooks/use-workspace-members';
import { useWorkspacePermissions } from '@/features/workspace/hooks/use-workspace-permissions';
import { cn } from '@/lib/utils';
import { useDeleteTask } from '../hooks/use-delete-task';
import { useTaskDetails } from '../hooks/use-task-details';
import { useUpdateTask } from '../hooks/use-update-task';
import { useTaskRealtime } from '../hooks/use-task-realtime';
import type { Task, TaskPriority, TaskStatus } from '../types/task.types';
import { useMoveTask } from '../hooks/use-move-task';
import { mapColumnTitleToTaskStatus } from '../utils/task-status-mapper';
import { TaskAttachments } from './task-attachments';
import { TaskChecklists } from './task-checklists';
import { TaskLinks } from './task-links';

interface TaskDetailSheetProps {
  taskIdOrKey: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  workspaceId: string;
  projectId: string;
  boardId?: string;
  columns?: { id: string; title: string }[];
  canManage?: boolean;
  canDelete?: boolean;
  onTaskDeleted?: () => void;
}

const PRIORITY_CONFIG: Record<
  TaskPriority,
  { label: string; bg: string; text: string; border: string }
> = {
  URGENT: {
    label: 'Urgent',
    bg: 'bg-red-500/10',
    text: 'text-red-600 dark:text-red-400',
    border: 'border-red-500/30',
  },
  HIGH: {
    label: 'High',
    bg: 'bg-amber-500/10',
    text: 'text-amber-600 dark:text-amber-400',
    border: 'border-amber-500/30',
  },
  MEDIUM: {
    label: 'Medium',
    bg: 'bg-blue-500/10',
    text: 'text-blue-600 dark:text-blue-400',
    border: 'border-blue-500/30',
  },
  LOW: {
    label: 'Low',
    bg: 'bg-slate-500/10',
    text: 'text-slate-600 dark:text-slate-400',
    border: 'border-slate-500/30',
  },
};

const STATUS_CONFIG: Record<
  TaskStatus,
  { label: string; bg: string; text: string; border: string }
> = {
  TODO: {
    label: 'To Do',
    bg: 'bg-slate-500/10',
    text: 'text-slate-600 dark:text-slate-400',
    border: 'border-slate-500/30',
  },
  IN_PROGRESS: {
    label: 'In Progress',
    bg: 'bg-blue-500/10',
    text: 'text-blue-600 dark:text-blue-400',
    border: 'border-blue-500/30',
  },
  REVIEW: {
    label: 'In Review',
    bg: 'bg-amber-500/10',
    text: 'text-amber-600 dark:text-amber-400',
    border: 'border-amber-500/30',
  },
  DONE: {
    label: 'Completed',
    bg: 'bg-emerald-500/10',
    text: 'text-emerald-600 dark:text-emerald-400',
    border: 'border-emerald-500/30',
  },
};

export function TaskDetailSheet({
  taskIdOrKey,
  open,
  onOpenChange,
  workspaceId,
  projectId,
  boardId,
  columns,
  canManage = true,
  canDelete,
  onTaskDeleted,
}: TaskDetailSheetProps) {
  const permissions = useWorkspacePermissions(workspaceId);
  const { data: taskResponse, isLoading, error } = useTaskDetails(
    open ? taskIdOrKey : null,
  );
  const task: Task | undefined = taskResponse?.data;
  const canDeleteResolved = canDelete ?? (task ? permissions.canDeleteTask(task.createdBy) : false);

  // Subscribe to real-time task room events (task updates, comments, reactions)
  useTaskRealtime(open ? task?.id || taskIdOrKey : null);

  const updateMutation = useUpdateTask(workspaceId, projectId, boardId);
  const deleteMutation = useDeleteTask(workspaceId, projectId, boardId);
  const moveTaskMutation = useMoveTask(workspaceId, projectId, boardId || '');
  const { data: membersResponse } = useWorkspaceMembers(workspaceId);
  const members = membersResponse?.data || [];

  // Local form state for inline editing
  const [prevTaskId, setPrevTaskId] = React.useState<string | null>(null);
  const [title, setTitle] = React.useState('');
  const [description, setDescription] = React.useState('');
  const [copiedKey, setCopiedKey] = React.useState(false);
  const [activeTab, setActiveTab] = React.useState<
    'comments' | 'checklists' | 'attachments' | 'links' | 'activity'
  >('comments');

  // Synchronize state during render when task changes
  if (task && task.id !== prevTaskId) {
    setPrevTaskId(task.id);
    setTitle(task.title);
    setDescription(task.description || '');
  }

  const handleTitleBlur = () => {
    if (!task || !canManage) return;
    const trimmed = title.trim();
    if (trimmed && trimmed !== task.title) {
      updateMutation.mutate({
        taskId: task.id,
        data: { title: trimmed },
      });
    }
  };

  const handleDescriptionBlur = () => {
    if (!task || !canManage) return;
    const current = task.description || '';
    if (description !== current) {
      updateMutation.mutate({
        taskId: task.id,
        data: { description: description.trim() || null },
      });
    }
  };

  const handleStatusChange = (status: TaskStatus) => {
    if (!task || !canManage) return;
    updateMutation.mutate({
      taskId: task.id,
      data: { status },
    });
  };

  const handleMoveToColumn = (targetColumnId: string) => {
    if (!task || !canManage) return;
    const targetCol = columns?.find((c) => c.id === targetColumnId);
    const targetStatus = mapColumnTitleToTaskStatus(targetCol?.title);
    moveTaskMutation.mutate({
      taskId: task.id,
      targetColumnId,
      targetOrder: 0,
      status: targetStatus,
    });
  };

  const handlePriorityChange = (priority: TaskPriority) => {
    if (!task || !canManage) return;
    updateMutation.mutate({
      taskId: task.id,
      data: { priority },
    });
  };

  const handleAssigneeChange = (assigneeId: string | null) => {
    if (!task || !canManage) return;
    updateMutation.mutate({
      taskId: task.id,
      data: { assigneeId },
    });
  };

  const handleDueDateChange = (dueDate: string) => {
    if (!task || !canManage) return;
    updateMutation.mutate({
      taskId: task.id,
      data: { dueDate: dueDate ? new Date(dueDate).toISOString() : null },
    });
  };

  const handleStoryPointsChange = (val: string) => {
    if (!task || !canManage) return;
    const num = val === '' ? null : parseInt(val, 10);
    if (num !== null && (isNaN(num) || num < 0 || num > 100)) return;
    updateMutation.mutate({
      taskId: task.id,
      data: { storyPoints: num },
    });
  };

  const handleCopyKey = () => {
    if (!task) return;
    navigator.clipboard.writeText(task.key || task.id);
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2000);
  };

  const handleDelete = () => {
    if (!task || !canDeleteResolved) return;
    if (confirm(`Are you sure you want to delete task ${task.key}?`)) {
      deleteMutation.mutate(task.id, {
        onSuccess: () => {
          onOpenChange(false);
          onTaskDeleted?.();
        },
      });
    }
  };

  const formattedDueDate = task?.dueDate
    ? new Date(task.dueDate).toISOString().split('T')[0]
    : '';

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-xl md:max-w-2xl lg:max-w-3xl overflow-y-auto p-0 gap-0 border-l border-border bg-card shadow-2xl"
      >
        <SheetHeader className="sr-only">
          <SheetTitle>{task?.title || 'Task Details'}</SheetTitle>
        </SheetHeader>

        {isLoading ? (
          <div className="flex h-full flex-col items-center justify-center p-12 text-sm text-muted-foreground">
            <Loader2 className="size-8 animate-spin text-primary mb-3" />
            <p>Loading task details...</p>
          </div>
        ) : error || !task ? (
          <div className="flex h-full flex-col items-center justify-center p-12 text-center">
            <AlertTriangle className="size-10 text-amber-500 mb-3" />
            <h3 className="text-base font-semibold text-foreground">
              Task Not Found
            </h3>
            <p className="mt-1 text-xs text-muted-foreground max-w-sm">
              The requested task could not be located, or you don&apos;t have permission
              to view it.
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onOpenChange(false)}
              className="mt-4 text-xs"
            >
              Close
            </Button>
          </div>
        ) : (
          <div className="flex flex-col min-h-full">
            {/* Top Toolbar */}
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/80 px-4 sm:px-6 py-3 bg-muted/20 pr-12 sm:pr-6">
              <div className="flex flex-wrap items-center gap-2">
                {/* Key Chip */}
                <button
                  type="button"
                  onClick={handleCopyKey}
                  className="group flex items-center gap-1 rounded-md bg-secondary/80 px-2 py-0.5 font-mono text-xs font-semibold text-foreground hover:bg-secondary transition-colors cursor-pointer"
                  title="Click to copy task key"
                >
                  <span>{task.key}</span>
                  {copiedKey ? (
                    <Check className="size-3 text-emerald-500" />
                  ) : (
                    <Copy className="size-3 text-muted-foreground opacity-60 group-hover:opacity-100" />
                  )}
                </button>

                {/* Stage / Column Selector (Authoritative on Board) */}
                {columns && columns.length > 0 ? (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild disabled={!canManage}>
                      <button
                        type="button"
                        className={cn(
                          'inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-semibold border transition-colors cursor-pointer',
                          STATUS_CONFIG[task.status]?.bg,
                          STATUS_CONFIG[task.status]?.text,
                          STATUS_CONFIG[task.status]?.border,
                        )}
                      >
                        <Kanban className="size-3" />
                        <span>{columns.find((c) => c.id === task.columnId)?.title || STATUS_CONFIG[task.status]?.label}</span>
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start">
                      <DropdownMenuLabel className="text-xs">Stage / Column</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      {columns.map((col) => {
                        const colStatus = mapColumnTitleToTaskStatus(col.title);
                        return (
                          <DropdownMenuItem
                            key={col.id}
                            onClick={() => handleMoveToColumn(col.id)}
                            className="text-xs cursor-pointer flex items-center justify-between"
                          >
                            <span className={STATUS_CONFIG[colStatus]?.text}>
                              {col.title}
                            </span>
                            {task.columnId === col.id && <Check className="size-3 text-primary" />}
                          </DropdownMenuItem>
                        );
                      })}
                    </DropdownMenuContent>
                  </DropdownMenu>
                ) : (
                  /* Fallback Status Selector when board columns are not available */
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild disabled={!canManage}>
                      <button
                        type="button"
                        className={cn(
                          'inline-flex items-center gap-1 rounded-md px-2.5 py-0.5 text-xs font-medium border transition-colors cursor-pointer',
                          STATUS_CONFIG[task.status]?.bg,
                          STATUS_CONFIG[task.status]?.text,
                          STATUS_CONFIG[task.status]?.border,
                        )}
                      >
                        {STATUS_CONFIG[task.status]?.label}
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start">
                      <DropdownMenuLabel className="text-xs">Status</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      {(Object.keys(STATUS_CONFIG) as TaskStatus[]).map((st) => (
                        <DropdownMenuItem
                          key={st}
                          onClick={() => handleStatusChange(st)}
                          className="text-xs cursor-pointer flex items-center justify-between"
                        >
                          <span className={STATUS_CONFIG[st].text}>
                            {STATUS_CONFIG[st].label}
                          </span>
                          {task.status === st && <Check className="size-3 text-primary" />}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}

                {/* Priority Selector */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild disabled={!canManage}>
                    <button
                      type="button"
                      className={cn(
                        'inline-flex items-center gap-1 rounded-md px-2.5 py-0.5 text-xs font-medium border transition-colors cursor-pointer',
                        PRIORITY_CONFIG[task.priority]?.bg,
                        PRIORITY_CONFIG[task.priority]?.text,
                        PRIORITY_CONFIG[task.priority]?.border,
                      )}
                    >
                      {PRIORITY_CONFIG[task.priority]?.label}
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start">
                    <DropdownMenuLabel className="text-xs">Priority</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    {(Object.keys(PRIORITY_CONFIG) as TaskPriority[]).map((pr) => (
                      <DropdownMenuItem
                        key={pr}
                        onClick={() => handlePriorityChange(pr)}
                        className="text-xs cursor-pointer flex items-center justify-between"
                      >
                        <span className={PRIORITY_CONFIG[pr].text}>
                          {PRIORITY_CONFIG[pr].label}
                        </span>
                        {task.priority === pr && <Check className="size-3 text-primary" />}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              {/* Action Menu */}
              <div className="flex items-center gap-1">
                {updateMutation.isPending && (
                  <span className="text-[11px] text-muted-foreground flex items-center gap-1 mr-1">
                    <Loader2 className="size-3 animate-spin" />
                    <span className="hidden sm:inline">Saving...</span>
                  </span>
                )}

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="size-8 cursor-pointer">
                      <MoreVertical className="size-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      onClick={handleCopyKey}
                      className="text-xs cursor-pointer"
                    >
                      <Copy className="size-3.5 mr-2" />
                      Copy Task Key
                    </DropdownMenuItem>
                    {canDeleteResolved && (
                      <>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={handleDelete}
                          className="text-xs text-destructive focus:text-destructive cursor-pointer"
                        >
                          <Trash2 className="size-3.5 mr-2" />
                          Delete Task
                        </DropdownMenuItem>
                      </>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            {/* Main Content Area */}
            <div className="p-4 sm:p-6 space-y-5 sm:space-y-6 flex-1">
              {/* Task Title */}
              <div>
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  onBlur={handleTitleBlur}
                  disabled={!canManage}
                  placeholder="Task title..."
                  className="text-base sm:text-lg md:text-xl font-bold border-none px-1 h-auto py-1 shadow-none focus-visible:ring-1 focus-visible:ring-primary/40 text-foreground bg-transparent"
                />
              </div>

              {/* Attributes Grid (Assignee, Due Date, Story Points) */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 rounded-xl border border-border/70 bg-muted/20 p-3 sm:p-3.5">
                {/* Assignee */}
                <div className="space-y-1">
                  <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                    <User className="size-3" /> Assignee
                  </span>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild disabled={!canManage}>
                      <button
                        type="button"
                        className="flex w-full items-center gap-2 rounded-md p-1 hover:bg-muted/50 transition-colors text-left cursor-pointer"
                      >
                        {task.assignee ? (
                          <>
                            <Avatar className="size-6 shrink-0">
                              {task.assignee.avatar && (
                                <AvatarImage
                                  src={task.assignee.avatar}
                                  alt={task.assignee.name}
                                />
                              )}
                              <AvatarFallback className="text-[10px] font-medium bg-primary/10 text-primary">
                                {task.assignee.name.slice(0, 2).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <span className="text-xs font-medium text-foreground truncate">
                              {task.assignee.name}
                            </span>
                          </>
                        ) : (
                          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                            <div className="size-6 rounded-full border border-dashed border-border flex items-center justify-center">
                              <User className="size-3" />
                            </div>
                            <span>Unassigned</span>
                          </div>
                        )}
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start" className="w-56">
                      <DropdownMenuLabel className="text-xs">
                        Assign team member
                      </DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => handleAssigneeChange(null)}
                        className="text-xs cursor-pointer"
                      >
                        Unassigned
                      </DropdownMenuItem>
                      {members.map((m) => (
                        <DropdownMenuItem
                          key={m.id}
                          onClick={() => handleAssigneeChange(m.userId)}
                          className="text-xs cursor-pointer flex items-center justify-between"
                        >
                          <div className="flex items-center gap-2 truncate">
                            <Avatar className="size-5">
                              {m.user?.avatar && (
                                <AvatarImage
                                  src={m.user.avatar}
                                  alt={m.user.name}
                                />
                              )}
                              <AvatarFallback className="text-[9px]">
                                {m.user?.name?.slice(0, 2).toUpperCase() || 'U'}
                              </AvatarFallback>
                            </Avatar>
                            <span className="truncate">{m.user?.name}</span>
                          </div>
                          {task.assigneeId === m.userId && (
                            <Check className="size-3 text-primary shrink-0" />
                          )}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                {/* Due Date */}
                <div className="space-y-1">
                  <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                    <Calendar className="size-3" /> Due Date
                  </span>
                  <input
                    type="date"
                    value={formattedDueDate}
                    disabled={!canManage}
                    onChange={(e) => handleDueDateChange(e.target.value)}
                    aria-label="Task Due Date"
                    className="h-7 w-full rounded-md border border-input/60 bg-background px-2 text-xs text-foreground focus:outline-hidden focus:ring-1 focus:ring-ring"
                  />
                </div>

                {/* Story Points */}
                <div className="space-y-1">
                  <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                    <Layers className="size-3" /> Story Points
                  </span>
                  <Input
                    type="number"
                    min="0"
                    max="100"
                    placeholder="Points (e.g. 5)"
                    value={task.storyPoints ?? ''}
                    disabled={!canManage}
                    onChange={(e) => handleStoryPointsChange(e.target.value)}
                    className="h-7 text-xs bg-background"
                  />
                </div>
              </div>

              {/* Description */}
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-foreground">
                  Description
                </Label>
                <Textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  onBlur={handleDescriptionBlur}
                  disabled={!canManage}
                  placeholder="Add context, specifications, or acceptance criteria..."
                  rows={4}
                  className="resize-y text-xs leading-relaxed"
                />
              </div>

              {/* Tabs for Comments, Checklists, Attachments, Links */}
              <div className="space-y-4 pt-2">
                <div className="flex border-b border-border/80 gap-3 sm:gap-4 text-xs font-medium overflow-x-auto scrollbar-none pb-0.5">
                  <button
                    type="button"
                    onClick={() => setActiveTab('comments')}
                    className={cn(
                      'pb-2 transition-colors relative flex items-center gap-1.5 cursor-pointer shrink-0 whitespace-nowrap',
                      activeTab === 'comments'
                        ? 'text-primary font-semibold'
                        : 'text-muted-foreground hover:text-foreground',
                    )}
                  >
                    <MessageSquare className="size-3.5" />
                    Comments
                    {task._count?.comments !== undefined && task._count.comments > 0 && (
                      <span className="ml-0.5 rounded-full bg-primary/10 px-1.5 py-0.2 text-[10px] font-semibold text-primary">
                        {task._count.comments}
                      </span>
                    )}
                    {activeTab === 'comments' && (
                      <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full" />
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveTab('checklists')}
                    className={cn(
                      'pb-2 transition-colors relative flex items-center gap-1.5 cursor-pointer shrink-0 whitespace-nowrap',
                      activeTab === 'checklists'
                        ? 'text-primary font-semibold'
                        : 'text-muted-foreground hover:text-foreground',
                    )}
                  >
                    <CheckSquare className="size-3.5" />
                    Checklists
                    {activeTab === 'checklists' && (
                      <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full" />
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveTab('attachments')}
                    className={cn(
                      'pb-2 transition-colors relative flex items-center gap-1.5 cursor-pointer shrink-0 whitespace-nowrap',
                      activeTab === 'attachments'
                        ? 'text-primary font-semibold'
                        : 'text-muted-foreground hover:text-foreground',
                    )}
                  >
                    <Paperclip className="size-3.5" />
                    Attachments
                    {activeTab === 'attachments' && (
                      <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full" />
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveTab('links')}
                    className={cn(
                      'pb-2 transition-colors relative flex items-center gap-1.5 cursor-pointer shrink-0 whitespace-nowrap',
                      activeTab === 'links'
                        ? 'text-primary font-semibold'
                        : 'text-muted-foreground hover:text-foreground',
                    )}
                  >
                    <ExternalLink className="size-3.5" />
                    Links & Tools
                    {activeTab === 'links' && (
                      <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full" />
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveTab('activity')}
                    className={cn(
                      'pb-2 transition-colors relative flex items-center gap-1.5 cursor-pointer shrink-0 whitespace-nowrap',
                      activeTab === 'activity'
                        ? 'text-primary font-semibold'
                        : 'text-muted-foreground hover:text-foreground',
                    )}
                  >
                    <Activity className="size-3.5" />
                    Activity
                    {activeTab === 'activity' && (
                      <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full" />
                    )}
                  </button>
                </div>

                {/* Tab Contents */}
                <div>
                  {activeTab === 'comments' && (
                    <CommentThread taskId={task.id} workspaceId={workspaceId} />
                  )}
                  {activeTab === 'checklists' && (
                    <TaskChecklists taskId={task.id} canManage={canManage} />
                  )}
                  {activeTab === 'attachments' && (
                    <TaskAttachments taskId={task.id} canManage={canManage} />
                  )}
                  {activeTab === 'links' && (
                    <TaskLinks taskId={task.id} canManage={canManage} />
                  )}
                  {activeTab === 'activity' && (
                    <TaskActivityHistory taskId={task.id} />
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
