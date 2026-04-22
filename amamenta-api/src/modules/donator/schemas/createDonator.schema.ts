import { z } from "zod";

export const createDonatorSchema = z.object({
  name: z.string().min(3),
  phone: z.string().min(8),
  address: z.string().min(5),
});

export type CreateDonatorInput = z.infer<typeof createDonatorSchema>;

export const registerSchema = z.object({
  name: z.string().min(3, "Nome deve ter no mínimo 3 caracteres"),

  telefone: z
    .string()
    .min(10, "Telefone inválido")
    .max(15, "Telefone inválido")
    .regex(/^\d+$/, "Telefone deve conter apenas números"),

  email: z.string().email("Email inválido"),

  senha: z.string().min(6, "Senha deve ter no mínimo 6 caracteres"),
});

// Tipo inferido (muito útil no TS)
export type RegisterInput = z.infer<typeof registerSchema>;
