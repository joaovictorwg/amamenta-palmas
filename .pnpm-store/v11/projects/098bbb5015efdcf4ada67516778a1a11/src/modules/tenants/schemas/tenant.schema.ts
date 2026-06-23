import { z } from "zod";

export const createTenantSchema = z.object({
    name: z.string().min(2, "Nome deve ter no mínimo 2 caracteres"),
    domain: z.string().min(3, "Domínio inválido"),
    autoJoinByDomain: z.boolean().optional().default(false),
});

export type CreateTenantInput = z.infer<typeof createTenantSchema>;