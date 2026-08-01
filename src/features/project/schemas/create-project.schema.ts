import { z } from 'zod';
import { ProjectPriority } from '@/types/domain';

export const createProjectSchema = z.object({
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
  dueDate: z.string().optional().or(z.literal('')),
});

export type CreateProjectInput = z.infer<typeof createProjectSchema>;
