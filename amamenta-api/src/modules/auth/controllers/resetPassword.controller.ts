import { FastifyRequest, FastifyReply } from "fastify";
import { resetPasswordSchema } from "../schemas/resetPassword.schema";
import { ResetPasswordUseCase } from "../use-cases/resetPasswordUseCase/resetPassword.usecase";
import { DrizzleUserRepository } from "@/modules/users/repositories/drizzleUser.repository";

export async function resetPasswordController(request: FastifyRequest, reply: FastifyReply) {
    const { token, newPassword } = resetPasswordSchema.parse(request.body);

    const userRepository = new DrizzleUserRepository();
    const useCase = new ResetPasswordUseCase(userRepository);

    const lang = request.headers['accept-language']?.toString().startsWith('en') ? 'en' : 'pt';

    const result = await useCase.execute({ token, newPassword, lang });

    return reply.send(result);
}