import { z } from "zod";

export const listInvitesSchema = z.object({
  role: z.enum(["admin", "employee"]).optional(),
  tenantId: z.string().uuid().optional(),
  pending: z.coerce.boolean().optional(),
});

export const inviteIdParamsSchema = z.object({
  id: z.string().uuid(),
});

export type ListInvitesInput = z.infer<typeof listInvitesSchema>;
export type InviteIdParams = z.infer<typeof inviteIdParamsSchema>;
