import { z } from 'zod';

export const transferOwnershipSchema = z.object({
  memberId: z
    .string()
    .min(1, 'Please select a member to transfer workspace ownership to'),
});

export type TransferOwnershipInput = z.infer<typeof transferOwnershipSchema>;
