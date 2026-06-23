import { z } from "zod";

export const createAdminInviteSchema = z.object({
    email: z.string().email("Email inválido"),
    tenantId: z.string().uuid("tenantId inválido").optional(),
    tenantIdentifier: z.string().trim().min(2, "Informe o nome ou domínio do tenant").optional(),
}).refine(
    ({ tenantId, tenantIdentifier }) => Boolean(tenantId || tenantIdentifier),
    {
        message: "Informe tenantId ou tenantIdentifier",
        path: ["tenantIdentifier"],
    }
);

export const createEmployeeInviteSchema = z.object({
    email: z.string().email("Email inválido"),
});

export type CreateAdminInviteInput = z.infer<typeof createAdminInviteSchema>;
export type CreateEmployeeInviteInput = z.infer<typeof createEmployeeInviteSchema>;
