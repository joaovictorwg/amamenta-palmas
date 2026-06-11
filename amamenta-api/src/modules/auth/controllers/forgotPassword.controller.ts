import { FastifyRequest, FastifyReply } from "fastify";
import { ForgotPasswordUseCase } from "../use-cases/forgotPassowrdUseCase/forgotPassword.usecase";
import { forgotPasswordSchema } from "../schemas/forgotPassword.schema";
import { DrizzleUserRepository } from "@/modules/users/repositories/drizzleUser.repository";
import { EmailService } from "@/shared/mail/email.service";

export async function forgotPasswordController(request: FastifyRequest, reply: FastifyReply) {
    const { email } = forgotPasswordSchema.parse(request.body);

    const userRepository = new DrizzleUserRepository();
    const mailProvider = new EmailService();
    const useCase = new ForgotPasswordUseCase(userRepository, mailProvider);

    const lang = request.headers['accept-language']?.toString().startsWith('en') ? 'en' : 'pt';

    const result = await useCase.execute({ email, lang });

    return reply.send(result);
}