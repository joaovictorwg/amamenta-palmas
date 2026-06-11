import { UserRepository } from "@/modules/users/repositories/user.repository";
import { MailProvider } from "@/shared/mail/mail.provider";
import { AppError } from "@/shared/errors/AppError";

import { sendResetPasswordEmail } from "../../utils/sendPasswordEmail";

interface Request {
    email: string;
    lang?: "pt" | "en";
}

export class ForgotPasswordUseCase {
    constructor(
        private userRepository: UserRepository,
        private mailProvider: MailProvider
    ) { }

    async execute({ email, lang = "pt" }: Request) {
        const normalizedEmail = email.trim().toLowerCase();
        const user = await this.userRepository.findByEmail(normalizedEmail);

        if (user) {
            await sendResetPasswordEmail({
                mailProvider: this.mailProvider,
                userId: user.id,
                email: user.email,
            });
        }

        return {
            message: "success.email_sent",
        };
    }
}