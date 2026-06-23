import { z } from "zod";

export const acceptInviteSchema = z.object({
    token: z.string().uuid("Token inválido"),
    password: z.string().min(6, "Senha deve ter no mínimo 6 caracteres"),
});

export type AcceptInviteInput = z.infer<typeof acceptInviteSchema>;
