import { UserRepository } from "@/modules/users/repositories/user.repository";
import { MailProvider } from "@/shared/mail/mail.provider";
import { assertCanResendVerification } from "../utils/resendVerificationRateLimiter";
import { sendVerificationEmail } from "../utils/sendVerificationEmail";

interface Request {
    email: string;
}

export class ResendVerificationEmailUseCase {
    constructor(
        private userRepository: UserRepository,
        private mailProvider: MailProvider
    ) { }

    async execute({ email }: Request) {
        const normalizedEmail = email.trim().toLowerCase();
        const successMessage = {
            message: "If the email is eligible, a verification email has been sent.",
        };

        assertCanResendVerification(normalizedEmail);

        const user = await this.userRepository.findByEmail(normalizedEmail);
        if (!user) {
            return successMessage;
        }

        if (user.isVerified) {
            return successMessage;
        }

        try {
            await sendVerificationEmail({
                mailProvider: this.mailProvider,
                userId: user.id,
                email: user.email,
            });
        } catch {
            return successMessage;
        }

        return successMessage;
    }
}
