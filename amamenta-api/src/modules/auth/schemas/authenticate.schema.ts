import { z } from "zod";

export const authenticateSchema = z.object({
    email: z.email("Email inválido"),
    password: z.string().min(6, "Senha inválida"),
});

export type LoginInput = z.infer<typeof authenticateSchema>;