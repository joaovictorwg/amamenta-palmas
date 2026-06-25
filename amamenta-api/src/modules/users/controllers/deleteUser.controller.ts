import { FastifyReply, FastifyRequest } from "fastify";

import { ForbiddenError } from "@/shared/errors/ForbiddenError";
import { NotFoundError } from "@/shared/errors/NotFoundError";
import { DrizzleUserRepository } from "../repositories/drizzleUser.repository";
import { BByIdUserInput } from "../schemas/updateUser.schema";

export async function deleteUserController(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const { id } = request.params as BByIdUserInput;
  const repository = new DrizzleUserRepository();
  const user = await repository.findById(id);

  if (!user) {
    throw new NotFoundError("Usuario");
  }

  if (request.user.role === "admin" && user.tenantId !== request.user.tenantId) {
    throw new ForbiddenError("You don't have permission to delete this user");
  }

  if (request.user.role === "admin" && user.role !== "employee") {
    throw new ForbiddenError("You don't have permission to delete this user");
  }

  if (request.user.role !== "super_admin" && request.user.role !== "admin") {
    throw new ForbiddenError("You don't have permission to delete this user");
  }

  await repository.delete(id);

  return reply.status(204).send();
}
