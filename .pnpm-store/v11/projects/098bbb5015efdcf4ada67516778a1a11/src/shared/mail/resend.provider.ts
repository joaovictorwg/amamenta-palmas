import { MailProvider, SendMailParams } from "./mail.provider";
import { Resend } from "resend";
import { AppError } from "@/shared/errors/AppError";
import { env } from "@/shared/config/env";

export class ResendProvider implements MailProvider {
    private resend: Resend;

    constructor() {
        if (!process.env.RESEND_API_KEY) {
            throw new AppError("RESEND_API_KEY is not set in environment", 500);
        }
        this.resend = new Resend(process.env.RESEND_API_KEY);
    }

    async send({ to, subject, html, text }: SendMailParams): Promise<void> {
        const from = env.emailFrom || "onboarding@resend.dev";
        try {
            await this.resend.emails.send({
                from,
                to,
                subject,
                html,
                text,
            });
        } catch (error: any) {
            throw new AppError(error.message || "Failed to send email via Resend", 500);
        }
    }
}
