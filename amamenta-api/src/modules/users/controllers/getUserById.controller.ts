import { FastifyReply, FastifyRequest } from "fastify";
import { DrizzleUserRepository } from "../repositories/drizzleUser.repository";
import { GetUserByIdUseCase } from "../useCases/getUserById.usecase";

export async function getUserByIdController(
  request: FastifyRequest<{ Params: { id: string } }>,
  reply: FastifyReply
) {
  const { id } = request.params;

  const repository = new DrizzleUserRepository();
  const useCase = new GetUserByIdUseCase(repository);

  const user = await useCase.execute(id, request.user);

  return reply.send(user);
}
