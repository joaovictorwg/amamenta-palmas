import { FastifyReply, FastifyRequest } from "fastify";
import { DrizzleUserRepository } from "@/modules/users/repositories/drizzleUser.repository";
import { UnauthorizedError } from "@/shared/errors/UnauthorizedError";

export async function getAuthenticatedUserController(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const userRepository = new DrizzleUserRepository();
  const user = await userRepository.findById(request.user.id);

  if (!user) {
    throw new UnauthorizedError("User not found");
  }

  return reply.send({
    user: {
      id: user.id,
      email: user.email,
      role: user.role,
      tenantId: user.tenantId,
    },
  });
}
