import { randomUUID } from "crypto";
import { MailProvider } from "@/shared/mail/mail.provider";
import { sendInviteEmail } from "../utils/sendInviteEmail";
import { AppError } from "@/shared/errors/AppError";
import { InviteRepository } from "../repositories/invite.repository";

interface Request {
    email: string;
    role: "admin" | "employee";
    tenantId: string;
    tenantName: string;
}

export class CreateInviteUseCase {
    constructor(
        private inviteRepository: InviteRepository,
        private mailProvider: MailProvider
    ) { }

    async execute(data: Request) {
        const token = randomUUID();

        const expiresAt = new Date();
        expiresAt.setHours(expiresAt.getHours() + 24);

        const invite = await this.inviteRepository.create({
            email: data.email,
            role: data.role,
            tenantId: data.tenantId,
            token,
            used: false,
            expiresAt,
        });

        try {
            await sendInviteEmail({
                mailProvider: this.mailProvider,
                email: data.email,
                token,
                role: data.role,
                tenantName: data.tenantName,
            });
        } catch (error) {
            await this.inviteRepository.delete(invite.id);
            console.error("Failed to send invite email:", error);
            throw new AppError(
                error instanceof Error ? error.message : "Failed to send invite email",
                500
            );
        }

        return invite;
    }
}
