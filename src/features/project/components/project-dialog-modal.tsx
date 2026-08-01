'use client';

import * as React from 'react';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Calendar, Check, FolderKanban, Palette } from 'lucide-react';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import type { Project } from '@/types/domain';
import { ProjectPriority, ProjectStatus } from '@/types/domain';
import type { CreateProjectInput } from '../schemas/create-project.schema';
import type { UpdateProjectInput } from '../schemas/update-project.schema';
import { useCreateProject } from '../hooks/use-create-project';
import { useUpdateProject } from '../hooks/use-update-project';

interface ProjectDialogModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  workspaceId: string;
  projectToEdit?: Project | null;
}

const projectFormSchema = z.object({
  title: z
    .string()
    .min(2, 'Title must be at least 2 characters')
    .max(100, 'Title cannot exceed 100 characters'),
  description: z.string().max(1000, 'Description cannot exceed 1000 characters').optional(),
  color: z
    .string()
    .regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, 'Please enter a valid hex color (e.g. #4648d4)')
    .optional()
    .or(z.literal('')),
  priority: z.enum([
    ProjectPriority.LOW,
    ProjectPriority.MEDIUM,
    ProjectPriority.HIGH,
    ProjectPriority.CRITICAL,
  ]).optional(),
  status: z.enum([
    ProjectStatus.PLANNING,
    ProjectStatus.ACTIVE,
    ProjectStatus.ON_HOLD,
    ProjectStatus.COMPLETED,
    ProjectStatus.ARCHIVED,
  ]).optional(),
  dueDate: z.string().optional().or(z.literal('')),
});

export type ProjectFormData = z.infer<typeof projectFormSchema>;

const COLOR_PRESETS = [
  '#4648d4', // Electric Indigo
  '#10b981', // Emerald Green
  '#f59e0b', // Amber Orange
  '#ef4444', // Crimson Red
  '#8b5cf6', // Violet Purple
  '#06b6d4', // Cyan Sky
];

export function ProjectDialogModal({
  open,
  onOpenChange,
  workspaceId,
  projectToEdit,
}: ProjectDialogModalProps) {
  const isEditing = Boolean(projectToEdit);

  const createMutation = useCreateProject(workspaceId, () => {
    onOpenChange(false);
  });

  const updateMutation = useUpdateProject(
    workspaceId,
    projectToEdit?.id || '',
    () => {
      onOpenChange(false);
    },
  );

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<ProjectFormData>({
    resolver: zodResolver(projectFormSchema),
    defaultValues: {
      title: '',
      description: '',
      color: '#4648d4',
      priority: ProjectPriority.MEDIUM,
      dueDate: '',
    },
  });

  const selectedColor = watch('color') || '#4648d4';
  const selectedPriority = watch('priority') || ProjectPriority.MEDIUM;
  const selectedStatus = watch('status') || ProjectStatus.ACTIVE;

  useEffect(() => {
    if (open) {
      if (projectToEdit) {
        reset({
          title: projectToEdit.title,
          description: projectToEdit.description || '',
          color: projectToEdit.color || '#4648d4',
          priority: projectToEdit.priority || ProjectPriority.MEDIUM,
          status: projectToEdit.status || ProjectStatus.ACTIVE,
          dueDate: projectToEdit.dueDate ? projectToEdit.dueDate.split('T')[0] : '',
        });
      } else {
        reset({
          title: '',
          description: '',
          color: '#4648d4',
          priority: ProjectPriority.MEDIUM,
          dueDate: '',
        });
      }
    }
  }, [open, projectToEdit, reset]);

  const onSubmit = (data: ProjectFormData) => {
    const payload = {
      ...data,
      dueDate: data.dueDate ? new Date(data.dueDate).toISOString() : undefined,
    };

    if (isEditing && projectToEdit) {
      updateMutation.mutate(payload as UpdateProjectInput);
    } else {
      createMutation.mutate(payload as CreateProjectInput);
    }
  };

  const isLoading = createMutation.isPending || updateMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] rounded-2xl p-6">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold flex items-center gap-2">
            <FolderKanban className="h-5 w-5 text-primary" />
            {isEditing ? 'Edit Project' : 'Create New Project'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-2">
          {/* Title */}
          <div className="space-y-1.5">
            <Label htmlFor="project-title">Project Title *</Label>
            <Input
              id="project-title"
              placeholder="e.g. Mobile App Redesign"
              className="h-11 rounded-lg"
              error={!!errors.title}
              {...register('title')}
            />
            {errors.title && (
              <p className="text-xs text-danger font-medium">{errors.title.message}</p>
            )}
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <Label htmlFor="project-desc">Description</Label>
            <Textarea
              id="project-desc"
              placeholder="Brief overview of project scope..."
              className="rounded-lg min-h-[80px] resize-none"
              {...register('description')}
            />
            {errors.description && (
              <p className="text-xs text-danger font-medium">
                {errors.description.message}
              </p>
            )}
          </div>

          {/* Color Swatch Selector */}
          <div className="space-y-1.5">
            <Label className="flex items-center gap-1.5">
              <Palette className="h-4 w-4 text-muted-foreground" /> Color Accent
            </Label>
            <div className="flex items-center gap-2 pt-1">
              {COLOR_PRESETS.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setValue('color', color, { shouldValidate: true })}
                  className="h-8 w-8 rounded-lg flex items-center justify-center border transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-ring"
                  style={{ backgroundColor: color }}
                >
                  {selectedColor.toLowerCase() === color.toLowerCase() && (
                    <Check className="h-4 w-4 text-white drop-shadow-xs" />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Priority & Status Grid */}
          <div className="grid grid-cols-2 gap-4">
            {/* Priority */}
            <div className="space-y-1.5">
              <Label>Priority</Label>
              <select
                value={selectedPriority}
                onChange={(e) =>
                  setValue('priority', e.target.value as ProjectPriority, {
                    shouldValidate: true,
                  })
                }
                className="w-full h-11 rounded-lg border border-input bg-background px-3 text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value={ProjectPriority.LOW}>Low</option>
                <option value={ProjectPriority.MEDIUM}>Medium</option>
                <option value={ProjectPriority.HIGH}>High</option>
                <option value={ProjectPriority.CRITICAL}>Critical</option>
              </select>
            </div>

            {/* Status (If editing) */}
            {isEditing && (
              <div className="space-y-1.5">
                <Label>Status</Label>
                <select
                  value={selectedStatus}
                  onChange={(e) =>
                    setValue('status', e.target.value as ProjectStatus, {
                      shouldValidate: true,
                    })
                  }
                  className="w-full h-11 rounded-lg border border-input bg-background px-3 text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  <option value={ProjectStatus.PLANNING}>Planning</option>
                  <option value={ProjectStatus.ACTIVE}>Active</option>
                  <option value={ProjectStatus.ON_HOLD}>On Hold</option>
                  <option value={ProjectStatus.COMPLETED}>Completed</option>
                </select>
              </div>
            )}

            {/* Target Due Date */}
            <div className="space-y-1.5">
              <Label htmlFor="project-due">Target Due Date</Label>
              <div className="relative">
                <Calendar className="absolute left-3 top-3.5 h-4 w-4 text-muted-foreground/60" />
                <Input
                  id="project-due"
                  type="date"
                  className="pl-9 h-11 rounded-lg"
                  {...register('dueDate')}
                />
              </div>
            </div>
          </div>

          <div className="pt-3 flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="h-11 rounded-lg"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="h-11 rounded-lg font-semibold shadow-xs"
              isLoading={isLoading}
            >
              {isEditing ? 'Save Changes' : 'Create Project'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
