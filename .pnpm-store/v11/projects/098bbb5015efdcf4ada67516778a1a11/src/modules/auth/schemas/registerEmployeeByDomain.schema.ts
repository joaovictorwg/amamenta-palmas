import { z } from "zod";

export const registerEmployeeByDomainSchema = z.object({
    email: z.email("Email invalido"),
    password: z.string().min(6, "Senha invalida"),
});

export type RegisterEmployeeByDomainInput = z.infer<
    typeof registerEmployeeByDomainSchema
>;
