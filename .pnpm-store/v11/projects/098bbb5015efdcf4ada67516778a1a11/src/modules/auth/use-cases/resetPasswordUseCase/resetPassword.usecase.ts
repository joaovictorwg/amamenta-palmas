import { UserRepository } from "@/modules/users/repositories/user.repository";
import { AppError } from "@/shared/errors/AppError";
import { hashPassword } from "@/shared/utils/hash";
import { ResetPwdMailRepository } from "../../repositories/resetPwdMail.repository";

interface Request {
    token: string;
    newPassword: string;
    lang?: "pt" | "en";
}

export class ResetPasswordUseCase {
    constructor(
        private userRepository: UserRepository,
        private resetPwdMailRepository: ResetPwdMailRepository,
    ) { }

    async execute({ token, newPassword }: Request) {
        const resetPwdMail = await this.resetPwdMailRepository.findByToken(token);

        if (!resetPwdMail || resetPwdMail.used || new Date() > resetPwdMail.expiresAt) {
            throw new AppError("Token de redefinicao de senha invalido ou expirado", 400);
        }

        const user = await this.userRepository.findById(resetPwdMail.userId);
        if (!user || user.email !== resetPwdMail.email) {
            throw new AppError("Token de redefinicao de senha invalido ou expirado", 400);
        }

        const passwordHash = await hashPassword(newPassword);
        await this.userRepository.update(user.id, { passwordHash });
        await this.resetPwdMailRepository.markAsUsed(resetPwdMail.id);

        return { message: "Senha redefinida com sucesso" };
    }
}
