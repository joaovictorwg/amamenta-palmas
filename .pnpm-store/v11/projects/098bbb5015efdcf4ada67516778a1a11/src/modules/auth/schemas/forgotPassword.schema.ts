import { z } from "zod"
//todo usar chave de tradução
export const forgotPasswordSchema = z.object({
    email: z.email("Email inválido"),
})

export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;