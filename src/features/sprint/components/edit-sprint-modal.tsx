'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Calendar, Edit3, Loader2, Save, Target } from 'lucide-react';
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
import { updateSprintSchema, type UpdateSprintFormValues } from '../schemas/sprint.schema';
import { useUpdateSprint } from '../hooks/use-sprint-mutations';
import type { Sprint } from '../types/sprint.types';

interface EditSprintModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId: string;
  sprint: Sprint | null;
}

// Utility to format ISO date string to YYYY-MM-DD for HTML input
function formatIsoToDateInput(isoString?: string | null): string {
  if (!isoString) return '';
  try {
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return '';
    return d.toISOString().split('T')[0];
  } catch {
    return '';
  }
}

export function EditSprintModal({
  open,
  onOpenChange,
  projectId,
  sprint,
}: EditSprintModalProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<UpdateSprintFormValues>({
    resolver: zodResolver(updateSprintSchema),
    defaultValues: {
      name: '',
      goal: '',
      startDate: '',
      endDate: '',
    },
  });

  React.useEffect(() => {
    if (sprint && open) {
      reset({
        name: sprint.name || '',
        goal: sprint.goal || '',
        startDate: formatIsoToDateInput(sprint.startDate),
        endDate: formatIsoToDateInput(sprint.endDate),
      });
    }
  }, [sprint, open, reset]);

  const updateSprintMutation = useUpdateSprint(projectId);

  const onSubmit = (values: UpdateSprintFormValues) => {
    if (!sprint) return;

    updateSprintMutation.mutate(
      {
        sprintId: sprint.id,
        data: {
          name: values.name?.trim(),
          goal: values.goal?.trim() || null,
          startDate: values.startDate ? new Date(values.startDate).toISOString() : null,
          endDate: values.endDate ? new Date(values.endDate).toISOString() : null,
        },
      },
      {
        onSuccess: () => {
          onOpenChange(false);
        },
      },
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[85dvh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Edit3 className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle>Edit Sprint Details</DialogTitle>
              <DialogDescription>
                Update sprint goals, schedule milestones, and metadata.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-2">
          {/* Sprint Name */}
          <div className="space-y-1.5">
            <Label htmlFor="edit-sprint-name" className="text-xs font-semibold">
              Sprint Name <span className="text-danger">*</span>
            </Label>
            <Input
              id="edit-sprint-name"
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
            <Label htmlFor="edit-sprint-goal" className="text-xs font-semibold flex items-center gap-1.5">
              <Target className="h-3.5 w-3.5 text-muted-foreground" />
              Sprint Goal <span className="text-muted-foreground font-normal">(Optional)</span>
            </Label>
            <Textarea
              id="edit-sprint-goal"
              placeholder="What is the high-level objective for this sprint?"
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
              <Label htmlFor="edit-sprint-start-date" className="text-xs font-semibold flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                Start Date
              </Label>
              <Input
                id="edit-sprint-start-date"
                type="date"
                {...register('startDate')}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="edit-sprint-end-date" className="text-xs font-semibold flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                End Date
              </Label>
              <Input
                id="edit-sprint-end-date"
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
              disabled={updateSprintMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={updateSprintMutation.isPending}
              className="gap-2"
            >
              {updateSprintMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Saving Changes...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  Save Changes
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
