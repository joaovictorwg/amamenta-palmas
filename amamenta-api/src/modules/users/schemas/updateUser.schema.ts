import { z } from "zod";

export const updateUserSchema = z.object({
  name: z.string().min(3).optional().nullable(),
  email: z.string().email().optional(),
  role: z.enum(["admin", "employee", "super_admin"]).optional(),
  tenantId: z.string().uuid().optional().nullable(),
});

export type UpdateUserInput = z.infer<typeof updateUserSchema>;
