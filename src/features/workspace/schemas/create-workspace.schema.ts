import { z } from 'zod';

export const createWorkspaceSchema = z.object({
  name: z
    .string()
    .min(2, 'Workspace name must be at least 2 characters')
    .max(50, 'Workspace name cannot exceed 50 characters'),
  logo: z.string().optional(),
});

export type CreateWorkspaceInput = z.infer<typeof createWorkspaceSchema>;
