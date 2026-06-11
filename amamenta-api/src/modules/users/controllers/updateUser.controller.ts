import { FastifyReply, FastifyRequest } from "fastify";
import { DrizzleUserRepository } from "../repositories/drizzleUser.repository";
import { UpdateUserUseCase } from "../useCases/updateUser.usecase";
import { UpdateUserInput } from "../schemas/updateUser.schema";

export async function updateUserController(
  request: FastifyRequest<{ Params: { id: string }; Body: UpdateUserInput }>,
  reply: FastifyReply
) {
  const { id } = request.params;
  const data = request.body;

  const repository = new DrizzleUserRepository();
  const useCase = new UpdateUserUseCase(repository);

  const user = await useCase.execute(id, data, request.user);

  return reply.send(user);
}
