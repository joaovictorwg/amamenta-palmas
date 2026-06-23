import { z } from "zod";

export const verifyEmailSchema = z.object({
    token: z.string().min(1, "Token invalido"),
});

export type VerifyEmailInput = z.infer<typeof verifyEmailSchema>;
