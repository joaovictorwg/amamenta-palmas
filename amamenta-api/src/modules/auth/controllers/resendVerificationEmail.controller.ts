import { DrizzleUserRepository } from "@/modules/users/repositories/drizzleUser.repository";
import { NodemailerProvider } from "@/shared/mail/nodemailer.provider";
import { FastifyReply, FastifyRequest } from "fastify";
import { ResendVerificationEmailInput } from "../schemas/resendVerificationEmail.schema";
import { ResendVerificationEmailUseCase } from "../use-cases/resendVerificationEmail.usecase";

export async function resendVerificationEmailController(
    request: FastifyRequest,
    reply: FastifyReply
) {
    const { email } = request.body as ResendVerificationEmailInput;

    const userRepository = new DrizzleUserRepository();
    const mailProvider = new NodemailerProvider();

    const useCase = new ResendVerificationEmailUseCase(
        userRepository,
        mailProvider
    );

    const result = await useCase.execute({ email });

    return reply.send(result);
}
