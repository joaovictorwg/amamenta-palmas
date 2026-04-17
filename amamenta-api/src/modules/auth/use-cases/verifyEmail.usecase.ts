import { UserRepository } from "@/modules/users/repositories/user.repository";
import { AppError } from "@/shared/errors/AppError";
import { NotFoundError } from "@/shared/errors/NotFoundError";
import { verifyEmailVerificationToken } from "@/shared/utils/jwt";

interface Request {
    token: string;
}

export class VerifyEmailUseCase {
    constructor(private userRepository: UserRepository) { }

    async execute({ token }: Request) {
        let decoded: ReturnType<typeof verifyEmailVerificationToken>;

        try {
            decoded = verifyEmailVerificationToken(token);
        } catch {
            throw new AppError("Invalid or expired verification token", 401);
        }

        if (decoded.purpose !== "email_verification") {
            throw new AppError("Invalid verification token", 401);
        }

        const user = await this.userRepository.findById(decoded.sub);
        if (!user) throw new NotFoundError("User");

        if (user.email !== decoded.email) {
            throw new AppError("Invalid verification token", 401);
        }

        if (user.isVerified) {
            return {
                id: user.id,
                email: user.email,
                isVerified: user.isVerified,
            };
        }

        const updatedUser = await this.userRepository.update(user.id, {
            isVerified: true,
        });

        return {
            id: updatedUser.id,
            email: updatedUser.email,
            isVerified: updatedUser.isVerified,
        };
    }
}
