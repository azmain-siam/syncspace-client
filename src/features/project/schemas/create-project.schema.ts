import { z } from 'zod';
import { ProjectHealth, ProjectPriority, ProjectVisibility } from '@/types/domain';

export const createProjectSchema = z.object({
  title: z
    .string()
    .min(2, 'Title must be at least 2 characters')
    .max(100, 'Title cannot exceed 100 characters'),
  key: z
    .string()
    .trim()
    .max(10, 'Key cannot exceed 10 characters')
    .regex(/^[A-Za-z0-9_-]*$/, 'Key should contain only letters, numbers, hyphens, or underscores')
    .optional()
    .or(z.literal('')),
  description: z.string().max(1000, 'Description cannot exceed 1000 characters').optional().or(z.literal('')),
  brief: z.string().optional().or(z.literal('')),
  icon: z.string().optional().or(z.literal('')),
  color: z
    .string()
    .regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, 'Please enter a valid hex color (e.g. #4648d4)')
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
  leadId: z.string().optional().or(z.literal('')),
  startDate: z.string().optional().or(z.literal('')),
  dueDate: z.string().optional().or(z.literal('')),
  repoUrl: z
    .string()
    .url('Please enter a valid URL (e.g. https://github.com/...)')
    .optional()
    .or(z.literal('')),
});

export type CreateProjectInput = z.infer<typeof createProjectSchema>;

