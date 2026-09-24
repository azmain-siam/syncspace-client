import { z } from 'zod';

export const createColumnSchema = z.object({
  title: z
    .string()
    .min(1, 'Column title is required')
    .max(50, 'Column title cannot exceed 50 characters'),
  order: z.number().int().min(0).optional(),
});

export type CreateColumnInput = z.infer<typeof createColumnSchema>;

export const updateColumnSchema = z.object({
  title: z
    .string()
    .min(1, 'Column title is required')
    .max(50, 'Column title cannot exceed 50 characters'),
});

export type UpdateColumnInput = z.infer<typeof updateColumnSchema>;

export const reorderColumnsSchema = z.object({
  columnOrders: z
    .array(
      z.object({
        id: z.string().min(1, 'Column ID is required'),
        order: z.number().int().min(0),
      }),
    )
    .min(1, 'At least one column order must be provided'),
});

export type ReorderColumnsInput = z.infer<typeof reorderColumnsSchema>;
