import { DrizzleUserRepository } from "@/modules/users/repositories/drizzleUser.repository";
import { FastifyRequest, FastifyReply } from "fastify";
import { LoginInput } from "../schemas/authenticate.schema";
import { AuthenticateUserUseCase } from "../use-cases/login.usecase";

export async function authenticateController(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const { email, password } = request.body as LoginInput;

  const userRepository = new DrizzleUserRepository();
  const useCase = new AuthenticateUserUseCase(userRepository);

  const result = await useCase.execute({ email, password });

  return reply.send(result);
}