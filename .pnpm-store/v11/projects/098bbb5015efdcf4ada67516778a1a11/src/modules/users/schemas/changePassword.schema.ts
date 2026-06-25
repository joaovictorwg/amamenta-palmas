import { z } from "zod";

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(6),
});

export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
