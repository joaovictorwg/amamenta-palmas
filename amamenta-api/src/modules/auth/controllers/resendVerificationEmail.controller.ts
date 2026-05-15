import { DrizzleUserRepository } from "@/modules/users/repositories/drizzleUser.repository";
import { EmailService } from "@/shared/mail/email.service";
import { FastifyReply, FastifyRequest } from "fastify";
import { ResendVerificationEmailInput } from "../schemas/resendVerificationEmail.schema";
import { ResendVerificationEmailUseCase } from "../use-cases/resendVerificationEmail.usecase";

export async function resendVerificationEmailController(
    request: FastifyRequest,
    reply: FastifyReply
) {
    const { email } = request.body as ResendVerificationEmailInput;

    const userRepository = new DrizzleUserRepository();
    const mailProvider = new EmailService();

    const useCase = new ResendVerificationEmailUseCase(
        userRepository,
        mailProvider
    );

    const result = await useCase.execute({ email });

    return reply.send(result);
}
