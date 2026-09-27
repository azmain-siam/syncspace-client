import { z } from 'zod';

export const createCommentSchema = z.object({
  content: z
    .string()
    .trim()
    .min(1, 'Comment cannot be empty')
    .max(3000, 'Comment cannot exceed 3000 characters'),
});

export type CreateCommentInput = z.infer<typeof createCommentSchema>;

export const updateCommentSchema = z.object({
  content: z
    .string()
    .trim()
    .min(1, 'Comment cannot be empty')
    .max(3000, 'Comment cannot exceed 3000 characters'),
});

export type UpdateCommentInput = z.infer<typeof updateCommentSchema>;

export const toggleReactionSchema = z.object({
  emoji: z
    .string()
    .min(1, 'Emoji is required')
    .max(10, 'Invalid emoji format'),
});

export type ToggleReactionInput = z.infer<typeof toggleReactionSchema>;
