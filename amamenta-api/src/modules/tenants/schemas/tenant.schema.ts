import { z } from "zod";

export const createTenantSchema = z.object({
  name: z.string().min(2, "Nome deve ter no minimo 2 caracteres"),
  domain: z.string().min(3, "Dominio invalido"),
  autoJoinByDomain: z.boolean().optional().default(false),
});

export const tenantIdParamsSchema = z.object({
  id: z.string().uuid(),
});

export const updateTenantSchema = z.object({
  name: z.string().min(2).optional(),
  domain: z.string().min(3).optional(),
  autoJoinByDomain: z.boolean().optional(),
  isActive: z.boolean().optional(),
});

export type CreateTenantInput = z.infer<typeof createTenantSchema>;
export type TenantIdParams = z.infer<typeof tenantIdParamsSchema>;
export type UpdateTenantInput = z.infer<typeof updateTenantSchema>;
