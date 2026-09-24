import { z } from 'zod';

export const createBoardSchema = z.object({
  title: z
    .string()
    .min(2, 'Board title must be at least 2 characters')
    .max(100, 'Board title cannot exceed 100 characters'),
  includeDefaultColumns: z.boolean(),
});

export type CreateBoardInput = z.infer<typeof createBoardSchema>;

export const updateBoardSchema = z.object({
  title: z
    .string()
    .min(2, 'Board title must be at least 2 characters')
    .max(100, 'Board title cannot exceed 100 characters'),
});

export type UpdateBoardInput = z.infer<typeof updateBoardSchema>;
