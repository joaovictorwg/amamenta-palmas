import { FastifyReply, FastifyRequest } from "fastify";
import { DrizzleUserRepository } from "../repositories/drizzleUser.repository";
import { UpdateUserUseCase } from "../useCases/updateUser.usecase";
import { BByIdUserInput, UpdateUserInput } from "../schemas/updateUser.schema";

export async function updateUserController(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const { id } = request.params as BByIdUserInput;
  const data = request.body as UpdateUserInput;

  const repository = new DrizzleUserRepository();
  const useCase = new UpdateUserUseCase(repository);

  const user = await useCase.execute(id, data, request.user);

  return reply.send(user);
}
