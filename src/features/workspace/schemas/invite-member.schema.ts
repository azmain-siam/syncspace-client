import { z } from 'zod';
import { WorkspaceRole } from '@/types/domain';

export const inviteMemberSchema = z.object({
  email: z
    .string()
    .min(1, 'Email address is required')
    .email('Please enter a valid email address'),
  role: z.enum([WorkspaceRole.ADMIN, WorkspaceRole.MEMBER]),
});

export type InviteMemberInput = z.infer<typeof inviteMemberSchema>;
