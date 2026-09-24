'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Calendar, Flag, Loader2, Sparkles, Target } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { createSprintSchema, type CreateSprintFormValues } from '../schemas/sprint.schema';
import { useCreateSprint } from '../hooks/use-sprint-mutations';

interface CreateSprintModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId: string;
  defaultSprintNumber?: number;
}

export function CreateSprintModal({
  open,
  onOpenChange,
  projectId,
  defaultSprintNumber,
}: CreateSprintModalProps) {
  const defaultName = defaultSprintNumber ? `Sprint ${defaultSprintNumber}` : '';

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateSprintFormValues>({
    resolver: zodResolver(createSprintSchema),
    defaultValues: {
      name: defaultName,
      goal: '',
      startDate: '',
      endDate: '',
    },
  });

  // Reset form when modal opens with updated default name if provided
  React.useEffect(() => {
    if (open) {
      reset({
        name: defaultName,
        goal: '',
        startDate: '',
        endDate: '',
      });
    }
  }, [open, defaultName, reset]);

  const createSprintMutation = useCreateSprint(projectId);

  const onSubmit = (values: CreateSprintFormValues) => {
    createSprintMutation.mutate(
      {
        name: values.name.trim(),
        goal: values.goal?.trim() || null,
        startDate: values.startDate ? new Date(values.startDate).toISOString() : null,
        endDate: values.endDate ? new Date(values.endDate).toISOString() : null,
      },
      {
        onSuccess: () => {
          reset();
          onOpenChange(false);
        },
      },
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Flag className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle>Create New Sprint</DialogTitle>
              <DialogDescription>
                Plan your team&apos;s upcoming iteration with goals and target dates.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-2">
          {/* Sprint Name */}
          <div className="space-y-1.5">
            <Label htmlFor="sprint-name" className="text-xs font-semibold">
              Sprint Name <span className="text-danger">*</span>
            </Label>
            <Input
              id="sprint-name"
              placeholder="e.g. Sprint 14 - Performance & Auth"
              error={!!errors.name}
              {...register('name')}
            />
            {errors.name && (
              <p className="text-xs text-danger font-medium mt-1">
                {errors.name.message}
              </p>
            )}
          </div>

          {/* Sprint Goal */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label htmlFor="sprint-goal" className="text-xs font-semibold flex items-center gap-1.5">
                <Target className="h-3.5 w-3.5 text-muted-foreground" />
                Sprint Goal <span className="text-muted-foreground font-normal">(Optional)</span>
              </Label>
            </div>
            <Textarea
              id="sprint-goal"
              placeholder="What is the high-level objective or key milestone for this sprint?"
              rows={3}
              error={!!errors.goal}
              {...register('goal')}
            />
            {errors.goal && (
              <p className="text-xs text-danger font-medium mt-1">
                {errors.goal.message}
              </p>
            )}
          </div>

          {/* Date Range */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="sprint-start-date" className="text-xs font-semibold flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                Start Date
              </Label>
              <Input
                id="sprint-start-date"
                type="date"
                {...register('startDate')}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="sprint-end-date" className="text-xs font-semibold flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                End Date
              </Label>
              <Input
                id="sprint-end-date"
                type="date"
                error={!!errors.endDate}
                {...register('endDate')}
              />
            </div>
          </div>
          {errors.endDate && (
            <p className="text-xs text-danger font-medium">
              {errors.endDate.message}
            </p>
          )}

          <DialogFooter className="gap-2 pt-2 sm:pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={createSprintMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={createSprintMutation.isPending}
              className="gap-2"
            >
              {createSprintMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Creating Sprint...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  Create Sprint
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
