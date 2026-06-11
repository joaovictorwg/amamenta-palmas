import { env } from "@/shared/config/env";
import { AppError } from "@/shared/errors/AppError";
import { MailProvider, SendMailParams } from "./mail.provider";
import * as nodemailer from "nodemailer";

export class NodemailerProvider implements MailProvider {
    private transporter = nodemailer.createTransport({
        host: env.emailHost,
        port: env.emailPort,
        secure: env.emailSecure,
        auth:
            env.emailUser && env.emailPass
                ? {
                    user: env.emailUser,
                    pass: env.emailPass,
                }
                : undefined,
    });

    async send({ to, subject, html, text }: SendMailParams): Promise<void> {
        if (!env.emailFrom) {
            throw new AppError("Email sender is not configured", 500);
        }
        try {
            await this.transporter.sendMail({
                from: env.emailFrom,
                to,
                subject,
                html,
                text,
            });
        } catch (error) {
            console.error("Erro ao enviar e-mail pelo NodemailerProvider:", error);
            throw new AppError("Erro ao enviar e-mail: " + (error instanceof Error ? error.message : String(error)), 500);
        }
    }
}