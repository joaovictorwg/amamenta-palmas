import { z } from "zod";

export const listUsersSchema = z.object({
  role: z.enum(["admin", "employee", "super_admin"]).optional(),
  tenantId: z.string().uuid().optional(),
});

export type ListUsersInput = z.infer<typeof listUsersSchema>;
