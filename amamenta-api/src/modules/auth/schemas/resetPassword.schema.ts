import { z } from "zod";
// todo: usar chave de tradução
export const resetPasswordSchema = z.object({
    token: z.string().min(1, "Token inválido"),
    newPassword: z.string().min(6, "Senha inválida"),
});

export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;