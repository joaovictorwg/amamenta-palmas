import { UserRepository } from "@/modules/users/repositories/user.repository";
import { AppError } from "@/shared/errors/AppError";
import { verifyResetPasswordToken } from "@/shared/utils/jwt";
import { hashPassword } from "@/shared/utils/hash";

interface Request {
    token: string;
    newPassword: string;
    lang?: "pt" | "en";
}

export class ResetPasswordUseCase {
    constructor(private userRepository: UserRepository) { }

    async execute({ token, newPassword, lang = "pt" }: Request) {
        let decoded;
        try {
            decoded = verifyResetPasswordToken(token);
        } catch {
            throw new AppError("Token de redefinicao de senha invalido ou expirado", 400);
        }

        if (decoded.purpose !== "reset_password") {
            throw new AppError("Token de redefinicao de senha invalido ou expirado", 400);
        }

        const user = await this.userRepository.findById(decoded.sub);
        if (!user || user.email !== decoded.email) {
            throw new AppError("Token de redefinicao de senha invalido ou expirado", 400);
        }

        const passwordHash = await hashPassword(newPassword);
        await this.userRepository.update(user.id, { passwordHash });

        return { message: "Senha redefinida com sucesso" };
    }
}
