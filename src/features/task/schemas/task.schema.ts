import { z } from 'zod';

export const taskPriorityEnum = z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']);
export const taskStatusEnum = z.enum(['TODO', 'IN_PROGRESS', 'REVIEW', 'DONE']);
export const linkTypeEnum = z.enum([
  'FIGMA',
  'GITHUB',
  'GOOGLE_DOC',
  'NOTION',
  'SWAGGER',
  'LOOM',
  'WEBSITE',
  'OTHER',
]);

export const createTaskSchema = z.object({
  title: z
    .string()
    .min(1, 'Task title is required')
    .max(200, 'Task title cannot exceed 200 characters'),
  description: z.string().max(2000, 'Description cannot exceed 2000 characters').optional().nullable(),
  priority: taskPriorityEnum,
  status: taskStatusEnum,
  assigneeId: z.string().uuid('Invalid user ID').optional().nullable().or(z.literal('')),
  dueDate: z.string().optional().nullable().or(z.literal('')),
  order: z.number().int().min(0).optional(),
  storyPoints: z
    .number()
    .int('Story points must be a whole number')
    .min(0, 'Story points must be at least 0')
    .max(100, 'Story points cannot exceed 100')
    .optional()
    .nullable(),
  estimatedHours: z
    .number()
    .min(0, 'Estimated hours must be at least 0')
    .optional()
    .nullable(),
  isBacklog: z.boolean().optional(),
  sprintId: z.string().uuid().optional().nullable().or(z.literal('')),
});

export type CreateTaskInput = z.infer<typeof createTaskSchema>;

export const updateTaskSchema = createTaskSchema.partial();

export type UpdateTaskInput = z.infer<typeof updateTaskSchema>;

export const moveTaskSchema = z.object({
  targetColumnId: z.string().min(1, 'Target column ID is required'),
  targetOrder: z.number().int().min(0, 'Target order must be 0 or greater'),
  status: taskStatusEnum.optional(),
});

export type MoveTaskInput = z.infer<typeof moveTaskSchema>;

export const createChecklistItemSchema = z.object({
  title: z
    .string()
    .min(1, 'Item title is required')
    .max(255, 'Item title cannot exceed 255 characters'),
  assigneeId: z.string().uuid().optional().nullable().or(z.literal('')),
  order: z.number().int().min(0).optional(),
});

export type CreateChecklistItemInput = z.infer<typeof createChecklistItemSchema>;

export const updateChecklistItemSchema = z.object({
  title: z.string().min(1).max(255).optional(),
  isCompleted: z.boolean().optional(),
  assigneeId: z.string().uuid().optional().nullable().or(z.literal('')),
  order: z.number().int().min(0).optional(),
});

export type UpdateChecklistItemInput = z.infer<typeof updateChecklistItemSchema>;

export const createTaskLinkSchema = z.object({
  title: z
    .string()
    .min(1, 'Link title is required')
    .max(100, 'Link title cannot exceed 100 characters'),
  url: z.string().url('Please provide a valid URL (including https://)'),
  type: linkTypeEnum,
});

export type CreateTaskLinkInput = z.infer<typeof createTaskLinkSchema>;

export const updateTaskLinkSchema = createTaskLinkSchema.partial();

export type UpdateTaskLinkInput = z.infer<typeof updateTaskLinkSchema>;

export const bulkUpdateTasksSchema = z.object({
  taskIds: z.array(z.string().min(1)).min(1, 'At least one task must be selected'),
  data: updateTaskSchema,
});

export type BulkUpdateTasksInput = z.infer<typeof bulkUpdateTasksSchema>;

export const bulkDeleteTasksSchema = z.object({
  taskIds: z.array(z.string().min(1)).min(1, 'At least one task must be selected'),
});

export type BulkDeleteTasksInput = z.infer<typeof bulkDeleteTasksSchema>;
