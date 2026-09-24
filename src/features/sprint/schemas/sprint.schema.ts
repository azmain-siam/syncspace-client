import { z } from 'zod';
import { SprintStatus } from '../types/sprint.types';

export const createSprintSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(1, 'Sprint name is required')
      .max(100, 'Sprint name cannot exceed 100 characters'),
    goal: z
      .string()
      .trim()
      .max(500, 'Sprint goal cannot exceed 500 characters')
      .optional()
      .nullable()
      .or(z.literal('')),
    startDate: z.string().optional().nullable().or(z.literal('')),
    endDate: z.string().optional().nullable().or(z.literal('')),
  })
  .refine(
    (data) => {
      if (data.startDate && data.endDate) {
        return new Date(data.startDate) <= new Date(data.endDate);
      }
      return true;
    },
    {
      message: 'Start date must be before or equal to end date',
      path: ['endDate'],
    },
  );

export type CreateSprintFormValues = z.infer<typeof createSprintSchema>;

export const updateSprintSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(1, 'Sprint name is required')
      .max(100, 'Sprint name cannot exceed 100 characters')
      .optional(),
    goal: z
      .string()
      .trim()
      .max(500, 'Sprint goal cannot exceed 500 characters')
      .optional()
      .nullable()
      .or(z.literal('')),
    startDate: z.string().optional().nullable().or(z.literal('')),
    endDate: z.string().optional().nullable().or(z.literal('')),
    status: z.nativeEnum(SprintStatus).optional(),
  })
  .refine(
    (data) => {
      if (data.startDate && data.endDate) {
        return new Date(data.startDate) <= new Date(data.endDate);
      }
      return true;
    },
    {
      message: 'Start date must be before or equal to end date',
      path: ['endDate'],
    },
  );

export type UpdateSprintFormValues = z.infer<typeof updateSprintSchema>;

export const completeSprintSchema = z.object({
  moveToSprintId: z
    .string()
    .uuid('Invalid sprint ID')
    .optional()
    .nullable()
    .or(z.literal('')),
});

export type CompleteSprintFormValues = z.infer<typeof completeSprintSchema>;

export const moveTaskToSprintSchema = z.object({
  sprintId: z.string().uuid('Invalid sprint ID').optional().nullable(),
  isBacklog: z.boolean().default(false),
});

export type MoveTaskToSprintFormValues = z.infer<typeof moveTaskToSprintSchema>;
