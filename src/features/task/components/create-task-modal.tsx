'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { CheckSquare, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useWorkspaceMembers } from '@/features/workspace/hooks/use-workspace-members';
import {
  createTaskSchema,
  type CreateTaskInput,
} from '../schemas/task.schema';
import { useCreateTask } from '../hooks/use-create-task';
import type { Task } from '../types/task.types';
import { mapColumnTitleToTaskStatus } from '../utils/task-status-mapper';

interface CreateTaskModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  workspaceId: string;
  projectId: string;
  boardId: string;
  columnId: string;
  columns?: { id: string; title: string }[];
  onTaskCreated?: (task: Task) => void;
}

export function CreateTaskModal({
  open,
  onOpenChange,
  workspaceId,
  projectId,
  boardId,
  columnId,
  columns = [],
  onTaskCreated,
}: CreateTaskModalProps) {
  const [prevColumnId, setPrevColumnId] = React.useState(columnId);
  const [selectedColumnId, setSelectedColumnId] = React.useState(columnId);

  if (columnId !== prevColumnId) {
    setPrevColumnId(columnId);
    setSelectedColumnId(columnId);
  }

  const { data: membersResponse } = useWorkspaceMembers(workspaceId);
  const members = membersResponse?.data || [];

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateTaskInput>({
    resolver: zodResolver(createTaskSchema),
    defaultValues: {
      title: '',
      description: '',
      priority: 'MEDIUM',
      status: 'TODO',
      assigneeId: null,
      dueDate: '',
      storyPoints: null,
      estimatedHours: null,
    },
  });

  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      reset({
        title: '',
        description: '',
        priority: 'MEDIUM',
        status: 'TODO',
        assigneeId: null,
        dueDate: '',
        storyPoints: null,
        estimatedHours: null,
      });
    }
    onOpenChange(isOpen);
  };

  const createTaskMutation = useCreateTask(
    workspaceId,
    projectId,
    boardId,
    (task) => {
      reset();
      handleOpenChange(false);
      onTaskCreated?.(task);
    },
  );

  const onSubmit = (data: CreateTaskInput) => {
    const effectiveColumnId = selectedColumnId || columnId;
    const selectedCol = columns.find((c) => c.id === effectiveColumnId);
    const derivedStatus = mapColumnTitleToTaskStatus(selectedCol?.title);

    const formattedData = {
      ...data,
      status: derivedStatus,
      dueDate: data.dueDate ? new Date(data.dueDate).toISOString() : null,
      assigneeId: data.assigneeId || null,
      storyPoints: data.storyPoints ? Number(data.storyPoints) : null,
      estimatedHours: data.estimatedHours ? Number(data.estimatedHours) : null,
    };

    createTaskMutation.mutate({
      columnId: effectiveColumnId,
      data: formattedData,
    });
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="w-[94vw] max-w-[540px] rounded-2xl p-4 sm:p-6 max-h-[88dvh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-2 text-primary mb-1">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <CheckSquare className="h-4 w-4" />
            </div>
            <DialogTitle className="text-base sm:text-lg font-bold text-foreground">
              Create New Task
            </DialogTitle>
          </div>
          <DialogDescription className="text-xs text-muted-foreground">
            Add a new card to your Kanban workflow.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-2">
          {/* Title */}
          <div className="space-y-1.5">
            <Label htmlFor="task-title" className="text-xs font-semibold text-foreground">
              Task Title <span className="text-destructive">*</span>
            </Label>
            <Input
              id="task-title"
              placeholder="e.g. Implement refresh token rotation"
              className="h-10 rounded-xl text-xs"
              {...register('title')}
              autoFocus
            />
            {errors.title && (
              <p className="text-[11px] font-medium text-destructive">
                {errors.title.message}
              </p>
            )}
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <Label htmlFor="task-desc" className="text-xs font-semibold text-foreground">
              Description (Optional)
            </Label>
            <Textarea
              id="task-desc"
              placeholder="Add details, acceptance criteria, or context..."
              rows={3}
              className="rounded-xl text-xs resize-none"
              {...register('description')}
            />
            {errors.description && (
              <p className="text-[11px] font-medium text-destructive">
                {errors.description.message}
              </p>
            )}
          </div>

          {/* Stage & Priority */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Column / Stage */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-foreground">
                Column / Stage
              </Label>
              <select
                value={selectedColumnId}
                onChange={(e) => setSelectedColumnId(e.target.value)}
                className="w-full h-10 px-3 rounded-xl border border-input bg-background text-xs font-medium focus:outline-hidden focus:ring-2 focus:ring-ring"
              >
                {columns.map((col) => (
                  <option key={col.id} value={col.id}>
                    {col.title}
                  </option>
                ))}
              </select>
            </div>

            {/* Priority */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-foreground">
                Priority
              </Label>
              <select
                {...register('priority')}
                className="w-full h-10 px-3 rounded-xl border border-input bg-background text-xs font-medium focus:outline-hidden focus:ring-2 focus:ring-ring"
              >
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
                <option value="URGENT">Urgent</option>
              </select>
            </div>
          </div>

          {/* Assignee & Due Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Assignee */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-foreground">
                Assignee
              </Label>
              <select
                {...register('assigneeId')}
                className="w-full h-10 px-3 rounded-xl border border-input bg-background text-xs font-medium focus:outline-hidden focus:ring-2 focus:ring-ring"
              >
                <option value="">Unassigned</option>
                {members.map((m) => (
                  <option key={m.userId} value={m.userId}>
                    {m.user?.name || m.user?.email || 'User'}
                  </option>
                ))}
              </select>
            </div>

            {/* Due Date */}
            <div className="space-y-1.5">
              <Label htmlFor="task-due-date" className="text-xs font-semibold text-foreground">
                Due Date
              </Label>
              <Input
                id="task-due-date"
                type="date"
                className="h-10 rounded-xl text-xs"
                {...register('dueDate')}
              />
            </div>
          </div>

          {/* Story Points & Estimated Hours */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="task-points" className="text-xs font-semibold text-foreground">
                Story Points
              </Label>
              <Input
                id="task-points"
                type="number"
                min={0}
                max={100}
                placeholder="e.g. 5"
                className="h-10 rounded-xl text-xs"
                {...register('storyPoints')}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="task-hours" className="text-xs font-semibold text-foreground">
                Est. Hours
              </Label>
              <Input
                id="task-hours"
                type="number"
                min={0}
                step={0.5}
                placeholder="e.g. 4.5"
                className="h-10 rounded-xl text-xs"
                {...register('estimatedHours')}
              />
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2.5 sm:gap-3 pt-3 border-t border-border/60">
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
              className="h-10 rounded-xl px-4 text-xs font-semibold"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="h-10 rounded-xl px-5 text-xs font-semibold gap-1.5 shadow-xs"
              isLoading={createTaskMutation.isPending}
            >
              <Plus className="h-4 w-4" />
              <span>Create Task</span>
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
