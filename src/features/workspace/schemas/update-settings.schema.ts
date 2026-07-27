import { z } from 'zod';

export const updateWorkspaceSettingsSchema = z.object({
  name: z
    .string()
    .min(2, 'Workspace name must be at least 2 characters')
    .max(50, 'Workspace name cannot exceed 50 characters')
    .optional(),
  logo: z.string().optional(),
});

export type UpdateWorkspaceSettingsInput = z.infer<
  typeof updateWorkspaceSettingsSchema
>;
