import { z } from "zod";

export const resendVerificationEmailSchema = z.object({
    email: z.email("Email invalido"),
});

export type ResendVerificationEmailInput = z.infer<
    typeof resendVerificationEmailSchema
>;
