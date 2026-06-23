import { randomUUID } from "crypto";
import { UserRepository } from "@/modules/users/repositories/user.repository";
import { AppError } from "@/shared/errors/AppError";
import { MailProvider } from "@/shared/mail/mail.provider";

import { ResetPwdMailRepository } from "../../repositories/resetPwdMail.repository";
import { sendResetPasswordEmail } from "../../utils/sendPasswordEmail";

interface Request {
    email: string;
    lang?: "pt" | "en";
}

export class ForgotPasswordUseCase {
    constructor(
        private userRepository: UserRepository,
        private resetPwdMailRepository: ResetPwdMailRepository,
        private mailProvider: MailProvider
    ) { }

    async execute({ email }: Request) {
        const normalizedEmail = email.trim().toLowerCase();
        const user = await this.userRepository.findByEmail(normalizedEmail);

        if (user) {
            const token = randomUUID();
            const expiresAt = new Date();
            expiresAt.setMinutes(expiresAt.getMinutes() + 30);

            const resetPwdMail = await this.resetPwdMailRepository.create({
                userId: user.id,
                email: user.email,
                token,
                used: false,
                expiresAt,
            });

            try {
                await sendResetPasswordEmail({
                    mailProvider: this.mailProvider,
                    email: user.email,
                    token,
                });
            } catch (error) {
                await this.resetPwdMailRepository.delete(resetPwdMail.id);
                throw new AppError(
                    error instanceof Error ? error.message : "Failed to send reset password email",
                    500,
                );
            }
        }

        return {
            message: "success.email_sent",
        };
    }
}
