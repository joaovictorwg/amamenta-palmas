import { FastifyReply, FastifyRequest } from "fastify";
import { DrizzleUserRepository } from "../repositories/drizzleUser.repository";
import { GetUserByIdUseCase } from "../useCases/getUserById.usecase";
import { GetUserByIdInput } from "../schemas/getUserById.schema";

export async function getUserByIdController(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const { id } = request.params as GetUserByIdInput;

  const repository = new DrizzleUserRepository();
  const useCase = new GetUserByIdUseCase(repository);

  const user = await useCase.execute(id, request.user);

  return reply.send(user);
}
