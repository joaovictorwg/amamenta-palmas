import { FastifyReply, FastifyRequest } from "fastify";
import { DrizzleUserRepository } from "../repositories/drizzleUser.repository";
import { ListUsersUseCase } from "../useCases/listUsers.usecase";
import { ListUsersInput } from "../schemas/listUsers.schema";

export async function listUsersController(
  request: FastifyRequest,
  reply: FastifyReply
) {

  const repository = new DrizzleUserRepository();
  const useCase = new ListUsersUseCase(repository);

  const users = await useCase.execute(request.query as ListUsersInput, request.user);

  return reply.send(users);
}
