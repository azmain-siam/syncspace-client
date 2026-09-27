'use client';

import * as React from 'react';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Calendar,
  Check,
  FolderKanban,
  GitBranch,
  Globe,
  KeyRound,
  Lock,
  Palette,
  Sparkles,
  User,
} from 'lucide-react';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  ProjectHealth,
  ProjectPriority,
  ProjectStatus,
  ProjectVisibility,
} from '@/types/domain';
import { useWorkspaceMembers } from '@/features/workspace/hooks/use-workspace-members';
import type { CreateProjectInput } from '../schemas/create-project.schema';
import type { UpdateProjectInput } from '../schemas/update-project.schema';
import { useCreateProject } from '../hooks/use-create-project';
import { useUpdateProject } from '../hooks/use-update-project';
import {
  PROJECT_ICON_PRESETS,
  generateProjectKey,
  getProjectIconComponent,
} from '../lib/project-icons';

export interface ProjectFormTarget {
  id: string;
  title: string;
  key?: string | null;
  slug?: string | null;
  description?: string | null;
  brief?: string | null;
  icon?: string | null;
  color?: string | null;
  visibility?: ProjectVisibility;
  priority?: ProjectPriority;
  health?: ProjectHealth;
  status?: ProjectStatus;
  leadId?: string | null;
  startDate?: string | null;
  dueDate?: string | null;
  repoUrl?: string | null;
}

interface ProjectDialogModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  workspaceId: string;
  projectToEdit?: ProjectFormTarget | null;
}

const projectFormSchema = z.object({
  title: z
    .string()
    .min(2, 'Title must be at least 2 characters')
    .max(100, 'Title cannot exceed 100 characters'),
  key: z
    .string()
    .trim()
    .max(10, 'Key cannot exceed 10 characters')
    .regex(/^[A-Za-z0-9_-]*$/, 'Key should contain only letters, numbers, or dashes')
    .optional()
    .or(z.literal('')),
  description: z.string().max(1000, 'Description cannot exceed 1000 characters').optional().or(z.literal('')),
  brief: z.string().optional().or(z.literal('')),
  icon: z.string().optional().or(z.literal('')),
  color: z
    .string()
    .regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, 'Please enter a valid hex color')
    .optional()
    .or(z.literal('')),
  visibility: z.enum([ProjectVisibility.PUBLIC, ProjectVisibility.PRIVATE]).optional(),
  priority: z.enum([
    ProjectPriority.LOW,
    ProjectPriority.MEDIUM,
    ProjectPriority.HIGH,
    ProjectPriority.URGENT,
    ProjectPriority.CRITICAL,
  ]).optional(),
  health: z.enum([
    ProjectHealth.ON_TRACK,
    ProjectHealth.AT_RISK,
    ProjectHealth.OFF_TRACK,
  ]).optional(),
  status: z.enum([
    ProjectStatus.PLANNING,
    ProjectStatus.ACTIVE,
    ProjectStatus.ON_HOLD,
    ProjectStatus.COMPLETED,
    ProjectStatus.ARCHIVED,
  ]).optional(),
  leadId: z.string().optional().or(z.literal('')),
  startDate: z.string().optional().or(z.literal('')),
  dueDate: z.string().optional().or(z.literal('')),
  repoUrl: z
    .string()
    .url('Please enter a valid URL (e.g. https://github.com/...)')
    .optional()
    .or(z.literal('')),
});

export type ProjectFormData = z.infer<typeof projectFormSchema>;

const COLOR_PRESETS = [
  '#4648d4', // SyncSpace Indigo
  '#2563eb', // Royal Blue
  '#06b6d4', // Cyan Sky
  '#10b981', // Emerald Green
  '#14b8a6', // Teal
  '#f59e0b', // Amber
  '#f97316', // Orange
  '#ef4444', // Crimson Red
  '#8b5cf6', // Violet
  '#ec4899', // Pink
];

