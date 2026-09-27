import { z } from 'zod';
import { WorkspaceVisibility } from '@/types/domain';

export const updateWorkspaceSettingsSchema = z.object({
  name: z
    .string()
    .min(2, 'Workspace name must be at least 2 characters')
    .max(50, 'Workspace name cannot exceed 50 characters')
    .optional(),
  description: z
    .string()
    .max(255, 'Description cannot exceed 255 characters')
    .optional(),
  logo: z.string().optional(),
  visibility: z
    .enum([WorkspaceVisibility.PUBLIC, WorkspaceVisibility.PRIVATE])
    .optional(),
});

export type UpdateWorkspaceSettingsInput = z.infer<
  typeof updateWorkspaceSettingsSchema
>;
