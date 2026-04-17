import { DrizzleUserRepository } from "@/modules/users/repositories/drizzleUser.repository";
import { FastifyReply, FastifyRequest } from "fastify";
import { VerifyEmailInput } from "../schemas/verifyEmail.schema";
import { VerifyEmailUseCase } from "../use-cases/verifyEmail.usecase";

export async function verifyEmailController(
    request: FastifyRequest,
    reply: FastifyReply
) {
    const { token } = request.body as VerifyEmailInput;

    const userRepository = new DrizzleUserRepository();
    const useCase = new VerifyEmailUseCase(userRepository);

    const result = await useCase.execute({ token });

    return reply.send(result);
}