export function ProjectDialogModal({
  open,
  onOpenChange,
  workspaceId,
  projectToEdit,
}: ProjectDialogModalProps) {
  const isEditing = Boolean(projectToEdit);
  const [isKeyManuallyEdited, setIsKeyManuallyEdited] = useState(false);

  const { data: membersResponse } = useWorkspaceMembers(workspaceId);
  const members = membersResponse?.data || [];

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
      key: '',
      description: '',
      brief: '',
      icon: 'folder',
      color: '#4648d4',
      visibility: ProjectVisibility.PUBLIC,
      priority: ProjectPriority.MEDIUM,
      health: ProjectHealth.ON_TRACK,
      status: ProjectStatus.ACTIVE,
      leadId: '',
      startDate: '',
      dueDate: '',
      repoUrl: '',
    },
  });

  const selectedColor = watch('color') || '#4648d4';
  const selectedIcon = watch('icon') || 'folder';
  const selectedPriority = watch('priority') || ProjectPriority.MEDIUM;
  const selectedHealth = watch('health') || ProjectHealth.ON_TRACK;
  const selectedStatus = watch('status') || ProjectStatus.ACTIVE;
  const selectedVisibility = watch('visibility') || ProjectVisibility.PUBLIC;
  const selectedLeadId = watch('leadId') || '';

  const CurrentIcon = getProjectIconComponent(selectedIcon);

  useEffect(() => {
    if (open) {
      if (projectToEdit) {
        setIsKeyManuallyEdited(true);
        reset({
          title: projectToEdit.title,
          key: projectToEdit.key || '',
          description: projectToEdit.description || '',
          brief: projectToEdit.brief || '',
          icon: projectToEdit.icon || 'folder',
          color: projectToEdit.color || '#4648d4',
          visibility: projectToEdit.visibility || ProjectVisibility.PUBLIC,
          priority: projectToEdit.priority || ProjectPriority.MEDIUM,
          health: projectToEdit.health || ProjectHealth.ON_TRACK,
          status: projectToEdit.status || ProjectStatus.ACTIVE,
          leadId: projectToEdit.leadId || '',
          startDate: projectToEdit.startDate ? projectToEdit.startDate.split('T')[0] : '',
          dueDate: projectToEdit.dueDate ? projectToEdit.dueDate.split('T')[0] : '',
          repoUrl: projectToEdit.repoUrl || '',
        });
      } else {
        setIsKeyManuallyEdited(false);
        reset({
          title: '',
          key: '',
          description: '',
          brief: '',
          icon: 'folder',
          color: '#4648d4',
          visibility: ProjectVisibility.PUBLIC,
          priority: ProjectPriority.MEDIUM,
          health: ProjectHealth.ON_TRACK,
          status: ProjectStatus.ACTIVE,
          leadId: '',
          startDate: '',
          dueDate: '',
          repoUrl: '',
        });
      }
    }
  }, [open, projectToEdit, reset]);

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const nextTitle = e.target.value;
    setValue('title', nextTitle, { shouldValidate: true });
    if (!isEditing && !isKeyManuallyEdited) {
      const suggestedKey = generateProjectKey(nextTitle);
      setValue('key', suggestedKey, { shouldValidate: true });
    }
  };

  const onSubmit = (data: ProjectFormData) => {
    const payload = {
      ...data,
      key: data.key ? data.key.trim().toUpperCase() : undefined,
      startDate: data.startDate ? new Date(data.startDate).toISOString() : undefined,
      dueDate: data.dueDate ? new Date(data.dueDate).toISOString() : undefined,
      leadId: data.leadId || undefined,
      repoUrl: data.repoUrl || undefined,
      icon: data.icon || undefined,
      description: data.description || undefined,
      brief: data.brief || (projectToEdit?.brief ?? undefined),
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
      <DialogContent className="sm:max-w-[560px] rounded-2xl max-h-[90dvh] overflow-y-auto p-5 sm:p-6">
        <DialogHeader className="pb-3 border-b border-border/80">
          <div className="flex items-center gap-3">
            <div
              className="h-10 w-10 rounded-xl flex items-center justify-center shrink-0 border"
              style={{
                backgroundColor: `${selectedColor}15`,
                borderColor: `${selectedColor}30`,
                color: selectedColor,
              }}
            >
              <CurrentIcon className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle className="text-lg sm:text-xl font-extrabold tracking-tight text-foreground">
                {isEditing ? 'Edit Project Settings' : 'Create New Project'}
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                {isEditing
                  ? 'Update project ownership, deliverables, and health metrics.'
                  : 'Define initiative scope, key, lead, and enterprise workflow settings.'}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-3">
          {/* Title & Key Row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2 space-y-1.5">
              <Label htmlFor="project-title" className="text-xs font-semibold">
                Project Title *
              </Label>
              <Input
                id="project-title"
                placeholder="e.g. Identity & Access Service"
                className="h-10 rounded-lg text-sm"
                error={!!errors.title}
                aria-invalid={!!errors.title}
                {...register('title')}
                onChange={handleTitleChange}
              />
              {errors.title && (
                <p role="alert" className="text-[11px] text-destructive font-medium">
                  {errors.title.message}
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="project-key" className="text-xs font-semibold flex items-center gap-1">
                  <KeyRound className="h-3 w-3 text-muted-foreground" /> Key
                </Label>
                {!isEditing && (
                  <button
                    type="button"
                    onClick={() => {
                      const title = watch('title');
                      setValue('key', generateProjectKey(title), { shouldValidate: true });
                    }}
                    className="text-[10px] text-primary hover:underline font-mono inline-flex items-center gap-0.5"
                  >
                    <Sparkles className="h-2.5 w-2.5" /> Auto
                  </button>
                )}
              </div>
              <Input
                id="project-key"
                placeholder="AUTH"
                maxLength={10}
                className="h-10 rounded-lg font-mono uppercase text-sm font-semibold tracking-wider"
                error={!!errors.key}
                aria-invalid={!!errors.key}
                {...register('key')}
                onChange={(e) => {
                  setIsKeyManuallyEdited(true);
                  setValue('key', e.target.value.toUpperCase(), { shouldValidate: true });
                }}
              />
              {errors.key && (
                <p role="alert" className="text-[11px] text-destructive font-medium">
                  {errors.key.message}
                </p>
              )}
            </div>
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <Label htmlFor="project-desc" className="text-xs font-semibold">
              Description
            </Label>
            <Textarea
              id="project-desc"
              placeholder="Primary objectives, scope, or delivery mission..."
              className="rounded-lg min-h-[72px] resize-none text-xs sm:text-sm"
              error={!!errors.description}
              {...register('description')}
            />
            {errors.description && (
              <p role="alert" className="text-[11px] text-destructive font-medium">
                {errors.description.message}
              </p>
            )}
          </div>

          {/* Icon Preset Picker */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold flex items-center gap-1.5">
              <FolderKanban className="h-3.5 w-3.5 text-muted-foreground" /> Project Icon
            </Label>
            <div className="grid grid-cols-6 sm:grid-cols-12 gap-1.5 pt-0.5">
              {PROJECT_ICON_PRESETS.map((preset) => {
                const IconComponent = preset.icon;
                const isSelected = selectedIcon === preset.id;
                return (
                  <button
                    key={preset.id}
                    type="button"
                    title={preset.label}
                    onClick={() => setValue('icon', preset.id, { shouldValidate: true })}
                    className={`h-9 rounded-lg flex items-center justify-center border transition-all cursor-pointer ${
                      isSelected
                        ? 'border-primary bg-primary/10 text-primary shadow-xs'
                        : 'border-border/80 bg-background text-muted-foreground hover:bg-muted/40 hover:text-foreground'
                    }`}
                  >
                    <IconComponent className="h-4 w-4" />
                  </button>
                );
              })}
            </div>
          </div>

          {/* Color Swatch Selector */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold flex items-center gap-1.5">
              <Palette className="h-3.5 w-3.5 text-muted-foreground" /> Theme Accent Color
            </Label>
            <div className="flex items-center gap-2 pt-0.5 flex-wrap">
              {COLOR_PRESETS.map((color) => (
                <button
                  key={color}
                  type="button"
                  aria-label={`Select color ${color}`}
                  onClick={() => setValue('color', color, { shouldValidate: true })}
                  className="h-7 w-7 rounded-lg flex items-center justify-center border transition-transform hover:scale-105 cursor-pointer focus:outline-none focus:ring-2 focus:ring-ring shrink-0"
                  style={{ backgroundColor: color, borderColor: `${color}80` }}
                >
                  {selectedColor.toLowerCase() === color.toLowerCase() && (
                    <Check className="h-3.5 w-3.5 text-white drop-shadow-xs" />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Lead & Visibility Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Project Lead */}
            <div className="space-y-1.5">
              <Label htmlFor="project-lead" className="text-xs font-semibold flex items-center gap-1">
                <User className="h-3 w-3 text-muted-foreground" /> Project Lead
              </Label>
              <select
                id="project-lead"
                value={selectedLeadId}
                onChange={(e) => setValue('leadId', e.target.value, { shouldValidate: true })}
                className="w-full h-10 rounded-lg border border-input bg-background px-3 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-ring cursor-pointer"
              >
                <option value="">No dedicated lead</option>
                {members.map((member) => (
                  <option key={member.userId} value={member.userId}>
                    {member.user.name} ({member.user.email})
                  </option>
                ))}
              </select>
            </div>

            {/* Visibility */}
            <div className="space-y-1.5">
              <Label htmlFor="project-visibility" className="text-xs font-semibold flex items-center gap-1">
                {selectedVisibility === ProjectVisibility.PUBLIC ? (
                  <Globe className="h-3 w-3 text-muted-foreground" />
                ) : (
                  <Lock className="h-3 w-3 text-muted-foreground" />
                )}
                Visibility
              </Label>
              <select
                id="project-visibility"
                value={selectedVisibility}
                onChange={(e) =>
                  setValue('visibility', e.target.value as ProjectVisibility, { shouldValidate: true })
                }
                className="w-full h-10 rounded-lg border border-input bg-background px-3 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-ring cursor-pointer"
              >
                <option value={ProjectVisibility.PUBLIC}>Public (All workspace members)</option>
                <option value={ProjectVisibility.PRIVATE}>Private (Explicit members only)</option>
              </select>
            </div>
          </div>

          {/* Health & Priority & Status Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Health */}
            <div className="space-y-1.5">
              <Label htmlFor="project-health" className="text-xs font-semibold">
                Executive Health
              </Label>
              <select
                id="project-health"
                value={selectedHealth}
                onChange={(e) =>
                  setValue('health', e.target.value as ProjectHealth, { shouldValidate: true })
                }
                className="w-full h-10 rounded-lg border border-input bg-background px-3 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-ring cursor-pointer"
              >
                <option value={ProjectHealth.ON_TRACK}>🟢 On Track</option>
                <option value={ProjectHealth.AT_RISK}>🟡 At Risk</option>
                <option value={ProjectHealth.OFF_TRACK}>🔴 Off Track</option>
              </select>
            </div>

            {/* Priority */}
            <div className="space-y-1.5">
              <Label htmlFor="project-priority" className="text-xs font-semibold">
                Priority
              </Label>
              <select
                id="project-priority"
                value={selectedPriority}
                onChange={(e) =>
                  setValue('priority', e.target.value as ProjectPriority, { shouldValidate: true })
                }
                className="w-full h-10 rounded-lg border border-input bg-background px-3 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-ring cursor-pointer"
              >
                <option value={ProjectPriority.LOW}>Low</option>
                <option value={ProjectPriority.MEDIUM}>Medium</option>
                <option value={ProjectPriority.HIGH}>High</option>
                <option value={ProjectPriority.URGENT}>Urgent</option>
                <option value={ProjectPriority.CRITICAL}>Critical</option>
              </select>
            </div>

            {/* Status (If editing) */}
            <div className="space-y-1.5">
              <Label htmlFor="project-status" className="text-xs font-semibold">
                Status
              </Label>
              <select
                id="project-status"
                value={selectedStatus}
                onChange={(e) =>
                  setValue('status', e.target.value as ProjectStatus, { shouldValidate: true })
                }
                className="w-full h-10 rounded-lg border border-input bg-background px-3 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-ring cursor-pointer"
              >
                <option value={ProjectStatus.ACTIVE}>Active</option>
                <option value={ProjectStatus.PLANNING}>Planning</option>
                <option value={ProjectStatus.ON_HOLD}>On Hold</option>
                <option value={ProjectStatus.COMPLETED}>Completed</option>
                {isEditing && <option value={ProjectStatus.ARCHIVED}>Archived</option>}
              </select>
            </div>
          </div>

          {/* Timeline & Repository */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Start Date */}
            <div className="space-y-1.5">
              <Label htmlFor="project-start" className="text-xs font-semibold flex items-center gap-1">
                <Calendar className="h-3 w-3 text-muted-foreground" /> Start Date
              </Label>
              <Input
                id="project-start"
                type="date"
                className="h-10 rounded-lg text-xs"
                {...register('startDate')}
              />
            </div>

            {/* Target Due Date */}
            <div className="space-y-1.5">
              <Label htmlFor="project-due" className="text-xs font-semibold flex items-center gap-1">
                <Calendar className="h-3 w-3 text-muted-foreground" /> Due Date
              </Label>
              <Input
                id="project-due"
                type="date"
                className="h-10 rounded-lg text-xs"
                {...register('dueDate')}
              />
            </div>

            {/* Repository URL */}
            <div className="space-y-1.5">
              <Label htmlFor="project-repo" className="text-xs font-semibold flex items-center gap-1">
                <GitBranch className="h-3 w-3 text-muted-foreground" /> Repository URL
              </Label>
              <Input
                id="project-repo"
                placeholder="https://github.com/..."
                className="h-10 rounded-lg text-xs"
                error={!!errors.repoUrl}
                {...register('repoUrl')}
              />
            </div>
          </div>
          {errors.repoUrl && (
            <p role="alert" className="text-[11px] text-destructive font-medium">
              {errors.repoUrl.message}
            </p>
          )}

          {/* Actions */}
          <div className="pt-3 border-t border-border/80 flex flex-col-reverse sm:flex-row justify-end gap-2 sm:gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="h-10 rounded-lg w-full sm:w-auto"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="h-10 rounded-lg font-semibold shadow-xs w-full sm:w-auto"
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
